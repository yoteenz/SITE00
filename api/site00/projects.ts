import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getClientProjectsPayload } from '../_lib/site00Production/clientStudio.js';
import { getSite00ProjectsIndexPayload, resolveSite00Project } from '../_lib/site00Projects/projectResolver.js';
import { isFounderProjectSlug } from '../_lib/site00Projects/projectRegistry.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/** Authenticated founder project index + command surface API */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getAuthUser(req);
  if (!user?.email) return res.status(401).json({ error: 'Unauthorized' });

  const action = String(req.query.action ?? 'index');

  try {
    switch (action) {
      case 'index': {
        const clientPayload = await getClientProjectsPayload(user.email, user.id);
        const clientProjects = (clientPayload.projects ?? [])
          .filter((p) => !isFounderProjectSlug(p.slug))
          .map((p) => ({ id: p.id, slug: p.slug, name: p.name, studioRoute: p.studioRoute }));
        const payload = await getSite00ProjectsIndexPayload(clientProjects);
        return res.status(200).json(payload);
      }
      case 'detail': {
        const slug = String(req.query.slug ?? '');
        if (!slug) return res.status(400).json({ error: 'slug required' });
        const detail = await resolveSite00Project(slug);
        if (!detail) return res.status(404).json({ error: 'Project not found' });
        return res.status(200).json({ project: detail, source: 'site00_project_resolver' });
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
