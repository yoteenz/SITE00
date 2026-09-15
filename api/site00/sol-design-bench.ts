import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFile } from 'node:fs/promises';
import { handleTwinV2VisualConceptCors } from '../_lib/site00TwinV2/twinV2VisualConceptCors.js';
import type { StartSolDesignBenchRequest } from '../../shared/site00-sol-design-bench/contracts.js';
import { SolDesignBenchModelContract } from '../../shared/site00-sol-design-bench/modelContract.js';
import {
  getSolDesignBenchRun,
  getSolDesignBenchProviderReadiness,
  readSolDesignBenchPreview,
  retrySolDesignBenchRun,
  SolDesignBenchProviderBlockedError,
  startSolDesignBenchRun,
} from '../_lib/site00SolDesignBench/service.js';
import { SOL_PROMPT_HASH, SOL_PROMPT_VERSION } from '../_lib/site00SolDesignBench/provider.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTwinV2VisualConceptCors(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const runId = typeof req.query.runId === 'string' ? req.query.runId : '';
    if (!runId) {
      res.status(200).json({
        ok: true,
        service: 'sol-design-bench',
        model: 'GPT-5.6 SOL',
        provider: SolDesignBenchModelContract.providerLabel,
        modelId: SolDesignBenchModelContract.modelId,
        reasoningEffort: SolDesignBenchModelContract.reasoningEffort,
        fallbackAllowed: SolDesignBenchModelContract.fallbackAllowed,
        webSearchEnabled: SolDesignBenchModelContract.webSearchAllowed,
        providerReadiness: getSolDesignBenchProviderReadiness(),
        promptVersion: SOL_PROMPT_VERSION,
        promptHash: SOL_PROMPT_HASH,
        composerInvokedDuringTest: false,
        grokOutputAccessed: false,
      });
      return;
    }
    const run = await getSolDesignBenchRun(runId);
    if (!run) {
      res.status(404).json({ error: 'SOL_RUN_NOT_FOUND' });
      return;
    }
    if (req.query.reference === '1') {
      try {
        const bytes = await readFile(run.authority.storedFile);
        res.setHeader('Content-Type', run.authority.mime);
        res.setHeader('Content-Length', String(bytes.length));
        res.status(200).end(bytes);
      } catch {
        res.status(404).json({ error: 'SOL_REFERENCE_NOT_FOUND' });
      }
      return;
    }
    if (req.query.preview === '1') {
      try {
        const bytes = await readSolDesignBenchPreview(runId);
        res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
        res.setHeader('Content-Length', String(bytes.length));
        res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
        res.status(200).end(bytes);
      } catch {
        res.status(404).json({ error: 'SOL_VISUAL_PREVIEW_NOT_FOUND' });
      }
      return;
    }
    res.status(200).json({ ok: true, run });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const body = req.body as StartSolDesignBenchRequest | {
    action: 'RETRY_SOL_TEST';
    sourceRunId: string;
  };
  if (body?.action === 'RETRY_SOL_TEST') {
    try {
      const run = await retrySolDesignBenchRun(body.sourceRunId);
      res.status(202).json({ ok: true, run });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(message.includes('NOT_FOUND') ? 404 : 422).json({
        error: message,
        code: 'SOL_RETRY_FAILED',
      });
    }
    return;
  }
  if (body?.action !== 'START_SOL_TEST' || !body.reference) {
    res.status(400).json({ error: 'SOL_REFERENCE_REQUIRED' });
    return;
  }

  try {
    const run = await startSolDesignBenchRun(body);
    res.status(202).json({ ok: true, run });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const readiness = error instanceof SolDesignBenchProviderBlockedError
      ? error.receipt
      : undefined;
    res.status(readiness ? 503 : message.startsWith('SOL_REFERENCE_') ? 422 : 500).json({
      error: message,
      code: readiness
        ? 'SOL_PROVIDER_READINESS_BLOCKED'
        : message.startsWith('SOL_REFERENCE_')
          ? 'SOL_REFERENCE_INVALID'
          : 'SOL_RUN_FAILED',
      readiness,
    });
  }
}
