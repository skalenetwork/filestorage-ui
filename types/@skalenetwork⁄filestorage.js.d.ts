declare module '@skalenetwork/filestorage.js' {

  type FilePath = string;
  type Address = string;
  type PrivateKey = string;

  export type FileStorageContract = {
    contract: {
      methods: any
    }
  }

  export type FileStorageDirectory = {
    name: string;
    storagePath: string;
    isFile: boolean;
  }

  export type FileStorageFile = {
    name: string;
    storagePath: string;
    isFile: boolean;
    size: number;
    status: number;
    uploadingProgress: number;
  }

  export class FilestorageContract {
  }

  export default class Filestorage {

    contract: FileStorageContract;

    constructor(
      web3: any,
      enableLogs: boolean): unknown;

    // core-actions:authorized

    uploadFile(
      address: Address,
      filePath: FilePath,
      fileBuffer: Buffer,
      privateKey?: PrivateKey): Promise<string>;

    deleteFile(
      address: Address,
      filePath: string,
      privateKey?: PrivateKey): Promise<void>; // confirmed

    createDirectory(
      address: Address,
      directoryPath: string,
      privateKey?: PrivateKey): Promise<string>;

    deleteDirectory(
      address: Address,
      directoryPath: string,
      privateKey?: PrivateKey): Promise<void>;

    // core-actions:public

    listDirectory(
      storagePath: string): Promise<Array<FileStorageDirectory | FileStorageFile>>;

    downloadToFile(
      storagePath: string): Promise<void>;

    downloadToBuffer(
      storagePath: string): Promise<Buffer>;

    // meta-actions

    reserveSpace(
      allocatorAddress: Address,
      addressToReserve: Address,
      reservedSpace: number,
      privateKey?: PrivateKey): Promise<void>;

    grantAllocatorRole(
      adminAddress: Address,
      allocatorAddress: Address,
      adminPrivateKey?: PrivateKey): Promise<void>;

    // state::address

    getReservedSpace(
      address: Address): Promise<BigInt>;

    getOccupiedSpace(
      address: Address): Promise<BigInt>;
    // state::global

    getTotalReservedSpace(): Promise<BigInt>;

    getTotalSpace(): Promise<BigInt>;
  }
}