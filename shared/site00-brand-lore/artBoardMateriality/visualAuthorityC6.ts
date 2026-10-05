/**
 * P0.5C.6 — NDX V2.3 visual authority integration (amends V2.3, not V2.4).
 */

import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import type { ArtBoardRetainedFirstSlideContract } from './types.js';
import {
  evaluateFeedArtisticRange,
  evaluateVisualAuthorityBundle,
  materialityAsMediumNotPremise,
} from '../../site00-studio-world-production/visualAuthority/evaluations.js';
import type { VisualAuthorityEvaluationBundle } from '../../site00-studio-world-production/visualAuthority/types.js';
import { buildVisualDiscoveryInheritance } from '../../site00-studio-world-production/visualAuthority/visualDiscoveryInheritance.js';

export function applyV23VisualAuthorityRevision(params: {
  contract: ArtBoardRetainedFirstSlideContract;
  artifact: BrandMarketingArtifact;
  topicIndex: number;
}): ArtBoardRetainedFirstSlideContract {
  const cp = params.contract.culturalParticipation;
  const vsm = cp.visualSubjectMatterDecision;
  const ab = params.contract.artBoardDirection;

  const genericNotebookOnly =
    ab.artifactForm.includes('NOTEBOOK') &&
    !vsm.imageHero &&
    !vsm.objectHero &&
    cp.visualParticipationBalance === 'EVIDENCE_LED' &&
    cp.visualParticipationMode !== 'TYPOGRAPHY_DOMINANT' &&
    cp.visualParticipationMode !== 'MIXED_MEDIA';

  const bundle = evaluateVisualAuthorityBundle({
    artifactId: params.artifact.id,
    topic: params.artifact.topic,
    subject: params.artifact.subject,
    primaryHook: params.contract.primaryHook,
    visualSubject: vsm.culturalVisualSubject,
    participationMode: cp.visualParticipationMode,
    participationBalance: cp.visualParticipationBalance,
    humanPresence: vsm.humanPresence,
    imageHero: vsm.imageHero,
    objectHero: vsm.objectHero,
    artifactForm: ab.artifactForm,
    whyNotTemplate: ab.whyNotCleanTemplate,
    visualAppetiteOverall: cp.visualAppetiteEvaluation.overall,
    evidenceDominatesThesis: cp.visualParticipationBalance === 'EVIDENCE_LED' && !vsm.imageHero,
    genericNotebookOnly,
  });

  if (!materialityAsMediumNotPremise(ab.artifactForm, bundle.bespokeArtDirection.artisticPremise)) {
    if (!bundle.bespokeArtDirection.artisticPremise.includes('Typographic art direction')) {
      bundle.failureStates.push('FAIL_MATERIALITY_AS_ART_DIRECTION_SUBSTITUTE');
      bundle.visualAppetiteGatePasses = false;
      bundle.generationReadinessBlocked = true;
    }
  }

  return {
    ...params.contract,
    visualAuthorityEvaluation: bundle,
    visualDiscoveryInheritance: buildVisualDiscoveryInheritance(),
  };
}

export function evaluateV23BoardVisualAuthority(artifacts: Array<{ contract: ArtBoardRetainedFirstSlideContract }>) {
  const modes = artifacts.map((a) => a.contract.culturalParticipation.visualParticipationMode);
  return evaluateFeedArtisticRange({ boardId: 'exp01-v23', modes });
}

export function v23VisualAuthorityGatePasses(artifact: { contract: ArtBoardRetainedFirstSlideContract }): boolean {
  const bundle = artifact.contract.visualAuthorityEvaluation;
  if (!bundle) return false;
  return bundle.visualAppetiteGatePasses;
}

export function round01VisualAuthorityGatePasses(artifacts: Array<{ contract: ArtBoardRetainedFirstSlideContract; generationStatus?: string; generatedAssetUrl?: string | null }>): boolean {
  const generated = artifacts.filter((a) => a.generationStatus === 'GENERATED' && a.generatedAssetUrl);
  if (generated.length < 9) return false;
  return generated.every((a) => v23VisualAuthorityGatePasses(a));
}

export type { VisualAuthorityEvaluationBundle };
