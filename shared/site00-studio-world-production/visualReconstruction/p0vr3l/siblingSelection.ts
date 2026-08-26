/**
 * P0.VR.3L — Best sibling selection for family derivation.
 */

import { findDesignScreen } from '../p0vr2/designScreenRegistry.js';
import { getLatestImplementationSnapshot } from '../p0vr3e/implementationSnapshotRegistry.js';
import type { MissingDesignTargetRecord, RepoOwnedProjectId, SiblingCaptureDecision } from './types.js';
import { listSharedShells } from './sharedShellRegistry.js';

export type SiblingCandidate = {
  siblingId: string;
  route: string;
  screenId: string;
  score: number;
  componentPaths: string[];
  reasons: string[];
};

const CHARACTER_LAB_SIBLINGS: Record<string, SiblingCandidate> = {
  'language-lab': {
    siblingId: 'character-lab-language-lab',
    route: '/projects/ndxbook/character/discovery?designPreview=1&designState=language-lab-active',
    screenId: 'character-lab',
    score: 100,
    componentPaths: ['src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'],
    reasons: ['same experience page', 'same tab rail', 'default active tab'],
  },
  'voice-lab': {
    siblingId: 'character-lab-language-lab',
    route: '/projects/ndxbook/character/discovery?designPreview=1&designState=language-lab-active',
    screenId: 'character-lab',
    score: 95,
    componentPaths: ['src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'],
    reasons: ['Character Lab sibling tab', 'shared shell', 'same component tree'],
  },
  casting: {
    siblingId: 'character-lab-language-lab',
    route: '/projects/ndxbook/character/discovery?designPreview=1&designState=language-lab-active',
    screenId: 'character-lab',
    score: 95,
    componentPaths: ['src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'],
    reasons: ['Character Lab sibling tab'],
  },
};

function scoreSite00InformationSibling(pageId: string): SiblingCandidate {
  return {
    siblingId: `site00-information-${pageId}`,
    route: `/${pageId}?preview=1&designPreview=1`,
    screenId: pageId,
    score: 80,
    componentPaths: ['src/site00/components/experience/Site00ExperiencePage.tsx'],
    reasons: ['INFORMATION family', 'shared Site00ExperiencePage shell'],
  };
}

export function selectBestSibling(target: MissingDesignTargetRecord): SiblingCandidate | null {
  if (target.experiencePageId === 'character-lab' && target.materialScreenId) {
    return CHARACTER_LAB_SIBLINGS[target.materialScreenId] ?? CHARACTER_LAB_SIBLINGS['language-lab'] ?? null;
  }

  if (target.projectId === 'SITE00' && target.route) {
    const pageId = target.route.replace(/^\//, '').split('/')[0] ?? 'guide';
    return scoreSite00InformationSibling(pageId === 'origin' ? 'guide' : pageId);
  }

  if (target.route) {
    const screen = findDesignScreen(target.projectId.toLowerCase(), target.materialScreenId ?? '');
    if (screen) {
      return {
        siblingId: screen.screenId,
        route: target.route,
        screenId: screen.screenId,
        score: 70,
        componentPaths: screen.sharedComponentPaths ?? [],
        reasons: ['registered design screen'],
      };
    }
  }

  const shell = listSharedShells(target.projectId)[0];
  if (!shell) return null;

  return {
    siblingId: shell.consumerPageIds[0] ?? 'unknown',
    route: target.route ?? '/',
    screenId: shell.consumerPageIds[0] ?? 'unknown',
    score: 50,
    componentPaths: shell.componentPaths,
    reasons: ['fallback shell consumer'],
  };
}

export function evaluateSiblingCaptureNeed(
  projectId: RepoOwnedProjectId,
  sibling: SiblingCandidate,
): SiblingCaptureDecision {
  const viewports = ['mobile', 'tablet', 'desktop'] as const;
  let missing = 0;
  let stale = 0;
  let existingId: string | null = null;

  for (const vp of viewports) {
    const snap = getLatestImplementationSnapshot(projectId.toLowerCase(), sibling.screenId, vp);
    if (!snap || snap.captureStatus === 'MISSING' || snap.captureStatus === 'IMPLEMENTATION_MISSING') {
      missing++;
    } else if (snap.stale || snap.captureStatus === 'STALE' || snap.captureStatus === 'POSSIBLY_STALE') {
      stale++;
      existingId = snap.snapshotId;
    } else if (snap.captureStatus === 'CURRENT') {
      existingId = snap.snapshotId;
    }
  }

  if (missing > 0) {
    return { captureRequired: true, reason: 'SNAPSHOT_MISSING', existingSnapshotId: null };
  }
  if (stale > 0) {
    return { captureRequired: true, reason: 'SNAPSHOT_STALE', existingSnapshotId: existingId };
  }
  return { captureRequired: false, reason: 'REUSE_EXISTING', existingSnapshotId: existingId };
}

export function detectDuplicatedFamilyImplementation(familyId: string, projectId: RepoOwnedProjectId) {
  const shell = listSharedShells(projectId).find((s) => s.consumerFamilyIds.includes(familyId));
  if (!shell) return null;
  if (shell.componentPaths.length <= 1) {
    return {
      familyId,
      projectId,
      duplicatedPaths: shell.consumerPageIds.map(
        (p) => `src/site00/pages/information/${p}Page.tsx`,
      ),
      sharedShellCandidate: shell.shellId,
      recommendation: 'REFACTOR_TO_SHARED_SHELL' as const,
    };
  }
  return null;
}

export function sharedCodeExistsBeforeRebuild(componentPaths: string[]): boolean {
  return componentPaths.length > 0 && componentPaths.every((p) => p.includes('components/'));
}
