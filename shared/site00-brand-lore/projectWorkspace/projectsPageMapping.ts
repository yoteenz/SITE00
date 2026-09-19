/**
 * Projects page → workspace index mapping.
 */

import type { Site00ProjectIndexEntry } from '../../site00-projects/types.js';
import type { ProjectWorkspaceZone } from './constants.js';

export type ProjectWorkspaceEntryRole = {
  slug: string;
  displayName: string;
  detailRoute: string;
  projectClass: string;
  workState: string | null;
  activePieceLabel: string | null;
  reviewState: string | null;
  recentActivity: string | null;
  productionState: string | null;
  focusNow: string | null;
  visualWeight: 'DOMINANT' | 'STANDARD' | 'COMPACT';
  clientSignature: string | null;
  zones: ProjectWorkspaceZone[];
};

export type ProjectsWorkspaceIndex = {
  onTheBench: ProjectWorkspaceEntryRole[];
  reviewTray: ProjectWorkspaceEntryRole[];
  activePiece: ProjectWorkspaceEntryRole | null;
  workHistory: ProjectWorkspaceEntryRole[];
  dossierAccess: ProjectWorkspaceEntryRole[];
  productionState: ProjectWorkspaceEntryRole[];
  dataDependencies: string[];
  compiledAt: string;
};

export function mapProjectsToWorkspaceIndex(
  projects: Site00ProjectIndexEntry[],
  options?: { activeSlug?: string | null },
): ProjectsWorkspaceIndex {
  const dataDependencies: string[] = [];

  const entries: ProjectWorkspaceEntryRole[] = projects.map((p) => {
    const hasFocus = Boolean(p.focusNow);
    return {
      slug: p.slug,
      displayName: p.displayName,
      detailRoute: p.detailRoute,
      projectClass: p.classification,
      workState: hasFocus ? 'ACTIVE_WORK' : p.currentPhase,
      activePieceLabel: hasFocus ? p.focusNow : null,
      reviewState: null,
      recentActivity: p.lastActivity,
      productionState: p.currentPhase,
      focusNow: p.focusNow,
      visualWeight: 'STANDARD' as const,
      clientSignature: p.internalLabel ?? p.currentSystem,
      zones: hasFocus ? (['ON_THE_BENCH', 'ACTIVE_PIECE'] as ProjectWorkspaceZone[]) : ['ON_THE_BENCH'],
    };
  });

  const onTheBench = entries.filter((e) => e.focusNow || e.workState);
  const activeCandidate =
    entries.find((e) => e.slug === options?.activeSlug) ??
    entries.find((e) => e.focusNow) ??
    entries[0] ??
    null;

  if (activeCandidate) {
    activeCandidate.visualWeight = 'DOMINANT';
  }

  if (!entries.some((e) => e.reviewState)) {
    dataDependencies.push('REVIEW_TRAY requires command.needsYou — not available on index payload');
  }

  const workHistory = [...entries]
    .filter((e) => e.recentActivity)
    .sort((a, b) => (b.recentActivity ?? '').localeCompare(a.recentActivity ?? ''));

  return {
    onTheBench,
    reviewTray: entries.filter((e) => e.reviewState),
    activePiece: activeCandidate,
    workHistory,
    dossierAccess: entries,
    productionState: entries.filter((e) => e.productionState),
    dataDependencies,
    compiledAt: new Date().toISOString(),
  };
}

export function avoidsEqualCardGrid(index: ProjectsWorkspaceIndex): boolean {
  return index.activePiece?.visualWeight === 'DOMINANT';
}

export function asymmetricHierarchySupported(index: ProjectsWorkspaceIndex): boolean {
  return index.onTheBench.length !== index.dossierAccess.length || index.activePiece !== null;
}
