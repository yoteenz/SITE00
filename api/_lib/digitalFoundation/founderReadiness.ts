import {
  formatSyntheticBusinessName,
  isFounderTestModeEnabled,
  isSyntheticBusinessName,
  maskToken,
} from '../../../shared/site00-digital-foundation/founderTestMode.js';
import { resendApiKeyConfigured } from './communications/resendAdapter.js';
import { listAllSendIntents, processSendIntent } from './communications/deliveryWorker.js';
import { enqueueCommunicationsForEvent } from './communications/dispatch.js';
import * as mem from './memoryStore.js';
import {
  createArtifactForLead,
  createLead,
  getArtifactPayload,
  markFoundationComplete,
  markQuoteCommerciallyReady,
  updateIntake,
} from './service.js';
import { isDfCommunicationFlagEnabled, DF_COMM_FEATURE_FLAGS } from '../../../shared/site00-digital-foundation/communications/featureFlags.js';

export type FounderReadinessReport = {
  ready: string[];
  needs_founder: string[];
  blocked: string[];
  env: {
    founder_test_mode: boolean;
    transactional_send_flag: boolean;
    resend_configured: boolean;
    allowlist_configured: boolean;
  };
};

export function buildFounderReadinessReport(): FounderReadinessReport {
  const ready: string[] = [];
  const needs: string[] = [];
  const blocked: string[] = [];

  if (isFounderTestModeEnabled()) ready.push('SITE00_DF_FOUNDER_TEST_MODE=1');
  else blocked.push('Set SITE00_DF_FOUNDER_TEST_MODE=1 on Railway API for synthetic E2E');

  if (isDfCommunicationFlagEnabled(DF_COMM_FEATURE_FLAGS.SITE00_DF_TRANSACTIONAL_EMAIL_SEND)) {
    ready.push('Transactional send flag ON (still allowlist-gated)');
  } else {
    needs.push('Set SITE00_DF_TRANSACTIONAL_EMAIL_SEND=1 when ready to queue real provider sends');
  }

  if (resendApiKeyConfigured()) ready.push('RESEND_API_KEY present');
  else needs.push('Add RESEND_API_KEY on Railway (server-only) for ACCEPTED sends');

  const allowlist = process.env.SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST?.trim();
  if (allowlist) ready.push('Founder test recipient allowlist configured');
  else needs.push('Set SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST to founder inbox(es) only');

  needs.push('Verify GoDaddy DKIM + Resend domain (founder DNS approval card — no auto DNS)');
  needs.push('Complete Stripe TEST checkout in founder test workspace when exercising payment stage');

  return {
    ready,
    needs_founder: needs,
    blocked,
    env: {
      founder_test_mode: isFounderTestModeEnabled(),
      transactional_send_flag: isDfCommunicationFlagEnabled(DF_COMM_FEATURE_FLAGS.SITE00_DF_TRANSACTIONAL_EMAIL_SEND),
      resend_configured: resendApiKeyConfigured(),
      allowlist_configured: Boolean(allowlist),
    },
  };
}

export function createSyntheticTestClient(input: {
  display_name: string;
  contact_email: string;
  contact_name?: string;
  business_name?: string;
}) {
  if (!isFounderTestModeEnabled()) throw new Error('FOUNDER_TEST_MODE_DISABLED');
  const business = formatSyntheticBusinessName(input.business_name ?? input.display_name);
  const lead = createLead({
    business_name: business,
    contact_name: input.contact_name ?? 'Founder Test',
    contact_email: input.contact_email,
    referral_kind: 'DIRECT',
  });
  const artifact = createArtifactForLead({ lead_id: lead.lead_id, business_name: business, contact_email: input.contact_email });
  enqueueCommunicationsForEvent({
    artifactId: artifact.artifact_id,
    eventType: 'ARTIFACT_CREATED',
    recipientEmail: input.contact_email,
  });
  return {
    artifact,
    lead,
    personalized_url: `/foundation/${artifact.public_token}`,
    token_masked: maskToken(artifact.public_token),
  };
}

export function getSyntheticTestJourney(artifactId: string) {
  const payload = getArtifactPayload(artifactId);
  if (!isSyntheticBusinessName(payload.lead.business_name)) throw new Error('NOT_SYNTHETIC_ARTIFACT');
  const intents = listAllSendIntents().filter((i) => i.artifact_id === artifactId);
  return {
    artifact_id: artifactId,
    state: payload.artifact.state,
    intake_state: payload.artifact.intake_state,
    payment_state: payload.artifact.payment_state,
    surface: payload.surface,
    personalized_url: `/foundation/${payload.artifact.public_token}`,
    token_masked: maskToken(payload.artifact.public_token),
    email_events: intents,
    event_count: payload.events.length,
  };
}

export function advanceSyntheticIntakeSubmitted(artifactId: string) {
  const payload = getArtifactPayload(artifactId);
  if (!isSyntheticBusinessName(payload.lead.business_name)) throw new Error('NOT_SYNTHETIC_ARTIFACT');
  updateIntake(
    artifactId,
    {
      ...payload.artifact.intake,
      business_name: payload.artifact.intake.business_name || payload.lead.business_name || 'SYNTH · Test',
      contact_name: payload.artifact.intake.contact_name || payload.lead.contact_name || 'Test',
      current_email: payload.lead.contact_email ?? payload.artifact.intake.current_email,
      team_size: payload.artifact.intake.team_size || 1,
      needs: payload.artifact.intake.needs?.length ? payload.artifact.intake.needs : ['NEED_DOMAIN'],
    },
    true,
  );
  enqueueCommunicationsForEvent({
    artifactId,
    eventType: 'INTAKE_COMPLETED',
    recipientEmail: payload.lead.contact_email,
  });
  return getSyntheticTestJourney(artifactId);
}

export function advanceSyntheticQuoteReady(artifactId: string) {
  const payload = getArtifactPayload(artifactId);
  if (!isSyntheticBusinessName(payload.lead.business_name)) throw new Error('NOT_SYNTHETIC_ARTIFACT');
  if (!payload.quote) throw new Error('QUOTE_NOT_READY — complete intake first');
  markQuoteCommerciallyReady(artifactId);
  enqueueCommunicationsForEvent({
    artifactId,
    eventType: 'QUOTE_CREATED',
    recipientEmail: payload.lead.contact_email,
  });
  return getSyntheticTestJourney(artifactId);
}

export async function dispatchQueuedEmail(intentId: string) {
  return processSendIntent(intentId);
}

export function listEmailTimeline() {
  return listAllSendIntents().map((i) => ({
    ...i,
    recipient_email: i.recipient_email.replace(/(.{2}).+(@.+)/, '$1•••$2'),
  }));
}

export function resetSyntheticTestData() {
  if (!isFounderTestModeEnabled()) throw new Error('FOUNDER_TEST_MODE_DISABLED');
  mem.resetDigitalFoundationMemoryStore();
  return { ok: true as const };
}
