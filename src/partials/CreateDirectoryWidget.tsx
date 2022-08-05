import WidgetModal from "@/components/WidgetModal";
import type { FormProps, ModalWidgetProps } from "partials";
import { Button, Input, Modal } from "react-daisyui";
import { useForm } from "react-hook-form";

import config from '../config';
import FieldGroup from "@/components/FieldGroup";

type Props = ModalWidgetProps & FormProps;

const CreateDirectoryWidget = ({
  open,
  onClose,
  onSubmit
}: Props) => {

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      directoryName: ''
    } as {
      directoryName: string
    }
  });

  const close = () => {
    onClose();
    resetField('directoryName');
    clearErrors('directoryName');
  }

  const { handleSubmit, formState: { isValid }, resetField, clearErrors } = form;

  return (
    <WidgetModal
      open={open}
      onClose={close}
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
            <FieldGroup
              form={form}
              name="directoryName"
              label="Name"
              validate={(value) => {
                return (value.length <= config.uploader.maxFileDirNameLength) ? true : false;
              }}
              errorMessage="Directory name is invalid"
            />
          </div>
        </Modal.Body>
        <Modal.Actions className="flex justify-center items-center gap-8">
          <Button className="btn-wide" type="submit" disabled={!isValid}>Create</Button>
        </Modal.Actions>
      </form>
    </WidgetModal>
  )
}

export default CreateDirectoryWidget;