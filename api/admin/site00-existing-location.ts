/**
 * Founder/admin — Existing Location cases, quotes, courtesy codes.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { isAdminEmail } from '../_lib/adminAuth.js';
import {
  createCourtesyCode,
  createQuoteForCase,
  getCasePayload,
  listFounderQueue,
  markAccessConnected,
} from '../_lib/existingLocation/service.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const user = await getAuthUser(req);
  if (!user?.email || !isAdminEmail(user.email)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const action = String(req.query.action ?? '');
  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};

  try {
    if (req.method === 'GET') {
      if (action === 'queue') return res.status(200).json({ cases: listFounderQueue() });
      if (action === 'get') {
        const id = String(req.query.id ?? '');
        const payload = getCasePayload(id);
        if (!payload) return res.status(404).json({ error: 'Not found' });
        return res.status(200).json(payload);
      }
      return res.status(400).json({ error: 'Unknown action' });
    }

    if (req.method === 'POST') {
      const postAction = String(body.action ?? action);
      switch (postAction) {
        case 'connect-access':
          return res.status(200).json({ case: markAccessConnected(String(body.id), 'FOUNDER') });
        case 'create-quote':
          return res.status(200).json(
            createQuoteForCase(String(body.id), {
              line_items: body.line_items ?? [],
              basis_notes: String(body.basis_notes ?? ''),
              diagnosis_fee_cents: body.diagnosis_fee_cents ? Number(body.diagnosis_fee_cents) : 0,
            }),
          );
        case 'create-courtesy-code': {
          const record = createCourtesyCode({
            raw_code: String(body.raw_code),
            display_label: String(body.display_label ?? 'Courtesy'),
            discount_type: body.discount_type ?? 'FULL_CASE_COMP',
            discount_value: Number(body.discount_value ?? 100),
            eligible_email: body.eligible_email ? String(body.eligible_email) : null,
            eligible_client_id: body.eligible_client_id ? String(body.eligible_client_id) : null,
            max_redemptions: body.max_redemptions ? Number(body.max_redemptions) : 1,
            expires_at: body.expires_at ? String(body.expires_at) : null,
            founder_note: body.founder_note ? String(body.founder_note) : '',
            created_by: user!.email!,
          });
          return res.status(200).json({
            courtesy: { id: record.id, display_label: record.display_label, active: record.active },
          });
        }
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
}
