/**
 * Brand Presentation Visual Formulation persistence — Supabase in production, memory in tests.
 */

import { resolveDurableStoreMode } from '../../../../../shared/site00-studio-world-execution/persistencePolicy.js';
import type { BrandPresentationVisualFormulationRun } from '../../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/types.js';
import { BRAND_PRESENTATION_VISUAL_FORMULATION_RUN_ID } from '../../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/constants.js';
import * as mem from './memoryStore.js';
import * as db from './supabaseStore.js';

export function useBrandPresentationVisualFormulationMemoryStore(): boolean {
  return process.env.SITE00_EXPERIMENT_G_VISUAL_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let cachedMode: 'memory' | 'supabase' | null = null;

export async function resolveBrandPresentationVisualFormulationStoreMode(): Promise<'memory' | 'supabase'> {
  if (cachedMode) return cachedMode;
  cachedMode = await resolveDurableStoreMode({
    storeName: 'BrandPresentationVisualFormulation',
    explicitUseMemory: useBrandPresentationVisualFormulationMemoryStore(),
    schemaExists: db.methodologyValidationTablesExist,
    migrationHint: 'run supabase/migrations/20260823010000_site00_methodology_validation_runs.sql',
  });
  return cachedMode;
}

export function resetBrandPresentationVisualFormulationStoreModeCache(): void {
  cachedMode = null;
}

async function store() {
  return (await resolveBrandPresentationVisualFormulationStoreMode()) === 'memory' ? mem : db;
}

export async function getBrandPresentationVisualFormulationRun(
  runId: string = BRAND_PRESENTATION_VISUAL_FORMULATION_RUN_ID,
): Promise<BrandPresentationVisualFormulationRun | null> {
  return (await store()).getBrandPresentationVisualFormulationRun(runId);
}

export async function saveBrandPresentationVisualFormulationRun(
  run: BrandPresentationVisualFormulationRun,
): Promise<BrandPresentationVisualFormulationRun> {
  return (await store()).saveBrandPresentationVisualFormulationRun(run);
}

export { resetBrandPresentationVisualFormulationMemory } from './memoryStore.js';
