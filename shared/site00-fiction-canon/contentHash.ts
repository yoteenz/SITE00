import crypto from 'node:crypto';

export function hashCanonContent(payload: string | Record<string, unknown>): string {
  const stable =
    typeof payload === 'string' ? payload : JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHash('sha256').update(stable).digest('hex');
}
