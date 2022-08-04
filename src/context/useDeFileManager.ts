import { useEffect, useLayoutEffect, useReducer, useState } from 'react';
import { useInterval } from 'react-use';
import { DeFileManager, DeDirectory, DeFile, DePath, FileOrDir } from '@/services/filemanager';
import Web3 from 'web3';
import type { FileStorageFile } from '@skalenetwork/filestorage.js';

export type FileStatus = {
  file: File;
  dePath: DePath;
  progress: number;
  error?: {
    name: string;
    message: string;
    stack: string;
  };
};

export type State = {
  isAuthorized: boolean;
  accountRoles: [],
  fm: DeFileManager | undefined;
  directory: DeDirectory | undefined;
  listing: Array<FileOrDir>;
  searchListing: Array<FileOrDir>;
  isSearching: boolean;
  isCreatingDirectory: boolean;
  isLoadingDirectory: boolean;
  reservedSpace: number;
  occupiedSpace: number;
  totalUploadCount: number;
  activeUploads: Map<DePath, Array<FileStatus>>;
  completedUploads: Map<DePath, Array<FileStatus>>;
  failedUploads: Map<DePath, Array<FileStatus>>;
};

export type Action = {
}

export const ROLE = {
  ALLOCATOR: 'ALLOCATOR',
  ADMIN: 'ADMIN'
}

// current operations can be better managed

const initialState: State = {
  isAuthorized: false,
  accountRoles: [],
  fm: undefined,
  directory: undefined,
  listing: [],
  searchListing: [],
  isSearching: false,
  isCreatingDirectory: false,
  isLoadingDirectory: false,
  reservedSpace: 0,
  occupiedSpace: 0,
  totalUploadCount: 0,
  activeUploads: new Map(),
  completedUploads: new Map(),
  failedUploads: new Map(),
};

const ACTION = {

  INITIALIZE: 'INITIALIZE',
  SET_ROLES: 'SET_ROLES',
  SET_AUTHORITY: 'SET_AUTHORITY',
  SET_CAPACITY: 'SET_CAPACITY',

  CHANGE_DIRECTORY: 'CHANGE_DIRECTORY',
  SET_LISTING: 'SET_LISTING',
  SET_SEARCH_LISTING: 'SET_SEARCH_LISTING',
  SET_SEARCH_LOADING: 'SET_SEARCH_LOADING',
  SET_DIRECTORY_OP: 'SET_DIRECTORY_OP',
  SET_LOADING_DIRECTORY: 'SET_LOADING_DIRECTORY',

  INIT_UPLOADS: 'INIT_UPLOADS',
  SET_DIRECTORY_UPLOADS: 'SET_DIRECTORY_UPLOADS',
  SET_UPLOAD: 'SET_UPLOAD',
  REMOVE_FROM_UPLOADS: 'REMOVE_FROM_UPLOADS', // @to_deprecate
  RESET_UPLOADS: 'RESET_UPLOADS',
  RESET_FAILED_UPLOADS: 'RESET_FAILED_UPLOADS' // @to_deprecate after prune actions
};

const reducer = (state: State, action: { type: string, payload: any }) => {
  switch (action.type) {
    case ACTION.SET_ROLES:
      return { ...state, accountRoles: action.payload }
    case ACTION.SET_AUTHORITY:
      return { ...state, isAuthorized: action.payload }
    case ACTION.INITIALIZE:
      return {
        ...initialState,
        fm: action.payload.fm,
        directory: action.payload.directory,
      }
    case ACTION.SET_CAPACITY:
      return {
        ...state,
        ...action.payload
      }

    case ACTION.CHANGE_DIRECTORY:
      return { ...state, directory: action.payload }
    case ACTION.SET_LISTING:
      return { ...state, listing: action.payload }
    case ACTION.SET_SEARCH_LOADING:
      return { ...state, isSearching: true }
    case ACTION.SET_DIRECTORY_OP:
      return { ...state, isCreatingDirectory: action.payload }
    case ACTION.SET_LOADING_DIRECTORY:
      return { ...state, isLoadingDirectory: action.payload }
    case ACTION.SET_SEARCH_LISTING:
      return { ...state, searchListing: action.payload, isSearching: false }

    case ACTION.INIT_UPLOADS:
      const { uploads, directory }: { directory: DePath, uploads: FileStatus[] } = action.payload;
      const activeUploads = new Map(state.activeUploads);
      const scopeUploads = activeUploads.get(directory) || [];
      activeUploads.set(directory, [...scopeUploads, ...uploads]);
      return {
        ...state,
        activeUploads,
        totalUploadCount: state.totalUploadCount + uploads.length
      }
    case ACTION.SET_UPLOAD:
      {
        let { directory, file }:
          { directory: DePath, file: FileStatus } = action.payload;

        const activeUploads = new Map(state.activeUploads);
        const scopeUploads = [...activeUploads.get(directory) || []];
        const index = scopeUploads.findIndex(f => f.dePath === file.dePath);

        if (index < 0) {
          scopeUploads.push(file);
        } else {
          scopeUploads[index] = file;
        }

        activeUploads.set(directory, scopeUploads);

        return {
          ...state,
          activeUploads,
        }
      }
    case ACTION.SET_DIRECTORY_UPLOADS:
      {
        let { directory, uploads }: { directory: DePath, uploads: FileStatus[] } = action.payload;
        const activeUploads = new Map(state.activeUploads);
        activeUploads.set(directory, uploads);
        return {
          ...state,
          activeUploads
        }
      }
    case ACTION.REMOVE_FROM_UPLOADS:
      {
        let { directory, path } = action.payload;
        const activeUploads = new Map(state.activeUploads);
        const currentFiles = [...activeUploads.get(directory) || []];
        const index = currentFiles?.findIndex(f => f.dePath === path);
        const removed = currentFiles.splice(index, 1);
        activeUploads.set(directory, currentFiles);
        return {
          ...state,
          activeUploads
        }
      }
    case ACTION.RESET_UPLOADS:
      return {
        ...state,
        totalUploadCount: 0,
        activeUploads: initialState.activeUploads
      }
    case ACTION.RESET_FAILED_UPLOADS:
      return {
        ...state,
        failedUploads: initialState.failedUploads
      }
    default:
      console.log('Unregistered action', action.type);
      return state;
  }
}

function useDeFileManager(
  w3Provider: any, address: string, privateKey?: string
): [DeFileManager, State, Action] {
  const [state, dispatch]: [State, Function] = useReducer(reducer, initialState);

  const { fm, directory: cwd } = state;

  const updateCapacity = async () => {
    if (!fm) return;
    dispatch({
      type: ACTION.SET_CAPACITY,
      payload: {
        reservedSpace: await fm.reservedSpace(),
        occupiedSpace: await fm.occupiedSpace()
      }
    });
  }

  const loadCurrentDirectory = async () => {
    dispatch({
      type: ACTION.SET_LOADING_DIRECTORY,
      payload: true
    });
    const entries = await state?.directory?.entries();
    let listing = [];
    for await (let item of entries || []) {
      listing.push(item);
    }
    dispatch({
      type: ACTION.SET_LISTING,
      payload: listing
    });
    dispatch({
      type: ACTION.SET_LOADING_DIRECTORY,
      payload: false
    });
  }

  useLayoutEffect(() => {
    if (!(w3Provider && address)) return;

    let account;
    if (w3Provider.selectedAddress) {
      account = Web3.utils.toChecksumAddress(w3Provider.selectedAddress || "");
    }

    const fm = new DeFileManager(w3Provider, address, account, privateKey);

    dispatch({
      type: ACTION.INITIALIZE, payload: {
        fm,
        directory: fm.rootDirectory()
      }
    });
    dispatch({
      type: ACTION.SET_AUTHORITY,
      payload: ((account || "").toLowerCase() === address.toLowerCase())
    });

    (async () => {
      let roles = [];
      if (await fm.accountIsAllocator()) {
        roles.push(ROLE.ALLOCATOR);
      }
      if (await fm.accountIsAdmin()) {
        roles.push(ROLE.ADMIN);
      }
      if (roles.length) {
        dispatch({
          action: ACTION.SET_ROLES,
          payload: roles
        });
      }
    })();

  }, [w3Provider, address, privateKey]);

  useLayoutEffect(() => {
    updateCapacity();
  }, [fm]);

  useLayoutEffect(() => {
    if (!state.directory) return;
    dispatch({
      type: ACTION.SET_LISTING,
      payload: []
    });
    loadCurrentDirectory();
  }, [state.fm, state.directory?.path]);

  // tested for uploads under 1mb: file being uploaded not reflected in directory listing via node
  // periodically fetch relevant directory listings, update active uploads with progress
  // @todo can be better managed after some restructure involving converging remote + local state vs lookup of remote
  false && useInterval(() => {
    for (let dirPath of state.activeUploads.keys()) {
      const absolutePath = state.fm?.rootDirectory().name + ((dirPath) ? ("/" + dirPath) : "");
      fm?.loadDirectory(absolutePath)
        .then(listing => {
          const uploads = state.activeUploads.get(dirPath);
          const uploadsWithProgress = uploads?.map(upload => {
            const match = listing.find(f => (dirPath + upload.file.name) === upload.dePath);
            return { ...upload, progress: (match as FileStorageFile).uploadingProgress }
          });
          dispatch({
            type: ACTION.SET_DIRECTORY_UPLOADS, payload: {
              directory: dirPath,
              uploads: uploadsWithProgress
            }
          });
        });
    }
  }, 2000);

  const createDirectory = (fm && cwd && state.isAuthorized) &&
    (async (name: string, directory: DeDirectory = cwd) => {
      dispatch({
        type: ACTION.SET_DIRECTORY_OP,
        payload: true
      });
      await fm.createDirectory(directory, name)
        .then(async () => {
          if (directory.path === cwd.path) {
            loadCurrentDirectory();
          }
        });
      dispatch({
        type: ACTION.SET_DIRECTORY_OP,
        payload: false
      });
    })

  const uploadFiles = (fm && cwd && state.isAuthorized) &&
    (async (files: Array<File>, directory: DeDirectory = cwd): Promise<void> => {

      console.log("uploadFiles", files, directory);

      if (!files.length) {
        console.error("uploadFiles:: No files to upload");
        return;
      }

      // add to the active uploads with zero progress
      dispatch({
        type: ACTION.INIT_UPLOADS,
        payload: {
          directory,
          uploads: files.map(file => ({
            file,
            dePath: directory.path + file.name,
            progress: 0
          } as FileStatus
          ))
        }
      });

      // upload transactions going serially until nonce management or SDK events allow otherwise
      // https://github.com/skalenetwork/filestorage-ui/issues/1

      for (let index = 0; index < files.length; index++) {

        let file = files[index];

        await fm.uploadFile(directory, file)
          .then(path => {
            if (directory.path === cwd.path) {
              loadCurrentDirectory();
            }
          })
          .catch(err => {
            console.error("uploadFile::failure", err);
            dispatch({
              type: ACTION.SET_UPLOAD,
              payload: {
                directory: directory.path,
                file: { file: err.file, dePath: directory.path + file.name, progress: 0, error: err.error }
              }
            });
          })
      };

      dispatch({
        type: ACTION.RESET_UPLOADS
      });
    });

  const deleteFile = (fm && cwd && state.isAuthorized) && (async (file: DeFile, directory: DeDirectory = cwd) => {
    await fm.deleteFile(directory, file);
    let listing = [...state.listing];
    const index = listing.findIndex(item => item.path === file.path);
    listing.splice(index, 1);
    dispatch({
      type: ACTION.SET_LISTING,
      payload: listing
    });
  });

  const deleteDirectory = (fm && cwd && state.isAuthorized) && (async (directory: DeDirectory) => {
    await fm.deleteDirectory(directory);
    let listing = [...state.listing];
    const index = listing.findIndex(item => item.path === directory.path);
    listing.splice(index, 1);
    dispatch({
      type: ACTION.SET_LISTING,
      payload: listing
    });
  });

  const search = async (query: string) => {
    dispatch({
      type: ACTION.SET_SEARCH_LOADING,
    });

    if (!query) {
      dispatch({
        type: ACTION.SET_SEARCH_LISTING,
        payload: []
      });
      return;
    }

    const results = await fm?.search(cwd as DeDirectory, query);
    dispatch({
      type: ACTION.SET_SEARCH_LISTING,
      payload: results
    })
  }

  const actions = {
    uploadFiles,
    deleteFile,
    createDirectory,
    deleteDirectory,
    search,
    changeDirectory: (directory: DeDirectory) => dispatch({
      type: ACTION.CHANGE_DIRECTORY,
      payload: directory
    })
  };

  return [fm as DeFileManager, state, actions];
}

export default useDeFileManager;
