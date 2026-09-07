/**
 * Expression Engine V0 API — entry resolution + readiness proof.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  bootstrapNdxbookExpressionProof,
  evaluateEntryProductionReadiness,
  resolveEntry,
} from '../_lib/site00ExpressionEngine/expressionEngineService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
    const brandId = String(req.query.brandId ?? body.brandId ?? '');
    const entryNumber = Number(req.query.entryNumber ?? body.entryNumber ?? 0);

    if (req.method === 'GET' && !brandId) {
      const proof = await bootstrapNdxbookExpressionProof();
      return res.status(200).json({
        engine: 'EXPRESSION_ENGINE_V0',
        entry001: {
          id: proof.entry001.id,
          title: proof.entry001.title,
          status: proof.entry001.status,
          formatCount: proof.entry001.formatExpressions.length,
        },
        entry002: {
          id: proof.entry002.id,
          title: proof.entry002.title,
          status: proof.entry002.status,
          assetsGenerated: proof.entry002.generationReceipts.length,
        },
        readiness001: evaluateEntryProductionReadiness(proof.entry001),
      });
    }

    if (!brandId || !entryNumber) {
      return res.status(400).json({ error: 'brandId and entryNumber required' });
    }

    const entry = await resolveEntry({
      brandId,
      projectId: String(req.query.projectId ?? body.projectId ?? brandId),
      entryNumber,
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found', brandId, entryNumber });
    }

    return res.status(200).json({
      entry,
      readiness: evaluateEntryProductionReadiness(entry),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Expression Engine error';
    return res.status(500).json({ error: message });
  }
}
