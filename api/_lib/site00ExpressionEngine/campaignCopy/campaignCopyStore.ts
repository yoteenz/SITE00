/**
 * C1.7/C1.8 — Campaign copy persistence (memory + Supabase).
 */

import type { CampaignCopyPackageOutput } from '../../../shared/site00-expression-engine/campaign-copy/types.js';
import { hasSupabaseServiceRole } from '../../supabase.js';
import {
  campaignCopySchemaExists,
  upsertCampaignCopyPackageToSupabase,
  loadCampaignCopyPackageFromSupabase,
} from './campaignCopySupabaseStore.js';

const packages: CampaignCopyPackageOutput[] = [];
let storeMode: 'MEMORY' | 'SUPABASE' = 'MEMORY';

export async function initCampaignCopyStore(): Promise<'MEMORY' | 'SUPABASE'> {
  if (process.env.VITEST === 'true') {
    storeMode = 'MEMORY';
    return storeMode;
  }
  if (hasSupabaseServiceRole() && (await campaignCopySchemaExists())) {
    storeMode = 'SUPABASE';
  } else {
    storeMode = 'MEMORY';
  }
  return storeMode;
}

export function getCampaignCopyStoreMode(): 'MEMORY' | 'SUPABASE' {
  return storeMode;
}

export function resetCampaignCopyStore(): void {
  packages.length = 0;
  storeMode = 'MEMORY';
}

export async function persistCampaignCopyPackage(
  output: CampaignCopyPackageOutput,
  projectId = 'verdant-row',
): Promise<void> {
  const existing = packages.findIndex((p) => p.copyPackageId === output.copyPackageId);
  if (existing >= 0) packages[existing] = output;
  else packages.push(output);
  if (storeMode === 'SUPABASE') {
    await upsertCampaignCopyPackageToSupabase(output, projectId);
  }
}

export function listCampaignCopyPackages(): CampaignCopyPackageOutput[] {
  return [...packages];
}

export function getCampaignCopyPackage(copyPackageId: string): CampaignCopyPackageOutput | undefined {
  return packages.find((p) => p.copyPackageId === copyPackageId);
}

export async function loadCampaignCopyPackage(copyPackageId: string): Promise<CampaignCopyPackageOutput | undefined> {
  const mem = getCampaignCopyPackage(copyPackageId);
  if (mem) return mem;
  if (storeMode === 'SUPABASE') {
    const remote = await loadCampaignCopyPackageFromSupabase(copyPackageId);
    if (remote) packages.push(remote);
    return remote ?? undefined;
  }
  return undefined;
}

export function updateUnitCopyVersion(
  copyPackageId: string,
  unitId: string,
  versionLabel: string,
  caption: string,
  founderJudgment?: string,
): boolean {
  const pkg = packages.find((p) => p.copyPackageId === copyPackageId);
  const unit = pkg?.unitCopyDirections.find((u) => u.unitId === unitId);
  if (!unit) return false;
  unit.finalCaption = caption;
  unit.copyPackage.caption = caption;
  unit.copyPackage.copyVersion = versionLabel;
  unit.versions.push({
    versionLabel,
    copyText: { caption },
    rhetoricalStrategy: unit.winningTerritory.rhetoricalBehavior,
    cta: unit.copyPackage.cta,
    status: founderJudgment === 'LOVE IT' ? 'APPROVED' : 'AWAITING_FOUNDER_REVIEW',
    founderJudgment,
    source: founderJudgment === 'LOVE IT' ? 'founder_love_it' : 'founder_edit',
    createdAt: new Date().toISOString(),
  });
  return true;
}

export { applyFounderCopyAction, isCopyPackageReady } from './founderCopyActions.js';
