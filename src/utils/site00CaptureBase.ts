/**
 * Resolve the origin Railway Playwright should open for founder CAPTURE NOW.
 * Preview hosts (fsbw-dev, cloud tunnel) often miss fresh .htaccess — deep routes 404 on refresh.
 * Capture targets canonical production so screenshots match live routes.
 */

export function resolveFounderCaptureBaseUrl(): string {
  if (typeof window === 'undefined') return 'https://site00.com';

  const host = window.location.hostname.toLowerCase();
  const envOrigin = (
    (import.meta as unknown as { env?: { VITE_SITE00_CANONICAL_ORIGIN?: string } }).env
      ?.VITE_SITE00_CANONICAL_ORIGIN ?? ''
  ).replace(/\/$/, '');

  if (host.includes('fsbw-dev.com') || host.endsWith('.trycloudflare.com')) {
    return envOrigin || 'https://site00.com';
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
