import prettyBytes from 'pretty-bytes';
import { FormEvent } from 'react';
import { Button, Input, Modal } from '@/components/common';
import UploadIcon from '@heroicons/react/outline/UploadIcon';

import { useFieldArray } from 'react-hook-form';
import { ModalWidgetProps, FormProps } from 'partials';
import { WidgetMode } from 'fortmatic/dist/cjs/src/core/sdk';
import WidgetModal from '@/components/WidgetModal';

type Props = ModalWidgetProps & FormProps & {
  batchThreshold: number
};

const UploadWidget = (
  { open, formControl, formRegister, batchThreshold, onClose, onSubmit }: Props
) => {

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control: formControl,
    name: "uploads",
  });

  const clearFields = () => {
    fields.forEach((field, index) => {
      remove(index);
    });
  }

  return (
    <WidgetModal
      open={open}
      onClose={() => {
        clearFields();
        onClose();
      }}
      heading="Upload files"
    >
      <form onSubmit={(e) => {
        onSubmit(e);
        clearFields();
      }}>
        <Modal.Body className="w-full flex flex-col gap-1.5 justify-center items-center min-w-72">
          {
            (fields.length > batchThreshold) ?
              (
                <div>
                  <p>You're batch uploading {fields.length} files.</p>
                  <p>Batch uploads may take a while, files cannot be renamed.</p>
                </div>
              )
              : (fields.length > 1) ?

                (
                  fields
                    .map((field, index) => (
                      <div key={field.id} className="flex flex-row justify-between">
                        <input
                          className="px-2 py-1 grow relative focus:border-gray-500 focus:outline-none"
                          {...formRegister(`uploads.${index}.name` as any)}
                        />
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
                    <UploadIcon className="h-24 w-24 my-4" />
                    <p>Select files to upload.</p>
                  </>)
          }
        </Modal.Body>
        <Modal.Actions className="flex justify-center items-center gap-8">
          {
            fields.length ?
              <>
                <Button type="submit" className="btn-wide">Upload</Button>
              </>
              :
              <>
                <label className="btn btn-wide" htmlFor="file-upload">
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