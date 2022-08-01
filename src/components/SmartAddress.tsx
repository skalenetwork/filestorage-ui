import { useState, useEffect, useRef, useLayoutEffect, RefObject } from 'react';
import FormattedAddress from './FormattedAddress';

import CheckIcon from '@heroicons/react/solid/CheckIcon';
import XIcon from '@heroicons/react/solid/XIcon';

const SmartAddress = (
  { className, address, onEdit, offEdit, onConfirm }:
    { className: string, address: string, onEdit: Function, offEdit: Function, onConfirm: Function }
) => {
  const inputField = useRef<any>();
  const [edit, setEdit] = useState<boolean | undefined>(undefined);
  useLayoutEffect(() => {
    if (edit === false) {
      offEdit();
    }
    if (edit === true) {
      onEdit();
      inputField.current.focus();
    }
  }, [edit]);

  return (
    <div className={className}>
      <p className={(edit === true) ? "hidden" : ""}
        onClick={e => {
          setEdit(true);
        }}
      >
        <FormattedAddress address={address || ""} pre={5} post={10} /> &emsp;/
      </p>
      {
        (edit === true) ?
          <p className="flex items-center">
            <input
              className="input text-base !border-blue-300 !focus:border-blue-300 w-[576px]"
              type="text"
              defaultValue={address}
              ref={inputField}
              onBlur={() => setEdit(false)}
            />
            <div className="relative flex items-center -translate-x-24">
              {
                (true) ?
                  <span className="btn btn-square btn-ghost" onClick={(e) => {
                    let { value } = inputField.current;
                    onConfirm(value);
                    setEdit(false);
                  }}>
                    <CheckIcon className="h-5 w-5 text-green-500" />
                  </span>
                  : <></>
              }
              <span className="btn btn-square btn-ghost"
                onClick={(e) => {
                  setEdit(false);
                }}
              >
                <XIcon className="h-5 w-5 text-gray-500" />
              </span>
            </div>
          </p>
          : null
      }
    </div>
  )
};

export default SmartAddress;