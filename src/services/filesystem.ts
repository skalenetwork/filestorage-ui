//@ts-nocheck

/**
 * @module
 * On-chain file manager for containerizing file management against users / chains
 * wrapping fs.js to serve as better isolation, type safety, reliability and intuitiveness
 * extendability to multi-fs and multi-contracts
 * consumable of stateful components in a similar manner as browser native APIs
 * @todo: rate limiting, cache management
 */

import FileStorage from '@skalenetwork/filestorage.js';
import { Buffer } from 'buffer';
import sortBy from 'lodash/sortBy';
import mime from 'mime/lite';

const KIND = {
  FILE: "file",
  DIRECTORY: "directory"
}

const ROLE = {
  OWNER: 'OWNER',
  ALLOCATOR: 'ALLOCATOR',
  CHAIN_OWNER: 'CHAIN_OWNER'
}

const OPERATON = {
  UPLOAD_FILE: 'UPLOAD_FILE',
  DELETE_FILE: 'DELETE_FILE',
  DELETE_DIRECTORY: 'DELETE_DIRECTORY',
  CREATE_DIRECTORY: 'CREATE_DIRECTORY'
}

/**
 * Interfacing based on simpified form of web FileSystem and FileSystem Access API
 * we start without file handles
 */

export type FileStorageDirectory = {
  name: string;
  storagePath: string;
  isFile: string;
}

export type FileStorageFile = {
  name: string;
  storagePath: string;
  isFile: string;
  size: number;
  status: number;
  uploadingProgress: number;
}

export type PrivateKey = string;
export type Address = string;
export type FilePath = string;

type FileStorageContract = {
  contract: Object
}

// @todo confirm and set return type where void
export type FileStorageClient = {
  contract: FileStorageContract;
  // core-actions
  uploadFile(address: Address, filePath: FilePath, fileBuffer: Buffer, privateKey?: PrivateKey): Promise<string>;
  deleteFile(address: Address, filePath: string, privateKey?: PrivateKey): Promise<void>; // confirmed
  createDirectory(address: Address, directoryPath: string, privateKey?: PrivateKey): Promise<{ storagePath: string }>;
  deleteDirectory(address: Address, directoryPath: string, privateKey?: PrivateKey): Promise<void>;
  // core-actions:public
  listDirectory(storagePath: string): Promise<Array<FileStorageDirectory | FileStorageFile>>;
  downloadToFile(storagePath: string): Promise<void>;
  downloadToBuffer(storagePath: string): Promise<Buffer>;
  // meta-actions
  reserveSpace(allocatorAddress: Address, addressToReserve: Address, reservedSpace: number, privateKey?: PrivateKey): Promise<void>;
  grantAllocatorRole(adminAddress: Address, allocatorAddress: Address, adminPrivateKey?: PrivateKey): Promise<void>;
  // state::address
  getReservedSpace(address: Address): Promise<{ reservedSpace: number }>;
  getOccupiedSpace(address: Address): Promise<{ occupiedSpace: number }>;
  // state::global
  getTotalReservedSpace(): Promise<{ reservedSpace: number }>;
  getTotalSpace(): Promise<{ space: number }>;
}

interface IDeDirectory {
  kind: string;
  name: string;
  path: string;
  entries(): Promise<Iterable<DeFile | DeDirectory>>;
}

interface IDeFile {
  kind: string;
  name: string;
  path: string;
  type: string;
  size: number;
  timestamp?: string;
}

// @todo bring in web3 types
interface IDeFileManager {
  address: string;
  account?: string;
  accountPrivateKey?: string;

  w3: Object;
  fs: FileStorageClient;
  contract: Object;

  rootDirectory(): DeDirectory;
  accountIsAdmin(): boolean;
  accountIsAllocator(): boolean;

  totalSpace(): Promise<BigInt>;
  reservedSpace(): Promise<BigInt>;
  totalReservedSpace(): Promise<BigInt>;
  occupiedSpace(): Promise<BigInt>;

  createDirectory(destDirectory: DeDirectory): Promise<DeDirectory>;
  deleteDirectory(directory: DeDirectory): Promise<boolean>;
  uploadFile(destDirectory: DeDirectory): Promise<string>;
  deleteFile(destDirectory: DeDirectory, file: DeFile): Promise<void>;

  downloadFile(file: DeFile): Promise<void>;
  search(inDirectory: DeDirectory, query: string): Array<DeFile | DeDirectory>;
}

function pathToRelative(storagePath: DePath) {
  const relative = storagePath.split("/").slice(1).join('/');
  console.log("pathToRelative::", storagePath, relative);
  return relative;
}

// @todo implement
function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const strArgs = JSON.stringify(args);
    const result = cache.get(strArgs);
  }
}


class DeDirectory implements IDeDirectory {
  kind: string;
  name: string;
  path: string;
  manager: DeFileManager;
  parent?: DeDirectory;

  constructor(data: FileStorageDirectory, manager: DeFileManager, parent?: DeDirectory) {
    this.kind = KIND.DIRECTORY;
    this.name = data.name;
    this.path = pathToRelative(data.storagePath);
    this.manager = manager;
    this.parent = parent;
  }

  entries() {
    return this.manager.entriesGenerator(this);
  }
}

// @todo enhancement:: enclose manager like DeDirectory to handle buffer
class DeFile implements IDeFile {
  kind: string;
  name: string;
  path: string;
  size: number;
  type: string;

  constructor(data: FileStorageFile) {
    this.kind = KIND.FILE;
    this.name = data.name;
    this.path = pathToRelative(data.storagePath);
    this.size = data.size;
    this.type = mime.getType(data.name);
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
  account: Address;
  accountPrivateKey?: string;

  w3: Object;
  fs: FileStorageClient;
  contract: { methods: {} };

  private rootDir: DeDirectory;

  dirLastAction: Object;

  constructor(
    w3: Object, address: Address, account?: Address, accountPrivateKey?: string
  ) {
    this.address = address.toLowerCase();
    this.account = account;
    this.accountPrivateKey = accountPrivateKey;

    this.w3 = w3;
    this.fs = new FileStorage(w3, true);
    this.contract = this.fs.contract.contract;

    this.dirLastAction = "";

    const addrWithoutPrefix = this.address.slice(2);

    this.rootDir = new DeDirectory({
      name: addrWithoutPrefix, // do-not-change
      storagePath: addrWithoutPrefix,
      isFile: 'false',
    }, this);
  }

  /**
   * File Manager maintains generatin
   * @param dirPath 
   */
  async * entriesGenerator(directory: DeDirectory): Promise<Iterable<DeDirectory | DeFile>> {
    let path = (directory.parent) ? this.rootDir.name + "/" + directory.path : this.rootDir.name;
    console.log("* entriesGenerator::", path, this);
    // hit remote
    const entries = await this.loadDirectory(path);

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
        yield new DeDirectory(item, this, directory);
      }
    }
  }

  rootDirectory() {
    return this.rootDir;
  }

  // @todo: implement
  async accountIsAdmin() {
    // chain owner?
  }

  // @todo: confirm response..
  async accountIsAllocator() {
    return await this.contract.methods.ALLOCATOR_ROLE().call();
  }

  async reserveSpace(address: Address, amount: number) {
    return this.fs.reserveSpace(this.account, address, amount, this.accountPrivateKey);
  }

  /**
   * @todo memoization w/ stale check
   */
  async loadDirectory(path: string): Promise<Array<FileStorageFile | FileStorageDirectory>> {
    const entries = await this.fs.listDirectory(`${path}`);
    console.log("fm:loadDirectory", entries);
    return sortBy(entries, (o => o.isFile === true));
  }

  async createDirectory(destDirectory: DeDirectory, name: string) {
    const path = (destDirectory.path === this.rootDir.path) ? name : `${destDirectory.path}/${name}`;
    console.log("path", path);
    const returnPath = await this.fs.createDirectory(this.account, path, this.accountPrivateKey);
    console.log("fm::createDirectory", returnPath);
    this.dirLastAction = `${OPERATON.CREATE_DIRECTORY}:${returnPath}`;
    return returnPath;
  }

  async deleteFile(destDirectory: DeDirectory, file: DeFile) {
    await this.fs.deleteFile(this.account, file.path, this.accountPrivateKey);
    return true;
  }

  async deleteDirectory(directory: DeDirectory) {
    await this.fs.deleteDirectory(this.account, directory.path, this.accountPrivateKey);
  }

  async uploadFile(destDirectory: DeDirectory, file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer(arrayBuffer);
    const uploadPath = (destDirectory.path === this.rootDir.path) ? file.name : `${destDirectory.path}/${file.name}`;
    let path;
    try {
      ;
      path = await this.fs.uploadFile(this.account, uploadPath, buffer, this.accountPrivateKey);
    } catch (e) {
      throw {
        file,
        error: e
      }
    }
    console.log("fm::uploadFile:", path);
    // makeshift - for outside watchers
    this.dirLastAction = `${OPERATON.UPLOAD_FILE}:${path}`;
    return path;
  }

  async downloadFile(file: DeFile) {
    return this.fs.downloadToFile(this.rootDir.name + "/" + file.path);
  }

  // depth-first
  private async iterateDirectory(directory: DeDirectory, onEntry: DeDirectory | DeFile) {
    for await (const entry of directory.entries()) {
      if (entry.kind === KIND.FILE) {
        onEntry(entry);
      }
      if (entry.kind === KIND.DIRECTORY) {
        onEntry(entry);
        await this.iterateDirectory(entry, onEntry);
      }
    }
  }

  // @todo: test and implement fuzzy query
  async search(inDirectory: DeDirectory, query: string) {
    const results = [];
    console.log("filemanager::query", query);
    if (!query) return results;
    const handleMatch = (fileOrDir: DeFile | DeDirectory) => {
      if (fileOrDir.name.includes(query.trim())) {
        results.push(fileOrDir);
      }
    }
    await this.iterateDirectory(inDirectory, handleMatch);
    console.log("filemanager::search_results", results);
    return results;
  }

  async occupiedSpace() {
    return (await this.fs.getOccupiedSpace(this.address));
  }

  async totalReservedSpace() {
    return (await this.fs.getTotalReservedSpace());
  }

  async totalSpace() {
    return (await this.fs.getTotalSpace());
  }

  async reservedSpace() {
    return (await this.fs.getReservedSpace(this.address));
  }
}

export {
  DeFileManager,
  DeFile,
  DeDirectory
}