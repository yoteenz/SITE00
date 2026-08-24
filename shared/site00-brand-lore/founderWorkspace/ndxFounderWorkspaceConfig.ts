/**
 * NDXBOOK — Founder Workspace navigation + journey configuration.
 */

import type { ExperimentStagePresentation, WorkspaceNavItem } from '../../site00-studio-world-production/founderWorkspace/types.js';

export const NDX_SIGNATURE_LIME = '#D6FF3B';

export function ndxWorkspaceNav(projectSlug: string, badges?: Partial<Record<string, number>>): WorkspaceNavItem[] {
  const base = `/projects/${projectSlug}`;
  return [
    { id: 'OVERVIEW', label: 'OVERVIEW', href: `${base}/content-operations` },
    { id: 'CREATE', label: 'CREATE', href: `${base}/marketing-expression/experiment-01` },
    { id: 'REVIEW', label: 'REVIEW', href: `${base}/content-operations/campaign-board`, badge: badges?.REVIEW },
    { id: 'LEARN', label: 'LEARN', href: `${base}/content-operations/performance` },
    { id: 'INTELLIGENCE', label: 'INTELLIGENCE', href: `${base}/cultural-intelligence` },
    { id: 'CHARACTER', label: 'CHARACTER', href: `${base}/embodied-character` },
    { id: 'ARCHIVE', label: 'ARCHIVE', href: `${base}/experiments` },
  ];
}

export function ndxExperimentJourney(_projectSlug: string): ExperimentStagePresentation[] {
  return [
    {
      stageId: 'UNDERSTAND',
      order: 1,
      label: '01 UNDERSTAND',
      purpose: 'Lore, appetite, personality — how NDX sees the world',
      experimentIds: ['lore-calibration', 'creative-appetite', 'personality-replay'],
      stateLabel: 'INTAKE',
    },
    {
      stageId: 'DISCOVER',
      order: 2,
      label: '02 DISCOVER',
      purpose: 'Concept territory, brand character — who NDX is',
      experimentIds: ['experiment-d', 'experiment-f', 'brand-character-formation', 'experiment-g'],
      stateLabel: 'VALIDATION',
    },
    {
      stageId: 'EXPRESS',
      order: 3,
      label: '03 EXPRESS',
      purpose: 'Marketing expression, visual authority, feed experiments',
      experimentIds: ['brand-marketing-expression', 'marketing-expression-experiment-01'],
      stateLabel: 'EXPRESSION',
    },
    {
      stageId: 'EMBODY',
      order: 4,
      label: '04 EMBODY',
      purpose: 'Character discovery, language, voice, casting',
      experimentIds: ['motion-character-book-language', 'embodied-character-discovery'],
      stateLabel: 'CHARACTER',
    },
    {
      stageId: 'PUBLISH',
      order: 5,
      label: '05 PUBLISH',
      purpose: 'Content ops, campaign board, daily cadence',
      experimentIds: ['content-operations', 'content-operations-campaign-board', 'content-operations-daily-plan'],
      stateLabel: 'PRODUCTION',
    },
    {
      stageId: 'LEARN',
      order: 6,
      label: '06 LEARN',
      purpose: 'Cultural intelligence, performance, market tests',
      experimentIds: ['cultural-intelligence', 'content-operations-performance'],
      stateLabel: 'LEARNING',
    },
  ];
}

export const NDX_CONTENT_LANE_LABELS = {
  FEED: 'THE PAGES',
  STORY: 'THE MARGINS',
  REEL: 'BOOK IN MOTION',
} as const;

export const NDX_EXPERIMENT_01_VERSION_LINEAGE = [
  { version: 'V2.1', summary: 'Cultural image participation — NDX enters the frame' },
  { version: 'V2.2', summary: 'Character retention — preserve punchlines and human trace' },
  { version: 'V2.3', summary: 'Art-board materiality — the canvas is an object' },
  { version: 'C.6', summary: 'Visual authority — bespoke art direction leads' },
  { version: 'C.6A', summary: 'Human-made marks + signature lime restraint' },
] as const;
