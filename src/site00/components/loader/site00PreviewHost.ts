/** Cloud preview tunnel hosts — skip cinematic cold-start loader for faster mobile review. */

const KNOWN_PREVIEW_SUFFIXES = ['.trycloudflare.com'] as const;
const KNOWN_PREVIEW_HOSTS = ['site00.fsbw-dev.com'] as const;

function readPreviewHostnameMeta(): string | null {
  if (typeof document === 'undefined') return null;
  const meta = document.querySelector('meta[name="site00-preview-hostname"]');
  const value = meta?.getAttribute('content')?.trim().toLowerCase();
  return value || null;
}

export function isSite00CloudPreviewBuild(): boolean {
  if (import.meta.env.VITE_SITE00_CLOUD_PREVIEW === '1') return true;
  if (typeof document === 'undefined') return false;
  const meta = document.querySelector('meta[name="site00-cloud-preview"]');
  return meta?.getAttribute('content') === '1';
}

export function isSite00PreviewTunnelHost(hostname?: string): boolean {
  const host = (hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '')).toLowerCase();
  if (!host) return false;
  if (isSite00CloudPreviewBuild()) return true;
  if ((KNOWN_PREVIEW_HOSTS as readonly string[]).includes(host)) return true;
  if (KNOWN_PREVIEW_SUFFIXES.some((suffix) => host.endsWith(suffix))) return true;
  const configured = readPreviewHostnameMeta();
  if (configured && host === configured) return true;
  return false;
}
