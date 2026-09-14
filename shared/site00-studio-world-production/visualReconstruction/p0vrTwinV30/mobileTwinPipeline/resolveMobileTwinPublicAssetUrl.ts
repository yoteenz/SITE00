const FOUNDER_AUTHORITY_PATH_PREFIX = '/site00/twin-v3-design-page-authority/founder-r5f2-ndxbook/';

/** FAL must fetch stable public URLs — not fsbw-dev / Cloudflare tunnel origins. */
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
  const pathPart = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  const isFounderAuthorityAsset = pathPart.includes(FOUNDER_AUTHORITY_PATH_PREFIX);
  const tunnelOrigin =
    origin &&
    (origin.includes('fsbw-dev.com') ||
      origin.includes('trycloudflare.com') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1'));
  const base = (
    isFounderAuthorityAsset || tunnelOrigin ?
      (process.env.SITE00_PUBLIC_ORIGIN ?? 'https://site00.com')
    : (origin ?? process.env.SITE00_PUBLIC_ORIGIN ?? 'https://site00.com')
  ).replace(/\/$/, '');
  return `${base}${pathPart}`;
}
