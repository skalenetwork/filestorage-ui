import { Button, Input, Modal } from '@/components/common';
import UploadIcon from '@heroicons/react/outline/UploadIcon';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { ModalWidgetProps, FormProps } from 'partials';
import WidgetModal from '@/components/WidgetModal';
import { useFileManagerContext, ContextType } from '../context';
import { triggerAsyncId } from 'async_hooks';

type Props = ModalWidgetProps & FormProps & {
  batchThreshold: number
};

const UploadWidget = (
  { open, batchThreshold, onClose, onSubmit }: Props
) => {

  const { directory, listing } = useFileManagerContext() as ContextType;

  const { handleSubmit, register, control, formState: { errors }, trigger } = useFormContext();

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control,
    name: "uploads",
  });

  const clearFields = () => {
    fields.forEach((field, index) => {
      remove(index);
    });
  }

  const fileNameRules = {
    required: true,
    validate: (value: string) => {
      console.log(value);
      return !listing.some(item => ((item.kind === "file") && item.name === value));
    }
  };

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
        handleSubmit(onSubmit)(e);
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
              : (fields.length > 0) ?
                (
                  fields
                    .map((field, index) => (
                      <div key={field.id}>
                        <label htmlFor="" className="label">
                          <span className="label-text">Name</span>
                        </label>
                        <Input
                          {...register(`uploads.${index}.name` as any, fileNameRules)}
                        />
                        { (errors['uploads']?.[index]?.['name']?.type as any) === "validate" &&
                          <p className={`text-right text-sm py-1 text-red-400`}>
                            {"File with the name already exists"}
                          </p>
                        }
                      </div>
                    ))
                )
                :
                (<>
                  <UploadIcon className="h-24 w-24 my-4" strokeWidth={1} />
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
                    trigger();
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