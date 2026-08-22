import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getClientProjectsPayload } from '../_lib/site00Production/clientStudio.js';
import { getSite00ProjectsIndexPayload, resolveSite00Project } from '../_lib/site00Projects/projectResolver.js';
import { isFounderProjectSlug } from '../_lib/site00Projects/projectRegistry.js';
import {
  canAccessFounderProjectAsOwner,
  canAccessFounderProjectIndex,
} from '../_lib/site00Access/accessModel.js';
import {
  getCreativeDirectionPayload,
  recordFounderDecision,
} from '../_lib/site00Evolve/creativeDirection/engagementService.js';
import { orgIdFromSlug } from '../_lib/site00Evolve/orgRegistry.js';
import { submitOrgLoreCalibration, getOrReconcileBrandLoreForOrg } from '../_lib/site00BrandLore/loreService.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function json(res: VercelResponse, status: number, payload: unknown): void {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.json(payload);
}

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

/** Authenticated project index + canonical client project-owner API */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'POST') {
    return json(res, 405, {
      ok: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' },
      source: 'site00_project_resolver',
    });
  }

  const user = await getAuthUser(req);
  if (!user?.email) {
    return json(res, 401, {
      ok: false,
      error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
      source: 'site00_project_resolver',
    });
  }

  const action = String(req.query.action ?? (req.method === 'POST' ? parseBody(req)?.action : '') ?? 'index');

  try {
    switch (action) {
      case 'index': {
        const clientPayload = await getClientProjectsPayload(user.email, user.id);
        const clientProjects = (clientPayload.projects ?? [])
          .filter((p) => !isFounderProjectSlug(p.slug))
          .map((p) => ({ id: p.id, slug: p.slug, name: p.name, studioRoute: p.studioRoute }));

        if (!canAccessFounderProjectIndex(user.email)) {
          return json(res, 200, {
            ok: true,
            projects: [],
            source: 'site00_project_resolver',
            summary: {
              total: clientProjects.length,
              founderIndex: 0,
              clientProjects: clientProjects.length,
              partial: 0,
            },
            clientProjects,
          });
        }

        const payload = await getSite00ProjectsIndexPayload(clientProjects);
        return json(res, 200, payload);
      }
      case 'detail': {
        const slug = String(req.query.slug ?? '');
        if (!slug) {
          return json(res, 400, {
            ok: false,
            error: { code: 'SLUG_REQUIRED', message: 'slug required' },
            source: 'site00_project_resolver',
          });
        }
        if (isFounderProjectSlug(slug) && !canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_project_resolver',
          });
        }
        const detail = await resolveSite00Project(slug);
        if (!detail) {
          return json(res, 404, {
            ok: false,
            error: { code: 'NOT_FOUND', message: 'Project not found' },
            source: 'site00_project_resolver',
          });
        }
        return json(res, 200, { ok: true, project: detail, source: 'site00_project_resolver' });
      }
      case 'creative_direction': {
        const slug = String(req.query.slug ?? '');
        if (!slug) {
          return json(res, 400, {
            ok: false,
            error: { code: 'SLUG_REQUIRED', message: 'slug required' },
            source: 'site00_project_resolver',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_project_resolver',
          });
        }
        const payload = await getCreativeDirectionPayload(slug);
        const orgId = orgIdFromSlug(slug);
        const loreProfile = orgId ? await getOrReconcileBrandLoreForOrg(orgId, slug) : null;
        return json(res, 200, {
          ...payload,
          brandLoreCalibrationAnswers: loreProfile?.rawLoreAnswers ?? {},
        });
      }
      case 'creative_direction_decision': {
        if (req.method !== 'POST') {
          return json(res, 405, {
            ok: false,
            error: { code: 'POST_REQUIRED', message: 'POST required' },
            source: 'site00_project_resolver',
          });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? req.query.slug ?? '');
        if (!slug) {
          return json(res, 400, {
            ok: false,
            error: { code: 'SLUG_REQUIRED', message: 'slug required' },
            source: 'site00_project_resolver',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_project_resolver',
          });
        }
        const type = String(body.type ?? '') as 'APPROVE' | 'REFINE' | 'HYBRIDIZE' | 'REJECT';
        if (!['APPROVE', 'REFINE', 'HYBRIDIZE', 'REJECT'].includes(type)) {
          return json(res, 400, {
            ok: false,
            error: { code: 'INVALID_DECISION', message: 'Invalid decision type' },
            source: 'site00_project_resolver',
          });
        }
        const engagement = await recordFounderDecision(slug, {
          type,
          selectedTerritoryId: body.selectedTerritoryId ? String(body.selectedTerritoryId) : undefined,
          hybridSelections: Array.isArray(body.hybridSelections)
            ? (body.hybridSelections as Array<{ territoryId: string; elements: string[] }>)
            : undefined,
          refinementNotes: body.refinementNotes ? String(body.refinementNotes) : undefined,
          rejectedTerritoryIds: Array.isArray(body.rejectedTerritoryIds)
            ? body.rejectedTerritoryIds.map(String)
            : undefined,
          by: user.email,
        });
        return json(res, 200, { ok: true, engagement, source: 'canonical_founder_decision_service' });
      }
      case 'lore_calibration_submit': {
        if (req.method !== 'POST') {
          return json(res, 405, {
            ok: false,
            error: { code: 'POST_REQUIRED', message: 'POST required' },
            source: 'site00_project_resolver',
          });
        }
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? req.query.slug ?? '');
        if (!slug) {
          return json(res, 400, {
            ok: false,
            error: { code: 'SLUG_REQUIRED', message: 'slug required' },
            source: 'site00_project_resolver',
          });
        }
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return json(res, 403, {
            ok: false,
            error: { code: 'PROJECT_ACCESS_DENIED', message: 'Project access denied' },
            source: 'site00_project_resolver',
          });
        }
        const orgId = orgIdFromSlug(slug);
        if (!orgId) {
          return json(res, 400, {
            ok: false,
            error: { code: 'ORG_NOT_REGISTERED', message: 'Organization not registered' },
            source: 'site00_project_resolver',
          });
        }
        const answers = (body.answers ?? {}) as Record<string, string | string[]>;
        if (!answers || typeof answers !== 'object' || Object.keys(answers).length === 0) {
          return json(res, 400, {
            ok: false,
            error: { code: 'ANSWERS_REQUIRED', message: 'At least one calibration answer required' },
            source: 'site00_project_resolver',
          });
        }
        const { invalidateCreativeDirectionEngagement } = await import(
          '../_lib/site00Evolve/creativeDirection/engagementService.js'
        );
        await submitOrgLoreCalibration({ orgId, orgSlug: slug, answers });
        // Force the next `creative_direction` read to re-resolve readiness from the just-updated
        // profile instead of returning this org's cached in-memory engagement (see engagementService.ts).
        invalidateCreativeDirectionEngagement(slug);
        const payload = await getCreativeDirectionPayload(slug);
        return json(res, 200, { ok: true, ...payload, source: 'site00_lore_calibration' });
      }
      default:
        return json(res, 400, {
          ok: false,
          error: { code: 'UNKNOWN_ACTION', message: 'Unknown action' },
          source: 'site00_project_resolver',
        });
    }
  } catch (e) {
    console.error('[api/site00/projects]', e);
    const msg = e instanceof Error ? e.message : 'Internal error';
    return json(res, 500, {
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: msg },
      source: 'site00_project_resolver',
    });
  }
}
