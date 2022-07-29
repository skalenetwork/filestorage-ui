//@ts-nocheck

import { useState, useEffect, useRef, SyntheticEvent, useLayoutEffect } from 'react';
import { useMount, useDebounce } from 'react-use';

import { useFileManagerContext, ContextType } from '../context';
import { DeFile, DeDirectory } from '@/services/filesystem';
import { downloadUrl } from '../utils';

import orderBy from 'lodash/orderBy';
import sortBy from 'lodash/sortBy';

import DocumentRemoveIcon from '@heroicons/react/solid/DocumentRemoveIcon';
import DocumentDownloadIcon from '@heroicons/react/solid/DocumentDownloadIcon';
import DotsVerticalIcon from '@heroicons/react/solid/DotsVerticalIcon';
import ArrowSmUpIcon from '@heroicons/react/solid/ArrowSmUpIcon';
import ArrowSmDownIcon from '@heroicons/react/solid/ArrowSmDownIcon';
import ChevronRightIcon from '@heroicons/react/solid/ChevronRightIcon';
import ChevronLeftIcon from '@heroicons/react/solid/ChevronLeftIcon';

import Pagination from 'react-paginate';
import FormattedName from './FormattedName';
import FormattedSize from './FormattedSize';
import SmartAddress from './SmartAddress';

const makeDirTrail = (directory: DeDirectory) => {
  let trail = [];
  let item = directory;
  while (item.parent) {
    trail.push(item);
    item = item.parent;
  }
  return trail.reverse();
}

const DirCrumb = (
  { trail, preLimit, postLimit, onCrumbClick }:
    { trail: DeDirectory[], preLimit?: number, postLimit?: number, onCrumbClick: Function }) => {
  return (
    <div className="breadcrumbs m-0 p-0">
      <ul>
        {
          trail.map(item => (
            <li
              className="decoration-blue-500 text-blue-500 underline cursor-pointer"
              key={item.path}
            >
              <a onClick={(e) => onCrumbClick(item)}>
                <FormattedName item={item} />
              </a>
            </li>
          ))
        }
      </ul>
    </div>
  );
}

const FileManagerView = ({ onSelectFile }: { onSelectFile: (file: DeFile) => void }) => {

  const {
    config,
    fm, directory: currentDirectory, listing, searchListing, isLoadingDirectory,
    changeDirectory, deleteFile, deleteDirectory, updateAddress, getFileLink
  }: ContextType = useFileManagerContext<ContextType>();

  const tableElement = useRef<HTMLTableElement>();

  const handleRowClick = (directory: DeDirectory) => {
    changeDirectory(directory);
  }

  // table
  const [trail, setTrail] = useState<any[]>([]);
  const [sortByKey, setSortByKey] = useState<string>("");
  const [sortByOrder, setSortByOrder] = useState<string>("");
  const [sortedListing, setSortedListing] = useState<Array<DeFile | DeDirectory>>([]);

  // table:pagination
  const [itemOffset, setItemOffset] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageListing, setPageListing] = useState<Array<DeFile | DeDirectory>>([]);

  // uploads
  const [addressInput, setAddressInput] = useState<string>("");

  // address switching
  const [isAddressEditing, setIsAddressEditing] = useState<boolean>(false);

  useDebounce(() => {
    console.log("debounce:addressInput", addressInput);
    updateAddress(addressInput);
  }, 500, [addressInput]);

  useMount(() => {
    setSortByKey("size");
    setSortByOrder("desc");
  });

  useEffect(() => {
    setTrail(makeDirTrail(currentDirectory));
  }, [currentDirectory?.path]);

  useLayoutEffect(() => {
    const endOffset = itemOffset + config.navigator.pageLimit;
    setPageListing(sortedListing.slice(itemOffset, endOffset));
  }, [itemOffset, sortedListing])

  useLayoutEffect(() => {
    if (!(listing && sortByKey && sortByOrder)) return;
    let newListing = orderBy(
      listing,
      [(o => o.kind === "file"), sortByKey],
      ['asc', sortByOrder]
    );
    setSortedListing(newListing);
  }, [listing, sortByKey, sortByOrder]);



  const sortElement = (key: string) => (
    <span>
      {(key !== sortByKey) ? "·" : ((sortByOrder === "asc") ?
        <ArrowSmUpIcon className="h-5 w-5 inline-block" /> :
        <ArrowSmDownIcon className="h-5 w-5 inline-block" />
      )}
    </span>
  );

  const ColumnLabel = ({ columnKey, children }: { columnKey: string; children: any }) => (
    <p className="p-0 cursor-pointer" onClick={
      (e) => {
        setSortByKey(columnKey);
        setSortByOrder((sortByOrder === "asc") ? "desc" : "asc");
      }}>
      {children} {columnKey ? sortElement(columnKey) : null}
    </p>
  );

  const BackItem = () => (
    currentDirectory?.parent ?
      <tr
        className="focus:bg-slate-100 hover:bg-slate-50"
        onClick={(e) => {
          handleRowClick(currentDirectory.parent as DeDirectory);
          e.stopPropagation();
        }}
      >
        <td className="border-slate-800 bg-transparent">
          <FormattedName item={{ kind: "directory", name: ".." } as DeDirectory} />
        </td>
        <td className="border-slate-800 bg-transparent"></td>
        <td className="border-slate-800 bg-transparent"></td>
        <td className="border-slate-800 bg-transparent"></td>
      </tr> : <></>
  );

  const ItemActions = ({ item }: { item: DeFile | DeDirectory }) => (
    <div className="dropdown dropdown-left h-full flex items-center" onClick={(e) => e.stopPropagation()}>
      <label tabIndex={0} className="cursor-pointer">
        <DotsVerticalIcon className="h-6 w-6" />
      </label>
      <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
        {
          (item.kind === "file") ?
            <li
              onClick={(e) => {
                fm?.downloadFile(item as DeFile);
                (tableElement.current?.querySelector(":focus") as HTMLElement).blur();
              }}
            >
              <a><DocumentDownloadIcon className="h-5 w-5 text-blue-500" /> Download</a>
            </li>
            : <></>
        }
        {
          (item.kind === "file" ? deleteFile : deleteDirectory) ?
            <li
              onClick={(e: SyntheticEvent) => {
                if (item.kind === "file") {
                  deleteFile(item as DeFile)
                } else {
                  deleteDirectory(item as DeDirectory);
                }
                (tableElement.current?.querySelector(":focus") as HTMLElement).blur();
              }}
            >
              <a><DocumentRemoveIcon className="h-5 w-5 text-red-500" /> Delete</a>
            </li>
            : <></>
        }
      </ul>
    </div >
  );

  const Item = ({ item, skeleton }: { item: DeFile | DeDirectory, skeleton: boolean }) => (skeleton) ?
    <tr className="animate-pulse">
      <td><p className="w-16 h-2 rounded bg-gray-200"></p></td>
      <td></td>
      <td><p className="w-5 h-2 rounded bg-gray-200"></p></td>
      <td><DotsVerticalIcon className="h-5 w-5 text-gray-200" /></td>
    </tr>
    :
    (
      <tr className="focus:bg-slate-100 hover:bg-slate-50" onClick={
        (e) => {
          item.kind === "directory"
            ? handleRowClick(item as DeDirectory)
            : onSelectFile(item as DeFile);
          e.stopPropagation();
        }
      }>
        <td className="border-slate-800 bg-transparent"><FormattedName item={item} /></td>
        <td className="border-slate-800 bg-transparent"></td>
        <td className="border-slate-800 bg-transparent"><FormattedSize item={item} /></td>
        <td className="border-slate-800 bg-transparent"><ItemActions item={item} /></td>
      </tr>
    );

  return (
    <div>
      <div className="flex flex-row justify-between items-center border-y border-slate-800 py-4 sticky top-0 bg-white z-[998]">
        <div className="h-8 flex flex-row items-center gap-2 px-4">
          <SmartAddress
            className="cursor-pointer"
            address={fm?.rootDirectory().name || ""}
            onEdit={() => setIsAddressEditing(true)}
            offEdit={() => setIsAddressEditing(false)}
            onConfirm={updateAddress}
          />
          {
            (isAddressEditing === false) ?
              <DirCrumb trail={
                (trail.length > 5) ? [trail[0]].concat(trail.slice(trail.length - 3)) : trail
              } onCrumbClick={changeDirectory} />
              :
              <></>
          }
        </div>
        <div className="flex justify-center items-center gap-8">
          <span className="text-gray-500 text-sm font-medium">
            Showing files {itemOffset + pageListing.length}/{sortedListing.length}
          </span>
          <Pagination
            className="flex justify-center items-center gap-2"
            pageLinkClassName="flex items-center justify-center p-2 w-8 h-8 text-center border border-gray-300 rounded text-sm font-medium"
            activeLinkClassName="flex items-center justify-center p-2 w-8 h-8 text-center border border-gray-500 rounded text-sm font-medium"
            nextLinkClassName="flex items-center justify-center p-2 w-8 h-8 text-center border text-gray-400 border-gray-300 rounded text-sm"
            previousLinkClassName="flex items-center justify-center p-2 w-8 h-8 text-center font-medium border text-gray-400 border-gray-300 rounded text-sm"
            disabledClassName="flex items-center justify-center p-2 w-8 h-8 text-center font-medium border text-gray-200 border-gray-300 rounded text-sm bg-gray-300 cursor-pointer"
            breakLabel="..."
            nextLabel={
              <ChevronRightIcon className="h-8 w-8" />}
            previousLabel={
              <ChevronLeftIcon className="h-8 w-8" />
            }
            pageRangeDisplayed={4}
            renderOnZeroPageCount={null}
            pageCount={Math.ceil(sortedListing.length / config.navigator.pageLimit)}
            onPageChange={(e) => {
              setCurrentPage(e.selected);
              const newOffset = (e.selected * config.navigator.pageLimit) % sortedListing.length;
              setItemOffset(newOffset);
            }}
          />
        </div>
      </div>
      <table className="table w-full select-none relative" ref={tableElement}>
        <thead>
          <tr>
            <th className="w-[40%] border-b border-slate-800 bg-inherit normal-case font-medium text-base">
              <ColumnLabel columnKey="name">Name</ColumnLabel>
            </th>
            <th className="w-[35%] border-b border-slate-800 bg-inherit normal-case font-medium text-base">
              {/* <ColumnLabel columnKey="timestamp">Timestamp</ColumnLabel> */}
            </th>
            <th className="w-[20%] border-b border-slate-800 bg-inherit normal-case font-medium text-base">
              <ColumnLabel columnKey="size">File size</ColumnLabel>
            </th>
            <th className="border-b border-slate-800 bg-inherit normal-case font-medium text-base"></th>
          </tr>
        </thead>
        <tbody>
          <BackItem />
          {
            isLoadingDirectory ?
              [...Array(10).keys()].map(item => <Item skeleton />)
              :
              (pageListing.length)
                ?
                pageListing.map((item) => <Item item={item} key={item.path} />)
                :
                <></>
          }
        </tbody>
      </table>
    </div >
  );
}

export default FileManagerView;