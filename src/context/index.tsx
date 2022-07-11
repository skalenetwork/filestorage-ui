//@ts-nocheck

import Web3 from 'web3';
import { createContext, useContext, useEffect, useState } from 'react';
import { useMount, useKey, useLocalStorage } from 'react-use';

import { DeFileManager, DeDirectory, DeFile } from '@/services/filesystem';
import useDeFileManager from '@/context/useDeFileManager';

// import { local } from 'web3modal';

type Context = {
  currentDirectory: DeDirectory;
  reservedSpace: number;
  occupiedSpace: number;
}

const FileManagerContext = createContext<Context & { fm: DeFileManager, setCurrentDirectory: Function } | null>(null);

export function ContextWrapper({ children }) {

  // local params
  const [w3, setW3] = useState<Object | undefined>();
  const [address, setAddress] = useState<string>("");

  // const [fm, setFm] = useState<DeFileManager | undefined>(undefined);
  const [fmContext, setFmContext] = useState<Context | undefined>(undefined);

  useMount(() => {
    const RPC_ENDPOINT = 'https://staging-v2.skalenodes.com/v1/roasted-thankful-unukalhai';
    setAddress('0x5A4AB05FBB140eb6A51e7D13a528A6Aa35a5ef4A');
    setW3(new Web3.providers.HttpProvider(RPC_ENDPOINT));
  });

  // shadowy key management
  const [pk, setPk] = useLocalStorage("SKL_pvtKey", undefined);
  useKey((e) => (e.ctrlKey && e.key === '.'), () => {
    let k = window.prompt("🙈");
    if (k) {
      setPk(k);
    }
  });

  const [fm] = useDeFileManager(w3, address, pk);

  // explicit reactivity on tree changes within fm
  // @todo shady dependency-check: should instead tie to stale flag within fm
  useEffect(() => {
    if (!fm) return;
    console.log("fm changed", fm);
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