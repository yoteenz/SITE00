/**
 * C1.9 — Durable Supabase persistence for BrandLanguageIdentity, evidence, signatures, founder actions.
 */

import type {
  BrandLanguageIdentity,
  BrandLanguageEvidence,
  BrandRhetoricalSignature,
  BrandVoiceConfidence,
} from '../../../shared/site00-expression-engine/brand-language/types.js';
import { getSupabaseAdmin, hasSupabaseServiceRole } from '../../supabase.js';
import type { FounderCopyAction } from '../campaignCopy/founderCopyActions.js';

export type BrandLanguageLearningSignal =
  | 'APPROVED_IN_VOICE'
  | 'FOUNDER_EDITED_IN_VOICE'
  | 'REJECTED_OUT_OF_VOICE'
  | 'CAMPAIGN_ONLY'
  | 'TASTE_ONLY';

export type BrandLanguageLearningScope =
  | 'GLOBAL_METHOD'
  | 'BRAND_METHOD'
  | 'CAMPAIGN_METHOD'
  | 'MEDIUM_METHOD'
  | 'PROJECT_TASTE'
  | 'CAMPAIGN_TASTE';

export type VoiceConfidenceHistoryEntry = {
  voiceConfidence: BrandVoiceConfidence;
  reason: string;
  evidenceCount: number;
  approvedExampleCount: number;
  rejectedExampleCount: number;
  updatedAt: string;
};

export type BrandLanguageStoreMode = 'MEMORY' | 'SUPABASE';

const identityCache = new Map<string, BrandLanguageIdentity>();
const evidenceCache: BrandLanguageEvidence[] = [];
const signatureCache = new Map<string, BrandRhetoricalSignature>();
const confidenceHistoryCache = new Map<string, VoiceConfidenceHistoryEntry[]>();
const versionCounters = new Map<string, number>();

let storeMode: BrandLanguageStoreMode = 'MEMORY';

export async function brandLanguageSchemaExists(): Promise<boolean> {
  if (!hasSupabaseServiceRole()) return false;
  try {
    const { error } = await getSupabaseAdmin()
      .from('site00_brand_language_identities')
      .select('id')
      .limit(1);
    return !error;
  } catch {
    return false;
  }
}

export async function initBrandLanguageStore(): Promise<BrandLanguageStoreMode> {
  if (process.env.VITEST === 'true') {
    storeMode = 'MEMORY';
    return storeMode;
  }
  if (hasSupabaseServiceRole() && (await brandLanguageSchemaExists())) {
    storeMode = 'SUPABASE';
  } else {
    storeMode = 'MEMORY';
  }
  return storeMode;
}

export function getBrandLanguageStoreMode(): BrandLanguageStoreMode {
  return storeMode;
}

export function resetBrandLanguageStore(): void {
  identityCache.clear();
  evidenceCache.length = 0;
  signatureCache.clear();
  confidenceHistoryCache.clear();
  versionCounters.clear();
  storeMode = 'MEMORY';
}

function nextVersionLabel(brandId: string): string {
  const current = versionCounters.get(brandId) ?? 0;
  const next = current + 1;
  versionCounters.set(brandId, next);
  return `V${String(next).padStart(3, '0')}`;
}

export function getCurrentVersionLabel(brandId: string): string {
  const n = versionCounters.get(brandId) ?? 1;
  return `V${String(n).padStart(3, '0')}`;
}

function buildConfidenceHistory(
  identity: BrandLanguageIdentity,
  reason: string,
): VoiceConfidenceHistoryEntry[] {
  const approved = identity.sourceLineage.filter((e) => e.approved);
  const rejected = identity.sourceLineage.filter((e) => !e.approved);
  const prior = confidenceHistoryCache.get(identity.brandId) ?? [];
  const entry: VoiceConfidenceHistoryEntry = {
    voiceConfidence: identity.confidence,
    reason,
    evidenceCount: identity.sourceLineage.length,
    approvedExampleCount: approved.length + identity.examplesOfInVoiceLanguage.length,
    rejectedExampleCount: rejected.length + identity.examplesOfOutOfVoiceLanguage.length,
    updatedAt: new Date().toISOString(),
  };
  const history = [...prior, entry].slice(-20);
  confidenceHistoryCache.set(identity.brandId, history);
  return history;
}

export async function loadBrandLanguageIdentity(brandId: string): Promise<BrandLanguageIdentity | null> {
  const cached = identityCache.get(brandId);
  if (cached) return cached;

  if (storeMode === 'SUPABASE') {
    const { data, error } = await getSupabaseAdmin()
      .from('site00_brand_language_identities')
      .select('identity_json, version_label, confidence')
      .eq('brand_id', brandId)
      .eq('is_current', true)
      .maybeSingle();
    if (!error && data?.identity_json) {
      const identity = data.identity_json as BrandLanguageIdentity;
      identityCache.set(brandId, identity);
      const match = String(data.version_label).match(/V(\d+)/);
      if (match) versionCounters.set(brandId, parseInt(match[1]!, 10));
      return identity;
    }
  }
  return null;
}

export async function persistBrandLanguageIdentity(
  identity: BrandLanguageIdentity,
  reason = 'identity_persist',
  bumpVersion = false,
): Promise<{ versionLabel: string; storeMode: BrandLanguageStoreMode }> {
  const versionLabel = bumpVersion ? nextVersionLabel(identity.brandId) : getCurrentVersionLabel(identity.brandId);
  if (!versionCounters.has(identity.brandId)) versionCounters.set(identity.brandId, 1);

  const history = buildConfidenceHistory(identity, reason);
  identityCache.set(identity.brandId, identity);

  if (storeMode === 'SUPABASE') {
    const identityKey = `${identity.brandId}:${versionLabel}`;
    await getSupabaseAdmin()
      .from('site00_brand_language_identities')
      .update({ is_current: false })
      .eq('brand_id', identity.brandId)
      .eq('is_current', true);

    await getSupabaseAdmin().from('site00_brand_language_identities').upsert(
      {
        brand_id: identity.brandId,
        brand_name: identity.brandName,
        identity_key: identityKey,
        version_label: versionLabel,
        is_current: true,
        confidence: identity.confidence,
        identity_json: identity,
        voice_confidence_history: history,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'identity_key' },
    );
  }

  return { versionLabel, storeMode };
}

export async function persistBrandLanguageEvidence(args: {
  brandId: string;
  sourceType: string;
  sourceId?: string;
  textSample: string;
  approved: boolean;
  weight?: number;
  scope?: BrandLanguageLearningScope;
  campaignId?: string;
  learningSignal?: BrandLanguageLearningSignal;
}): Promise<void> {
  const evidence: BrandLanguageEvidence = {
    sourceType: args.sourceType as BrandLanguageEvidence['sourceType'],
    sourceId: args.sourceId ?? `ev-${Date.now()}`,
    textSample: args.textSample,
    approved: args.approved,
    weight: args.weight ?? 1,
    recency: new Date().toISOString(),
    campaignScope: args.scope === 'CAMPAIGN_METHOD' || args.scope === 'CAMPAIGN_TASTE',
    brandScope: args.scope === 'BRAND_METHOD' || args.scope === 'GLOBAL_METHOD' || !args.scope,
  };
  evidenceCache.push(evidence);

  if (storeMode === 'SUPABASE') {
    const evidenceId = `${args.brandId}:${evidence.sourceId}`;
    await getSupabaseAdmin().from('site00_brand_language_evidence').upsert(
      {
        evidence_id: evidenceId,
        brand_id: args.brandId,
        source_type: args.sourceType,
        source_id: args.sourceId ?? null,
        text_sample: args.textSample,
        approved: args.approved,
        weight: args.weight ?? 1,
        recency: new Date().toISOString(),
        scope: args.scope ?? 'BRAND_METHOD',
        campaign_id: args.campaignId ?? null,
        learning_signal: args.learningSignal ?? (args.approved ? 'APPROVED_IN_VOICE' : 'REJECTED_OUT_OF_VOICE'),
      },
      { onConflict: 'evidence_id' },
    );
  }
}

export async function persistRhetoricalSignature(
  brandId: string,
  signature: BrandRhetoricalSignature,
  versionLabel?: string,
): Promise<void> {
  signatureCache.set(brandId, signature);
  const label = versionLabel ?? getCurrentVersionLabel(brandId);

  if (storeMode === 'SUPABASE') {
    const signatureKey = `${brandId}:${label}`;
    await getSupabaseAdmin().from('site00_brand_rhetorical_signatures').upsert(
      {
        brand_id: brandId,
        signature_key: signatureKey,
        version_label: label,
        sentence_behavior: signature.description,
        rhetorical_patterns: signature.lushSensory ? ['lushSensory'] : [],
        preferred_structures: signature.softConversational ? ['softConversational'] : ['spatialMetaphor'],
        avoided_structures: signature.directImperatives ? [] : ['hardSell'],
        humor_behavior: signature.dryUnderstatement ? 'dry' : 'none',
        cta_behavior: signature.directImperatives ? 'direct' : 'soft',
        punctuation_behavior: 'minimal',
        confidence: 'MODERATE',
        record: signature as unknown as Record<string, unknown>,
      },
      { onConflict: 'signature_key' },
    );
  }
}

export async function persistFounderCopyActionRecord(args: {
  copyPackageId: string;
  contentUnitId: string;
  action: FounderCopyAction;
  versionLabel?: string;
  caption?: string;
  projectId?: string;
  scope?: BrandLanguageLearningScope;
  record?: Record<string, unknown>;
}): Promise<void> {
  const actionKey = `${args.copyPackageId}:${args.contentUnitId}:${args.action}:${Date.now()}`;

  if (storeMode === 'SUPABASE') {
    await getSupabaseAdmin().from('site00_founder_copy_actions').upsert(
      {
        action_key: actionKey,
        copy_package_id: args.copyPackageId,
        content_unit_id: args.contentUnitId,
        action: args.action,
        version_label: args.versionLabel ?? null,
        caption: args.caption ?? null,
        project_id: args.projectId ?? null,
        scope: args.scope ?? null,
        record: args.record ?? {},
      },
      { onConflict: 'action_key' },
    );
  }
}

export function listBrandLanguageEvidence(brandId: string): BrandLanguageEvidence[] {
  return evidenceCache.filter((e) => e.sourceId.startsWith(brandId) || e.sourceId.includes(brandId));
}

export function getVoiceConfidenceHistory(brandId: string): VoiceConfidenceHistoryEntry[] {
  return confidenceHistoryCache.get(brandId) ?? [];
}

export function getRhetoricalSignatureCached(brandId: string): BrandRhetoricalSignature | undefined {
  return signatureCache.get(brandId);
}

export async function applyApprovedInVoiceLearning(
  identity: BrandLanguageIdentity,
  approvedCaption: string,
  learningSignal: BrandLanguageLearningSignal = 'APPROVED_IN_VOICE',
): Promise<BrandLanguageIdentity> {
  const updated: BrandLanguageIdentity = {
    ...identity,
    examplesOfInVoiceLanguage: [...identity.examplesOfInVoiceLanguage, approvedCaption].slice(-8),
    confidence:
      identity.confidence === 'LOW'
        ? 'MODERATE'
        : identity.confidence === 'MODERATE' && identity.examplesOfInVoiceLanguage.length >= 4
          ? 'HIGH'
          : identity.confidence,
    sourceLineage: [
      ...identity.sourceLineage,
      {
        sourceType: 'APPROVED_COPY',
        sourceId: `approved-${Date.now()}`,
        textSample: approvedCaption,
        approved: true,
        weight: learningSignal === 'FOUNDER_EDITED_IN_VOICE' ? 2 : 1,
        recency: new Date().toISOString(),
        campaignScope: learningSignal === 'CAMPAIGN_ONLY' || learningSignal === 'TASTE_ONLY',
        brandScope: learningSignal !== 'CAMPAIGN_ONLY' && learningSignal !== 'TASTE_ONLY',
      },
    ],
  };

  await persistBrandLanguageEvidence({
    brandId: identity.brandId,
    sourceType: 'APPROVED_COPY',
    textSample: approvedCaption,
    approved: true,
    weight: 2,
    scope: learningSignal === 'TASTE_ONLY' ? 'PROJECT_TASTE' : 'BRAND_METHOD',
    learningSignal,
  });

  await persistBrandLanguageIdentity(updated, 'approved_in_voice_learning', true);
  await persistRhetoricalSignature(identity.brandId, updated.rhetoricalSignature);
  return updated;
}

export async function rejectOutOfVoiceDraft(
  brandId: string,
  draftText: string,
  campaignId?: string,
): Promise<void> {
  await persistBrandLanguageEvidence({
    brandId,
    sourceType: 'SOCIAL_COPY',
    textSample: draftText,
    approved: false,
    weight: 1,
    scope: 'CAMPAIGN_TASTE',
    campaignId,
    learningSignal: 'REJECTED_OUT_OF_VOICE',
  });
}
