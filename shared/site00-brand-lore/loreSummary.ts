/**
 * Client-facing Brand World summary — "WHAT WE HEARD" review surface.
 */

import type { BrandLoreProfile } from './types.js';
import { IDNTY_LORE_QUESTIONS } from './idnty-lore-questions.js';

export type LoreSummarySection = {
  key: string;
  label: string;
  value: string;
};

function formatFieldValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (Array.isArray(value) && value.length > 0) return value.join(' · ');
  return null;
}

/** Build concise review sections from raw lore answers (preserves founder language). */
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
  };

  for (const [stepId, label] of Object.entries(labels)) {
    const raw = loreAnswers[stepId];
    const formatted = formatFieldValue(raw);
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
  ];

  return map
    .map(({ key, label }) => {
      const field = profile[key] as { value: unknown } | undefined;
      const formatted = formatFieldValue(field?.value);
      return formatted ? { key: String(key), label, value: formatted } : null;
    })
    .filter((s): s is LoreSummarySection => s !== null);
}

export function loreStepLabel(stepId: string): string {
  return IDNTY_LORE_QUESTIONS.find((q) => q.id === stepId)?.title.replace(/\n/g, ' ') ?? stepId;
}
