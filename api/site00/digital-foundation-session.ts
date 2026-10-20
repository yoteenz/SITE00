/**
 * Digital Foundation — session + secure return (`/foundation/return`, G-09).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  clearSessionCookie,
  establishDfSessionForArtifact,
  issueReentryCode,
  readDfSessionId,
  resolveDfSessionArtifactId,
  verifyReentryCode,
} from '../_lib/digitalFoundation/dfSession.js';
import { memGetArtifact } from '../_lib/digitalFoundation/memoryStore.js';
import {
  findArtifactIdByContactEmail,
  getClientArtifactPayloadByArtifactId,
  getClientArtifactPayloadByToken,
  openArtifactByToken,
} from '../_lib/digitalFoundation/service.js';
import { isDigitalFoundationFlagEnabled, DF_FEATURE_FLAGS } from '../../shared/site00-digital-foundation/featureFlags.js';
import { loadArtifactGraphByToken } from '../_lib/digitalFoundation/persistence/supabaseStore.js';
import { digitalFoundationHandlerError } from './digital-foundation-artifact.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (!isDigitalFoundationFlagEnabled(DF_FEATURE_FLAGS.SITE00_DIGITAL_FOUNDATION_ARTIFACT_V1)) {
    return res.status(503).json({ error: 'Digital Foundation is not enabled' });
  }

  const action = String(req.query.action ?? req.body?.action ?? '');
  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};

  try {
    if (req.method === 'GET' && action === 'session-payload') {
      const artifactId = resolveDfSessionArtifactId(readDfSessionId(req));
      if (!artifactId) return res.status(401).json({ error: 'SESSION_REQUIRED' });
      const artifact = memGetArtifact(artifactId);
      if (!artifact) return res.status(404).json({ error: 'ARTIFACT_NOT_FOUND' });
      return res.status(200).json(getClientArtifactPayloadByArtifactId(artifactId));
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    switch (action) {
      case 'establish-session': {
        const token = String(body.token ?? req.query.token ?? '');
        if (!token) return res.status(400).json({ error: 'token required' });
        await loadArtifactGraphByToken(token);
        const artifact = openArtifactByToken(token);
        establishDfSessionForArtifact(artifact.artifact_id, res);
        return res.status(200).json({ ok: true, payload: getClientArtifactPayloadByToken(token) });
      }
      case 'request-reentry': {
        const email = String(body.email ?? '').trim().toLowerCase();
        if (!email) return res.status(400).json({ error: 'EMAIL_REQUIRED' });
        const artifactId =
          resolveDfSessionArtifactId(readDfSessionId(req)) ?? findArtifactIdByContactEmail(email);
        if (!artifactId) {
          return res.status(200).json({ ok: true, message: 'IF WE RECOGNIZE THAT EMAIL, WE SENT A CODE.' });
        }
        const issued = issueReentryCode(artifactId, email);
        if (process.env.NODE_ENV !== 'production') {
          return res.status(200).json({ ok: true, dev_code: issued.code, expires_at: issued.expires_at });
        }
        return res.status(200).json({ ok: true, message: 'IF WE RECOGNIZE THAT EMAIL, WE SENT A CODE.' });
      }
      case 'verify-reentry': {
        const email = String(body.email ?? '');
        const code = String(body.code ?? '');
        const verified = verifyReentryCode(email, code);
        if (!verified.ok) return res.status(401).json({ error: 'INVALID_CODE' });
        establishDfSessionForArtifact(verified.artifact_id, res);
        return res.status(200).json({ ok: true, payload: getClientArtifactPayloadByArtifactId(verified.artifact_id) });
      }
      case 'sign-out-session':
        clearSessionCookie(res);
        return res.status(200).json({ ok: true });
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (e) {
    const mapped = digitalFoundationHandlerError(e);
    console.error('[digital-foundation-session]', e);
    return res.status(mapped.status).json({ error: mapped.error });
  }
}
