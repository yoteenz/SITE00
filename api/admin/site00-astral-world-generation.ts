import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import {
  getAstralGenerationStatus,
  getAstralAssetStoreSnapshot,
  queueAstralAssetGeneration,
  queueMissingP0Assets,
  pollAstralGenerationJobs,
  dispatchP0Batch,
  dispatchP1Batch,
  dispatchP2Batch,
  activateFounderAsset,
  supersedeAndRegenerate,
  getProductionPreflight,
} from '../_lib/site00AstralWorld/generationService.js';
import { initializeMissingContracts, ensureAstralAssetStoreHydrated } from '../_lib/site00AstralWorld/assetRecordStore.js';
import { getContractBySlot, P0_SLOT_KEYS, P1_SLOT_KEYS, P2_SLOT_KEYS } from '../../shared/site00-astral-world/generation/assetSlotRegistry.js';
import { compileAstralPrompt } from '../../shared/site00-astral-world/generation/promptCompiler.js';

function originFromReq(req: VercelRequest): string {
  const host = String(req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost:5174');
  const proto = String(req.headers['x-forwarded-proto'] ?? 'http');
  return `${proto}://${host}`;
}

/**
 * Admin Astral World generation API (founder/debug only).
 * GET ?action=status|store|prompt|preflight|manifest-audit
 * POST action=generate|generate-missing|dispatch-p0|dispatch-p1|dispatch-p2|poll|activate|regenerate
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
    await ensureAstralAssetStoreHydrated();

    if (req.method === 'GET') {
      if (action === 'status') {
        return res.status(200).json({ ok: true, ...getAstralGenerationStatus() });
      }
      if (action === 'preflight') {
        return res.status(200).json({ ok: true, preflight: getProductionPreflight() });
      }
      if (action === 'manifest-audit') {
        initializeMissingContracts();
        const store = getAstralAssetStoreSnapshot();
        const tally = (keys: string[]) => {
          const out: Record<string, number> = { active: 0, ready: 0, processing: 0, queued: 0, failed: 0, missing: 0 };
          for (const key of keys) {
            const r = store[key];
            if (!r || r.status === 'CONTRACT_READY' || r.status === 'MISSING') out.missing += 1;
            else if (r.status === 'ACTIVE') out.active += 1;
            else if (r.status === 'READY') out.ready += 1;
            else if (r.status === 'PROCESSING') out.processing += 1;
            else if (r.status === 'QUEUED') out.queued += 1;
            else if (r.status === 'FAILED') out.failed += 1;
          }
          return out;
        };
        return res.status(200).json({
          ok: true,
          manifest: 'AW_VISUAL_FOUNDATION_V1',
          p0: tally(P0_SLOT_KEYS),
          p1: tally(P1_SLOT_KEYS),
          p2: tally(P2_SLOT_KEYS),
        });
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

      if (postAction === 'generate-missing' || postAction === 'dispatch-p0') {
        const result = await dispatchP0Batch(origin);
        return res.status(200).json({ ok: true, batch: 'P0', ...result });
      }

      if (postAction === 'dispatch-p1') {
        const result = await dispatchP1Batch(origin);
        return res.status(200).json({ ok: true, batch: 'P1', ...result });
      }

      if (postAction === 'dispatch-p2') {
        const result = await dispatchP2Batch(origin);
        return res.status(200).json({ ok: true, batch: 'P2', ...result });
      }

      if (postAction === 'activate') {
        const slotKey = String(body.slotKey ?? '').trim();
        const result = activateFounderAsset(slotKey);
        return res.status(result.ok ? 200 : 409).json({ ok: result.ok, ...result });
      }

      if (postAction === 'regenerate') {
        const slotKey = String(body.slotKey ?? '').trim();
        const result = await supersedeAndRegenerate(slotKey, origin);
        return res.status(result.ok ? 200 : 409).json({ ok: result.ok, ...result });
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
