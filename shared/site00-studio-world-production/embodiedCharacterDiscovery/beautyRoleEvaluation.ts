/**
 * P0.5E.3 — Beauty role evaluation — beauty incidental to character authority.
 */

import { randomId } from './id.js';
import { BEAUTY_ROLE_FAILURES } from './constants.js';
import type { BeautyRoleFailure } from './types.js';

export function evaluateBeautyRole(params: {
  beautyPrimaryReasonToWatch: boolean;
  permanentGlam: boolean;
  permanentEditorialPose: boolean;
  influencerCollapse: boolean;
  sexualizationAsPersonality: boolean;
}): { passes: boolean; failures: BeautyRoleFailure[] } {
  const failures: BeautyRoleFailure[] = [];
  if (params.influencerCollapse) failures.push('FAIL_INFLUENCER_COLLAPSE');
  if (params.beautyPrimaryReasonToWatch) failures.push('FAIL_BEAUTY_AS_PRIMARY_REASON_TO_WATCH');
  if (params.permanentGlam) failures.push('FAIL_PERMANENT_GLAM');
  if (params.permanentEditorialPose) failures.push('FAIL_PERMANENT_EDITORIAL_POSE');
  if (params.sexualizationAsPersonality) failures.push('FAIL_SEXUALIZATION_AS_PERSONALITY');
  return { passes: failures.length === 0, failures };
}

export function influencerCollapseFailsEvaluation(influencerCollapse: boolean): boolean {
  return evaluateBeautyRole({
    beautyPrimaryReasonToWatch: false,
    permanentGlam: false,
    permanentEditorialPose: false,
    influencerCollapse,
    sexualizationAsPersonality: false,
  }).failures.includes('FAIL_INFLUENCER_COLLAPSE');
}

export function beautyRoleFailureModes(): readonly string[] {
  return BEAUTY_ROLE_FAILURES;
}

export function buildBeautyRoleEvaluationId(): string {
  return randomId('beauty');
}
