import WidgetModal from "@/components/WidgetModal";
import XIcon from "@heroicons/react/outline/XIcon";
import type { FormProps, ModalWidgetProps } from "partials";
import { SyntheticEvent, useRef } from "react";
import { Button, Input, Modal } from "react-daisyui";

type Props = ModalWidgetProps & FormProps;

const CreateDirectoryWidget = ({
  open,
  onClose,
  formRegister,
  formControl,
  onSubmit
}: Props) => {

  return (
    <WidgetModal
      open={open}
      onClose={onClose}
    >
      <XIcon
        className="w-5 h-5 absolute right-4 top-4 cursor-pointer"
        onClick={onClose}
      />
      <form onSubmit={onSubmit}>
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
              {...formRegister('directoryName')}
            />
          </div>
        </Modal.Body>
        <Modal.Actions className="flex justify-center items-center gap-8">
          <Button type="submit">Create</Button>
          <a className="underline cursor-pointer"
            onClick={(e) => {
              onClose();
            }}
          >Cancel</a>
        </Modal.Actions>
      </form>
    </WidgetModal>
  )
}

export default CreateDirectoryWidget;