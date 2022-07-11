//@ts-nocheck

import Web3 from 'web3';
import { createContext, useContext, useEffect, useState } from 'react';
import { useMount, useKey, useLocalStorage } from 'react-use';

import { DeFileManager, DeDirectory, DeFile } from '@/services/filesystem';
import useDeFileManager, { State } from '@/context/useDeFileManager';

// import { local } from 'web3modal';

export type ContextType = State;

const FileManagerContext = createContext<ContextType>(undefined);

export function ContextWrapper({ children }) {

  // local params, w3 later to come from wallet-provider
  const [w3, setW3] = useState<Object | undefined>();
  const [address, setAddress] = useState<string>("");

  useMount(() => {
    const RPC_ENDPOINT = 'https://staging-v2.skalenodes.com/v1/roasted-thankful-unukalhai';
    setAddress('0x5A4AB05FBB140eb6A51e7D13a528A6Aa35a5ef4A');
    setW3(new Web3.providers.HttpProvider(RPC_ENDPOINT));
  });

  // shadowy key management.. DTTAH
  const [pk, setPk] = useLocalStorage("SKL_pvtKey", undefined);
  useKey((e) => (e.ctrlKey && e.key === '.'), () => {
    let k = window.prompt("🙈");
    k && setPk(k);
  });

  const [fm, fmState, fmAction]: [DeFileManager, State, any] = useDeFileManager(w3, address, pk);

  console.log("abay!?", fm, fmState, fmAction);

  return (fmState && fmState.fm && fmState.directory) ? (
    <FileManagerContext.Provider value={{
      ...fmState, ...fmAction
    }}>
      { children}
    </FileManagerContext.Provider>
  ) : <p className="flex justify-center items-center">Oi</p>;
}

export function useFileManagerContext() {
  return useContext(FileManagerContext);
}