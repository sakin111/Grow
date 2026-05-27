import React from "react";

import { FieldDescription } from "../ui/field";
import {
  getInputFieldError,
  IInputErrorState,
} from "@/lib/getInputFieldError";

interface InputFieldErrorProps {
  field: string;
  state: IInputErrorState | null;
}

const InputFieldError = ({
  field,
  state,
}: InputFieldErrorProps) => {
  const error = getInputFieldError(field, state);

  if (!error) {
    return null;
  }

  return (
    <FieldDescription className="text-red-600">
      {error.message}
    </FieldDescription>
  );
};

export default InputFieldError;