import { Button, Modal } from '@/components/common';
import WidgetModal from '@/components/WidgetModal';
import type { DeFile } from '@/services/filesystem';
import { ModalWidgetProps } from 'partials';

type Props = ModalWidgetProps & { file: DeFile };

const ViewFileWidget = ({
  open, onClose, file
}: Props) => {
  return (
    <WidgetModal
      open={open}
      onClose={onClose}
    >
      {
        (file) ?
          <div>
            <p>{file.name}</p>
            <p>Preview WIP</p>
          </div>
          : <></>
      }
      <Modal.Actions>
        <div className="flex justify-center align-center">
          <Button>Download</Button>
        </div>
      </Modal.Actions>
    </WidgetModal>
  )
}

export default ViewFileWidget;