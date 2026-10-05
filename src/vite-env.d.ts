/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE00_ROOT?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_API_BASE?: string;
  readonly VITE_DEV_PROXY_TARGET?: string;
  readonly VITE_ADMIN_EMAILS?: string;
  readonly VITE_APP_BUILD_ID?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_SITE00_CANONICAL_ORIGIN?: string;
  readonly VITE_SITE00_CLOUD_PREVIEW?: string;
  /** Cloud preview builds only — enables Experience Compiler PREVIEW_GUEST when combined with tunnel/preview meta. */
  readonly VITE_SITE00_EC_PREVIEW_GUEST?: string;
  /** Cloud preview builds only — enables `/app/preview/*` fixture QA on tunnel (not production site00.com). */
  readonly VITE_SITE00_CLIENT_APP_PREVIEW?: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
