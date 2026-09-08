import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { canAccessFounderProjectAsOwner } from '../_lib/site00Access/accessModel.js';
import { isFounderProjectSlug } from '../_lib/site00Projects/projectRegistry.js';
import { isClientRegisteredProjectSlug } from '../_lib/site00Projects/clientProjectResolver.js';
import {
  getProjectTechnicalIntelligence,
  ProjectRepositorySyncService,
} from '../_lib/site00Projects/projectRepositorySyncService.js';
import { sanitizeTechnicalIntelligenceForClient } from '../../shared/site00-projects/technical/clientTechnicalTranslation.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'GET only' } });
    return;
  }

  const user = await getAuthUser(req);
  if (!user) {
    res.status(401).json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } });
    return;
  }

  const projectId = String(req.query.projectId ?? req.query.slug ?? '');
  const action = String(req.query.action ?? 'intelligence');
  const viewMode = String(req.query.viewMode ?? 'FOUNDER').toUpperCase() === 'CLIENT' ? 'CLIENT' : 'FOUNDER';

  if (!projectId) {
    res.status(400).json({ ok: false, error: { code: 'MISSING_PROJECT', message: 'projectId required' } });
    return;
  }

  const allowed =
    isFounderProjectSlug(projectId) ||
    isClientRegisteredProjectSlug(projectId) ||
    canAccessFounderProjectAsOwner(user.email, projectId);

  if (!allowed) {
    res.status(403).json({ ok: false, error: { code: 'FORBIDDEN', message: 'Project access denied' } });
    return;
  }

  try {
    if (action === 'sync') {
      const intelligence = await ProjectRepositorySyncService.syncProject(projectId, 'MANUAL_SYNC');
      const payload = viewMode === 'CLIENT' ? sanitizeTechnicalIntelligenceForClient(intelligence) : intelligence;
      res.status(200).json({ ok: true, intelligence: payload, source: 'project_repository_sync' });
      return;
    }

    const intelligence = await getProjectTechnicalIntelligence(projectId);
    const payload = viewMode === 'CLIENT' ? sanitizeTechnicalIntelligenceForClient(intelligence) : intelligence;
    res.status(200).json({ ok: true, intelligence: payload, source: 'project_repository_sync' });
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: { code: 'SYNC_FAILED', message: e instanceof Error ? e.message : 'Sync failed' },
    });
  }
}
