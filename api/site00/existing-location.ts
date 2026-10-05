/**
 * SITE 00 — Existing Location service (client-facing).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import type { ExistingLocationPlatform, ExistingLocationRequestType } from '../../shared/site00-existing-location/types.js';
import {
  clientApproveQuote,
  completeCheckout,
  createCase,
  getCasePayload,
  previewCourtesyCode,
  submitIntake,
  updateCaseIntake,
} from '../_lib/existingLocation/service.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const action = String(req.query.action ?? '');
  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
  const user = await getAuthUser(req);

  try {
    if (req.method === 'GET') {
      if (action === 'get') {
        const id = String(req.query.id ?? '');
        if (!id) return res.status(400).json({ error: 'id required' });
        const payload = getCasePayload(id);
        if (!payload) return res.status(404).json({ error: 'Case not found' });
        return res.status(200).json(payload);
      }
      return res.status(400).json({ error: 'Unknown action' });
    }

    if (req.method === 'POST') {
      const postAction = String(body.action ?? action);
      switch (postAction) {
        case 'start':
          return res.status(200).json({
            case: createCase({
              client_user_id: user?.id ?? null,
              client_email: user?.email ?? (body.email ? String(body.email) : null),
            }),
          });
        case 'update-intake': {
          const id = String(body.id ?? '');
          const updated = updateCaseIntake(id, {
            request_type: body.request_type as ExistingLocationRequestType | undefined,
            platform: body.platform as ExistingLocationPlatform | undefined,
            site_url: body.site_url ? String(body.site_url) : undefined,
            client_description: body.client_description ? String(body.client_description) : undefined,
            expected_behavior: body.expected_behavior ? String(body.expected_behavior) : undefined,
            actual_behavior: body.actual_behavior ? String(body.actual_behavior) : undefined,
            enhancement_goal: body.enhancement_goal ? String(body.enhancement_goal) : undefined,
            evidence: Array.isArray(body.evidence) ? body.evidence : undefined,
          });
          return res.status(200).json({ case: updated });
        }
        case 'submit-intake':
          return res.status(200).json({ case: submitIntake(String(body.id)) });
        case 'approve-quote':
          return res.status(200).json({ case: clientApproveQuote(String(body.id)) });
        case 'preview-courtesy': {
          const preview = previewCourtesyCode(
            String(body.id),
            String(body.code ?? ''),
            user?.email ?? (body.email ? String(body.email) : null),
            user?.id ?? null,
          );
          if (!preview.ok) return res.status(400).json({ error: preview.reason });
          return res.status(200).json(preview);
        }
        case 'complete-checkout':
          return res.status(200).json({
            case: completeCheckout(
              String(body.id),
              body.code ? String(body.code) : undefined,
              user?.email ?? (body.email ? String(body.email) : null),
              user?.id ?? null,
            ),
          });
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Request failed';
    const status = msg.includes('NOT_FOUND') ? 404 : msg.includes('REQUIRED') || msg.includes('INCOMPLETE') ? 400 : 403;
    return res.status(status).json({ error: msg });
  }
}
