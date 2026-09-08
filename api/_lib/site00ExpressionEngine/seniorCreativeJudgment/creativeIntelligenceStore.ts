/**
 * C1.5 — Creative correction + senior judgment durable store (memory + Supabase-ready).
 */

import type { CreativeCorrectionRecord } from '../../../shared/site00-expression-engine/senior-creative-judgment/types.js';
import type { CreativeRuntimeMode } from './creativeReasoningProvider.js';
import type { SeniorCreativeJudgmentOutput } from '../../../shared/site00-expression-engine/senior-creative-judgment/types.js';
import {
  abstractFounderCorrection,
  listCreativeCorrectionPrinciples,
  resetCreativeCorrectionStore,
} from './creativeCorrectionIntelligence.js';

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

export function resetCreativeIntelligenceStore(): void {
  judgments.length = 0;
  persistedCorrections.length = 0;
  resetCreativeCorrectionStore();
  persistedCorrections.push(...listCreativeCorrectionPrinciples());
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
}

export function listPersistedJudgments(): PersistedJudgment[] {
  return [...judgments];
}

export async function persistCreativeCorrection(record: CreativeCorrectionRecord): Promise<void> {
  persistedCorrections.push(record);
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
}): CreativeCorrectionRecord {
  const record = abstractFounderCorrection(args);
  persistedCorrections.push(record);
  return record;
}

resetCreativeIntelligenceStore();
