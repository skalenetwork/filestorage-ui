import { Modal, Progress } from '@/components/common';
import { FileStatus } from '@/context/useDeFileManager';
import UploadIcon from '@heroicons/react/outline/UploadIcon';
import type { ModalWidgetProps } from 'partials';
import prettyBytes from 'pretty-bytes';

type Props = ModalWidgetProps & {
  activeUploads: FileStatus[],
  failedUploads: FileStatus[]
}

const UploadProgressWidget = ({
  open,
  onClose,
  activeUploads,
  failedUploads
}: Props) => {
  return (
    <Modal
      className="gap-4 flex flex-col justify-center items-center"
      open={open}
      onClickBackdrop={onClose}
    >
      <Modal.Header className="text-center font-bold">
        Uploading
        </Modal.Header>
      <Modal.Body className="flex flex-col gap-1.5 justify-center items-center">
        {
          (activeUploads.length > 0) ?
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
              <Progress className="w-72 animate-pulse" value={90} max={100} />
            </>
            :
            <>
              {
                failedUploads && failedUploads.length > 0 ?
                  <p>
                    <span className="py-2">
                      Failed to upload {failedUploads.length} files.
                    </span>
                    {
                      (failedUploads.map(upload => (
                        <p>{upload.file.name}: {upload.error?.message}</p>
                      )))
                    }
                  </p>
                  :
                  <p>All files are uploaded.</p>
              }
            </>
        }
      </Modal.Body>
    </Modal>
  )
}

export default UploadProgressWidget;