//@ts-nocheck

import { useState, useEffect } from 'react';

import { useFileManagerContext } from '../context';
import { DeFile, DeDirectory, DeFileManager } from '@/services/filesystem';

import FolderIcon from '@heroicons/react/solid/FolderIcon';
import DocumentTextIcon from '@heroicons/react/outline/DocumentTextIcon';

import prettyBytes from 'pretty-bytes';

// import * as ContextMenu from '@radix-ui/react-context-menu';

const FileManagerView = () => {

  const { fm, directory: currentDirectory, changeDirectory } = useFileManagerContext();

  // file manager references
  const [listing, setListing] = useState<Array<DeDirectory | DeFile>>([]);
  const [sortBy, setSortBy] = useState();

  useEffect(() => {
    if (!currentDirectory) return;
    setListing([]);
    (async () => {
      const entries = await currentDirectory.entries();
      let listing = [];
      for await (let item of entries) {
        listing.push(item);
      }
      setListing(listing);
    })();
  }, [currentDirectory]);

  const handleRowClick = (directory: DeDirectory) => {
    changeDirectory(directory);
  }

  return (
    <div className="p-2">
      <table className="table w-full select-none">
        <thead className="bg-white">
          <tr>
            <th className="border-b border-slate-800 bg-inherit normal-case font-medium text-base"></th>
            <th className="border-b border-slate-800 bg-inherit normal-case font-medium text-base">Name</th>
            <th className="border-b border-slate-800 bg-inherit normal-case font-medium text-base">Timestamp</th>
            <th className="border-b border-slate-800 bg-inherit normal-case font-medium text-base">Size</th>
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
                <td className="border-slate-800 bg-transparent">{prettyBytes(item.size || 0)}</td>
                <td className="border-slate-800 bg-transparent"></td>
              </tr>
            )) : <></>
          }
        </tbody>
      </table>
    </div >
  );
}

export default FileManagerView;