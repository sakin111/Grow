declare module 'env-auto' {
  export interface EnvType {
    NEXT_PUBLIC_API_URL: string;
    JWT_ACCESS_SECRET: string;
  }
  export const nomad: EnvType;
}
