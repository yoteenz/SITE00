import { CLIENT_APP_FIXTURE_SLUGS } from '../site00-client-app/fixtures.js';

/** Production project slug → client app preview fixture slug (under `/app/preview/:fixture`). */
export const VIEWPORT_LAB_PROJECT_PREVIEW_FIXTURES: Readonly<Record<string, string>> = {
  ndxbook: CLIENT_APP_FIXTURE_SLUGS.C_NDXBOOK,
  'fixture-app-ndxbook': CLIENT_APP_FIXTURE_SLUGS.C_NDXBOOK,
};

export type ViewportLabRouteOption = {
  id: string;
  label: string;
  /** Path after `/app/preview/:fixture`, e.g. `/reviews` or empty for home. */
  suffix: string;
};

export const VIEWPORT_LAB_COMMON_ROUTE_SUFFIXES: readonly ViewportLabRouteOption[] = [
  { id: 'home', label: 'HOME', suffix: '' },
  { id: 'reviews', label: 'REVIEWS', suffix: '/reviews' },
  {
    id: 'review-detail',
    label: 'REVIEW DETAIL',
    suffix: '/reviews/review-identity-direction-02',
  },
  { id: 'inbox', label: 'INBOX', suffix: '/inbox' },
  { id: 'library', label: 'LIBRARY', suffix: '/library' },
  { id: 'projects-tab', label: 'PROJECTS TAB', suffix: '/projects' },
  { id: 'profile', label: 'PROFILE', suffix: '/profile' },
];

export function resolveViewportLabFixtureSlug(projectSlug: string): string | null {
  const key = projectSlug.trim().toLowerCase();
  return VIEWPORT_LAB_PROJECT_PREVIEW_FIXTURES[key] ?? null;
}

/** Build same-origin iframe `src` for a registered project preview target. */
export function buildViewportLabPreviewSrc(params: {
  projectSlug: string;
  routeSuffix?: string;
  manualInternalPath?: string | null;
}): { src: string | null; reason: 'ok' | 'no-target' | 'invalid-manual' } {
  const manual = params.manualInternalPath?.trim();
  if (manual) {
    if (!manual.startsWith('/app/')) {
      return { src: null, reason: 'invalid-manual' };
    }
    return { src: manual, reason: 'ok' };
  }
  const fixture = resolveViewportLabFixtureSlug(params.projectSlug);
  if (!fixture) return { src: null, reason: 'no-target' };
  const suffix = params.routeSuffix ?? '';
  const normalized = suffix && !suffix.startsWith('/') ? `/${suffix}` : suffix;
  return { src: `/app/preview/${fixture}${normalized}`, reason: 'ok' };
}

export function viewportLabRegisteredProjectSlugs(): string[] {
  return Object.keys(VIEWPORT_LAB_PROJECT_PREVIEW_FIXTURES).filter((k) => k !== 'fixture-app-ndxbook');
}
