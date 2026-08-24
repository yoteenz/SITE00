/**
 * P0.5C.4A — Surgical V2.3 human-made / lime intervention revision.
 * Preserves parent V2.3 materiality fingerprint as immutable evidence.
 */

import { createHash } from 'node:crypto';
import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import type {
  ArtBoardRetainedFirstSlideContract,
  HumanMadeArtifactEvaluation,
  HumanMadeFailureState,
  V23HumanMadeRevision,
} from './types.js';
import { buildNdxHumanMadeMarkSystem, evaluateHumanMarkConsistency } from './humanMadeMarks.js';
import {
  buildNdxLimeInterventionSystem,
  evaluateLimeFeedDistance,
  evaluateLimeInterventionDensity,
  limeTooPassiveFails,
} from './limeIntervention.js';
import {
  evaluateAntiAIGeneratedArtifact,
  evaluateHandMarkLegibility,
  evaluateMakerEvidenceStrength,
  noVisibleMakerActionFails,
} from './antiAiEvaluation.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function buildV23HumanMadeRevision(params: {
  parentFingerprint: string;
  topicIndex: number;
}): V23HumanMadeRevision {
  const preserve = [
    'material construction',
    'headline hierarchy',
    'receipt stack',
    'character beat',
    'paper object',
  ];
  const change = ['lime visibility', 'icon behavior', 'maker trace'];
  if (params.topicIndex === 1) {
    change.push('replace generic product pictograms with lime hand-drawn NDX symbols');
  }
  return {
    revisionId: `v23hm-${params.topicIndex}`,
    parentFingerprint: params.parentFingerprint,
    revisionAppliedAt: new Date().toISOString(),
    preserve,
    change,
    mustNotBecome: ['busy', 'cartoonish', 'scrapbook', 'vector infographic', 'AI decorative'],
  };
}

export function buildHumanMadeArtifactEvaluation(params: {
  artifactId: string;
  artifact: BrandMarketingArtifact;
  topicIndex: number;
  contract: ArtBoardRetainedFirstSlideContract;
}): HumanMadeArtifactEvaluation {
  const markSystem = buildNdxHumanMadeMarkSystem({
    artifactId: params.artifactId,
    artifact: params.artifact,
    topicIndex: params.topicIndex,
  });
  const humanMarkConsistency = evaluateHumanMarkConsistency({ artifactId: params.artifactId, markSystem });
  const limeIntervention = buildNdxLimeInterventionSystem({
    markSystem,
    limeFunction: params.contract.limeFunction,
    topicIndex: params.topicIndex,
  });
  limeIntervention.density = evaluateLimeInterventionDensity({ limeIntervention });

  const antiAi = evaluateAntiAIGeneratedArtifact({
    artifactId: params.artifactId,
    markSystem,
    hasGenericPictograms: params.topicIndex === 1 ? false : undefined,
    hasVectorIcons: false,
    hasFakeHandwriting: false,
  });
  const makerEvidenceStrength = evaluateMakerEvidenceStrength({ markSystem });
  const limeFeedDistance = evaluateLimeFeedDistance({ artifactId: params.artifactId, limeIntervention });
  const handMarkLegibility = evaluateHandMarkLegibility({ artifactId: params.artifactId, markSystem });

  const failureStates: HumanMadeFailureState[] = [];
  if (!antiAi.passesGate) failureStates.push('FAIL_AI_ICONOGRAPHY');
  if (humanMarkConsistency.result === 'MIXED_STYLES') failureStates.push('FAIL_MULTIPLE_HAND_STYLES');
  if (limeTooPassiveFails(limeIntervention, params.topicIndex === 1)) failureStates.push('FAIL_LIME_TOO_PASSIVE');
  if (noVisibleMakerActionFails(makerEvidenceStrength) && params.topicIndex === 1) {
    failureStates.push('FAIL_NO_VISIBLE_MAKER_ACTION');
  }

  const strengthOk =
    params.topicIndex === 1
      ? makerEvidenceStrength === 'MODERATE' || makerEvidenceStrength === 'STRONG'
      : makerEvidenceStrength !== 'NONE' || params.topicIndex === 7;

  const passesHumanMadeGate =
    antiAi.passesGate &&
    strengthOk &&
    (limeFeedDistance.result !== 'TOO_WEAK' || params.topicIndex === 7);

  return {
    evaluationId: `hma-${params.artifactId}`,
    artifactId: params.artifactId,
    markSystem,
    limeIntervention,
    humanMarkConsistency,
    antiAi,
    makerEvidenceStrength,
    limeFeedDistance,
    handMarkLegibility,
    passesHumanMadeGate,
    failureStates: [...new Set(failureStates)],
    evaluatedAt: new Date().toISOString(),
  };
}

export function applyV23HumanMadeRevision(params: {
  contract: ArtBoardRetainedFirstSlideContract;
  artifact: BrandMarketingArtifact;
  topicIndex: number;
}): ArtBoardRetainedFirstSlideContract {
  const parentFingerprint = params.contract.fingerprint;
  const humanMadeEvaluation = buildHumanMadeArtifactEvaluation({
    artifactId: params.artifact.id,
    artifact: params.artifact,
    topicIndex: params.topicIndex,
    contract: params.contract,
  });
  const humanMadeRevision = buildV23HumanMadeRevision({ parentFingerprint, topicIndex: params.topicIndex });

  const revised: ArtBoardRetainedFirstSlideContract = {
    ...params.contract,
    humanMadeEvaluation,
    humanMadeRevision,
    fingerprint: '',
  };
  revised.fingerprint = fp({ ...revised, fingerprint: undefined });
  return revised;
}

export function v23ParentFingerprintPreserved(revision: V23HumanMadeRevision, parentFingerprint: string): boolean {
  return revision.parentFingerprint === parentFingerprint;
}

export function v23HumanMadeRevisionReady(evaluation: HumanMadeArtifactEvaluation | null | undefined): boolean {
  return Boolean(evaluation?.passesHumanMadeGate);
}
