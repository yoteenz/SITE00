/**
 * Resend webhook — Digital Foundation send intent delivery status (server-side only).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  applyResendWebhookEvent,
  verifyResendWebhookSignature,
} from '../_lib/digitalFoundation/communications/resendWebhookHandler.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req: VercelRequest): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req as unknown as AsyncIterable<Buffer>) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const raw =
      typeof req.body === 'string'
        ? req.body
        : Buffer.isBuffer(req.body)
          ? req.body.toString('utf8')
          : await readRawBody(req);

    if (!verifyResendWebhookSignature(raw, req.headers as Record<string, string | string[] | undefined>)) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const payload = JSON.parse(raw) as Parameters<typeof applyResendWebhookEvent>[0];
    const result = applyResendWebhookEvent(payload);
    return res.status(200).json({ ok: true, ...result });
  } catch (e) {
    console.error('[digital-foundation-resend-webhook]', e);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
