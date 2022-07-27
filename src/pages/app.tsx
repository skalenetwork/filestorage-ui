// @ts-nocheck

import prettyBytes from 'pretty-bytes';
import { useState, useRef, SyntheticEvent, useEffect } from 'react';
import { useDebounce } from 'react-use';

import { useFileManagerContext } from '@/context/index';

import { useForm, useFieldArray } from 'react-hook-form';

import { Button, Modal, Progress, Input, SpinnerIcon } from '@/components/common';
import FolderAddIcon from '@heroicons/react/solid/FolderAddIcon';
import DocumentAddIcon from '@heroicons/react/solid/DocumentAddIcon';
import UploadIcon from '@heroicons/react/outline/UploadIcon';
import SearchIcon from '@heroicons/react/solid/SearchIcon';
import ArchiveIcon from '@heroicons/react/outline/ArchiveIcon';
import XIcon from '@heroicons/react/outline/XIcon';

import FileNavigator from '@/components/FileNavigator';
import FormattedName from '@/components/FormattedName';
import FormattedAddress from '@/components/FormattedAddress';
import FormattedSize from '@/components/FormattedSize';

import UploadWidget from '../partials/UploadWidget';
import UploadProgressWidget from '../partials/UploadProgressWidget';
import CreateDirectoryWidget from '../partials/CreateDirectoryWidget';
import ReserveSpaceWidget from '../partials/ReserveSpaceWidget';
import GrantorWidget from '../partials/GrantorWidget';
import ViewFileWidget from '../partials/ViewFileWidget';

const App = () => {

  // modals

  const [reserveSpaceModal, setReserveSpaceModal] = useState(false);
  const [activeUploadsModal, setActiveUploadsModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [directoryModal, setDirectoryModal] = useState(false);

  // field refs
  const searchField = useRef<HTMLInputElement>();
  const reserveAddrField = useRef<HTMLInputElement>();
  const reserveSpaceField = useRef<HTMLInputElement>();
  const newDirectoryField = useRef<HTMLInputElement>();

  const {
    fm, directory: currentDirectory, reservedSpace, occupiedSpace, searchListing,
    isAuthorized, connectWallet, activeUploads, failedUploads,
    changeDirectory, uploadFiles, createDirectory, search, isSearching, isCreatingDirectory
  } = useFileManagerContext();

  const [uploadingFiles, setUploadingFiles] = useState<any[]>([]);
  const [failedFiles, setFailedFiles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm();

  useDebounce(() => {
    console.log("debounce:search", searchTerm);
    search(searchTerm);
  }, 500, [searchTerm]);

  useEffect(() => {
    setUploadingFiles(Array.from(activeUploads.values()).flat());
  }, [activeUploads]);

  useEffect(() => {
    setFailedFiles(Array.from(failedUploads.values()).flat());
  }, [failedUploads]);

  const handleCreateDirectory = async (event: SyntheticEvent) => {
    event.preventDefault();
    const name = newDirectoryField.current?.value;
    console.log("handleCreateDirectory", currentDirectory, name);
    if (!(currentDirectory && name)) return;
    setDirectoryModal(false);
    newDirectoryField.current.value = "";
    await createDirectory(name);
  }

  const handleConfirmUpload = async (data: { uploads: Array<{ name: string, file: File }> }) => {
    console.log("file to upload", data.uploads);
    if (!(currentDirectory && data.uploads && data.uploads.length)) return;
    const filesToUpload: File[] = data.uploads.map(({ name, file }) => {
      return new File([file], name);
    });
    setUploadModal(false);
    setActiveUploadsModal(true);
    return await uploadFiles(filesToUpload);
  }

  const handleReserveSpace = async (event: SyntheticEvent) => {
    const address = reserveAddrField.current?.value;
    const space = reserveSpaceField.current?.value;
    setReserveSpaceModal(false);
    return address && space && fm?.fs.reserveSpace(fm.address, address, Number(space));
  }

  const cancelUpload = () => {
    setUploadModal(false);
    setFilesToUpload([]);
  }

  return (
    <div className="mx-auto max-h-[100vh] h-[100vh] overflow-hidden">
      <main>
        <section className="px-36" style={{ gridArea: 'frame' }}>
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
                  : <></>
              }
              {
                (fm?.account) ?
                  <p className="w-80 flex items-center justify-between px-4 py-2 rounded bg-gray-100 overflow-hidden">
                    <span>Account</span><FormattedAddress address={fm.account} pre={5} post={10} />
                  </p>
                  :
                  <button className="btn rounded-full" onClick={(e) => connectWallet()}>Connect</button>
              }
            </div>
          </header>
          <div className="status-bar flex flex-row justify-between items-center">
            <h1 className="text-3xl font-semibold">Filestorage</h1>
            <div className="w-80">
              <p>
                <span className="font-semibold">
                  <FormattedSize
                    value={occupiedSpace} />
                </span> used
                </p>
              <p className="text-xs font-medium">
                {((occupiedSpace / reservedSpace) || 0).toFixed(6)}% used - {prettyBytes((reservedSpace - occupiedSpace) || 0)} free
              </p>
              <Progress className="w-full" value={occupiedSpace / reservedSpace} max={100} />
              <br />
              {
                (isAuthorized) ?
                  <Button
                    className="w-full bg-gray-200 text-black border-none"
                    onClick={() => setReserveSpaceModal(true)}
                    color="secondary">Reserve space
                  </Button>
                  : null
              }
            </div>
          </div>
          <div className="action-bar my-4 gap-4 flex flex-row justify-between items-center">
            <div className="grow relative">
              <div className="mr-4 pointer-events-none absolute top-1/2 transform -translate-y-1/2 left-4">
                {
                  isSearching
                    ? <SpinnerIcon className="h-6 w-6" />
                    : <SearchIcon className="h-6 w-6" />
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
              <div className="pointer-events-none absolute top-1/2 transform -translate-y-1/2 right-4">
                {
                  isSearching
                    ? <XIcon className="h-6 w-6" />
                    : <></>
                }
              </div>
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
                            <FormattedName item={item} />
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
        <section style={{ gridArea: 'mgr' }} className="overflow-y-scroll px-36">
          <FileNavigator />
        </section>
      </main>

      <UploadWidget
        open={uploadModal}
        formControl={control}
        formRegister={register}
        onClose={() => setUploadModal(false)}
        onSubmit={handleSubmit(handleConfirmUpload)}
      />

      <UploadProgressWidget
        open={activeUploadsModal}
        onClose={() => setActiveUploadsModal(false)}
        activeUploads={uploadingFiles}
        failedUploads={failedFiles}
      />

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
          <div>
            <label className="label" htmlFor="">
              <span class="label-text">Name</span>
            </label>
            <Input
              type="text"
              placeholder="New directory name"
              required
              ref={newDirectoryField}
            />
          </div>
        </Modal.Body>
        <Modal.Actions className="flex justify-center items-center gap-8">
          <Button onClick={handleCreateDirectory}>Create</Button>
          <a className="underline cursor-pointer" onClick={(e) => {
            setDirectoryModal(false);
            newDirectoryField.current.value = "";
          }}>Cancel</a>
        </Modal.Actions>
      </Modal>

      <Modal
        className="gap-4 flex flex-col justify-center items-center"
        open={reserveSpaceModal}
        onClickBackdrop={() => setReserveSpaceModal(false)}
      >
        <Modal.Header className="text-center font-bold flex flex-col items-center justify-center">
          <ArchiveIcon className="h-24 w-24" />
          <p>Reserve Space</p>
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-4 justify-center items-center">
          <p>
            Enter the address to which the space will be allocated.
          </p>
          <div>
            <label className="label" htmlFor="">
              <span class="label-text">Address</span>
            </label>
            <Input
              type="text"
              placeholder="0x..."
            />
          </div>
          <div>
            <label className="label" htmlFor="">
              <span class="label-text">Space to reserve</span>
            </label>
            <Input
              type="number"
              placeholder="Space to reserve"
            />
          </div>
        </Modal.Body>
        <Modal.Actions className="flex justify-center items-center gap-8">
          <Button onClick={handleReserveSpace}>Reserve</Button>
          <a className="underline cursor-pointer" onClick={() => setReserveSpaceModal(false)}>Cancel</a>
        </Modal.Actions>
      </Modal>
    </div >
  )
}

export default App
