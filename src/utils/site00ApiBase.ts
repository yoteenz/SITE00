/**
 * Resolve SITE 00 API origin for browser fetches.
 * Preview hosts (fsbw-dev, cloudflare tunnel) must use Railway — local vite /api is often stale.
 */
export function resolveSite00ApiBase(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host.includes('fsbw-dev.com') || host.endsWith('.trycloudflare.com')) {
      return 'https://api.site00.com';
    }
  }

  const envBase = (
    (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ?? ''
  ).replace(/\/$/, '');
  if (envBase) return envBase;

  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host === 'site00.com' || host.endsWith('.site00.com')) {
      return 'https://api.site00.com';
    }
  }

  return '';
}

export function site00ApiUrl(path: string): string {
  const base = resolveSite00ApiBase();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}
