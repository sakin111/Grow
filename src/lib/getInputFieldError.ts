export interface IInputErrorState {
  errors?: {
    field: string | number;
    message: string;
  }[];
}

export const getInputFieldError = (
  field: string,
  state: IInputErrorState | null
) => {
  if (!state?.errors) return null;

  return state.errors.find((err) => err.field === field) ?? null;
};