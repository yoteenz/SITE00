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
  getClientArtifactPayloadByToken,
  openArtifactByToken,
  removeQuoteAddon,
  updateIntake,
  updateQuoteSelections,
} from '../_lib/digitalFoundation/service.js';
import { getCommercialConfig } from '../_lib/digitalFoundation/service.js';
import { listCatalogForClient } from '../../shared/site00-digital-foundation/quoteEngine.js';
import { isDigitalFoundationFlagEnabled, DF_FEATURE_FLAGS } from '../../shared/site00-digital-foundation/featureFlags.js';
import { loadArtifactGraphByToken } from '../_lib/digitalFoundation/persistence/supabaseStore.js';
import { buildClientGrowthContextForArtifactId } from '../_lib/digitalFoundation/growthBridge.js';
import { updateBusinessGrowth } from '../_lib/digitalFoundation/service.js';
import { isBusinessGrowthIntelligenceActive } from '../../shared/site00-business-growth-intelligence/featureFlags.js';

/** Client payload plus the Business Growth context (`null` while BGI is off — Foundation-only payload unchanged). */
function clientPayload(token: string) {
  const payload = getClientArtifactPayloadByToken(token);
  return { ...payload, business_growth: buildClientGrowthContextForArtifactId(payload.artifact.artifact_id) };
}

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
          await loadArtifactGraphByToken(token);
          return res.status(200).json(clientPayload(token));
        }
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    if (req.method === 'POST') {
      const postAction = String(body.action ?? action);
      const token = tokenFromReq(req);
      if (!token) return res.status(400).json({ error: 'token required' });
      await loadArtifactGraphByToken(token);
      const artifact = openArtifactByToken(token);

      switch (postAction) {
        case 'open':
          return res.status(200).json(clientPayload(token));
        case 'update-intake':
          return res.status(200).json({
            payload: clientPayload(token),
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
            payload: clientPayload(token),
          });
        case 'remove-addon':
          return res.status(200).json({
            quote: removeQuoteAddon(artifact.artifact_id, String(body.addon_id)),
            payload: clientPayload(token),
          });
        case 'accept-quote':
          acceptQuote({
            artifact_id: artifact.artifact_id,
            disclosures: Array.isArray(body.disclosures) ? body.disclosures.map(String) : [],
            client_ip: (req.headers['x-forwarded-for'] as string) ?? null,
            user_agent: (req.headers['user-agent'] as string) ?? null,
          });
          await loadArtifactGraphByToken(token);
          return res.status(200).json(clientPayload(token));
        case 'start-checkout': {
          if (!isDigitalFoundationFlagEnabled(DF_FEATURE_FLAGS.SITE00_DIGITAL_FOUNDATION_CHECKOUT_V1)) {
            return res.status(503).json({ error: 'Checkout not enabled' });
          }
          const checkout = await createCheckoutSession({
            artifact_id: artifact.artifact_id,
            success_url: String(body.success_url ?? `${body.origin ?? ''}/foundation/${token}?checkout=return`),
            cancel_url: String(body.cancel_url ?? `${body.origin ?? ''}/foundation/${token}?checkout=cancel`),
          });
          return res.status(200).json({ checkout, payload: clientPayload(token) });
        }
        case 'update-growth': {
          if (!isBusinessGrowthIntelligenceActive()) return res.status(404).json({ error: 'GROWTH_NOT_ENABLED' });
          updateBusinessGrowth(artifact.artifact_id, {
            ambition: body.ambition && typeof body.ambition === 'object' ? body.ambition : undefined,
            selections: body.selections,
          });
          return res.status(200).json(clientPayload(token));
        }
        case 'complete-client-action':
          completeClientAction(artifact.artifact_id, String(body.request_id), body.response ?? {});
          await loadArtifactGraphByToken(token);
          return res.status(200).json(clientPayload(token));
        case 'build-interest':
          captureBuildInterest(artifact.artifact_id, body.interest ?? 'INTERESTED');
          await loadArtifactGraphByToken(token);
          return res.status(200).json(clientPayload(token));
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const status = message.startsWith('GROWTH_')
      ? message.includes('LOCKED')
        ? 409
        : 400
      : message.includes('NOT_FOUND')
        ? 404
        : message.includes('REQUIRED')
          ? 400
          : 500;
    console.error('[digital-foundation-artifact]', e);
    return res.status(status).json({ error: message });
  }
}
