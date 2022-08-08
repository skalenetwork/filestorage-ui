import { ReactNode } from 'react';
import { Modal } from '@/components/common';
import XIcon from '@heroicons/react/outline/XIcon';

const WidgetModal = (
  { className, children, open, onClose, heading }:
    { className?: string, children: ReactNode, open: boolean, onClose: () => void, heading?: string }
) => {
  return (
    <Modal
      className={`p-16 first-letter:gap-4 flex flex-col justify-start items-center ${className || ''}`}
      open={open}
      onClickBackdrop={onClose}
    >
      <XIcon
        className="w-4 h-4 absolute right-8 top-8 cursor-pointer"
        onClick={onClose}
      />
      {
        (heading) ?
          <Modal.Header className="mb-4 text-center text-2xl font-medium">
            {heading}
          </Modal.Header>
          : <></>
      }
      {children}
    </Modal>
  );
}

export default WidgetModal;