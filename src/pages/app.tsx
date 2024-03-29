// @ts-nocheck

import { useState, useEffect, useLayoutEffect } from 'react';
import { useFileManagerContext, ContextType } from '@/context/index';
import { FileStatus, ROLE } from '@/context/useDeFileManager';
import { Button } from '@/components/common';

import FolderAddIcon from '@heroicons/react/solid/FolderAddIcon';
import DocumentAddIcon from '@heroicons/react/solid/DocumentAddIcon';
import CheckIcon from '@heroicons/react/solid/CheckIcon';
import ArchiveIcon from '@heroicons/react/outline/ArchiveIcon';

import Branding from '@/components/Branding';
import Connect from '@/components/Connect';
import StorageStatus from '@/components/StorageStatus';

import Search from '@/components/Search';
import FileNavigator from '@/components/FileNavigator';

import ViewFileWidget from '../partials/ViewFileWidget';
import UploadWidget from '../partials/UploadWidget';
import UploadProgressWidget from '../partials/UploadProgressWidget';
import CreateDirectoryWidget from '../partials/CreateDirectoryWidget';
import ReserveSpaceWidget from '../partials/ReserveSpaceWidget';
import GrantorWidget from '../partials/GrantorWidget';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DarkModeToggle from '@/components/DarkModeToggle';

const App = () => {

  // modals

  const [reserveSpaceModal, setReserveSpaceModal] = useState(false);
  const [activeUploadsModal, setActiveUploadsModal] = useState(false);
  const [failedUploadsModal, setFailedUploadsModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [directoryModal, setDirectoryModal] = useState(false);
  const [grantRoleModal, setGrantRoleModal] = useState(false);

  const {
    config,
    fm, directory: currentDirectory, reservedSpace, occupiedSpace,
    isAuthorized, accountRoles, connectWallet, activeUploads, failedUploads, totalUploadCount,
    changeDirectory, uploadFiles, createDirectory, isCreatingDirectory, uploadStatus
  }: ContextType = useFileManagerContext<ContextType>();

  const [uploadingFiles, setUploadingFiles] = useState<FileStatus[]>([]);
  const [failedFiles, setFailedFiles] = useState<FileStatus[]>([]);
  const [selectedFile, setSelectedFile] = useState<DeFile>(undefined);

  useLayoutEffect(() => {
    if (!selectedFile) return;
  }, [selectedFile]);

  useEffect(() => {
    setUploadingFiles(Array.from(activeUploads.values()).flat());
  }, [activeUploads]);

  useEffect(() => {
    setFailedFiles(Array.from(failedUploads.values()).flat());
  }, [failedUploads]);

  const handleConfirmUpload = async (
    data: { uploads: Array<File> },
    callback?: () => any
  ) => {
    console.log("file to upload", data.uploads);
    if (!(currentDirectory && data.uploads && data.uploads.length)) return;
    callback && callback();
    setUploadModal(false);
    setActiveUploadsModal(true);
    return await uploadFiles(data.uploads);
  }

  return (
    <div className="mx-auto max-h-[100vh] h-[100vh] overflow-hidden">
      <main>
        <section className="px-32" style={{ gridArea: 'frame' }}>
          <header className="header py-2 flex justify-between items-center">
            <Branding logoUrl={config.branding.logoUrl}>
              {
                config.branding.logoText &&
                <span className="text-xl font-bold">{config.branding.logoText}</span>
              }
            </Branding>
            <div className="flex flex-row gap-4">
              {
                (uploadingFiles.length) ?
                  <div
                    className={`
                    px-4 py-2 relative cursor-pointer rounded text-sm flex items-center 
                     ${(uploadStatus === 1) ? 'bg-yellow-50 border border-yellow-400' : 'bg-green-50 border border-green-400'}
                    `}
                    onClick={(e) => setActiveUploadsModal(true)}
                  >
                    <ArchiveIcon className="inline-block w-4 h-4 mr-2 text-black opacity-40 mix-blend-hard-light" />
                    {
                      uploadStatus === 1 &&
                      <span class="flex h-3 w-3 absolute -right-1 -top-1">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                      </span>
                    }
                    {
                      (uploadStatus === 1) ? 'Uploading files..' : <CheckIcon className="w-5 h-5 text-green-500" />
                    }
                  </div>
                  : <></>
              }
              {
                (failedFiles.length) ?
                  <p className="px-4 py-2 cursor-pointer rounded bg-red-50 border border-red-500 text-sm"
                    onClick={(e) => setFailedUploadsModal(true)}
                  >
                    {failedFiles.length} uploads failed..
                  </p>
                  : <></>
              }
              <DarkModeToggle />
              <Connect
                account={fm?.account}
                onConnectClick={connectWallet}
              />
            </div>
          </header>
          <div className="status-bar flex flex-row justify-between items-center">
            <h1 className="text-3xl font-semibold">{config.branding.greetingText}</h1>
            <div className="flex flex-col justify-end items-end">
              <StorageStatus
                className="w-80"
                occupiedSpace={occupiedSpace}
                reservedSpace={reservedSpace}
              />
              <div className="flex-none flex flex-row gap-4">
                {
                  (accountRoles.includes(ROLE.OWNER)) ?
                    <Button
                      className="w-80 bg-gray-200 text-black border-none"
                      onClick={() => setGrantRoleModal(true)}
                      color="secondary">Grant allocator role
                    </Button>
                    : null
                }
                {
                  (accountRoles.includes(ROLE.ALLOCATOR)) ?
                    <Button
                      className="w-80 bg-gray-200 text-black border-none"
                      onClick={() => setReserveSpaceModal(true)}
                      color="secondary">Reserve space
                    </Button>
                    : null
                }
              </div>
            </div>
          </div>
          <div className="action-bar my-4 gap-4 flex flex-row justify-between items-center">
            <Search
              className="grow relative"
              onFileClick={setSelectedFile}
            />
            {
              (isAuthorized) ?
                <div className="flex-none flex flex-row gap-4">
                  <Button
                    className="btn w-80"
                    onClick={
                      (e) => setUploadModal(true)
                    }
                  >
                    <DocumentAddIcon className="h-5 w-5 mr-4" /> Upload file
                  </Button>
                  <Button
                    className={`btn w-80 ${(isCreatingDirectory) ? 'loading' : ''}`}
                    onClick={() => setDirectoryModal(true)}
                    disabled={isCreatingDirectory}
                  >
                    {
                      !isCreatingDirectory ?
                        (<><FolderAddIcon className="h-5 w-5 mr-4" /> Create directory</>) :
                        <>Creating directory..</>
                    }
                  </Button>
                </div>
                : null
            }
          </div>
        </section>
        <section
          style={{ gridArea: 'mgr' }}
          className="overflow-y-scroll px-32 scrollbar">
          <FileNavigator
            onSelectFile={setSelectedFile}
          />
        </section>
      </main>

      {/* Action widgets, can be iterated on with FormContext */}

      <GrantorWidget
        open={grantRoleModal}
        onClose={() => setGrantRoleModal(false)}
        onSubmit={
          async ({ granteeAddress }) => {
            setGrantRoleModal(false);
            // @todo move to pichon
            return granteeAddress && fm?.fs.grantAllocatorRole(fm.address, granteeAddress);
          }
        }
      />

      <ReserveSpaceWidget
        open={reserveSpaceModal}
        onClose={() => {
          setReserveSpaceModal(false);
        }}
        onSubmit={
          async ({ reserveSpaceAddress, reserveSpaceAmount, reserveSpaceUnit: unit }) => {
            setReserveSpaceModal(false);
            const multiplier = (unit === "kb") ? 1 : (unit === "mb") ? 2 : unit === "gb" ? 3 : 0;
            const amount = Number(reserveSpaceAmount) * (Math.pow(1024, multiplier));
            console.log(amount, multiplier, unit);
            return reserveSpaceAddress && amount &&
              fm?.fs.reserveSpace(fm.address, reserveSpaceAddress, amount);
          }
        }
      />

      <CreateDirectoryWidget
        open={directoryModal}
        onClose={() => {
          setDirectoryModal(false);
        }}
        onSubmit={
          async ({ directoryName }) => {
            console.log(`create directory ${directoryName} in`, currentDirectory);
            setDirectoryModal(false);
            return createDirectory(directoryName);
          }
        }
      />

      <UploadWidget
        open={uploadModal}
        onClose={() => {
          setUploadModal(false);
        }}
        onSubmit={handleConfirmUpload}
        batchThreshold={config.uploader.batchThreshold}
      />

      <UploadProgressWidget
        open={activeUploadsModal}
        onClose={() => setActiveUploadsModal(false)}
        activeUploads={uploadingFiles}
        failedUploads={failedFiles}
        total={totalUploadCount}
        uploadStatus={uploadStatus}
      />

      <ViewFileWidget
        open={!!selectedFile}
        onClose={() => {
          setSelectedFile(undefined)
        }}
        file={selectedFile}
      />

      <ToastContainer
        position="bottom-right"
      />

    </div>
  )
}

export default App
