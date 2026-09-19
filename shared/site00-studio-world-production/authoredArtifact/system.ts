/**
 * P0.5C.6A — AuthoredArtifactSystem (generic orchestrator).
 */

import { createHash } from 'node:crypto';
import type {
  AuthoredArtifactAdapterInput,
  AuthoredArtifactAdapterOutput,
  AuthoredArtifactEvaluationBundle,
  AuthoredInterventionContract,
  InformationInhabitationContract,
} from './types.js';
import { buildArtifactHumanHistoryContract } from './humanHistoryContract.js';
import {
  evaluateAuthoredIntervention,
  evaluateOverResolvedArtifact,
  evaluateTemplateFrameDetection,
} from './evaluations.js';

export type AuthoredArtifactBrandAdapter = {
  brandId: string;
  buildAuthorshipPsychology: (input: AuthoredArtifactAdapterInput) => AuthoredArtifactAdapterOutput;
};

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

function buildInterventionContract(
  artifactId: string,
  adapter: AuthoredArtifactAdapterOutput,
): AuthoredInterventionContract {
  const contract: AuthoredInterventionContract = {
    contractId: `aic-${artifactId}`,
    artifactId,
    rawVisualArtifact: adapter.intervention.rawVisualArtifact,
    authorIntervention: adapter.intervention.authorIntervention,
    interventionCausality: adapter.intervention.interventionCausality,
    originalIdentifiableWithoutMarks: adapter.intervention.originalIdentifiableWithoutMarks,
    interventionsRevealThinking: adapter.intervention.interventionsRevealThinking,
    fingerprint: '',
  };
  contract.fingerprint = fp(contract);
  return contract;
}

function buildInformationInhabitationContract(
  artifactId: string,
  adapter: AuthoredArtifactAdapterOutput,
): InformationInhabitationContract {
  const contract: InformationInhabitationContract = {
    contractId: `iic-${artifactId}`,
    artifactId,
    headlinePlacement: adapter.informationInhabitation.headlinePlacement,
    evidencePlacement: adapter.informationInhabitation.evidencePlacement,
    inhabitationMode: adapter.informationInhabitation.inhabitationMode,
    whyThisPlacement: adapter.informationInhabitation.whyThisPlacement,
    informationInsideArtifactWorld: adapter.informationInhabitation.informationInsideArtifactWorld,
    fingerprint: '',
  };
  contract.fingerprint = fp(contract);
  return contract;
}

export function evaluateAuthoredArtifactBundle(params: {
  input: AuthoredArtifactAdapterInput;
  adapter: AuthoredArtifactBrandAdapter;
}): AuthoredArtifactEvaluationBundle {
  const adapterOutput = params.adapter.buildAuthorshipPsychology(params.input);

  const humanHistory = buildArtifactHumanHistoryContract({
    artifactId: params.input.artifactId,
    adapter: adapterOutput,
  });
  const intervention = buildInterventionContract(params.input.artifactId, adapterOutput);
  const informationInhabitation = buildInformationInhabitationContract(params.input.artifactId, adapterOutput);

  const templateFrameDetection = evaluateTemplateFrameDetection({
    artifactId: params.input.artifactId,
    artisticPremiseRequiresFrame: adapterOutput.templateFrameArtisticPremiseRequiresFrame,
    informationInsideArtifactWorld: informationInhabitation.informationInsideArtifactWorld,
  });

  const authoredIntervention = evaluateAuthoredIntervention({
    artifactId: params.input.artifactId,
    adapter: adapterOutput,
  });

  const overResolved = evaluateOverResolvedArtifact({
    artifactId: params.input.artifactId,
    templateFramePasses: templateFrameDetection.passes,
    interventionRevealsThinking: intervention.interventionsRevealThinking,
  });

  const failureStates = [
    ...templateFrameDetection.failureStates,
    ...authoredIntervention.failureStates,
    overResolved.failureState,
  ].filter(Boolean) as AuthoredArtifactEvaluationBundle['failureStates'];

  const uniqueFailures = [...new Set(failureStates)];
  const authoredArtifactGatePasses = uniqueFailures.length === 0;

  return {
    humanHistory,
    intervention,
    informationInhabitation,
    templateFrameDetection,
    overResolved,
    authoredIntervention,
    authoredArtifactGatePasses,
    generationReadinessBlocked: !authoredArtifactGatePasses,
    failureStates: uniqueFailures,
  };
}
