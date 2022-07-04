import Web3 from 'web3';
import type { NextPage } from 'next';
import Head from 'next/head';

import { useState, useEffect, useRef } from 'react';
import { useMount, useAsync } from 'react-use';

import { Button, Modal, Progress, Input } from '@/components/common';
import Web3Modal from 'web3modal';

import { DeFileManager, DeFile, DeDirectory } from '@/services/filesystem';

const Home: NextPage = () => {

  // @todo move these to contexts

  const [reserveSpaceModal, setReserveSpaceModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);

  const reserveAddrField = useRef("");
  const reserveSpaceField = useRef("");

  const [address, setAddress] = useState("");
  const [rpcEndpoint, setRpcEndpoint] = useState("");

  const [fileManager, setFileManager] = useState<DeFileManager | undefined>(undefined);

  const [currentDirectory, setCurrentDirectory] = useState<DeDirectory | undefined>(undefined);
  const [currentListing, setCurrentListing] = useState<Array<DeDirectory | DeFile>>([]);

  // makeshift placeholder for wallet flow
  useMount(() => {
    // setAddress(String(localStorage.getItem("SKALE_TEST_ADDRESS")));
    // setRpcEndpoint(String(localStorage.getItem("SKALE_TEST_ADDRESS")));
  });

  // initialize file manager constructs
  useEffect(() => {
    if (address.length && rpcEndpoint.length) {
      setFileManager(new DeFileManager(address, rpcEndpoint));
    }
  }, [address, rpcEndpoint]);

  // update file manager current listing
  useAsync(async () => {
    if (!currentDirectory) return;
    const listing = await currentDirectory.entries();
    setCurrentListing(Array.from(listing))
  }, [currentDirectory]);

  const handleCreateDirectory = async () => {
    if (!currentDirectory) return;
    return await fileManager?.createDirectory(currentDirectory);
  }

  const handleUploadFile = async (file: File) => {
    if (!currentDirectory) return;
    fileManager?.uploadFile(currentDirectory, file);
  }

  const handleReserveSpace = async (event) => {
    return fileManager?.fs.reserveSpace(
      address,
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
            <p className="font-bold">25.32 GB used</p>
            <p>79% used - 6.64 GB free</p>
            <Progress className="w-48" value={70} max={100} color="accent" />
          </div>
        </div>
        <div className="action-bar my-4 gap-4 flex flex-row justify-between items-center">
          <div className="grow">
            <Input className="py-2 px-4 w-full border border-gray-500 rounded" type="text" placeholder="Search files..." />
          </div>
          <div className="flex-none flex flex-row gap-4">
            <Button onClick={() => setReserveSpaceModal(true)} >+ Upload file</Button>
            <Button>+ Create directory</Button>
          </div>
        </div>
        <div className="my-6 h-96 bg-gray-100 rounded flex justify-center items-center">
          <p className="text-gray-500 font-mono">⌛ Data Table</p>
        </div>
      </main>

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
          <Button onClick={handleReserveSpace}>Kharasho</Button>
        </Modal.Actions>
      </Modal>

      <footer className="p-4 text-center text-slate-400 text-sm">
        ⚬ SKALE Filesystem [WIP] ⚬
      </footer>
    </div >
  )
}

export default Home
