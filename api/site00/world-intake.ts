/**
 * Guest world intake API — token-scoped, no account required.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  autosaveGuestIntake,
  resolveInviteByRawToken,
  submitGuestIntake,
} from '../_lib/site00WorldIntake/worldIntakeService.js';
import { WORLD_INTAKE_STEPS } from '../../shared/site00-world-intake/questions.js';

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const action = String(req.query.action ?? 'resolve');

    if (action === 'resolve' && req.method === 'GET') {
      const token = String(req.query.token ?? '');
      const resolved = await resolveInviteByRawToken(token);
      if (!resolved.ok) {
        return res.status(resolved.reason === 'NOT_FOUND' || resolved.reason === 'INVALID' ? 404 : 403).json({
          ok: false,
          error: resolved.reason,
        });
      }
      return res.status(200).json({
        ok: true,
        invite: {
          projectDisplayName: resolved.invite.projectDisplayName,
          recipientLabel: resolved.invite.recipientLabel,
          projectExperienceClass: resolved.invite.projectExperienceClass,
          status: resolved.invite.status,
        },
        session: resolved.session,
        steps: WORLD_INTAKE_STEPS,
        readOnly: resolved.invite.status === 'COMPLETED' || Boolean(resolved.invite.revokedAt),
      });
    }

    if (action === 'autosave' && req.method === 'POST') {
      const body = parseBody(req) ?? {};
      const token = String(body.token ?? '');
      const answers = (body.answers as Array<{ questionId: string; section: string; value: unknown; verbatim?: string }>) ?? [];
      const result = await autosaveGuestIntake({
        rawToken: token,
        answers,
        currentSection: body.currentSection ? String(body.currentSection) : undefined,
        currentStep: body.currentStep ? String(body.currentStep) : undefined,
        clientDeviceMetadata: (body.clientDeviceMetadata as Record<string, unknown>) ?? {},
      });
      return res.status(200).json({ ok: true, session: result.session, invite: { status: result.invite.status } });
    }

    if (action === 'submit' && req.method === 'POST') {
      const body = parseBody(req) ?? {};
      const token = String(body.token ?? '');
      const result = await submitGuestIntake(token);
      return res.status(200).json({
        ok: true,
        session: result.session,
        snapshot: result.snapshot,
        readiness: result.snapshot.readiness,
      });
    }

    return res.status(400).json({ ok: false, error: 'Unknown action' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, error: message });
  }
}
