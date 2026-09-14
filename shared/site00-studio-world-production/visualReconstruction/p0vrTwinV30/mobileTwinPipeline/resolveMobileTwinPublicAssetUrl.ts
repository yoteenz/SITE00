export function resolveMobileTwinPublicAssetUrl(pathOrUrl: string, origin?: string): string {
  if (
    pathOrUrl.startsWith('http://') ||
    pathOrUrl.startsWith('https://') ||
    pathOrUrl.startsWith('vitest-fal://') ||
    pathOrUrl.startsWith('data:') ||
    pathOrUrl.startsWith('blob:')
  ) {
    return pathOrUrl;
  }
  const base = (origin ?? process.env.SITE00_PUBLIC_ORIGIN ?? 'https://site00.com').replace(/\/$/, '');
  const pathPart = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${pathPart}`;
}
