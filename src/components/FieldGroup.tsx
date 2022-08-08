
//@ts-nocheck

import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "./common";

const FieldGroup = ({
  form,
  name,
  label,
  placeholder,
  validate,
  errorMessage
}: {
  form: UseFormReturn<any, any>,
  name: string,
  label?: string,
  placeholder?: string,
  validate?: (val: string) => void | Object,
  errorMessage?: string
}) => {

  const { formState: { errors } } = form;

  const fieldError = name.split('.').reduce((o, key) => o?.[key], errors);

  const [error, setError] = useState(undefined);

  useEffect(() => {
    setError(fieldError);
  }, [fieldError]);

  return (
    <>
      {
        label &&
        <label className="label" htmlFor="">
          <span className="label-text">{label}</span>
        </label>
      }
      <Input
        className={(error) ? ' !border-red-500' : ''}
        type="text"
        placeholder={placeholder || ''}
        {
        ...form.register(`${name}` as `${string}`, {
          required: "Field is required",
          validate: validate
        })
        }
      />
      {
        (error?.message || errorMessage) &&
        <p className={`text-right text-sm text-red-500 ${(!error ? 'opacity-0' : '')}`}>
          {error ? (error?.message || errorMessage) : "-"}
        </p>
      }
    </>
  )
}

export default FieldGroup;