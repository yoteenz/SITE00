/**
 * POST /api/jurnl/bank-webhook — provider webhooks. No session: authenticity comes from the provider's signed JWT
 * (Plaid-Verification header), checked against the exact raw body. Unverified deliveries are recorded and refused.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleWebhook } from '../_lib/jurnlBanking/bankingService.js';
import { getBankingDeps } from '../_lib/jurnlBanking/runtime.js';

export const config = { api: { bodyParser: false } };

async function readRawBody(req: VercelRequest): Promise<string> {
  const pre = (req as unknown as { rawBody?: string | Buffer }).rawBody;
  if (typeof pre === 'string') return pre;
  if (Buffer.isBuffer(pre)) return pre.toString('utf8');
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  const chunks: Buffer[] = [];
  for await (const chunk of req as unknown as AsyncIterable<Buffer>) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const deps = await getBankingDeps();
  if (!deps) return res.status(503).json({ error: 'BANKING_NOT_CONFIGURED' });
  const raw = await readRawBody(req);
  try {
    const r = await handleWebhook(deps, raw, req.headers as Record<string, string | string[] | undefined>);
    return res.status(r.httpStatus).json(r.body);
  } catch {
    // Non-200 lets the provider retry delivery later.
    return res.status(500).json({ error: 'WEBHOOK_PROCESSING_FAILED' });
  }
}
