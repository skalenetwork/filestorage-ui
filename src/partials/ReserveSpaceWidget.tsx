import type { ModalWidgetProps, FormProps } from "partials";
import { Button, Input, Modal } from "@/components/common";
import WidgetModal from "@/components/WidgetModal";
import ArchiveIcon from "@heroicons/react/outline/ArchiveIcon";
import { useForm } from "react-hook-form";

type Props = ModalWidgetProps & FormProps;

const ReserveSpaceWidget = ({
  open, onClose, onSubmit
}: Props) => {

  const { handleSubmit, register, formState: { errors }, resetField } = useForm({
    mode: 'onChange',
    defaultValues: {
      reserveSpaceAddress: '',
      reserveSpaceAmount: ''
    }
  });

  const reset = () => {
    resetField('reserveSpaceAddress');
    resetField('reserveSpaceAmount');
  }

  const close = () => {
    onClose();
    reset();
  }

  return (
    <WidgetModal
      open={open}
      onClose={close}
      heading="Reserve space"
    >
      <ArchiveIcon className="h-24 w-24" strokeWidth={1} />
      <form className="w-full" onSubmit={handleSubmit((e) => {
        onSubmit(e);
        reset();
      })}>
        <Modal.Body className="w-full flex flex-col gap-4 justify-center items-center">
          <p>
            Enter the address to which the space will be allocated.
          </p>
          <div className="w-full flex flex-col flex-grow">
            <label className="label" htmlFor="">
              <span className="label-text">Address</span>
            </label>
            <Input
              type="text"
              placeholder="0x..."
              {
              ...register('reserveSpaceAddress', {
                required: true
              })
              }
            />
            <label className="label" htmlFor="">
              <span className="label-text">Space to reserve</span>
            </label>
            <Input
              className="appearance-none"
              type="number"
              placeholder="Space to reserve"
              {...register('reserveSpaceAmount', {
                required: true
              })}
            />
          </div>
        </Modal.Body>
        <Modal.Actions className="flex justify-center items-center gap-8">
          <Button>Reserve</Button>
          <a className="underline cursor-pointer" onClick={close}>Cancel</a>
        </Modal.Actions>
      </form>
    </WidgetModal>
  )
}

export default ReserveSpaceWidget;