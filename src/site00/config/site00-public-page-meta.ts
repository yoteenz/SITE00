import { SITE00_ROUTES } from './routes';

export type Site00PublicPageMeta = {
  locationLabel: string;
  bracketTitle?: string;
};

/** Contextual breadcrumb / location copy for the canonical public desktop header. */
export function site00PublicPageMeta(pathname: string): Site00PublicPageMeta {
  const base = pathname.replace(/\/desktop(\/|$)/, '/').replace(/\/$/, '') || '/';

  if (base === SITE00_ROUTES.originAlias || base === SITE00_ROUTES.origin || base === '/') {
    return { locationLabel: 'ORIGIN POINT' };
  }
  if (base === SITE00_ROUTES.sites || base.startsWith(`${SITE00_ROUTES.sites}/`)) {
    return { locationLabel: 'PUBLIC PORTFOLIO' };
  }
  if (base === SITE00_ROUTES.services) {
    return { locationLabel: 'CAPABILITIES INDEX' };
  }
  if (base === SITE00_ROUTES.system) {
    return { locationLabel: 'OPERATING ARCHITECTURE' };
  }
  if (base === SITE00_ROUTES.about) {
    return { locationLabel: 'MISSION & PRINCIPLES' };
  }
  if (base === SITE00_ROUTES.journal) {
    return { locationLabel: 'TRANSMISSIONS' };
  }
  if (base === SITE00_ROUTES.idnty || base.startsWith(`${SITE00_ROUTES.idnty}/`)) {
    return { locationLabel: 'IDENTITY GATEWAY' };
  }
  if (base === SITE00_ROUTES.bldr || base.startsWith(`${SITE00_ROUTES.bldr}/`)) {
    return { locationLabel: 'START BUILD' };
  }
  if (base === SITE00_ROUTES.support) {
    return { locationLabel: 'SUPPORT' };
  }
  if (base === SITE00_ROUTES.enter) {
    return { locationLabel: 'INTERIOR DIRECTORY' };
  }

  return { locationLabel: 'SITE 00' };
}
