import WidgetModal from "@/components/WidgetModal";
import type { FormProps, ModalWidgetProps } from "partials";
import { useForm } from "react-hook-form";

type Props = ModalWidgetProps & FormProps;

const GrantorWidget = ({
  open,
  onClose
}: Props) => {

  const { handleSubmit, register, formState: { errors }, resetField } = useForm({
    mode: 'onChange',
    defaultValues: {
      reserveSpaceAddress: '',
      reserveSpaceAmount: ''
    }
  });

  return (
    <WidgetModal
      open={open}
      onClose={onClose}
      heading="Grant allocator role"
    >

    </WidgetModal>
  );

}

export default GrantorWidget;