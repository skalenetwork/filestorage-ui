import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import FormattedAddress from './FormattedAddress';
import { useController, useForm } from "react-hook-form";

import CheckIcon from '@heroicons/react/solid/CheckIcon';
import XIcon from '@heroicons/react/solid/XIcon';
import Web3 from 'web3';
import { Input } from './common';

const SmartAddress = (
  { className, address, onEdit, offEdit, onConfirm }:
    { className: string, address: string, onEdit: Function, offEdit: Function, onConfirm: Function }
) => {
  const [edit, setEdit] = useState<boolean | undefined>(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { control, setFocus, resetField, getValues, reset } = useForm({
    defaultValues: {
      address: ""
    },
    mode: "onChange"
  });

  const {
    field,
    fieldState,
    formState: { touchedFields, dirtyFields }
  } = useController({
    name: "address",
    control,
    rules: {
      required: true,
      validate(value) {
        return Web3.utils.isAddress(value);
      }
    }
  });

  useEffect(() => {
    console.log("error", fieldState.error);
    if (fieldState.error && fieldState.error.type === "validate") {
      setErrorMessage("Address is invalid");
    } else {
      setErrorMessage("");
    }
  }, [fieldState.error])

  useLayoutEffect(() => {
    if (edit === false) {
      offEdit();
      reset({ address: address });
    }
    if (edit === true) {
      onEdit();
      setFocus("address");
    }
  }, [edit + address]);

  return (
    <div className={className}>
      <p className={(edit === true) ? "hidden" : ""}
        onClick={e => {
          setEdit(true);
        }}
      >
        <FormattedAddress address={address || ""} pre={5} post={10} />
      </p>
      <div className={`flex items-center ${edit === false ? "hidden" : ""}`}>
        <div className="relative w-[576px]">
          <Input
            className="relative text-base !border-blue-300 !focus:border-blue-300 w-full"
            {...field}
          />
          {(errorMessage) && <p className="py-1 px-2 absolute right-0 text-red-400 text-sm bg-white rounded">{errorMessage}</p>}
        </div>

        <div className="relative flex justify-end items-center -translate-x-24 w-24">
          <span
            className={`btn btn-square btn-ghost ${(fieldState.error) ? 'hidden' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              console.log("onClick", getValues("address"));
              onConfirm(getValues("address"));
              setEdit(false);
            }}
          >
            <CheckIcon className="h-5 w-5 text-green-500" />
          </span>
          <span className="btn btn-square btn-ghost"
            onClick={(e) => {
              setEdit(false);
            }}
          >
            <XIcon className="h-5 w-5 text-gray-500" />
          </span>
        </div>
      </div>
    </div>
  )
};

export default SmartAddress;