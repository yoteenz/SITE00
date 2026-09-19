import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import {
  fetchReaderAccount,
  patchReaderAccount,
  completeOnboardingStep,
  resolveAstralAccountRole,
} from '../_lib/site00AstralWorld/readerAccountService.js';
import type { ReaderOnboardingStep } from '../../shared/site00-astral-world/readerAccount/types.js';

function parseBody(req: VercelRequest): Record<string, unknown> {
  const b = req.body;
  if (typeof b === 'string') {
    try {
      return JSON.parse(b) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return b && typeof b === 'object' ? (b as Record<string, unknown>) : {};
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const user = await getAuthUser(req);
  const userId = user?.id ?? 'demo-reader-user';
  const action = String(req.query.action ?? '');

  if (req.method === 'GET') {
    const profile = fetchReaderAccount(userId);
    const role = resolveAstralAccountRole(userId, user?.role ?? null);
    return res.status(200).json({ ok: true, role, profile });
  }

  if (req.method === 'PATCH') {
    const body = parseBody(req);
    const profile = patchReaderAccount(userId, body as Partial<import('../../shared/site00-astral-world/readerAccount/types.js').ReaderAccountProfile>);
    return res.status(200).json({ ok: true, profile });
  }

  if (req.method === 'POST' && action === 'advance-onboarding') {
    const body = parseBody(req);
    const step = String(body.step ?? 'WELCOME') as ReaderOnboardingStep;
    const profile = completeOnboardingStep(
      userId,
      step,
      body.patch as Partial<import('../../shared/site00-astral-world/readerAccount/types.js').ReaderAccountProfile> | undefined,
    );
    return res.status(200).json({ ok: true, profile });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
