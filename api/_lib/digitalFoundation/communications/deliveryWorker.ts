import {
  isFounderTestModeEnabled,
  isRecipientAllowedForFounderTestSend,
  isSyntheticBusinessName,
} from '../../../../shared/site00-digital-foundation/founderTestMode.js';
import type { CommunicationSendIntent } from '../../../../shared/site00-digital-foundation/communications/types.js';
import { isDfCommunicationFlagEnabled, DF_COMM_FEATURE_FLAGS } from '../../../../shared/site00-digital-foundation/communications/featureFlags.js';
import * as mem from '../memoryStore.js';
import { getArtifactPayload } from '../service.js';
import { renderFndatnForDispatch, supportsFndatnTemplate } from './fndatnTemplateBridge.js';
import { resendApiKeyConfigured, sendViaResend } from './resendAdapter.js';

function nowIso() {
  return new Date().toISOString();
}

function assetBaseFromEnv(): string {
  const raw = process.env.SITE00_PUBLIC_APP_ORIGIN?.trim() || process.env.VITE_SITE00_PUBLIC_ORIGIN?.trim();
  if (raw && /^https:\/\//i.test(raw)) return raw.replace(/\/$/, '');
  return 'https://site00.com';
}

function fromAddress(): string {
  return process.env.SITE00_DF_TRANSACTIONAL_FROM?.trim() || 'SITE 00 Digital Foundation <hello@site00.com>';
}

function replyToAddress(): string | undefined {
  const raw = process.env.SITE00_DF_TRANSACTIONAL_REPLY_TO?.trim();
  return raw || undefined;
}

export type ProcessIntentResult = { intent: CommunicationSendIntent; blocked?: string };

/**
 * Attempt provider delivery for one intent. Never marks DELIVERED — only ACCEPTED when Resend accepts the API call.
 */
export async function processSendIntent(intentId: string, opts: { forceDryRun?: boolean } = {}): Promise<ProcessIntentResult> {
  const state = mem.getDfMemoryState();
  const intent = [...state.sendIntents.values()].find((i) => i.intent_id === intentId);
  if (!intent) throw new Error('INTENT_NOT_FOUND');

  const payload = getArtifactPayload(intent.artifact_id);
  const synthetic = isSyntheticBusinessName(payload.lead.business_name ?? payload.artifact.intake.business_name);

  if (intent.status === 'DRY_RUN' && !opts.forceDryRun) {
    return { intent, blocked: 'DRY_RUN — enable SITE00_DF_TRANSACTIONAL_EMAIL_SEND and re-queue from founder readiness' };
  }

  if (!synthetic && !isFounderTestModeEnabled()) {
    intent.status = 'FAILED';
    intent.last_error = 'NON_SYNTHETIC_ARTIFACT — founder test mode required';
    intent.attempts += 1;
    return { intent, blocked: intent.last_error };
  }

  if (!isRecipientAllowedForFounderTestSend(intent.recipient_email)) {
    intent.status = 'FAILED';
    intent.last_error = 'RECIPIENT_NOT_ON_FOUNDER_ALLOWLIST';
    intent.attempts += 1;
    return { intent, blocked: intent.last_error };
  }

  const sendFlag = isDfCommunicationFlagEnabled(DF_COMM_FEATURE_FLAGS.SITE00_DF_TRANSACTIONAL_EMAIL_SEND);
  if (!sendFlag && !opts.forceDryRun) {
    intent.status = 'DRY_RUN';
    intent.delivery_channel = 'NONE';
    return { intent, blocked: 'SITE00_DF_TRANSACTIONAL_EMAIL_SEND is off' };
  }

  if (!supportsFndatnTemplate(intent.template_id)) {
    intent.status = 'FAILED';
    intent.last_error = `NO_FNDATN_RENDERER_FOR_${intent.template_id}`;
    intent.attempts += 1;
    return { intent, blocked: intent.last_error };
  }

  const rendered = renderFndatnForDispatch(intent.template_id, payload, assetBaseFromEnv());
  if (!rendered) {
    intent.status = 'FAILED';
    intent.last_error = 'RENDER_FAILED';
    intent.attempts += 1;
    return { intent, blocked: 'RENDER_FAILED' };
  }

  intent.attempts += 1;

  if (!resendApiKeyConfigured()) {
    intent.status = 'SIMULATED';
    intent.delivery_channel = 'SIMULATED';
    intent.provider_status_at = nowIso();
    intent.last_error = null;
    return { intent, blocked: 'RESEND_API_KEY not set — rendered only (SIMULATED)' };
  }

  const result = await sendViaResend({
    from: fromAddress(),
    to: intent.recipient_email,
    subject: rendered.subject,
    html: rendered.html,
    replyTo: replyToAddress(),
    idempotencyKey: intent.idempotency_key,
  });

  intent.provider_status_at = nowIso();
  intent.delivery_channel = 'RESEND';

  if (!result.ok) {
    intent.status = 'FAILED';
    intent.last_error = result.error;
    return { intent, blocked: result.error };
  }

  intent.status = result.status;
  intent.provider_message_id = result.providerMessageId;
  intent.last_error = null;
  return { intent };
}

export function listSendIntentsForArtifact(artifactId: string): CommunicationSendIntent[] {
  return [...mem.getDfMemoryState().sendIntents.values()].filter((i) => i.artifact_id === artifactId);
}

export function listAllSendIntents(): CommunicationSendIntent[] {
  return [...mem.getDfMemoryState().sendIntents.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
}
