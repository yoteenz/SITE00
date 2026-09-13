import type { BlueprintRelationship } from './types.js';

/** Structural relationships for NDXBOOK overview mobile — prevents layout loosening during translation. */
export function buildNdxOverviewBlueprintRelationships(conceptId: string): BlueprintRelationship[] {
  const rel = (
    relationshipId: string,
    sourceObjectId: string,
    targetObjectId: string,
    type: BlueprintRelationship['type'],
    value: number | null = null,
  ): BlueprintRelationship => ({
    relationshipId,
    sourceObjectId,
    targetObjectId,
    type,
    value,
    unit: value != null ? 'ratio' : null,
    tolerance: 0.002,
    priority: 10,
  });

  return [
    rel(`rel-${conceptId}-1`, 'hero.headline', 'hero.supportingCopy', 'ALIGNED_LEFT'),
    rel(`rel-${conceptId}-2`, 'hero.ndxOverlay', 'hero.imageMain', 'OVERLAPS'),
    rel(`rel-${conceptId}-3`, 'progress.fill', 'progress.track', 'CONTAINED_BY'),
    rel(`rel-${conceptId}-4`, 'metrics.cell02.value', 'metrics.cell01.value', 'SHARES_BASELINE'),
    rel(`rel-${conceptId}-5`, 'focus.title', 'focus.icon', 'GAP_TO', 0.04),
    rel(`rel-${conceptId}-6`, 'sectionNav.overview', 'sectionNav.identity', 'GAP_TO', 0.08),
    rel(`rel-${conceptId}-7`, 'hero.dividerLime', 'hero.headline', 'ALIGNED_LEFT'),
    rel(`rel-${conceptId}-8`, 'client.surfaceMain', 'masthead.projectName', 'CONTAINED_BY'),
  ];
}
