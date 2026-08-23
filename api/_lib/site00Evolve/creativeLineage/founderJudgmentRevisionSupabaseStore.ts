/**
 * Supabase persistence for founder judgments + revision specs.
 */

import { getSupabaseAdmin } from '../../supabase.js';
import type {
  BrandAssetDispositionRecord,
  FounderCreativeJudgment,
} from '../../../../shared/site00-brand-lore/creativeLineage/founderCreativeJudgmentTypes.js';
import type {
  CreativeRevisionSpec,
  FounderCreativePreferenceEvidence,
  RevisionBranch,
} from '../../../../shared/site00-brand-lore/creativeLineage/revisionTypes.js';
import { NDXBOOK_ORG_ID } from '../creativeDirection/creativeIntelligence/founderComparisonSet.js';

const JUDGMENTS = 'site00_founder_creative_judgments';
const DISPOSITIONS = 'site00_brand_asset_dispositions';
const REVISIONS = 'site00_creative_revision_specs';
const BRANCHES = 'site00_creative_revision_branches';
const EVIDENCE = 'site00_founder_preference_evidence';

export async function revisionJudgmentTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(JUDGMENTS).select('id').limit(1);
  return !error;
}

export async function upsertFounderCreativeJudgment(record: FounderCreativeJudgment): Promise<FounderCreativeJudgment> {
  const row = {
    judgment_id: record.judgmentId,
    organization_id: NDXBOOK_ORG_ID,
    asset_id: record.assetId,
    brand_slug: record.brandSlug,
    founder_action: record.founderAction,
    record,
    updated_at: record.updatedAt,
  };
  const { error } = await getSupabaseAdmin().from(JUDGMENTS).upsert(row, { onConflict: 'judgment_id' });
  if (error) throw new Error(error.message);
  return record;
}

export async function getFounderCreativeJudgment(
  brandSlug: string,
  assetId: string,
): Promise<FounderCreativeJudgment | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(JUDGMENTS)
    .select('record')
    .eq('brand_slug', brandSlug)
    .eq('asset_id', assetId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data.record as FounderCreativeJudgment;
}

export async function listFounderCreativeJudgments(brandSlug: string): Promise<FounderCreativeJudgment[]> {
  const { data, error } = await getSupabaseAdmin().from(JUDGMENTS).select('record').eq('brand_slug', brandSlug);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.record as FounderCreativeJudgment);
}

export async function upsertBrandAssetDisposition(
  record: BrandAssetDispositionRecord,
): Promise<BrandAssetDispositionRecord> {
  const row = {
    disposition_id: record.dispositionId,
    organization_id: NDXBOOK_ORG_ID,
    asset_id: record.assetId,
    brand_slug: record.brandSlug,
    brand_disposition: record.brandDisposition,
    record,
    updated_at: record.updatedAt,
  };
  const { error } = await getSupabaseAdmin().from(DISPOSITIONS).upsert(row, { onConflict: 'disposition_id' });
  if (error) throw new Error(error.message);
  return record;
}

export async function getBrandAssetDisposition(
  brandSlug: string,
  assetId: string,
): Promise<BrandAssetDispositionRecord | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(DISPOSITIONS)
    .select('record')
    .eq('brand_slug', brandSlug)
    .eq('asset_id', assetId)
    .maybeSingle();
  if (error || !data) return null;
  return data.record as BrandAssetDispositionRecord;
}

export async function upsertCreativeRevisionSpec(record: CreativeRevisionSpec): Promise<CreativeRevisionSpec> {
  const row = {
    revision_id: record.revisionId,
    organization_id: NDXBOOK_ORG_ID,
    parent_asset_id: record.parentAssetId,
    brand_slug: record.brandSlug,
    status: record.status,
    record,
    updated_at: record.updatedAt,
  };
  const { error } = await getSupabaseAdmin().from(REVISIONS).upsert(row, { onConflict: 'revision_id' });
  if (error) throw new Error(error.message);
  return record;
}

export async function getCreativeRevisionSpec(revisionId: string): Promise<CreativeRevisionSpec | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(REVISIONS)
    .select('record')
    .eq('revision_id', revisionId)
    .maybeSingle();
  if (error || !data) return null;
  return data.record as CreativeRevisionSpec;
}

export async function listCreativeRevisionSpecs(params: {
  brandSlug: string;
  parentAssetId?: string;
  rootAssetId?: string;
}): Promise<CreativeRevisionSpec[]> {
  let q = getSupabaseAdmin().from(REVISIONS).select('record').eq('brand_slug', params.brandSlug);
  if (params.parentAssetId) q = q.eq('parent_asset_id', params.parentAssetId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  let specs = (data ?? []).map((r) => r.record as CreativeRevisionSpec);
  if (params.rootAssetId) specs = specs.filter((s) => s.rootAssetId === params.rootAssetId);
  return specs;
}

export async function upsertRevisionBranch(record: RevisionBranch): Promise<RevisionBranch> {
  const row = {
    branch_id: record.branchId,
    organization_id: NDXBOOK_ORG_ID,
    root_asset_id: record.rootAssetId,
    brand_slug: record.brandSlug,
    record,
    updated_at: record.updatedAt,
  };
  const { error } = await getSupabaseAdmin().from(BRANCHES).upsert(row, { onConflict: 'branch_id' });
  if (error) throw new Error(error.message);
  return record;
}

export async function upsertPreferenceEvidence(
  record: FounderCreativePreferenceEvidence,
): Promise<FounderCreativePreferenceEvidence> {
  const row = {
    evidence_id: record.evidenceId,
    organization_id: NDXBOOK_ORG_ID,
    brand_slug: record.brandSlug,
    record,
    updated_at: record.lastObservedAt,
  };
  const { error } = await getSupabaseAdmin().from(EVIDENCE).upsert(row, { onConflict: 'evidence_id' });
  if (error) throw new Error(error.message);
  return record;
}

export async function listPreferenceEvidence(brandSlug: string): Promise<FounderCreativePreferenceEvidence[]> {
  const { data, error } = await getSupabaseAdmin().from(EVIDENCE).select('record').eq('brand_slug', brandSlug);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.record as FounderCreativePreferenceEvidence);
}
