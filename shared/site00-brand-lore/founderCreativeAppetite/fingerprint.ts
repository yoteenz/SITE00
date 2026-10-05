/**
 * Creative Appetite fingerprint for future staleness detection.
 */

import { createHash } from 'node:crypto';
import type { FounderCreativeAppetiteProfile } from './types.js';

export function computeCreativeAppetiteFingerprint(profile: FounderCreativeAppetiteProfile | null | undefined): string | null {
  if (!profile) return null;
  const payload = JSON.stringify({
    version: profile.profileVersion,
    rawAnswers: profile.rawAnswers,
    domainTolerances: profile.domainTolerances.map((d) => [d.domain, d.band]),
    hardBoundaries: profile.hardCreativeBoundaries.value,
  });
  return createHash('sha256').update(payload).digest('hex').slice(0, 16);
}
