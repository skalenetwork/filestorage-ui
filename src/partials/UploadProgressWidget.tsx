import { Modal, Progress, SpinnerIcon } from '@/components/common';
import FormattedName from '@/components/FormattedName';
import FormattedSize from '@/components/FormattedSize';
import WidgetModal from '@/components/WidgetModal';
import { FileStatus } from '@/context/useDeFileManager';
import { DeDirectory, DeFile, FileOrDir } from '@/services/filemanager';
import XIcon from '@heroicons/react/outline/XIcon';
import CheckIcon from '@heroicons/react/solid/CheckIcon';
import type { ModalWidgetProps } from 'partials';
import { useEffect } from 'react';

type Props = ModalWidgetProps & {
  activeUploads: FileStatus[],
  failedUploads: FileStatus[],
  total: number,
  uploadStatus: number,
}

const ItemStatus = ({ data }: { data: FileStatus }) => {

  const preDeFile = {
    kind: "file",
    name: data.file.name,
    size: data.file.size,
    type: data.file.type,
    path: data.path
  } as DeFile;

  return (
    <div className="w-full flex flex-row items-center border-slate-800 border-b py-3">
      <div className="grow">
        <FormattedName
          item={preDeFile}
          maxLength={12}
        />
      </div>
      <div className="grow-0 shrink-0 basis-16 font-mono text-right">
        <FormattedSize item={preDeFile} />
      </div>
      <div className="grow-0 shrink-0 basis-24 flex items-center justify-end">
        {
          data.progress ? <span className="font-mono">{data.progress} %</span> : null
        }
        <span className="ml-2">
          {
            (data.error)
              ? <XIcon className="w-7 h-7 text-red-500" />
              : (data.progress === 100)
                ? <CheckIcon className="w-7 h-7 text-green-500" />
                : <SpinnerIcon className="w-6 h-6" strokeWidth="2" />
          }
        </span>
      </div>
    </div>
  )
}

const UploadProgressWidget = ({
  open,
  onClose,
  total,
  activeUploads,
  failedUploads,
  uploadStatus
}: Props) => {

  useEffect(() => {
    console.log(activeUploads);
  }, [activeUploads])

  return (
    <WidgetModal
      open={open}
      onClose={onClose}
      heading={(uploadStatus < 2) ? 'Uploading' : (uploadStatus === 2) ? 'Uploading Complete' : '...'}
    >
      <Modal.Body
        className="w-full">
        <p className="text-center py-1">
          {(uploadStatus < 2) ? 'This process may take some time' : 'All files are done processing'}
        </p>
        <div
          className="
          w-full flex flex-col gap-1.5 max-h-96 px-1 scrollbar
           justify-start items-center overflow-y-scroll overflow-x-hidden">
          {
            activeUploads.reverse().map(upload => (upload) ? (
              <ItemStatus
                key={upload.path}
                data={upload}
              />
            ) : null)
          }
        </div>
      </Modal.Body>
    </WidgetModal>
  )
}

export default UploadProgressWidget;