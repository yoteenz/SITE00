/** Cloud preview tunnel hosts — skip cinematic cold-start loader for faster mobile review. */

export function isSite00PreviewTunnelHost(hostname?: string): boolean {
  const host = (hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '')).toLowerCase();
  if (!host) return false;
  if (host === 'site00.fsbw-dev.com') return true;
  if (host.endsWith('.trycloudflare.com')) return true;
  return false;
}
