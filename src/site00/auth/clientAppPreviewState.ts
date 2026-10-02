import { isSite00CloudPreviewBuild, isSite00PreviewTunnelHost } from '../components/loader/site00PreviewHost';

/** Non-production gate — `1` at build time on cloud preview bundles only. */
export function isSite00ClientAppPreviewBuildEnabled(): boolean {
  return import.meta.env.VITE_SITE00_CLIENT_APP_PREVIEW === '1';
}

/** Fixture `/app/preview/*` routes — dev server or cloud preview tunnel, never production site00.com alone. */
export function isSite00ClientAppPreviewFeatureActive(): boolean {
  if (import.meta.env.DEV) return true;
  return isSite00ClientAppPreviewBuildEnabled() && (isSite00CloudPreviewBuild() || isSite00PreviewTunnelHost());
}

export function isSite00ClientAppPreviewPath(pathname: string): boolean {
  return pathname === '/app/preview/select' || pathname.startsWith('/app/preview/');
}
