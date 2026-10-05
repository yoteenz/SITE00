/**
 * Brand Marketing Expression store adapter.
 */

import { resolveDurableStoreMode } from '../../../../../shared/site00-studio-world-execution/persistencePolicy.js';
import type { BrandMarketingExpressionRun } from '../../../../../shared/site00-brand-lore/brandMarketingExpression/types.js';
import * as mem from './brandMarketingExpressionMemoryStore.js';
import * as db from './brandMarketingExpressionSupabaseStore.js';

export function useBrandMarketingExpressionMemoryStore(): boolean {
  return process.env.SITE00_BRAND_MARKETING_EXPRESSION_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let cachedMode: 'memory' | 'supabase' | null = null;

export async function resolveBrandMarketingExpressionStoreMode(): Promise<'memory' | 'supabase'> {
  if (cachedMode) return cachedMode;
  cachedMode = await resolveDurableStoreMode({
    storeName: 'BrandMarketingExpression',
    explicitUseMemory: useBrandMarketingExpressionMemoryStore(),
    schemaExists: db.brandMarketingExpressionTablesExist,
    migrationHint: 'run supabase/migrations/20260823010000_site00_methodology_validation_runs.sql',
  });
  return cachedMode;
}

export function resetBrandMarketingExpressionStoreModeCache(): void {
  cachedMode = null;
}

async function store() {
  return (await resolveBrandMarketingExpressionStoreMode()) === 'memory' ? mem : db;
}

export async function getBrandMarketingExpressionRun(
  projectId: string,
): Promise<BrandMarketingExpressionRun | null> {
  return (await store()).getBrandMarketingExpressionRun(projectId);
}

export async function saveBrandMarketingExpressionRun(
  run: BrandMarketingExpressionRun,
): Promise<BrandMarketingExpressionRun> {
  return (await store()).saveBrandMarketingExpressionRun(run);
}

export { resetBrandMarketingExpressionMemory } from './brandMarketingExpressionMemoryStore.js';
