/** Resolve persisted artifact paths/URIs for browser img src. */
export function resolvePageConceptArtifactDisplayUrl(
  uri: string | null | undefined,
): string | null {
  if (!uri?.trim()) return null;
  const value = uri.trim();
  if (value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('blob:')) {
    return value;
  }
  if (value.startsWith('/')) {
    if (typeof window !== 'undefined') return `${window.location.origin}${value}`;
    return `https://site00.com${value}`;
  }
  return value;
}
