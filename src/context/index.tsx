
import config from '../config';
import type { ConfigType } from '../config';

import Web3 from 'web3';
import Web3Modal from 'web3modal';

import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { useMount, useKey, useLocalStorage } from 'react-use';

import { DeFileManager, DeDirectory, DeFile } from '@/services/filemanager';
import useDeFileManager, { Action, State } from '@/context/useDeFileManager';

import WalletConnectProvider from "@walletconnect/web3-provider";
import Fortmatic from "fortmatic";

import { Button, Modal, Progress, Input } from '@/components/common';
import CheckCircleIcon from '@heroicons/react/solid/CheckCircleIcon';

export type ContextType = State & Action & {
  connectWallet: Function;
  updateAddress: Function;
  getFileLink: Function;
  config: ConfigType;
};

const FileManagerContext = createContext<ContextType | undefined>(undefined);

const getRpcEndpoint = (data: ConfigType['chains'][0]) => {
  return `${data.protocol}://${data.nodeDomain}/${data.version}/${data.sChainName}`
}

const getFsEndpoint = (data: ConfigType['chains'][0], address: string = "", path: string = "") => {
  let root = address.toLowerCase();
  if (root.slice(0, 2) === "0x") {
    root = root.slice(2);
  }
  return `${data.protocol}://${data.nodeDomain}/fs/${data.sChainName}${(root) ? "/" + root : ""}${(path) ? "/" + path : ""}`;
}

const RPC_ENDPOINT = getRpcEndpoint(config.chains[0]);
const CHAIN_ID = config.chains[0].chainId;
const TEST_ADDRESS = '0x5A4AB05FBB140eb6A51e7D13a528A6Aa35a5ef4A';

const addNetwork = (web3: any, chain: ConfigType['chains'][0]) => {
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

const appConfig = config;

export function ContextWrapper({ children }: { children: ReactNode }) {

  const [config, setConfig] = useState<ConfigType>();

  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [w3Modal, setW3Modal] = useState<Web3Modal | undefined>();

  const [w3Provider, setW3Provider] = useState<any>();
  const [address, setAddress] = useState<string>("");
  const [inputAddress, setInputAddress] = useState<string>("");

  const updateAddress = (address: string) => {
    address = (address.slice(0, 2) === "0x") ? address : "0x" + address;
    if (!Web3.utils.isAddress(address)) {
      throw Error(`Address is invalid ${address}`);
    }
    setAddress(address);
  }

  const connectWallet = async () => {
    try {
      const web3Provider = await w3Modal?.connect();
      const web3 = new Web3(web3Provider);
      setW3Provider(web3Provider);
      updateAddress(web3Provider.selectedAddress);
      await addNetwork(web3, (config as ConfigType).chains[0]);
      console.log('web3Provider', web3Provider, 'web3Instance', web3);
    }

    catch (e) {
      console.log("Connecting Wallet", e);
      if (!w3Provider) {
        setW3Provider(new Web3.providers.HttpProvider(RPC_ENDPOINT));
      }
    }
  }

  const getFileLink = (file: DeFile) => {
    let link = getFsEndpoint((config as ConfigType).chains[0], address, file.path);
    console.log(file, link);
    return link;
  }

  useMount(() => {
    console.log(appConfig);
    setConfig(appConfig);
  });

  // por demo
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

  // for wallet connect on launch
  useEffect(() => {
    if (!w3Modal) return;
    connectWallet();
    console.log('w3Modal', w3Modal);
  }, [w3Modal]);

  /// DEV ZONE START ///

  // shadowy key management.. DTTAH
  const [pk, setPk] = useLocalStorage<string>("SKL_pvtKey", undefined);
  useKey((e) => (e.ctrlKey && e.key === '.'), () => {
    let k = window.prompt("🙈");
    k && setPk(k);
  });

  // demo mode shortcut
  useKey((e) => (e.ctrlKey && e.key === ','), async () => {
    setDemoMode(!demoMode);
  });

  /// DEV ZONE END ///

  const [fm, fmState, fmAction]:
    [DeFileManager, State, any] = useDeFileManager(w3Provider, address, pk);

  return (fm && fmState && fmState.directory && config) ? (
    <FileManagerContext.Provider value={{
      ...fmState, ...fmAction,
      demoMode,
      connectWallet,
      updateAddress,
      getFileLink,
      config
    }}>
      { children}
    </FileManagerContext.Provider>
  ) :
    <div className="mx-auto max-h-[100vh] h-[100vh] overflow-hidden text-center">
      <main className="flex justify-center flex-col items-center">
        <button className="btn w-72 rounded-full" onClick={(e) => connectWallet()}>Connect</button>
        <p>OR</p>
        <label htmlFor="address">To browse, enter address</label>
        <div className="flex justify-center items-center">
          <Input
            className="px-4 py-2 w-96 m-0 rounded bg-gray-100 focus:border-0 focus:outline-none"
            type="text"
            placeholder="0x..."
            onChange={(e) => setInputAddress(e.target.value)}
          />
          <button
            className="btn"
            onClick={(e) => updateAddress(inputAddress)}
          >
            <CheckCircleIcon className="w-5 h-5" />
          </button>
        </div>
        <small
          className="text-gray-300 cursor-pointer focus:underline"
          onClick={(e) => setDemoMode(true)}>
          use demo
        </small>
      </main>
    </div>
}

export function useFileManagerContext() {
  return useContext(FileManagerContext);
}