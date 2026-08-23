/**
 * Creative lineage persistence — Supabase in production (fail loud), memory in tests.
 */

import { resolveDurableStoreMode } from '../../../../shared/site00-studio-world-execution/persistencePolicy.js';

export function useCreativeLineageMemoryStore(): boolean {
  return process.env.SITE00_CREATIVE_LINEAGE_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let mode: 'memory' | 'supabase' | null = null;

async function resolveMode(): Promise<'memory' | 'supabase'> {
  if (mode) return mode;
  const db = await import('./supabaseStore.js');
  mode = await resolveDurableStoreMode({
    storeName: 'CreativeLineage',
    explicitUseMemory: useCreativeLineageMemoryStore(),
    schemaExists: db.lineageTablesExist,
    migrationHint: 'run supabase/migrations/20260823120000_site00_creative_lineage.sql',
  });
  return mode;
}

export function resetCreativeLineageStoreModeCache(): void {
  mode = null;
}

async function store() {
  return (await resolveMode()) === 'memory'
    ? import('./memoryStore.js')
    : import('./supabaseStore.js');
}

export async function upsertCreativeAsset(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['upsertCreativeAsset']>
) {
  return (await store()).upsertCreativeAsset(...args);
}

export async function listCreativeAssets(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['listCreativeAssets']>
) {
  return (await store()).listCreativeAssets(...args);
}

export async function getCreativeAssetById(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['getCreativeAssetById']>
) {
  return (await store()).getCreativeAssetById(...args);
}

export async function upsertCreativeConcept(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['upsertCreativeConcept']>
) {
  return (await store()).upsertCreativeConcept(...args);
}

export async function listCreativeConcepts(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['listCreativeConcepts']>
) {
  return (await store()).listCreativeConcepts(...args);
}

export async function upsertContentFranchise(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['upsertContentFranchise']>
) {
  return (await store()).upsertContentFranchise(...args);
}

export async function listContentFranchises(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['listContentFranchises']>
) {
  return (await store()).listContentFranchises(...args);
}

export async function upsertEditorialIdea(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['upsertEditorialIdea']>
) {
  return (await store()).upsertEditorialIdea(...args);
}

export async function listEditorialIdeas(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['listEditorialIdeas']>
) {
  return (await store()).listEditorialIdeas(...args);
}

export async function upsertCreativeFamily(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['upsertCreativeFamily']>
) {
  return (await store()).upsertCreativeFamily(...args);
}

export async function listCreativeFamilies(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['listCreativeFamilies']>
) {
  return (await store()).listCreativeFamilies(...args);
}

export async function upsertBrandCanonTrait(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['upsertBrandCanonTrait']>
) {
  return (await store()).upsertBrandCanonTrait(...args);
}

export async function getBrandCanonState(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['getBrandCanonState']>
) {
  return (await store()).getBrandCanonState(...args);
}

export async function saveBrandCanonState(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['saveBrandCanonState']>
) {
  return (await store()).saveBrandCanonState(...args);
}

export async function upsertPromotionPlan(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['upsertPromotionPlan']>
) {
  return (await store()).upsertPromotionPlan(...args);
}

export async function getPromotionPlan(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['getPromotionPlan']>
) {
  return (await store()).getPromotionPlan(...args);
}

export async function getPromotionPlanById(planId: string) {
  return (await store()).getPromotionPlanById(planId);
}

export async function upsertLaunchSeedSet(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['upsertLaunchSeedSet']>
) {
  return (await store()).upsertLaunchSeedSet(...args);
}

export async function getLaunchSeedSet(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['getLaunchSeedSet']>
) {
  return (await store()).getLaunchSeedSet(...args);
}

export async function saveSalvageReview(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['saveSalvageReview']>
) {
  return (await store()).saveSalvageReview(...args);
}

export async function listSalvageReviews(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['listSalvageReviews']>
) {
  return (await store()).listSalvageReviews(...args);
}

export async function saveForensicAudit(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['saveForensicAudit']>
) {
  return (await store()).saveForensicAudit(...args);
}

export async function getForensicAudit() {
  return (await store()).getForensicAudit();
}

export { resetCreativeLineageMemory } from './memoryStore.js';
