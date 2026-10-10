/** Cloud tunnel / fsbw-dev detection for Digital Foundation client UX (matches site00ClientApiBase). */

export function isSite00CloudPreviewBrowser(): boolean {
  if (typeof document === 'undefined') return false;
  if (document.querySelector('meta[name="site00-cloud-preview"]')?.getAttribute('content') === '1') {
    return true;
  }
  const host = window.location.hostname.toLowerCase();
  if (host === 'site00.fsbw-dev.com' || host.includes('fsbw-dev.com')) return true;
  if (host.endsWith('.trycloudflare.com')) return true;
  const configured = document.querySelector('meta[name="site00-preview-hostname"]')?.getAttribute('content')?.trim().toLowerCase();
  if (configured && host === configured) return true;
  return import.meta.env.VITE_SITE00_CLOUD_PREVIEW === '1';
}
