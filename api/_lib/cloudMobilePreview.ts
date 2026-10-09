/**
 * Cloud mobile preview (Vite dev tunnel) — not production Railway/cPanel.
 * Used to gate dev-only APIs such as Digital Foundation preview bootstrap and admin bypass.
 */
export function isCloudMobilePreviewDev(): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  const v = process.env.SITE00_CLOUD_MOBILE_PREVIEW;
  return v === '1' || v === 'true';
}

/** Synthetic admin identity for preview-only founder console (memory store, no Supabase session). */
export const CLOUD_PREVIEW_FOUNDER_ADMIN_USER = {
  id: 'cloud-preview-founder',
  email: 'kateenaarmstrong@gmail.com',
  accessToken: 'cloud-preview',
} as const;
