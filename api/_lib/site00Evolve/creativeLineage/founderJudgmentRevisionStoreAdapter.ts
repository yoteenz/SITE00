/**
 * Founder judgment + revision persistence adapter.
 */

import { hasSupabaseServiceRole } from '../../supabase.js';

export function useFounderJudgmentRevisionMemoryStore(): boolean {
  return process.env.SITE00_FOUNDER_JUDGMENT_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let mode: 'memory' | 'supabase' | null = null;

async function resolveMode(): Promise<'memory' | 'supabase'> {
  if (useFounderJudgmentRevisionMemoryStore()) {
    mode = null;
    return 'memory';
  }
  if (mode) return mode;
  if (!hasSupabaseServiceRole()) {
    mode = 'memory';
    return 'memory';
  }
  const db = await import('./founderJudgmentRevisionSupabaseStore.js');
  const exists = await db.revisionJudgmentTablesExist();
  mode = exists ? 'supabase' : 'memory';
  return mode;
}

async function store() {
  return (await resolveMode()) === 'memory'
    ? import('./founderJudgmentRevisionMemoryStore.js')
    : import('./founderJudgmentRevisionSupabaseStore.js');
}

export async function upsertFounderCreativeJudgment(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['upsertFounderCreativeJudgment']>
) {
  return (await store()).upsertFounderCreativeJudgment(...args);
}

export async function getFounderCreativeJudgment(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['getFounderCreativeJudgment']>
) {
  return (await store()).getFounderCreativeJudgment(...args);
}

export async function listFounderCreativeJudgments(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['listFounderCreativeJudgments']>
) {
  return (await store()).listFounderCreativeJudgments(...args);
}

export async function upsertBrandAssetDisposition(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['upsertBrandAssetDisposition']>
) {
  return (await store()).upsertBrandAssetDisposition(...args);
}

export async function getBrandAssetDisposition(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['getBrandAssetDisposition']>
) {
  return (await store()).getBrandAssetDisposition(...args);
}

export async function upsertCreativeRevisionSpec(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['upsertCreativeRevisionSpec']>
) {
  return (await store()).upsertCreativeRevisionSpec(...args);
}

export async function getCreativeRevisionSpec(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['getCreativeRevisionSpec']>
) {
  return (await store()).getCreativeRevisionSpec(...args);
}

export async function listCreativeRevisionSpecs(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['listCreativeRevisionSpecs']>
) {
  return (await store()).listCreativeRevisionSpecs(...args);
}

export async function upsertRevisionBranch(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['upsertRevisionBranch']>
) {
  return (await store()).upsertRevisionBranch(...args);
}

export async function getRevisionBranch(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['getRevisionBranch']>
) {
  return (await store()).getRevisionBranch(...args);
}

export async function upsertPreferenceEvidence(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['upsertPreferenceEvidence']>
) {
  return (await store()).upsertPreferenceEvidence(...args);
}

export async function listPreferenceEvidence(
  ...args: Parameters<Awaited<ReturnType<typeof store>>['listPreferenceEvidence']>
) {
  return (await store()).listPreferenceEvidence(...args);
}

export { resetFounderJudgmentRevisionMemory } from './founderJudgmentRevisionMemoryStore.js';
