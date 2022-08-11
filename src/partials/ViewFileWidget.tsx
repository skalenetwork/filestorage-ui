// @ts-nocheck

import { useState, useEffect } from 'react';
import { Button, Modal } from '@/components/common';
import WidgetModal from '@/components/WidgetModal';
import type { DeFile } from '@/packages/filemanager';
import { ModalWidgetProps } from 'partials';
import { ContextType, useFileManagerContext } from '../context';
import DocumentTextIcon from '@heroicons/react/outline/DocumentTextIcon';
import { mimeData } from '../utils';

import { toast } from 'react-toastify';

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
      style={{
        maxWidth: '50vw',
        maxHeight: '60vh',
        height: '100%'
      }}
      className="justify-between"
      open={open}
      onClose={onClose}
      heading={file.name}
    >
      {
        (file) ?
          <div
            className="
              text-center
              flex flex-col justify-center items-center gap-6 flex-grow">
            {
              (pre === "image") ? <img src={link} alt="" className="max-h-52" />
                : (pre === "audio") ?
                  <audio controls>
                    <source src={link} type={type} />
                  </audio>
                  :
                  (pre === "video") ?
                    <video src={link} controls className="max-h-52"></video>
                    : <>
                      <p>To see the full file, please download it first.</p>
                      <Icon className="w-36 h-36 text-gray-900" />
                    </>
            }
          </div>
          : <></>
      }
      < Modal.Actions >
        <div className="flex justify-center align-center">
          <button className="btn" onClick={(e) => {
            e.preventDefault();
            toast.promise(file.manager.downloadFile(file), {
              pending: `Preparing file - ${file.name}`,
              success: `Downloading file - ${file.name}`,
              error: `Failed to fetch file - ${file.name}`
            }, { autoClose: 2000 });
          }}>Download</button>
        </div>
      </Modal.Actions >
    </WidgetModal >
  )
}

export default ViewFileWidget;