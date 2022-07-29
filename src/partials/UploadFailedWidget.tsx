import { Modal } from '@/components/common';
import WidgetModal from '@/components/WidgetModal';
import { FileStatus } from '@/context/useDeFileManager';
import type { ModalWidgetProps } from 'partials';

type Props = ModalWidgetProps & {
  failedUploads: FileStatus[],
}

const UploadProgressWidget = ({
  open,
  onClose,
  failedUploads
}: Props) => {

  return (
    <WidgetModal
      open={open}
      onClose={onClose}
      heading="Something went wrong"
    >
      <Modal.Body className="w-full flex flex-col gap-1.5 justify-center items-center">
        {
          (failedUploads && failedUploads.length > 0) ?
            <p>
              <span className="py-2">
                Failed to upload {failedUploads.length} files.
              </span>
              {
                (failedUploads.map(upload => (
                  <p className="py-1">{upload.file.name}: {upload.error?.message}</p>
                )))
              }
            </p>
            :
            <>
            </>
        }
      </Modal.Body>
    </WidgetModal>
  )
}

export default UploadProgressWidget;