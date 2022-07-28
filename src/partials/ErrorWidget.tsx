import WidgetModal from "@/components/WidgetModal";
import type { ModalWidgetProps } from "partials";
import { ReactNode } from "react";

type Props = ModalWidgetProps & {
  open: boolean,
  children: ReactNode
}

const ErrorWidget = ({
  open,
  onClose,
  children
}: Props) => {
  <WidgetModal
    open={open}
    onClose={onClose}
    heading="Something went wrong"
  >
    {children ? children : null}
  </WidgetModal>
}

export default ErrorWidget;