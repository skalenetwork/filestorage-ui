import type { ModalWidgetProps, FormProps } from "partials";
import { Button, Input, Modal } from "@/components/common";
import WidgetModal from "@/components/WidgetModal";
import ArchiveIcon from "@heroicons/react/outline/ArchiveIcon";
import { useForm, UseFormRegisterReturn, UseFormReturn } from "react-hook-form";
import Web3 from "web3";
import { ContextType, useFileManagerContext } from "../context";
import Field from "@/components/Field";

type Props = ModalWidgetProps & FormProps;

const ReserveSpaceWidget = ({
  open, onClose, onSubmit
}: Props) => {

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      reserveSpaceAddress: '',
      reserveSpaceAmount: '',
      reserveSpaceUnit: 'kb'
    }
  });

  const { handleSubmit, formState: { isValid }, resetField } = form;

  const reset = () => {
    resetField('reserveSpaceAddress');
    resetField('reserveSpaceAmount');
    resetField('reserveSpaceUnit');
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
            <Field
              form={form}
              label="Address"
              errorMessage="Address is invalid"
            >
              <Field.Input
                name="reserveSpaceAddress"
                placeholder="0x..."
                validate={(val) => Web3.utils.isAddress(val)}
              />
            </Field>
            <Field
              form={form}
              label="Space to reserve"
              errorMessage="Space amount is invalid"
            >
              <div className="flex flex-row">
                <Field.Input
                  className="!rounded-r-none"
                  name="reserveSpaceAmount"
                  placeholder="1337"
                  validate={(val) => !isNaN(Number(val))}
                />
                <Field.Select
                  className="!rounded-l-none"
                  name="reserveSpaceUnit"
                >
                  <option value="kb">kB</option>
                  <option value="mb">MB</option>
                  <option value="gb">GB</option>
                </Field.Select>
              </div>
            </Field>
          </div>
        </Modal.Body>
        <Modal.Actions className="flex justify-center items-center gap-8">
          <Button type="submit" disabled={!isValid}>Reserve</Button>
          <a className="underline cursor-pointer" onClick={() => {
            close();
            reset();
          }}>Cancel</a>
        </Modal.Actions>
      </form>
    </WidgetModal>
  )
}

export default ReserveSpaceWidget;