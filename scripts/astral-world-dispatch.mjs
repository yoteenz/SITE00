import { getProductionPreflight, queueAstralAssetGeneration, dispatchP0Batch, dispatchP1Batch, dispatchP2Batch } from '../api/_lib/site00AstralWorld/generationService.js';
import { initializeMissingContracts, getAstralAssetStoreSnapshot } from '../api/_lib/site00AstralWorld/assetRecordStore.js';

const origin = process.env.SITE00_ORIGIN ?? 'http://localhost:5174';
const mode = process.argv[2] ?? 'single';

async function main() {
  const preflight = getProductionPreflight();
  console.log('PREFLIGHT', JSON.stringify(preflight));
  if (preflight.falKey === 'MISSING') {
    console.error('BLOCKED: FAL_KEY missing — configure on Railway API service.');
    process.exit(1);
  }

  process.env.SITE00_FAL_SYNCHRONOUS = '1';
  initializeMissingContracts();

  if (mode === 'p0-batch') {
    const result = await dispatchP0Batch(origin);
    console.log('P0 BATCH', JSON.stringify(result, null, 2));
  } else if (mode === 'p1-batch') {
    const result = await dispatchP1Batch(origin);
    console.log('P1 BATCH', JSON.stringify(result, null, 2));
  } else if (mode === 'p2-batch') {
    const result = await dispatchP2Batch(origin);
    console.log('P2 BATCH', JSON.stringify(result, null, 2));
  } else {
    const slot = process.env.ASTRAL_SLOT ?? 'ASTRAL_WORLD_HERO_MOBILE';
    const result = await queueAstralAssetGeneration(slot, origin);
    console.log('QUEUE', JSON.stringify(result));
  }

  const store = getAstralAssetStoreSnapshot();
  for (const [key, r] of Object.entries(store)) {
    if (r.status === 'ACTIVE' || r.status === 'READY' || r.status === 'PROCESSING' || r.status === 'FAILED') {
      console.log(`${key}: ${r.status} v${r.version} ${r.outputUrl ? 'URL_OK' : r.error ?? ''}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
