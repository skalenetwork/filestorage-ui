import WidgetModal from "@/components/WidgetModal";
import ArchiveIcon from "@heroicons/react/outline/ArchiveIcon";
import XIcon from "@heroicons/react/outline/XIcon";
import type { FormProps, ModalWidgetProps } from "partials";
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
      heading="Create new directory"
    >
      <form className="w-full" onSubmit={onSubmit}>
        <Modal.Body className="w-full flex flex-col gap-4 justify-center items-center">
          <p>
            Give your folder a name.
          </p>
          <div className="w-full flex flex-col flex-grow">
            <label className="label" htmlFor="">
              <span className="label-text">Name</span>
            </label>
            <Input
              className="w-full"
              {...formRegister('directoryName')}
            />
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