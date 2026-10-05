/**
 * P0.EXPERIENCE.MODULE-WIRING1 — 11-stage production pipeline with applicability.
 */

import type { ExperiencePipelineStageId, ExperiencePipelineStageRow, ExperienceType } from './types.js';

export const EXPERIENCE_PIPELINE_STAGE_DEFS: readonly {
  id: ExperiencePipelineStageId;
  order: number;
  shortLabel: string;
}[] = [
  { id: 'intent', order: 1, shortLabel: 'INTENT' },
  { id: 'authority', order: 2, shortLabel: 'AUTHORITY' },
  { id: 'source', order: 3, shortLabel: 'SOURCE' },
  { id: 'asset_production', order: 4, shortLabel: 'ASSET PRODUCTION' },
  { id: 'scene_assembly', order: 5, shortLabel: 'SCENE ASSEMBLY' },
  { id: 'mechanics', order: 6, shortLabel: 'MECHANICS' },
  { id: 'integration', order: 7, shortLabel: 'INTEGRATION' },
  { id: 'runtime', order: 8, shortLabel: 'RUNTIME' },
  { id: 'experience_review', order: 9, shortLabel: 'EXPERIENCE REVIEW' },
  { id: 'optimization', order: 10, shortLabel: 'OPTIMIZATION' },
  { id: 'release', order: 11, shortLabel: 'RELEASE' },
] as const;

/** Compact labels shown on overview (reference-aligned subset). */
export const EXPERIENCE_PIPELINE_COMPACT_STAGE_IDS: readonly ExperiencePipelineStageId[] = [
  'source',
  'scene_assembly',
  'asset_production',
  'mechanics',
  'runtime',
  'experience_review',
  'release',
];

const NOT_REQUIRED_FOR_APP = new Set<ExperiencePipelineStageId>([
  'scene_assembly',
  'asset_production',
  'optimization',
]);

const NOT_REQUIRED_FOR_CONFIGURATOR = new Set<ExperiencePipelineStageId>(['optimization']);

export function isPipelineStageApplicable(
  stageId: ExperiencePipelineStageId,
  experienceType: ExperienceType,
): boolean {
  if (experienceType === 'APP' && NOT_REQUIRED_FOR_APP.has(stageId)) return false;
  if (experienceType === 'CONFIGURATOR' && NOT_REQUIRED_FOR_CONFIGURATOR.has(stageId)) return false;
  return true;
}

export function buildDefaultPipelineRows(
  experienceType: ExperienceType,
  overrides?: Partial<Record<ExperiencePipelineStageId, ExperiencePipelineStageRow['state']>>,
): ExperiencePipelineStageRow[] {
  return EXPERIENCE_PIPELINE_STAGE_DEFS.map((def) => {
    const applicable = isPipelineStageApplicable(def.id, experienceType);
    const state = !applicable
      ? 'NOT_REQUIRED'
      : (overrides?.[def.id] ?? 'NOT_STARTED');
    return {
      id: def.id,
      order: def.order,
      shortLabel: def.shortLabel,
      state,
      applicable,
    };
  });
}

export function pipelineRowsForDisplay(
  rows: readonly ExperiencePipelineStageRow[],
  compact: boolean,
): ExperiencePipelineStageRow[] {
  const sorted = [...rows].sort((a, b) => a.order - b.order);
  if (!compact) return sorted;
  return sorted.filter((r) => EXPERIENCE_PIPELINE_COMPACT_STAGE_IDS.includes(r.id));
}
