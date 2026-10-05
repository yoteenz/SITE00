/**
 * Client-facing Brand World summary — "WHAT WE HEARD" review surface.
 */

import type { BrandLoreProfile } from './types.js';
import { IDNTY_LORE_QUESTIONS, getLoreQuestion } from './idnty-lore-questions.js';
import {
  formatCompoundLabels,
  normalizeSelectedOptionIds,
  normalizeFreeText,
  resolveOptionLabels,
  resolveResponseMode,
} from './loreAnswerTypes.js';

export type LoreSummarySection = {
  key: string;
  label: string;
  value: string;
};

function formatRawAnswerForReview(stepId: string, raw: string | string[] | undefined): string | null {
  if (raw === undefined || raw === null) return null;
  const step = getLoreQuestion(stepId);
  if (!step) return null;

  const mode = resolveResponseMode(step);
  if (mode === 'FREE_TEXT') {
    const text = normalizeFreeText(raw);
    return text || null;
  }

  const ids = normalizeSelectedOptionIds(step, raw);
  if (ids.length === 0) return null;
  const labels = resolveOptionLabels(ids, step.options ?? []);
  return formatCompoundLabels(labels, ' + ');
}

/** Build concise review sections from raw lore answers (preserves compound selections). */
export function buildLoreSummaryFromAnswers(
  loreAnswers: Record<string, string | string[]>,
): LoreSummarySection[] {
  const sections: LoreSummarySection[] = [];
  const labels: Record<string, string> = {
    world: 'YOUR WORLD',
    role: 'YOUR ROLE',
    belief: 'YOUR BELIEF',
    contradiction: 'YOUR TENSION',
    lineage: 'YOUR REFERENCES',
    now: 'YOUR ATTENTION NOW',
    'no-go': 'YOUR NO-GO ZONE',
    feeling: 'YOUR FEELING',
    enemy: 'YOUR OPPOSITION',
    objects: 'YOUR OBJECTS',
  };

  for (const [stepId, label] of Object.entries(labels)) {
    const formatted = formatRawAnswerForReview(stepId, loreAnswers[stepId]);
    if (formatted) sections.push({ key: stepId, label, value: formatted });
  }

  return sections;
}

/** Build review sections from synthesized profile. */
export function buildLoreSummaryFromProfile(profile: BrandLoreProfile): LoreSummarySection[] {
  const map: { key: keyof BrandLoreProfile; label: string }[] = [
    { key: 'worldMetaphor', label: 'YOUR WORLD' },
    { key: 'audienceRelationship', label: 'YOUR ROLE' },
    { key: 'brandBelief', label: 'YOUR BELIEF' },
    { key: 'creativeTensions', label: 'YOUR TENSION' },
    { key: 'referenceLineage', label: 'YOUR REFERENCES' },
    { key: 'currentReferenceSignals', label: 'YOUR ATTENTION NOW' },
    { key: 'creativeAntiPatterns', label: 'YOUR NO-GO ZONE' },
    { key: 'materialVocabulary', label: 'YOUR OBJECTS' },
    { key: 'emotionalPromise', label: 'YOUR FEELING' },
    { key: 'culturalOpposition', label: 'YOUR OPPOSITION' },
  ];

  return map
    .map(({ key, label }) => {
      const field = profile[key] as { value: unknown } | undefined;
      const v = field?.value;
      if (v === null || v === undefined) return null;
      if (typeof v === 'string' && v.trim()) return { key: String(key), label, value: v.trim() };
      if (Array.isArray(v) && v.length > 0) {
        return { key: String(key), label, value: formatCompoundLabels(v.map(String), ' + ') };
      }
      return null;
    })
    .filter((s): s is LoreSummarySection => s !== null);
}

export function loreStepLabel(stepId: string): string {
  return IDNTY_LORE_QUESTIONS.find((q) => q.id === stepId)?.title.replace(/\n/g, ' ') ?? stepId;
}
