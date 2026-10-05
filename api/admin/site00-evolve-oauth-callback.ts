import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleMetaOAuthCallback } from '../_lib/site00Evolve/providers/oauthCallbackHandler.js';

/** Meta OAuth callback — no admin session; validated via CSRF state token */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'METHOD NOT ALLOWED' });
  }

  const code = typeof req.query.code === 'string' ? req.query.code : null;
  const state = typeof req.query.state === 'string' ? req.query.state : null;
  const error = typeof req.query.error === 'string' ? req.query.error : null;

  const result = await handleMetaOAuthCallback({ code, state, error });
  res.writeHead(result.ok ? 302 : 302, { Location: result.redirectUrl });
  return res.end();
}
