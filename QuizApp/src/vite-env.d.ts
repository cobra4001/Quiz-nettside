interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_API_URL_BASE_PATH: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare module '*.css';

declare module '*.svg' {
  const value: string;
  export default value;
}