// mono-module for early integration of fs and building types

import Web3 from 'web3';
import { FileStorage } from '@skalenetwork/filestorage.js';

/**
 * Interfacing based on simpified form of web FileSystem and FileSystem Access API
 * we start without file handles
 */

type FileStorageDirectory = {
  name: string;
  storagePath: string;
  isFile: string;
}

type FileStorageFile = {
  name: string;
  storagePath: string;
  isFile: string;
  size: BigInt;
  status: number;
  uploadingProgress: number;
}

// @todo confirm  and set return type where void
type FileStorageSDK = {
  uploadFile(): string;
  downloadToFile(): void;
  downloadToBuffer(): Buffer;
  deleteFile(): void;
  ceateDirectory(): { storagePath: string };
  deleteDirectory(): void;
  listDirectory(): Array<FileStorageDirectory | FileStorageFile>;
  reserveSpace(): void;
  grantAllocatorRole(): void;
  getReservedSpace(): { reservedSpace: BigInt };
  getOccupiedSpace(): { occupiedSpace: BigInt };
  getTotalReservedSpace(): { reservedSpace: BigInt };
  getTotalSpace(): { space: BigInt };
}

interface DeDirectory {
  kind: string;
  name: string;
  path: string;
  entries(): Iterable<DeFile | DeDirectory>;
}

interface DeFile {
  king: string;
  name: string;
  path: string;
  size: number;
  arrayBuffer(): ArrayBuffer;
}

// @todo bring in web3 types
interface IDeFileManager {
  address: string;
  rpcEndpoint: string;
  isAllocator: boolean;

  w3: Object;
  fs: FileStorageSDK;

  totalSpace(): BigInt;
  reservedSpace(): BigInt;
  totalReservedSpace(): BigInt;
  occupiedSpace(): BigInt;

  rootDirectory(): DeDirectory;

  downloadFile(filepath: string): void;
  search(query: string): Array<DeFile | DeDirectory>;
}

/**
 * On-chain file manager for containerizing file management against users / chains
 * wrapping fs.js to serve as better isolation, type safety, reliability and intuitiveness
 * extendability to multi-fs and multi-contracts
 * consumable of FileManagerView stateful component
 */

class DeFileManager implements IDeFileManager {

  rpcEndpoint: string;
  w3: Object;
  fs: FileStorageSDK;

  constructor(rpcEndpoint: string) {
    this.rpcEndpoint = rpcEndpoint;
    const { w3, fs } = getConnection(rpcEndpoint);
    this.w3 = w3;
    this.fs = fs;
  }

  rootDirectory() {
    return;
  }

  async totalSpace() {
    return await this.fs.getTotalSpace();
  }
}

// copy from earlier prototype
// @todo refactor to well-supported APIs
// likely move to own provider, then made available in action components
const localFs = {
  traverseDirectoryFiles: async function (dirHandle) {
    // console.log(dirHandle);
    let files = [];
    let totalSize = 0;
    for await (let fileLike of dirHandle) {
      if (fileLike[1].kind !== "file") continue;

      const file = await fileLike[1].getFile();
      const buffer = new Uint8Array(await file.arrayBuffer());
      files.push({
        name: file.name,
        lastModified: file.lastModified,
        size: file.size,
        type: file.type,
        buffer
      });
      totalSize += file.size;
    }
    return [totalSize, files];
  },
  loadDirectory: async function () {
    const dirHandle = await window.showDirectoryPicker();
    console.log(dirHandle);
    return dirHandle;
  }
}

function getConnection(nodeEndpoint) {
  const w3 = new Web3.providers.HttpProvider(nodeEndpoint);
  const fs = new FileStorage(w3, true);
  return { w3, fs }
}

export {
  DeFileManager,
  localFs
}