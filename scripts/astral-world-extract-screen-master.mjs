#!/usr/bin/env node
/**
 * P0.E.FT5.2 — Extract canonical screen master from source board.
 * Usage: node --import tsx scripts/astral-world-extract-screen-master.mjs [screenId]
 */
import { extractCanonicalScreenMaster } from '../shared/site00-astral-world/screen-masters/extractScreenMaster.js';
import { registerExtractedPilotMaster } from '../shared/site00-astral-world/screen-masters/registry.js';
import { registerScreenMasterInVr2, initializeAstralWorldProductionAdapter } from '../shared/site00-astral-world/screen-masters/vr2Adapter.js';

const screenId = process.argv[2] ?? 'AW_M_01_WORLD_ENTRY';

async function main() {
  initializeAstralWorldProductionAdapter();
  const result = await extractCanonicalScreenMaster(screenId);
  console.log('EXTRACT', JSON.stringify(result, null, 2));
  if (!result.ok) {
    process.exit(1);
  }

  const master = registerExtractedPilotMaster({
    width: result.width,
    height: result.height,
    approvalState: 'MASTER_READY_FOR_REVIEW',
  });
  const vr2 = registerScreenMasterInVr2(master);
  console.log('MASTER', JSON.stringify({ screenId: vr2.screenId, path: vr2.canonicalMasterPath, vr2: vr2.vr2ReferenceId }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
