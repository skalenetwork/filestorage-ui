//@ts-ignore

import { useState, useContext, useEffect, useMemo } from 'react';
import { useAsync } from 'react-use';

import { useFileManagerContext } from '../store';

import { DeFile, DeDirectory, DeFileManager } from '@/services/filesystem';

const bytesToKilo = (value: number) => {
  return (value / 1024).toFixed(3);
}

const FileManagerView = () => {

  const { fm, currentDirectory, setCurrentDirectory } = useFileManagerContext();

  // file manager references
  const [listing, setListing] = useState<Array<DeDirectory | DeFile>>([]);

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
  }, [
    currentDirectory,
    fm?.uploads[currentDirectory.path]?.length // bugged: length remains zero in there, prototype gotchas "('.')
  ]);

  const handleRowClick = (directory: DeDirectory) => {
    setCurrentDirectory(directory);
  }

  return (
    <div className="p-2">
      <table className="table w-full">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Timestamp</th>
            <th>Size</th>
            <th>{listing.length}</th>
          </tr>
        </thead>
        <tbody>
          {
            currentDirectory.parent ? <tr className="cursor-pointer" onClick={
              (e) => {
                e.stopPropagation();
                e.detail === 2 && handleRowClick(currentDirectory.parent);
              }
            }>
              <td>🗀</td>
              <td>..</td>
              <td></td>
              <td></td>
              <td></td>
            </tr> : <></>
          }
          {
            listing.length ? listing.map(item => (
              <tr className="cursor-pointer" onClick={
                (e) => {
                  e.stopPropagation();
                  item.kind === "directory" && e.detail === 2 && handleRowClick(item);
                }
              }>
                <td>{item.kind === "directory" ? "🗀" : "🗏"}</td>
                <td>{item.name}</td>
                <td></td>
                <td>{bytesToKilo(item.size || 0)} KB</td>
                <td></td>
              </tr>
            )) : <></>
          }
        </tbody>
      </table>
    </div>
  );
}

export default FileManagerView;