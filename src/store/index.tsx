// @ts-ignore

import Web3 from 'web3';

import { createContext, useContext, useEffect, useState } from 'react';
import { useMount, useAsync } from 'react-use';
import { DeFileManager, DeDirectory, DeFile } from '../services/filesystem';

const FileManagerContext = createContext<{ fm: DeFileManager, currentDirectory: DeDirectory } | null>(null);

export function ContextWrapper({ children }) {

  // local params
  const [address, setAddress] = useState('0x5A4AB05FBB140eb6A51e7D13a528A6Aa35a5ef4A');
  const [rpcEndpoint, setRpcEndpoint] = useState('https://staging-v2.skalenodes.com/v1/roasted-thankful-unukalhai');

  const [fm, setFm] = useState<DeFileManager | undefined>(undefined);
  const [fmContext, setFmContext] = useState<{
    currentDirectory: DeDirectory,
    totalSpace: number
  } | undefined>(undefined);

  // set file manager initial context
  useEffect(() => {
    if (!(address.length && rpcEndpoint.length)) return;
    const w3 = new Web3.providers.HttpProvider(rpcEndpoint);
    const filemanager = new DeFileManager(w3, address);
    setFm(filemanager);
  }, [address, rpcEndpoint]);

  // explicit reactivity on tree changes within fm
  // @todo shady dependency-check: should instead tie to stale flag within fm
  useAsync(async () => {
    if (!fm) return;
    setFmContext({
      currentDirectory: fm.rootDirectory(),
      totalSpace: await fm.totalSpace()
    });
  }, [fm]);

  return (fmContext && fm) ? (
    <FileManagerContext.Provider value={{ fm, ...fmContext }}>
      { children}
    </FileManagerContext.Provider>
  ) : null;
}

export function useFileManagerContext() {
  return useContext(FileManagerContext);
}