/**
 * Resolve the origin Railway Playwright should open for founder CAPTURE NOW.
 * Default: same origin the founder is QA'ing (fsbw-dev / tunnel) so capture matches what they see.
 * Override with VITE_SITE00_CANONICAL_ORIGIN to force production (e.g. site00.com).
 */

export function resolveFounderCaptureBaseUrl(): string {
  if (typeof window === 'undefined') return 'https://site00.com';

  const host = window.location.hostname.toLowerCase();
  const envOrigin = (
    (import.meta as unknown as { env?: { VITE_SITE00_CANONICAL_ORIGIN?: string } }).env
      ?.VITE_SITE00_CANONICAL_ORIGIN ?? ''
  ).replace(/\/$/, '');

  if (envOrigin) return envOrigin;

  if (host.includes('fsbw-dev.com') || host.endsWith('.trycloudflare.com')) {
    return window.location.origin.replace(/\/$/, '');
  }

  if (host === 'site00.com' || host.endsWith('.site00.com')) {
    return window.location.origin;
  }

  return window.location.origin;
}

export function isPreviewCaptureHost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  return host.includes('fsbw-dev.com') || host.endsWith('.trycloudflare.com');
}
