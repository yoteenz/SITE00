/**
 * Brand Character Readiness evaluation — overall state + gaps.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { BrandLoreProfile } from '../types.js';
import { BRAND_CHARACTER_READINESS_METHODOLOGY_V1 } from './constants.js';
import { inventoryCharacterEvidence } from './evidenceInventory.js';
import { evaluateAllCharacterReadinessDomains } from './domainEvaluation.js';
import type {
  BrandCharacterEvidenceGap,
  BrandCharacterReadinessEvaluation,
  BrandCharacterReadinessState,
  CharacterReadinessDomainEvaluation,
} from './types.js';
import { compileReadinessFingerprint } from './fingerprint.js';

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function gapsFromDomains(domains: CharacterReadinessDomainEvaluation[]): BrandCharacterEvidenceGap[] {
  return domains
    .filter((d) => d.questionRecommended && d.strength !== 'STRONG_EVIDENCE')
    .map((d) => ({
      gapId: `gap-${d.domain.toLowerCase()}`,
      domain: d.domain,
      severity:
        d.blocking ? 'CRITICAL' : d.strength === 'MISSING_EVIDENCE' ? 'HIGH' : ('MEDIUM' as const),
      whyItMatters: d.whyItMatters,
      existingEvidence: d.whatWeKnow,
      missingEvidence: d.whatRemainsUnclear.join('; ') || 'Founder-grounded specificity',
      canInferSafely: false as const,
      shouldAskFounder: d.questionRecommended,
      recommendedQuestionCount: d.strength === 'MISSING_EVIDENCE' ? 2 : 1,
      dependency: null,
      blocking: d.blocking,
    }));
}

function resolveOverallState(params: {
  profile: BrandLoreProfile | null;
  domains: CharacterReadinessDomainEvaluation[];
  gaps: BrandCharacterEvidenceGap[];
}): BrandCharacterReadinessState {
  if (!params.profile) return 'CHARACTER_BLOCKED';
  const ci = params.profile;
  if (ci.readinessState !== 'CORE_DIRECTION_READY') return 'CHARACTER_BLOCKED';
  const personality = ci.brandPersonality?.personalityReadinessState;
  if (!personality || personality === 'PERSONALITY_INCOMPLETE') return 'CHARACTER_INSUFFICIENT';

  const blocking = params.gaps.filter((g) => g.blocking);
  const thinOrMissing = params.domains.filter(
    (d) => d.strength === 'MISSING_EVIDENCE' || d.strength === 'THIN_EVIDENCE',
  );

  if (blocking.length > 0) return 'CHARACTER_PARTIAL';
  if (thinOrMissing.length === 0) return 'CHARACTER_READY';
  if (thinOrMissing.length <= 3 && personality === 'PERSONALITY_READY') return 'CHARACTER_PARTIAL';
  if (thinOrMissing.length >= 6) return 'CHARACTER_INSUFFICIENT';
  return 'CHARACTER_PARTIAL';
}

export function evaluateBrandCharacterReadiness(params: {
  profile: BrandLoreProfile | null;
  projectId: string;
  organizationId: string;
  deepeningAnswerCount?: number;
}): BrandCharacterReadinessEvaluation {
  const inventory = inventoryCharacterEvidence(params.profile);
  const domains = evaluateAllCharacterReadinessDomains(inventory);
  const gaps = gapsFromDomains(domains);
  const overallState = resolveOverallState({ profile: params.profile, domains, gaps });
  const fingerprint = compileReadinessFingerprint({
    profile: params.profile,
    deepeningAnswerCount: params.deepeningAnswerCount ?? 0,
  });

  const recommendedQuestionCount = gaps
    .filter((g) => g.shouldAskFounder)
    .reduce((sum, g) => sum + g.recommendedQuestionCount, 0);

  const formationGateAllowed = overallState === 'CHARACTER_READY';
  const formationGateReason = formationGateAllowed
    ? null
    : overallState === 'CHARACTER_BLOCKED'
      ? 'Upstream Project Intelligence incomplete — Brand Lore or Personality not ready'
      : overallState === 'CHARACTER_INSUFFICIENT'
        ? 'Character evidence insufficient — deepening required before territory formation'
        : overallState === 'CHARACTER_PARTIAL'
          ? 'Character evidence partial — targeted deepening recommended before formation'
          : 'Character readiness not evaluated';

  return {
    evaluationId: `bcr-${hash(params.projectId + fingerprint.fingerprint)}`,
    projectId: params.projectId,
    organizationId: params.organizationId,
    methodologyVersion: BRAND_CHARACTER_READINESS_METHODOLOGY_V1,
    overallState,
    domains,
    gaps,
    blockingGapCount: gaps.filter((g) => g.blocking).length,
    recommendedQuestionCount,
    fingerprint,
    forensicInventorySummary: {
      brandLore: `${inventory.brandLore.length} signals`,
      brandPersonality: `${inventory.brandPersonality.length} signals`,
      founderLanguage: `${inventory.founderLanguage.length} samples`,
      humorEvidence: `${inventory.humorWit.length} signals`,
      culturalEvidence: `${inventory.culturalReferences.length} signals`,
      duplicateEvidenceFound: 'checked at question compile time',
    },
    evaluatedAt: new Date().toISOString(),
    formationGateAllowed,
    formationGateReason,
  };
}

export function classifyRetrospectiveFormationInputReadiness(params: {
  profile: BrandLoreProfile | null;
  formationOccurredWithoutReadinessGate: true;
}): {
  formationInputReadiness: 'READY' | 'PARTIAL' | 'INSUFFICIENT' | 'NOT_EVALUATED';
  inputEvidenceLimited: boolean;
  primaryCause: 'METHODOLOGY_DEPTH_FAILURE' | 'INPUT_EVIDENCE_FAILURE' | 'BOTH' | 'UNKNOWN';
} {
  const evaluation = evaluateBrandCharacterReadiness({
    profile: params.profile,
    projectId: 'ndxbook',
    organizationId: 'ndxbook-org',
  });
  let formationInputReadiness: 'READY' | 'PARTIAL' | 'INSUFFICIENT' | 'NOT_EVALUATED' = 'NOT_EVALUATED';
  if (evaluation.overallState === 'CHARACTER_READY') formationInputReadiness = 'READY';
  else if (evaluation.overallState === 'CHARACTER_PARTIAL') formationInputReadiness = 'PARTIAL';
  else if (evaluation.overallState === 'CHARACTER_INSUFFICIENT' || evaluation.overallState === 'CHARACTER_BLOCKED') {
    formationInputReadiness = 'INSUFFICIENT';
  }

  const methodologyFailure = true;
  const inputFailure = formationInputReadiness !== 'READY';
  let primaryCause: 'METHODOLOGY_DEPTH_FAILURE' | 'INPUT_EVIDENCE_FAILURE' | 'BOTH' | 'UNKNOWN' = 'UNKNOWN';
  if (methodologyFailure && inputFailure) primaryCause = 'BOTH';
  else if (inputFailure) primaryCause = 'INPUT_EVIDENCE_FAILURE';
  else if (methodologyFailure) primaryCause = 'METHODOLOGY_DEPTH_FAILURE';

  return {
    formationInputReadiness,
    inputEvidenceLimited: formationInputReadiness !== 'READY',
    primaryCause,
  };
}

export function readinessEvaluationId(): string {
  return randomUUID();
}
