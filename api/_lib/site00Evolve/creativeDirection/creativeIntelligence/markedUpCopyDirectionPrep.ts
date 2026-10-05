/**
 * Ensure THE MARKED-UP COPY is production-complete before board v2 production.
 */

import {
  applyDirectionCompletionOverlays,
  completeDirectionProductionFields,
  validateImmutableAnchorsPreserved,
} from './directionCompletionService.js';
import {
  assessDirectionProductionCompleteness,
  normalizeFormedDirection,
  type FounderDirectionFieldKey,
} from './directionFieldContract.js';
import { getFormationRecordById, saveFormationRecord } from './formationStore/storeAdapter.js';
import { NDXBOOK_V1_FORMATION_ID } from './founderComparisonSet.js';
import { MARKED_UP_COPY_DIRECTION_NAME } from './creativeDirectionBoardTypes.js';
import { isAnthropicConfigured } from './config.js';
import type { ComparisonDirectionCandidate, CoreDirectionFormationRecord, FormedCoreDirection } from './types.js';

export type DirectionPrepResult =
  | {
      ok: true;
      direction: ComparisonDirectionCandidate;
      missingFieldsBefore: FounderDirectionFieldKey[];
      completionExecuted: boolean;
      fieldsCompleted: string[];
      immutableAnchorsPreserved: boolean;
      anthropicRequests: number;
    }
  | {
      ok: false;
      status: 'PILOT_BLOCKED_ON_DIRECTION_COMPLETION';
      missingFieldsBefore: FounderDirectionFieldKey[];
      reason: string;
    };

function deriveLoreLineageFromFormation(input: CoreDirectionFormationRecord['formationInput']): string[] {
  if (!input) return [];
  const lines: string[] = [];
  if (input.worldMetaphor?.trim()) lines.push(`worldMetaphor: ${input.worldMetaphor.trim()}`);
  if (input.brandBelief?.trim()) lines.push(`brandBelief: ${input.brandBelief.trim()}`);
  for (const canon of input.founderConfirmedCanon?.slice(0, 3) ?? []) {
    if (canon.trim()) lines.push(`founderCanon: ${canon.trim()}`);
  }
  for (const ref of input.referenceEvidence?.slice(0, 2) ?? []) {
    if (ref.founderNote?.trim()) lines.push(`reference: ${ref.founderNote.trim()}`);
  }
  return lines.filter(Boolean);
}

export async function ensureMarkedUpCopyProductionComplete(params: {
  comparisonDirection: ComparisonDirectionCandidate;
}): Promise<DirectionPrepResult> {
  const v1 = await getFormationRecordById(NDXBOOK_V1_FORMATION_ID);
  if (!v1?.formationInput) {
    return {
      ok: false,
      status: 'PILOT_BLOCKED_ON_DIRECTION_COMPLETION',
      missingFieldsBefore: [],
      reason: 'V1 formation or formationInput unavailable',
    };
  }

  const rawDir = v1.finalDirections.find((d) => d.directionName === MARKED_UP_COPY_DIRECTION_NAME);
  if (!rawDir) {
    return {
      ok: false,
      status: 'PILOT_BLOCKED_ON_DIRECTION_COMPLETION',
      missingFieldsBefore: [],
      reason: 'THE MARKED-UP COPY not found in v1 formation',
    };
  }

  const overlay = v1.directionCompletionOverlays?.find((o) => o.directionId === rawDir.directionId) ?? null;
  let direction = overlay
    ? applyDirectionCompletionOverlays([rawDir], [overlay])[0]!
    : normalizeFormedDirection(rawDir);

  let missingBefore = assessDirectionProductionCompleteness(direction).missingFields;
  let completionExecuted = false;
  let anthropicRequests = 0;
  const fieldsCompleted: string[] = [];

  if (!missingBefore.length && direction.loreLineage.length === 0) {
    missingBefore = ['loreLineage'];
  }

  if (missingBefore.length > 0) {
    if (isAnthropicConfigured()) {
      try {
        const result = await completeDirectionProductionFields({
          direction,
          formationInput: v1.formationInput,
        });
        anthropicRequests += result.anthropicRequestCount;
        direction = result.direction;
        if (result.overlay) {
          completionExecuted = true;
          fieldsCompleted.push(...result.overlay.fieldsCompleted.map(String));
          const overlays = [...(v1.directionCompletionOverlays ?? [])].filter(
            (o) => o.directionId !== direction.directionId,
          );
          overlays.push(result.overlay);
          await saveFormationRecord({
            ...v1,
            directionCompletionOverlays: overlays,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg !== 'CREATIVE_INTELLIGENCE_PROVIDER_UNAVAILABLE') throw e;
      }
    }

    const afterFirst = assessDirectionProductionCompleteness(direction);
    if (!afterFirst.complete && afterFirst.missingFields.includes('loreLineage') && !direction.loreLineage.length) {
      const derived = deriveLoreLineageFromFormation(v1.formationInput);
      if (derived.length) {
        direction = normalizeFormedDirection({ ...direction, loreLineage: derived });
        fieldsCompleted.push('loreLineage');
        completionExecuted = true;
      }
    }
  }

  const finalCompleteness = assessDirectionProductionCompleteness(direction);
  if (!finalCompleteness.complete) {
    return {
      ok: false,
      status: 'PILOT_BLOCKED_ON_DIRECTION_COMPLETION',
      missingFieldsBefore: missingBefore,
      reason: `Still incomplete: ${finalCompleteness.missingFields.join(', ')}`,
    };
  }

  const immutableOk = validateImmutableAnchorsPreserved(rawDir, direction);

  const candidate: ComparisonDirectionCandidate = {
    ...direction,
    comparisonIndex: params.comparisonDirection.comparisonIndex,
    sourceFormationId: params.comparisonDirection.sourceFormationId,
    sourceFormationVersion: params.comparisonDirection.sourceFormationVersion,
    sourceDirectionIndex: params.comparisonDirection.sourceDirectionIndex,
    brandLoreProfileVersion: params.comparisonDirection.brandLoreProfileVersion,
    brandLoreFingerprint: params.comparisonDirection.brandLoreFingerprint,
    fieldCompleteness: { complete: true, missingFields: [] },
    completionLineage: params.comparisonDirection.completionLineage,
  };

  return {
    ok: true,
    direction: candidate,
    missingFieldsBefore: missingBefore,
    completionExecuted,
    fieldsCompleted,
    immutableAnchorsPreserved: immutableOk,
    anthropicRequests,
  };
}
