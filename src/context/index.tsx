//@ts-nocheck

import config, { ConfigType } from '../config';

import Web3 from 'web3';
import Web3Modal from 'web3modal';

import { createContext, useContext, useEffect, useState } from 'react';
import { useMount, useKey, useLocalStorage } from 'react-use';

import { DeFileManager, DeDirectory, DeFile } from '@/services/filesystem';
import useDeFileManager, { Action, State } from '@/context/useDeFileManager';

import WalletConnectProvider from "@walletconnect/web3-provider";
import Fortmatic from "fortmatic";

import { Button, Modal, Progress, Input } from '@/components/common';

export type ContextType = State & Action & {
  connectWallet: Function;
  connectedAddress: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  getFileLink: Function;
};

const FileManagerContext = createContext<ContextType>(undefined);

const getRpcEndpoint = (data: ConfigType['chains'][0]) => {
  return `${data.protocol}://${data.nodeDomain}/${data.version}/${data.sChainName}`
}

const getFsEndpoint = (data: ConfigType['chains'][0], address: string = "", path: string = "") => {
  let root = address.toLowerCase();
  if (root.slice(0, 2) === "0x") {
    root = root.slice(2);
  }
  return `//${data.nodeDomain}/fs/${data.sChainName}${(root) ? "/" + root : ""}${(path) ? "/" + path : ""}`
}

const RPC_ENDPOINT = getRpcEndpoint(config.chains[0]);
const CHAIN_ID = config.chains[0].chainId;
const TEST_ADDRESS = '0x5A4AB05FBB140eb6A51e7D13a528A6Aa35a5ef4A';

const addNetwork = (web3, chain: ConfigType['chains'][0]) => {
  return web3.currentProvider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: chain.chainId,
        chainName: `sChain ${chain.sChainName}`,
        rpcUrls: [getRpcEndpoint(chain)],
        blockExplorerUrls: [`${chain.protocol}://${chain.sChainName}.explorer.${chain.nodeDomain}/`],
      },
    ],
  })
}

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: "INFURA_ID" // required
    }
  },
  fortmatic: {
    package: Fortmatic, // required
    options: {
      key: "FORTMATIC_KEY", // required
      network: {
        rpcUrl: RPC_ENDPOINT,
        chainId: CHAIN_ID
      } // if we don't pass it, it will default to localhost:8454
    }
  }
}

export function ContextWrapper({ children }) {

  // local params, w3 later to come from wallet-provider
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [w3Modal, setW3Modal] = useState<Web3Modal | undefined>();
  const [w3Provider, setW3Provider] = useState<{ request: Function } | undefined>();

  const [connectedAddress, setConnectedAddress] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  const connectWallet = async () => {
    try {
      const web3Provider = await w3Modal.connect();
      console.log('web3Provider', web3Provider);
      const web3 = new Web3(web3Provider);
      setConnectedAddress(web3Provider.selectedAddress);
      setAddress(web3Provider.selectedAddress);
      const chain = config.chains[0];
      await addNetwork(web3, chain);
      setW3Provider(web3Provider);
    } catch (e) {
      console.log("Connecting Wallet", e);
      if (!w3Provider) {
        setW3Provider(new Web3.providers.HttpProvider(RPC_ENDPOINT));
      }
    }
  }

  const getFileLink = (file: DeFile) => {
    let link = getFsEndpoint(config.chains[0], address, file.path);
    console.log(file, link);
    return link;
  }

  useEffect(() => {
    if (demoMode) {
      setW3Provider(new Web3.providers.HttpProvider(RPC_ENDPOINT));
      setAddress(TEST_ADDRESS);
      return;
    }
    setW3Modal(new Web3Modal({
      network: "testnet", // optional
      cacheProvider: false, // optional
      disableInjectedProvider: false,
      providerOptions: providerOptions// required
    }));
  }, [demoMode]);

  useEffect(() => {
    if (!w3Modal) return;
    connectWallet();
    console.log('w3Modal', w3Modal);
  }, [w3Modal]);

  useEffect(() => {
    if (!w3Provider) return;
    console.log("w3Provider", w3Provider);

    // w3Provider.request({
    //   method: 'wallet_switchEthereumChain',
    //   params: [{ chainId: CHAIN_ID }],
    // });
  }, [w3Provider]);

  /// DEV ZONE START ///

  // shadowy key management.. DTTAH
  const [pk, setPk] = useLocalStorage("SKL_pvtKey", undefined);
  useKey((e) => (e.ctrlKey && e.key === '.'), () => {
    let k = window.prompt("🙈");
    k && setPk(k);
  });

  useKey((e) => (e.ctrlKey && e.key === ','), async () => {
    setDemoMode(!demoMode);
  });

  /// DEV ZONE END ///

  const [fm, fmState, fmAction]: [DeFileManager, State, any] = useDeFileManager(w3Provider, address, pk);

  return (fm && fmState && fmState.fm && fmState.directory) ? (
    <FileManagerContext.Provider value={{
      fm, ...fmState, ...fmAction, connectWallet, connectedAddress, demoMode, setAddress, getFileLink
    }}>
      { children}
    </FileManagerContext.Provider>
  ) :
    <div className="mx-auto max-h-[100vh] h-[100vh] overflow-hidden text-center">
      <main className="flex justify-center flex-col items-center">
        <button className="btn w-72 rounded-full" onClick={(e) => connectWallet()}>Connect</button>
        <p>OR</p>
        <label htmlFor="address">To browse, enter address</label>
        <Input className="px-4 py-2 w-96 m-0 rounded bg-gray-100 focus:border-0 focus:outline-none"
          type="text"
          placeholder="0x..."
        />
        <small className="text-gray-300 cursor-pointer focus:underline"
          onClick={(e) => setDemoMode(true)}>use demo</small>
      </main>
    </div>
}

export function useFileManagerContext() {
  return useContext(FileManagerContext);
}