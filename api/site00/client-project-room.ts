import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getClientProjectRoomPayload, assertClientProjectAccess } from '../_lib/site00ClientProjectRoom/roomService.js';
import { isAdminEmail } from '../_lib/adminAuth.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function safeClientError(e: unknown): { status: number; message: string } {
  const msg = e instanceof Error ? e.message : 'Internal error';
  if (msg === 'PROJECT NOT FOUND') return { status: 404, message: 'Project not found' };
  if (msg === 'FORBIDDEN') return { status: 403, message: 'Access denied' };
  return { status: 500, message: 'We could not load this project room. Try again.' };
}

/** Client Project Room API — authenticated client-only project room data. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getAuthUser(req);
  if (!user?.email) return res.status(401).json({ error: 'Unauthorized' });

  const action = String(req.query.action ?? 'room');
  const projectSlug = String(req.query.projectSlug ?? '');

  try {
    if (action === 'room') {
      if (!projectSlug) return res.status(400).json({ error: 'projectSlug required' });
      const previewScope = typeof req.query.scope === 'string' ? req.query.scope : undefined;
      const payload = await getClientProjectRoomPayload({
        projectSlug,
        email: user.email,
        userId: user.id,
        previewScope,
      });
      return res.status(200).json(payload);
    }

    if (action === 'access-check') {
      if (!projectSlug) return res.status(400).json({ error: 'projectSlug required' });
      await assertClientProjectAccess(projectSlug, user.email, user.id);
      return res.status(200).json({ ok: true, role: isAdminEmail(user.email) ? 'ADMIN' : 'CLIENT' });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (e) {
    console.error('[api/site00/client-project-room]', e);
    const { status, message } = safeClientError(e);
    return res.status(status).json({ error: message });
  }
}
