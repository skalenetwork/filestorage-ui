import type { FieldErrorsImpl, FormState, UseFormReturn } from 'react-hook-form';

export type ModalWidgetProps = {
  open: boolean,
  onClose: () => void
}

export type FormProps = {
  formRegister: UseFormReturn['register'],
  formControl: UseFormReturn['control'],
  formErrors: FormState['errors'],
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}