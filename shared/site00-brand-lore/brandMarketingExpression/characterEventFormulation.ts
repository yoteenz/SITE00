/**
 * Marketing Character Event + Content Thesis formulation.
 */

import { createHash, randomUUID } from 'node:crypto';
import type {
  BrandMarketingArtifact,
  BrandMarketingExpressionSystem,
  MarketingCharacterEvent,
  MarketingContentThesis,
  VisualCausalityRecord,
} from './types.js';
import { getBehavioralModeById } from './behavioralModes.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export type Experiment01TopicSpec = {
  topicIndex: number;
  topic: string;
  subject: string;
  behavioralModeId: string;
  characterTemperature: BrandMarketingArtifact['characterTemperature'];
  resolutionState: MarketingContentThesis['resolutionState'];
  artifactExpressionClass: BrandMarketingArtifact['artifactExpressionClass'];
  headline: string;
  trigger: string;
};

export const EXPERIMENT_01_TOPIC_SPECS: Experiment01TopicSpec[] = [
  {
    topicIndex: 1,
    topic: 'money / consumer behavior',
    subject: 'subscription creep',
    behavioralModeId: 'mode-02-question',
    characterTemperature: 'CURIOUS',
    resolutionState: 'QUESTION_OPEN',
    artifactExpressionClass: 'TYPOGRAPHIC_ARGUMENT',
    headline: 'WHY DOES EVERYTHING HAVE A SUBSCRIPTION NOW?',
    trigger: 'NDX noticed another formerly one-time purchase moving to recurring billing',
  },
  {
    topicIndex: 2,
    topic: 'technology',
    subject: 'self-checkout promise',
    behavioralModeId: 'mode-04-failed-promise',
    characterTemperature: 'SUSPICIOUS',
    resolutionState: 'PROVISIONAL_CONCLUSION',
    artifactExpressionClass: 'ANNOTATED_INTERFACE',
    headline: 'THIS WAS SUPPOSED TO SAVE US TIME.',
    trigger: 'NDX timed a checkout that took longer than the staffed lane',
  },
  {
    topicIndex: 3,
    topic: 'culture',
    subject: 'public reassessment of a pop figure',
    behavioralModeId: 'mode-03-cultural-reassessment',
    characterTemperature: 'REFLECTIVE',
    resolutionState: 'STRONG_CONCLUSION',
    artifactExpressionClass: 'ARCHIVAL_RECONSTRUCTION',
    headline: 'WE OWE HER AN APOLOGY.',
    trigger: 'NDX retrieved old headlines and felt the cultural judgment aged poorly',
  },
  {
    topicIndex: 4,
    topic: 'internet behavior',
    subject: 'attention economy pattern',
    behavioralModeId: 'mode-05-rabbit-hole',
    characterTemperature: 'INVESTIGATIVE',
    resolutionState: 'INVESTIGATION_IN_PROGRESS',
    artifactExpressionClass: 'EVIDENCE_DOSSIER',
    headline: 'I HAVE A THEORY.',
    trigger: 'NDX noticed the same engagement pattern across unrelated feeds',
  },
  {
    topicIndex: 5,
    topic: 'work / career',
    subject: 'corporate memo euphemism',
    behavioralModeId: 'mode-06-translation',
    characterTemperature: 'SERIOUS',
    resolutionState: 'REACTION_ONLY',
    artifactExpressionClass: 'PHOTOGRAPHIC_INTERVENTION',
    headline: 'BE SERIOUS.',
    trigger: 'NDX read "we remain confident in our direction" during layoffs',
  },
  {
    topicIndex: 6,
    topic: 'business',
    subject: 'then/now product promise',
    behavioralModeId: 'mode-07-receipt',
    characterTemperature: 'CONVICTED',
    resolutionState: 'CALLBACK',
    artifactExpressionClass: 'VISUAL_COMPARISON',
    headline: 'REMEMBER THIS?',
    trigger: 'NDX found a saved tweet contradicting a current announcement',
  },
  {
    topicIndex: 7,
    topic: 'lifestyle',
    subject: 'standing desk reconsideration',
    behavioralModeId: 'mode-08-self-correction',
    characterTemperature: 'SELF_CORRECTING',
    resolutionState: 'SELF_CORRECTION',
    artifactExpressionClass: 'MINIMAL_REACTION',
    headline: 'I THOUGHT THIS WAS STUPID.',
    trigger: 'NDX encountered new evidence after a dismissive first take',
  },
  {
    topicIndex: 8,
    topic: 'historical callback',
    subject: 'late fees across decades',
    behavioralModeId: 'mode-09-connection',
    characterTemperature: 'OBSESSIVE',
    resolutionState: 'STRONG_CONCLUSION',
    artifactExpressionClass: 'TIMELINE',
    headline: 'different decade. same model.',
    trigger: 'NDX compared Blockbuster late fees to streaming cancellation windows',
  },
  {
    topicIndex: 9,
    topic: 'social behavior',
    subject: 'contradictory public statements',
    behavioralModeId: 'mode-01-side-eye',
    characterTemperature: 'PLAYFUL',
    resolutionState: 'REACTION_ONLY',
    artifactExpressionClass: 'SINGLE_IMAGE_INTERRUPTION',
    headline: 'interesting.',
    trigger: 'NDX compared two statements from the same entity years apart',
  },
];

export function formulateMarketingCharacterEvent(params: {
  spec: Experiment01TopicSpec;
  characterSystemId: string;
  projectId?: string;
}): MarketingCharacterEvent {
  const mode = getBehavioralModeById(params.spec.behavioralModeId);
  const event: MarketingCharacterEvent = {
    id: `mce-${params.spec.topicIndex}-${randomUUID().slice(0, 6)}`,
    projectId: params.projectId ?? 'ndxbook',
    characterSystemId: params.characterSystemId,
    trigger: params.spec.trigger,
    subject: params.spec.subject,
    context: params.spec.topic,
    initialObservation: params.spec.trigger,
    initialReaction: mode?.possibleExpression ?? params.spec.headline,
    whyNDXCares: 'The obvious story is incomplete — NDX noticed a pattern, contradiction, or memory worth pursuing.',
    questionsRaised: params.spec.resolutionState === 'QUESTION_OPEN' ? [params.spec.headline] : [],
    contradictionsDetected: params.spec.behavioralModeId.includes('side-eye') ? ['Statement mismatch detected'] : [],
    memoriesTriggered: params.spec.behavioralModeId.includes('receipt') ? ['Archived evidence retrieved'] : [],
    culturalAssociations: params.spec.topic.includes('culture') ? ['Shared cultural memory'] : [],
    evidenceNeeded: ['Founder-grounded specifics', 'Primary source or observation'],
    connectionsSuspected: params.spec.behavioralModeId.includes('connection') ? ['Structural similarity suspected'] : [],
    humorPotential: params.spec.characterTemperature === 'PLAYFUL' ? 'Deadpan understatement' : null,
    seriousnessRequirement: params.spec.characterTemperature === 'SERIOUS' ? 'Humor suppressed' : null,
    investigationDepth: params.spec.resolutionState === 'INVESTIGATION_IN_PROGRESS' ? 'DEEP' : 'SHALLOW',
    provisionalJudgment: null,
    confidence: params.spec.resolutionState === 'STRONG_CONCLUSION' ? 'HIGH' : 'MEDIUM',
    unresolvedQuestions:
      params.spec.resolutionState === 'UNRESOLVED' || params.spec.resolutionState === 'QUESTION_OPEN'
        ? ['Open']
        : [],
    possibleBehavioralModes: [params.spec.behavioralModeId],
    status: 'FORMULATED',
    fingerprint: '',
  };
  event.fingerprint = fp(event);
  return event;
}

export function formulateMarketingContentThesis(params: {
  event: MarketingCharacterEvent;
  spec: Experiment01TopicSpec;
}): MarketingContentThesis {
  return {
    id: `mct-${params.event.id}`,
    characterEventId: params.event.id,
    behavioralModeId: params.spec.behavioralModeId,
    whatHappened: params.event.trigger,
    whatNDXNoticed: params.event.initialObservation,
    whyItMatters: params.event.whyNDXCares,
    whatNDXInitiallyThought: params.event.initialReaction,
    whatNDXInvestigated: params.spec.resolutionState === 'INVESTIGATION_IN_PROGRESS' ? 'Pattern across sources' : 'Immediate comparison',
    whatNDXFound: params.spec.resolutionState === 'STRONG_CONCLUSION' ? 'Evidence supports revised judgment' : 'Partial evidence — may remain open',
    whatNDXConnected: params.spec.behavioralModeId === 'mode-09-connection' ? 'Structural similarity across eras' : '',
    whatNDXRemembered: params.spec.behavioralModeId === 'mode-07-receipt' ? 'Archived statement from prior year' : '',
    whatNDXChangedItsMindAbout:
      params.spec.resolutionState === 'SELF_CORRECTION' ? 'Initial dismissive take' : null,
    centralContradiction: params.spec.behavioralModeId === 'mode-01-side-eye' ? 'Public claim vs later claim' : null,
    centralQuestion: params.spec.resolutionState === 'QUESTION_OPEN' ? params.spec.headline : null,
    centralClaim: params.spec.resolutionState === 'STRONG_CONCLUSION' ? params.spec.headline : null,
    confidence: 'MEDIUM',
    evidenceRequirements: params.event.evidenceNeeded,
    culturalContext: params.event.culturalAssociations,
    humorOpportunity: params.event.humorPotential,
    humorDecision: params.event.seriousnessRequirement ? 'SUPPRESS' : params.event.humorPotential ? 'USE' : 'NONE',
    seriousnessRequirement: params.event.seriousnessRequirement,
    audienceRelationship: 'Somebody in the room who noticed the same thing',
    desiredAudienceReaction: 'Recognition — "NDX touched this"',
    artifactImplications: ['First slide must stop/intrigue without clickbait'],
    resolutionState: params.spec.resolutionState,
    status: 'FORMULATED',
    evaluation: null,
  };
}

export function buildVisualCausalityForArtifact(params: {
  spec: Experiment01TopicSpec;
  thesis: MarketingContentThesis;
}): VisualCausalityRecord[] {
  const records: VisualCausalityRecord[] = [
    {
      visualElement: params.spec.headline,
      sourceBehavior: getBehavioralModeById(params.spec.behavioralModeId)?.sequence[0] ?? 'NOTICE',
      sourceTrace: 'JUDGMENT OR QUESTION',
      reasonForExistence: 'NDX could not ignore this observation',
      informationAffected: params.spec.subject,
      characterMeaning: params.thesis.whatNDXNoticed,
      alternativeManifestations: ['scale contrast', 'marginal note', 'circled detail'],
      required: true,
      optional: false,
    },
  ];
  if (params.spec.artifactExpressionClass !== 'MINIMAL_REACTION') {
    records.push({
      visualElement: 'evidence layout',
      sourceBehavior: 'INVESTIGATION',
      sourceTrace: 'SOURCE PRESENTATION',
      reasonForExistence: 'Thesis requires visible evidence',
      informationAffected: params.spec.topic,
      characterMeaning: 'NDX brought sources into comparison',
      alternativeManifestations: ['screenshot', 'chart', 'archive scan', 'interface capture'],
      required: true,
      optional: false,
    });
  }
  return records;
}

export function characterEventPrecedesArtifact(event: MarketingCharacterEvent | null): boolean {
  return event !== null && event.status !== 'DRAFT';
}

export function genericTopicToTemplateFails(topicOnly: string): boolean {
  return /^create a post about/i.test(topicOnly);
}

export function contentMayRemainUnresolved(state: MarketingContentThesis['resolutionState']): boolean {
  return ['REACTION_ONLY', 'QUESTION_OPEN', 'INVESTIGATION_IN_PROGRESS', 'UNRESOLVED'].includes(state);
}

export function formulateExperiment01Artifacts(params: {
  expressionSystem: BrandMarketingExpressionSystem;
  characterSystemId: string;
}): { events: MarketingCharacterEvent[]; theses: MarketingContentThesis[]; artifacts: BrandMarketingArtifact[] } {
  const events: MarketingCharacterEvent[] = [];
  const theses: MarketingContentThesis[] = [];
  const artifacts: BrandMarketingArtifact[] = [];
  const now = new Date().toISOString();

  for (const spec of EXPERIMENT_01_TOPIC_SPECS) {
    const event = formulateMarketingCharacterEvent({ spec, characterSystemId: params.characterSystemId });
    const thesis = formulateMarketingContentThesis({ event, spec });
    const causality = buildVisualCausalityForArtifact({ spec, thesis });
    events.push(event);
    theses.push(thesis);
    artifacts.push({
      id: `bma-exp01-${spec.topicIndex}`,
      expressionSystemId: params.expressionSystem.id,
      characterEventId: event.id,
      contentThesisId: thesis.id,
      behavioralModeId: spec.behavioralModeId,
      channel: 'INSTAGRAM_FEED',
      format: 'FIRST_SLIDE',
      topic: spec.topic,
      subject: spec.subject,
      characterTemperature: spec.characterTemperature,
      resolutionState: spec.resolutionState,
      artifactExpressionClass: spec.artifactExpressionClass,
      visualCausalityRecords: causality,
      evidenceObjects: thesis.evidenceRequirements,
      makerTraces: ['selection', 'comparison', 'annotation where causality requires'],
      headline: spec.headline,
      supportingLanguage: [thesis.whatNDXNoticed, thesis.whyItMatters].filter(Boolean),
      visibleEvidence: [`Evidence for ${spec.subject}`],
      hiddenEvidence: [],
      humorDecision: thesis.humorDecision,
      culturalContext: thesis.culturalContext,
      judgmentState: thesis.centralClaim ?? thesis.centralQuestion ?? 'Open',
      generationContract: null,
      generatedAssetId: null,
      generatedAssetUrl: null,
      generationStatus: 'NOT_GENERATED',
      characterEvaluation: null,
      northStarDistanceEvaluation: null,
      visualEvaluation: null,
      founderJudgment: null,
      fingerprint: fp({ spec, thesis }),
      createdAt: now,
      updatedAt: now,
    });
  }
  return { events, theses, artifacts };
}
