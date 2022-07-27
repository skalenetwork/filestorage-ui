import { ReactNode } from 'react';
import { Modal } from '@/components/common';
import XIcon from '@heroicons/react/outline/XIcon';

const WidgetModal = (
  { children, open, onClose }:
    { children: ReactNode, open: boolean, onClose: () => void }
) => {
  return (
    <Modal
      className="gap-4 flex flex-col justify-center items-center"
      open={open}
      onClickBackdrop={onClose}
    >
      <XIcon
        className="w-5 h-5 absolute right-4 top-4 cursor-pointer"
        onClick={onClose}
      />

      {children}
    </Modal>
  );
}

export default WidgetModal;