//@ts-ignore

import Web3 from 'web3';

import { createContext, useContext, useEffect, useState } from 'react';
import { useMount, useAsync, useAsyncFn } from 'react-use';
import { DeFileManager, DeDirectory, DeFile } from '../services/filesystem';
import { local } from 'web3modal';

type Context = {
  currentDirectory: DeDirectory;
  reservedSpace: number;
  occupiedSpace: number;
}

const FileManagerContext = createContext<Context & { fm: DeFileManager, setCurrentDirectory: Function } | null>(null);

export function ContextWrapper({ children }) {

  // local params
  const [address, setAddress] = useState<string>("");
  const [rpcEndpoint, setRpcEndpoint] = useState<string>("");

  const [fm, setFm] = useState<DeFileManager | undefined>(undefined);
  const [fmContext, setFmContext] = useState<Context | undefined>(undefined);

  useMount(() => {
    console.log("mount");
    setAddress('0x5A4AB05FBB140eb6A51e7D13a528A6Aa35a5ef4A');
    setRpcEndpoint('https://staging-v2.skalenodes.com/v1/roasted-thankful-unukalhai');
  });

  // set file manager initial context
  useEffect(() => {
    if (!(address.length && rpcEndpoint.length)) return;
    console.log("set fm");
    const w3 = new Web3.providers.HttpProvider(rpcEndpoint);
    const filemanager = new DeFileManager(w3, address, localStorage.getItem("SKL_pvtKey") || undefined);
    setFm(filemanager);
  }, [address, rpcEndpoint]);

  // explicit reactivity on tree changes within fm
  // @todo shady dependency-check: should instead tie to stale flag within fm
  useEffect(() => {
    if (!fm) return;
    (async () => {
      console.log("set fmContext");
      setFmContext({
        currentDirectory: fm.rootDirectory(),
        reservedSpace: await fm.reservedSpace(),
        occupiedSpace: await fm.occupiedSpace()
      });
    })();
  }, [fm]);

  return (fm && fmContext) ? (
    <FileManagerContext.Provider value={{
      fm, ...fmContext, setCurrentDirectory: (dir: DeDirectory) => {
        setFmContext({ ...fmContext, currentDirectory: dir })
      },
    }}>
      { children}
    </FileManagerContext.Provider>
  ) : <p>...</p>;
}

export function useFileManagerContext() {
  return useContext(FileManagerContext);
}