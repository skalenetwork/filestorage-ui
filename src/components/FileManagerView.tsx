import { useState, useContext, useEffect, useMemo } from 'react';
import { useAsync } from 'react-use';

import { useFileManagerContext } from '../store';

import { DeFile, DeDirectory, DeFileManager } from '@/services/filesystem';

const FileManagerView = () => {

  const { fm, currentDirectory } = useFileManagerContext();

  // file manager references
  const [listing, setListing] = useState<Array<DeDirectory | DeFile>>([]);

  useAsync(async () => {
    if (!currentDirectory) return;
    const listing = await currentDirectory.entries();
    setListing(Array.from(listing))
  }, [currentDirectory]);

  return (
    <div className="p-2">
      <table>
        <tr>
          <th>Name</th>
          <th>Timestamp</th>
          <th>Size</th>
          <th></th>
        </tr>
        {
          listing.forEach(value => {
            return (
              <tr>
                <td>{value.name}</td>
                <td>{value.kind}</td>
                <td></td>
              </tr>
            )
          })
        }
      </table>
    </div>
  );
}

export default FileManagerView;