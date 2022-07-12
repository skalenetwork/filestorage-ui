

import prettyBytes from 'pretty-bytes';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';

import { useFileManagerContext } from '@/context/index';

import FolderAddIcon from '@heroicons/react/solid/FolderAddIcon';
import DocumentAddIcon from '@heroicons/react/solid/DocumentAddIcon';
import { Button, Modal, Progress, Input } from '@/components/common';
import FileNavigator from '@/components/FileNavigator';

const Home: NextPage = () => {

  // modals
  const [reserveSpaceModal, setReserveSpaceModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);

  // field refs
  const reserveAddrField = useRef("");
  const reserveSpaceField = useRef("");

  const uploadFileField = useRef(null);
  const [filesToUpload, setFilesToUpload] = useState([]);

  const newDirectoryField = useRef("");

  const { fm, directory: currentDirectory, reservedSpace, occupiedSpace, walletMode, connectedAddress } = useFileManagerContext();

  const handleCreateDirectory = async (event) => {
    event.preventDefault();
    console.log("handleCreateDirectory", currentDirectory, newDirectoryField.current.value);
    if (!currentDirectory) return;
    return await fm?.createDirectory(currentDirectory, newDirectoryField.current.value);
  }

  const handleUploadFileField = async (event) => {
    console.log("handle upload file field change", event.target.files[0]);
    setFilesToUpload(event.target.files);
  }

  const handleConfirmUpload = async (event) => {
    console.log("file to upload", filesToUpload);
    if (!currentDirectory || !filesToUpload.length) return;
    filesToUpload.forEach(file => {
      fm?.uploadFile(currentDirectory, file);
    });
  }

  const handleReserveSpace = async (event) => {
    return fm?.fs.reserveSpace(
      fm.address,
      reserveAddrField.current,
      reserveSpaceField.current
    );
  }

  const cancelUpload = () => {
    setUploadModal(false);
  }

  return (
    <div className="container mx-auto px-16">
      <Head>
        <title>SKALE Filestorage</title>
        <meta name="description" content="SKALE filestorage Dapp" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <header className="header py-4 flex justify-between items-center">
        <p>
          <img src="/logo.png" className="h-12" style={{ filter: "revert" }} alt="" />
          <small className="text-gray-500 font-mono">File System</small>
        </p>
        <p className="px-4 py-2 w-72 rounded bg-gray-100 overflow-hidden">
          {connectedAddress}
        </p>

      </header>

      <main>
        <div className="status-bar flex flex-row justify-between items-center">
          <h1 className="text-3xl font-semibold">Filestorage</h1>
          <div className="w-72">
            <p className="font-bold">{prettyBytes(occupiedSpace || 0)} used</p>
            <p className="text-sm">{(occupiedSpace / reservedSpace).toFixed(2)}% used - {prettyBytes((reservedSpace - occupiedSpace) || 0)} free</p>
            <Progress className="w-full" value={occupiedSpace / reservedSpace} max={100} />
            <br />
            <Button
              className="w-full bg-gray-200 text-black"
              onClick={() => setReserveSpaceModal(true)}
              color="secondary">+ Reserve space</Button>
          </div>
        </div>
        <div className="action-bar my-4 gap-4 flex flex-row justify-between items-center">
          <div className="grow">
            <Input className="py-2 px-4 w-full border border-gray-500 rounded" type="text" placeholder="Search files..." />
          </div>
          <div className="flex-none flex flex-row gap-4">
            <>
              <label className="btn btn-wide flex" htmlFor="file-upload">
                <DocumentAddIcon className="h-5 w-5 mr-4" /> Upload file
              </label>
              <input type="file" id="file-upload" className="hidden" ref={uploadFileField}
                onChange={handleUploadFileField} multiple />
            </>
            <form className="input-group">
              <Input className="px-4 py-2 m-0 rounded focus:border-0 focus:outline-none"
                type="text"
                placeholder="New directory name"
                required
                ref={newDirectoryField}
              />
              <Button className="btn-wide" onClick={handleCreateDirectory}>
                <FolderAddIcon className="h-5 w-5 mr-4" /> Create directory
              </Button>
            </form>
          </div>
        </div>
        <FileNavigator />
      </main>

      <Modal
        className="gap-4 flex flex-col justify-center items-center"
        open={uploadModal}
      >
        <Modal.Header className="text-center font-bold">
          Upload File
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-4 justify-center items-center">
          <p>
            Give your file or folder a name.
          </p>
          <Input
            className="px-4 py-2 m-0 rounded bg-gray-100 cursor-pointer focus:border-0 focus:outline-none"
            type="text"
          />
        </Modal.Body>
        <Modal.Actions className="flex justify-center items-center gap-8">
          <Button onClick={handleConfirmUpload}>Upload</Button>
          <a className="underline cursor-pointer" onClick={cancelUpload}>Cancel</a>
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

      <footer className="p-4 text-center text-slate-500 text-sm">
        ⚬ SKALE FileManager ⚬ <br />
        ✔️ Navigate ✔ Upload files ✔️ Create dir ✔️ Stats —— ⌛ Reactivity
      </footer>
    </div >
  )
}

export default Home
