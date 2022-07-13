//@ts-nocheck

import Web3 from 'web3/dist/web3.min.js';
import Web3Modal from 'web3modal';

import { createContext, useContext, useEffect, useState } from 'react';
import { useMount, useKey, useLocalStorage } from 'react-use';

import { DeFileManager, DeDirectory, DeFile } from '@/services/filesystem';
import useDeFileManager, { State } from '@/context/useDeFileManager';

export type ContextType = State & {
  connectedAddress: string;
};

const FileManagerContext = createContext<ContextType>(undefined);

const USE_WALLET = true;
const RPC_ENDPOINT = 'https://staging-v2.skalenodes.com/v1/roasted-thankful-unukalhai';
const CHAIN_ID = '0x1dc0981d';
const TEST_ADDRESS = '0x5A4AB05FBB140eb6A51e7D13a528A6Aa35a5ef4A';

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

      const addChainResponse = await web3.currentProvider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: CHAIN_ID,
            chainName: "SKALE::roasted-thankful-unukalhai",
            rpcUrls: [RPC_ENDPOINT],
            blockExplorerUrls: ["https://roasted-thankful-unukalhai.explorer.staging-v2.skalenodes.com/"],
          },
        ],
      });
      console.log(addChainResponse);
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

  return (fmState && fmState.fm && fmState.directory) ? (
    <FileManagerContext.Provider value={{
      ...fmState, ...fmAction, connectedAddress, walletMode
    }}>
      { children}
    </FileManagerContext.Provider>
  ) : <p className="flex justify-center items-center">Oi</p>;
}

export function useFileManagerContext() {
  return useContext(FileManagerContext);
}