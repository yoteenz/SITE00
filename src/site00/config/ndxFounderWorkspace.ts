/**
 * NDXBOOK founder workspace adapter — labels, nav, journey mapping.
 * Generic Studio World shell consumes this; no hard-coded NDX in shared infra.
 */

import {
  site00ProjectBrandMarketingExpressionExperiment01Path,
  site00ProjectCharacterContinuityPath,
  site00ProjectContentLibraryPath,
  site00ProjectContentOperationsCampaignBoardPath,
  site00ProjectContentOperationsPath,
  site00ProjectContentOperationsPerformancePath,
  site00ProjectCulturalIntelligencePath,
  site00ProjectExperimentsPath,
  site00ProjectFounderCharacterDiscoveryPath,
  site00ProjectFounderWorkspaceArchivePath,
  site00ProjectPath,
} from './routes';
import type { WorkspaceNavItem } from '../../../shared/site00-studio-world-production/founderWorkspace/types.js';
import { buildDefaultExperimentJourneyStages } from '../../../shared/site00-studio-world-production/founderWorkspace/experimentJourney.js';

export const NDX_FOUNDER_WORKSPACE_ADAPTER_ID = 'ndxbook-founder-workspace-v1' as const;

export const NDX_SIGNATURE_ACCENT = '#c8ff00' as const;

export function ndxFounderWorkspaceNav(projectSlug: string): WorkspaceNavItem[] {
  if (projectSlug !== 'ndxbook') return [];
  return [
    { id: 'overview', label: 'OVERVIEW', path: site00ProjectPath(projectSlug) },
    { id: 'create', label: 'CREATE', path: site00ProjectContentOperationsPath(projectSlug) },
    { id: 'review', label: 'REVIEW', path: site00ProjectContentOperationsCampaignBoardPath(projectSlug), attentionLevel: 'READY_TO_REVIEW' },
    { id: 'learn', label: 'LEARN', path: site00ProjectContentOperationsPerformancePath(projectSlug) },
    { id: 'intelligence', label: 'INTELLIGENCE', path: site00ProjectCulturalIntelligencePath(projectSlug) },
    { id: 'character', label: 'CHARACTER', path: site00ProjectFounderCharacterDiscoveryPath(projectSlug) },
    { id: 'archive', label: 'ARCHIVE', path: site00ProjectFounderWorkspaceArchivePath(projectSlug) },
  ];
}

export function ndxExperimentJourneyStages() {
  return buildDefaultExperimentJourneyStages();
}

export const NDX_VERSION_LINEAGE = [
  { versionId: 'v21', label: 'V2.1', founderSummary: 'Cultural image participation — humans and objects enter the feed.', isCurrent: false },
  { versionId: 'v22', label: 'V2.2', founderSummary: 'Character retention — NDX stays in the thought without clutter.', isCurrent: false },
  { versionId: 'v23', label: 'V2.3', founderSummary: 'Art-board materiality — artifacts feel handled, not templated.', isCurrent: false },
  { versionId: 'c6', label: 'C.6', founderSummary: 'Visual appetite authority — bespoke art direction leads editorial logic.', isCurrent: false },
  { versionId: 'c6a', label: 'C.6A', founderSummary: 'Authored artifact grammar — information lives inside the artwork, not infographic shells.', isCurrent: true },
] as const;

export const NDX_EXPERIMENT_01_CANONICAL_TITLE = 'FIND THE NDX PAGE' as const;

export function ndxInspectRoutes(projectSlug: string) {
  return {
    experimentsHub: site00ProjectExperimentsPath(projectSlug),
    experiment01: site00ProjectBrandMarketingExpressionExperiment01Path(projectSlug),
    contentLibrary: site00ProjectContentLibraryPath(projectSlug),
    characterContinuity: site00ProjectCharacterContinuityPath(projectSlug),
  };
}

export function ndxFounderWorkspaceEnabled(projectSlug: string): boolean {
  return projectSlug === 'ndxbook';
}
