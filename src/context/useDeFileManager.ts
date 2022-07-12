import { useEffect, useState, useReducer } from 'react';
import { DeFileManager, DeDirectory, DeFile } from '@/services/filesystem';

export type State = {
  fm: DeFileManager | undefined;
  directory: DeDirectory | undefined;
  reservedSpace: number;
  occupiedSpace: number;
  activeUploads: Array<{ file: File, dePath: string }>;
  failedUploads: Array<File>;
};

const initialState: State = {
  fm: undefined,
  directory: undefined,
  reservedSpace: 0,
  occupiedSpace: 0,
  activeUploads: [],
  failedUploads: [],
};

const ACTION = {
  INITIALIZE: 'INITIALIZE',
  CHANGE_DIRECTORY: 'CHANGE_DIRECTORY',
  ADD_UPLOADS: 'UPLOAD_FILES',
  SET_CAPACITY: 'SET_CAPACITY'
};

const reducer = (state: State, action: { type: string, payload: any }) => {
  switch (action.type) {
    case ACTION.INITIALIZE:
      return { ...state, fm: action.payload.fm, directory: action.payload.directory }
    case ACTION.CHANGE_DIRECTORY:
      return { ...state, directory: action.payload }
    case ACTION.ADD_UPLOADS:
      return {
        ...state,
        activeUploads: [state.activeUploads, ...action.payload.activeUploads],
        failedUploads: [state.failedUploads, ...action.payload.failedUploads]
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

  useEffect(() => {
    if (!(w3Provider && address)) return;
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

  const uploadFiles = (fm && cwd) && (async (files: Array<File>) => {
    let activeUploads: State['activeUploads'] = [];
    let failedUploads: State['failedUploads'] = [];

    let promises = files.map(f => [f, fm.uploadFile(cwd, f)]);
    for (let [f, onePromise] of promises) {
      try {
        activeUploads.push({ file: f as File, dePath: await onePromise });
      } catch (e) {
        console.error("DeFileManager::failed_upload", e);
        failedUploads.push(f as File);
      }
    };
  });

  const actions = {
    uploadFiles,
    changeDirectory: (directory: DeDirectory) => dispatch({
      type: ACTION.CHANGE_DIRECTORY,
      payload: directory
    })
  };

  return [fm, state, actions];
}

export default useDeFileManager;
