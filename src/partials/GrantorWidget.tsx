import WidgetModal from "@/components/WidgetModal";
import type { FormProps, ModalWidgetProps } from "partials";

type Props = ModalWidgetProps & FormProps;

const GrantorWidget = ({
  open,
  onClose
}: Props) => {
  <WidgetModal
    open={open}
    onClose={onClose}
    heading="Grant allocator role"
  >

  </WidgetModal>
}

export default GrantorWidget;