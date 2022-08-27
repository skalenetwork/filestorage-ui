import { Button, Input, Modal } from '@/components/common';
import UploadIcon from '@heroicons/react/outline/UploadIcon';

import { useFieldArray, useForm } from 'react-hook-form';
import { ModalWidgetProps, FormProps } from 'partials';
import WidgetModal from '@/components/WidgetModal';
import { useFileManagerContext, ContextType } from '../context';
import { useCallback, useEffect, useRef, useState } from 'react';
import Field from '@/components/Field';

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

  const { handleSubmit, control, formState: { errors, isValid }, trigger, reset, getValues } = form;

  const { fields, append, prepend, remove } = useFieldArray({
    control,
    name: "uploads",
  });

  const untouchableFiles = useRef<File[]>([]);

  useEffect(() => {
    console.log("#error-change", errors['uploads']);
  }, [errors['uploads']]);

  // validate when fields added
  useEffect(() => {
    trigger('uploads');
  }, [fields]);

  const isNameValid = useCallback((value: string) => {
    const existsOnRemote = listing.some(item => ((item.kind === "file") && item.name === value));
    const existsOnUploads = [...getValues("uploads"), ...untouchableFiles.current]
      .filter(item => (item.name === value)).length > 1;
    return !(existsOnRemote || existsOnUploads);
  }, [listing, fields]);

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
            let filesToUpload: File[] = data.uploads.map(({ name, file }) => {
              return new File([file], name);
            }).concat(untouchableFiles.current);
            // @ts-ignore
            onSubmit({ uploads: filesToUpload }, reset);
          }, console.error)(e);
        }}
      >
        <Modal.Body className="w-full flex flex-col gap-1.5 justify-center items-center min-w-72">
          {
            (fields.length > 0) ?
              <div className="w-full flex flex-col">
                {
                  ((fields.length + untouchableFiles.current.length) > batchThreshold) &&
                  <div className="text-center">
                    <p>You're batch uploading {fields.length + untouchableFiles.current.length} files.</p>
                    <p>Batch uploads may take a while, only conflicted files can be renamed.</p>
                  </div>
                }
                {
                  fields
                    .map((field, index) => (
                      <Field
                        key={field.id}
                        form={form}
                        label="Name"
                        errorMessage="File with name already exists"
                      >
                        <Field.Input
                          name={`uploads.${index}.name`}
                          validate={isNameValid}
                        />
                      </Field>
                    ))
                }
              </div>
              :
              <>
                <UploadIcon className="h-24 w-24 my-4" strokeWidth={1} />
                <p>Select files to upload.</p>
              </>
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
                    const allFiles: File[] = Array.from(e.target.files);
                    let cleanFiles: File[] = [];
                    allFiles.forEach(file => {
                      if (!isNameValid(file.name) || (allFiles.length <= batchThreshold)) {
                        append({
                          name: file.name,
                          file
                        });
                      } else {
                        cleanFiles.push(file);
                      }
                    });
                    untouchableFiles.current = cleanFiles;
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