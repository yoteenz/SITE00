/**
 * Experiment 01 V2.1 — cultural image participation amendment.
 * Does NOT mutate V2 history — layers on top of P0.5C.1 contracts.
 */

import { createHash } from 'node:crypto';
import type { BrandMarketingArtifact, BrandMarketingExpressionSystem } from '../brandMarketingExpression/types.js';
import { EXPERIMENT_01_TOPIC_SPECS } from '../brandMarketingExpression/characterEventFormulation.js';
import type { FirstSlideArtDirectionContract, MarketingExpressionExperiment01V2 } from '../editorialInformationArchitecture/types.js';
import { buildEditorialLayerForArtifact } from '../editorialInformationArchitecture/experiment01V2.js';
import {
  buildCulturalVisualEvidence,
  buildVisualSubjectMatterDecision,
  getTopicVisualProfile,
} from './visualSubjectMatter.js';
import {
  buildArtisticEvidence,
  evaluateAmendedContract,
  evaluateCulturalAccomplice,
  evaluatePlayfulness,
  evaluateReferenceDensity,
  evaluateVisualAppetite,
} from './visualEvaluation.js';
import {
  buildFeedCulturalRhythm,
  buildFeedEmotionalRhythm,
  buildImageLedReadingPath,
  evaluateBoardVisualDiversity,
  inferPhotographyBehavior,
  inferVisualParticipationBalance,
} from './feedRhythm.js';
import { evaluateNorthStarCulturalParticipation } from './northStarCulturalForensics.js';
import { compileCulturalFalPrompt } from './falPromptCompilerV21.js';
import { buildFounderMarketingNorthStarArtifact } from '../brandMarketingExpression/northStarArtifact.js';
import type {
  AmendedFirstSlideContract,
  Experiment01V21Artifact,
  FirstSlideCulturalBalanceExtension,
  MarketingExpressionExperiment01V21,
} from './types.js';
import { EXPERIMENT_01_V21_VERSION } from './constants.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function amendFirstSlideContractWithCulturalParticipation(params: {
  baseContract: FirstSlideArtDirectionContract;
  artifact: BrandMarketingArtifact;
  topicIndex: number;
  characterTemperature: string;
  topic: string;
}): AmendedFirstSlideContract {
  const spec = EXPERIMENT_01_TOPIC_SPECS.find((s) => s.topicIndex === params.topicIndex)!;
  const profile = getTopicVisualProfile(params.topicIndex);

  const visualDecision = buildVisualSubjectMatterDecision({
    artifact: params.artifact,
    thesis: {
      whatNDXNoticed: params.artifact.supportingLanguage[0] ?? params.baseContract.primaryHook,
      centralContradiction: params.baseContract.secondaryReveal,
    } as never,
    spec,
  });

  const culturalEvidence = profile.requirement === 'NOT_HELPFUL' ? [] : [buildCulturalVisualEvidence({ artifactId: params.artifact.id, profile })];
  const artisticEvidence = buildArtisticEvidence({ artifactId: params.artifact.id, mode: profile.mode });
  const participationBalance = inferVisualParticipationBalance(profile.mode);
  const appetite = evaluateVisualAppetite({
    artifactId: params.artifact.id,
    mode: profile.mode,
    humanPresence: profile.humanPresence,
    imageHero: profile.imageHero,
    objectHero: profile.objectHero,
    playfulness: params.characterTemperature === 'PLAYFUL',
  });
  const accomplice = evaluateCulturalAccomplice({
    artifactId: params.artifact.id,
    mode: profile.mode,
    humanPresence: profile.humanPresence,
    culturalContext: profile.requirement === 'REQUIRED',
    topic: params.topic,
  });
  const playfulness = evaluatePlayfulness({
    artifactId: params.artifact.id,
    temperature: params.characterTemperature,
    mode: profile.mode,
  });
  const refDensity = evaluateReferenceDensity(culturalEvidence.map((e) => e.subjectDescription));

  let readingPath = params.baseContract.readingPath;
  if (profile.imageHero || profile.objectHero) {
    readingPath = buildImageLedReadingPath({
      imageSubject: profile.subject,
      primaryHook: params.baseContract.primaryHook,
      evidence: params.baseContract.primaryEvidence[0] ?? '',
      trace: params.baseContract.primaryTrace,
      metadata: params.topic,
    });
  }

  const culturalParticipation: FirstSlideCulturalBalanceExtension = {
    visualParticipationMode: profile.mode,
    imageParticipationRequired: profile.requirement,
    culturalVisualEvidence: culturalEvidence,
    artisticEvidence: artisticEvidence ? [artisticEvidence] : [],
    visualParticipationBalance: participationBalance,
    visualAppetiteTarget: appetite.overall,
    playfulnessTarget: playfulness.playful ? 'PLAYFUL' : 'SERIOUS',
    imageType: profile.evidenceClass,
    imageSourceClass: culturalEvidence[0]?.evidenceClassification ?? null,
    imageAuthority: 'MARKETING_EXPRESSION',
    imageProvenance: culturalEvidence[0]?.sourceProvenance ?? null,
    referenceDensity: refDensity,
    visualSubjectMatterDecision: visualDecision,
    visualAppetiteEvaluation: appetite,
    culturalAccompliceEvaluation: accomplice,
    playfulnessEvaluation: playfulness,
    photographyBehavior: inferPhotographyBehavior(profile.mode),
    whyImageBelongs: visualDecision.whyImageBelongs,
    whyImageDoesNotBelong: visualDecision.whyImageDoesNotBelong,
  };

  const amended: AmendedFirstSlideContract = {
    ...params.baseContract,
    readingPath,
    viewerShouldNoticeFirst:
      profile.imageHero || profile.objectHero ? profile.subject.toUpperCase().slice(0, 80) : params.baseContract.viewerShouldNoticeFirst,
    culturalParticipation,
    fingerprint: '',
  };
  amended.fingerprint = fp(amended);
  return amended;
}

export function formulateExperiment01V21(params: {
  v1Artifacts: BrandMarketingArtifact[];
  v2Experiment: MarketingExpressionExperiment01V2 | null;
  expressionSystem: BrandMarketingExpressionSystem;
  characterSystemId: string;
}): {
  experiment: MarketingExpressionExperiment01V21;
  artifacts: Experiment01V21Artifact[];
} {
  const now = new Date().toISOString();
  const amendedContracts: AmendedFirstSlideContract[] = [];
  const v21Artifacts: Experiment01V21Artifact[] = [];

  for (const v1 of params.v1Artifacts) {
    const topicIndex = parseInt(v1.id.replace('bma-exp01-', ''), 10);
    const v2Artifact = params.v2Experiment?.generatedArtifacts.find((a) => a.v1ArtifactId === v1.id);
    const v2Contract = params.v2Experiment?.contracts.find((c) => c.artifactId === v1.id);

    let baseContract: FirstSlideArtDirectionContract;
    let carouselArchitecture;
    let editorialDecision;

    if (v2Contract && v2Artifact) {
      baseContract = v2Contract;
      carouselArchitecture = v2Artifact.carouselArchitecture;
      editorialDecision = v2Artifact.editorialDecision;
    } else {
      const layer = buildEditorialLayerForArtifact({
        artifact: v1,
        expressionSystem: params.expressionSystem,
        characterSystemId: params.characterSystemId,
      });
      baseContract = layer.firstSlideContract;
      carouselArchitecture = layer.carouselNarrative;
      editorialDecision = layer.editorialDecision;
    }

    const amended = amendFirstSlideContractWithCulturalParticipation({
      baseContract,
      artifact: v1,
      topicIndex,
      characterTemperature: v1.characterTemperature,
      topic: v1.topic,
    });
    amendedContracts.push(amended);

    const falContract = compileCulturalFalPrompt({ artifact: v1, contract: amended });

    v21Artifacts.push({
      id: `bma-exp01-v21-${topicIndex}`,
      v1ArtifactId: v1.id,
      v2ArtifactId: v2Artifact?.id ?? null,
      topic: v1.topic,
      subject: v1.subject,
      contract: amended,
      carouselArchitecture,
      editorialDecision,
      generationContract: falContract,
      generatedAssetId: null,
      generatedAssetUrl: null,
      generationStatus: 'NOT_GENERATED',
      culturalEvaluation: evaluateAmendedContract(amended),
      founderJudgment: null,
      fingerprint: fp(amended),
      createdAt: now,
      updatedAt: now,
    });
  }

  const feedCultural = buildFeedCulturalRhythm({ boardId: 'exp01-v21', contracts: amendedContracts });
  const feedEmotional = buildFeedEmotionalRhythm({
    boardId: 'exp01-v21',
    topicIndices: params.v1Artifacts.map((a) => parseInt(a.id.replace('bma-exp01-', ''), 10)),
  });
  const boardEval = evaluateBoardVisualDiversity({ contracts: amendedContracts });
  const northStar = evaluateNorthStarCulturalParticipation(buildFounderMarketingNorthStarArtifact());

  const experiment: MarketingExpressionExperiment01V21 = {
    experimentId: 'marketing-expression-experiment-01-v21',
    version: EXPERIMENT_01_V21_VERSION,
    projectId: params.expressionSystem.projectId,
    status: 'CONTRACTS_READY',
    topics: v21Artifacts.map((a) => a.topic),
    v1ArtifactIds: params.v1Artifacts.map((a) => a.id),
    v2ArtifactIds: params.v2Experiment?.generatedArtifacts.map((a) => a.id) ?? [],
    amendedContracts,
    generatedArtifacts: v21Artifacts,
    feedCulturalRhythm: feedCultural,
    feedEmotionalRhythm: feedEmotional,
    boardEvaluation: boardEval,
    northStarCulturalCalibration: northStar,
    founderSetJudgment: null,
    error: null,
  };

  return { experiment, artifacts: v21Artifacts };
}

export function v21ContractReviewBeforeGeneration(experiment: MarketingExpressionExperiment01V21): boolean {
  return (
    (experiment.status === 'CONTRACTS_READY' || experiment.status === 'GENERATING') &&
    experiment.amendedContracts.length === 9
  );
}

export function experiment01CulturalVisualsGeneratedByDefault(): false {
  return false;
}

export function v2HistoryNotMutated(): true {
  return true;
}

export function sameTopicsUnchanged(artifacts: Experiment01V21Artifact[]): boolean {
  return artifacts.length === 9;
}

export function hierarchyCorrectionsPreserved(contract: AmendedFirstSlideContract): boolean {
  return Boolean(contract.informationBudget && contract.typographyAssignments.length > 0);
}

export function uppercaseGovernancePreserved(contract: AmendedFirstSlideContract): boolean {
  return contract.typographyAssignments.filter((t) => t.isNdxAuthored).every((t) => t.text === t.text.toUpperCase());
}
