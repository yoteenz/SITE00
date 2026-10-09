/**
 * SITE 00 — Invitation system founder / partner reporting (privileged).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import {
  getFounderReviewSnapshot,
  getPartnerReporting,
  issueActivationVerificationSecretForTests,
  listPartners,
  recordConversionEvent,
} from '../_lib/invitationSystem/service.js';
import { aioOfficeInvitationCodeValue, invitationPublicUrl } from '../../shared/site00-invitation-system/index.js';
import { renderInvitationQrSvg } from '../../shared/site00-invitation-system/qr.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const action = String(req.query.action ?? '');
  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};

  try {
    if (req.method === 'GET') {
      switch (action) {
        case 'founder-review':
          return res.status(200).json(getFounderReviewSnapshot());
        case 'partners':
          return res.status(200).json({ partners: listPartners() });
        case 'partner-report': {
          const partner_id = String(req.query.partner_id ?? '');
          const from = String(req.query.from ?? '1970-01-01T00:00:00.000Z');
          const to = String(req.query.to ?? new Date().toISOString());
          const report = getPartnerReporting(partner_id, from, to);
          if (!report) return res.status(404).json({ error: 'Partner not found' });
          return res.status(200).json(report);
        }
        case 'qr-asset': {
          const origin = String(req.query.origin ?? 'https://site00.com');
          const code = String(req.query.code ?? aioOfficeInvitationCodeValue());
          const url = invitationPublicUrl(origin, code);
          const svg = await renderInvitationQrSvg({ destinationUrl: url });
          return res.status(200).json({ destination_url: url, svg });
        }
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    if (req.method === 'POST') {
      switch (String(body.action ?? action)) {
        case 'test-set-activation-secret': {
          if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({ error: 'Not available in production' });
          }
          issueActivationVerificationSecretForTests(String(body.activation_id), String(body.secret));
          return res.status(200).json({ ok: true });
        }
        case 'record-conversion-event':
          return res.status(200).json(
            recordConversionEvent({
              event_type: body.event_type,
              partner_id: String(body.partner_id),
              campaign_id: String(body.campaign_id),
              activation_id: String(body.activation_id),
              foundation_artifact_id: body.foundation_artifact_id ? String(body.foundation_artifact_id) : null,
              payment_id: body.payment_id ? String(body.payment_id) : null,
              eligible_amount_minor: Number(body.eligible_amount_minor ?? 0),
              idempotency_key: String(body.idempotency_key),
            }),
          );
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/admin/site00-invitation]', err);
    return res.status(500).json({ error: 'Invitation admin unavailable' });
  }
}
