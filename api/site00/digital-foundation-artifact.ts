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
  createFoundationBuilderHandoff,
  getClientArtifactPayloadByToken,
  openArtifactByToken,
  removeQuoteAddon,
  updateIntake,
  updateCommunicationPreferences,
  updateQuoteSelections,
} from '../_lib/digitalFoundation/service.js';
import {
  listProjectMessages,
  markProjectMessagesRead,
  sendProjectMessage,
} from '../_lib/digitalFoundation/messaging.js';
import { getCommercialConfig } from '../_lib/digitalFoundation/service.js';
import { listCatalogForClient } from '../../shared/site00-digital-foundation/quoteEngine.js';
import { isDigitalFoundationFlagEnabled, DF_FEATURE_FLAGS } from '../../shared/site00-digital-foundation/featureFlags.js';
import {
  isSupabaseDfPersistenceEnabled,
  loadArtifactGraphByToken,
  persistArtifactGraph,
} from '../_lib/digitalFoundation/persistence/supabaseStore.js';
import { DfPersistenceError } from '../_lib/digitalFoundation/persistence/dfPersistenceError.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function tokenFromReq(req: VercelRequest): string {
  return String(req.query.token ?? req.body?.token ?? '');
}

/** Supabase and fetch failures are often plain objects. String(object) is "[object Object]". */
export function digitalFoundationHandlerError(e: unknown): { status: number; error: string } {
  if (e instanceof DfPersistenceError) {
    const status =
      e.code === 'DATABASE_PERMISSION_DENIED' || e.code === 'DATA_CONTRACT_INVALID'
        ? 503
        : e.code === 'DATABASE_UNAVAILABLE'
          ? 503
          : 500;
    return { status, error: e.code };
  }
  let message = 'Digital Foundation request failed';
  let code = '';
  if (e instanceof Error && e.message) {
    message = e.message;
  } else if (e && typeof e === 'object') {
    const record = e as Record<string, unknown>;
    const text = [record.message, record.detail, record.title, record.error].find(
      (value) => typeof value === 'string' && value.trim().length > 0,
    );
    if (typeof text === 'string') message = text;
    else {
      try {
        message = JSON.stringify(e).slice(0, 300);
      } catch {
        message = 'Digital Foundation request failed';
      }
    }
    if (typeof record.code === 'string') code = record.code;
    else if (typeof record.status === 'number') code = String(record.status);
  } else if (e != null) {
    message = String(e);
  }

  const blob = `${code} ${message}`;
  const unavailable = /522|timeout|timed out|ETIMEDOUT|ECONNREFUSED|fetch failed|Connection terminated|schema cache/i.test(
    blob,
  );
  const status = blob.includes('NOT_FOUND') || code === 'PGRST116'
    ? 404
    : message.includes('REQUIRED')
      ? 400
      : unavailable
        ? 503
        : 500;
  return { status, error: message };
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
          const loaded = await loadArtifactGraphByToken(token);
          if (!loaded && isSupabaseDfPersistenceEnabled()) {
            return res.status(404).json({ error: 'ARTIFACT_NOT_FOUND' });
          }
          return res.status(200).json(getClientArtifactPayloadByToken(token));
        }
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    if (req.method === 'POST') {
      const postAction = String(body.action ?? action);
      const token = tokenFromReq(req);
      if (!token) return res.status(400).json({ error: 'token required' });
      const loaded = await loadArtifactGraphByToken(token);
      if (!loaded && isSupabaseDfPersistenceEnabled()) {
        return res.status(404).json({ error: 'ARTIFACT_NOT_FOUND' });
      }
      const artifact = openArtifactByToken(token);

      switch (postAction) {
        case 'open':
          return res.status(200).json(getClientArtifactPayloadByToken(token));
        case 'update-intake': {
          const after = updateIntake(
            artifact.artifact_id,
            {
              ...body.intake,
              needs: Array.isArray(body.needs) ? (body.needs as IntakeNeedFlag[]) : undefined,
            },
            Boolean(body.markComplete),
          );
          if (isSupabaseDfPersistenceEnabled()) {
            await persistArtifactGraph(artifact.artifact_id);
          }
          return res.status(200).json({
            payload: getClientArtifactPayloadByToken(token),
            after,
          });
        }
        case 'update-quote':
          return res.status(200).json({
            quote: updateQuoteSelections(artifact.artifact_id, body.selections ?? []),
            payload: getClientArtifactPayloadByToken(token),
          });
        case 'remove-addon':
          return res.status(200).json({
            quote: removeQuoteAddon(artifact.artifact_id, String(body.addon_id)),
            payload: getClientArtifactPayloadByToken(token),
          });
        case 'accept-quote':
          acceptQuote({
            artifact_id: artifact.artifact_id,
            disclosures: Array.isArray(body.disclosures) ? body.disclosures.map(String) : [],
            client_ip: (req.headers['x-forwarded-for'] as string) ?? null,
            user_agent: (req.headers['user-agent'] as string) ?? null,
          });
          await loadArtifactGraphByToken(token);
          return res.status(200).json(getClientArtifactPayloadByToken(token));
        case 'start-checkout': {
          if (!isDigitalFoundationFlagEnabled(DF_FEATURE_FLAGS.SITE00_DIGITAL_FOUNDATION_CHECKOUT_V1)) {
            return res.status(503).json({ error: 'Checkout not enabled' });
          }
          const checkout = await createCheckoutSession({
            artifact_id: artifact.artifact_id,
            success_url: String(body.success_url ?? `${body.origin ?? ''}/foundation/${token}?checkout=return`),
            cancel_url: String(body.cancel_url ?? `${body.origin ?? ''}/foundation/${token}?checkout=cancel`),
          });
          return res.status(200).json({ checkout, payload: getClientArtifactPayloadByToken(token) });
        }
        case 'complete-client-action':
          completeClientAction(artifact.artifact_id, String(body.request_id), body.response ?? {});
          await loadArtifactGraphByToken(token);
          return res.status(200).json(getClientArtifactPayloadByToken(token));
        case 'update-communication-preferences':
          updateCommunicationPreferences(artifact.artifact_id, body.preferences ?? {});
          await loadArtifactGraphByToken(token);
          return res.status(200).json(getClientArtifactPayloadByToken(token));
        case 'build-interest':
          captureBuildInterest(artifact.artifact_id, body.interest ?? 'INTERESTED');
          await loadArtifactGraphByToken(token);
          return res.status(200).json(getClientArtifactPayloadByToken(token));
        case 'create-builder-handoff': {
          const handoff = createFoundationBuilderHandoff(artifact.artifact_id, {
            build_path_preference: body.build_path_preference ?? null,
          });
          await loadArtifactGraphByToken(token);
          return res.status(200).json({
            handoff_id: handoff.handoff.handoff_id,
            deep_link_path: handoff.deep_link_path,
            credit_verified: handoff.credit_verified,
            credit_amount_minor: handoff.credit_amount_minor,
            credit_currency: handoff.credit_currency,
            credit_expires_at: handoff.credit_expires_at,
            build_path_preference: handoff.handoff.build_path_preference,
            builder_credit_consumption: handoff.builder_credit_consumption,
            payload: getClientArtifactPayloadByToken(token),
          });
        }
        case 'list-messages':
          markProjectMessagesRead({ artifact_id: artifact.artifact_id, reader_role: 'CLIENT' });
          return res.status(200).json({ messages: listProjectMessages(artifact.artifact_id) });
        case 'send-message':
          if (artifact.payment_state !== 'PAID') {
            return res.status(403).json({ error: 'MESSAGING_REQUIRES_ACTIVE_PROJECT' });
          }
          sendProjectMessage({
            artifact_id: artifact.artifact_id,
            author_role: 'CLIENT',
            body: String(body.body ?? ''),
          });
          await loadArtifactGraphByToken(token);
          return res.status(200).json({ messages: listProjectMessages(artifact.artifact_id) });
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    const mapped = digitalFoundationHandlerError(e);
    console.error('[digital-foundation-artifact]', e);
    return res.status(mapped.status).json({ error: mapped.error });
  }
}
