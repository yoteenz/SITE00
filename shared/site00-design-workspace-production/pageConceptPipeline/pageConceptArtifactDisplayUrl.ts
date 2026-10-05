function stripArtifactCacheBustQuery(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete('artifact');
    const qs = parsed.searchParams.toString();
    return qs ? `${parsed.origin}${parsed.pathname}?${qs}` : `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.replace(/([?&])artifact=[^&]*(?=&|$)/g, (_, lead) => (lead === '?' ? '?' : '')).replace(/\?&/, '?').replace(/\?$/, '');
  }
}

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
  const base = stripArtifactCacheBustQuery(resolved);
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}artifact=${encodeURIComponent(bust)}`;
}
