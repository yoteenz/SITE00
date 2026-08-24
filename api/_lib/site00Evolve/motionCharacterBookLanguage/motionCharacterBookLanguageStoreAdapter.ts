/**
 * P0.5E.2 — Motion Character + Book Language store adapter.
 */

import type { NdxMotionCharacterBookLanguageRun } from '../../../../shared/site00-brand-lore/ndxBookCulturalLanguage/types.js';
import * as mem from './motionCharacterBookLanguageMemoryStore.js';

export function useMotionCharacterBookLanguageMemoryStore(): boolean {
  return process.env.VITEST === 'true' || process.env.SITE00_MOTION_CHARACTER_USE_MEMORY === '1';
}

let cachedMode: 'memory' | null = null;

export async function resolveMotionCharacterBookLanguageStoreMode(): Promise<'memory'> {
  if (cachedMode) return cachedMode;
  cachedMode = 'memory';
  return cachedMode;
}

export function resetMotionCharacterBookLanguageStoreModeCache(): void {
  cachedMode = null;
}

async function store() {
  await resolveMotionCharacterBookLanguageStoreMode();
  return mem;
}

export async function getMotionCharacterBookLanguageRun(
  projectId: string,
): Promise<NdxMotionCharacterBookLanguageRun | null> {
  return (await store()).getMotionCharacterBookLanguageRun(projectId);
}

export async function saveMotionCharacterBookLanguageRun(
  run: NdxMotionCharacterBookLanguageRun,
): Promise<NdxMotionCharacterBookLanguageRun> {
  return (await store()).saveMotionCharacterBookLanguageRun(run);
}

export { resetMotionCharacterBookLanguageMemory } from './motionCharacterBookLanguageMemoryStore.js';
