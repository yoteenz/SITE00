/**
 * SITE 00 — Digital Foundation personalized artifact (token access, no PII in URL).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { IntakeNeedFlag } from '../../shared/site00-digital-foundation/types.js';
import {
  acceptQuote,
  captureBuildInterest,
  completeClientAction,
  createCheckoutSession,
  getArtifactPayloadByToken,
  openArtifactByToken,
  removeQuoteAddon,
  updateIntake,
  updateQuoteSelections,
} from '../_lib/digitalFoundation/service.js';
import { getCommercialConfig } from '../_lib/digitalFoundation/service.js';
import { listCatalogForClient } from '../../../shared/site00-digital-foundation/quoteEngine.js';
import { isDigitalFoundationFlagEnabled, DF_FEATURE_FLAGS } from '../../shared/site00-digital-foundation/featureFlags.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function tokenFromReq(req: VercelRequest): string {
  return String(req.query.token ?? req.body?.token ?? '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (!isDigitalFoundationFlagEnabled(DF_FEATURE_FLAGS.SITE00_DIGITAL_FOUNDATION_ARTIFACT_V1)) {
    return res.status(503).json({ error: 'Digital Foundation is not enabled' });
  }

  const action = String(req.query.action ?? '');
  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};

  try {
    if (req.method === 'GET') {
      switch (action) {
        case 'catalog':
          return res.status(200).json({ catalog: listCatalogForClient(getCommercialConfig()), config: getCommercialConfig() });
        case 'payload': {
          const token = tokenFromReq(req);
          if (!token) return res.status(400).json({ error: 'token required' });
          return res.status(200).json(getArtifactPayloadByToken(token));
        }
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    if (req.method === 'POST') {
      const postAction = String(body.action ?? action);
      const token = tokenFromReq(req);
      if (!token) return res.status(400).json({ error: 'token required' });
      const artifact = openArtifactByToken(token);

      switch (postAction) {
        case 'open':
          return res.status(200).json(getArtifactPayloadByToken(token));
        case 'update-intake':
          return res.status(200).json({
            payload: getArtifactPayloadByToken(token),
            after: updateIntake(
              artifact.artifact_id,
              {
                ...body.intake,
                needs: Array.isArray(body.needs) ? (body.needs as IntakeNeedFlag[]) : undefined,
              },
              Boolean(body.markComplete),
            ),
          });
        case 'update-quote':
          return res.status(200).json({
            quote: updateQuoteSelections(artifact.artifact_id, body.selections ?? []),
            payload: getArtifactPayloadByToken(token),
          });
        case 'remove-addon':
          return res.status(200).json({
            quote: removeQuoteAddon(artifact.artifact_id, String(body.addon_id)),
            payload: getArtifactPayloadByToken(token),
          });
        case 'accept-quote':
          acceptQuote({
            artifact_id: artifact.artifact_id,
            disclosures: Array.isArray(body.disclosures) ? body.disclosures.map(String) : [],
            client_ip: (req.headers['x-forwarded-for'] as string) ?? null,
            user_agent: (req.headers['user-agent'] as string) ?? null,
          });
          return res.status(200).json(getArtifactPayloadByToken(token));
        case 'start-checkout': {
          if (!isDigitalFoundationFlagEnabled(DF_FEATURE_FLAGS.SITE00_DIGITAL_FOUNDATION_CHECKOUT_V1)) {
            return res.status(503).json({ error: 'Checkout not enabled' });
          }
          const checkout = await createCheckoutSession({
            artifact_id: artifact.artifact_id,
            success_url: String(body.success_url ?? `${body.origin ?? ''}/foundation/${token}?checkout=return`),
            cancel_url: String(body.cancel_url ?? `${body.origin ?? ''}/foundation/${token}?checkout=cancel`),
          });
          return res.status(200).json({ checkout, payload: getArtifactPayloadByToken(token) });
        }
        case 'complete-client-action':
          completeClientAction(artifact.artifact_id, String(body.request_id), body.response ?? {});
          return res.status(200).json(getArtifactPayloadByToken(token));
        case 'build-interest':
          captureBuildInterest(artifact.artifact_id, body.interest ?? 'INTERESTED');
          return res.status(200).json(getArtifactPayloadByToken(token));
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const status = message.includes('NOT_FOUND') ? 404 : message.includes('REQUIRED') ? 400 : 500;
    console.error('[digital-foundation-artifact]', e);
    return res.status(status).json({ error: message });
  }
}
