import ArchiveIcon from "@heroicons/react/outline/ArchiveIcon";
import type { ModalWidgetProps } from "partials";
import { SyntheticEvent, useRef } from "react";
import { Button, Input, Modal } from "react-daisyui";

type Props = ModalWidgetProps & {
  onSubmit: (data: {}) => void
}

const ReserveSpaceWidget = ({
  open, onClose, onSubmit
}: Props) => {

  const reserveAddrField = useRef<HTMLInputElement>();
  const reserveSpaceField = useRef<HTMLInputElement>();

  const resetForm = () => {
  }

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    const address = reserveAddrField.current?.value;
    const space = reserveSpaceField.current?.value;
    onSubmit({ address, space });
  }

  return (
    <Modal
      className="gap-4 flex flex-col justify-center items-center"
      open={open}
      onClickBackdrop={onClose}
    >
      <Modal.Header className="text-center font-bold flex flex-col items-center justify-center">
        <ArchiveIcon className="h-24 w-24" />
        <p>Reserve Space</p>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4 justify-center items-center">
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
          />
        </div>
        <div>
          <label className="label" htmlFor="">
            <span className="label-text">Space to reserve</span>
          </label>
          <Input
            type="number"
            placeholder="Space to reserve"
          />
        </div>
      </Modal.Body>
      <Modal.Actions className="flex justify-center items-center gap-8">
        <Button onClick={handleSubmit}>Reserve</Button>
        <a className="underline cursor-pointer" onClick={() => {
          resetForm();
          onClose();
        }}>Cancel</a>
      </Modal.Actions>
    </Modal>
  )
}

export default ReserveSpaceWidget;