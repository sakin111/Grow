export type RegisterState =
  | {
      success: true;
      email: string;
      message: string;
      redirectTo: string;
      errors?: never;
    }
  | {
      success: false;
      message: string;
      errors?: {
        field: string | number;
        message: string;
      }[];
      email?: never;
      redirectTo?: never;
    }
  | null;