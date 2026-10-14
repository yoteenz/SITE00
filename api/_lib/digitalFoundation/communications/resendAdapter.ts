/**
 * Resend transactional adapter — server-side only. Never import from client bundles.
 */

export type ResendSendInput = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  idempotencyKey?: string;
};

export type ResendSendResult =
  | { ok: true; providerMessageId: string; status: 'ACCEPTED' }
  | { ok: false; error: string; status: 'FAILED' };

export function resendApiKeyConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendViaResend(input: ResendSendInput): Promise<ResendSendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: 'RESEND_API_KEY not configured', status: 'FAILED' };
  }

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
    if (input.idempotencyKey) headers['Idempotency-Key'] = input.idempotencyKey;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        from: input.from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: input.replyTo,
      }),
    });

    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) {
      return { ok: false, error: body.message ?? `Resend HTTP ${res.status}`, status: 'FAILED' };
    }
    if (!body.id) {
      return { ok: false, error: 'Resend response missing id', status: 'FAILED' };
    }
    return { ok: true, providerMessageId: body.id, status: 'ACCEPTED' };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Resend request failed', status: 'FAILED' };
  }
}
