/** Resolve persisted artifact paths/URIs for browser img src. */
export function resolvePageConceptArtifactDisplayUrl(
  uri: string | null | undefined,
  cacheBustKey?: string | null,
): string | null {
  if (!uri?.trim()) return null;
  const value = uri.trim();
  let resolved: string;
  if (value.startsWith('data:') || value.startsWith('blob:')) {
    resolved = value;
  } else if (value.startsWith('http://') || value.startsWith('https://')) {
    resolved = value;
  } else if (value.startsWith('/')) {
    resolved =
      typeof window !== 'undefined' ? `${window.location.origin}${value}` : `https://site00.com${value}`;
  } else {
    resolved = value;
  }
  const bust = cacheBustKey?.trim();
  if (!bust || resolved.startsWith('data:') || resolved.startsWith('blob:')) return resolved;
  const sep = resolved.includes('?') ? '&' : '?';
  return `${resolved}${sep}artifact=${encodeURIComponent(bust)}`;
}
