/**
 * Build personality lineage entries for Creative Expression — upstream canon → derived behavior.
 */

import type { BrandPersonalityProfile } from './personalityTypes.js';

export function buildPersonalityLineageFromProfile(
  personality: BrandPersonalityProfile | null | undefined,
): Array<{
  upstreamField: string;
  upstreamValue: string;
  derivedBehavior: string;
  classification: string;
}> {
  if (!personality) return [];

  const entries: Array<{
    upstreamField: string;
    upstreamValue: string;
    derivedBehavior: string;
    classification: string;
  }> = [];

  const push = (
    upstreamField: keyof BrandPersonalityProfile,
    derivedBehavior: string,
    value: unknown,
    classification: string,
  ) => {
    if (value === null || value === undefined) return;
    const text = Array.isArray(value) ? value.join(', ') : String(value);
    if (!text.trim()) return;
    entries.push({ upstreamField: String(upstreamField), upstreamValue: text, derivedBehavior, classification });
  };

  push('witBehavior', 'witMechanics', personality.witBehavior.value, personality.witBehavior.classification);
  push('confidenceBehavior', 'verbalPersonality', personality.confidenceBehavior.value, personality.confidenceBehavior.classification);
  push('disagreementBehavior', 'annotationVoice', personality.disagreementBehavior.value, personality.disagreementBehavior.classification);
  push('observationalBehavior', 'headlineBehavior', personality.observationalBehavior.value, personality.observationalBehavior.classification);
  push('antiPersonality', 'antiGenericCreativeRules', personality.antiPersonality.value, personality.antiPersonality.classification);
  push('selfCorrectionBehavior', 'restraintRules', personality.selfCorrectionBehavior.value, personality.selfCorrectionBehavior.classification);
  push('signatureMoves', 'recurringEditorialJokes', personality.signatureMoves.value, personality.signatureMoves.classification);

  return entries;
}
