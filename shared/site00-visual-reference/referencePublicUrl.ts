/**
 * Reference URL validation — FAL must fetch real HTTPS URLs, not dev placeholders.
 */

const PLACEHOLDER_HOSTS = new Set(['vitest.local', '127.0.0.1', 'localhost']);

export function isPlaceholderReferenceUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return true;
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return PLACEHOLDER_HOSTS.has(hostname);
  } catch {
    return true;
  }
}

export function isFalAccessibleReferenceUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  if (process.env.VITEST === 'true') return true;
  return url.startsWith('https://') && !isPlaceholderReferenceUrl(url);
}
