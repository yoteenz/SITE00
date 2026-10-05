import { P0_VR_TWIN_V30R7MF3P3_LINEAGE } from '../constants.js';

export const FOUNDER_MANUAL_PROMOTION_SOURCE = 'FOUNDER_MANUAL_PROMOTION' as const;
export const LOCKED_MOBILE_STRATEGY_STATUS = 'LOCKED_MOBILE_STRATEGY' as const;
export const HISTORICAL_PROVIDER_BENCHMARK = 'HISTORICAL_PROVIDER_BENCHMARK' as const;

export type FounderTwinProviderPromotionReceipt = {
  id: string;
  projectId: string;
  workspaceType: 'DESIGN_PAGE_V3';
  viewport: 'MOBILE';
  sourceSprint: typeof P0_VR_TWIN_V30R7MF3P3_LINEAGE;
  sourceBenchmarkId: string | null;
  selectedStrategy: 'NBP_FULL_PAIR';
  actualProvider: 'FAL';
  actualModel: string;
  blueprintProvider: 'FAL';
  blueprintModel: string;
  selectionMethod: 'FOUNDER_MANUAL_PROMOTION';
  reason: 'FOUNDER_VISUAL_JUDGMENT';
  benchmarkSupersededForRouting: true;
  createdAt: string;
  status: 'ACTIVE';
};

export type MobileTwinProviderLock = {
  viewport: 'MOBILE';
  actualProvider: 'FAL';
  actualModel: string;
  blueprintProvider: 'FAL';
  blueprintModel: string;
  locked: true;
  source: typeof FOUNDER_MANUAL_PROMOTION_SOURCE;
  promotionReceiptId: string;
  lockedAt: string;
};

export type MobileTwinVisualProviderStrategyResolved = {
  viewport: 'MOBILE';
  method: 'ATOMIC_SIBLING_FROM_COMPOSITION';
  strategy: 'NBP_FULL_PAIR';
  actual: { provider: 'FAL'; model: string };
  blueprint: { provider: 'FAL'; model: string };
  source: typeof FOUNDER_MANUAL_PROMOTION_SOURCE | 'LOCKED_MOBILE_STRATEGY';
  locked: boolean;
  useNbpPageOnlyActualPrompt: boolean;
  useLightTechnicalBlueprint?: boolean;
};
