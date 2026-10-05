/**
 * SITE 00 — secure guest intake access resolution.
 *
 * GET /api/site00/intake-access?token=... — repository-equivalent of the conceptual
 * `/api/site00/intake-access/:token` (this codebase does not use Vercel dynamic path segments;
 * every other SITE 00 API resource follows the same query-param convention — see
 * api/site00/marketing-engagements.ts). The client-side guest route `/intake/access/:token`
 * extracts the token from its own path and calls this endpoint with it as a query param.
 *
 * Never logs the raw token or guest email.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveIntakeByGuestToken } from '../_lib/site00Intakes/intakeService.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = String(req.query.token ?? '');
  if (!token) return res.status(400).json({ error: 'token required' });

  try {
    const resolution = await resolveIntakeByGuestToken(token);
    if (!resolution.ok) {
      const status = resolution.reason === 'NOT_FOUND' ? 404 : 403;
      return res.status(status).json({ error: 'ACCESS LINK INVALID OR EXPIRED', reason: resolution.reason });
    }
    return res.status(200).json({ intake: resolution.intake, guestToken: token });
  } catch (e) {
    console.error('[site00/intake-access] resolution failed', e instanceof Error ? e.message : e);
    return res.status(500).json({ error: 'We could not resolve this access link. Try again.' });
  }
}
