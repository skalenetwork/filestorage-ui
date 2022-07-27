// @ts-nocheck

import { useState, useEffect } from 'react';

import { useFileManagerContext } from '@/context/index';

import { useForm } from 'react-hook-form';

import { Button } from '@/components/common';

import FolderAddIcon from '@heroicons/react/solid/FolderAddIcon';
import DocumentAddIcon from '@heroicons/react/solid/DocumentAddIcon';

import Branding from '@/components/Branding';
import Connect from '@/components/Connect';
import Search from '@/components/Search';

import FileNavigator from '@/components/FileNavigator';

import UploadWidget from '../partials/UploadWidget';
import UploadProgressWidget from '../partials/UploadProgressWidget';
import CreateDirectoryWidget from '../partials/CreateDirectoryWidget';
import ReserveSpaceWidget from '../partials/ReserveSpaceWidget';
import GrantorWidget from '../partials/GrantorWidget';
import ViewFileWidget from '../partials/ViewFileWidget';
import StorageStatus from '@/components/StorageStatus';

const App = () => {

  // modals

  const [reserveSpaceModal, setReserveSpaceModal] = useState(false);
  const [activeUploadsModal, setActiveUploadsModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [directoryModal, setDirectoryModal] = useState(false);
  const [grantRoleModal, setGrantRoleModal] = useState(false);

  const {
    fm, directory: currentDirectory, reservedSpace, occupiedSpace, searchListing,
    isAuthorized, connectWallet, activeUploads, failedUploads,
    changeDirectory, uploadFiles, createDirectory, search, isSearching, isCreatingDirectory
  } = useFileManagerContext();

  const [uploadingFiles, setUploadingFiles] = useState<any[]>([]);
  const [failedFiles, setFailedFiles] = useState<any[]>([]);

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
            <Branding>
              <span className="text-xl font-bold">SKALE<sup className="font-medium">fs</sup></span>
            </Branding>
            <div className="flex flex-row gap-4">
              {
                (uploadingFiles.length) ?
                  <p className="px-4 py-2 cursor-pointer rounded bg-yellow-50 border border-yellow-500"
                    onClick={(e) => setActiveUploadsModal(true)}
                  >
                    Uploading {uploadingFiles.length} files..
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
          <FileNavigator />
        </section>
      </main>

      {/* Action widgets, can be iterated on with FormContext */}

      <UploadWidget
        open={uploadModal}
        onClose={() => setUploadModal(false)}
        formControl={control}
        formRegister={register}
        onSubmit={handleSubmit(handleConfirmUpload)}
      />

      <UploadProgressWidget
        open={activeUploadsModal}
        onClose={() => setActiveUploadsModal(false)}
        activeUploads={uploadingFiles}
        failedUploads={failedFiles}
      />

      <CreateDirectoryWidget
        open={directoryModal}
        onClose={() => setDirectoryModal(false)}
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
        onClose={() => setReserveSpaceModal(false)}
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
    </div >
  )
}

export default App
