//@ts-nocheck

import Web3 from 'web3';

import { useEffect, useState } from 'react';
import { DeFileManager, DeDirectory, DeFile } from '@/services/filesystem';

function useDeFileManager(web3: Object, address: string, privateKey?: string) {
  const [fm, setFm] = useState<DeFileManager | undefined>();

  useEffect(() => {
    if (!(web3 && address)) return;
    setFm(new DeFileManager(web3, address, privateKey));
    return () => { };
  }, [web3, address, privateKey]);

  const uploadFiles = (files: Array<File>) => {
    return files;
  }

  return [fm, uploadFiles];
}

export default useDeFileManager;