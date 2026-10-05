/**
 * C1.8 — Rhetorical pattern lineage + AI rhythm detection.
 */

import type { BrandLanguageFailureClass, RhetoricalPatternLineage } from '../../../shared/site00-expression-engine/brand-language/types.js';

export const AI_RHETORICAL_PATTERNS = [
  { id: 'you-didnt-x-you-y', regex: /you didn't .+\. you .+/i },
  { id: 'its-not-x-its-y', regex: /it's not .+\. it's .+/i },
  { id: 'not-x-y', regex: /^not .+\. .+\.$/im },
  { id: 'x-already-told-you', regex: /the .+ already told you/i },
  { id: 'this-isnt-x-its-y', regex: /this isn't .+\. it's .+/i },
  { id: 'because-x', regex: /^because .+\.$/im },
  { id: 'meet-x', regex: /^meet .+\.$/im },
];

const globalUsage: Record<string, number> = {};
const brandUsage: Record<string, Record<string, number>> = {};

export function resetRhetoricalPatternLineage(): void {
  for (const k of Object.keys(globalUsage)) delete globalUsage[k];
  for (const k of Object.keys(brandUsage)) delete brandUsage[k];
}

export function trackRhetoricalPatterns(caption: string, brandId: string): string[] {
  const matched: string[] = [];
  for (const p of AI_RHETORICAL_PATTERNS) {
    if (p.regex.test(caption)) {
      matched.push(p.id);
      globalUsage[p.id] = (globalUsage[p.id] ?? 0) + 1;
      brandUsage[brandId] = brandUsage[brandId] ?? {};
      brandUsage[brandId]![p.id] = (brandUsage[brandId]![p.id] ?? 0) + 1;
    }
  }
  return matched;
}

export function detectRhetoricalPatternOveruse(
  brandId: string,
  threshold = 3,
): { overused: boolean; failureClasses: BrandLanguageFailureClass[] } {
  const usage = brandUsage[brandId] ?? {};
  const overused = Object.values(usage).some((c) => c >= threshold);
  return {
    overused,
    failureClasses: overused ? ['AI_RHETORICAL_PATTERN_OVERUSE'] : [],
  };
}

export function getRhetoricalPatternLineage(): RhetoricalPatternLineage {
  const overusedPatterns = Object.entries(globalUsage)
    .filter(([, c]) => c >= 3)
    .map(([p]) => p);
  return {
    patterns: AI_RHETORICAL_PATTERNS.map((p) => p.id),
    overusedPatterns,
    brandScoped: { ...brandUsage },
  };
}

export function analyzeLanguageRhythmDiversity(captions: string[]): {
  diverse: boolean;
  openings: string[];
  avgLength: number;
} {
  const openings = captions.map((c) => c.trim().split(/\s+/)[0]?.toLowerCase() ?? '');
  const uniqueOpenings = new Set(openings);
  const avgLength = captions.reduce((s, c) => s + c.split(/\s+/).length, 0) / Math.max(captions.length, 1);
  return {
    diverse: uniqueOpenings.size >= captions.length * 0.6,
    openings: [...uniqueOpenings],
    avgLength,
  };
}
