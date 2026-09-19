import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import {
  activateClientProjectApp,
  getClientAppInboxThreads,
  getClientAppLibraryCategories,
  getClientAppLibraryFiles,
  getClientAppManifestPayload,
  getClientAppProjectsList,
  recordClientAppOpportunityInterest,
} from '../_lib/site00ClientApp/appService.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function safeClientError(e: unknown): { status: number; message: string } {
  const msg = e instanceof Error ? e.message : 'Internal error';
  if (msg === 'PROJECT NOT FOUND') return { status: 404, message: 'Project not found' };
  if (msg === 'FORBIDDEN') return { status: 403, message: 'Access denied' };
  return { status: 500, message: 'We could not load the app. Try again.' };
}

/** P0.APP.1 — Client mobile app API */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const user = await getAuthUser(req);
  if (!user?.email) return res.status(401).json({ error: 'Unauthorized' });

  const action = String(
    req.query.action ?? (typeof req.body === 'object' && req.body ? (req.body as { action?: string }).action : '') ?? '',
  );

  try {
    if (req.method === 'GET') {
      switch (action) {
        case 'manifest': {
          const projectSlug = String(req.query.projectSlug ?? '');
          if (!projectSlug) return res.status(400).json({ error: 'projectSlug required' });
          const manifest = await getClientAppManifestPayload({
            projectSlug,
            email: user.email,
            userId: user.id,
          });
          return res.status(200).json(manifest);
        }
        case 'projects': {
          const fixtureMode = String(req.query.fixtureMode ?? '');
          return res.status(200).json(
            await getClientAppProjectsList({ email: user.email, userId: user.id, fixtureMode: fixtureMode || undefined }),
          );
        }
        case 'inbox': {
          const projectSlug = String(req.query.projectSlug ?? '');
          if (!projectSlug) return res.status(400).json({ error: 'projectSlug required' });
          const manifest = await getClientAppManifestPayload({
            projectSlug,
            email: user.email,
            userId: user.id,
          });
          return res.status(200).json({ threads: getClientAppInboxThreads(manifest) });
        }
        case 'library': {
          const projectSlug = String(req.query.projectSlug ?? '');
          const categoryId = String(req.query.categoryId ?? '');
          if (!projectSlug) return res.status(400).json({ error: 'projectSlug required' });
          const manifest = await getClientAppManifestPayload({
            projectSlug,
            email: user.email,
            userId: user.id,
          });
          if (categoryId) {
            return res.status(200).json({ files: getClientAppLibraryFiles(categoryId) });
          }
          return res.status(200).json({ categories: getClientAppLibraryCategories(manifest) });
        }
        case 'calendar-export': {
          const milestone = String(req.query.milestone ?? '');
          const ics = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'BEGIN:VEVENT',
            `UID:site00-${milestone}@site00.com`,
            'SUMMARY:SITE 00 Milestone',
            'END:VEVENT',
            'END:VCALENDAR',
          ].join('\r\n');
          res.setHeader('Content-Type', 'text/calendar');
          return res.status(200).send(ics);
        }
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
      const postAction = String(body.action ?? action);

      if (postAction === 'activate') {
        const projectSlug = String(body.projectSlug ?? '');
        if (!projectSlug) return res.status(400).json({ error: 'projectSlug required' });
        return res.status(200).json(
          await activateClientProjectApp({ projectSlug, email: user.email, userId: user.id }),
        );
      }

      if (postAction === 'opportunity-interest') {
        const projectSlug = String(body.projectSlug ?? '');
        const offer = String(body.offer ?? '');
        const signal = String(body.signal ?? 'VIEWED');
        if (!projectSlug || !offer) return res.status(400).json({ error: 'projectSlug and offer required' });
        return res.status(200).json(
          await recordClientAppOpportunityInterest({
            projectSlug,
            email: user.email,
            userId: user.id,
            offer,
            signal: signal as import('../../shared/site00-client-app/types.js').ClientOpportunityInterestSignal,
          }),
        );
      }

      if (postAction === 'onboarding') {
        return res.status(200).json({ ok: true, state: body.state ?? 'OPENED_DOWNLOAD' });
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[api/site00/client-app]', e);
    const { status, message } = safeClientError(e);
    return res.status(status).json({ error: message });
  }
}
