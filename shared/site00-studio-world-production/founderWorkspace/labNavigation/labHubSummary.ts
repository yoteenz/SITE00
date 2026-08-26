/**
 * P0.NAV.1 — Lab Hub destination summaries (concise, data-driven when available).
 */

import type { CharacterReadinessSummary } from '../../characterAuthority/readinessSummary.js';

export type LabExperimentsPanelSummary = {
  title: string;
  headline: string;
  statusLabel: string;
  progressLabel: string | null;
  destinationHref: string;
};

export type LabCharacterPanelSummary = {
  title: string;
  visualIdentityLabel: string;
  characterBibleLabel: string;
  continuityLabel: string;
  destinationHref: string;
};

export type BuildLabHubSummaryInput = {
  experimentsHubHref: string;
  characterLabHref: string;
  experiment01Title?: string;
  experiment01StatusNote?: string | null;
  experiment01Progress?: { complete: number; total: number } | null;
  characterReadiness?: CharacterReadinessSummary | null;
  characterBiblePackStatus?: string | null;
  continuityReady?: boolean | null;
};

function formatReadinessStatus(raw: string): string {
  const upper = raw.replace(/_/g, ' ').toUpperCase();
  if (upper.includes('READY')) return 'READY';
  if (upper.includes('PROGRESS') || upper.includes('PENDING') || upper.includes('INCOMPLETE')) return 'IN PROGRESS';
  if (upper.includes('BLOCK')) return 'BLOCKED';
  return upper;
}

export function buildLabExperimentsPanelSummary(input: BuildLabHubSummaryInput): LabExperimentsPanelSummary {
  const title = input.experiment01Title ?? 'EXPERIMENT 01';
  const progress =
    input.experiment01Progress && input.experiment01Progress.total > 0
      ? `${input.experiment01Progress.complete} / ${input.experiment01Progress.total} COMPLETE`
      : null;

  return {
    title: 'EXPERIMENTS',
    headline: title,
    statusLabel: input.experiment01StatusNote?.toUpperCase().includes('PRODUCTION')
      ? 'IN PRODUCTION'
      : (input.experiment01StatusNote ?? 'ACTIVE').toUpperCase(),
    progressLabel: progress,
    destinationHref: input.experimentsHubHref,
  };
}

export function buildLabCharacterPanelSummary(input: BuildLabHubSummaryInput): LabCharacterPanelSummary {
  const readiness = input.characterReadiness;

  const visualIdentityLabel = readiness
    ? formatReadinessStatus(readiness.visualIdentityStatus)
    : 'PENDING';

  let characterBibleLabel = 'IN PROGRESS';
  if (input.characterBiblePackStatus === 'APPROVED') characterBibleLabel = 'READY';
  else if (readiness?.visualIdentityReady) characterBibleLabel = 'IN PROGRESS';

  let continuityLabel = 'BLOCKED';
  if (input.continuityReady === true || readiness?.motionProductionReady) continuityLabel = 'READY';
  else if (readiness?.stillProductionReady) continuityLabel = 'IN PROGRESS';

  return {
    title: 'CHARACTER',
    visualIdentityLabel,
    characterBibleLabel,
    continuityLabel,
    destinationHref: input.characterLabHref,
  };
}

export function buildLabHubSummaries(input: BuildLabHubSummaryInput): {
  experiments: LabExperimentsPanelSummary;
  character: LabCharacterPanelSummary;
} {
  return {
    experiments: buildLabExperimentsPanelSummary(input),
    character: buildLabCharacterPanelSummary(input),
  };
}
