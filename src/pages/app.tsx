// @ts-nocheck

import { useState, useEffect, useLayoutEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useFileManagerContext, ContextType } from '@/context/index';
import type { FileStatus } from '@/context/useDeFileManager';

import { Button } from '@/components/common';

import FolderAddIcon from '@heroicons/react/solid/FolderAddIcon';
import DocumentAddIcon from '@heroicons/react/solid/DocumentAddIcon';

import Branding from '@/components/Branding';
import Connect from '@/components/Connect';
import StorageStatus from '@/components/StorageStatus';
import Search from '@/components/Search';

import FileNavigator from '@/components/FileNavigator';

import UploadWidget from '../partials/UploadWidget';
import UploadProgressWidget from '../partials/UploadProgressWidget';
import UploadFailedWidget from '../partials/UploadFailedWidget';
import CreateDirectoryWidget from '../partials/CreateDirectoryWidget';
import ReserveSpaceWidget from '../partials/ReserveSpaceWidget';
import GrantorWidget from '../partials/GrantorWidget';
import ViewFileWidget from '../partials/ViewFileWidget';

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
    fm, directory: currentDirectory, reservedSpace, occupiedSpace, searchListing,
    isAuthorized, accountRoles, connectWallet, activeUploads, failedUploads, totalUploadCount, processedUploadCount,
    changeDirectory, uploadFiles, createDirectory, search, isSearching, isCreatingDirectory
  }: ContextType = useFileManagerContext<ContextType>();

  const [uploadingFiles, setUploadingFiles] = useState<FileStatus[]>([]);
  const [failedFiles, setFailedFiles] = useState<FileStatus[]>([]);
  const [selectedFile, setSelectedFile] = useState<DeFile>(undefined);

  type ActionsFormData = {
    uploads: { name: string, file: File }[],
    directoryName: string,
    reserveSpaceAddress: string,
    reserveSpaceAmount: number,
    roleGranteeAddress: string,
  }

  const { register, control, handleSubmit, watch, formState: { errors }, resetField } = useForm({
    defaultValues: {
      uploads: [],
      directoryName: "",
      reserveSpaceAddress: "",
      reserveSpaceAmount: "",
      roleGranteeAddress: ""
    } as ActionsFormData
  });

  useLayoutEffect(() => {
    if (!selectedFile) return;
  }, [selectedFile]);

  useEffect(() => {
    setUploadingFiles(Array.from(activeUploads.values()).flat());
  }, [activeUploads]);

  useEffect(() => {
    setFailedFiles(Array.from(failedUploads.values()).flat());
  }, [failedUploads]);

  const handleConfirmUpload = async (data: { uploads: Array<{ name: string, file: File }> }) => {
    console.log("file to upload", data.uploads);
    if (!(currentDirectory && data.uploads && data.uploads.length)) return;
    const filesToUpload: File[] = data.uploads.map(({ name, file }) => {
      return new File([file], name);
    });
    setUploadModal(false);
    resetField('uploads');
    setActiveUploadsModal(true);
    return await uploadFiles(filesToUpload);
  }

  return (
    <div className="mx-auto max-h-[100vh] h-[100vh] overflow-hidden">
      <main>
        <section className="px-36" style={{ gridArea: 'frame' }}>
          <header className="header py-2 flex justify-between items-center">
            <Branding logoUrl={config.branding.logoUrl}>
              <span className="text-xl font-bold">SKALE<sup className="font-medium">fs</sup></span>
            </Branding>
            <div className="flex flex-row gap-4">
              {
                (uploadingFiles.length) ?
                  <p className="px-4 py-2 relative cursor-pointer rounded bg-yellow-50 border border-yellow-500 text-sm"
                    onClick={(e) => setActiveUploadsModal(true)}
                  >
                    <span class="flex h-3 w-3 absolute -right-1 -top-1">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                    </span>
                    Uploading files..
                  </p>
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
              <Connect
                account={fm?.account}
                onConnectClick={connectWallet}
              />
            </div>
          </header>
          <div className="status-bar flex flex-row justify-between items-center">
            <h1 className="text-3xl font-semibold">Filestorage</h1>
            <div className="w-80">
              <StorageStatus
                occupiedSpace={occupiedSpace}
                reservedSpace={reservedSpace}
              />
              {
                (isAuthorized) ?
                  <Button
                    className="w-full bg-gray-200 text-black border-none"
                    onClick={() => setReserveSpaceModal(true)}
                    color="secondary">Reserve space
                  </Button>
                  : null
              }
            </div>
          </div>
          <div className="action-bar my-4 gap-4 flex flex-row justify-between items-center">
            <Search
              className="grow relative"
              isSearching={isSearching}
              onInput={search}
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
                    className={`btn w-80 text-white ${(isCreatingDirectory) ? 'loading' : ''}`}
                    onClick={() => setDirectoryModal(true)}
                    disabled={isCreatingDirectory}
                  >
                    {
                      !isCreatingDirectory ?
                        (<><FolderAddIcon className="h-5 w-5 mr-4 text-white" /> Create directory</>) :
                        <>Creating directory..</>
                    }
                  </Button>
                </div>
                : null
            }
          </div>
        </section>
        <section style={{ gridArea: 'mgr' }} className="overflow-y-scroll px-36">
          <FileNavigator
            onSelectFile={setSelectedFile}
          />
        </section>
      </main>

      {/* Action widgets, can be iterated on with FormContext */}

      <UploadWidget
        open={uploadModal}
        onClose={() => {
          setUploadModal(false);
          resetField('uploads');
        }}
        formControl={control}
        formRegister={register}
        batchThreshold={config.uploader.batchThreshold}
        onSubmit={handleSubmit(handleConfirmUpload)}
      />

      <UploadProgressWidget
        open={activeUploadsModal}
        onClose={() => setActiveUploadsModal(false)}
        activeUploads={uploadingFiles}
        failedUploads={failedFiles}
        total={totalUploadCount}
        processed={processedUploadCount}
      />

      <UploadFailedWidget
        open={failedUploadsModal}
        onClose={() => setFailedUploadsModal(false)}
        failedUploads={failedFiles}
      />

      <CreateDirectoryWidget
        open={directoryModal}
        onClose={() => {
          resetField('directoryName');
          setDirectoryModal(false);
        }}
        formRegister={register}
        onSubmit={handleSubmit(
          ({ directoryName }) => {
            console.log(`create directory ${directoryName} in`, currentDirectory);
            setDirectoryModal(false);
            resetField('directoryName');
            createDirectory(directoryName);
          }
        )}
      />

      <ReserveSpaceWidget
        open={reserveSpaceModal}
        onClose={() => {
          setReserveSpaceModal(false);
          resetField('reserveSpaceAddress');
          resetField('reserveSpaceAmount');
        }}
        formRegister={register}
        onSubmit={handleSubmit(
          ({ address, space }) => {
            setReserveSpaceModal(false);
            resetField('reserveSpaceAddress');
            resetField('reserveSpaceAmount');
            return address && space && fm?.fs.reserveSpace(fm.address, address, Number(space));
          }
        )}
      />

      <GrantorWidget
        open={grantRoleModal}
        onClose={() => setGrantRoleModal(false)}
        formRegister={register}
      />

      <ViewFileWidget
        open={!!selectedFile}
        onClose={() => {
          setSelectedFile(undefined)
        }}
        file={selectedFile}
      />

    </div>
  )
}

export default App
