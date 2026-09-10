/**
 * P0.CBI.1 — Durable campaign history backing for anti-repetition.
 */

import type { BrandCampaignHistoryEntry, BrandCampaignHistorySummary } from './types.js';
import { normalizeBrandId } from './constants.js';
import { loadPersistedContext, persistAssembledContext } from './brandCreativeContextAssembler.js';

const historyByBrand = new Map<string, BrandCampaignHistoryEntry[]>();

export function getBrandCampaignHistorySummary(brandId: string): BrandCampaignHistorySummary {
  const key = normalizeBrandId(brandId);
  const entries = historyByBrand.get(key) ?? loadHistoryFromContext(key);
  const recent = [...entries].sort((a, b) => b.performedAt.localeCompare(a.performedAt)).slice(0, 10);

  return {
    recentCampaigns: recent,
    lastUsedStrategies: recent.flatMap((e) => e.strategyUsed),
    lastUsedWorlds: recent.map((e) => e.worldUsed).filter(Boolean) as string[],
    lastUsedMotifs: recent.flatMap((e) => e.motifsUsed),
    affinitySignals: recent.filter((e) => e.founderJudgment === 'LOVE_IT').map((e) => e.name),
  };
}

function loadHistoryFromContext(brandId: string): BrandCampaignHistoryEntry[] {
  const ctx = loadPersistedContext(brandId);
  return ctx?.campaignHistory.recentCampaigns ?? [];
}

export function recordBrandCampaignHistory(entry: BrandCampaignHistoryEntry): void {
  const key = normalizeBrandId(entry.campaignId.split(':')[0] ?? entry.campaignId);
  const brandKey = key.includes('-') ? key : normalizeBrandId(entry.campaignId);
  const actualKey = entry.campaignId.includes(':') ? entry.campaignId.split(':')[0]! : brandKey;

  const list = historyByBrand.get(actualKey) ?? [];
  list.push(entry);
  historyByBrand.set(actualKey, list);

  const ctx = loadPersistedContext(actualKey);
  if (ctx) {
    ctx.campaignHistory = getBrandCampaignHistorySummary(actualKey);
    persistAssembledContext(ctx);
  }

  persistHistoryLocal(actualKey, list);
}

function persistHistoryLocal(brandId: string, entries: BrandCampaignHistoryEntry[]): void {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(`site00-brand-campaign-history:${brandId}`, JSON.stringify(entries));
    } catch {
      /* ignore */
    }
  }
}

export function loadBrandCampaignHistoryFromStorage(brandId: string): BrandCampaignHistoryEntry[] {
  const key = normalizeBrandId(brandId);
  if (historyByBrand.has(key)) return historyByBrand.get(key)!;
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(`site00-brand-campaign-history:${key}`);
      if (raw) {
        const parsed = JSON.parse(raw) as BrandCampaignHistoryEntry[];
        historyByBrand.set(key, parsed);
        return parsed;
      }
    } catch {
      /* ignore */
    }
  }
  return [];
}

export function clearBrandCampaignHistoryForTest(): void {
  historyByBrand.clear();
}
