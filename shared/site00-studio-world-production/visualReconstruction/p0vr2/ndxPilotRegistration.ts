/**
 * NDXBOOK pilot registration for P0.VR.2 Design workspace.
 * Project-specific adapter data — not global Studio World behavior.
 */

import {
  registerCanonicalVisualReference,
  promoteVisualImplementationCanon,
  listCanonicalReferences,
} from './canonicalReferenceRegistry.js';
import { registerProjectDesignScreens } from './designScreenRegistry.js';
import type { CanonicalVisualReference, DesignScreenDefinition, VisualImplementationCanon } from './types.js';
import { CANONICAL_VIEWPORT_DIMENSIONS } from './constants.js';

const NDX_MOBILE_MATCHED_SCREENS = [
  'overview',
  'campaign-board',
  'content-ops',
  'cultural-intelligence',
  'experiment-01',
  'character-lab',
] as const;

export const NDX_DESIGN_SCREENS: DesignScreenDefinition[] = [
  {
    screenId: 'overview',
    displayName: 'Overview',
    routePattern: '/projects/:projectSlug',
    scopeTargetId: 'overviewScreen',
    sharedComponentPaths: ['src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx'],
  },
  {
    screenId: 'campaign-board',
    displayName: 'Campaign Board',
    routePattern: '/projects/:projectSlug/content-operations/campaign-board',
    scopeTargetId: 'campaignBoardScreen',
    sharedComponentPaths: ['src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx'],
  },
  {
    screenId: 'content-ops',
    displayName: 'Content Ops',
    routePattern: '/projects/:projectSlug/content-operations',
    scopeTargetId: 'contentOpsScreen',
    sharedComponentPaths: ['src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx'],
  },
  {
    screenId: 'cultural-intelligence',
    displayName: 'Cultural Intelligence',
    routePattern: '/projects/:projectSlug/cultural-intelligence',
    scopeTargetId: 'culturalIntelligenceScreen',
  },
  {
    screenId: 'experiment-01',
    displayName: 'Experiment 01',
    routePattern: '/projects/:projectSlug/marketing-expression/experiment-01',
    scopeTargetId: 'experiment01Screen',
  },
  {
    screenId: 'character-lab',
    displayName: 'Character Lab',
    routePattern: '/projects/:projectSlug/character/discovery',
    scopeTargetId: 'characterLabScreen',
  },
  {
    screenId: 'bottom-nav-icons',
    displayName: 'Bottom Nav Icons',
    routePattern: '/projects/:projectSlug/inspect/icons',
    scopeTargetId: 'ndx-icons',
    supportsIconMode: true,
  },
  {
    screenId: 'desktop-overview',
    displayName: 'Desktop Overview Hub',
    routePattern: '/projects/:projectSlug',
    scopeTargetId: 'desktopComposite',
    sharedComponentPaths: ['src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx'],
  },
];

const NDX_MOBILE_REFERENCE_PATHS: Record<string, string> = {
  overview: '/visual-references/founder/ndxbook/mobile-overview-fullscreen-reference-hifi.png',
  'campaign-board': '/visual-references/founder/ndxbook/mobile-campaign-board-reference-p0vr1d13.png',
  'content-ops': '/visual-references/founder/ndxbook/mobile-content-ops-fullscreen-reference.png',
  'cultural-intelligence': '/visual-references/founder/ndxbook/mobile-cultural-intelligence-fullscreen-reference.png',
  'experiment-01': '/visual-references/founder/ndxbook/mobile-lab-experiment-01-reference.png',
  'character-lab': '/visual-references/founder/ndxbook/mobile-character-lab-fullscreen-reference.png',
  'bottom-nav-icons': '/visual-references/founder/ndxbook/ndx-icon-reference-sheet-p0ui3d.jpg',
};

const NDX_DESKTOP_REFERENCE_PATHS: Partial<Record<string, string>> = {
  'desktop-overview': '/visual-references/founder/ndxbook/desktop-overview-composite-reference.png',
};

function buildNdxReference(
  screen: DesignScreenDefinition,
  viewportClass: 'mobile' | 'desktop',
  storagePath: string,
  scope: CanonicalVisualReference['scope'] = 'FULL_SCREEN_REFERENCE',
): CanonicalVisualReference {
  const viewport = CANONICAL_VIEWPORT_DIMENSIONS[viewportClass];
  const route = screen.routePattern.replace(':projectSlug', 'ndxbook');
  return {
    referenceId: `ndxbook:${screen.screenId}:${viewportClass}:v1`,
    projectId: 'ndxbook',
    screenId: screen.screenId,
    route,
    viewportClass,
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    scope: screen.supportsIconMode ? 'ICON' : scope,
    scopeTargetId: screen.scopeTargetId,
    assetId: `${screen.screenId}-${viewportClass}`,
    storagePath,
    version: 1,
    status: 'ACTIVE_CANONICAL',
    createdAt: new Date().toISOString(),
    createdBy: 'p0vr2-ndx-pilot-seed',
    supersedes: null,
  };
}

function buildNdxImplementationCanon(
  screenId: string,
  viewportClass: 'mobile' | 'desktop',
  referenceId: string,
  matched: boolean,
): VisualImplementationCanon {
  const route = NDX_DESIGN_SCREENS.find((s) => s.screenId === screenId)?.routePattern.replace(
    ':projectSlug',
    'ndxbook',
  ) ?? `/projects/ndxbook`;
  return {
    canonId: `ndxbook:${screenId}:${viewportClass}:impl-v1`,
    projectId: 'ndxbook',
    screenId,
    route,
    viewportClass,
    referenceId,
    referenceVersion: 1,
    implementationVersion: 'P0.VR.1D.13',
    visualScore: matched ? 0.86 : 0,
    renderSnapshotPath: null,
    approvalDate: matched ? new Date().toISOString() : '',
    founderJudgment: matched ? 'MATCHES' : 'REBUILD_AGAIN',
    status: matched ? 'ACTIVE' : 'STALE_AGAINST_NEW_REFERENCE',
  };
}

let ndxPilotRegistered = false;

export function registerNdxbookDesignPilot(): {
  references: CanonicalVisualReference[];
  screens: DesignScreenDefinition[];
} {
  if (ndxPilotRegistered) {
    return { references: listCanonicalReferences('ndxbook'), screens: NDX_DESIGN_SCREENS };
  }
  ndxPilotRegistered = true;
  registerProjectDesignScreens('ndxbook', NDX_DESIGN_SCREENS);

  const references: CanonicalVisualReference[] = [];
  const canons: VisualImplementationCanon[] = [];

  for (const screen of NDX_DESIGN_SCREENS) {
    const mobilePath = NDX_MOBILE_REFERENCE_PATHS[screen.screenId];
    if (mobilePath) {
      const ref = buildNdxReference(screen, 'mobile', mobilePath);
      references.push(ref);
      registerCanonicalVisualReference(ref);
      const matched = (NDX_MOBILE_MATCHED_SCREENS as readonly string[]).includes(screen.screenId);
      canons.push(buildNdxImplementationCanon(screen.screenId, 'mobile', ref.referenceId, matched));
    }

    const desktopPath = NDX_DESKTOP_REFERENCE_PATHS[screen.screenId];
    if (desktopPath) {
      const ref = buildNdxReference(screen, 'desktop', desktopPath);
      references.push(ref);
      registerCanonicalVisualReference(ref);
      canons.push(buildNdxImplementationCanon(screen.screenId, 'desktop', ref.referenceId, false));
    }
  }

  seedImplementationCanons(canons.filter((c) => c.status === 'ACTIVE'));

  return { references, screens: NDX_DESIGN_SCREENS };
}

export function ensureNdxbookPilotRegistered(): void {
  registerNdxbookDesignPilot();
}

export function resetNdxPilotForTest(): void {
  ndxPilotRegistered = false;
}

function seedImplementationCanons(canons: VisualImplementationCanon[]): void {
  for (const canon of canons) {
    promoteVisualImplementationCanon(canon);
  }
}
