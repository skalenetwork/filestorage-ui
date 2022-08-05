import WidgetModal from "@/components/WidgetModal";
import type { FormProps, ModalWidgetProps } from "partials";
import { useForm } from "react-hook-form";
import FieldGroup from "@/components/FieldGroup";
import Web3 from "web3";
import { Button, Modal } from "@/components/common";

type Props = ModalWidgetProps & FormProps;

const GrantorWidget = ({
  open,
  onClose,
  onSubmit
}: Props) => {

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      granteeAddress: ''
    }
  });

  const { handleSubmit, formState: { isValid }, resetField } = form;

  return (
    <WidgetModal
      open={open}
      onClose={onClose}
      heading="Grant allocator role"
    >
      <form className="w-full" onSubmit={handleSubmit((e) => {
        onSubmit(e);
        resetField('granteeAddress');
      })}>
        <Modal.Body className="w-full flex flex-col gap-4 justify-center items-center">
          <p>
            Give your folder a name.
          </p>
          <div className="relative w-full flex flex-col flex-grow">
            <FieldGroup
              form={form}
              name="granteeAddress"
              label="Name"
              validate={(val) => Web3.utils.isAddress(val)}
              errorMessage="Address is invalid"
            />
          </div>
        </Modal.Body>
        <Modal.Actions className="flex justify-center items-center gap-8">
          <Button className="btn-wide" type="submit" disabled={!isValid}>Create</Button>
        </Modal.Actions>
      </form>
    </WidgetModal>
  );

}

export default GrantorWidget;