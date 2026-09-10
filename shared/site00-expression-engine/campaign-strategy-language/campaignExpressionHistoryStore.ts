/**
 * P0.CSI.1 — Campaign expression history + founder preference learning (in-memory).
 */

import type {
  CampaignExpressionHistoryEntry,
  CampaignExpressionLanguage,
  CampaignStrategyType,
  FounderCampaignJudgment,
  FounderPreferenceAffinity,
} from './types.js';

const history: CampaignExpressionHistoryEntry[] = [];
const affinities = new Map<string, FounderPreferenceAffinity>();

/** Seed history for demo / tests */
export function seedCampaignExpressionHistory(entries: CampaignExpressionHistoryEntry[]): void {
  history.length = 0;
  history.push(...entries);
}

export function getCampaignExpressionHistory(brandSlug?: string): CampaignExpressionHistoryEntry[] {
  if (!brandSlug) return [...history];
  return history.filter((h) => h.brandSlug === brandSlug);
}

export function recordCampaignExpression(entry: CampaignExpressionHistoryEntry): void {
  history.push(entry);
}

export function recordFounderCampaignJudgment(input: {
  brandSlug: string;
  strategyType: CampaignStrategyType;
  expressionLanguages: CampaignExpressionLanguage[];
  judgment: FounderCampaignJudgment;
}): FounderPreferenceAffinity {
  const key = input.brandSlug.toLowerCase();
  const existing = affinities.get(key) ?? {
    brandSlug: key,
    strategyAffinities: {},
    languageAffinities: {},
    updatedAt: new Date().toISOString(),
  };

  const strategyDelta =
    input.judgment === 'LOVE_IT'
      ? 0.25
      : input.judgment === 'PROMISING'
        ? 0.12
        : input.judgment === 'TOO_CLOSE'
          ? -0.08
          : -0.2;

  existing.strategyAffinities[input.strategyType] =
    Math.max(-1, Math.min(1, (existing.strategyAffinities[input.strategyType] ?? 0) + strategyDelta));

  for (const lang of input.expressionLanguages) {
    const langDelta = strategyDelta * 0.5;
    existing.languageAffinities[lang] =
      Math.max(-1, Math.min(1, (existing.languageAffinities[lang] ?? 0) + langDelta));
  }

  existing.updatedAt = new Date().toISOString();
  affinities.set(key, existing);
  return existing;
}

export function getFounderPreferenceAffinity(brandSlug: string): FounderPreferenceAffinity | null {
  return affinities.get(brandSlug.toLowerCase()) ?? null;
}

/** High affinity ≠ default forever — dampen over-used strategies */
export function applyAntiOverfitPenalty(
  brandSlug: string,
  strategy: CampaignStrategyType,
  baseScore: number,
): number {
  const affinity = getFounderPreferenceAffinity(brandSlug);
  const recent = getCampaignExpressionHistory(brandSlug).slice(-3);
  const recentUses = recent.flatMap((h) => h.strategyTypes).filter((s) => s === strategy).length;

  let score = baseScore;
  if (recentUses >= 2) {
    score -= recentUses * 0.1;
  }
  if (affinity?.strategyAffinities[strategy] && affinity.strategyAffinities[strategy]! > 0.5) {
    score -= recentUses * 0.08;
  }
  return Math.max(0, score);
}

export function clearCampaignExpressionStoreForTest(): void {
  history.length = 0;
  affinities.clear();
}
