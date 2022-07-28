// @ts-nocheck

import { useEffect, useLayoutEffect, useReducer, useState } from 'react';
import { useInterval } from 'react-use';
import { DeFileManager, DeDirectory, DeFile } from '@/services/filesystem';
import Web3 from 'web3';

export type FileStatus = {
  file: File;
  dePath: string;
  progress: number;
  error?: {
    name: string;
    message: string;
    stack: string;
  };
};

export type State = {
  isAuthorized: boolean;
  fm: DeFileManager | undefined;
  directory: DeDirectory | undefined;
  listing: Array<DeDirectory | DeFile>;
  searchListing: Array<DeDirectory | DeFile>;
  isSearching: boolean;
  isCreatingDirectory: boolean;
  isLoadingDirectory: boolean;
  reservedSpace: number;
  occupiedSpace: number;
  activeUploads: Map<DeDirectory, Array<FileStatus>>;
  failedUploads: Map<DeDirectory, Array<FileStatus>>;
};

export type Action = {
}

// current operations can be better managed

const initialState: State = {
  isAuthorized: false,
  fm: undefined,
  directory: undefined,
  listing: [],
  searchListing: [],
  isSearching: false,
  isCreatingDirectory: false,
  isLoadingDirectory: false,
  reservedSpace: 0,
  occupiedSpace: 0,
  activeUploads: new Map(),
  failedUploads: new Map(),
};

const ACTION = {
  INITIALIZE: 'INITIALIZE',
  SET_AUTHORITY: 'SET_AUTHORITY',
  CHANGE_DIRECTORY: 'CHANGE_DIRECTORY',
  SET_LISTING: 'SET_LISTING',
  SET_SEARCH_LISTING: 'SET_SEARCH_LISTING',
  SET_SEARCH_LOADING: 'SET_SEARCH_LOADING',
  SET_DIRECTORY_OP: 'SET_DIRECTORY_OP',
  SET_LOADING_DIRECTORY: 'SET_LOADING_DIRECTORY',
  ADD_UPLOADS: 'ADD_UPLOADS',
  ADD_TO_UPLOADS: 'ADD_TO_UPLOADS',
  REMOVE_FROM_UPLOADS: 'REMOVE_FROM_UPLOADS',
  UPDATE_UPLOADS: 'UPDATE_UPLOADS',
  SET_CAPACITY: 'SET_CAPACITY'
};

const reducer = (state: State, action: { type: string, payload: any }) => {
  switch (action.type) {
    case ACTION.SET_AUTHORITY:
      return { ...state, isAuthorized: action.payload }
    case ACTION.INITIALIZE:
      return {
        ...initialState,
        fm: action.payload.fm,
        directory: action.payload.directory,
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
    case ACTION.ADD_UPLOADS:
      {
        let { directory, activeFiles } = action.payload;
        const activeUploads = new Map(state.activeUploads);
        activeUploads.set(directory, [...activeUploads.get(directory) || [], ...activeFiles]);
        return {
          ...state,
          activeUploads
        }
      }
    case ACTION.ADD_TO_UPLOADS:
      {
        let { directory, file, isFailed } = action.payload;
        if (isFailed) {
          const failedUploads = new Map(state.failedUploads);
          failedUploads.set(directory, [...failedUploads.get(directory) || [], file]);
          return {
            ...state,
            failedUploads
          }
        }
        const activeUploads = new Map(state.activeUploads);
        activeUploads.set(directory, [...activeUploads.get(directory) || [], file]);
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
    case ACTION.UPDATE_UPLOADS:
      {
        let { directory, activeFiles } = action.payload;
        const activeUploads = new Map(state.activeUploads);
        activeUploads.set(directory, activeFiles);
        return {
          ...state,
          activeUploads
        }
      }
    case ACTION.SET_CAPACITY:
      return {
        ...state,
        ...action.payload
      }
    default:
      throw new Error();
  }
}

function useDeFileManager(
  w3Provider: Object, address: string, privateKey?: string
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
    console.log("useDeFileManager::provider", w3Provider);

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
  // instead simulating progress
  // can be re-enabled later
  false && useInterval(() => {
    for (let dirPath of state.activeUploads.keys()) {
      // @todo make sane
      const absolutePath = state.fm?.rootDirectory().name + ((dirPath) ? ("/" + dirPath) : "");
      fm?.loadDirectory(absolutePath)
        .then(listing => {
          const uploads = state.activeUploads.get(dirPath);
          const withProgress = uploads?.map(upload => {
            const match = listing.find(f => (dirPath + upload.file.name) === upload.dePath);
            // @todo when progress 100, purge or push to complete for notification
            return { ...upload, progress: match.uploadingProgress }
          });
          dispatch({
            type: ACTION.UPDATE_UPLOADS, payload: {
              directory: dirPath,
              activeUploads: withProgress
            }
          });
        });
    }
  }, 1000);

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
    (async (files: Array<File>, directory: DeDirectory = cwd): Array => {

      // @todo set up sane actions
      for (let index = 0; index < files.length; index++) {
        let file = files[index];
        dispatch({
          type: ACTION.ADD_TO_UPLOADS,
          payload: {
            directory: directory.path,
            file: { file, dePath: directory.path + file.name, progress: 0 }
          }
        });
        const remove = () => {
          dispatch({
            type: ACTION.REMOVE_FROM_UPLOADS,
            payload: {
              directory: directory.path,
              path: directory.path + file.name
            }
          });
        }
        await fm.uploadFile(directory, file)
          .then(path => {
            remove();
            loadCurrentDirectory();
          })
          .catch(err => {
            console.error(err);
            remove();
            dispatch({
              type: ACTION.ADD_TO_UPLOADS,
              payload: {
                directory: directory.path,
                file: { file: err.file, dePath: directory.path + file.name, progress: 0, error: err.error },
                isFailed: true
              }
            });
          })
      };
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

  const search = async (query) => {
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

    const results = await fm?.search(cwd, query);
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

  return [fm, state, actions];
}

export default useDeFileManager;
