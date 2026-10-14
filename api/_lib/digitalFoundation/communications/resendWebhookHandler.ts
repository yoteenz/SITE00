import { createHmac, timingSafeEqual } from 'node:crypto';
import * as mem from '../memoryStore.js';
import type { SendIntentStatus } from '../../../../shared/site00-digital-foundation/communications/types.js';

function webhookSecret(): string | null {
  const raw = process.env.RESEND_WEBHOOK_SECRET?.trim() || process.env.SITE00_RESEND_WEBHOOK_SECRET?.trim();
  return raw || null;
}

export function resendWebhookSecretConfigured(): boolean {
  return Boolean(webhookSecret());
}

/** Svix-style signature verification (Resend webhooks). */
export function verifyResendWebhookSignature(rawBody: string, headers: Record<string, string | string[] | undefined>): boolean {
  const secret = webhookSecret();
  if (!secret) return false;

  const msgId = String(headers['svix-id'] ?? headers['webhook-id'] ?? '');
  const timestamp = String(headers['svix-timestamp'] ?? headers['webhook-timestamp'] ?? '');
  const signatureHeader = String(headers['svix-signature'] ?? headers['webhook-signature'] ?? '');
  if (!msgId || !timestamp || !signatureHeader) return false;

  const signedContent = `${msgId}.${timestamp}.${rawBody}`;
  const secretBytes = secret.startsWith('whsec_') ? Buffer.from(secret.slice(6), 'base64') : Buffer.from(secret, 'utf8');

  for (const part of signatureHeader.split(' ')) {
    const [version, sig] = part.split(',');
    if (version !== 'v1' || !sig) continue;
    const expected = createHmac('sha256', secretBytes).update(signedContent).digest('base64');
    try {
      const a = Buffer.from(sig, 'base64');
      const b = Buffer.from(expected, 'base64');
      if (a.length === b.length && timingSafeEqual(a, b)) return true;
    } catch {
      /* try next */
    }
  }
  return false;
}

type ResendWebhookPayload = {
  type?: string;
  data?: { email_id?: string; to?: string[]; bounce?: { message?: string } };
};

function mapEventToStatus(type: string | undefined): SendIntentStatus | null {
  switch (type) {
    case 'email.delivered':
      return 'DELIVERED';
    case 'email.bounced':
      return 'BOUNCED';
    case 'email.complained':
      return 'COMPLAINED';
    case 'email.sent':
      return 'SENT';
    default:
      return null;
  }
}

export function applyResendWebhookEvent(payload: ResendWebhookPayload): { updated: boolean; intent_id?: string; status?: SendIntentStatus } {
  const providerId = payload.data?.email_id;
  if (!providerId) return { updated: false };

  const nextStatus = mapEventToStatus(payload.type);
  if (!nextStatus) return { updated: false };

  const state = mem.getDfMemoryState();
  const intent = [...state.sendIntents.values()].find((i) => i.provider_message_id === providerId);
  if (!intent) return { updated: false };

  intent.status = nextStatus;
  intent.provider_status_at = new Date().toISOString();
  if (nextStatus === 'BOUNCED' && payload.data?.bounce?.message) {
    intent.last_error = payload.data.bounce.message;
  }
  return { updated: true, intent_id: intent.intent_id, status: nextStatus };
}
