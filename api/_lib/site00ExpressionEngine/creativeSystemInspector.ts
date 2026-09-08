/**
 * C1.9 — Creative system inspector (provider, stores, dispatch counts, sync status).
 */

import { checkCreativeReasoningProviderHealth } from './seniorCreativeJudgment/creativeReasoningProvider.js';
import { getCampaignCopyStoreMode } from './campaignCopy/campaignCopyStore.js';
import { getCreativeIntelligenceStoreModeSync } from './seniorCreativeJudgment/creativeIntelligenceStore.js';
import {
  getBrandLanguageStoreMode,
  getCurrentVersionLabel,
  getVoiceConfidenceHistory,
  brandLanguageSchemaExists,
} from './brandLanguage/brandLanguageSupabaseStore.js';
import { campaignCopySchemaExists } from './campaignCopy/campaignCopySupabaseStore.js';
import { creativeIntelligenceSchemaExists } from './seniorCreativeJudgment/creativeIntelligenceSupabaseStore.js';

export type CreativeSystemInspectorSnapshot = {
  providerName: string;
  model: string;
  runtimeMode: string;
  providerAvailable: boolean;
  authConfigured: boolean;
  structuredOutputSupported: boolean;
  reasoningDispatchAllowed: boolean;
  lastHealthCheck: string;
  failureReason?: string;
  creativeReasoningDispatchCount: number;
  copyReasoningDispatchCount: number;
  totalReasoningDispatchCount: number;
  textReasoningDispatchCount: number;
  imageProviderDispatchCount: number;
  videoProviderDispatchCount: number;
  falDispatchCount: number;
  copyStoreMode: 'MEMORY' | 'SUPABASE';
  creativeIntelligenceStoreMode: 'MEMORY' | 'SUPABASE';
  brandLanguageStoreMode: 'MEMORY' | 'SUPABASE';
  brandLanguageIdentityVersion?: string;
  voiceConfidence?: string;
  voiceConfidenceHistoryCount?: number;
  correctionsApplied?: number;
  supabaseSync: {
    campaignCopySchema: boolean;
    creativeIntelligenceSchema: boolean;
    brandLanguageSchema: boolean;
    allSchemasReady: boolean;
  };
  tokenUsage?: { inputTokens?: number; outputTokens?: number };
  estimatedCost?: number;
};

export async function buildCreativeSystemInspector(args?: {
  brandId?: string;
  creativeReasoningDispatchCount?: number;
  copyReasoningDispatchCount?: number;
  correctionsApplied?: number;
  tokenUsage?: { inputTokens?: number; outputTokens?: number };
  estimatedCost?: number;
}): Promise<CreativeSystemInspectorSnapshot> {
  const health = await checkCreativeReasoningProviderHealth();
  const creativeDispatch = args?.creativeReasoningDispatchCount ?? 0;
  const copyDispatch = args?.copyReasoningDispatchCount ?? 0;

  const [copySchema, ciSchema, blSchema] = await Promise.all([
    campaignCopySchemaExists(),
    creativeIntelligenceSchemaExists(),
    brandLanguageSchemaExists(),
  ]);

  const brandId = args?.brandId;
  const history = brandId ? getVoiceConfidenceHistory(brandId) : [];

  return {
    providerName: health.providerName,
    model: health.model,
    runtimeMode: health.runtimeMode,
    providerAvailable: health.providerAvailable,
    authConfigured: Boolean(process.env.ANTHROPIC_API_KEY?.trim()),
    structuredOutputSupported: health.structuredOutputSupported,
    reasoningDispatchAllowed: health.reasoningDispatchAllowed,
    lastHealthCheck: health.lastHealthCheck,
    failureReason: health.blockReason,
    creativeReasoningDispatchCount: creativeDispatch,
    copyReasoningDispatchCount: copyDispatch,
    totalReasoningDispatchCount: creativeDispatch + copyDispatch,
    textReasoningDispatchCount: creativeDispatch + copyDispatch,
    imageProviderDispatchCount: 0,
    videoProviderDispatchCount: 0,
    falDispatchCount: 0,
    copyStoreMode: getCampaignCopyStoreMode(),
    creativeIntelligenceStoreMode: getCreativeIntelligenceStoreModeSync(),
    brandLanguageStoreMode: getBrandLanguageStoreMode(),
    brandLanguageIdentityVersion: brandId ? getCurrentVersionLabel(brandId) : undefined,
    voiceConfidence: history[history.length - 1]?.voiceConfidence,
    voiceConfidenceHistoryCount: history.length,
    correctionsApplied: args?.correctionsApplied ?? 0,
    supabaseSync: {
      campaignCopySchema: copySchema,
      creativeIntelligenceSchema: ciSchema,
      brandLanguageSchema: blSchema,
      allSchemasReady: copySchema && ciSchema && blSchema,
    },
    tokenUsage: args?.tokenUsage,
    estimatedCost: args?.estimatedCost,
  };
}
