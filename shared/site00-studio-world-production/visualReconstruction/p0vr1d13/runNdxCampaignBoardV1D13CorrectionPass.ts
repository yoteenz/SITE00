/**
 * P0.VR.1D.13 — Campaign Board correction pass (delegates render loop to P0.VR.1D.6 + v1d13 authority).
 */

import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runNdxCampaignBoardCorrectionPass } from '../p0vr1d6/runNdxCampaignBoardCorrectionPass.js';
import { resolveCampaignBoardReferenceAssets } from './CampaignBoardReferenceAssetResolver.js';
import { buildCampaignBoardMobileVisualShellSpec } from './campaignBoardMobileVisualShellSpec.js';
import { invalidateStaleCampaignBoardLocks } from './invalidateStaleCampaignBoardLocks.js';
import { NDX_CAMPAIGN_BOARD_V1D13_REFERENCE_PATH, P0_VR_1D13_LINEAGE } from './constants.js';
import type { ImplementationRegionLock } from '../p0vr1d1/types.js';

export type RunNdxCampaignBoardV1D13CorrectionPassInput = {
  rootDir?: string;
  baseUrl?: string;
  outputDir?: string;
  maxIterations?: number;
  executePatches?: boolean;
  priorLocks?: ImplementationRegionLock[];
};

export type NdxCampaignBoardV1D13CorrectionReport = {
  lineage: typeof P0_VR_1D13_LINEAGE;
  shellSpec: ReturnType<typeof buildCampaignBoardMobileVisualShellSpec>;
  assetResolutions: ReturnType<typeof resolveCampaignBoardReferenceAssets>;
  staleLockAudit: ReturnType<typeof invalidateStaleCampaignBoardLocks>;
  renderPath: string | null;
  overlayPath: string | null;
  iterations: number;
  skipRender: false;
};

export async function runNdxCampaignBoardV1D13CorrectionPass(
  input: RunNdxCampaignBoardV1D13CorrectionPassInput = {},
): Promise<NdxCampaignBoardV1D13CorrectionReport> {
  const rootDir = input.rootDir ?? process.cwd();
  const referencePath = join(rootDir, NDX_CAMPAIGN_BOARD_V1D13_REFERENCE_PATH);
  if (!existsSync(referencePath)) {
    throw new Error(`P0.VR.1D.13 reference missing at ${referencePath}`);
  }

  const shellSpec = buildCampaignBoardMobileVisualShellSpec();
  const assetResolutions = resolveCampaignBoardReferenceAssets({ projectRoot: rootDir });
  const staleLockAudit = invalidateStaleCampaignBoardLocks(input.priorLocks ?? []);

  readFileSync(referencePath);

  const baseReport = await runNdxCampaignBoardCorrectionPass({
    rootDir,
    baseUrl: input.baseUrl,
    outputDir: input.outputDir ?? join('/tmp', 'vr-p0vr1d13', randomUUID()),
    maxIterations: input.maxIterations ?? 2,
    executePatches: input.executePatches,
  });

  return {
    lineage: P0_VR_1D13_LINEAGE,
    shellSpec,
    assetResolutions,
    staleLockAudit,
    renderPath: baseReport.renderPath,
    overlayPath: baseReport.overlayPath,
    iterations: baseReport.iterations,
    skipRender: false,
  };
}
