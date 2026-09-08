/**
 * C1.9 — Generic brief-driven multi-unit campaign architect (non-Verdant, non-fixture brands).
 */

import type { ThinMultiUnitBrief } from './blindMultiUnitFixtures.js';
import { buildCampaignResponsibilityFromBrief } from './blindMultiUnitFixtures.js';
import {
  runMultiUnitBlindCampaignPackage,
  type MultiUnitBlindCampaignOutput,
} from './multiUnitCampaignArchitect.js';
import {
  MERIDIAN_ATELIER_LAUNCH_BRIEF,
  deriveMeridianBrandLanguageIdentity,
} from '../brandLanguage/c19BlindBrandFixture.js';
import {
  initBrandLanguageStore,
  persistBrandLanguageIdentity,
  loadBrandLanguageIdentity,
} from '../brandLanguage/brandLanguageSupabaseStore.js';
import { initCampaignCopyStore, persistCampaignCopyPackage } from '../campaignCopy/campaignCopyStore.js';
import { initCreativeIntelligenceStore } from './creativeIntelligenceStore.js';

export function deriveGenericTerritories(brief: ThinMultiUnitBrief): string[] {
  return [
    `${brief.brandName}: ${brief.brandTruth.slice(0, 80)} — territory A`,
    `Audience tension — ${brief.targetAudience.slice(0, 60)} meets ${brief.productOrService.slice(0, 50)}`,
    `${brief.launchContext}: permission to shift from ${brief.campaignObjective.slice(0, 70)}`,
  ];
}

export function buildGenericCampaignResponsibility(brief: ThinMultiUnitBrief) {
  const base = buildCampaignResponsibilityFromBrief(brief);
  return {
    ...base,
    campaignThesis: `${brief.brandName} must prove ${brief.brandTruth.slice(0, 100)} without generic category language.`,
    audienceStartingBelief: `${brief.targetAudience.split(',')[0]?.trim() ?? brief.targetAudience} — skepticism about ${brief.productOrService.slice(0, 60)}`,
    audienceDesiredShift: brief.campaignObjective,
    creativeRisk: brief.founderCreativeAppetite,
  };
}

export async function runC19BlindCampaignPackage(
  brief: ThinMultiUnitBrief = MERIDIAN_ATELIER_LAUNCH_BRIEF,
  options?: { forceRuntimeMode?: 'DETERMINISTIC_FALLBACK' | 'FULL_REASONING' },
): Promise<MultiUnitBlindCampaignOutput & { brandLanguageIdentityVersion: string; brandLanguageStoreMode: string }> {
  await initBrandLanguageStore();
  await initCampaignCopyStore();
  await initCreativeIntelligenceStore();

  let identity = (await loadBrandLanguageIdentity(brief.projectId)) ?? deriveMeridianBrandLanguageIdentity();
  const persisted = await persistBrandLanguageIdentity(identity, 'c19_campaign_bootstrap');
  identity = (await loadBrandLanguageIdentity(brief.projectId)) ?? identity;

  if (options?.forceRuntimeMode === 'DETERMINISTIC_FALLBACK') {
    process.env.SITE00_CREATIVE_REASONING_FORCE_FALLBACK = '1';
  } else if (options?.forceRuntimeMode === 'FULL_REASONING') {
    delete process.env.SITE00_CREATIVE_REASONING_FORCE_FALLBACK;
  }

  const result = await runMultiUnitBlindCampaignPackage(brief);

  if (options?.forceRuntimeMode === 'DETERMINISTIC_FALLBACK') {
    delete process.env.SITE00_CREATIVE_REASONING_FORCE_FALLBACK;
  }

  if (result.copyPackage) {
    await persistCampaignCopyPackage(result.copyPackage, brief.projectId);
  }

  return {
    ...result,
    initialTerritories: deriveGenericTerritories(brief),
    campaignResponsibility: buildGenericCampaignResponsibility(brief),
    brandLanguageIdentityVersion: persisted.versionLabel,
    brandLanguageStoreMode: persisted.storeMode,
  };
}

export { MERIDIAN_ATELIER_LAUNCH_BRIEF };
