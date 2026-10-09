/**
 * SITE 00 — Invitation resolution + secure activation (no PII in URL).
 */
import { createHash } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  beginSecureActivation,
  buildEntryPresentation,
  completeVerifiedActivation,
  issueDevelopmentVerificationCode,
  recordInvitationVisit,
  resolveInvitationCode,
  verificationDeliveryMode,
} from '../_lib/invitationSystem/service.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function codeFromReq(req: VercelRequest): string {
  return String(req.query.code ?? req.body?.code ?? '').trim();
}

function visitorKey(req: VercelRequest): string {
  const header = req.headers['x-site00-visitor-key'];
  if (typeof header === 'string' && header.length >= 8) return header.slice(0, 128);
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : 'anonymous';
  return createVisitorKey(ip, req.headers['user-agent'] as string | undefined);
}

function createVisitorKey(ip: string, userAgent?: string): string {
  return createHash('sha256').update(`${ip}:${userAgent ?? ''}`).digest('hex').slice(0, 32);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const action = String(req.query.action ?? req.body?.action ?? 'resolve');
  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};

  try {
    if (req.method === 'GET') {
      const code = codeFromReq(req);
      if (!code) return res.status(400).json({ error: 'code required' });
      const resolved = resolveInvitationCode(code);
      if (action === 'resolve') {
        const visit = recordInvitationVisit({
          code,
          visitor_key: visitorKey(req),
          user_agent: (req.headers['user-agent'] as string) ?? null,
          referrer: (req.headers.referer as string) ?? null,
        });
        return res.status(200).json({
          presentation: buildEntryPresentation({ code, visit_id: visit.visit?.visit_id ?? null }),
          visit_id: visit.visit?.visit_id ?? null,
          resolution: visit.resolution,
          valid: resolved.ok,
          verification_delivery: verificationDeliveryMode(),
          persistence: 'IN_MEMORY' as const,
        });
      }
      return res.status(400).json({ error: 'Unknown action' });
    }

    if (req.method === 'POST') {
      const code = codeFromReq(req);
      if (!code) return res.status(400).json({ error: 'code required' });

      switch (action) {
        case 'visit': {
          const visit = recordInvitationVisit({
            code,
            visitor_key: String(body.visitor_key ?? visitorKey(req)),
            user_agent: (body.user_agent as string) ?? (req.headers['user-agent'] as string) ?? null,
            referrer: (body.referrer as string) ?? null,
          });
          return res.status(200).json({
            visit_id: visit.visit?.visit_id ?? null,
            presentation: buildEntryPresentation({ code, visit_id: visit.visit?.visit_id ?? null }),
          });
        }
        case 'begin-activation': {
          const visit_id = String(body.visit_id ?? '');
          const contact_email = String(body.contact_email ?? '');
          if (!visit_id || !contact_email.includes('@')) {
            return res.status(400).json({ error: 'visit_id and contact_email required' });
          }
          const begun = beginSecureActivation({ code, visit_id, contact_email });
          if (!begun.ok) return res.status(400).json({ error: begun.error });
          const verification_delivery = verificationDeliveryMode();
          return res.status(200).json({
            activation_id: begun.activation_id,
            verification_required: true,
            verification_delivery,
            development_verification_code:
              verification_delivery === 'DEVELOPMENT_INLINE'
                ? issueDevelopmentVerificationCode(begun.activation_id)
                : null,
            presentation: buildEntryPresentation({ code, activation_id: begun.activation_id }),
          });
        }
        case 'complete-activation': {
          const activation_id = String(body.activation_id ?? '');
          const verification_secret = String(body.verification_secret ?? '');
          if (!activation_id || !verification_secret) {
            return res.status(400).json({ error: 'activation_id and verification_secret required' });
          }
          const done = completeVerifiedActivation({
            activation_id,
            verification_secret,
            verified_client_id: body.verified_client_id ? String(body.verified_client_id) : null,
          });
          if (!done.ok) return res.status(403).json({ error: done.error ?? 'Activation failed' });
          return res.status(200).json({
            foundation_route: `/foundation/${done.foundation_token}`,
            attribution_id: done.attribution_id,
            presentation: buildEntryPresentation({ code, activation_id }),
          });
        }
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/site00/invitation]', err);
    return res.status(500).json({ error: 'Invitation system unavailable' });
  }
}
