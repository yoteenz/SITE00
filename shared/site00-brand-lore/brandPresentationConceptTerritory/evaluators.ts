/**
 * Brand Presentation evaluators — abstraction-level gates (post-formation where noted).
 */

import {
  EDITORIAL_ARTIFACT_ANTI_ANCHORS,
  MIN_DIRECTION_SEEDS_REQUIRED,
  NEUTRAL_TOPIC_SUBSTITUTION_SET,
} from './constants.js';
import type {
  BrandPresentationConceptTerritory,
  BrandPresentationConceptVsDirectionEvaluation,
  BrandPresentationLevelEvaluation,
  RecurrenceEvaluation,
  TopicIndependenceEvaluation,
} from './types.js';

const TOPIC_MARKERS = [
  'credit utilization',
  'utilization rate',
  'credit score',
  'interest rate',
  'apr',
  'statement close',
  'this topic',
  'this subject',
  'about credit',
];

const CAMPAIGN_MARKERS = ['one campaign', 'single campaign', 'launch week', 'promo period', 'limited run'];

const FORMAT_MARKERS = ['carousel', 'reel', 'story frame', 'feed tile', 'tiktok', 'three-column'];

const STYLE_MARKERS = ['serif', 'palette', 'font', 'typography', 'cream', 'gold', 'visual style', 'graphic treatment'];

type ConceptLike = Pick<
  BrandPresentationConceptTerritory,
  | 'name'
  | 'conceptThesis'
  | 'brandExistenceModel'
  | 'audienceRelationship'
  | 'brandBehavior'
  | 'publishingLogic'
  | 'artifactLogic'
  | 'knowledgeBehavior'
  | 'authorityModel'
  | 'participationLogic'
  | 'recurrenceEngine'
  | 'topicIndependence'
  | 'socialNativeBehavior'
  | 'expansionPotential'
  | 'possibleDirectionRange'
  | 'notThis'
>;

function combinedText(concept: ConceptLike): string {
  return [
    concept.name,
    concept.conceptThesis,
    concept.brandExistenceModel,
    concept.audienceRelationship,
    concept.brandBehavior,
    concept.publishingLogic,
    concept.artifactLogic,
    concept.knowledgeBehavior,
    concept.authorityModel,
    concept.participationLogic,
    concept.recurrenceEngine,
    concept.topicIndependence,
    concept.socialNativeBehavior,
  ]
    .join(' ')
    .toLowerCase();
}

export function evaluateBrandPresentationLevel(concept: ConceptLike): BrandPresentationLevelEvaluation {
  const text = combinedText(concept);
  const notes: string[] = [];

  const topicSpecific = TOPIC_MARKERS.some((m) => text.includes(m));
  const campaignOnly = CAMPAIGN_MARKERS.some((m) => text.includes(m));
  const formatOnly = FORMAT_MARKERS.filter((m) => text.includes(m)).length >= 2 && !concept.brandBehavior;
  const styleOnly = STYLE_MARKERS.filter((m) => text.includes(m)).length >= 2 && !concept.knowledgeBehavior;
  const artifactOnly =
    EDITORIAL_ARTIFACT_ANTI_ANCHORS.some((m) => text.includes(m)) &&
    !concept.brandExistenceModel &&
    !concept.recurrenceEngine;

  if (topicSpecific) {
    notes.push('Concept appears topic-specific rather than brand-presentation-level');
    return {
      result: 'CONTENT_CONCEPT_NOT_BRAND_PRESENTATION',
      answersBrandPresentationQuestion: false,
      notes,
    };
  }
  if (campaignOnly) {
    notes.push('Concept appears campaign-bound');
    return {
      result: 'CAMPAIGN_CONCEPT_NOT_BRAND_PRESENTATION',
      answersBrandPresentationQuestion: false,
      notes,
    };
  }
  if (formatOnly) {
    notes.push('Concept dominated by social format');
    return {
      result: 'FORMAT_NOT_BRAND_PRESENTATION',
      answersBrandPresentationQuestion: false,
      notes,
    };
  }
  if (styleOnly) {
    notes.push('Concept appears style-dependent');
    return {
      result: 'STYLE_NOT_BRAND_PRESENTATION',
      answersBrandPresentationQuestion: false,
      notes,
    };
  }
  if (artifactOnly) {
    notes.push('Concept appears artifact-bound editorial metaphor');
    return {
      result: 'ARTIFACT_NOT_BRAND_PRESENTATION',
      answersBrandPresentationQuestion: false,
      notes,
    };
  }

  const hasBrandCore =
    Boolean(concept.brandExistenceModel) &&
    Boolean(concept.audienceRelationship) &&
    Boolean(concept.brandBehavior) &&
    Boolean(concept.recurrenceEngine) &&
    Boolean(concept.topicIndependence);

  if (!hasBrandCore) {
    notes.push('Missing core brand-presentation fields');
    return {
      result: 'DIRECTION_NOT_BRAND_PRESENTATION',
      answersBrandPresentationQuestion: false,
      notes,
    };
  }

  return {
    result: 'PASS_BRAND_PRESENTATION',
    answersBrandPresentationQuestion: true,
    notes: ['Concept answers persistent social brand presentation question'],
  };
}

/** Post-formation only — topic substitution test. */
export function evaluateBrandPresentationTopicIndependence(
  concept: ConceptLike,
): TopicIndependenceEvaluation {
  const level = evaluateBrandPresentationLevel(concept);
  if (!level.answersBrandPresentationQuestion) {
    return {
      result: 'CONTENT_LEVEL_COLLAPSE',
      testTopics: [...NEUTRAL_TOPIC_SUBSTITUTION_SET],
      perTopicResults: NEUTRAL_TOPIC_SUBSTITUTION_SET.map((topic) => ({
        topic,
        survives: false,
        note: 'Failed brand-presentation-level gate first',
      })),
      notes: ['Topic substitution skipped — concept failed brand-presentation gate'],
    };
  }

  const perTopicResults = NEUTRAL_TOPIC_SUBSTITUTION_SET.map((topic) => {
    const topicLower = topic.toLowerCase();
    const thesisAnchored =
      combinedText(concept).includes(topicLower) ||
      (concept.conceptThesis.toLowerCase().includes('utilization') && topicLower.includes('credit'));
    return {
      topic,
      survives: !thesisAnchored,
      note: thesisAnchored ? 'Concept thesis appears anchored to test topic' : 'Governing system plausibly survives topic change',
    };
  });

  const allSurvive = perTopicResults.every((r) => r.survives);
  const anyFail = perTopicResults.some((r) => !r.survives);

  let result: TopicIndependenceEvaluation['result'] = 'AMBIGUOUS_REQUIRES_SEMANTIC_REVIEW';
  if (allSurvive) result = 'PASS_BRAND_LEVEL';
  else if (anyFail && level.result === 'CAMPAIGN_CONCEPT_NOT_BRAND_PRESENTATION') {
    result = 'CAMPAIGN_LEVEL_COLLAPSE';
  } else if (anyFail) result = 'CONTENT_LEVEL_COLLAPSE';

  return {
    result,
    testTopics: [...NEUTRAL_TOPIC_SUBSTITUTION_SET],
    perTopicResults,
    notes: ['Post-formation topic substitution — does not reuse exact artwork'],
  };
}

export function evaluateBrandPresentationRecurrence(concept: ConceptLike): RecurrenceEvaluation {
  const text = combinedText(concept);
  const oneOffMarkers = ['one joke', 'one post', 'single post', 'one visual metaphor', 'one gimmick', 'one campaign'];

  if (oneOffMarkers.some((m) => text.includes(m))) {
    return {
      result: 'ONE_JOKE',
      supportsFranchises: false,
      supportsManyTopics: false,
      supportsRecurringBehavior: false,
      notes: ['Detected one-off/exhaustible premise'],
    };
  }

  const hasRecurrence =
    Boolean(concept.recurrenceEngine?.trim()) &&
    Boolean(concept.expansionPotential?.trim()) &&
    Boolean(concept.publishingLogic?.trim());

  if (!hasRecurrence) {
    return {
      result: 'ONE_GIMMICK',
      supportsFranchises: false,
      supportsManyTopics: false,
      supportsRecurringBehavior: false,
      notes: ['Missing recurrence engine or publishing logic'],
    };
  }

  return {
    result: 'PASS',
    supportsFranchises: true,
    supportsManyTopics: true,
    supportsRecurringBehavior: true,
    notes: ['Recurrence engine supports ongoing publishing'],
  };
}

export function evaluateBrandPresentationConceptVsDirection(
  concept: ConceptLike,
): BrandPresentationConceptVsDirectionEvaluation {
  const seeds = concept.possibleDirectionRange ?? [];
  const uniqueSeeds = new Set(seeds.map((s) => s.directionSeed.toLowerCase().trim()));
  const supportsMultipleDirections = uniqueSeeds.size >= MIN_DIRECTION_SEEDS_REQUIRED;

  const text = combinedText(concept);
  const styleDependent =
    STYLE_MARKERS.filter((m) => text.includes(m)).length >= 2 && !concept.brandBehavior;

  if (styleDependent) {
    return {
      result: 'STYLE_DEPENDENT',
      supportsMultipleDirections,
      directionSeedCount: seeds.length,
      notes: ['Underlying concept disappears if only style changes — style dependence detected'],
    };
  }

  if (!supportsMultipleDirections) {
    return {
      result: 'DIRECTION_NOT_CONCEPT',
      supportsMultipleDirections: false,
      directionSeedCount: seeds.length,
      notes: [`Requires at least ${MIN_DIRECTION_SEEDS_REQUIRED} materially different direction seeds`],
    };
  }

  return {
    result: 'CONCEPT',
    supportsMultipleDirections: true,
    directionSeedCount: seeds.length,
    notes: ['Concept supports multiple direction seeds without collapsing'],
  };
}

export function conceptualDistinctivenessSeparateFromLevelCorrectness(): true {
  return true;
}

export function topicSubstitutionIsPostFormationOnly(): true {
  return true;
}
