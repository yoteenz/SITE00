/**
 * Admin — client world intake invites.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import {
  createClientIntakeInvite,
  getClientIntakeIntelligence,
  listClientIntakeInvites,
  markReadyForFutureWorldFormation,
  regenerateClientIntakeLink,
  revokeClientIntakeInvite,
} from '../_lib/site00WorldIntake/worldIntakeService.js';
import type { CreateIntakeInviteInput } from '../../shared/site00-world-intake/types.js';

function parseBody(req: VercelRequest): Record<string, unknown> | null {
  if (!req.body) return null;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return req.body as Record<string, unknown>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) return res.status(auth.failure.status).json({ error: auth.failure.error });

  try {
    const action = String(req.query.action ?? (req.method === 'GET' ? 'list' : ''));

    if (action === 'list' && req.method === 'GET') {
      const intakes = await listClientIntakeInvites();
      return res.status(200).json({ ok: true, intakes });
    }

    if (action === 'create' && req.method === 'POST') {
      const body = parseBody(req) ?? {};
      const input: CreateIntakeInviteInput = {
        projectDisplayName: String(body.projectDisplayName ?? ''),
        recipientLabel: String(body.recipientLabel ?? ''),
        experienceAmbition: (body.experienceAmbition as CreateIntakeInviteInput['experienceAmbition']) ?? 'UNSURE',
        recipientEmail: body.recipientEmail ? String(body.recipientEmail) : null,
        createdBy: auth.user.email ?? null,
      };
      if (!input.projectDisplayName || !input.recipientLabel) {
        return res.status(400).json({ ok: false, error: 'projectDisplayName and recipientLabel required' });
      }
      const result = await createClientIntakeInvite(input);
      return res.status(200).json({
        ok: true,
        invite: result.invite,
        privateLink: result.privateLink,
      });
    }

    if (action === 'revoke' && req.method === 'POST') {
      const body = parseBody(req) ?? {};
      const inviteId = String(body.inviteId ?? '');
      const invite = await revokeClientIntakeInvite(inviteId);
      return res.status(200).json({ ok: true, invite });
    }

    if (action === 'regenerate' && req.method === 'POST') {
      const body = parseBody(req) ?? {};
      const inviteId = String(body.inviteId ?? '');
      const result = await regenerateClientIntakeLink(inviteId);
      return res.status(200).json({ ok: true, privateLink: result.privateLink, invite: result.invite });
    }

    if (action === 'intelligence' && req.method === 'GET') {
      const inviteId = String(req.query.inviteId ?? '');
      const intel = await getClientIntakeIntelligence(inviteId);
      if (!intel) return res.status(404).json({ ok: false, error: 'Not found' });
      return res.status(200).json({ ok: true, ...intel });
    }

    if (action === 'mark-world-ready' && req.method === 'POST') {
      const body = parseBody(req) ?? {};
      const inviteId = String(body.inviteId ?? '');
      const intel = await markReadyForFutureWorldFormation(inviteId);
      return res.status(200).json({ ok: true, ...intel });
    }

    return res.status(400).json({ ok: false, error: 'Unknown action' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, error: message });
  }
}
