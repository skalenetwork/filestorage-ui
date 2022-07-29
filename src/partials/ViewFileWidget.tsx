import { useState, useEffect } from 'react';
import { Button, Modal } from '@/components/common';
import WidgetModal from '@/components/WidgetModal';
import type { DeFile } from '@/services/filesystem';
import { ModalWidgetProps } from 'partials';

type Props = ModalWidgetProps & { file: DeFile };

const ViewFileWidget = ({
  open, onClose, file
}: Props) => {
  const [fileData, setFileData] = useState<ArrayBuffer>();

  useEffect(() => {
    if (!file) return;
    setFileData(undefined);
    (async () => {
      const buffer = await file.arrayBuffer();
      setFileData(buffer);
    })()
  }, [file])

  return (
    <WidgetModal
      open={open}
      onClose={onClose}
    >
      {
        (file) ?
          <div>
            <p>{file.name}</p>
            <div className="w-96 h-[300px] bg-gray-200 text-center flex justify-center items-center">
              Preview WIP <br />
                Length: {fileData?.byteLength}
            </div>
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