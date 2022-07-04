// @ts-nocheck

/**
 * @module
 * On-chain file manager for containerizing file management against users / chains
 * wrapping fs.js to serve as better isolation, type safety, reliability and intuitiveness
 * extendability to multi-fs and multi-contracts
 * consumable of FileManagerView stateful component in a similar manner as browser native APIs
 */

import Web3 from 'web3';
import FileStorage from '@skalenetwork/filestorage.js';
import { Buffer } from 'buffer';

const KIND = {
  FILE: "file",
  DIRECTORY: "directory"
}

const ROLE = {
  ALLOCATOR: 'ALLOCATOR',
  CHAIN_OWNER: 'CHAIN_OWNER'
}

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
  size: number;
  status: number;
  uploadingProgress: number;
}

type PrivateKey = string;
type Address = string;
type FilePath = string;

type FileStorageContract = {
  contract: Object
}

// @todo confirm and set return type where void
type FileStorageClient = {
  contract: FileStorageContract;
  // core-actions
  uploadFile(address: Address, filePath: FilePath, fileBuffer: Buffer, privateKey?: PrivateKey): Promise<string>;
  deleteFile(address: Address, filePath: string, privateKey?: PrivateKey): Promise<void>;
  ceateDirectory(address: Address, directoryPath: string, privateKey?: PrivateKey): Promise<{ storagePath: string }>;
  deleteDirectory(address: Address, directoryPath: string, privateKey?: PrivateKey): Promise<void>;
  // core-actions:public
  listDirectory(storagePath: string): Promise<Array<FileStorageDirectory | FileStorageFile>>;
  downloadToFile(storagePath: string): Promise<void>;
  downloadToBuffer(storagePath: string): Promise<Buffer>;
  // meta-actions
  reserveSpace(allocatorAddress: Address, addressToReserve: Address, reservedSpace: string, privateKey?: PrivateKey): Promise<void>;
  grantAllocatorRole(adminAddress: Address, allocatorAddress: Address, adminPrivateKey?: PrivateKey): Promise<void>;
  // state
  getReservedSpace(address: Address): Promise<{ reservedSpace: number }>;
  getOccupiedSpace(): Promise<{ occupiedSpace: number }>;
  getTotalReservedSpace(): Promise<{ reservedSpace: number }>;
  getTotalSpace(): Promise<{ space: number }>;
}

interface IDeDirectory {
  kind: string;
  name: string;
  path: string;
  entries(): Iterable<DeFile | DeDirectory>;
}

interface IDeFile {
  kind: string;
  name: string;
  path: string;
  size: number;
  buffer(): ArrayBuffer;
}

// @todo bring in web3 types
interface IDeFileManager {
  address: string;
  isAllocator: boolean;

  w3: Object;
  fs: FileStorageClient;
  contract: Object;

  rootDirectory(): DeDirectory;
  ownerIsAdmin(): boolean;
  ownerIsAllocator(): boolean;

  totalSpace(): Promise<BigInt>;
  reservedSpace(): Promise<BigInt>;
  totalReservedSpace(): Promise<BigInt>;
  occupiedSpace(): Promise<BigInt>;

  createDirectory(destDirectory: DeDirectory): Promise<DeDirectory>;
  deleteDirectory(directory: DeDirectory): Promise<boolean>;
  uploadFile(destDirectory: DeDirectory): Promise<DeFile>;

  downloadFile(file: File): Promise<void>;
  search(inDirectory: DeDirectory, query: string): Array<DeFile | DeDirectory>;
}

class DeDirectory implements IDeDirectory {
  kind: string;
  name: string;
  path: string;
  entriesGenerator: Function;

  constructor(data: FileStorageDirectory, entriesGenerator: Function) {
    this.kind = KIND.DIRECTORY;
    this.name = data.name;
    this.path = data.storagePath;
    this.entriesGenerator = entriesGenerator;
  }

  entries() {
    return this.entriesGenerator(this.path);
  }
}

class DeFile implements IDeFile {
  kind: string;
  name: string;
  path: string;
  size: number;
  buffer: Function;

  constructor(data: FileStorageFile, buffer) {
    this.kind = KIND.FILE;
    this.name = data.name;
    this.path = data.storagePath;
    this.size = data.size;
    this.buffer = buffer;
  }
}

/**
 * Decentralized File Manager: Main high-level construct
 * @todo add path builder using this.address
 * @todo verify isFile values
 * @todo on:iteration could possibly consider extending FilestorageClient
 */

class DeFileManager implements IDeFileManager {

  address: Address;
  w3: Object;
  fs: FileStorageClient;
  contract: Object;
  private rootDir: DeDirectory;

  constructor(w3: Object, address: Address) {
    this.address = address;
    this.w3 = w3;
    this.fs = new FileStorage(w3, true);
    this.contract = this.fs.contract.contract;

    this.rootDir = new DeDirectory({
      name: this.address,
      storagePath: `${this.address}/`,
      isFile: "false"
    }, this.entriesGenerator);
  }

  /**
   * File Manager maintains generatin
   * @param dirPath 
   */
  private async * entriesGenerator(dirPath: FilePath): Promise<Iterable<DeDirectory | DeFile>> {
    // hit remote
    const entries = await this.loadDirectory(dirPath);

    // map to iterable files & directories
    for (let i in entries) {
      let item = entries[i];
      // make DeFile
      if (item.isFile) {
        item = <FileStorageFile>item;
        yield new DeFile(item);
      }
      // recursive: make DeDirectory with entries()
      else {
        item = <FileStorageDirectory>item;
        yield new DeDirectory(item, this.entriesGenerator);
      }
    }
  }

  rootDirectory() {
    return this.rootDir;
  }

  async ownerIsAdmin() {
    // chain owner?
  }

  async ownerIsAllocator() {
    await this.contract.methods.ALLOCATOR_ROLE().call();
  }

  async reserveSpace(address: Address, amount: number) {
    return;
  }

  /**
   * @todo memoization w/ stale check
   */
  private async loadDirectory(path: string): Promise<Array<FileStorageFile | FileStorageDirectory>> {
    const entries = await this.fs.listDirectory(`${this.address}${path}`);
    return entries;
  }

  async createDirectory(destDirectory: DeDirectory) {
    return await this.fs.ceateDirectory(this.address, destDirectory.path);
  }

  async deleteDirectory(directory: DeDirectory) {
    // to make this possible: in generator, set first entry as parent directory
    // use that reference to remove from iterator
  }

  async uploadFile(destDirectory: DeDirectory, file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer(arrayBuffer);
    return await this.fs.uploadFile(this.address, destDirectory.path, buffer);
  }

  async downloadFile(path: string) {
    return this.fs.downloadToFile(filepath);
  }

  async occupiedSpace() {
    return (await this.fs.getOccupiedSpace()).occupiedSpace;
  }

  async totalReservedSpace() {
    return (await this.fs.getTotalReservedSpace()).reservedSpace;
  }

  async totalSpace() {
    return (await this.fs.getTotalSpace()).space;
  }

  async reservedSpace() {
    return (await this.fs.getReservedSpace()).reservedSpace;
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

function getConnection(nodeEndpoint: string) {
  const w3 = new Web3.providers.HttpProvider(nodeEndpoint);
  const fs = new FileStorage(w3, true);
  return { w3, fs }
}

export {
  DeFileManager,
  DeFile,
  DeDirectory
}