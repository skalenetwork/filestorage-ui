import { Button, Input, Modal } from '@/components/common';
import UploadIcon from '@heroicons/react/outline/UploadIcon';

import { useFieldArray, useForm } from 'react-hook-form';
import { ModalWidgetProps, FormProps } from 'partials';
import WidgetModal from '@/components/WidgetModal';
import { useFileManagerContext, ContextType } from '../context';
import { useCallback, useEffect } from 'react';
import FieldGroup from '@/components/FieldGroup';

type Props = ModalWidgetProps & FormProps & {
  batchThreshold: number
};

const UploadWidget = (
  { open, batchThreshold, onClose, onSubmit }: Props
) => {

  const { directory, listing } = useFileManagerContext() as ContextType;

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      uploads: [],
    } as {
      uploads: { name: string, file: File }[]
    }
  });

  const { handleSubmit, control, formState: { errors, isValid }, trigger, watch, reset } = form;

  const { fields, append, prepend, remove, insert } = useFieldArray({
    control,
    name: "uploads",
  });

  // culprit for handleSubmit glitching out, replaced by reset()
  const clearFields = useCallback(() => {
    remove(fields.map((field, i) => i));
  }, [fields]);

  useEffect(() => {
    console.log("#error-change", errors['uploads']);
  }, [errors['uploads']]);

  useEffect(() => {
    trigger('uploads');
  }, [fields]);

  return (
    <WidgetModal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      heading="Upload files"
    >
      <form
        className="w-full"
        onSubmit={(e) => {
          handleSubmit((data) => {
            // @ts-ignore
            onSubmit(data, reset);
          }, console.error)(e);
        }}
      >
        <Modal.Body className="w-full flex flex-col gap-1.5 justify-center items-center min-w-72">
          {
            (fields.length > batchThreshold) ?
              (
                <div className="w-full">
                  <p>You're batch uploading {fields.length} files.</p>
                  <p>Batch uploads may take a while, files cannot be renamed.</p>
                </div>
              )
              : (fields.length > 0) ?
                (<div className="w-full flex flex-col">
                  {
                    fields
                      .map((field, index) => (
                        <FieldGroup
                          key={field.id}
                          form={form}
                          name={`uploads.${index}.name`}
                          label="Name"
                          validate={(value: string) => {
                            const existsOnRemote = listing.some(item => ((item.kind === "file") && item.name === value));
                            const existsOnUploads = fields.some(item => (item.name === value)); // incosistent:debug
                            console.log(value, !existsOnRemote ? "VALID" : "INVALID");
                            return !existsOnRemote;
                          }}
                          errorMessage="File with name already exists"
                        />
                      ))
                  }
                </div>)
                :
                (<>
                  <UploadIcon className="h-24 w-24 my-4" strokeWidth={1} />
                  <p>Select files to upload.</p>
                </>
                )
          }
        </Modal.Body>
        <Modal.Actions className="flex justify-center items-center gap-8">
          {
            fields.length ?
              <>
                <Button
                  type="submit"
                  className="btn-wide"
                  disabled={!isValid}>Upload</Button>
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
    </WidgetModal >
  )
}

export default UploadWidget;