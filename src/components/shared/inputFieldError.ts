
import React from "react";

import { FieldDescription } from "../ui/field";
import { getInputFieldError, IInputErrorState } from "@/lib/getInputFieldError";

interface InputFieldErrorProps {
  field: string;
  state: IInputErrorState;
}

const InputFieldError = ({ field, state }: InputFieldErrorProps) => {
  const error = getInputFieldError(field, state);

  if (!error) {
    return null;
  }

  return React.createElement(
    FieldDescription,
    { className: "text-red-600" },
    error
  );
};

export default InputFieldError;