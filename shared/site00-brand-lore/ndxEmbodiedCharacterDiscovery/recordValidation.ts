/**
 * P0.5E.3 — Validate persisted embodied character discovery records.
 */

import { NDX_EMBODIED_CHARACTER_DISCOVERY_RUN_ID } from './constants.js';
import type { NdxEmbodiedCharacterDiscoveryRun } from './types.js';

export function isNdxEmbodiedCharacterDiscoveryRun(
  value: unknown,
  projectId: string,
): value is NdxEmbodiedCharacterDiscoveryRun {
  if (!value || typeof value !== 'object') return false;
  const rec = value as Record<string, unknown>;
  if (rec.projectId !== projectId) return false;
  if (rec.runId !== NDX_EMBODIED_CHARACTER_DISCOVERY_RUN_ID) return false;
  if (!rec.castingReadiness || typeof rec.castingReadiness !== 'object') return false;
  if (!rec.humanityEvaluation || typeof rec.humanityEvaluation !== 'object') return false;
  if (!Array.isArray(rec.visualEvidence)) return false;
  if (!Array.isArray(rec.interviewRounds)) return false;
  if (!rec.nextCastingRoundSpec || typeof rec.nextCastingRoundSpec !== 'object') return false;
  return true;
}
