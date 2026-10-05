import type { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'node:path';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import {
  dispatchJurnlProductionRequest,
  registerJurnlManualProviderOutput,
  type JurnlProductionDispatchInput,
} from '../../shared/site00-jurnl-production/index.js';
import {
  issueSpendAuthorization,
  resetSpendAuthorizationStoreForTests,
} from '../../shared/site00-production-guardrails/providerGateway/spendAuthorization.js';

const REPO_ROOT = path.resolve(process.cwd());

/**
 * JURNL production gateway (admin only). No direct OpenArt API — dry-run precheck or manual-output registration.
 * POST ?action=issue-spend-authorization|dispatch-dry-run|register-manual-output
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

  const action = String(req.query.action ?? req.body?.action ?? '').trim();

  try {
    if (req.method === 'POST' && action === 'issue-spend-authorization') {
      const body = req.body ?? {};
      const record = issueSpendAuthorization({
        projectId: 'JURNL',
        actorId: auth.email ?? 'admin',
        provider: String(body.provider ?? 'OpenArt'),
        model: String(body.model ?? 'gpt-image-2-5-sunburst'),
        generationClass: body.generationClass ?? 'SCREEN_PARENT',
        maxCredits: Number(body.maxCredits ?? 500),
        purpose: String(body.purpose ?? 'jurnl-production'),
      });
      return res.status(200).json({ ok: true, authorization: record });
    }

    if (req.method === 'POST' && action === 'dispatch-dry-run') {
      const body = req.body ?? {};
      const input: JurnlProductionDispatchInput = {
        requestId: String(body.requestId ?? `jurnl-${Date.now()}`),
        familyId: String(body.familyId),
        visualId: String(body.visualId),
        screenId: body.screenId ?? null,
        assetId: body.assetId ?? null,
        role: body.role,
        generationIntent: body.generationIntent ?? 'DERIVED',
        generationMode: body.generationMode,
        referenceAuthorityIdHint: body.referenceAuthorityIdHint ?? null,
        referenceAbsolutePath: body.referenceAbsolutePath ?? null,
        derivationSourceType: body.derivationSourceType ?? null,
        spendAuthorizationId: String(body.spendAuthorizationId),
        requestedBy: auth.email ?? 'admin',
        purpose: body.purpose,
        estimatedCostCredits: body.estimatedCostCredits ?? null,
        canonicalFinal: body.canonicalFinal,
        dryRun: true,
        idempotencyKey: body.idempotencyKey ?? null,
      };
      const result = await dispatchJurnlProductionRequest(REPO_ROOT, input);
      return res.status(200).json({ ok: true, result });
    }

    if (req.method === 'POST' && action === 'register-manual-output') {
      const body = req.body ?? {};
      const out = await registerJurnlManualProviderOutput(REPO_ROOT, {
        requestId: String(body.requestId),
        familyId: String(body.familyId),
        visualId: String(body.visualId),
        role: body.role,
        generationMode: body.generationMode,
        referenceAuthorityIdHint: body.referenceAuthorityIdHint ?? null,
        outputAbsolutePath: path.resolve(REPO_ROOT, String(body.outputRelativePath)),
        outputAssetId: body.outputAssetId ?? null,
        providerGenerationId: body.providerGenerationId ?? null,
        actualCredits: body.actualCredits ?? null,
        spendAuthorizationId: body.spendAuthorizationId ?? null,
        derivationSourceType: body.derivationSourceType ?? null,
      });
      return res.status(200).json({ ok: out.status === 'REGISTERED', ...out });
    }

    if (process.env.VITEST === 'true' && action === 'reset-spend-store') {
      resetSpendAuthorizationStoreForTests();
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action', action });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return res.status(500).json({ error: message });
  }
}
