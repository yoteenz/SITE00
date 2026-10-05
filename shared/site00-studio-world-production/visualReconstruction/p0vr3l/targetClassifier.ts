/**
 * P0.VR.3L — Missing design target classifier.
 */

import { buildNdxbookMissingRoutes } from '../p0vr3h/ndxbookMissingRoutes.js';
import { buildSite00MissingRoutes } from '../p0vr3a/site00RouteForensics.js';
import type { MissingDesignTargetRecord, MissingDesignTargetType, MissingTargetQueueStatus, RepoOwnedProjectId } from './types.js';

/** Seed catalog — tabs/material screens that exist in code but lack design registration. */
const SEED_MISSING_TARGETS: Omit<MissingDesignTargetRecord, 'queueStatus'>[] = [
  {
    targetId: 'ndxbook:character-lab:voice-lab-tab',
    projectId: 'NDXBOOK',
    targetType: 'TAB_STATE',
    displayName: 'VOICE LAB',
    experiencePageId: 'character-lab',
    materialScreenId: 'voice-lab',
    visualStateId: 'voice-lab-active',
    route: '/projects/ndxbook/character/discovery',
    sourceEvidence: ['src/site00/config/ndxCharacterLabMobileReference.ts', 'MobileCharacterLabScreen'],
  },
  {
    targetId: 'ndxbook:character-lab:casting-tab',
    projectId: 'NDXBOOK',
    targetType: 'TAB_STATE',
    displayName: 'CASTING',
    experiencePageId: 'character-lab',
    materialScreenId: 'casting',
    visualStateId: 'casting-active',
    route: '/projects/ndxbook/character/discovery',
    sourceEvidence: ['src/site00/config/ndxCharacterLabMobileReference.ts'],
  },
  {
    targetId: 'ndxbook:character-lab:language-lab-tab',
    projectId: 'NDXBOOK',
    targetType: 'TAB_STATE',
    displayName: 'LANGUAGE LAB',
    experiencePageId: 'character-lab',
    materialScreenId: 'language-lab',
    visualStateId: 'language-lab-active',
    route: '/projects/ndxbook/character/discovery',
    sourceEvidence: ['src/site00/config/ndxCharacterLabMobileReference.ts'],
  },
];

export function classifyMissingTargetType(input: {
  projectId: RepoOwnedProjectId;
  hasRoute: boolean;
  hasExperiencePage: boolean;
  hasMaterialScreen: boolean;
  hasTabRail: boolean;
  isInstance: boolean;
  isDataOnly: boolean;
}): MissingDesignTargetType {
  if (input.isDataOnly) return 'DATA_INSTANCE';
  if (input.isInstance && !input.hasRoute) return 'CONTENT_INSTANCE';
  if (input.hasTabRail && input.hasExperiencePage) return 'TAB_STATE';
  if (input.hasMaterialScreen && input.hasExperiencePage && !input.hasRoute) return 'MATERIAL_SCREEN';
  if (input.hasMaterialScreen) return 'MATERIAL_SCREEN';
  if (input.hasRoute && input.hasExperiencePage) return 'FAMILY_DERIVED_PAGE';
  if (input.hasRoute) return 'UNIQUE_EXPERIENCE';
  return 'UNKNOWN_REVIEW_REQUIRED';
}

export function tabStateRemainsSubordinate(targetType: MissingDesignTargetType): boolean {
  return targetType === 'TAB_STATE' || targetType === 'MATERIAL_SCREEN' || targetType === 'VISUAL_STATE';
}

export function instanceDoesNotCreatePage(targetType: MissingDesignTargetType): boolean {
  return (
    targetType === 'TAB_STATE' ||
    targetType === 'VISUAL_STATE' ||
    targetType === 'CONTENT_INSTANCE' ||
    targetType === 'DATA_INSTANCE' ||
    targetType === 'ASSET_VARIANT'
  );
}

function inferQueueStatus(target: Omit<MissingDesignTargetRecord, 'queueStatus'>): MissingTargetQueueStatus {
  if (target.targetType === 'TAB_STATE' || target.targetType === 'MATERIAL_SCREEN') {
    return 'READY_FOR_DERIVATION';
  }
  return 'NEEDS_SOURCE_SIBLING';
}

export function discoverMissingDesignTargets(projectId?: RepoOwnedProjectId): MissingDesignTargetRecord[] {
  const seeds = SEED_MISSING_TARGETS.filter((t) => !projectId || t.projectId === projectId).map((t) => ({
    ...t,
    queueStatus: inferQueueStatus(t),
  }));

  const ndxGaps = buildNdxbookMissingRoutes().map((g) => ({
    targetId: g.screenId,
    projectId: 'NDXBOOK' as const,
    targetType: 'MATERIAL_SCREEN' as const,
    displayName: g.displayName,
    experiencePageId: null,
    materialScreenId: g.screenId.replace(/^ndxbook-gap-/, ''),
    visualStateId: null,
    route: g.route,
    queueStatus: g.existingImplementationPath ? ('EXISTING_UNREGISTERED' as const) : ('TRUE_MISSING_ROUTE' as const),
    sourceEvidence: g.sourceEvidence,
  }));

  const site00Missing = buildSite00MissingRoutes().map((m) => ({
    targetId: `site00:${m.screenId}`,
    projectId: 'SITE00' as const,
    targetType: classifyMissingTargetType({
      projectId: 'SITE00',
      hasRoute: true,
      hasExperiencePage: false,
      hasMaterialScreen: false,
      hasTabRail: false,
      isInstance: false,
      isDataOnly: false,
    }),
    displayName: m.displayName,
    experiencePageId: null,
    materialScreenId: null,
    visualStateId: null,
    route: m.suggestedRoute,
    queueStatus: 'TRUE_MISSING_ROUTE' as const,
    sourceEvidence: m.sourceEvidence,
  }));

  const combined = [...seeds, ...ndxGaps, ...site00Missing];
  const byId = new Map<string, MissingDesignTargetRecord>();
  for (const t of combined) {
    if (!byId.has(t.targetId)) byId.set(t.targetId, t);
  }
  return [...byId.values()];
}

export function getMissingTarget(targetId: string): MissingDesignTargetRecord | null {
  return discoverMissingDesignTargets().find((t) => t.targetId === targetId) ?? null;
}
