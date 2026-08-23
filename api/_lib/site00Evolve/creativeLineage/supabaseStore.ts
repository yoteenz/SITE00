/**
 * Supabase persistence for creative lineage records.
 */

import { getSupabaseAdmin } from '../../supabase.js';
import type {
  BrandCanonState,
  BrandCanonTrait,
  ContentFranchiseRecord,
  CreativeAssetRecord,
  CreativeConceptRecord,
  CreativeFamily,
  EditorialIdeaRecord,
  ForensicAuditReport,
  LaunchSeedSet,
  SalvageReviewProgress,
  WinningWorldPromotionPlan,
} from '../../../../shared/site00-brand-lore/creativeLineage/types.js';
import { NDXBOOK_ORG_ID } from '../creativeDirection/creativeIntelligence/founderComparisonSet.js';

const ASSETS = 'site00_creative_asset_records';
const CONCEPTS = 'site00_creative_concept_records';
const FRANCHISES = 'site00_content_franchise_records';
const IDEAS = 'site00_editorial_idea_records';
const FAMILIES = 'site00_creative_families';
const TRAITS = 'site00_brand_canon_traits';
const CANON = 'site00_brand_canon_state';
const PROMOTION = 'site00_winning_world_promotion_plans';
const SEED = 'site00_launch_seed_sets';

export async function lineageTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(ASSETS).select('id').limit(1);
  return !error;
}

function assetRow(record: CreativeAssetRecord) {
  return {
    asset_id: record.assetId,
    organization_id: record.orgId || NDXBOOK_ORG_ID,
    project_id: record.projectId,
    brand_slug: record.brandSlug,
    asset_type: record.assetType,
    source_type: record.sourceType,
    creative_stage: record.creativeStage,
    direction_id: record.directionLineage.directionId,
    direction_name: record.directionLineage.directionName,
    world_id: record.directionLineage.worldId,
    topic_id: record.contentLineage.topicId,
    content_franchise_id: record.contentLineage.contentFranchiseId,
    carousel_id: record.contentLineage.carouselId,
    production_state: record.productionState,
    reuse_state: record.reuseState,
    canon_status: record.canonStatus,
    review_state: record.reviewState,
    parent_asset_id: record.relationship.parentAssetId,
    creative_family_id: record.creativeFamilyId,
    brand_canon_version_at_generation: record.brandCanonVersionAtGeneration,
    content_canon_version_at_generation: record.contentCanonVersionAtGeneration,
    record,
    updated_at: record.updatedAt,
  };
}

export async function upsertCreativeAsset(record: CreativeAssetRecord): Promise<CreativeAssetRecord> {
  const { error } = await getSupabaseAdmin().from(ASSETS).upsert(assetRow(record), { onConflict: 'asset_id' });
  if (error) throw new Error(error.message);
  return record;
}

export async function listCreativeAssets(brandSlug: string): Promise<CreativeAssetRecord[]> {
  const { data, error } = await getSupabaseAdmin()
    .from(ASSETS)
    .select('record')
    .eq('brand_slug', brandSlug)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.record as CreativeAssetRecord);
}

export async function upsertCreativeConcept(record: CreativeConceptRecord): Promise<CreativeConceptRecord> {
  const row = {
    concept_id: record.conceptId,
    organization_id: record.orgId || NDXBOOK_ORG_ID,
    brand_slug: record.brandSlug,
    origin_direction_id: record.originDirectionId,
    origin_direction_name: record.originDirectionName,
    origin_world_id: record.originWorldId,
    concept_type: record.conceptType,
    reuse_assessment: record.reuseAssessment,
    canon_status: record.canonStatus,
    record,
    updated_at: record.updatedAt,
  };
  const { error } = await getSupabaseAdmin().from(CONCEPTS).upsert(row, { onConflict: 'concept_id' });
  if (error) throw new Error(error.message);
  return record;
}

export async function listCreativeConcepts(brandSlug: string): Promise<CreativeConceptRecord[]> {
  const { data, error } = await getSupabaseAdmin()
    .from(CONCEPTS)
    .select('record')
    .eq('brand_slug', brandSlug);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.record as CreativeConceptRecord);
}

export async function upsertContentFranchise(record: ContentFranchiseRecord): Promise<ContentFranchiseRecord> {
  const row = {
    franchise_id: record.franchiseId,
    organization_id: record.orgId || NDXBOOK_ORG_ID,
    brand_slug: record.brandSlug,
    origin_direction_id: record.originDirectionId,
    origin_world_id: record.originWorldId,
    status: record.status,
    translation_policy: record.translationPolicy,
    record,
    updated_at: record.updatedAt,
  };
  const { error } = await getSupabaseAdmin().from(FRANCHISES).upsert(row, { onConflict: 'franchise_id' });
  if (error) throw new Error(error.message);
  return record;
}

export async function listContentFranchises(brandSlug: string): Promise<ContentFranchiseRecord[]> {
  const { data, error } = await getSupabaseAdmin().from(FRANCHISES).select('record').eq('brand_slug', brandSlug);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.record as ContentFranchiseRecord);
}

export async function upsertEditorialIdea(record: EditorialIdeaRecord): Promise<EditorialIdeaRecord> {
  const row = {
    idea_id: record.ideaId,
    organization_id: record.orgId || NDXBOOK_ORG_ID,
    brand_slug: record.brandSlug,
    origin_direction_id: record.originDirectionId,
    origin_world_id: record.originWorldId,
    idea_type: record.ideaType,
    status: record.status,
    record,
    updated_at: record.updatedAt,
  };
  const { error } = await getSupabaseAdmin().from(IDEAS).upsert(row, { onConflict: 'idea_id' });
  if (error) throw new Error(error.message);
  return record;
}

export async function listEditorialIdeas(brandSlug: string): Promise<EditorialIdeaRecord[]> {
  const { data, error } = await getSupabaseAdmin().from(IDEAS).select('record').eq('brand_slug', brandSlug);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.record as EditorialIdeaRecord);
}

export async function upsertCreativeFamily(record: CreativeFamily): Promise<CreativeFamily> {
  const row = {
    family_id: record.familyId,
    organization_id: record.orgId || NDXBOOK_ORG_ID,
    brand_slug: record.brandSlug,
    topic_id: record.topicId,
    direction_id: record.directionId,
    world_id: record.worldId,
    name: record.name,
    record,
    updated_at: record.updatedAt,
  };
  const { error } = await getSupabaseAdmin().from(FAMILIES).upsert(row, { onConflict: 'family_id' });
  if (error) throw new Error(error.message);
  return record;
}

export async function listCreativeFamilies(brandSlug: string): Promise<CreativeFamily[]> {
  const { data, error } = await getSupabaseAdmin().from(FAMILIES).select('record').eq('brand_slug', brandSlug);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.record as CreativeFamily);
}

export async function upsertBrandCanonTrait(record: BrandCanonTrait): Promise<BrandCanonTrait> {
  const row = {
    trait_id: record.traitId,
    organization_id: record.orgId || NDXBOOK_ORG_ID,
    brand_slug: record.brandSlug,
    trait_type: record.traitType,
    source_direction_id: record.sourceDirectionId,
    source_world_id: record.sourceWorldId,
    founder_approved: record.founderApproved,
    status: record.status,
    record,
    updated_at: record.updatedAt,
  };
  const { error } = await getSupabaseAdmin().from(TRAITS).upsert(row, { onConflict: 'trait_id' });
  if (error) throw new Error(error.message);
  return record;
}

export async function getBrandCanonState(brandSlug: string): Promise<BrandCanonState | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(CANON)
    .select('record')
    .eq('brand_slug', brandSlug)
    .maybeSingle();
  if (error || !data) return null;
  return data.record as BrandCanonState;
}

export async function saveBrandCanonState(state: BrandCanonState): Promise<BrandCanonState> {
  const row = {
    organization_id: state.orgId || NDXBOOK_ORG_ID,
    brand_slug: state.brandSlug,
    brand_canon_version: state.brandCanonVersion,
    content_canon_version: state.contentCanonVersion,
    governing_world_id: state.governingWorldId,
    winning_direction_id: state.winningDirectionId,
    winning_direction_name: state.winningDirectionName,
    record: state,
    updated_at: state.updatedAt,
  };
  const { error } = await getSupabaseAdmin().from(CANON).upsert(row, { onConflict: 'brand_slug' });
  if (error) throw new Error(error.message);
  return state;
}

export async function upsertPromotionPlan(record: WinningWorldPromotionPlan): Promise<WinningWorldPromotionPlan> {
  const row = {
    plan_id: record.planId,
    organization_id: record.orgId || NDXBOOK_ORG_ID,
    brand_slug: record.brandSlug,
    winning_direction_id: record.winningDirectionId,
    winning_world_id: record.winningWorldId,
    founder_decision_id: record.founderDecisionId,
    status: record.status,
    record,
    updated_at: record.updatedAt,
  };
  const { error } = await getSupabaseAdmin().from(PROMOTION).upsert(row, { onConflict: 'plan_id' });
  if (error) throw new Error(error.message);
  return record;
}

export async function getPromotionPlan(brandSlug: string): Promise<WinningWorldPromotionPlan | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(PROMOTION)
    .select('record')
    .eq('brand_slug', brandSlug)
    .eq('status', 'PROMOTED')
    .maybeSingle();
  if (error || !data) return null;
  return data.record as WinningWorldPromotionPlan;
}

export async function getPromotionPlanById(planId: string): Promise<WinningWorldPromotionPlan | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(PROMOTION)
    .select('record')
    .eq('plan_id', planId)
    .maybeSingle();
  if (error || !data) return null;
  return data.record as WinningWorldPromotionPlan;
}

export async function upsertLaunchSeedSet(record: LaunchSeedSet): Promise<LaunchSeedSet> {
  const row = {
    launch_seed_set_id: record.launchSeedSetId,
    organization_id: record.orgId || NDXBOOK_ORG_ID,
    brand_slug: record.brandSlug,
    winning_direction_id: record.winningDirectionId,
    status: record.status,
    record,
    updated_at: record.updatedAt,
  };
  const { error } = await getSupabaseAdmin().from(SEED).upsert(row, { onConflict: 'launch_seed_set_id' });
  if (error) throw new Error(error.message);
  return record;
}

export async function getLaunchSeedSet(brandSlug: string): Promise<LaunchSeedSet | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(SEED)
    .select('record')
    .eq('brand_slug', brandSlug)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data.record as LaunchSeedSet;
}

export async function saveSalvageReview(review: SalvageReviewProgress): Promise<SalvageReviewProgress> {
  const state = await getBrandCanonState(review.brandSlug);
  const salvageMap = ((state as BrandCanonState & { salvageReviews?: SalvageReviewProgress[] })?.salvageReviews ??
    []) as SalvageReviewProgress[];
  const filtered = salvageMap.filter(
    (r) => !(r.winningDirectionId === review.winningDirectionId && r.losingDirectionId === review.losingDirectionId),
  );
  filtered.push(review);
  const next = {
    ...(state ?? {
      brandSlug: review.brandSlug,
      orgId: NDXBOOK_ORG_ID,
      brandCanonVersion: 0,
      contentCanonVersion: 0,
      governingWorldId: null,
      winningDirectionId: review.winningDirectionId,
      winningDirectionName: null,
      brandCanonLayers: [],
      contentCanonLayers: [],
      updatedAt: new Date().toISOString(),
    }),
    salvageReviews: filtered,
  };
  await saveBrandCanonState(next as BrandCanonState);
  return review;
}

export async function getForensicAudit(): Promise<ForensicAuditReport | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(CANON)
    .select('record')
    .eq('brand_slug', 'ndxbook')
    .maybeSingle();
  if (error || !data) return null;
  return (data.record as BrandCanonState & { forensicAudit?: ForensicAuditReport }).forensicAudit ?? null;
}

export async function listSalvageReviews(brandSlug: string): Promise<SalvageReviewProgress[]> {
  const state = await getBrandCanonState(brandSlug);
  return ((state as BrandCanonState & { salvageReviews?: SalvageReviewProgress[] })?.salvageReviews ??
    []) as SalvageReviewProgress[];
}

export async function saveForensicAudit(report: ForensicAuditReport): Promise<ForensicAuditReport> {
  const state = (await getBrandCanonState(report.brandSlug)) ?? {
    brandSlug: report.brandSlug,
    orgId: NDXBOOK_ORG_ID,
    brandCanonVersion: 0,
    contentCanonVersion: 0,
    governingWorldId: null,
    winningDirectionId: null,
    winningDirectionName: null,
    brandCanonLayers: [],
    contentCanonLayers: [],
    updatedAt: new Date().toISOString(),
  };
  await saveBrandCanonState({ ...state, forensicAudit: report } as BrandCanonState & { forensicAudit: ForensicAuditReport });
  return report;
}
