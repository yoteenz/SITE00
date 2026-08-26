import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeMissingContracts } from '../_lib/site00AstralWorld/assetRecordStore.js';
import { getAstralAssetStoreSnapshot } from '../_lib/site00AstralWorld/generationService.js';
import { sanitizeClientAssetMap } from '../../shared/site00-astral-world/generation/assetResolver.js';

function originFromReq(req: VercelRequest): string {
  const host = String(req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost:5174');
  const proto = String(req.headers['x-forwarded-proto'] ?? 'http');
  return `${proto}://${host}`;
}

/**
 * Public read-only Astral World resolved assets (no FAL/provider details).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  initializeMissingContracts();
  const store = getAstralAssetStoreSnapshot();
  const origin = originFromReq(req);
  const assets = sanitizeClientAssetMap(store, origin);

  return res.status(200).json({
    ok: true,
    projectId: 'astral-world',
    assets,
    generatedCount: Object.keys(assets).length,
  });
}
