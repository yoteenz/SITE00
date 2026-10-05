/**
 * SITE 00 — Identity commercial authorization + project bootstrap (no Stripe).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getIntakeForAccess } from '../_lib/site00Intakes/intakeService.js';
import {
  authorizeIdentityIntakeCommercial,
  convertIdentityIntakeToProject,
  ensureIdentityCommercialFromIntake,
  loadIdentityCommercialState,
} from '../_lib/site00Intakes/identityCommercial.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const action = String(req.query.action ?? '');
  const intakeId = String(req.query.intakeId ?? req.body?.intakeId ?? '');

  try {
    const user = await getAuthUser(req);
    const guestToken = String(req.body?.guestToken ?? req.query.guestToken ?? '');

    if (req.method === 'GET' && action === 'status') {
      if (!intakeId) return res.status(400).json({ error: 'intakeId required' });
      const state = await loadIdentityCommercialState(intakeId);
      return res.status(200).json({ ok: true, state });
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    if (!intakeId) return res.status(400).json({ error: 'intakeId required' });

    let ctx:
      | { kind: 'AUTHENTICATED'; userId: string }
      | { kind: 'GUEST'; tokenIntakeType: 'IDENTITY'; tokenIntakeId: string }
      | { kind: 'ANONYMOUS_DIRECT' };
    if (user) ctx = { kind: 'AUTHENTICATED', userId: user.id };
    else if (guestToken) {
      const { resolveGuestAccessToken } = await import('../_lib/site00Intakes/tokens.js');
      const resolution = await resolveGuestAccessToken(guestToken);
      if (!resolution.ok) return res.status(403).json({ error: 'Invalid guest token' });
      ctx = {
        kind: 'GUEST',
        tokenIntakeType: 'IDENTITY',
        tokenIntakeId: resolution.token.intakeId,
      };
    } else ctx = { kind: 'ANONYMOUS_DIRECT' };

    const intake = await getIntakeForAccess('IDENTITY', intakeId, ctx);

    switch (action) {
      case 'ensure-commercial': {
        const state = await ensureIdentityCommercialFromIntake(intake);
        return res.status(200).json({ ok: true, state });
      }
      case 'authorize': {
        const ref = String(req.body?.authorizationRef ?? `auth-${intakeId}`);
        const state = await authorizeIdentityIntakeCommercial(intake, ref);
        return res.status(200).json({ ok: true, state, paymentPipelineReady: true });
      }
      case 'bootstrap-project': {
        if (!user?.email?.includes('@')) {
          return res.status(403).json({ error: 'Authenticated operator required for bootstrap' });
        }
        await authorizeIdentityIntakeCommercial(intake, `bootstrap-${intakeId}`);
        const result = await convertIdentityIntakeToProject(intake, user.email);
        return res.status(200).json({ ok: true, ...result });
      }
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Identity commercial error';
    return res.status(500).json({ error: message });
  }
}
