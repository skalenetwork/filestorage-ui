// @ts-nocheck

import { useEffect, useReducer, useState } from 'react';
import { useInterval } from 'react-use';
import { DeFileManager, DeDirectory, DeFile } from '@/services/filesystem';

type FileStatus = {
  file: File;
  dePath: string;
  progress: number;
};

export type State = {
  isAuthorized: boolean;
  fm: DeFileManager | undefined;
  directory: DeDirectory | undefined;
  listing: Array<DeDirectory | DeFile>;
  reservedSpace: number;
  occupiedSpace: number;
  activeUploads: Map<DeDirectory, Array<FileStatus>>;
  failedUploads: Map<DeDirectory, Array<File>>;
};

export type Action = {
}

const initialState: State = {
  isAuthorized: false,
  fm: undefined,
  directory: undefined,
  listing: [],
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
      return { ...state, fm: action.payload.fm, directory: action.payload.directory }
    case ACTION.CHANGE_DIRECTORY:
      return { ...state, directory: action.payload }
    case ACTION.SET_LISTING:
      return { ...state, listing: action.payload }
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
        let { directory, file } = action.payload;
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

function useDeFileManager(w3Provider: Object, address: string, privateKey?: string) {
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
    const entries = await state?.directory?.entries();
    let listing = [];
    for await (let item of entries || []) {
      listing.push(item);
    }
    dispatch({
      type: ACTION.SET_LISTING,
      payload: listing
    });
  }

  useEffect(() => {
    if (!(w3Provider && address)) return;
    console.log("useDeFileManager::provider.address", w3Provider);
    const selectedAddress = (w3Provider.selectedAddress || "").toLowerCase();
    dispatch({
      type: ACTION.SET_AUTHORITY,
      payload: (selectedAddress === address.toLowerCase())
    });
    const fm = new DeFileManager(w3Provider, address, privateKey);
    dispatch({
      type: ACTION.INITIALIZE, payload: {
        fm,
        directory: fm.rootDirectory()
      }
    });
  }, [w3Provider, address, privateKey]);

  useEffect(() => {
    updateCapacity();
  }, [fm]);

  useEffect(() => {
    if (!state.directory) return;
    dispatch({
      type: ACTION.SET_LISTING,
      payload: []
    });
    loadCurrentDirectory();
  }, [state.directory?.path]);

  // implementation complete, @todo test
  useInterval(() => {
    return;
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
      fm.createDirectory(directory, name)
        .then(async () => {
          if (directory.path === cwd.path) {
            loadCurrentDirectory();
          }
        });
    })

  const uploadFiles = (fm && cwd && state.isAuthorized) && (async (files: Array<File>, directory: DeDirectory = cwd) => {
    let activeFiles: FileStatus[] = [];
    let failedFiles: File[] = [];

    // @todo set up sane actions
    files.forEach(file => {
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
      fm.uploadFile(directory, file)
        .then(path => {
          remove();
        })
        .catch(err => {
          console.error(err);
          remove();
        })
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

  const actions = {
    uploadFiles,
    deleteFile,
    createDirectory,
    deleteDirectory,
    changeDirectory: (directory: DeDirectory) => dispatch({
      type: ACTION.CHANGE_DIRECTORY,
      payload: directory
    })
  };

  return [fm, state, actions];
}

export default useDeFileManager;
