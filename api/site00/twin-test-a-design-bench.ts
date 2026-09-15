/**
 * P0.VR.DESIGNBENCH.GROK1 — isolated Grok visual translation job API.
 * Provider: xAI Grok only. No Composer / Sol / Test B access.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCaptureCorsHeaders, handleCaptureCorsPreflight } from '../_lib/site00Capture/captureCors.js';
import {
  getLatestPublicGrokDesignBenchRun,
  getPublicGrokDesignBenchRun,
  grokDesignBenchAccessProbe,
  grokDesignBenchAudit,
  grokDesignBenchHostIdentity,
  grokDesignBenchReadiness,
  startGrokDesignBenchRun,
} from '../_lib/site00GrokDesignBench/service.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCaptureCorsPreflight(req, res)) return;
  applyCaptureCorsHeaders(req, res);

  if (req.method === 'GET') {
    const query = req.query ?? {};
    const action = String(query.action ?? 'latest');
    if (action === 'audit' || action === 'provider_audit') {
      return res.status(200).json({ ok: true, audit: grokDesignBenchAudit() });
    }
    if (action === 'access_probe' || action === 'model_access') {
      const requestHost = typeof req.headers.host === 'string' ? req.headers.host : '';
      const access = await grokDesignBenchAccessProbe();
      return res.status(200).json({
        ok: true,
        ...access,
        hostDiagnostic: grokDesignBenchHostIdentity(requestHost),
      });
    }
    if (action === 'readiness') {
      const requestHost = typeof req.headers.host === 'string' ? req.headers.host : '';
      return res.status(200).json({
        ok: true,
        readiness: await grokDesignBenchReadiness(),
        hostDiagnostic: grokDesignBenchHostIdentity(requestHost),
      });
    }
    if (action === 'run') {
      const runId = String(query.runId ?? '');
      const run = runId ? getPublicGrokDesignBenchRun(runId) : null;
      if (!run) return res.status(404).json({ ok: false, error: 'RUN_NOT_FOUND' });
      return res.status(200).json({ ok: true, run });
    }
    const projectId = String(query.projectId ?? 'ndxbook');
    const run = getLatestPublicGrokDesignBenchRun(projectId);
    return res.status(200).json({ ok: true, run: run ?? null, audit: grokDesignBenchAudit() });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body) ?? {};
  const action = String(body.action ?? 'start');

  if (action === 'audit') {
    return res.status(200).json({ ok: true, audit: grokDesignBenchAudit() });
  }

  if (action !== 'start' && action !== 'start_run') {
    return res.status(400).json({ ok: false, error: 'UNKNOWN_ACTION' });
  }

  try {
    const run = await startGrokDesignBenchRun({
      projectId: String(body.projectId ?? 'ndxbook'),
      filename: String(body.filename ?? ''),
      mime: String(body.mime ?? ''),
      width: Number(body.width),
      height: Number(body.height),
      imageBase64: String(body.imageBase64 ?? '').replace(/^data:[^;]+;base64,/, ''),
      awaitCompletion: body.awaitCompletion === true && process.env.VITEST === 'true',
    });
    return res.status(202).json({ ok: true, run, async: run.stage !== 'COMPLETE' && run.stage !== 'FAILED' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'GROK_START_FAILED';
    const status = message.includes('XAI_API_KEY') || message.includes('GROK_4_6_PROVIDER_BINDING_FAILED') ? 503 : 400;
    return res.status(status).json({ ok: false, error: message });
  }
}
