import type { ModalWidgetProps } from "partials";
import { SyntheticEvent, useRef } from "react";
import { Button, Input, Modal } from "react-daisyui";

type Props = ModalWidgetProps & {
  onSubmit: (data: { name: string }) => void
}

const CreateDirectoryWidget = ({
  open,
  onClose,
  onSubmit
}: Props) => {

  const newDirectoryField = useRef<HTMLInputElement>();

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    const name = newDirectoryField.current?.value;
    if (!name) {
      // @todo handle as part of validation, use hook-form
      return;
    }
    (newDirectoryField.current as HTMLInputElement).value = "";
    onSubmit({ name });
  }

  return (
    <Modal
      className="gap-4 flex flex-col justify-center items-center"
      open={open}
      onClickBackdrop={onClose}
    >
      <Modal.Header className="text-center font-bold">
        Create new directory
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4 justify-center items-center">
        <p>
          Give your folder a name.
          </p>
        <div>
          <label className="label" htmlFor="">
            <span className="label-text">Name</span>
          </label>
          <Input
            type="text"
            placeholder="New directory name"
            required
            ref={newDirectoryField}
          />
        </div>
      </Modal.Body>
      <Modal.Actions className="flex justify-center items-center gap-8">
        <Button onClick={handleSubmit}>Create</Button>
        <a className="underline cursor-pointer"
          onClick={(e) => {
            onClose();
            (newDirectoryField.current as HTMLInputElement).value = "";
          }}
        >Cancel</a>
      </Modal.Actions>
    </Modal>
  )
}

export default CreateDirectoryWidget;