/**
 * Stripe webhook — Digital Foundation payment confirmation (server-side only).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { processDigitalFoundationStripeEvent, verifyStripeSignature } from '../_lib/digitalFoundation/payment/webhookHandler.js';

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

    const sig = req.headers['stripe-signature'] as string | undefined;
    if (!verifyStripeSignature(raw, sig)) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(raw) as { id: string; type: string; data: { object: Record<string, unknown> } };
    const result = await processDigitalFoundationStripeEvent(event);
    return res.status(200).json(result);
  } catch (e) {
    console.error('[digital-foundation-stripe-webhook]', e);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
