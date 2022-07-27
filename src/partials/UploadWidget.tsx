import prettyBytes from 'pretty-bytes';
import { FormEvent } from 'react';
import { Button, Input, Modal } from '@/components/common';
import UploadIcon from '@heroicons/react/outline/UploadIcon';

import { useFieldArray } from 'react-hook-form';
import { ModalWidgetProps, FormProps } from 'partials';
import { WidgetMode } from 'fortmatic/dist/cjs/src/core/sdk';
import WidgetModal from '@/components/WidgetModal';

type Props = ModalWidgetProps & FormProps;

const UploadWidget = (
  { open, formControl, formRegister, onClose, onSubmit }: Props
) => {

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control: formControl,
    name: "uploads",
  });

  const cancelUpload = () => {
    // @todo clear fields
    onClose();
  }

  return (
    <WidgetModal
      open={open}
      onClose={onClose}
    >
      <form onSubmit={onSubmit}>
        <Modal.Header className="text-center font-bold">
          Upload file
          </Modal.Header>
        <Modal.Body className="flex flex-col gap-1.5 justify-center items-center">
          {
            (fields.length > 1) ?
              (
                fields
                  .map((field, index) => (
                    <div key={field.id} className="flex flex-row justify-between w-72">
                      <div>
                        <input
                          {...formRegister(`uploads.${index}.name`)}
                        />
                      </div>
                      <p>{prettyBytes(0)}</p>
                    </div>
                  ))
              )
              : (fields.length === 1) ?
                (<>
                  <div>
                    <label htmlFor="" className="label">
                      <span className="label-text">Name</span>
                    </label>
                    <Input
                      type="text"
                      {...formRegister(`uploads.0.name`)}
                      required
                    />
                  </div>
                </>)
                :
                (<>
                  <p>Select files to upload.</p>
                  <UploadIcon className="h-24 w-24 my-4" />
                </>)
          }
        </Modal.Body>
        <Modal.Actions className="flex justify-center items-center gap-8">
          {
            fields.length ?
              <>
                <Button type="submit">Upload</Button>
                <span
                  className="underline cursor-pointer"
                  onClick={(e) => cancelUpload()}
                >Cancel</span>
              </>
              :
              <>
                <label className="btn" htmlFor="file-upload">
                  Select files
                  </label>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e: any) => {
                    const files: File[] = Array.from(e.target.files);
                    files.forEach(file => {
                      append({
                        name: file.name,
                        file
                      });
                    });
                  }}
                  multiple
                />
              </>
          }
        </Modal.Actions>
      </form>
    </WidgetModal>
  )
}

export default UploadWidget;