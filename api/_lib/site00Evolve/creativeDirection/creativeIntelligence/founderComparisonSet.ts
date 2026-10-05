/**
 * Instance-scoped founder comparison set — NDX BOOK exception only.
 *
 * NOT a formation. NOT a reform. NOT global six-direction mode.
 * Projects selected directions from multiple legitimate formations sharing
 * organization + Brand Lore fingerprint for founder review.
 */

import {
  assessDirectionProductionCompleteness,
  normalizeFormedDirection,
  normalizeFormedDirections,
} from './directionFieldContract.js';
import {
  getFormationRecordById,
  listFormationRecordsByOrganizationId,
} from './formationStore/storeAdapter.js';
import { buildVisualProofPlans } from './visualProofPlanBuilder.js';
import { applyDirectionCompletionOverlays } from './directionCompletionService.js';
import type {
  ComparisonDirectionCandidate,
  ComparisonVisualProofPlan,
  CoreDirectionFormationRecord,
  DirectionCompletionOverlay,
  FounderComparisonSet,
  FormedCoreDirection,
} from './types.js';

export const NDXBOOK_ORG_SLUG = 'ndxbook';
export const NDXBOOK_ORG_ID = '7681ab75-bddc-43e5-b594-79fcf8168205';

/** Known durable formation IDs for NDX BOOK Brand Lore v24 fingerprint 5e71f429. */
export const NDXBOOK_V1_FORMATION_ID = '5db1b245-fe69-4287-acf7-e78417815fdf';
export const NDXBOOK_V2_FORMATION_ID = '39a27725-cf73-4371-b7c9-81c5d67bac8a';

const DISTINCTIVENESS_PAIRS: FounderComparisonSet['distinctivenessPairs'] = [
  {
    pair: ['THE MARKED-UP COPY', 'THE ANNOTATED COPY'],
    relationship: 'conceptual_cousin',
    differentiationNote:
      'Marked-Up Copy: active editing, crossed-out thoughts, working-draft energy. Annotated Copy: pre-lived-in reading copy / editorial annotation system.',
  },
  {
    pair: ['THE COUNTDOWN ROOM', 'THE ROOM WHERE IT HAPPENS'],
    relationship: 'conceptual_cousin',
    differentiationNote:
      'Countdown Room: ranking as entertainment, scoreboard culture, lists actively changing. Room Where It Happens: access to the editorial environment, working walls, inside-the-room spatiality.',
  },
  {
    pair: ['THE PERSONAL ARCHIVE', 'THE INDEX'],
    relationship: 'conceptual_cousin',
    differentiationNote:
      'Personal Archive: saved files, screenshot stashes, personal collections, useful disorder. Index: taxonomy, entries, numbering, cross-reference, classification and retrieval.',
  },
];

export function isNdxbookSixDirectionComparisonEnabled(orgSlug: string): boolean {
  return orgSlug === NDXBOOK_ORG_SLUG;
}

async function loadFormationForComparison(
  organizationId: string,
  fingerprint: string,
  formationVersion: number,
  fallbackFormationId: string,
): Promise<CoreDirectionFormationRecord | null> {
  const byId = await getFormationRecordById(fallbackFormationId);
  if (
    byId &&
    byId.organizationId === organizationId &&
    byId.formationVersion === formationVersion &&
    byId.finalDirections.length === 3
  ) {
    return byId;
  }

  const all = await listFormationRecordsByOrganizationId(organizationId);
  return (
    all.find(
      (r) =>
        r.brandLoreFingerprint === fingerprint &&
        r.formationVersion === formationVersion &&
        r.finalDirections.length === 3,
    ) ?? null
  );
}

function overlayForDirection(
  record: CoreDirectionFormationRecord,
  directionId: string,
): DirectionCompletionOverlay | null {
  return record.directionCompletionOverlays?.find((o) => o.directionId === directionId) ?? null;
}

function toComparisonCandidate(
  direction: FormedCoreDirection,
  params: {
    comparisonIndex: number;
    sourceFormation: CoreDirectionFormationRecord;
    sourceDirectionIndex: number;
    overlay: DirectionCompletionOverlay | null;
  },
): ComparisonDirectionCandidate {
  const merged = params.overlay
    ? applyDirectionCompletionOverlays([direction], [params.overlay])[0]!
    : normalizeFormedDirection(direction);
  const completeness = assessDirectionProductionCompleteness(merged);

  return {
    ...merged,
    comparisonIndex: params.comparisonIndex,
    sourceFormationId: params.sourceFormation.formationId,
    sourceFormationVersion: params.sourceFormation.formationVersion,
    sourceDirectionIndex: params.sourceDirectionIndex,
    brandLoreProfileVersion: params.sourceFormation.brandLoreProfileVersion,
    brandLoreFingerprint: params.sourceFormation.brandLoreFingerprint,
    fieldCompleteness: {
      complete: completeness.complete,
      missingFields: completeness.missingFields,
    },
    completionLineage: params.overlay,
  };
}

function buildPlansForFormationDirections(
  formation: CoreDirectionFormationRecord,
  directions: FormedCoreDirection[],
  comparisonIndexOffset: number,
): ComparisonVisualProofPlan[] {
  const input = formation.formationInput;
  if (!input) return [];

  const plans = buildVisualProofPlans(directions, input);
  return plans.map((plan, idx) => ({
    ...plan,
    comparisonIndex: comparisonIndexOffset + idx + 1,
    sourceFormationId: formation.formationId,
    sourceFormationVersion: formation.formationVersion,
  }));
}

export type ResolveFounderComparisonSetParams = {
  orgSlug: string;
  organizationId: string;
  brandLoreFingerprint: string;
  brandLoreProfileVersion: number;
  canonicalFormation?: CoreDirectionFormationRecord | null;
};

/**
 * Build the NDX BOOK six-direction founder comparison set.
 * Canonical formation (v2) is referenced but not replaced.
 */
export async function resolveNdxbookFounderComparisonSet(
  params: ResolveFounderComparisonSetParams,
): Promise<FounderComparisonSet | null> {
  if (!isNdxbookSixDirectionComparisonEnabled(params.orgSlug)) return null;

  const v1 = await loadFormationForComparison(
    params.organizationId,
    params.brandLoreFingerprint,
    1,
    NDXBOOK_V1_FORMATION_ID,
  );
  const v2 =
    params.canonicalFormation?.formationVersion === 2 &&
    params.canonicalFormation.finalDirections.length === 3
      ? params.canonicalFormation
      : await loadFormationForComparison(
          params.organizationId,
          params.brandLoreFingerprint,
          2,
          NDXBOOK_V2_FORMATION_ID,
        );

  if (!v1 || !v2 || v1.finalDirections.length !== 3 || v2.finalDirections.length !== 3) {
    return null;
  }

  const v1Directions = normalizeFormedDirections(v1.finalDirections);
  const v2Directions = normalizeFormedDirections(v2.finalDirections);

  const directions: ComparisonDirectionCandidate[] = [
    ...v1Directions.map((d, i) =>
      toComparisonCandidate(d, {
        comparisonIndex: i + 1,
        sourceFormation: v1,
        sourceDirectionIndex: i + 1,
        overlay: overlayForDirection(v1, d.directionId),
      }),
    ),
    ...v2Directions.map((d, i) =>
      toComparisonCandidate(d, {
        comparisonIndex: i + 4,
        sourceFormation: v2,
        sourceDirectionIndex: i + 1,
        overlay: null,
      }),
    ),
  ];

  const missingByDirection: Record<string, string[]> = {};
  let overlaysApplied = 0;
  for (const d of directions.slice(0, 3)) {
    if (d.completionLineage) overlaysApplied += 1;
    if (!d.fieldCompleteness.complete) {
      missingByDirection[d.directionName] = d.fieldCompleteness.missingFields;
    }
  }

  const v1MergedForPlans = directions.slice(0, 3).map((d) => {
    const { comparisonIndex: _ci, sourceFormationId: _sf, sourceFormationVersion: _sv, sourceDirectionIndex: _sd, brandLoreProfileVersion: _bv, brandLoreFingerprint: _bf, fieldCompleteness: _fc, completionLineage: _cl, ...formed } = d;
    return formed as FormedCoreDirection;
  });

  const visualProofPlans: ComparisonVisualProofPlan[] = [
    ...buildPlansForFormationDirections(v1, v1MergedForPlans, 0),
    ...buildPlansForFormationDirections(
      v2,
      v2Directions,
      3,
    ),
  ];

  return {
    kind: 'INSTANCE_SCOPED_FOUNDER_COMPARISON',
    orgSlug: NDXBOOK_ORG_SLUG,
    organizationId: params.organizationId,
    brandLoreFingerprint: params.brandLoreFingerprint,
    brandLoreProfileVersion: params.brandLoreProfileVersion,
    canonicalFormationId: v2.formationId,
    canonicalFormationVersion: v2.formationVersion,
    persistent: true,
    directionCount: directions.length,
    directions,
    visualProofPlans,
    v1CompletionStatus: {
      required: Object.keys(missingByDirection).length > 0,
      missingByDirection,
      overlaysApplied,
    },
    distinctivenessPairs: DISTINCTIVENESS_PAIRS,
  };
}
