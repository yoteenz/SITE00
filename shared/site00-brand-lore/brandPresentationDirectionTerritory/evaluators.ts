/**
 * Brand Presentation Direction evaluators — post-formation gates.
 */

import {
  DIRECTION_FORMATION_OUTPUT_BLOCKLIST,
  MIN_EXPRESSION_SEEDS_REQUIRED,
  TOPIC_SUBSTITUTION_TOPICS,
} from './constants.js';
import type { BrandPresentationDirectionCandidate, FrozenParentConceptSnapshot } from './types.js';

const TOPIC_MARKERS = [
  'credit utilization',
  'utilization rate',
  'credit score',
  'this topic',
  'this subject',
  'about credit',
];

const CAMPAIGN_MARKERS = ['one campaign', 'single campaign', 'launch week', 'promo period', 'limited run'];

const FORMAT_MARKERS = ['carousel', 'reel', 'story frame', 'feed tile', 'tiktok', 'three-column', 'post format'];

const STYLE_MARKERS = ['serif', 'palette', 'font', 'typography', 'cream', 'gold', 'color scheme', 'visual style'];

const RECURRENCE_FAIL = ['one joke', 'one-off', 'single campaign', 'one metaphor', 'one gimmick', 'one format only'];

const VISUAL_GIMMICK = ['mind map', 'detective wall', 'red string', 'binoculars', 'magnifying glass', 'surveillance'];

type DirectionLike = Pick<
  BrandPresentationDirectionCandidate,
  | 'directionName'
  | 'directionThesis'
  | 'directionInterpretation'
  | 'brandBehavior'
  | 'editorialBehavior'
  | 'publishingBehavior'
  | 'recurrenceBehavior'
  | 'topicIndependence'
  | 'possibleExpressionSeeds'
  | 'notThis'
  | 'visualImplications'
>;

function combinedText(direction: DirectionLike): string {
  return [
    direction.directionName,
    direction.directionThesis,
    direction.directionInterpretation,
    direction.brandBehavior,
    direction.editorialBehavior,
    direction.publishingBehavior,
    direction.recurrenceBehavior,
    direction.topicIndependence,
    direction.visualImplications,
  ]
    .join(' ')
    .toLowerCase();
}

export function assertDirectionFormationQuarantined(text: string): void {
  const upper = text.toUpperCase();
  for (const blocked of DIRECTION_FORMATION_OUTPUT_BLOCKLIST) {
    if (upper.includes(blocked.toUpperCase())) {
      throw new Error(`FORMATION_QUARANTINE — blocked token: ${blocked}`);
    }
  }
}

export function evaluateDirectionTopicIndependence(direction: DirectionLike) {
  const text = combinedText(direction);
  const notes: string[] = [];

  if (TOPIC_MARKERS.some((m) => text.includes(m))) {
    notes.push('Direction appears topic-dependent');
    return { result: 'TOPIC_DEPENDENT_DIRECTION' as const, testTopics: [...TOPIC_SUBSTITUTION_TOPICS], notes };
  }
  if (CAMPAIGN_MARKERS.some((m) => text.includes(m))) {
    notes.push('Direction appears campaign-bound');
    return { result: 'CAMPAIGN_DIRECTION_COLLAPSE' as const, testTopics: [...TOPIC_SUBSTITUTION_TOPICS], notes };
  }
  if (FORMAT_MARKERS.filter((m) => text.includes(m)).length >= 2 && !direction.brandBehavior) {
    notes.push('Direction appears format-specific');
    return { result: 'FORMAT_DIRECTION_COLLAPSE' as const, testTopics: [...TOPIC_SUBSTITUTION_TOPICS], notes };
  }
  if (STYLE_MARKERS.filter((m) => text.includes(m)).length >= 2 && !direction.editorialBehavior) {
    notes.push('Direction reads as content-level not brand-presentation');
    return { result: 'CONTENT_DIRECTION_COLLAPSE' as const, testTopics: [...TOPIC_SUBSTITUTION_TOPICS], notes };
  }

  notes.push('Direction survives neutral topic substitution heuristics');
  return {
    result: 'BRAND_PRESENTATION_DIRECTION_TOPIC_INDEPENDENT' as const,
    testTopics: [...TOPIC_SUBSTITUTION_TOPICS],
    notes,
  };
}

export function evaluateDirectionRecurrence(direction: DirectionLike) {
  const text = combinedText(direction);
  const notes: string[] = [];

  if (RECURRENCE_FAIL.some((m) => text.includes(m))) {
    notes.push('Recurrence engine may exhaust quickly');
    return { result: 'FINITE_CONTENT_ENGINE' as const, notes };
  }
  if (VISUAL_GIMMICK.filter((m) => text.includes(m)).length >= 2) {
    notes.push('Direction may depend on a single visual gimmick');
    return { result: 'VISUAL_GIMMICK_DEPENDENCE' as const, notes };
  }
  if (!direction.recurrenceBehavior || direction.recurrenceBehavior.length < 20) {
    notes.push('Recurrence behavior underspecified');
    return { result: 'NOT_EVALUATED' as const, notes };
  }

  notes.push('Direction includes a durable recurrence behavior');
  return { result: 'PASS' as const, notes };
}

export function evaluateParentConceptFidelity(
  direction: DirectionLike,
  parent: FrozenParentConceptSnapshot,
) {
  const notes: string[] = [];
  const parentMechanism = parent.brandBehavior.toLowerCase();
  const directionText = combinedText(direction);

  const parentTokens = parentMechanism.split(/\s+/).filter((t) => t.length > 5).slice(0, 6);
  const overlap = parentTokens.filter((t) => directionText.includes(t)).length;

  if (overlap === 0 && !directionText.includes(parent.name.toLowerCase().slice(0, 8))) {
    notes.push('Direction may have drifted from parent governing mechanism');
    return { result: 'PARENT_CONCEPT_DRIFT' as const, notes };
  }

  notes.push('Direction remains interpretable as parent concept variant');
  return { result: 'PASS' as const, notes };
}

export function evaluateVisualFreedom(direction: DirectionLike) {
  const seeds = direction.possibleExpressionSeeds ?? [];
  if (seeds.length < MIN_EXPRESSION_SEEDS_REQUIRED) {
    return { result: 'SINGLE_METAPHOR_DIRECTION' as const, notes: ['Fewer than 3 expression seeds'] };
  }
  const styleOnly =
    STYLE_MARKERS.filter((m) => combinedText(direction).includes(m)).length >= 3 &&
    seeds.every((s) => STYLE_MARKERS.some((m) => s.seed.toLowerCase().includes(m)));
  if (styleOnly) {
    return { result: 'STYLE_DEPENDENT_DIRECTION' as const, notes: ['Expression seeds appear style-only'] };
  }
  return { result: 'PASS' as const, notes: ['Multiple expression possibilities available'] };
}

export function evaluateSiblingDistinctiveness(directions: DirectionLike[]) {
  const notes: string[] = [];
  if (directions.length < 2) {
    return { result: 'NOT_EVALUATED' as const, notes: ['Insufficient siblings'] };
  }

  const names = directions.map((d) => d.directionName.toLowerCase());
  if (new Set(names).size !== names.length) {
    notes.push('Duplicate direction names within parent');
    return { result: 'NEEDS_FOUNDER_REVIEW' as const, notes };
  }

  const theses = directions.map((d) => d.directionThesis.toLowerCase());
  for (let i = 0; i < theses.length; i++) {
    for (let j = i + 1; j < theses.length; j++) {
      const a = new Set(theses[i]!.split(/\s+/));
      const b = new Set(theses[j]!.split(/\s+/));
      let shared = 0;
      for (const w of a) {
        if (b.has(w) && w.length > 4) shared++;
      }
      if (shared > 8) {
        notes.push(`High thesis overlap between direction ${i + 1} and ${j + 1}`);
      }
    }
  }

  const styleCounts = directions.map(
    (d) => STYLE_MARKERS.filter((m) => combinedText(d).includes(m)).length,
  );
  const behaviorDistinct = directions.some((d) => d.brandBehavior && d.editorialBehavior);
  if (styleCounts.every((c) => c >= 2) && !behaviorDistinct) {
    notes.push('Sibling set may differ only by visual styling');
    return { result: 'STYLE_ONLY_DIFFERENTIATION' as const, notes };
  }

  const formatCounts = directions.map(
    (d) => FORMAT_MARKERS.filter((m) => combinedText(d).includes(m)).length,
  );
  if (formatCounts.every((c) => c >= 2)) {
    notes.push('Sibling set may differ only by format');
    return { result: 'FORMAT_ONLY_DIFFERENTIATION' as const, notes };
  }

  if (notes.length) {
    return { result: 'NEEDS_FOUNDER_REVIEW' as const, notes };
  }

  return { result: 'PASS' as const, notes: ['Sibling directions appear materially distinct'] };
}
