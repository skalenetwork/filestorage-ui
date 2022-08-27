//@ts-nocheck

import { createContext, ReactNode, useEffect, useState, useContext } from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "./common";

const FieldContext = createContext<{
  form: UseFormReturn<any, any> | undefined,
  error: { message: string } | undefined
}>({
  form: undefined,
  error: undefined
});

const useError = (name) => {
  const { form, error, setError } = useContext(FieldContext);
  const { formState: { errors } } = form;

  const fieldError = name.split('.').reduce((o, key) => o?.[key], errors);
  useEffect(() => {
    setError(fieldError);
  }, [fieldError]);

  return error;
}

const Field = ({
  form,
  label,
  errorMessage,
  children
}: {
  form: UseFormReturn<any, any>,
  label?: string,
  errorMessage?: string,
  children: ReactNode
}) => {

  const { formState: { errors }, getValues } = form;
  const [error, setError] = useState(undefined);

  return (
    <FieldContext.Provider value={{
      form,
      error,
      setError
    }}>
      {
        label &&
        <label className="label" htmlFor="">
          <span className="label-text">{label}</span>
        </label>
      }
      {children}
      {
        (error?.message || errorMessage) &&
        <p className={`text-right text-sm text-red-500 ${(!error ? 'opacity-0' : '')}`}>
          {error ? (error?.message || errorMessage) : "-"}
        </p>
      }
    </FieldContext.Provider>
  )
}

Field.Input = ({
  className,
  name,
  placeholder,
  validate,
}: {
  className?: string,
  name: string,
  placeholder?: string,
  validate?: (val: string) => void | Object,
}) => {

  useError(name);
  const { form, error } = useContext(FieldContext);

  return (form) ? (
    <Input
      className={`${className}` + ((error) ? ' !border-red-500' : '')}
      type="text"
      placeholder={placeholder || ''}
      {
      ...form.register(`${name}` as `${string}`, {
        required: "Field is required",
        validate: validate
      })
      }
    />
  ) : <></>;
}

Field.Select = ({
  className,
  name,
  placeholder,
  validate,
  children
}: {
  className?: string,
  name: string,
  placeholder?: string,
  validate?: (val: string) => void | Object,
  children: ReactNode
}) => {

  useError(name);
  const { form, error } = useContext(FieldContext);

  return (form) ? (
    <select
      className={`select ${className}` + ((error) ? ' !border-red-500' : '')}
      placeholder={placeholder || ''}
      {
      ...form.register(`${name}` as `${string}`, {
        required: "Field is required",
        validate: validate
      })
      }
    >
      {children}
    </select>
  ) : <></>;
}

export default Field;