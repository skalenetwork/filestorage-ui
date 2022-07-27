import type { UseFormReturn } from 'react-hook-form';

export type ModalWidgetProps = {
  open: boolean,
  onClose: () => void
}

export type FormProps = {
  formRegister: UseFormReturn['register'],
  formControl: UseFormReturn['control'],
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}