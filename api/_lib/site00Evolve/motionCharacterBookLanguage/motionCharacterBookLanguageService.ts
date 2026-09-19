/**
 * P0.5E.2 — Motion Character + Book Language service.
 */

import { buildNdxMotionCharacterBookLanguageRun } from '../../../../shared/site00-brand-lore/ndxMotionCharacter/index.js';
import type { NdxMotionCharacterBookLanguageRun } from '../../../../shared/site00-brand-lore/ndxBookCulturalLanguage/types.js';
import * as store from './motionCharacterBookLanguageStoreAdapter.js';

export async function getMotionCharacterBookLanguageState(params: {
  projectId: string;
}): Promise<NdxMotionCharacterBookLanguageRun | null> {
  return store.getMotionCharacterBookLanguageRun(params.projectId);
}

export async function initializeMotionCharacterBookLanguage(params: {
  projectId: string;
}): Promise<NdxMotionCharacterBookLanguageRun> {
  const run = buildNdxMotionCharacterBookLanguageRun(params.projectId);
  return store.saveMotionCharacterBookLanguageRun(run);
}

export async function refreshMotionCharacterBookLanguage(params: {
  projectId: string;
}): Promise<NdxMotionCharacterBookLanguageRun> {
  const run = buildNdxMotionCharacterBookLanguageRun(params.projectId);
  return store.saveMotionCharacterBookLanguageRun(run);
}

export function brandCharacterImmutable(): true {
  return true;
}
