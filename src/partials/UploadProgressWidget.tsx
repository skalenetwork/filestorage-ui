import { Modal, Progress } from '@/components/common';
import WidgetModal from '@/components/WidgetModal';
import { FileStatus } from '@/context/useDeFileManager';
import UploadIcon from '@heroicons/react/outline/UploadIcon';
import type { ModalWidgetProps } from 'partials';
import prettyBytes from 'pretty-bytes';
import { useFileManagerContext, ContextType } from '../context';

type Props = ModalWidgetProps & {
  activeUploads: FileStatus[],
  failedUploads: FileStatus[],
  total: number,
  processed: number
}

const UploadProgressWidget = ({
  open,
  onClose,
  total,
  processed,
  activeUploads,
  failedUploads
}: Props) => {

  return (
    <WidgetModal
      open={open}
      onClose={onClose}
      heading="Uploading"
    >
      <Modal.Body className="flex flex-col gap-1.5 justify-center items-center">
        {
          (processed < total) ?
            <>
              <p>This process may take some time.</p>
              <UploadIcon className="h-24 w-24 my-4" />
              {
                activeUploads.map(upload => (upload) ? (
                  <div key={upload.dePath} className="flex flex-row justify-between items-center gap-2">
                    <p>{upload.file.name}</p>
                    <p>{prettyBytes(upload.file.size)}</p>
                  </div>
                ) : null)
              }
              <Progress
                className="w-72 animate-pulse"
                value={total === 1 ? undefined : processed} max={total === 1 ? undefined : total}
              />
            </>
            :
            <p>All files are uploaded.</p>
        }
      </Modal.Body>
    </WidgetModal>
  )
}

export default UploadProgressWidget;