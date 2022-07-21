// @ts-nocheck

import prettyBytes from 'pretty-bytes';
import { useState, useRef, SyntheticEvent, useEffect } from 'react';
import { useDebounce } from 'react-use';

import { useFileManagerContext } from '@/context/index';

import FolderAddIcon from '@heroicons/react/solid/FolderAddIcon';
import DocumentAddIcon from '@heroicons/react/solid/DocumentAddIcon';
import UploadIcon from '@heroicons/react/outline/UploadIcon';
import { Button, Modal, Progress, Input } from '@/components/common';
import SearchIcon from '@heroicons/react/solid/SearchIcon';
import DotsCircleHorizontalIcon from '@heroicons/react/outline/DotsCircleHorizontalIcon';

import FileNavigator from '@/components/FileNavigator';
import FormattedName from '@/components/FormattedName';

const App = () => {

  // modals

  const [reserveSpaceModal, setReserveSpaceModal] = useState(false);
  const [activeUploadsModal, setActiveUploadsModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [directoryModal, setDirectoryModal] = useState(false);

  // field refs
  const reserveAddrField = useRef<HTMLInputElement>();
  const reserveSpaceField = useRef<HTMLInputElement>();
  const uploadFileField = useRef<HTMLInputElement>();
  const newDirectoryField = useRef<HTMLInputElement>();

  const {
    fm, directory: currentDirectory, reservedSpace, occupiedSpace, searchListing,
    isAuthorized, connectWallet, activeUploads,
    changeDirectory, uploadFiles, createDirectory, search, isSearching, isCreatingDirectory
  } = useFileManagerContext();

  const [filesToUpload, setFilesToUpload] = useState<Array<File>>([]);
  const [uploadingFiles, setUploadingFiles] = useState<any[]>([]);
  const searchField = useRef<HTMLInputElement>();
  const [searchTerm, setSearchTerm] = useState<string>("");

  useDebounce(() => {
    console.log("debounce:search", searchTerm);
    search(searchTerm);
  }, 500, [searchTerm]);

  useEffect(() => {
    setUploadingFiles(Array.from(activeUploads.values()).flat());
  }, [activeUploads]);

  const shortAddress = (address: string) => {
    return address.substring(0, 6) + "...." + address.substring(address.length - 4);
  }

  const SpinnerIcon = ({ className }) => (
    <svg class={`animate-spin ${className}`} viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" fill="transparent" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )

  const handleCreateDirectory = async (event: SyntheticEvent) => {
    event.preventDefault();
    const name = newDirectoryField.current?.value;
    console.log("handleCreateDirectory", currentDirectory, name);
    if (!(currentDirectory && name)) return;
    setDirectoryModal(false);
    newDirectoryField.current.value = "";
    await createDirectory(name);
  }

  const handleConfirmUpload = async (event: SyntheticEvent) => {
    console.log("file to upload", filesToUpload);
    if (!(currentDirectory && filesToUpload.length)) return;
    setUploadModal(false);
    setActiveUploadsModal(true);
    await uploadFiles(filesToUpload);
  }

  const handleReserveSpace = async (event: SyntheticEvent) => {
    const address = reserveAddrField.current?.value;
    const space = reserveSpaceField.current?.value;
    setReserveSpaceModal(false);
    return address && space && fm?.fs.reserveSpace(fm.address, address, Number(space));
  }

  const cancelUpload = () => {

    setUploadModal(false);
  }

  return (
    <div className="mx-auto max-h-[100vh] h-[100vh] overflow-hidden">
      <main>
        <section className="px-24" style={{ gridArea: 'frame' }}>
          <header className="header py-2 flex justify-between items-center">
            <p className="flex flex-row items-center gap-2">
              <img src="/logo.png" className="h-10 rounded-[14px]" style={{ filter: "revert" }} alt="" />
              <span className="text-xl font-bold">SKALE<sup className="font-medium">fs</sup></span>
            </p>
            <div className="flex flex-row gap-4">
              {
                (uploadingFiles.length) ?
                  <p className="px-4 py-2 cursor-pointer rounded bg-yellow-50 border border-yellow-500"
                    onClick={(e) => setActiveUploadsModal(true)}
                  >
                    Uploading {uploadingFiles.length} files..
                  </p>
                  : null
              }

              {
                (fm?.account) ?
                  <p className="px-4 py-2 rounded bg-gray-100 overflow-hidden">
                    {shortAddress(fm.account)}
                  </p> :
                  <button className="btn rounded-full" onClick={(e) => connectWallet()}>Connect</button>
              }
            </div>
          </header>
          <div className="status-bar flex flex-row justify-between items-center">
            <h1 className="text-3xl font-semibold">Filestorage</h1>
            <div className="w-80">
              <p className="font-bold">{prettyBytes(occupiedSpace || 0)} used</p>
              <p className="text-sm">
                {((occupiedSpace / reservedSpace) || 0).toFixed(6)}% used - {prettyBytes((reservedSpace - occupiedSpace) || 0)} free
              </p>
              <Progress className="w-full" value={occupiedSpace / reservedSpace} max={100} />
              <br />
              {
                (isAuthorized) ?
                  <Button
                    className="w-full bg-gray-200 text-black border-none"
                    onClick={() => setReserveSpaceModal(true)}
                    color="secondary">Reserve space</Button>
                  : null
              }
            </div>
          </div>
          <div className="action-bar my-4 gap-4 flex flex-row justify-between items-center">
            <div className="grow relative">
              <div className="mr-4 pointer-events-none absolute top-1/2 transform -translate-y-1/2 left-3">
                {
                  isSearching ? <SpinnerIcon className="h-6 w-6" /> : <SearchIcon className="h-6 w-6" />
                }
              </div>
              <Input
                ref={searchField}
                onChange={(e) => setSearchTerm(searchField.current.value)}
                onBlur={e => { setSearchTerm(""); searchField.current.value = ""; }}
                className="w-full border border-gray-500 font-medium"
                style={{ paddingLeft: "3.5rem" }}
                type="text"
                placeholder="Search files..."
              />
              {
                (searchListing && searchListing.length) ?
                  <div className="absolute top-[100%] bg-slate-100 rounded mt-2 py-2 z-[1001] w-full">
                    <ul>
                      {
                        searchListing.map((item) => (
                          <li
                            className="px-4 py-2 mx-2 rounded cursor-default hover:bg-white"
                            onClick={(e) => (item.kind === "directory") ? changeDirectory(item) : fm?.downloadFile(item)}
                          >
                            < FormattedName data={item} />
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                  : <></>
              }
            </div>
            {
              (isAuthorized) ?
                <div className="flex-none flex flex-row gap-4">
                  <Button
                    className="btn w-80"
                    onClick={
                      (e) => setUploadModal(true)
                    }
                  >
                    <DocumentAddIcon className="h-5 w-5 mr-4" /> Upload file
                  </Button>
                  <Button
                    className={`btn w-80 text-white ${(isCreatingDirectory) ? 'loading' : ''}`}
                    onClick={() => setDirectoryModal(true)}
                    disabled={isCreatingDirectory}
                  >
                    {
                      !isCreatingDirectory ?
                        (<><FolderAddIcon className="h-5 w-5 mr-4 text-white" /> Create directory</>) :
                        <>Creating directory..</>
                    }
                  </Button>
                </div>
                : null
            }
          </div>
        </section>
        <section style={{ gridArea: 'mgr' }} className="overflow-y-scroll px-24">
          <FileNavigator />
        </section>
      </main>

      <Modal
        className="gap-4 flex flex-col justify-center items-center"
        open={uploadModal}
        onClickBackdrop={() => setUploadModal(false)}
      >
        <Modal.Header className="text-center font-bold">
          Upload file
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-1.5 justify-center items-center">
          {
            (filesToUpload.length) ?
              (<>
                <Input className="px-4 py-2 m-0 rounded bg-gray-100 focus:border-0 focus:outline-none"
                  type="text"
                  placeholder="File name"
                  value={uploadFileField.current?.files[0].name}
                  required
                />
              </>)
              :
              (<>
                <p>Select files to upload.</p>
                <UploadIcon className="h-24 w-24 my-4" />
              </>)
          }
          {
            filesToUpload
              .map(file => (
                <div key={file.name} className="flex flex-row justify-between w-72">
                  <p>{file.name}</p>
                  <p>{prettyBytes(file.size)}</p>
                </div>
              ))
          }
        </Modal.Body>
        <Modal.Actions className="flex justify-center items-center gap-8">
          {
            filesToUpload.length ?
              <>
                <Button onClick={handleConfirmUpload}>Upload</Button>
                <a className="underline cursor-pointer" onClick={cancelUpload}>Cancel</a>
              </>
              :
              <>
                <label className="btn" htmlFor="file-upload">
                  Select files
                </label>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => setFilesToUpload(Array.from(e.target.files))}
                  ref={uploadFileField}
                  multiple
                />
              </>
          }
        </Modal.Actions>
      </Modal>

      <Modal
        className="gap-4 flex flex-col justify-center items-center"
        open={activeUploadsModal}
        onClickBackdrop={() => setActiveUploadsModal(false)}
      >
        <Modal.Header className="text-center font-bold">
          Uploading
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-1.5 justify-center items-center">
          {
            (uploadingFiles.length) ?
              <>
                <p>This process may take some time.</p>
                <UploadIcon className="h-24 w-24 my-4" />
                {
                  Array.from(activeUploads.values()).flat().map(upload => (upload) ? (
                    <div key={upload.dePath} className="flex flex-row justify-between items-center gap-2">
                      <p>{upload.file.name}</p>
                      <p>{prettyBytes(upload.file.size)}</p>
                    </div>
                  ) : null)
                }
                <Progress className="w-72" value={upload.progress} max={100} />
              </>
              :
              <>
                <p>All files are uploaded.</p>
              </>
          }
        </Modal.Body>
      </Modal>

      <Modal
        className="gap-4 flex flex-col justify-center items-center"
        open={directoryModal}
      >
        <Modal.Header className="text-center font-bold">
          Create new directory
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-4 justify-center items-center">
          <p>
            Give your folder a name.
          </p>
          <Input className="px-4 py-2 m-0 rounded bg-gray-100 focus:border-0 focus:outline-none"
            type="text"
            placeholder="New directory name"
            required
            ref={newDirectoryField}
          />
        </Modal.Body>
        <Modal.Actions className="flex justify-center items-center gap-8">
          <Button onClick={handleCreateDirectory}>Create</Button>
          <a className="underline cursor-pointer" onClick={() => { setDirectoryModal(false) }}>Cancel</a>
        </Modal.Actions>
      </Modal>

      <Modal
        className="gap-4 flex flex-col justify-center items-center"
        open={reserveSpaceModal}
        onClickBackdrop={() => setReserveSpaceModal(false)}
      >
        <Modal.Header className="text-center font-bold">
          📦<br />Reserve Space
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-4 justify-center items-center">
          <p>
            Enter the address to which the space will be allocated.
          </p>
          <Input className="px-4 py-2 m-0 rounded bg-gray-100 focus:border-0 focus:outline-none"
            type="text"
            placeholder="0x..."
          />
          <Input className="px-4 py-2 m-0 rounded bg-gray-100 focus:border-0 focus:outline-none"
            type="number"
            placeholder="Space to reserve"
          />
        </Modal.Body>
        <Modal.Actions className="flex justify-center items-center gap-8">
          <Button onClick={handleReserveSpace}>Reserve</Button>
          <a className="underline cursor-pointer" onClick={() => setReserveSpaceModal(false)}>Cancel</a>
        </Modal.Actions>
      </Modal>
    </div>
  )
}

export default App
