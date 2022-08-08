// @ts-nocheck

import { useState, useEffect } from 'react';
import { Button, Modal } from '@/components/common';
import WidgetModal from '@/components/WidgetModal';
import type { DeFile } from '@/services/filemanager';
import { ModalWidgetProps } from 'partials';
import { ContextType, useFileManagerContext } from '../context';
import DocumentTextIcon from '@heroicons/react/outline/DocumentTextIcon';
import { mimeData } from '../utils';

type Props = ModalWidgetProps & { file: DeFile };

const ViewFileWidget = ({
  open, onClose, file
}: Props) => {

  if (!file) {
    return
  }

  const [fileData, setFileData] = useState<ArrayBuffer>();

  const { getFileLink }: ContextType = useFileManagerContext();

  const { Icon, type, color, label, category } = mimeData(file.type);

  const pre = file.type.split("/")[0];
  const link = getFileLink(file);

  return (
    <WidgetModal
      className="!max-w-[600px]"
      open={open}
      onClose={onClose}
      heading={file.name}
    >
      {
        (file) ?
          <div>
            <div
              className="
              w-96 h-48 borde text-center
              flex justify-center items-center">
              {
                (pre === "image") ? <img src={link} alt="" className="max-h-48" />
                  : (pre === "audio") ?
                    <audio controls>
                      <source src={link} type={type} />
                    </audio>
                    :
                    (pre === "video") ?
                      <video src={link} controls className="max-h-48"></video>
                      : <Icon className="w-24 h-24 text-gray-400" />
              }
            </div>
          </div>
          : <></>
      }
      <Modal.Actions>
        <div className="flex justify-center align-center">
          <a href={link} className="btn" download>Download</a>
        </div>
      </Modal.Actions>
    </WidgetModal>
  )
}

export default ViewFileWidget;