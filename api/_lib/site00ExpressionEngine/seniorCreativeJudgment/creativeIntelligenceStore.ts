/**
 * C1.6 — Creative correction + senior judgment durable store (memory + Supabase).
 */

import type { CreativeCorrectionRecord } from '../../../shared/site00-expression-engine/senior-creative-judgment/types.js';
import type { CorrectionScope } from '../../../shared/site00-expression-engine/package-creative-judgment/types.js';
import type { CreativeRuntimeMode } from './creativeReasoningProvider.js';
import type { SeniorCreativeJudgmentOutput } from '../../../shared/site00-expression-engine/senior-creative-judgment/types.js';
import {
  abstractFounderCorrection,
  listCreativeCorrectionPrinciples,
  resetCreativeCorrectionStore,
} from './creativeCorrectionIntelligence.js';
import { hasSupabaseServiceRole } from '../../supabase.js';
import {
  creativeIntelligenceSchemaExists,
  upsertCreativeCorrectionToSupabase,
  upsertSeniorJudgmentToSupabase,
} from './creativeIntelligenceSupabaseStore.js';

export type CreativeIntelligenceStoreMode = 'MEMORY' | 'SUPABASE';

type PersistedJudgment = {
  judgmentId: string;
  projectId: string;
  campaignId: string;
  contentUnitId: string;
  initialWinner: string;
  finalWinner: string;
  qualityTier: string;
  founderHandholdingRisk: string;
  runtimeMode: CreativeRuntimeMode;
  record: SeniorCreativeJudgmentOutput;
  createdAt: string;
};

const judgments: PersistedJudgment[] = [];
const persistedCorrections: CreativeCorrectionRecord[] = [];
let storeMode: CreativeIntelligenceStoreMode = 'MEMORY';

export async function resolveCreativeIntelligenceStoreMode(): Promise<CreativeIntelligenceStoreMode> {
  if (process.env.VITEST === 'true') return 'MEMORY';
  if (!hasSupabaseServiceRole()) return 'MEMORY';
  const exists = await creativeIntelligenceSchemaExists();
  return exists ? 'SUPABASE' : 'MEMORY';
}

export function getCreativeIntelligenceStoreModeSync(): CreativeIntelligenceStoreMode {
  return storeMode;
}

export function resetCreativeIntelligenceStore(): void {
  judgments.length = 0;
  persistedCorrections.length = 0;
  storeMode = 'MEMORY';
  resetCreativeCorrectionStore();
  persistedCorrections.push(...listCreativeCorrectionPrinciples());
}

export async function initCreativeIntelligenceStore(): Promise<CreativeIntelligenceStoreMode> {
  storeMode = await resolveCreativeIntelligenceStoreMode();
  return storeMode;
}

export async function persistSeniorCreativeJudgment(args: {
  judgmentId: string;
  projectId: string;
  campaignId: string;
  contentUnitId: string;
  initialWinner: string;
  finalWinner: string;
  qualityTier: string;
  founderHandholdingRisk: string;
  runtimeMode: CreativeRuntimeMode;
  record: SeniorCreativeJudgmentOutput;
}): Promise<void> {
  judgments.push({
    ...args,
    createdAt: new Date().toISOString(),
  });
  if (storeMode === 'SUPABASE') {
    await upsertSeniorJudgmentToSupabase({
      ...args,
      reasoningDepthLimited: args.runtimeMode !== 'FULL_REASONING',
    });
  }
}

export function listPersistedJudgments(): PersistedJudgment[] {
  return [...judgments];
}

export async function persistCreativeCorrection(record: CreativeCorrectionRecord): Promise<void> {
  persistedCorrections.push(record);
  if (storeMode === 'SUPABASE') {
    await upsertCreativeCorrectionToSupabase(record);
  }
}

export function listPersistedCorrections(): CreativeCorrectionRecord[] {
  return [...persistedCorrections];
}

export function retrieveApplicableCorrectionPrinciples(args: {
  medium: string;
  campaignType: string;
  domains: string[];
}): CreativeCorrectionRecord[] {
  return persistedCorrections.filter((c) => {
    const scope = (c as CreativeCorrectionRecord & { scope?: CorrectionScope }).scope;
    if (scope === 'PROJECT_TASTE' || scope === 'CAMPAIGN_TASTE') return false;
    const domainMatch = c.applicableDomains.some((d) =>
      args.domains.some((ad) => d.toLowerCase().includes(ad.split(' ')[0]!.toLowerCase())),
    );
    const mediumMatch =
      c.applicableDomains.some((d) => d.toLowerCase().includes(args.medium.toLowerCase())) ||
      c.applicableDomains.includes('generic');
    return domainMatch || mediumMatch;
  });
}

export function seedCorrectionFromFounderFeedback(args: {
  surfaceFeedback: string;
  taxonomy: import('../../../shared/site00-expression-engine/senior-creative-judgment/types.js').CorrectionTaxonomyClass;
  scope?: CorrectionScope;
}): CreativeCorrectionRecord {
  const record = abstractFounderCorrection(args);
  const withScope = { ...record, scope: args.scope ?? 'GLOBAL_METHOD' } as CreativeCorrectionRecord & {
    scope: CorrectionScope;
  };
  persistedCorrections.push(withScope);
  return withScope;
}

resetCreativeIntelligenceStore();
