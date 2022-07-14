//@ts-nocheck

import { useState, useEffect, useRef, createRef, SyntheticEvent } from 'react';

import { useFileManagerContext, ContextType } from '../context';
import { DeFile, DeDirectory, DeFileManager } from '@/services/filesystem';

import FolderIcon from '@heroicons/react/solid/FolderIcon';
import DocumentTextIcon from '@heroicons/react/outline/DocumentTextIcon';
import DocumentRemoveIcon from '@heroicons/react/solid/DocumentRemoveIcon';
import DocumentDownloadIcon from '@heroicons/react/solid/DocumentDownloadIcon';
import DotsVerticalIcon from '@heroicons/react/solid/DotsVerticalIcon';

import prettyBytes from 'pretty-bytes';

// import * as ContextMenu from '@radix-ui/react-context-menu';

const FileManagerView = () => {

  const {
    fm, directory: currentDirectory, listing,
    changeDirectory, deleteFile, deleteDirectory
  } = useFileManagerContext<ContextType>();

  const handleRowClick = (directory: DeDirectory) => {
    changeDirectory(directory);
  }

  const tableElement = useRef<HTMLTableElement>();

  return (
    <div className="p-2">
      <table className="table w-full select-none" ref={tableElement}>
        <thead className="bg-white">
          <tr>
            <th className="border-b border-slate-800 bg-inherit normal-case font-medium text-base"></th>
            <th className="border-b border-slate-800 bg-inherit normal-case font-medium text-base">Name</th>
            <th className="border-b border-slate-800 bg-inherit normal-case font-medium text-base">Timestamp</th>
            <th className="border-b border-slate-800 bg-inherit normal-case font-medium text-base">File Size</th>
            <th className="border-b border-slate-800 bg-inherit normal-case font-medium text-base"></th>
          </tr>
        </thead>
        <tbody>
          {
            currentDirectory.parent ? <tr
              className="focus:bg-slate-50"
              onClick={
                (e) => {
                  e.detail === 2 && handleRowClick(currentDirectory.parent) && e.stopPropagation();
                }
              }
              contextMenu="row-actions">
              <td><FolderIcon className="h-5 w-5 text-blue-500" /></td>
              <td>..</td>
              <td></td>
              <td></td>
              <td></td>
            </tr> : <></>
          }
          {
            listing.length ? listing.map(item => (
              <tr key={item.path} className="focus:bg-slate-100 hover:bg-slate-50" onClick={
                (e) => {
                  item.kind === "directory" && e.detail === 2 && handleRowClick(item) && e.stopPropagation();
                }
              }>
                <td className="border-slate-800 bg-transparent">{
                  item.kind === "directory"
                    ? <FolderIcon className="h-5 w-5 text-blue-500" />
                    : <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                }
                </td>
                <td className="border-slate-800 bg-transparent">{item.name}</td>
                <td className="border-slate-800 bg-transparent"></td>
                <td className="border-slate-800 bg-transparent">{(item.kind === "file") ? prettyBytes(item.size || 0) : "--"}</td>
                <td className="border-slate-800 bg-transparent">
                  <div className="dropdown dropdown-left">
                    <label tabIndex="0" class="cursor-pointer"><DotsVerticalIcon className="h-5 w-5" /></label>
                    <ul tabIndex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li onClick={(e) => fm?.downloadFile(item) && tableElement.current?.querySelector(":focus").blur()}>
                        <a><DocumentDownloadIcon className="h-5 w-5 text-blue-500" /> Download</a>
                      </li>
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
                          : null
                      }
                    </ul>
                  </div>
                </td>
              </tr>
            )) : <></>
          }
        </tbody>
      </table>
    </div >
  );
}

export default FileManagerView;