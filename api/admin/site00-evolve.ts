import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import {
  approveManifestById,
  approveSubject,
  createCampaign,
  createObjective,
  generateManifestForOrg,
  getApprovalsInbox,
  getCampaignDetail,
  getCampaignList,
  getEmailOpsPayload,
  getEvolveDebugPayload,
  getEvolveOverview,
  getPlansPayload,
  getSocialOpsPayload,
  getChannelsByOrgId,
  getEvolveRoadmapByOrgId,
  getObjectivesByOrgId,
  listMarketingOrgs,
  rejectSubject,
  requestApproval,
  requestStudioProduction,
  runAssessmentForOrg,
  updateObjective,
} from '../_lib/site00Evolve/evolveService.js';
import { orgIdFromSlug } from '../_lib/site00Evolve/seedFixtures.js';
import { getCalendarByOrgId, getCalendarItemById, getPendingApprovals } from '../_lib/site00Evolve/memoryStore.js';
import type { ProductionType } from '../_lib/site00Evolve/types.js';

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

function orgSlugFromQuery(req: VercelRequest): string {
  return String(req.query.orgSlug ?? req.query.org ?? 'site-00');
}

/** SITE 00 EVOLVE Marketing OS API (admin-only) */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) return res.status(auth.failure.status).json({ error: auth.failure.error });

  try {
    if (req.method === 'GET') {
      const action = String(req.query.action ?? 'overview');
      const orgSlug = orgSlugFromQuery(req);

      switch (action) {
        case 'overview':
          return res.status(200).json({ orgSlug, overview: getEvolveOverview(orgSlug) });
        case 'organizations':
          return res.status(200).json({ organizations: listMarketingOrgs() });
        case 'debug':
          return res.status(200).json(getEvolveDebugPayload(orgSlug));
        case 'assessment': {
          const orgId = orgIdFromSlug(orgSlug);
          const { getLatestAssessment } = await import('../_lib/site00Evolve/memoryStore.js');
          return res.status(200).json({ assessment: orgId ? getLatestAssessment(orgId) : null });
        }
        case 'objectives':
          return res.status(200).json({ objectives: getObjectivesByOrgId(orgIdFromSlug(orgSlug)!) });
        case 'channels':
          return res.status(200).json({ channels: getChannelsByOrgId(orgIdFromSlug(orgSlug)!) });
        case 'campaigns':
          return res.status(200).json({ campaigns: getCampaignList(orgSlug) });
        case 'campaign': {
          const campaignId = String(req.query.campaignId ?? '');
          const detail = getCampaignDetail(orgSlug, campaignId);
          return res.status(detail ? 200 : 404).json(detail ?? { error: 'Campaign not found' });
        }
        case 'calendar':
          return res.status(200).json({ calendar: getCalendarByOrgId(orgIdFromSlug(orgSlug)!) });
        case 'calendar_item': {
          const itemId = String(req.query.itemId ?? '');
          const item = getCalendarItemById(itemId);
          const orgId = orgIdFromSlug(orgSlug)!;
          if (!item || item.organization_id !== orgId) {
            return res.status(404).json({ error: 'Calendar item not found' });
          }
          return res.status(200).json({ item });
        }
        case 'emails':
          return res.status(200).json(getEmailOpsPayload(orgSlug));
        case 'social':
          return res.status(200).json(getSocialOpsPayload(orgSlug));
        case 'plans':
          return res.status(200).json(getPlansPayload(orgSlug));
        case 'manifest': {
          const { getMarketingManifest } = await import('../_lib/site00Evolve/manifest.js');
          return res.status(200).json(getMarketingManifest(orgSlug));
        }
        case 'approvals':
          return res.status(200).json({ approvals: getPendingApprovals(orgIdFromSlug(orgSlug)!) });
        case 'approvals_inbox':
          return res.status(200).json({ approvals: getApprovalsInbox() });
        case 'roadmap':
          return res.status(200).json({ roadmap: getEvolveRoadmapByOrgId(orgIdFromSlug(orgSlug)!) });
        default:
          return res.status(400).json({ error: 'UNKNOWN ACTION' });
      }
    }

    if (req.method === 'POST') {
      const body = parseBody(req) ?? {};
      const action = String(body.action ?? req.query.action ?? '');
      const orgSlug = String(body.orgSlug ?? orgSlugFromQuery(req));

      switch (action) {
        case 'run_assessment':
          return res.status(200).json({
            assessment: runAssessmentForOrg(orgSlug, auth.user.email, body.connections as never),
          });
        case 'generate_manifest':
          return res.status(200).json(generateManifestForOrg(orgSlug));
        case 'approve_manifest': {
          const manifestId = String(body.manifestId ?? '');
          const manifest = approveManifestById(manifestId, auth.user.email);
          return res.status(manifest ? 200 : 404).json({ manifest });
        }
        case 'create_objective':
          return res.status(200).json({ objective: createObjective(orgSlug, body as never) });
        case 'update_objective': {
          const id = String(body.id ?? '');
          const objective = updateObjective(id, body as never);
          return res.status(objective ? 200 : 404).json({ objective });
        }
        case 'create_campaign':
          return res.status(200).json({ campaign: createCampaign(orgSlug, body as never) });
        case 'request_production': {
          const { resolveOrgContext } = await import('../_lib/site00Evolve/evolveService.js');
          const org = resolveOrgContext(orgSlug);
          const result = requestStudioProduction({
            orgSlug,
            orgClassification: org.classification,
            productionType: String(body.productionType ?? 'OTHER') as ProductionType,
            objective: body.objective ? String(body.objective) : undefined,
            brief: body.brief ? String(body.brief) : undefined,
            campaignId: body.campaignId ? String(body.campaignId) : undefined,
            createdBy: auth.user.email,
          });
          return res.status(result.ok ? 200 : 400).json(result);
        }
        case 'request_approval':
          return res.status(200).json({
            approval: requestApproval(
              orgSlug,
              String(body.subjectType ?? 'campaign'),
              String(body.subjectId ?? ''),
              String(body.approvalType ?? 'STRATEGY'),
              auth.user.email,
            ),
          });
        case 'approve_item': {
          approveSubject(String(body.approvalId ?? ''), auth.user.email);
          return res.status(200).json({ ok: true });
        }
        case 'reject_item': {
          rejectSubject(String(body.approvalId ?? ''), auth.user.email, String(body.reason ?? ''));
          return res.status(200).json({ ok: true });
        }
        default:
          return res.status(400).json({ error: 'UNKNOWN ACTION' });
      }
    }

    return res.status(405).json({ error: 'METHOD NOT ALLOWED' });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'EVOLVE API error';
    return res.status(500).json({ error: message });
  }
}
