/**
 * C1.7 — Campaign copy persistence (memory + Supabase-ready).
 */

import type { CampaignCopyPackageOutput } from '../../../shared/site00-expression-engine/campaign-copy/types.js';
import { hasSupabaseServiceRole } from '../../supabase.js';

const packages: CampaignCopyPackageOutput[] = [];
let storeMode: 'MEMORY' | 'SUPABASE' = 'MEMORY';

export async function initCampaignCopyStore(): Promise<'MEMORY' | 'SUPABASE'> {
  if (process.env.VITEST === 'true') {
    storeMode = 'MEMORY';
    return storeMode;
  }
  storeMode = hasSupabaseServiceRole() ? 'SUPABASE' : 'MEMORY';
  return storeMode;
}

export function getCampaignCopyStoreMode(): 'MEMORY' | 'SUPABASE' {
  return storeMode;
}

export function resetCampaignCopyStore(): void {
  packages.length = 0;
  storeMode = 'MEMORY';
}

export async function persistCampaignCopyPackage(output: CampaignCopyPackageOutput): Promise<void> {
  packages.push(output);
}

export function listCampaignCopyPackages(): CampaignCopyPackageOutput[] {
  return [...packages];
}

export function getCampaignCopyPackage(copyPackageId: string): CampaignCopyPackageOutput | undefined {
  return packages.find((p) => p.copyPackageId === copyPackageId);
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
    status: founderJudgment ? 'APPROVED' : 'AWAITING_FOUNDER_REVIEW',
    founderJudgment,
    source: 'founder_edit',
    createdAt: new Date().toISOString(),
  });
  return true;
}
