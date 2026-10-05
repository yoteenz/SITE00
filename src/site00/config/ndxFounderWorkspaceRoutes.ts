/** NDXBOOK founder workspace route detection — mobile takeover scope. */

export function isNdxFounderWorkspaceRoute(pathname: string): boolean {
  return /^\/projects\/ndxbook(\/|$)/.test(pathname.replace(/\/+$/, '') || pathname);
}
