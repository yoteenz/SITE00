/**
 * Browser API origin for SITE 00 client fetches (shared — safe in Vite bundles).
 * Mirrors src/utils/site00ApiBase.ts so shared modules never import from src/.
 */

export function resolveSite00ClientApiBase(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host.includes('fsbw-dev.com') || host.endsWith('.trycloudflare.com')) {
      return 'https://api.site00.com';
    }
    if (host === 'site00.com' || host.endsWith('.site00.com')) {
      return 'https://api.site00.com';
    }
  }

  const envBase = (
    typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_API_BASE as string | undefined) : undefined
  )?.replace(/\/$/, '');
  if (envBase) return envBase;

  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/\/$/, '');
  }

  return '';
}

export function site00ClientApiUrl(path: string): string {
  const base = resolveSite00ClientApiBase();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}
