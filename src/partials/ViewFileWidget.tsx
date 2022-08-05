// @ts-nocheck

import { useState, useEffect } from 'react';
import { Button, Modal } from '@/components/common';
import WidgetModal from '@/components/WidgetModal';
import type { DeFile } from '@/services/filemanager';
import { ModalWidgetProps } from 'partials';
import ArchiveIcon from '@heroicons/react/outline/ArchiveIcon';
import { ContextType, useFileManagerContext } from '../context';
import DocumentTextIcon from '@heroicons/react/outline/DocumentTextIcon';
import VolumeUpIcon from '@heroicons/react/outline/VolumeUpIcon';

type Props = ModalWidgetProps & { file: DeFile };

const ViewFileWidget = ({
  open, onClose, file
}: Props) => {

  if (!file) {
    return
  }

  const [fileData, setFileData] = useState<ArrayBuffer>();

  const { getFileLink }: ContextType = useFileManagerContext();


  const pre = file.type.split("/")[0];
  const link = getFileLink(file);
  const className = "w-6 h-6 text-gray-400"

  return (
    <WidgetModal
      open={open}
      onClose={onClose}
      heading={file.name}
    >
      {
        (file) ?
          <div>
            <div className="w-96 h-36 border border-gray-100 text-center flex justify-center items-center">
              {
                (pre === "application") ? <DocumentTextIcon className={className} />
                  : (pre === "text") ? <DocumentTextIcon className={className} />
                    : (pre === "image") ? <img src={link} alt="" className="max-h-32" />
                      : (pre === "audio") ? <VolumeUpIcon className={className + " !text-green-500"} />
                        : (pre === "video") ? <video src={link} className="max-h-32"></video>
                          : <DocumentTextIcon className={className} />
              }
            </div>
          </div>
          : <></>
      }
      <Modal.Actions>
        <div className="flex justify-center align-center">
          <a href={link} className="btn" download target="_blank">Download</a>
        </div>
      </Modal.Actions>
    </WidgetModal>
  )
}

export default ViewFileWidget;