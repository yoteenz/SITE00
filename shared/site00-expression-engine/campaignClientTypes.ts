/**
 * Expression Engine — lightweight client types for campaign UI fetches.
 */

import type {
  Entry002ProductionBlueprint,
  EntryReadinessResult,
  FounderJudgmentReadiness,
  TikTokTranslationPlan,
  XThreadExpression,
} from './types.js';

export type ExpressionEngineB1Phase1Response = {
  engine: string;
  sprint: 'B1_PHASE_1';
  entry001: {
    id: string;
    title: string;
    status: string;
    tiktokPlan: TikTokTranslationPlan;
    xExpression: XThreadExpression;
    founderJudgmentReadiness: FounderJudgmentReadiness[];
  };
  entry002: {
    id: string;
    title: string;
    status: string;
    territoryBrief: {
      status: string;
      assetsGenerated: number;
      candidates: Array<{ name: string; territoryId: string }>;
    };
    assetsGenerated: number;
  };
  readiness001: EntryReadinessResult;
};

export type ExpressionEngineB1Phase2Response = {
  engine: string;
  sprint: 'B1_PHASE_2';
  entry002: {
    id: string;
    title: string;
    status: string;
    territoryId: string | null;
    worldExpressionId: string | null;
    assetsGenerated: number;
  };
  blueprint: Entry002ProductionBlueprint;
  readiness002: EntryReadinessResult;
};
