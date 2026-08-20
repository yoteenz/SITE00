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

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getAuthUser(req);
  if (!user?.email) return res.status(401).json({ error: 'Unauthorized' });

  const action = String(req.query.action ?? (req.method === 'POST' ? parseBody(req)?.action : '') ?? 'index');

  try {
    switch (action) {
      case 'index': {
        const clientPayload = await getClientProjectsPayload(user.email, user.id);
        const clientProjects = (clientPayload.projects ?? [])
          .filter((p) => !isFounderProjectSlug(p.slug))
          .map((p) => ({ id: p.id, slug: p.slug, name: p.name, studioRoute: p.studioRoute }));

        if (!canAccessFounderProjectIndex(user.email)) {
          return res.status(200).json({
            projects: [],
            source: 'site00_project_resolver',
            clientProjects,
          });
        }

        const payload = await getSite00ProjectsIndexPayload(clientProjects);
        return res.status(200).json(payload);
      }
      case 'detail': {
        const slug = String(req.query.slug ?? '');
        if (!slug) return res.status(400).json({ error: 'slug required' });
        if (isFounderProjectSlug(slug) && !canAccessFounderProjectAsOwner(user.email, slug)) {
          return res.status(403).json({ error: 'Project access denied' });
        }
        const detail = await resolveSite00Project(slug);
        if (!detail) return res.status(404).json({ error: 'Project not found' });
        return res.status(200).json({ project: detail, source: 'site00_project_resolver' });
      }
      case 'creative_direction': {
        const slug = String(req.query.slug ?? '');
        if (!slug) return res.status(400).json({ error: 'slug required' });
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return res.status(403).json({ error: 'Project access denied' });
        }
        const payload = await getCreativeDirectionPayload(slug);
        return res.status(200).json(payload);
      }
      case 'creative_direction_decision': {
        if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
        const body = parseBody(req) ?? {};
        const slug = String(body.slug ?? req.query.slug ?? '');
        if (!slug) return res.status(400).json({ error: 'slug required' });
        if (!canAccessFounderProjectAsOwner(user.email, slug)) {
          return res.status(403).json({ error: 'Project access denied' });
        }
        const type = String(body.type ?? '') as 'APPROVE' | 'REFINE' | 'HYBRIDIZE' | 'REJECT';
        if (!['APPROVE', 'REFINE', 'HYBRIDIZE', 'REJECT'].includes(type)) {
          return res.status(400).json({ error: 'Invalid decision type' });
        }
        const engagement = await recordFounderDecision(slug, {
          type,
          selectedTerritoryId: body.selectedTerritoryId ? String(body.selectedTerritoryId) : undefined,
          refinementNotes: body.refinementNotes ? String(body.refinementNotes) : undefined,
          rejectedTerritoryIds: Array.isArray(body.rejectedTerritoryIds)
            ? body.rejectedTerritoryIds.map(String)
            : undefined,
          by: user.email,
        });
        return res.status(200).json({ engagement, source: 'canonical_founder_decision_service' });
      }
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (e) {
    console.error('[api/site00/projects]', e);
    const msg = e instanceof Error ? e.message : 'Internal error';
    return res.status(500).json({ error: msg, source: 'site00_project_resolver' });
  }
}
