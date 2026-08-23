/**
 * Diagnostic audit for replay methodology comparison scorer (0/5 investigation).
 */

import type { BrandPersonalityReplayRecord } from '../../../../../shared/site00-brand-lore/personalityReplayTypes.js';
import type { ComparisonScorerAuditReceipt } from '../../../../../shared/site00-brand-lore/sixDirectionConsistencyTypes.js';
import {
  comparePersonalityProfiles,
  scorePersonalityConvergence,
} from '../../../../../shared/site00-brand-lore/personalityReplayConvergence.js';
import type { BrandPersonalityProfile } from '../../../../../shared/site00-brand-lore/personalityTypes.js';

function countClassifications(
  reports: ReturnType<typeof comparePersonalityProfiles>,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of reports) {
    counts[r.classification] = (counts[r.classification] ?? 0) + 1;
  }
  return counts;
}

function explainPersonalityZero(params: {
  canonical: BrandPersonalityProfile | null;
  shadow: BrandPersonalityProfile | null;
  domainReports: ReturnType<typeof comparePersonalityProfiles>;
}): string {
  if (!params.canonical) {
    return 'Canonical benchmark personality is null — loadReplayBenchmarkSnapshot only loads brandPersonality from canonical profile; if canonical intake never saved personality, every domain compares empty canonical vs shadow → MEANINGFUL_DIVERGENCE → 0/5.';
  }
  if (!params.shadow) {
    return 'Shadow replay personality missing — cannot score convergence.';
  }
  const counts = countClassifications(params.domainReports);
  const scored = params.domainReports.filter((r) => r.classification !== 'NOT_COMPARABLE');
  if (scored.length === 0) {
    return 'All 15 domains NOT_COMPARABLE (both sides empty) — scorePersonalityConvergence returns 0 by design.';
  }
  if ((counts.MEANINGFUL_DIVERGENCE ?? 0) === scored.length) {
    return `All ${scored.length} comparable domains classified MEANINGFUL_DIVERGENCE — token overlap heuristic found <20% shared tokens between canonical and shadow synthesized labels. This may be real divergence (blind replay answered differently) OR canonical/shadow synthesis path mismatch (different answer keys → different label text).`;
  }
  return `Mixed classifications: ${JSON.stringify(counts)} — partial convergence possible but aggregate scored low.`;
}

export function auditComparisonScorer(params: {
  replay: BrandPersonalityReplayRecord;
  canonicalPersonality: BrandPersonalityProfile | null;
}): ComparisonScorerAuditReceipt {
  const shadow = params.replay.synthesizedPersonality;
  const domainReports = comparePersonalityProfiles({
    canonical: params.canonicalPersonality,
    shadow,
  });
  const recomputed = scorePersonalityConvergence(domainReports);
  const counts = countClassifications(domainReports);

  return {
    auditedAt: new Date().toISOString(),
    canonicalPersonalityPopulated: params.canonicalPersonality != null,
    shadowPersonalityPopulated: shadow != null,
    personalityScoreExplanation: explainPersonalityZero({
      canonical: params.canonicalPersonality,
      shadow,
      domainReports,
    }),
    creativeScoreExplanation:
      'creativeConvergence is hardcoded to 0 in runPostGenerationPersonalityComparison — Sonnet creative convergence not implemented; not a runtime evaluation failure.',
    identityScoreExplanation:
      'identityConvergence is hardcoded to 0 — canonical IAD not loaded in benchmark snapshot (formationDirections empty, identityArtDirectionId null).',
    heroScoreExplanation:
      'heroConvergence is hardcoded to 0 — no structural brief or visual QA comparison implemented; visual difference is expected and not scored.',
    allDomainsDivergentExplanation:
      (counts.MEANINGFUL_DIVERGENCE ?? 0) >= 10
        ? 'High MEANINGFUL_DIVERGENCE count — comparePersonalityProfiles uses deterministic token overlap on synthesized domain labels, not semantic Sonnet comparison. Exact string differences in synthesis paths register as divergence even when founder intent aligns.'
        : `Domain mix: ${JSON.stringify(counts)}`,
    sonnetComparisonExecuted: false,
    bugFound:
      !params.canonicalPersonality ||
      params.replay.comparisonReport?.scores.creativeConvergence === 0,
    fixRecommended: !params.canonicalPersonality
      ? 'Ensure canonical Brand Lore profile has brandPersonality populated from founder intake before replay comparison.'
      : 'Implement optional Sonnet semantic convergence for personality; wire creative/identity/hero scorers when benchmark artifacts exist. Until then, treat personality score as heuristic-only and creative/identity/hero as NOT_EVALUATED.',
    recomputedPersonalityScore: recomputed,
  };
}
