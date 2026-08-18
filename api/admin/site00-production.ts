import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import {
  addAdminNote,
  convertIntakeToProject,
  getAdminActivity,
  getBldrIntakeDetail,
  getBldrIntakesList,
  getCtrlRoomAdmin,
  getDiscoveryDetail,
  getDiscoveryList,
  getFinanceOverview,
  getIdentitiesList,
  getIdentityDetail,
  getInvoiceDetail,
  getLeadDetail,
  getLeadsList,
  getOperationsDashboard,
  getReportsPipeline,
  getSiteDetail,
  getSitesList,
  getTeamOverview,
  globalAdminSearch,
  markIntakeReviewed,
} from '../_lib/site00Production/adminOperations.js';
import {
  approveBrief,
  decideApproval,
  generateBriefForDeliverable,
  getApprovalsPayload,
  getProjectWorkspace,
  getProjectsPayload,
  getStudioPayload,
  ensureDemoProjectSeeded,
  updateServiceConnectionState,
} from '../_lib/site00Production/service.js';

function parseBody(req: VercelRequest): Record<string, unknown> | null {
  if (typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body)) {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * SITE 00 Admin Production OS API (admin-only)
 * GET operations + production actions
 * POST mutations
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) return res.status(auth.failure.status).json({ error: auth.failure.error });

  try {
    if (req.method === 'GET') {
      const action = String(req.query.action ?? 'dashboard');
      switch (action) {
        case 'dashboard':
          return res.status(200).json(await getOperationsDashboard(String(req.query.period ?? '30d')));
        case 'identities':
          return res.status(200).json(
            await getIdentitiesList({
              search: req.query.search ? String(req.query.search) : undefined,
            }),
          );
        case 'identity': {
          const id = String(req.query.id ?? '');
          if (!id) return res.status(400).json({ error: 'id required' });
          return res.status(200).json(await getIdentityDetail(id));
        }
        case 'bldr-intakes':
          return res.status(200).json(
            await getBldrIntakesList({
              buildClass: req.query.buildClass ? String(req.query.buildClass) : undefined,
              status: req.query.status ? String(req.query.status) : undefined,
            }),
          );
        case 'bldr-intake': {
          const id = String(req.query.id ?? '');
          if (!id) return res.status(400).json({ error: 'id required' });
          return res.status(200).json(await getBldrIntakeDetail(id));
        }
        case 'leads':
          return res.status(200).json(
            await getLeadsList({
              status: req.query.status ? String(req.query.status) : undefined,
            }),
          );
        case 'lead': {
          const id = String(req.query.id ?? '');
          if (!id) return res.status(400).json({ error: 'id required' });
          return res.status(200).json(await getLeadDetail(id));
        }
        case 'discovery':
          return res.status(200).json(await getDiscoveryList(String(req.query.status ?? 'UPCOMING')));
        case 'discovery-detail': {
          const id = String(req.query.id ?? '');
          if (!id) return res.status(400).json({ error: 'id required' });
          return res.status(200).json(await getDiscoveryDetail(id));
        }
        case 'sites':
          return res.status(200).json(
            await getSitesList({
              filter: req.query.filter ? String(req.query.filter) : undefined,
            }),
          );
        case 'site': {
          const id = String(req.query.id ?? '');
          if (!id) return res.status(400).json({ error: 'id required' });
          return res.status(200).json(await getSiteDetail(id));
        }
        case 'ctrl-room':
          return res.status(200).json(await getCtrlRoomAdmin());
        case 'finance':
          return res.status(200).json(await getFinanceOverview());
        case 'invoice': {
          const id = String(req.query.id ?? '');
          if (!id) return res.status(400).json({ error: 'id required' });
          return res.status(200).json(await getInvoiceDetail(id));
        }
        case 'team':
          return res.status(200).json(await getTeamOverview());
        case 'reports-pipeline':
          return res.status(200).json(await getReportsPipeline(String(req.query.period ?? 'all')));
        case 'activity': {
          const limit = Number(req.query.limit ?? 50);
          return res.status(200).json(await getAdminActivity(Number.isFinite(limit) ? limit : 50));
        }
        case 'search': {
          const q = String(req.query.q ?? '');
          return res.status(200).json(await globalAdminSearch(q));
        }
        case 'studio':
          return res.status(200).json(await getStudioPayload(String(req.query.projectId ?? '') || undefined));
        case 'approvals':
          return res.status(200).json(await getApprovalsPayload(String(req.query.category ?? 'ALL')));
        case 'projects':
          return res.status(200).json(await getProjectsPayload());
        case 'project': {
          const projectId = String(req.query.projectId ?? '');
          const section = String(req.query.section ?? 'overview');
          if (!projectId) return res.status(400).json({ error: 'projectId required' });
          return res.status(200).json(await getProjectWorkspace(projectId, section));
        }
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    if (req.method === 'POST') {
      const body = parseBody(req) ?? {};
      const action = String(body.action ?? req.query.action ?? '');

      switch (action) {
        case 'bootstrap-demo':
          return res.status(200).json(await ensureDemoProjectSeeded());
        case 'add-note': {
          const entityType = String(body.entityType ?? '');
          const entityId = String(body.entityId ?? '');
          const noteBody = String(body.body ?? '');
          if (!entityType || !entityId || !noteBody.trim()) {
            return res.status(400).json({ error: 'entityType, entityId, and body required' });
          }
          return res.status(200).json(
            await addAdminNote(entityType, entityId, noteBody, auth.user.email),
          );
        }
        case 'mark-intake-reviewed': {
          const intakeId = String(body.intakeId ?? '');
          if (!intakeId) return res.status(400).json({ error: 'intakeId required' });
          return res.status(200).json(await markIntakeReviewed(intakeId, auth.user.email));
        }
        case 'convert-intake-to-project': {
          const intakeId = String(body.intakeId ?? '');
          if (!intakeId) return res.status(400).json({ error: 'intakeId required' });
          return res.status(200).json(await convertIntakeToProject(intakeId, auth.user.email));
        }
        case 'approve-brief': {
          const briefId = String(body.briefId ?? '');
          if (!briefId) return res.status(400).json({ error: 'briefId required' });
          return res.status(200).json(await approveBrief(briefId, auth.user.id));
        }
        case 'decide-approval': {
          const approvalId = String(body.approvalId ?? '');
          const decision = String(body.decision ?? 'APPROVE');
          if (!approvalId) return res.status(400).json({ error: 'approvalId required' });
          return res.status(200).json(
            await decideApproval(approvalId, decision, auth.user.id, body.notes ? String(body.notes) : undefined),
          );
        }
        case 'generate-brief': {
          const projectId = String(body.projectId ?? '');
          const deliverableKey = String(body.deliverableKey ?? 'homepage_visual_direction');
          if (!projectId) return res.status(400).json({ error: 'projectId required' });
          return res.status(200).json(await generateBriefForDeliverable(projectId, deliverableKey));
        }
        case 'update-service-connection': {
          const projectId = String(body.projectId ?? '');
          const providerKey = String(body.providerKey ?? '');
          const connectionState = String(body.connectionState ?? 'CONNECTED');
          if (!projectId || !providerKey) {
            return res.status(400).json({ error: 'projectId and providerKey required' });
          }
          return res.status(200).json(await updateServiceConnectionState(projectId, providerKey, connectionState, 'ADMIN'));
        }
        case 'set-project-phase': {
          const projectId = String(body.projectId ?? '');
          const phase = String(body.phase ?? '');
          if (!projectId || !phase) return res.status(400).json({ error: 'projectId and phase required' });
          const { getSupabaseAdmin } = await import('../_lib/supabase.js');
          const { refreshProjectDerivedState } = await import('../_lib/site00Production/seedDemo.js');
          const supabase = getSupabaseAdmin();
          await supabase.from('site00_projects').update({ current_phase: phase }).eq('id', projectId);
          return res.status(200).json(await refreshProjectDerivedState(projectId));
        }
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error';
    return res.status(500).json({ error: message });
  }
}
