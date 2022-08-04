import WidgetModal from "@/components/WidgetModal";
import type { FormProps, ModalWidgetProps } from "partials";
import { useEffect, useState } from "react";
import { Button, Input, Modal } from "react-daisyui";
import { useForm, useFormContext } from "react-hook-form";

import config from '../config';

type Props = ModalWidgetProps & FormProps;

const CreateDirectoryWidget = ({
  open,
  onClose,
  onSubmit
}: Props) => {

  const { handleSubmit, register, formState: { errors }, resetField } = useForm({
    mode: 'onChange',
    defaultValues: {
      directoryName: ''
    } as {
      directoryName: string
    }
  });

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    console.log("error", errors['directoryName']);
    if (errors['directoryName'] && (errors['directoryName']?.type as any) === "validate") {
      setErrorMessage("Directory name is invalid");
    } else {
      setErrorMessage("");
    }
  }, [errors['directoryName']?.type])

  return (
    <WidgetModal
      open={open}
      onClose={onClose}
      heading="Create new directory"
    >
      <form className="w-full" onSubmit={handleSubmit((e) => {
        onSubmit(e);
        resetField('directoryName');
      })}>
        <Modal.Body className="w-full flex flex-col gap-4 justify-center items-center">
          <p>
            Give your folder a name.
          </p>
          <div className="relative w-full flex flex-col flex-grow">
            <label className="label" htmlFor="">
              <span className="label-text">Name</span>
            </label>
            <Input
              className="w-full"
              {...register('directoryName', {
                required: true,
                validate: (value) => {
                  return (value.length <= config.uploader.maxFileDirNameLength) ? true : false;
                }
              })}
            />
            <p className={`text-right text-sm py-1 text-red-400 ${(!errorMessage ? 'opacity-0' : '')}`}>
              {errorMessage || "-"}
            </p>
          </div>
        </Modal.Body>
        <Modal.Actions className="flex justify-center items-center gap-8">
          <Button className="btn-wide" type="submit">Create</Button>
        </Modal.Actions>
      </form>
    </WidgetModal>
  )
}

export default CreateDirectoryWidget;