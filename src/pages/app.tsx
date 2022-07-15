// @ts-nocheck

import prettyBytes from 'pretty-bytes';
import { useState, useRef, SyntheticEvent, useEffect } from 'react';
import { useDebounce } from 'react-use';

import { useFileManagerContext } from '@/context/index';

import FolderAddIcon from '@heroicons/react/solid/FolderAddIcon';
import DocumentAddIcon from '@heroicons/react/solid/DocumentAddIcon';
import UploadIcon from '@heroicons/react/outline/UploadIcon';
import { Button, Modal, Progress, Input } from '@/components/common';
import FileNavigator from '@/components/FileNavigator';

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

  const [filesToUpload, setFilesToUpload] = useState([]);

  const {
    fm, directory: currentDirectory, reservedSpace, occupiedSpace, searchListing,
    isAuthorized, connectedAddress, activeUploads,
    uploadFiles, createDirectory, search
  } = useFileManagerContext();

  const [uploadingFiles, setUploadingFiles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    search(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    setUploadingFiles(Array.from(activeUploads.values()).flat());
  }, [activeUploads]);

  const shortAddress = (address: string) => {
    return address.substring(0, 6) + "...." + address.substring(address.length - 4);
  }

  const handleCreateDirectory = async (event: SyntheticEvent) => {
    event.preventDefault();
    const name = newDirectoryField.current?.value;
    console.log("handleCreateDirectory", currentDirectory, name);
    if (!(currentDirectory && name)) return;
    setDirectoryModal(false);
    await createDirectory(name);
  }

  const handleConfirmUpload = async (event: SyntheticEvent) => {
    const files = Array.from(uploadFileField.current?.files || []);
    console.log("file to upload", files);
    if (!(currentDirectory && files && files.length)) return;
    setUploadModal(false);
    setActiveUploadsModal(true);
    await uploadFiles(files);
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
    <div className="container mx-auto px-16 max-h-[100vh] h-[100vh] overflow-hidden">
      <main>
        <section style={{ gridArea: 'frame' }}>
          <header className="header py-4 flex justify-between items-center">
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

              <p className="px-4 py-2 rounded bg-gray-100 overflow-hidden">
                {shortAddress(connectedAddress)}
              </p>
            </div>
          </header>
          <div className="status-bar flex flex-row justify-between items-center">
            <h1 className="text-3xl font-semibold">Filestorage</h1>
            <div className="w-72">
              <p className="font-bold">{prettyBytes(occupiedSpace || 0)} used</p>
              <p className="text-sm">{(occupiedSpace / reservedSpace).toFixed(6)}% used - {prettyBytes((reservedSpace - occupiedSpace) || 0)} free</p>
              <Progress className="w-full" value={occupiedSpace / reservedSpace} max={100} />
              <br />
              {
                (isAuthorized) ?
                  <Button
                    className="w-full bg-gray-200 text-black"
                    onClick={() => setReserveSpaceModal(true)}
                    color="secondary">+ Reserve space</Button>
                  : null
              }
            </div>
          </div>
          <div className="action-bar my-4 gap-4 flex flex-row justify-between items-center">
            <div className="grow">
              <Input
                onChange={(e) => { setSearchTerm(e.target.value) }}
                className="py-2 px-4 w-full border border-gray-500 rounded"
                type="text"
                placeholder="Search files..."
              />
            </div>
            {
              (isAuthorized) ?
                <div className="flex-none flex flex-row gap-4">
                  <>
                    <label className="btn w-72 flex" htmlFor="file-upload">
                      <DocumentAddIcon className="h-5 w-5 mr-4" /> Upload file
                  </label>
                    <input type="file" id="file-upload" className="hidden" ref={uploadFileField}
                      onChange={() => { uploadFileField.current?.files?.length && setUploadModal(true) }} multiple />
                  </>
                  <Button className="btn w-72" onClick={() => setDirectoryModal(true)}>
                    <FolderAddIcon className="h-5 w-5 mr-4" /> Create directory
                </Button>
                </div>
                : null
            }
          </div>
        </section>
        <section style={{ gridArea: 'mgr' }} className="overflow-y-scroll">
          <FileNavigator />
        </section>
      </main>

      <Modal
        className="gap-4 flex flex-col justify-center items-center"
        open={uploadModal}
      >
        <Modal.Header className="text-center font-bold">
          Upload Files
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-1.5 justify-center items-center">
          {
            Array.from(uploadFileField.current?.files || [])
              .map(file => (
                <div key={file.name} className="flex flex-row justify-between w-72">
                  <p>{file.name}</p>
                  <p>{prettyBytes(file.size)}</p>
                </div>
              ))
          }
        </Modal.Body>
        <Modal.Actions className="flex justify-center items-center gap-8">
          <Button onClick={handleConfirmUpload}>Confirm Upload</Button>
          <a className="underline cursor-pointer" onClick={cancelUpload}>Cancel</a>
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
                      <Progress className="w-24" value={upload.progress} max={100} />
                    </div>
                  ) : null)
                }
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
          <Input className="px-4 py-2 m-0 rounded bg-gray-100 cursor-pointer focus:border-0 focus:outline-none"
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
