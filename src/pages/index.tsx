import type { NextPage } from 'next';
import Head from 'next/head';

import { useState, useEffect, useRef } from 'react';
import { useMount, useAsync } from 'react-use';

import { Button, Modal, Progress, Input } from '@/components/common';
import FileManagerView from '@/components/FileManagerView';

import { useFileManagerContext } from '../store';

const Home: NextPage = () => {

  // modals
  const [reserveSpaceModal, setReserveSpaceModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);

  // field refs
  const reserveAddrField = useRef("");
  const reserveSpaceField = useRef("");

  const uploadFileField = useRef(null);
  const [uploadFile, setUploadFile] = useState(null);

  const newDirectoryField = useRef("");

  const { fm, currentDirectory, totalSpace } = useFileManagerContext();

  const handleCreateDirectory = async (event) => {
    event.preventDefault();
    console.log("handleCreateDirectory", currentDirectory, newDirectoryField.current.value);
    if (!currentDirectory) return;
    return await fm?.createDirectory(currentDirectory, newDirectoryField.current.value);
  }

  const handleUploadFileField = async (event) => {
    console.log("handle upload file field change", event.target.files[0]);
    setUploadFile(event.target.files[0]);
  }

  const handleUploadFile = async (event) => {
    console.log("file to upload", uploadFile);
    if (!currentDirectory || !uploadFile) return;
    fm?.uploadFile(currentDirectory, uploadFile);
  }

  const handleReserveSpace = async (event) => {
    return fm?.fs.reserveSpace(
      fm.address,
      reserveAddrField.current,
      reserveSpaceField.current
    );
  }

  return (
    <div className="container mx-auto">
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
        <Input
          className="px-4 py-2 m-0 rounded bg-gray-100 focus:border-0 focus:outline-none"
          type="text"
          placeholder="0x..."
        />
      </header>

      <main>
        <div className="status-bar flex flex-row justify-between items-center">
          <h1 className="text-3xl font-semibold">Filestorage</h1>
          <div>
            <p>{totalSpace}</p>
            <p className="font-bold">25.32 GB used</p>
            <p className="text-sm">79% used - 6.64 GB free</p>
            <Progress className="w-48" value={70} max={100} />
            <Button onClick={() => setReserveSpaceModal(true)} color="ghost">+ Reserve Space</Button>
          </div>
        </div>
        <div className="action-bar my-4 gap-4 flex flex-row justify-between items-center">
          <div className="grow">
            <Input className="py-2 px-4 w-full border border-gray-500 rounded" type="text" placeholder="Search files..." />
          </div>
          <div className="flex-none flex flex-row gap-4">
            <Button onClick={() => setUploadModal(true)} >+ Upload file</Button>
            <form className="input-group">
              <Input className="px-4 py-2 m-0 rounded bg-gray-100 focus:border-0 focus:outline-none"
                type="text"
                placeholder="New directory name"
                required
                ref={newDirectoryField}
              />
              <Button onClick={handleCreateDirectory}>+ Create directory</Button>
            </form>
          </div>
        </div>
        <FileManagerView />
      </main>

      <Modal
        className="gap-4 flex flex-col justify-center items-center"
        open={uploadModal}
        onClickBackdrop={() => setUploadModal(false)}
      >
        <Modal.Header className="text-center font-bold">
          Upload File
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-4 justify-center items-center">
          <p>
            Give your file or folder a name.
          </p>
          <Input
            className="px-4 py-2 m-0 rounded bg-gray-100 focus:border-0 focus:outline-none"
            type="file"
            ref={uploadFileField}
            onChange={handleUploadFileField}
          />
        </Modal.Body>
        <Modal.Actions>
          <Button onClick={handleUploadFile}>Upload</Button>
          <a className="underline" onClick={() => setUploadModal(false)}>Cancel</a>
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
        <Modal.Actions>
          <Button onClick={handleReserveSpace}>Reserve</Button>
          <a className="underline" onClick={handleReserveSpace}>Cancel</a>
        </Modal.Actions>
      </Modal>

      <footer className="p-4 text-center text-slate-400 text-sm">
        ⚬ SKALE Filesystem [WIP] ⚬
      </footer>
    </div >
  )
}

export default Home
