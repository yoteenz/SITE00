/**
 * Cloud mobile preview (Vite dev tunnel) — not production Railway/cPanel.
 * Used to gate dev-only APIs such as Digital Foundation preview bootstrap and admin bypass.
 */
export function isCloudMobilePreviewDev(): boolean {
  const v = process.env.SITE00_CLOUD_MOBILE_PREVIEW;
  if (v !== '1' && v !== 'true') return false;
  // Vite `preview` (bundled tunnel dist) runs with NODE_ENV=production — still dev-only cloud preview.
  const review =
    process.env.SITE00_CLIENT_REVIEW_PREVIEW_MODE === '1' ||
    process.env.SITE00_CLIENT_REVIEW_PREVIEW_MODE === 'true';
  if (review) return true;
  if (process.env.NODE_ENV === 'production') return false;
  return true;
}

/** Synthetic admin identity for preview-only founder console (memory store, no Supabase session). */
export const CLOUD_PREVIEW_FOUNDER_ADMIN_USER = {
  id: 'cloud-preview-founder',
  email: 'kateenaarmstrong@gmail.com',
  accessToken: 'cloud-preview',
} as const;
