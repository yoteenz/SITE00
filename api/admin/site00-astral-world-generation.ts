import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import {
  getAstralGenerationStatus,
  getAstralAssetStoreSnapshot,
  queueAstralAssetGeneration,
  queueMissingP0Assets,
  pollAstralGenerationJobs,
} from '../_lib/site00AstralWorld/generationService.js';
import { initializeMissingContracts } from '../_lib/site00AstralWorld/assetRecordStore.js';
import { getContractBySlot } from '../../shared/site00-astral-world/generation/assetSlotRegistry.js';
import { compileAstralPrompt } from '../../shared/site00-astral-world/generation/promptCompiler.js';

function originFromReq(req: VercelRequest): string {
  const host = String(req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost:5174');
  const proto = String(req.headers['x-forwarded-proto'] ?? 'http');
  return `${proto}://${host}`;
}

/**
 * Admin Astral World generation API (founder/debug only).
 * GET ?action=status|store|prompt
 * POST action=generate|generate-missing|poll
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) {
    const { status, error, code } = auth.failure;
    return res.status(status).json({ error, code });
  }

  const action = String(req.query.action ?? '').trim();
  const origin = originFromReq(req);

  try {
    if (req.method === 'GET') {
      if (action === 'status') {
        return res.status(200).json({ ok: true, ...getAstralGenerationStatus() });
      }
      if (action === 'store') {
        initializeMissingContracts();
        return res.status(200).json({ ok: true, records: getAstralAssetStoreSnapshot() });
      }
      if (action === 'prompt') {
        const slot = String(req.query.slot ?? '').trim();
        const contract = getContractBySlot(slot);
        if (!contract) return res.status(404).json({ error: 'Unknown slot' });
        const compiled = compileAstralPrompt(contract);
        return res.status(200).json({ ok: true, slot, compiled, contract });
      }
      return res.status(400).json({ error: 'Unknown action' });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'object' && req.body ? (req.body as Record<string, unknown>) : {};
      const postAction = String(body.action ?? action).trim();

      if (postAction === 'generate') {
        const slotKey = String(body.slotKey ?? '').trim();
        const force = body.force === true;
        const result = await queueAstralAssetGeneration(slotKey, origin, { force });
        return res.status(result.ok ? 200 : 409).json({ ok: result.ok, ...result });
      }

      if (postAction === 'generate-missing') {
        const result = await queueMissingP0Assets(origin);
        return res.status(200).json({ ok: true, ...result });
      }

      if (postAction === 'poll') {
        const poll = await pollAstralGenerationJobs();
        return res.status(200).json({ ok: true, status: getAstralGenerationStatus(), poll });
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}
