declare module 'env-auto' {
  export interface EnvType {
    NEXT_PUBLIC_API_URL: string;
    JWT_ACCESS_SECRET: string;
    NODE_ENV?: "development" | "staging" | "production";
  }
  export const nomad: EnvType;
}
