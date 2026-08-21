/**
 * SITE 00 Admin — Identity + Builder canonical Intake Inbox API.
 *
 * GET  ?action=list    — filtered/sorted/searchable inbox rows
 * GET  ?action=detail  — full record + audit timeline for one intake
 * POST action=mark-in-review | archive — conservative lifecycle actions only (never rewrites
 *   what the client submitted — see intakeService.applyAdminIntakeAction).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { isIntakeType } from '../../shared/site00-intakes/types.js';
import {
  IntakeNotFoundError,
  IntakeValidationError,
  applyAdminIntakeAction,
  getIntakeForAdmin,
  listIntakeAuditEvents,
  listIntakesForAdmin,
} from '../_lib/site00Intakes/intakeService.js';
import type { AdminIntakeFilters } from '../_lib/site00Intakes/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) return res.status(auth.failure.status).json({ error: auth.failure.error });

  try {
    if (req.method === 'GET') {
      const action = String(req.query.action ?? 'list');

      if (action === 'list') {
        const filters: AdminIntakeFilters = {
          intakeType: isIntakeType(req.query.intakeType) ? req.query.intakeType : undefined,
          status: req.query.status ? String(req.query.status) : undefined,
          ownerKind: req.query.ownerKind === 'GUEST' || req.query.ownerKind === 'AUTHENTICATED' ? req.query.ownerKind : undefined,
          search: req.query.search ? String(req.query.search) : undefined,
          sort: (['newest', 'oldest', 'recently_updated', 'recently_submitted'] as const).includes(
            req.query.sort as never,
          )
            ? (req.query.sort as AdminIntakeFilters['sort'])
            : undefined,
          limit: req.query.limit ? Number(req.query.limit) : undefined,
        };
        return res.status(200).json({ intakes: await listIntakesForAdmin(filters) });
      }

      if (action === 'detail') {
        const intakeType = req.query.intakeType;
        if (!isIntakeType(intakeType)) return res.status(400).json({ error: 'intakeType must be IDENTITY or BUILDER' });
        const id = String(req.query.id ?? '');
        if (!id) return res.status(400).json({ error: 'id required' });
        const intake = await getIntakeForAdmin(intakeType, id);
        if (!intake) return res.status(404).json({ error: 'Intake not found' });
        const events = await listIntakeAuditEvents(intakeType, id);
        return res.status(200).json({ intake, events });
      }

      return res.status(400).json({ error: 'Unsupported action' });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
      const action = String(body.action ?? '');
      const intakeType = body.intakeType;
      if (!isIntakeType(intakeType)) return res.status(400).json({ error: 'intakeType must be IDENTITY or BUILDER' });
      const id = String(body.id ?? '');
      if (!id) return res.status(400).json({ error: 'id required' });

      if (action === 'mark-in-review' || action === 'archive') {
        const intake = await applyAdminIntakeAction(
          intakeType,
          id,
          action === 'mark-in-review' ? 'MARK_IN_REVIEW' : 'ARCHIVE',
          auth.user.email,
        );
        return res.status(200).json({ intake });
      }

      return res.status(400).json({ error: 'Unsupported action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    if (e instanceof IntakeNotFoundError) return res.status(404).json({ error: 'Intake not found' });
    if (e instanceof IntakeValidationError) return res.status(400).json({ error: e.message });
    console.error('[admin/site00-intakes]', e instanceof Error ? e.message : e);
    return res.status(500).json({ error: 'We could not complete this operation. Try again.' });
  }
}
