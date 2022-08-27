
import config from '../config';
import type { ConfigType } from '../config';

import { utils } from '@/packages/filemanager';
const { sanitizeAddress } = utils;

import Web3 from 'web3';
import Web3Modal, { IProviderOptions } from 'web3modal';

import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useMount, useKey, useSessionStorage } from 'react-use';

import { DeFileManager, DeFile } from '@/packages/filemanager';
import useDeFileManager, { Action, State } from '@/context/useDeFileManager';

import WalletConnectProvider from "@walletconnect/web3-provider";
import Fortmatic from "fortmatic";

import { Input } from '@/components/common';
import CheckCircleIcon from '@heroicons/react/solid/CheckCircleIcon';

import { getRpcEndpoint, getFsEndpoint } from '../utils';

export type ContextType = State & Action & {
  connectWallet: Function;
  loadAddress: Function;
  getFileLink: Function;
  config: ConfigType;
};

const FileManagerContext = createContext<ContextType | undefined>(undefined);

const defaultChain = config.chains[0];

const RPC_ENDPOINT = getRpcEndpoint(defaultChain);
const CHAIN_ID = defaultChain.chainId; config.chains[0]

const baseProvider = new Web3.providers.HttpProvider(RPC_ENDPOINT);

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

let providerOptions: IProviderOptions = {};

if (config.keys.fortmaticKey) {
  providerOptions['fortmatic'] = {
    package: Fortmatic,
    options: {
      key: config.keys.fortmaticKey,
      network: {
        rpcUrl: RPC_ENDPOINT,
        chainId: CHAIN_ID
      }
    }
  }
}

if (config.keys.infuraId) {
  providerOptions['walletconnect'] = {
    package: WalletConnectProvider,
    options: config.keys.infuraId && {
      infuraId: config.keys.infuraId
    }
  }
}

const appConfig = config;

export function ContextWrapper({ children }: { children: ReactNode }) {

  const [config, setConfig] = useState<ConfigType>();

  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [w3Modal, setW3Modal] = useState<Web3Modal | undefined>();

  const [w3Provider, setW3Provider] = useState<any>();
  const [prevAddress, setPrevAddress] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [inputAddress, setInputAddress] = useState<string>("");

  const loadAddress = useCallback((newAddress: string, prev?: false) => {
    if (prev) {
      setPrevAddress(address);
      setAddress(prevAddress);
      return;
    }
    newAddress = sanitizeAddress(newAddress);
    if (!newAddress) {
      throw Error(`Address is invalid ${address}`);
    }
    setPrevAddress(address);
    setAddress(newAddress);
  }, [address, prevAddress]);

  const connectWallet = async () => {
    try {
      const web3Provider = await w3Modal?.connect();
      const web3 = new Web3(web3Provider);
      await addNetwork(web3, (config as ConfigType).chains[0]);
      setW3Provider(web3Provider);
      loadAddress(web3Provider.selectedAddress);
      console.log('web3Provider', web3Provider, 'web3Instance', web3);
    }
    catch (e) {
      console.log("Connecting Wallet", e);
      if (!w3Provider) {
        setW3Provider(baseProvider);
      }
    }
  }

  const getFileLink = useCallback((file: DeFile) => {
    let link = getFsEndpoint((config as ConfigType).chains[0], address, file.path);
    return link;
  }, [config, address]);

  useMount(() => {
    setConfig(appConfig);
  });

  // handle wallet operations
  useEffect(() => {
    if (!(w3Provider && w3Provider.on)) return;

    // subscribe to accounts change
    w3Provider.on("accountsChanged", (accounts: string[]) => {
      console.log("accountsChanged", accounts);
      if (accounts.length === 0) {
        setW3Provider(baseProvider);
      }
    });

    // subscribe to chainId change
    w3Provider.on("chainChanged", (chainId: number) => {
      console.log("chainChanged", chainId.toString());
      if (chainId.toString() !== CHAIN_ID) {
        setW3Provider(baseProvider);
      }
    });

    // subscribe to provider connection
    w3Provider.on("connect", (info: { chainId: number }) => {
      console.log("connect", info);
    });

    // subscribe to provider disconnection
    w3Provider.on("disconnect", (error: { code: number; message: string }) => {
      console.log("disconnect", error);
    });
  }, [w3Provider]);

  // deprecated demo mode
  useEffect(() => {
    if (demoMode) {
      setW3Provider(new Web3.providers.HttpProvider(RPC_ENDPOINT));
      return;
    }
    setW3Modal(new Web3Modal({
      disableInjectedProvider: false,
      providerOptions: providerOptions // required
    }));
  }, [demoMode]);

  // connect to wallet on launch
  useEffect(() => {
    if (!w3Modal) return;
    connectWallet();
  }, [w3Modal]);

  /// IMPLICIT PVT KEY SETTING START ///

  const [pk, setPk] = useSessionStorage<string>("SKL_pvtKey", undefined);
  useKey((e) => (e.ctrlKey && e.key === '.'), () => {
    let k = window.prompt("🙈");
    k && setPk(k);
  });

  /// IMPLICIT PVT KEY SETTING END ///

  const [fm, fmState, fmAction]:
    [DeFileManager, State, any] = useDeFileManager(w3Provider, address, pk);

  return (fm && fmState && fmState.directory && config) ? (
    <FileManagerContext.Provider value={{
      ...fmState, ...fmAction,
      demoMode,
      connectWallet,
      loadAddress,
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
            className="w-96 !rounded-r-none"
            type="text"
            placeholder="0x..."
            onChange={(e) => setInputAddress(e.target.value)}
          />
          <button
            className="btn rounded-l-none"
            onClick={(e) => loadAddress(inputAddress)}
          >
            <CheckCircleIcon className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
}

export function useFileManagerContext() {
  return useContext(FileManagerContext);
}