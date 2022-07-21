//@ts-nocheck

import { useState, useEffect, useRef, createRef, SyntheticEvent, Fragment } from 'react';
import { useAsyncFn, useMount, useDebounce } from 'react-use';

import { useFileManagerContext, ContextType } from '../context';
import { DeFile, DeDirectory, DeFileManager } from '@/services/filesystem';

import FolderIcon from '@heroicons/react/solid/FolderIcon';
import DocumentTextIcon from '@heroicons/react/outline/DocumentTextIcon';
import DocumentRemoveIcon from '@heroicons/react/solid/DocumentRemoveIcon';
import DocumentDownloadIcon from '@heroicons/react/solid/DocumentDownloadIcon';
import DotsVerticalIcon from '@heroicons/react/solid/DotsVerticalIcon';
import ArrowSmUpIcon from '@heroicons/react/solid/ArrowSmUpIcon';
import ArrowSmDownIcon from '@heroicons/react/solid/ArrowSmDownIcon';
import ChevronRightIcon from '@heroicons/react/solid/ChevronRightIcon';
import ChevronLeftIcon from '@heroicons/react/solid/ChevronLeftIcon';

import Pagination from 'react-paginate';

import prettyBytes from 'pretty-bytes';
import orderBy from 'lodash/orderBy';

import FormattedName from './FormattedName';

const FileManagerView = (props) => {

  const {
    fm, directory: currentDirectory, listing, searchListing,
    changeDirectory, deleteFile, deleteDirectory,
    updateAddress, getFileLink
  } = useFileManagerContext<ContextType>();

  const tableElement = useRef<HTMLTableElement>();

  const handleRowClick = (directory: DeDirectory) => {
    changeDirectory(directory);
  }

  const makeItemTrail = (directory: DeDirectory) => {
    let trail = [];
    let item = directory;
    while (item.parent) {
      trail.push(item);
      item = item.parent;
    }
    return trail.reverse();
  }

  const [trail, setTrail] = useState<any[]>([]);
  const [sortByKey, setSortByKey] = useState<string>("");
  const [sortByOrder, setSortByOrder] = useState<string>("");
  const [sortedListing, setSortedListing] = useState<Array<DeFile | DeDirectory>>([]);
  const [itemOffset, setItemOffset] = useState(0);
  const [selectedFile, setSelectedFile] = useState<DeFile>(null);
  const [addressInput, setAddressInput] = useState<string>("");
  const addressField = useRef();

  useDebounce(() => {
    console.log("debounce:addressInput", addressInput);
    updateAddress(addressInput);
  }, 500, [addressInput]);

  useMount(() => {
    setSortByKey("size");
    setSortByOrder("asc");
  });

  useEffect(() => {
    addressField.current.value = fm.rootDir.name;
  }, [fm?.rootDir?.name]);

  useEffect(() => {
    setTrail(makeItemTrail(currentDirectory));
  }, [currentDirectory?.path]);

  useEffect(() => {
    if (!(listing && sortByKey && sortByOrder)) return;
    const newListing = orderBy(listing, [(o => o.isFile === true), sortByKey], ['asc', sortByOrder]);
    setSortedListing(newListing);
  }, [listing, sortByKey, sortByOrder]);

  const renderFormattedName = (item: DeFile | DeDirectory) => (
    <span className="gap-x-2 flex flex-row items-center">
      {
        item.kind === "directory"
          ? <FolderIcon className="h-5 w-5 text-blue-500" />
          : <DocumentTextIcon className="h-5 w-5 text-blue-500" />
      }
      {item.name}
    </span>
  );

  const renderFormattedSize = (item: DeFile | DeDirectory) => (
    (item.kind === "file") ? prettyBytes(item.size || 0) : "--"
  );

  const renderSortElement = (key) => (
    <span>
      {(key !== sortByKey) ? "·" : ((sortByOrder === "asc") ?
        <ArrowSmUpIcon className="h-5 w-5 inline-block" /> :
        <ArrowSmDownIcon className="h-5 w-5 inline-block" />
      )}
    </span>
  );

  const ColumnLabel = (props) => (
    <p className="p-0 cursor-pointer" onClick={
      (e) => {
        setSortByKey(props.columnKey);
        setSortByOrder((sortByOrder === "asc") ? "desc" : "asc");
      }}>
      {props.children} {props.columnKey ? renderSortElement(props.columnKey) : null}
    </p>
  );

  const BackItem = () => (
    currentDirectory.parent ?
      <tr
        className="focus:bg-slate-100 hover:bg-slate-50"
        onClick={(e) => { handleRowClick(currentDirectory.parent) && e.stopPropagation(); }}
      >
        <td className="border-slate-800 bg-transparent">
          <FormattedName data={{ kind: "directory", name: ".." }} />
        </td>
        <td className="border-slate-800 bg-transparent"></td>
        <td className="border-slate-800 bg-transparent"></td>
        <td className="border-slate-800 bg-transparent"></td>
      </tr> : <></>
  );

  const ItemActions = ({ item }) => (
    <div className="dropdown dropdown-left" onClick={(e) => e.stopPropagation()}>
      <label tabIndex="0" className="cursor-pointer">
        <DotsVerticalIcon className="h-5 w-5" />
      </label>
      <ul tabIndex="0" className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
        {
          (item.kind === "file") ?
            <li
              onClick={(e) => fm?.downloadFile(item) && tableElement.current?.querySelector(":focus").blur()}
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
                  deleteFile(item)
                } else {
                  deleteDirectory(item);
                }
                tableElement.current?.querySelector(":focus").blur();
              }}
            >
              <a><DocumentRemoveIcon className="h-5 w-5 text-red-500" /> Delete</a>
            </li>
            : <></>
        }
      </ul>
    </div>
  );

  const Item = ({ item, skeleton }) => (skeleton) ?
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
          item.kind === "directory" ? handleRowClick(item) : setSelectedFile(item);
          e.stopPropagation();
        }
      }>
        <td className="border-slate-800 bg-transparent"><FormattedName data={item} /></td>
        <td className="border-slate-800 bg-transparent"></td>
        <td className="border-slate-800 bg-transparent">{renderFormattedSize(item)}</td>
        <td className="border-slate-800 bg-transparent"><ItemActions item={item} /></td>
      </tr>
    );

  // const Pagination = (props) => {
  //   const btnClass = "";
  //   const pageNumbers = [];
  //   for (let i = 1; i <= Math.ceil(props.totalCount / props.perPageCount); i++) {
  //     pageNumbers.push(i);
  //   }
  //   return (
  //     <div className="flex justify-center items-center gap-2">
  //       <span>Shown files {props.perPageCount}/{props.totalCount}</span>
  //       <span className={btnClass}>
  //         <ChevronLeftIcon className="h-5 w-5" />
  //       </span>
  //       {
  //         pageNumbers.map(page => (

  //         ));
  //       }
  //       <span className={btnClass}>{ }</span>
  //       <span className={btnClass}>
  //         <ChevronRightIcon className="h-5 w-5" />
  //       </span>
  //     </div>
  //   );
  // }

  const AddressSelect = () => (
    <input
      type="text"
      ref={addressField}
      value={fm?.rootDirectory().name}
      onChange={(e) => {
        let { value } = e.target;
        // value = value.toLowerCase();
        // if (value.slice(0, 2) === "0x") {
        //   value = value.slice(2);
        // }
        setAddressInput(value);
      }}
    />
  );

  return (
    <div>
      <div className="flex flex-row justify-between items-center border-y border-slate-800 py-4 sticky top-0 bg-white z-[998]">
        <div className="flex flex-row gap-2">
          <AddressSelect /> /
          <div className="breadcrumbs m-0 p-0">
            <ul>
              {
                trail.map(item => (
                  <li className="decoration-blue-500 text-blue-500 underline" key={item.path}>
                    <a onClick={() => changeDirectory(item)}>
                      <FormattedName data={item} />
                    </a>
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
        <div>
          <Pagination
            className="flex justify-center items-center gap-2"
            pageLinkClassName="flex items-center justify-center p-2 w-8 h-8 text-center border border-gray-300 rounded text-sm"
            activeLinkClassName="flex items-center justify-center p-2 w-8 h-8 text-center border border-gray-500 rounded text-sm"
            nextLinkClassName="flex items-center justify-center p-2 w-8 h-8 text-center border text-gray-400 border-gray-300 rounded text-sm"
            previousLinkClassName="flex items-center justify-center p-2 w-8 h-8 text-center font-medium border text-gray-400 border-gray-300 rounded text-sm"
            disabledClassName="flex items-center justify-center p-2 w-8 h-8 text-center font-medium border text-gray-200 border-gray-300 rounded text-sm bg-gray-300 cursor-pointer"
            breakLabel="..."
            nextLabel={
              <ChevronRightIcon className="h-7 w-7" />}
            previousLabel={
              <ChevronLeftIcon className="h-7 w-7" />
            }
            pageRangeDisplayed={4}
            renderOnZeroPageCount={null}
            pageCount={sortedListing.length / 10}
            onPageChange={(e) => {
              const newOffset = (e.selected * 10) % sortedListing.length;
              setItemOffset(newOffset);
            }}
          />
        </div>
      </div>
      <table className="table w-full select-none relative" ref={tableElement}>
        <thead>
          <tr>
            <th className="w-[30%] border-b border-slate-800 bg-inherit normal-case font-medium text-base">
              <ColumnLabel columnKey="name">Name</ColumnLabel>
            </th>
            <th className="w-[30%] border-b border-slate-800 bg-inherit normal-case font-medium text-base">
              <ColumnLabel columnKey="timestamp">Timestamp</ColumnLabel>
            </th>
            <th className="w-[30%] border-b border-slate-800 bg-inherit normal-case font-medium text-base">
              <ColumnLabel columnKey="size">File size</ColumnLabel>
            </th>
            <th className="border-b border-slate-800 bg-inherit normal-case font-medium text-base"></th>
          </tr>
        </thead>
        <tbody>
          <BackItem />
          {
            sortedListing.length ?
              sortedListing
                .slice(itemOffset, itemOffset + 10)
                .map((item) => <Item item={item} key={item.path} />)
              : [...Array(10).keys()].map(item => <Item skeleton />)
          }
        </tbody>
      </table>
    </div >
  );
}

export default FileManagerView;