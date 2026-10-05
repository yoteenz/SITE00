#!/usr/bin/env node
/**
 * P0.E.FT5.1 — Dispatch P0 FAL batch (requires FAL_KEY + SUPABASE_SERVICE_ROLE_KEY).
 */
import { dispatchP0Batch, getProductionPreflight } from '../api/_lib/site00AstralWorld/generationService.js';
import { initializeMissingContracts, getAstralAssetStoreSnapshot } from '../api/_lib/site00AstralWorld/assetRecordStore.js';

const origin = process.env.SITE00_ORIGIN ?? 'http://localhost:5174';

const preflight = getProductionPreflight();
console.log('PREFLIGHT', preflight);

if (preflight.falKey === 'MISSING') {
  console.error('Cannot dispatch: FAL_KEY missing on server runtime.');
  process.exit(1);
}

process.env.SITE00_FAL_SYNCHRONOUS = '1';

initializeMissingContracts();
const result = await dispatchP0Batch(origin);
console.log('DISPATCH RESULT', result);

const store = getAstralAssetStoreSnapshot();
for (const slot of result.queued) {
  const r = store[slot];
  console.log(`${slot}: ${r?.status ?? '?'} ${r?.outputUrl ? 'HAS_URL' : ''}`);
}
