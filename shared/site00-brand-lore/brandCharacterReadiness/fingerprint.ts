/**
 * Readiness fingerprint — stale detection when upstream intelligence changes.
 */

import { createHash } from 'node:crypto';
import type { BrandLoreProfile } from '../types.js';
import { BRAND_CHARACTER_READINESS_METHODOLOGY_V1 } from './constants.js';
import type { BrandCharacterReadinessFingerprint } from './types.js';

export function compileReadinessFingerprint(params: {
  profile: BrandLoreProfile | null;
  deepeningAnswerCount: number;
}): BrandCharacterReadinessFingerprint {
  const brandLoreFingerprint = params.profile
    ? createHash('sha256')
        .update(
          JSON.stringify({
            v: params.profile.profileVersion,
            readiness: params.profile.readinessState,
            belief: params.profile.brandBelief?.value,
            audience: params.profile.audienceRelationship?.value,
          }),
        )
        .digest('hex')
        .slice(0, 16)
    : null;

  const personalityFingerprint = params.profile?.brandPersonality
    ? createHash('sha256')
        .update(
          JSON.stringify({
            v: params.profile.brandPersonality.profileVersion,
            state: params.profile.brandPersonality.personalityReadinessState,
            missing: params.profile.brandPersonality.personalityMissingDomains,
          }),
        )
        .digest('hex')
        .slice(0, 16)
    : null;

  const payload = {
    methodologyVersion: BRAND_CHARACTER_READINESS_METHODOLOGY_V1,
    brandLoreFingerprint,
    personalityFingerprint,
    deepeningAnswerCount: params.deepeningAnswerCount,
  };

  return {
    ...payload,
    fingerprint: createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16),
    compiledAt: new Date().toISOString(),
  };
}

export function readinessFingerprintChanged(
  previous: BrandCharacterReadinessFingerprint | null,
  current: BrandCharacterReadinessFingerprint,
): boolean {
  if (!previous) return true;
  return previous.fingerprint !== current.fingerprint;
}
