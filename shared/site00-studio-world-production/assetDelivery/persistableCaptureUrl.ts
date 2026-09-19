/**
 * P0.VR.CAPTURE.1R3 — Browser-safe capture URL guards (no node:crypto).
 */

const INVALID_PERSISTED_PREFIXES = ['blob:', 'data:', '/tmp/', 'file://'] as const;

export function isInvalidPersistedAssetRef(ref: string | null | undefined): boolean {
  if (!ref?.trim()) return true;
  const trimmed = ref.trim();
  return INVALID_PERSISTED_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
}

export function isPersistableCaptureUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  const trimmed = url.trim();
  if (isInvalidPersistedAssetRef(trimmed)) return false;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true;
  if (trimmed.startsWith('/visual-references/') || trimmed.startsWith('visual-references/')) return true;
  if (
    trimmed.startsWith('studio-world/') ||
    trimmed.startsWith('site00/') ||
    trimmed.startsWith('/studio-world/')
  ) {
    return true;
  }
  if (trimmed.startsWith('/') && !trimmed.startsWith('/visual-references/')) {
    return trimmed.includes('/storage/v1/object/public/');
  }
  return !trimmed.startsWith('/');
}
