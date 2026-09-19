import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from './_lib/adminAuth.js';
import {
  buildCaptureAuthBootstrapForAdmin,
  CAPTURE_AUTH_BOOTSTRAP_COOKIE_TTL_DAYS,
} from './_lib/site00VisualReference/captureAuthBootstrapService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) {
    return res.status(auth.failure.status).json({ error: auth.failure.error, code: auth.failure.code });
  }

  const built = await buildCaptureAuthBootstrapForAdmin({ req, adminUserId: auth.user.id });
  if (!built.ok) {
    return res.status(built.failure.status).json({ error: built.failure.error, code: built.failure.code });
  }

  const { result } = built;
  return res.status(200).json({
    ok: true,
    principal: result.principal,
    expiresAt: result.expiresAt,
    cookieTtlDays: CAPTURE_AUTH_BOOTSTRAP_COOKIE_TTL_DAYS,
    storageState: result.storageState,
    storageStateJson: result.storageStateJson,
    railwayVariables: result.railwayVariables,
    instructions: [
      'Open Railway → api.site00.com service → Variables.',
      'Set SITE00_CAPTURE_STORAGE_STATE_JSON to the storageStateJson value (full JSON).',
      'Optional: SITE00_CAPTURE_PRINCIPAL=PROJECT_OWNER and SITE00_CAPTURE_BASE_URL=https://site00.com.',
      'Redeploy the API service, then CAPTURE / REFRESH REFERENCES on visual development.',
    ],
  });
}
