export function isBrowserSafeAssetUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  const u = url.trim();
  if (u.startsWith('css:')) return false;
  if (u.startsWith('file:') || u.startsWith('/var/')) return false;
  if (u.includes('localhost') || u.includes('127.0.0.1')) return false;
  if (u.startsWith('data:image/')) return true;
  if (u.startsWith('https://') || u.startsWith('http://')) return true;
  if (u.startsWith('/')) return true;
  return false;
}
