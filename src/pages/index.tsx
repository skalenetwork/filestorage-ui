import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Base.module.css'

import { useState } from 'react';

import { Button } from '@/components/common';

const Home: NextPage = () => {

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="container mx-auto">
      <Head>
        <title>SKALE Filestorage</title>
        <meta name="description" content="SKALE filestorage Dapp" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <header className="header py-4 flex justify-between items-center">
        <p>
          <img src="/logo.png" className="h-12" style={{ filter: "revert" }} alt="" />
          <small className="text-gray-500 font-mono">File System</small>
        </p>
        <input
          className="px-4 py-2 m-0 rounded bg-gray-100 focus:border-0 focus:outline-none"
          type="text"
          placeholder="0x..."
        />
      </header>

      <main>
        <div className="status-bar flex flex-row justify-between items-center">
          <h1 className="text-3xl font-semibold">Filestorage</h1>
          <div>
            Status
          </div>
        </div>
        <div className="action-bar my-4 gap-4 flex flex-row justify-between items-center">
          <div className="grow">
            <input className="py-2 px-4 w-full border border-gray-500 rounded" type="text" placeholder="Search files..." />
          </div>
          <div className="flex-none">
            <Button spaced onClick={() => setModalOpen(true)}>+ Upload file</Button>
            <Button spaced onClick={() => setModalOpen(true)}>+ Create directory</Button>
          </div>
        </div>
        <div className="my-6 h-96 bg-gray-100 rounded flex justify-center items-center">
          <p className="text-gray-500 font-mono">⌛ Data Table</p>
        </div>
      </main>

      <div className="modal">
      </div>

      <footer className="p-4 text-center text-slate-400 text-sm">
        ⚬ SKALE Filesystem [WIP] ⚬
      </footer>
    </div>
  )
}

export default Home
