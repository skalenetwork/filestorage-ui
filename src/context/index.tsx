//@ts-nocheck

import config, { ConfigType } from '../config';

import Web3 from 'web3';
import Web3Modal from 'web3modal';

import { createContext, useContext, useEffect, useState } from 'react';
import { useMount, useKey, useLocalStorage } from 'react-use';

import { DeFileManager, DeDirectory, DeFile } from '@/services/filesystem';
import useDeFileManager, { Action, State } from '@/context/useDeFileManager';

export type ContextType = State & Action & {
  connectedAddress: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
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
  return `${data.protocol}://${data.nodeDomain}/fs/${data.sChainName}${(root) ? "/" + address : ""}${(path) ? "/" + path : ""}`
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

export function ContextWrapper({ children }) {

  // local params, w3 later to come from wallet-provider
  const [walletMode, setWalletMode] = useState<boolean>(false);
  const [w3Modal, setW3Modal] = useState<Web3Modal | undefined>();
  const [w3Provider, setW3Provider] = useState<{ request: Function } | undefined>();

  const [connectedAddress, setConnectedAddress] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  const connectWallet = async () => {
    try {
      const web3Provider = await w3Modal.connect();
      const web3 = new Web3(web3Provider);
      setConnectedAddress(web3Provider.selectedAddress);
      const chain = config.chains[0];
      await addNetwork(web3, chain);
      setW3Provider(web3Provider);
    } catch (e) {
      console.log("Connecting Wallet", e);
      setW3Provider(new Web3.providers.HttpProvider(RPC_ENDPOINT));
    }
  }

  useMount(() => {
    setAddress(TEST_ADDRESS);
  });

  useEffect(() => {
    if (!walletMode) {
      setW3Provider(new Web3.providers.HttpProvider(RPC_ENDPOINT));
      setConnectedAddress(TEST_ADDRESS);
      return;
    }
    setW3Modal(new Web3Modal({
      network: "testnet", // optional
      cacheProvider: true, // optional
      providerOptions: {} // required
    }));
  }, [walletMode]);

  useEffect(() => {
    if (!w3Modal) return;
    connectWallet();
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
    setWalletMode(!walletMode);
  });

  /// DEV ZONE END ///

  const [fm, fmState, fmAction]: [DeFileManager, State, any] = useDeFileManager(w3Provider, address, pk);

  return (fm && fmState && fmState.fm && fmState.directory) ? (
    <FileManagerContext.Provider value={{
      fm, ...fmState, ...fmAction, connectedAddress, walletMode, setAddress
    }}>
      { children}
    </FileManagerContext.Provider>
  ) : <p className="flex justify-center items-center">Ouch...</p>;
}

export function useFileManagerContext() {
  return useContext(FileManagerContext);
}