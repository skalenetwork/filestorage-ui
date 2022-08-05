import { UseFormStateReturn } from "react-hook-form";

const FieldError = ({ errors }: { errors: UseFormStateReturn<any>['errors'] }) => {
  return (errors['uploads']?.[index]?.['name']?.type as any) === "validate" &&
    <p className={`text-right text-sm py-1 text-red-400`}>
      {"File with the name already exists"}
    </p>
}

export default FieldError;