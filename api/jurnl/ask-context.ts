import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';

/** POST /api/jurnl/ask-context — validates minimized Ask context (no live AI provider required). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
  const familyId = String(body.familyId ?? '').trim();
  const nodeId = String(body.nodeId ?? '').trim();
  const route = String(body.route ?? '').trim();
  const consentGranted = Boolean(body.consentGranted);
  const completeness = String(body.completeness ?? 'UNKNOWN');
  const obligationCount = Number(body.obligationCount ?? 0);
  const displayCurrency = String(body.displayCurrency ?? 'USD');

  if (!familyId || !nodeId) return res.status(400).json({ error: 'familyId and nodeId required' });

  if (!consentGranted) {
    return res.status(200).json({
      state: 'NO_CONTEXT',
      headline: 'ASK JURNL CONTEXT DISABLED',
      body: 'ENABLE ASK JURNL CONTEXT IN ACCOUNT SETTINGS.',
      provider: 'NONE',
    });
  }

  const hasProvider = Boolean(process.env.ANTHROPIC_API_KEY || process.env.JURNL_ASK_PROVIDER_URL);
  return res.status(200).json({
    state: 'READY',
    headline: 'STRUCTURED CONTEXT ACCEPTED',
    body: `${familyId} · ${nodeId} · ${route || 'ROUTE'} · ${completeness} · ${obligationCount} OBLIGATIONS · ${displayCurrency}. SERVER REDACTS RAW LEDGER AND SECRETS.`,
    provider: hasProvider ? 'CONFIGURED' : 'NOT_CONFIGURED',
    liveGeneration: false,
  });
}
