/**
 * P0.VR.3B — SITE 00 raw implementation route inventory (full router universe).
 */

import {
  SITE00_ROUTES,
  IDNTY_ASSESSMENT_STATE_SLUGS,
  BLDR_ASSESSMENT_STATE_SLUGS,
  EVOLVE_ASSESSMENT_PATH_SLUGS,
} from '../../../../src/site00/config/routes.js';
import type { ImplementationRouteRecord } from './types.js';

const REDIRECT_PATTERNS = new Set(['/bluprint/*', '/build/*', '/live/*']);

const EXTRA_ROUTER_PATTERNS: Array<{ path: string; componentHint: string; sourceFile: string }> = [
  { path: '/sign-in', componentHint: 'Site00SignInAliasRedirect', sourceFile: 'src/routes/Site00Routes.tsx' },
  { path: '/identity/*', componentHint: 'Site00IdentityAliasRedirect', sourceFile: 'src/routes/Site00Routes.tsx' },
  { path: '/identity', componentHint: 'Navigate', sourceFile: 'src/routes/Site00Routes.tsx' },
  { path: '/idnty/:stateSlug/*', componentHint: 'IdntyAssessmentRouterPage', sourceFile: 'src/routes/Site00Routes.tsx' },
  { path: '/idnty/:stateSlug/desktop/*', componentHint: 'Site00WorkflowDesktopLegacyRedirect', sourceFile: 'src/routes/Site00Routes.tsx' },
  { path: '/bldr/:classSlug/*', componentHint: 'BldrAssessmentRouterPage', sourceFile: 'src/routes/Site00Routes.tsx' },
  { path: '/bldr/:classSlug/desktop/*', componentHint: 'Site00WorkflowDesktopLegacyRedirect', sourceFile: 'src/routes/Site00Routes.tsx' },
  { path: '/evolve/:pathSlug/*', componentHint: 'EvolveAssessmentRouterPage', sourceFile: 'src/routes/Site00Routes.tsx' },
  { path: '/evolve/:pathSlug/desktop/*', componentHint: 'Site00WorkflowDesktopLegacyRedirect', sourceFile: 'src/routes/Site00Routes.tsx' },
  { path: '/access/:credentialId', componentHint: 'AccessCredentialPage', sourceFile: 'src/routes/Site00Routes.tsx' },
  { path: '/validation/ndxbook/replay/:replayId/personality/:stepId', componentHint: 'PersonalityReplayIntakeRouterPage', sourceFile: 'src/routes/Site00Routes.tsx' },
  { path: '/validation/ndxbook/replay/:replayId/personality/review', componentHint: 'PersonalityReplayIntakeRouterPage', sourceFile: 'src/routes/Site00Routes.tsx' },
  { path: '/assts/composition-studio', componentHint: 'AsstsCompositionStudioPage', sourceFile: 'src/routes/Site00Routes.tsx' },
  { path: '/assts/batches', componentHint: 'AsstsBatchesListPage', sourceFile: 'src/routes/Site00Routes.tsx' },
  { path: '/assts/batches/:batchId', componentHint: 'AsstsBatchPage', sourceFile: 'src/routes/Site00Routes.tsx' },
  { path: '/assts/search', componentHint: 'AsstsSearchPage', sourceFile: 'src/routes/Site00Routes.tsx' },
  { path: '/assts/notifications', componentHint: 'AsstsNotificationsPage', sourceFile: 'src/routes/Site00Routes.tsx' },
  { path: '/assts/loader-pipeline', componentHint: 'AsstsLoaderPipelinePage', sourceFile: 'src/routes/Site00Routes.tsx' },
  { path: '/assts/profile', componentHint: 'AsstsProfilePage', sourceFile: 'src/routes/Site00Routes.tsx' },
  { path: '/assts/:assetId', componentHint: 'AsstsInspectionPage', sourceFile: 'src/routes/Site00Routes.tsx' },
];

const PUBLIC_DESKTOP_MIRRORS = [
  '/idnty/desktop',
  '/bldr/desktop',
  '/evolve/desktop',
  '/projects/desktop',
  '/sites/desktop',
  '/services/desktop',
  '/system/desktop',
  '/about/desktop',
  '/journal/desktop',
  '/support/desktop',
  '/idnty/sign-in-security/desktop',
  '/bldr/templates/desktop',
  '/bldr/start/desktop',
];

function slugifyPath(path: string): string {
  return path.replace(/^\//, '').replace(/\//g, '-').replace(/:/g, '') || 'root';
}

function isDesktopVariant(path: string): boolean {
  return /\/desktop(\/|$|\*)/.test(path);
}

export function buildSite00RawImplementationRoutes(): ImplementationRouteRecord[] {
  const paths = new Set<string>();

  for (const value of Object.values(SITE00_ROUTES)) {
    if (typeof value === 'string') paths.add(value);
  }

  for (const extra of EXTRA_ROUTER_PATTERNS) paths.add(extra.path);
  for (const desktop of PUBLIC_DESKTOP_MIRRORS) paths.add(desktop);

  for (const slug of IDNTY_ASSESSMENT_STATE_SLUGS) paths.add(`/idnty/${slug}`);
  for (const slug of BLDR_ASSESSMENT_STATE_SLUGS) paths.add(`/bldr/${slug}`);
  for (const slug of EVOLVE_ASSESSMENT_PATH_SLUGS) paths.add(`/evolve/${slug}`);

  const extrasByPath = new Map(EXTRA_ROUTER_PATTERNS.map((e) => [e.path, e]));

  return [...paths].map((pathPattern) => {
    const extra = extrasByPath.get(pathPattern);
    const isRedirect = REDIRECT_PATTERNS.has(pathPattern) || extra?.componentHint === 'Navigate';
    return {
      implementationRouteId: `impl:${slugifyPath(pathPattern)}`,
      pathPattern,
      componentHint: extra?.componentHint ?? null,
      sourceFile: extra?.sourceFile ?? 'src/site00/config/routes.ts',
      reachable: !isRedirect,
      isRedirect,
      isDesktopVariant: isDesktopVariant(pathPattern),
      designScreenId: null,
    };
  });
}
