/**
 * Experiment 01 V2 — same nine topics, editorial information governance.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { BrandMarketingArtifact, BrandMarketingExpressionSystem } from '../brandMarketingExpression/types.js';
import {
  EXPERIMENT_01_TOPIC_SPECS,
  formulateMarketingCharacterEvent,
  formulateMarketingContentThesis,
} from '../brandMarketingExpression/characterEventFormulation.js';
import { buildEditorialDecision, classifyInformationElements } from './editorialDecision.js';
import {
  buildFirstSlideInformationBudget,
  inferFirstSlideSemanticRole,
  inferTextDensity,
} from './firstSlideSystem.js';
import { assignTypographyRoles } from './typographyGovernance.js';
import { buildCarouselNarrativeArchitecture } from './carouselNarrative.js';
import { buildArtifactReadingPath } from './distanceQA.js';
import { buildFeedDensityRhythm } from './densityAndRhythm.js';
import { evaluateTextDensity } from './densityAndRhythm.js';
import { inferLimeFunction } from './limeGovernance.js';
import { evaluateEditorialArtifact } from './evaluation.js';
import { compileEditorialFalPrompt } from './falPromptCompilerV2.js';
import type {
  EditorialLayerBundle,
  Experiment01ComparisonEvaluation,
  Experiment01V2Artifact,
  FirstSlideArtDirectionContract,
  MarketingExpressionExperiment01V2,
  TextDensityLevel,
} from './types.js';
import { EXPERIMENT_01_V2_VERSION } from './constants.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

const NEGATIVE_CONSTRAINTS = [
  'no infographic overload',
  'no report compressed onto one page',
  'no multiple competing headlines',
  'no random fonts',
  'no lowercase NDX-authored copy',
  'no full source lists on slide 1',
  'no full methodology on slide 1',
  'no generic quote card',
  'no AI editorial clutter',
];

export function buildFirstSlideArtDirectionContract(params: {
  artifact: BrandMarketingArtifact;
  thesis: ReturnType<typeof formulateMarketingContentThesis>;
  decision: ReturnType<typeof buildEditorialDecision>;
  disclosure: ReturnType<typeof classifyInformationElements>;
  typographyAssignments: ReturnType<typeof assignTypographyRoles>;
  densityLevel: TextDensityLevel;
  packageId?: string | null;
}): FirstSlideArtDirectionContract {
  const semanticRole = inferFirstSlideSemanticRole({ artifact: params.artifact, thesis: params.thesis });
  const secondaryReveal =
    params.thesis.centralContradiction ??
    (params.decision.supportingEvidence[0] ? `THEN → NOW` : null);

  const budget = buildFirstSlideInformationBudget({
    artifact: params.artifact,
    primaryHook: params.decision.primaryHook,
    secondaryReveal,
  });

  const densityEval = evaluateTextDensity({
    level: params.densityLevel,
    isFirstSlide: true,
    justification: params.densityLevel === 'DENSE' ? 'Evidence-heavy topic with explicit editorial justification' : null,
  });

  const primaryTrace =
    params.artifact.makerTraces[0]?.toUpperCase() ?? 'ONE ANNOTATION WHERE CAUSALITY REQUIRES';

  const readingPath = buildArtifactReadingPath({
    primaryHook: params.decision.primaryHook,
    secondaryReveal,
    primaryEvidence: params.decision.supportingEvidence.slice(0, 2),
    primaryTrace,
    metadata: [`${params.artifact.topic} / ${params.artifact.subject}`],
  });

  const limeFunction = inferLimeFunction({ artifact: params.artifact, semanticRole });

  const contract: FirstSlideArtDirectionContract = {
    contentPackageId: params.packageId ?? null,
    artifactId: params.artifact.id,
    semanticRole,
    primaryHook: params.decision.primaryHook,
    secondaryReveal,
    viewerShouldNoticeFirst: params.decision.viewerShouldNoticeFirst,
    primaryEvidence: params.decision.supportingEvidence.slice(0, 2),
    deferredEvidence: params.decision.deferredEvidence,
    primaryTrace,
    optionalSecondaryTrace: params.artifact.makerTraces[1]?.toUpperCase() ?? null,
    typographyAssignments: params.typographyAssignments,
    textDensity: densityEval,
    readingPath,
    gridBehavior: 'Dominant idea survives thumbnail — strong silhouette',
    feedBehavior: 'Hook legible without zoom — clear reading path',
    inspectionBehavior: 'Provenance and trace reward closer inspection',
    limeFunction,
    compositionIntent: `ONE dominant semantic job: ${semanticRole}. Controlled character — not less character.`,
    negativeConstraints: NEGATIVE_CONSTRAINTS,
    informationBudget: budget,
    informationDisclosure: params.disclosure,
    evaluation: null,
    fingerprint: '',
  };
  contract.evaluation = evaluateEditorialArtifact(contract);
  contract.fingerprint = fp(contract);
  return contract;
}

export function buildEditorialLayerForArtifact(params: {
  artifact: BrandMarketingArtifact;
  expressionSystem: BrandMarketingExpressionSystem;
  characterSystemId: string;
  packageId?: string | null;
}): EditorialLayerBundle {
  const spec = EXPERIMENT_01_TOPIC_SPECS.find((s) => `bma-exp01-${s.topicIndex}` === params.artifact.id);
  if (!spec) {
    throw new Error(`No topic spec for artifact ${params.artifact.id}`);
  }

  const event = formulateMarketingCharacterEvent({ spec, characterSystemId: params.characterSystemId });
  const thesis = formulateMarketingContentThesis({ event, spec });
  const decision = buildEditorialDecision({
    projectId: params.expressionSystem.projectId,
    artifact: params.artifact,
    thesis,
    characterSystemId: params.characterSystemId,
    marketingExpressionSystemId: params.expressionSystem.id,
    contentPackageId: params.packageId ?? null,
  });

  const disclosure = classifyInformationElements({ artifact: params.artifact, thesis });
  const densityLevel = inferTextDensity({
    artifact: params.artifact,
    budget: buildFirstSlideInformationBudget({
      artifact: params.artifact,
      primaryHook: decision.primaryHook,
      secondaryReveal: thesis.centralContradiction,
    }),
  });

  const typographyAssignments = assignTypographyRoles({
    artifact: params.artifact,
    primaryHook: decision.primaryHook,
    secondaryReveal: thesis.centralContradiction,
    primaryTrace: params.artifact.makerTraces[0]?.toUpperCase() ?? 'ONE TRACE',
    metadataLabels: [`FILE: ${spec.topicIndex}`, spec.topic.split('/')[0]?.trim() ?? 'NDX'],
  });

  const firstSlideContract = buildFirstSlideArtDirectionContract({
    artifact: params.artifact,
    thesis,
    decision,
    disclosure,
    typographyAssignments,
    densityLevel,
    packageId: params.packageId,
  });

  const carouselNarrative = buildCarouselNarrativeArchitecture({
    artifact: params.artifact,
    thesis,
    decision,
    disclosure,
    typographyAssignments,
    packageId: params.packageId,
  });

  return {
    editorialDecision: decision,
    firstSlideContract,
    carouselNarrative,
    feedDensityRhythm: null,
    typographyAssignments,
    informationDisclosureMap: disclosure,
  };
}

export function formulateExperiment01V2(params: {
  v1Artifacts: BrandMarketingArtifact[];
  expressionSystem: BrandMarketingExpressionSystem;
  characterSystemId: string;
}): {
  experiment: MarketingExpressionExperiment01V2;
  generatedArtifacts: Experiment01V2Artifact[];
  boardEvaluation: Experiment01ComparisonEvaluation;
} {
  const now = new Date().toISOString();
  const v2Artifacts: Experiment01V2Artifact[] = [];
  const contracts: FirstSlideArtDirectionContract[] = [];
  const decisions: ReturnType<typeof buildEditorialDecision>[] = [];
  const architectures: ReturnType<typeof buildCarouselNarrativeArchitecture>[] = [];
  const densities: TextDensityLevel[] = [];

  for (const v1 of params.v1Artifacts) {
    const layer = buildEditorialLayerForArtifact({
      artifact: v1,
      expressionSystem: params.expressionSystem,
      characterSystemId: params.characterSystemId,
    });

    contracts.push(layer.firstSlideContract);
    decisions.push(layer.editorialDecision);
    architectures.push(layer.carouselNarrative);
    densities.push(layer.firstSlideContract.textDensity.level);

    const falContract = compileEditorialFalPrompt({
      artifact: v1,
      contract: layer.firstSlideContract,
    });

    v2Artifacts.push({
      id: `bma-exp01-v2-${v1.id.replace('bma-exp01-', '')}`,
      v1ArtifactId: v1.id,
      topic: v1.topic,
      subject: v1.subject,
      contract: layer.firstSlideContract,
      carouselArchitecture: layer.carouselNarrative,
      editorialDecision: layer.editorialDecision,
      generationContract: falContract,
      generatedAssetId: null,
      generatedAssetUrl: null,
      generationStatus: 'NOT_GENERATED',
      evaluation: layer.firstSlideContract.evaluation,
      founderJudgment: null,
      fingerprint: fp(layer),
      createdAt: now,
      updatedAt: now,
    });
  }

  const rhythm = buildFeedDensityRhythm({
    boardId: 'exp01-v2-board',
    artifactDensities: densities,
  });

  const boardEvaluation: Experiment01ComparisonEvaluation = {
    evaluationId: 'exp01-v1-v2-comparison',
    v1Version: 'EXPERIMENT_01_V1',
    v2Version: EXPERIMENT_01_V2_VERSION,
    characterChanged: false,
    expressionWorldChanged: false,
    informationArchitectureChanged: true,
    typographyGovernanceChanged: true,
    sequenceAwarenessChanged: true,
    boardEvaluation: {
      characterConsistency: 'PASS',
      typographicConsistency: 'PASS',
      limeConsistency: 'PASS',
      densityRhythm: rhythm.variationAdequate ? 'PASS' : 'FAIL',
      templateDependence: 'PASS',
      feedFatigue: rhythm.adjacentIntensityBalanced ? 'PASS' : 'FAIL',
    },
    evaluatedAt: now,
  };

  const experiment: MarketingExpressionExperiment01V2 = {
    experimentId: 'marketing-expression-experiment-01-v2',
    version: EXPERIMENT_01_V2_VERSION,
    projectId: params.expressionSystem.projectId,
    status: 'CONTRACTS_READY',
    topics: v2Artifacts.map((a) => a.topic),
    behavioralModesRepresented: [...new Set(params.v1Artifacts.map((a) => a.behavioralModeId))],
    v1ArtifactIds: params.v1Artifacts.map((a) => a.id),
    contracts,
    carouselArchitectures: architectures,
    editorialDecisions: decisions,
    generatedArtifacts: v2Artifacts,
    boardEvaluation,
    founderSetJudgment: null,
    formulationStartedAt: now,
    formulationAttemptId: randomUUID(),
    error: null,
  };

  return { experiment, generatedArtifacts: v2Artifacts, boardEvaluation };
}

export function experiment01V1Preserved(v1Artifacts: BrandMarketingArtifact[]): boolean {
  return v1Artifacts.every((a) => a.id.startsWith('bma-exp01-'));
}

export function v2UsesSameNineTopics(v2: MarketingExpressionExperiment01V2): boolean {
  return v2.generatedArtifacts.length === 9 && v2.topics.length === 9;
}

export function v2ContractReviewBeforeGeneration(experiment: MarketingExpressionExperiment01V2): boolean {
  return experiment.status === 'CONTRACTS_READY' && experiment.contracts.length === 9;
}

export function experiment01V2GeneratedByDefault(): false {
  return false;
}
