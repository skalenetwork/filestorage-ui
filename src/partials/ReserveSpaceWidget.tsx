import type { ModalWidgetProps, FormProps } from "partials";
import { Button, Input, Modal } from "@/components/common";
import WidgetModal from "@/components/WidgetModal";
import ArchiveIcon from "@heroicons/react/outline/ArchiveIcon";

type Props = ModalWidgetProps & FormProps;

const ReserveSpaceWidget = ({
  open, onClose, onSubmit, formRegister
}: Props) => {

  return (
    <WidgetModal
      open={open}
      onClose={onClose}
      heading="Reserve space"
    >
      <ArchiveIcon className="h-24 w-24" />
      <form onSubmit={onSubmit}>
        <Modal.Body className="w-full flex flex-col gap-4 justify-center items-center">
          <p>
            Enter the address to which the space will be allocated.
          </p>
          <div>
            <label className="label" htmlFor="">
              <span className="label-text">Address</span>
            </label>
            <Input
              type="text"
              placeholder="0x..."
              {...formRegister('reserveSpaceAddress')}
            />
          </div>
          <div>
            <label className="label" htmlFor="">
              <span className="label-text">Space to reserve</span>
            </label>
            <Input
              type="number"
              placeholder="Space to reserve"
              {...formRegister('reserveSpaceAmount')}
            />
          </div>
        </Modal.Body>
        <Modal.Actions className="flex justify-center items-center gap-8">
          <Button>Reserve</Button>
          <a className="underline cursor-pointer" onClick={onClose}>Cancel</a>
        </Modal.Actions>
      </form>
    </WidgetModal>
  )
}

export default ReserveSpaceWidget;