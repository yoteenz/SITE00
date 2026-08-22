import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyStudioWorldWebhookSignature, type StudioWorldWebhookPayload } from '../_lib/marketingEngagements/vaultHandoff.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Studio-World-Signature, X-Studio-World-Event');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
  const signature = req.headers['x-studio-world-signature'] as string | undefined;

  if (!verifyStudioWorldWebhookSignature(rawBody, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let event: StudioWorldWebhookPayload;
  try {
    event = typeof req.body === 'object' && req.body !== null ? (req.body as StudioWorldWebhookPayload) : JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  try {
    const { processStudioWorldWebhook } = await import('../_lib/marketingEngagements/webhookHandler.js');
    const result = await processStudioWorldWebhook(event);
    return res.status(200).json(result);
  } catch (e) {
    console.error('[studio-world-webhook]', e);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
