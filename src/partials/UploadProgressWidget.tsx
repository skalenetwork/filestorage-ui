import { Modal, Progress, SpinnerIcon } from '@/components/common';
import FormattedName from '@/components/FormattedName';
import FormattedSize from '@/components/FormattedSize';
import WidgetModal from '@/components/WidgetModal';
import { FileStatus } from '@/context/useDeFileManager';
import { DeDirectory, DeFile, FileOrDir } from '@/services/filemanager';
import UploadIcon from '@heroicons/react/outline/UploadIcon';
import XIcon from '@heroicons/react/outline/XIcon';
import CheckIcon from '@heroicons/react/solid/CheckIcon';
import type { ModalWidgetProps } from 'partials';
import prettyBytes from 'pretty-bytes';
import { useEffect } from 'react';
import { useFileManagerContext, ContextType } from '../context';

type Props = ModalWidgetProps & {
  activeUploads: FileStatus[],
  failedUploads: FileStatus[],
  total: number
}

const ItemStatus = ({ data }: { data: FileStatus }) => {

  const preDeFile = {
    kind: "file",
    name: data.file.name,
    size: data.file.size,
    type: data.file.type,
    path: data.dePath
  } as DeFile;

  return (
    <div className="w-full flex flex-row items-center border-slate-800 border-b py-4">
      <div className="grow">
        <FormattedName
          item={preDeFile}
          maxLength={12}
        />
      </div>
      <div className="grow">
        <FormattedSize item={preDeFile} />
      </div>
      <div className="flex items-center flex-grow-0">
        <span className="font-mono">{data.progress} %</span>
        <span className="ml-2">
          {
            (data.error)
              ? <XIcon className="w-8 h-8 text-red-500" />
              : (data.progress === 100)
                ? <CheckIcon className="w-8 h-8 text-green-500" />
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
  failedUploads
}: Props) => {

  useEffect(() => {
    console.log(activeUploads);
  }, [activeUploads])

  return (
    <WidgetModal
      open={open}
      onClose={onClose}
      heading="Uploading"
    >
      <Modal.Body className="w-full flex flex-col gap-1.5 justify-center items-center">
        <p>This process may take some time</p>
        {
          activeUploads.map(upload => (upload) ? (
            <ItemStatus
              key={upload.dePath}
              data={upload}
            />
          ) : null)
        }
      </Modal.Body>
    </WidgetModal>
  )
}

export default UploadProgressWidget;