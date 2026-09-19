/**
 * In-memory creative lineage store (tests).
 */

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

type LineageStore = {
  assets: Map<string, CreativeAssetRecord>;
  concepts: Map<string, CreativeConceptRecord>;
  franchises: Map<string, ContentFranchiseRecord>;
  ideas: Map<string, EditorialIdeaRecord>;
  families: Map<string, CreativeFamily>;
  traits: Map<string, BrandCanonTrait>;
  canonState: Map<string, BrandCanonState>;
  promotionPlans: Map<string, WinningWorldPromotionPlan>;
  launchSeedSets: Map<string, LaunchSeedSet>;
  salvageReviews: Map<string, SalvageReviewProgress>;
  forensicAudit: ForensicAuditReport | null;
};

const store: LineageStore = {
  assets: new Map(),
  concepts: new Map(),
  franchises: new Map(),
  ideas: new Map(),
  families: new Map(),
  traits: new Map(),
  canonState: new Map(),
  promotionPlans: new Map(),
  launchSeedSets: new Map(),
  salvageReviews: new Map(),
  forensicAudit: null,
};

export function resetCreativeLineageMemory(): void {
  store.assets.clear();
  store.concepts.clear();
  store.franchises.clear();
  store.ideas.clear();
  store.families.clear();
  store.traits.clear();
  store.canonState.clear();
  store.promotionPlans.clear();
  store.launchSeedSets.clear();
  store.salvageReviews.clear();
  store.forensicAudit = null;
}

export async function lineageTablesExist(): Promise<boolean> {
  return true;
}

export async function upsertCreativeAsset(record: CreativeAssetRecord): Promise<CreativeAssetRecord> {
  store.assets.set(record.assetId, record);
  return record;
}

export async function listCreativeAssets(brandSlug: string): Promise<CreativeAssetRecord[]> {
  return [...store.assets.values()].filter((a) => a.brandSlug === brandSlug);
}

export async function getCreativeAssetById(
  brandSlug: string,
  assetId: string,
): Promise<CreativeAssetRecord | null> {
  const asset = store.assets.get(assetId);
  if (!asset || asset.brandSlug !== brandSlug) return null;
  return asset;
}

export async function upsertCreativeConcept(record: CreativeConceptRecord): Promise<CreativeConceptRecord> {
  store.concepts.set(record.conceptId, record);
  return record;
}

export async function listCreativeConcepts(brandSlug: string): Promise<CreativeConceptRecord[]> {
  return [...store.concepts.values()].filter((c) => c.brandSlug === brandSlug);
}

export async function upsertContentFranchise(record: ContentFranchiseRecord): Promise<ContentFranchiseRecord> {
  store.franchises.set(record.franchiseId, record);
  return record;
}

export async function listContentFranchises(brandSlug: string): Promise<ContentFranchiseRecord[]> {
  return [...store.franchises.values()].filter((f) => f.brandSlug === brandSlug);
}

export async function upsertEditorialIdea(record: EditorialIdeaRecord): Promise<EditorialIdeaRecord> {
  store.ideas.set(record.ideaId, record);
  return record;
}

export async function listEditorialIdeas(brandSlug: string): Promise<EditorialIdeaRecord[]> {
  return [...store.ideas.values()].filter((i) => i.brandSlug === brandSlug);
}

export async function upsertCreativeFamily(record: CreativeFamily): Promise<CreativeFamily> {
  store.families.set(record.familyId, record);
  return record;
}

export async function listCreativeFamilies(brandSlug: string): Promise<CreativeFamily[]> {
  return [...store.families.values()].filter((f) => f.brandSlug === brandSlug);
}

export async function upsertBrandCanonTrait(record: BrandCanonTrait): Promise<BrandCanonTrait> {
  store.traits.set(record.traitId, record);
  return record;
}

export async function getBrandCanonState(brandSlug: string): Promise<BrandCanonState | null> {
  return store.canonState.get(brandSlug) ?? null;
}

export async function saveBrandCanonState(state: BrandCanonState): Promise<BrandCanonState> {
  store.canonState.set(state.brandSlug, state);
  return state;
}

export async function upsertPromotionPlan(record: WinningWorldPromotionPlan): Promise<WinningWorldPromotionPlan> {
  store.promotionPlans.set(record.planId, record);
  return record;
}

export async function getPromotionPlanById(planId: string): Promise<WinningWorldPromotionPlan | null> {
  return store.promotionPlans.get(planId) ?? [...store.promotionPlans.values()].find((p) => p.planId === planId) ?? null;
}

export async function upsertLaunchSeedSet(record: LaunchSeedSet): Promise<LaunchSeedSet> {
  store.launchSeedSets.set(record.launchSeedSetId, record);
  return record;
}

export async function getLaunchSeedSet(brandSlug: string): Promise<LaunchSeedSet | null> {
  const found = [...store.launchSeedSets.values()].find((s) => s.brandSlug === brandSlug) ?? null;
  if (!found) return null;
  return {
    ...found,
    assetProvenance: found.assetProvenance ?? {},
    reviewRequiredAssetIds: found.reviewRequiredAssetIds ?? [],
  };
}

export async function saveSalvageReview(review: SalvageReviewProgress): Promise<SalvageReviewProgress> {
  store.salvageReviews.set(`${review.winningDirectionId}:${review.losingDirectionId}`, review);
  return review;
}

export async function listSalvageReviews(brandSlug: string): Promise<SalvageReviewProgress[]> {
  return [...store.salvageReviews.values()].filter((r) => r.brandSlug === brandSlug);
}

export async function saveForensicAudit(report: ForensicAuditReport): Promise<ForensicAuditReport> {
  store.forensicAudit = report;
  return report;
}

export async function getForensicAudit(): Promise<ForensicAuditReport | null> {
  return store.forensicAudit;
}
