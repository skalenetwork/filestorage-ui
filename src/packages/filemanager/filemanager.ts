// replace with already published or later published equivalent
import { ContractContext } from '@/packages/types/abi/filestorage-1.0.1';

/**
 * @module
 * On-chain file manager for containerizing file management against users / chains
 * wrapping fs.js to serve as better isolation, type safety, reliability and intuitiveness
 * extendability to multi-fs and multi-contracts
 * consumable of stateful components in a similar manner as browser native APIs
 * @todo: rate limiting, cache management
 */

// if searching remains delegated to client-side:
// later improvement iterations can integrate file trie as index, with current iterator adapting the change
// as well considering storage options with IndexDB, and advanced uploads management
// pre-req: standardization of paths as spec from systems up to client-side, exported across SDKs

import FileStorage, {
  FileStorageDirectory,
  FileStorageFile,
} from '@skalenetwork/filestorage.js';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import { Buffer } from 'buffer';
//@ts-ignore
import sortBy from 'lodash/sortBy';
//@ts-ignore
import mime from 'mime/lite';
import Fuse from 'fuse.js';

import utils from './utils';
const { sanitizeAddress } = utils;

const KIND = {
  FILE: "file",
  DIRECTORY: "directory"
}

const ROLE = {
  OWNER: 'OWNER',
  ALLOCATOR: 'ALLOCATOR',
  CHAIN_OWNER: 'CHAIN_OWNER'
}

const OPERATION = {
  UPLOAD_FILE: 'UPLOAD_FILE',
  DELETE_FILE: 'DELETE_FILE',
  DELETE_DIRECTORY: 'DELETE_DIRECTORY',
  CREATE_DIRECTORY: 'CREATE_DIRECTORY',
  GRANT_ROLE: 'GRANT_ROLE',
  RESERVE_SPACE: 'RESERVE_SPACE'
}

// @todo: improve error coverage, segment some to state, extend with codes
const ERROR = {
  NO_ACCOUNT: "File manager has no signer account",
  NOT_AUTHORIZED: "Signer not authorized to perform the operation",
  BUSY: "File system is currently busy",
  UNKNOWN: "Something went wrong",
  NO_NET: "You are currently offline"
}

/**
 * Interfacing based on simpified form of web FileSystem and FileSystem Access API
 * we start without file handles
 */

export type FilePath = string;
export type DePath = string;
export type Address = string;
export type PrivateKey = string;

export interface IDeDirectory {
  kind: string;
  name: string;
  path: DePath;
  entries(): Promise<Iterable<IDeFile | IDeDirectory>>;
}

export interface IDeFile {
  kind: string;
  name: string;
  path: DePath;
  type: string;
  size: number;
  timestamp?: string;
  arrayBuffer(): Promise<ArrayBuffer>;
}

// DePath start
// path transforms to be replaced with new DePath prototype here

function pathToRelative(storagePath: string) {
  return storagePath.split("/").slice(1).join('/');
}

/// DePath end

class DeDirectory implements IDeDirectory {
  kind: string;
  name: string;
  path: DePath;
  manager: DeFileManager;
  parent?: DeDirectory;

  constructor(
    data: FileStorageDirectory,
    manager: DeFileManager,
    parent?: DeDirectory
  ) {
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

class DeFile implements IDeFile {
  kind: string;
  name: string;
  path: DePath;
  size: number;
  type: string;
  manager: DeFileManager;

  constructor(
    data: FileStorageFile,
    manager: DeFileManager
  ) {
    this.kind = KIND.FILE;
    this.name = data.name;
    this.path = pathToRelative(data.storagePath);
    this.size = data.size;
    this.type = mime.getType(data.name);
    this.manager = manager;
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const buffer = await this.manager.fs
      .downloadToBuffer(
        this.manager.rootDirectory().name + "/" + this.path
      );
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset, buffer.byteOffset + buffer.byteLength
    );
    return arrayBuffer;
  }
}

export type FileOrDir = DeDirectory | DeFile;

export type OperationResponse = {
  type: string;
  status: string;
  result?: any
};

/**
 * Decentralized File Manager: Main high-level construct
 * @todo add path builder using this.address
 * @todo could possibly consider extending or melding with filestorage.js
 */

class DeFileManager {

  address: Address;
  account?: Address;
  accountPrivateKey?: PrivateKey;

  w3: Object;
  fs: FileStorage;
  contract: ContractContext;

  private rootDir: DeDirectory;

  dirLastAction: Object;
  cache: { [key: string]: (FileStorageDirectory | FileStorageFile)[] };

  store: BehaviorSubject<Observable<() => Promise<OperationResponse>>>;
  bus: Observable<any>;

  constructor(
    w3: Object,
    address: Address,
    account?: Address,
    accountPrivateKey?: PrivateKey
  ) {
    this.address = sanitizeAddress(address, { checksum: false });
    this.account = sanitizeAddress(account);
    this.accountPrivateKey = accountPrivateKey;

    this.w3 = w3;
    this.fs = new FileStorage(w3, true);
    this.contract = (this.fs.contract.contract as unknown) as ContractContext;

    this.dirLastAction = "";
    this.cache = {};
    this.store = new BehaviorSubject(of(() => Promise.resolve({
      type: 'INIT',
      status: 'success',
      result: {}
    } as OperationResponse)));

    this.bus = this.store.pipe(
      concatMap(async (event, index) => {
        console.log("fm:bus:concatMap::event", event, index);
        const callable = await event.toPromise();
        const returnValue = await (callable && callable());
        console.log("fm:bus:concatMap::event:::returnValue", returnValue);
        returnValue.result.destDirectory && this.purgeCache(returnValue.result.destDirectory);
        return returnValue;
      })
    );

    const addrWithoutPrefix = sanitizeAddress(address, {
      checksum: false,
      prefix: false
    });

    this.rootDir = new DeDirectory({
      name: addrWithoutPrefix, // do-not-change: heavy dependency
      storagePath: addrWithoutPrefix,
      isFile: false,
    }, this);
  }

  private purgeCache(directory?: DeDirectory, reload = true) {
    let path = directory && ((directory.parent) ? this.rootDir.name + "/" + directory.path : this.rootDir.name);
    if (path) {
      delete this.cache[path];
      this.loadDirectory(path);
    } else {
      this.cache = {};
      this.preloadDirectories(this.rootDir);
    }
    console.log("filemanager::purgeCache:path", path);
  }

  private queueOp(
    key: string,
    promise: Promise<any>,
    onSuccess?: (res: any) => OperationResponse['result'],
    onError?: (res: any) => OperationResponse['result']
  ) {
    this.store.next(of(() => promise
      .then((res) => ({
        type: key,
        status: 'success',
        result: onSuccess && onSuccess(res)
      }))
      .catch((err) => ({
        type: key,
        status: 'error',
        result: onError && onError(err)
      }))
    ));
  }

  absolutePath(fileOrDir: FileOrDir): string {
    if (fileOrDir.kind === KIND.FILE) {
      return this.rootDir.name + '/' + fileOrDir.path;
    }
    if (fileOrDir.kind === KIND.DIRECTORY) {
      return this.rootDir.name + (((fileOrDir as DeDirectory).parent) ? "/" + fileOrDir.path : "");
    }
    return '';
  }

  //@ts-ignore
  async * entriesGenerator(directory: DeDirectory): Promise<Iterable<FileOrDir>> {
    let path = this.absolutePath(directory);

    // hit remote
    const entries = await this.loadDirectory(path);

    // map to iterable files & directories
    for (let i in entries) {
      let item = entries[i];
      // make DeFile
      if (item.isFile) {
        item = <FileStorageFile>item;
        yield new DeFile(item as FileStorageFile, this);
      }
      // recursive: make DeDirectory with entries()
      else {
        yield new DeDirectory(item as FileStorageDirectory, this, directory);
      }
    }
  }

  rootDirectory() {
    return this.rootDir;
  }

  loadAddress(
    address: Address = (this.account || "")
  ) {
    if (address) {
      this.address = sanitizeAddress(address, { checksum: false });
    }
  }

  // @todo: validate correctness
  async accountIsAdmin() {
    if (!this.account)
      return false;
    const ADMIN_ROLE = await this.contract.methods.DEFAULT_ADMIN_ROLE().call();
    return await this.contract.methods.hasRole(ADMIN_ROLE, this.account).call();
  }

  async accountIsAllocator() {
    if (!this.account)
      return false;
    const ALLOCATOR_ROLE = await this.contract.methods.ALLOCATOR_ROLE().call();
    return await this.contract.methods.hasRole(ALLOCATOR_ROLE, this.account).call();
  }

  async reserveSpace(address: Address, amount: number) {
    if (!this.account)
      throw Error(ERROR.NO_ACCOUNT);
    const signer = this.account || "";
    this.queueOp(
      OPERATION.RESERVE_SPACE,
      this.fs.reserveSpace(signer, address, amount, this.accountPrivateKey),
    );
  }

  async grantRole(address: Address, role: string = ROLE.ALLOCATOR) {

    if (!this.account)
      throw Error(ERROR.NO_ACCOUNT);
    const signer = this.account || "";

    if (!(await this.accountIsAdmin())) {
      throw Error(ERROR.NOT_AUTHORIZED);
    }
    if (role) {
      this.queueOp(
        OPERATION.GRANT_ROLE,
        this.fs.grantAllocatorRole(signer, address, this.accountPrivateKey)
      );
    }
  }

  /**
   * Load directory listing by absolute path, supported by cache
   * @param path 
   * @param noCache 
   */
  async loadDirectory(
    path: FileStorageDirectory['storagePath'],
    noCache: boolean = false
  ): Promise<Array<FileStorageFile | FileStorageDirectory>> {
    let entries;
    if (this.cache[path] && !noCache) {
      entries = this.cache[path];
    } else {
      entries = await this.fs.listDirectory(`${path}`);
      this.cache[path] = entries;
    }
    return sortBy(entries, ((o: FileStorageDirectory | FileStorageFile) => o.isFile === true));
  }

  /**
   * Create a directory within destination directory
   * @param destDirectory 
   * @param name 
   */
  async createDirectory(destDirectory: DeDirectory, name: string): Promise<void> {
    if (!this.account)
      throw Error(ERROR.NO_ACCOUNT);
    const signer = this.account || "";
    const path = (destDirectory.path === this.rootDir.path)
      ? name
      : `${destDirectory.path}/${name}`;

    this.queueOp(
      OPERATION.CREATE_DIRECTORY,
      this.fs.createDirectory(signer, path, this.accountPrivateKey),
      (storagePath) => ({
        destDirectory,
        directory: new DeDirectory({ storagePath, name, isFile: false }, this, destDirectory)
      })
    );
  }

  /**
   * Delete a file in destination directory
   * @param destDirectory 
   * @param file 
   */
  async deleteFile(destDirectory: DeDirectory, file: DeFile): Promise<void> {
    if (!this.account)
      throw Error(ERROR.NO_ACCOUNT);
    const signer = this.account || "";
    this.queueOp(
      OPERATION.DELETE_FILE,
      this.fs.deleteFile(signer, file.path, this.accountPrivateKey),
      (res) => ({
        destDirectory,
        file
      }),
      (err) => ({
        error: err
      })
    )
  }

  /**
   * Delete a directory 
   * @param directory 
   */
  async deleteDirectory(directory: DeDirectory): Promise<void> {
    if (directory.path === this.rootDir.path)
      throw Error(ERROR.UNKNOWN);
    if (!this.account)
      throw Error(ERROR.NO_ACCOUNT);
    const signer = this.account || "";

    this.queueOp(
      OPERATION.DELETE_DIRECTORY,
      this.fs.deleteDirectory(signer, directory.path, this.accountPrivateKey),
      (res) => ({
        destDirectory: directory.parent,
        directory
      }),
      (err) => ({
        error: err
      })
    );
  }

  /**
   * Upload a file in destination directory using File object
   * @param destDirectory 
   * @param file 
   */
  async uploadFile(destDirectory: DeDirectory, file: File) {
    if (!this.account)
      throw Error(ERROR.NO_ACCOUNT);
    const signer = this.account || "";

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadPath = (destDirectory.path === this.rootDir.path)
      ? file.name
      : `${destDirectory.path}/${file.name}`;

    this.queueOp(
      OPERATION.UPLOAD_FILE,
      this.fs.uploadFile(signer, uploadPath, buffer, this.accountPrivateKey),
      (storagePath) => ({
        destDirectory,
        file: new DeFile({
          storagePath,
          name: file.name,
          isFile: true,
          size: file.size,
          status: 2,
          uploadingProgress: 100
        }, this)
      }),
      (err) => ({
        destDirectory,
        file,
        error: err,
      })
    );
    this.dirLastAction = `${OPERATION.UPLOAD_FILE}`; // placeholder for events
  }

  /**
   * Download a file
   * @param file 
   */
  async downloadFile(file: DeFile) {
    return this.fs.downloadToFile(this.rootDir.name + "/" + file.path);
  }

  /**
   * Iterate a directory by depth and perform list or item operations
   * @param directory 
   * @param onEntry 
   * @param asArray 
   * @param depth 
   */
  private async iterateDirectory(
    directory: DeDirectory,
    onEntry: (entry: FileOrDir | Array<FileOrDir>) => any,
    asArray: boolean = false,
    depth: number = Infinity
  ): Promise<void> {

    let level = 0;

    const iterator = async (
      directory: DeDirectory,
      onEntry: (entry: FileOrDir | Array<FileOrDir>) => any,
      asArray: boolean = false
    ): Promise<void> => {
      let all = [];
      //@ts-ignore
      for await (const entry of directory.entries()) {
        if ((entry.kind === KIND.DIRECTORY) && (level < depth)) {
          await iterator(entry, onEntry);
        }
        (asArray) ? all.push(entry) : onEntry(entry);
      }
      if (asArray) {
        onEntry(all);
      }
      level++;
    }

    return iterator(directory, onEntry, asArray);
  }

  async preloadDirectories(startDirectory: DeDirectory) {
    await this.iterateDirectory(
      startDirectory,
      (entry) => { },
    );
    console.log("filemanager::preloadDirectories: complete");
  }

  /**
   * Fuzzy search across the directory tree with a starting node
   * @param inDirectory 
   * @param query 
   */
  async search(inDirectory: DeDirectory, query: string) {

    let results: Array<FileOrDir> = [];

    if (!query) return results;

    const handleList = (list: any) => {
      const fuse = new Fuse(list, { keys: ['name'] });
      const result = fuse.search(query.trim()).map(r => r.item) as FileOrDir[];
      results = [...results, ...result];
    }

    await this.iterateDirectory(inDirectory, handleList, true);
    console.log("filemanager::search:results", results);
    return results;
  }

  /**
   * Get space occupied by the current address
   */
  async occupiedSpace() {
    return (await this.fs.getOccupiedSpace(this.address));
  }

  /**
   * Get space reserved for the current address
   */
  async reservedSpace() {
    return (await this.fs.getReservedSpace(this.address));
  }

  /**
   * Get space reserved on the entire file system
   */
  async totalReservedSpace() {
    return (await this.fs.getTotalReservedSpace());
  }

  /**
   * Get total space available on the file system
   */
  async totalSpace() {
    return (await this.fs.getTotalSpace());
  }
}

export {
  OPERATION,
  DeFileManager,
  DeFile,
  DeDirectory
}