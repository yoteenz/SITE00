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
import { isSupabaseDfPersistenceEnabled } from './persistence/supabaseStore.js';
import { getDeploymentIdentity } from '../site00ExpressionEngine/deploymentIdentity.js';
import { renderFndatnForDispatch, supportsFndatnTemplate } from './communications/fndatnTemplateBridge.js';
import { isRecipientAllowedForFounderTestSend } from '../../../shared/site00-digital-foundation/founderTestMode.js';
import { resendWebhookSecretConfigured } from './communications/resendWebhookHandler.js';

export type EnvVarPresence = { name: string; present: boolean };

export type FounderReadinessReport = {
  ready: string[];
  needs_founder: string[];
  blocked: string[];
  env: {
    founder_test_mode: boolean;
    transactional_send_flag: boolean;
    resend_configured: boolean;
    allowlist_configured: boolean;
    supabase_persistence: boolean;
    stripe_secret_present: boolean;
    stripe_webhook_secret_present: boolean;
    resend_webhook_secret_present: boolean;
    transactional_from_present: boolean;
    transactional_reply_to_present: boolean;
  };
  deployment: {
    commit_short: string | null;
    pr1642_reference: 'PR #1642';
    package_marker: 'founder-readiness-e2e-v1';
  };
  env_vars: EnvVarPresence[];
};

export function buildEnvVarPresenceSnapshot(): EnvVarPresence[] {
  const names = [
    'SITE00_DF_FOUNDER_TEST_MODE',
    'SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST',
    'SITE00_DF_TRANSACTIONAL_EMAIL_SEND',
    'RESEND_API_KEY',
    'RESEND_WEBHOOK_SECRET',
    'SITE00_RESEND_WEBHOOK_SECRET',
    'SITE00_DF_TRANSACTIONAL_FROM',
    'SITE00_DF_TRANSACTIONAL_REPLY_TO',
    'SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE',
    'STRIPE_SECRET_KEY',
    'SITE00_STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SITE00_STRIPE_WEBHOOK_SECRET',
    'SITE00_PUBLIC_APP_ORIGIN',
  ];
  return names.map((name) => ({ name, present: Boolean(process.env[name]?.trim()) }));
}

function assetBaseFromEnv(): string {
  const raw = process.env.SITE00_PUBLIC_APP_ORIGIN?.trim() || process.env.VITE_SITE00_PUBLIC_ORIGIN?.trim();
  if (raw && /^https:\/\//i.test(raw)) return raw.replace(/\/$/, '');
  return 'https://site00.com';
}

function fromAddress(): string {
  return process.env.SITE00_DF_TRANSACTIONAL_FROM?.trim() || 'SITE 00 Digital Foundation <hello@site00.com>';
}

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

  if (isSupabaseDfPersistenceEnabled()) ready.push('SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1');
  else needs.push('Enable SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1 for durable intake across API restarts');

  if (process.env.SITE00_DF_TRANSACTIONAL_FROM?.trim()) ready.push('SITE00_DF_TRANSACTIONAL_FROM present');
  else needs.push('Set SITE00_DF_TRANSACTIONAL_FROM (verified Resend sender identity)');

  if (process.env.SITE00_DF_TRANSACTIONAL_REPLY_TO?.trim()) ready.push('SITE00_DF_TRANSACTIONAL_REPLY_TO present');
  else needs.push('Set SITE00_DF_TRANSACTIONAL_REPLY_TO (typically hello@site00.com)');

  if (resendWebhookSecretConfigured()) ready.push('Resend webhook secret present (DELIVERED/BOUNCED tracking)');
  else needs.push('Add RESEND_WEBHOOK_SECRET after registering POST /api/site00/digital-foundation-resend-webhook in Resend');

  const stripeSecret = Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() || process.env.SITE00_STRIPE_SECRET_KEY?.trim(),
  );
  if (stripeSecret) ready.push('Stripe secret key present (use TEST keys only for founder E2E)');
  else needs.push('Add Stripe TEST secret key on Railway for hosted checkout stage');

  needs.push('Verify GoDaddy DKIM + Resend domain (founder DNS approval card — no auto DNS)');
  needs.push('Complete Stripe TEST checkout in founder test workspace when exercising payment stage');

  const deployCommit = getDeploymentIdentity().deploymentCommit;
  needs.push(
    `Confirm Railway API serves PR #1642 (check /api/health → digitalFoundation.founderReadiness after merge; current build ${deployCommit ?? 'unknown'})`,
  );

  return {
    ready,
    needs_founder: needs,
    blocked,
    env: {
      founder_test_mode: isFounderTestModeEnabled(),
      transactional_send_flag: isDfCommunicationFlagEnabled(DF_COMM_FEATURE_FLAGS.SITE00_DF_TRANSACTIONAL_EMAIL_SEND),
      resend_configured: resendApiKeyConfigured(),
      allowlist_configured: Boolean(allowlist),
      supabase_persistence: isSupabaseDfPersistenceEnabled(),
      stripe_secret_present: stripeSecret,
      stripe_webhook_secret_present: Boolean(
        process.env.STRIPE_WEBHOOK_SECRET?.trim() || process.env.SITE00_STRIPE_WEBHOOK_SECRET?.trim(),
      ),
      resend_webhook_secret_present: resendWebhookSecretConfigured(),
      transactional_from_present: Boolean(process.env.SITE00_DF_TRANSACTIONAL_FROM?.trim()),
      transactional_reply_to_present: Boolean(process.env.SITE00_DF_TRANSACTIONAL_REPLY_TO?.trim()),
    },
    deployment: {
      commit_short: deployCommit,
      pr1642_reference: 'PR #1642',
      package_marker: 'founder-readiness-e2e-v1',
    },
    env_vars: buildEnvVarPresenceSnapshot(),
  };
}

export type TestInvitationPreview = {
  intent_id: string;
  template_id: string;
  event_type: string;
  recipient_masked: string;
  subject: string;
  from_identity: string;
  reply_to_configured: boolean;
  invitation_links: string[];
  invitation_link_valid: boolean;
  allowlisted_recipient: boolean;
  synthetic_artifact: boolean;
  ready_to_send: boolean;
  blockers: string[];
  html_preview_chars: number;
};

export function prepareTestInvitation(intentId: string): TestInvitationPreview {
  const state = mem.getDfMemoryState();
  const intent = [...state.sendIntents.values()].find((i) => i.intent_id === intentId);
  if (!intent) throw new Error('INTENT_NOT_FOUND');

  const payload = getArtifactPayload(intent.artifact_id);
  const synthetic = isSyntheticBusinessName(payload.lead.business_name ?? payload.artifact.intake.business_name);
  const blockers: string[] = [];

  if (!isFounderTestModeEnabled()) blockers.push('SITE00_DF_FOUNDER_TEST_MODE is off');
  if (!synthetic) blockers.push('NOT_SYNTHETIC_ARTIFACT');
  if (!isRecipientAllowedForFounderTestSend(intent.recipient_email)) blockers.push('RECIPIENT_NOT_ON_FOUNDER_ALLOWLIST');
  if (!supportsFndatnTemplate(intent.template_id)) blockers.push(`NO_FNDATN_RENDERER_FOR_${intent.template_id}`);
  if (!isDfCommunicationFlagEnabled(DF_COMM_FEATURE_FLAGS.SITE00_DF_TRANSACTIONAL_EMAIL_SEND)) {
    blockers.push('SITE00_DF_TRANSACTIONAL_EMAIL_SEND is off (intent stays DRY_RUN until enabled)');
  }
  if (!resendApiKeyConfigured()) blockers.push('RESEND_API_KEY not configured on API');

  const rendered = supportsFndatnTemplate(intent.template_id)
    ? renderFndatnForDispatch(intent.template_id, payload, assetBaseFromEnv())
    : null;
  if (!rendered) blockers.push('RENDER_FAILED');

  const html = rendered?.html ?? '';
  const linkRe = /https?:\/\/[^\s"'<>]+\/foundation\/[A-Za-z0-9_-]+/g;
  const invitation_links = [...new Set(html.match(linkRe) ?? [])];
  const expectedPath = `/foundation/${payload.artifact.public_token}`;
  const invitation_link_valid = invitation_links.some((l) => l.includes(expectedPath));

  if (intent.template_id === 'personal-foundation-invitation' && !invitation_link_valid) {
    blockers.push('INVITATION_LINK_MISSING_OR_MISMATCH');
  }

  const recipient_masked = intent.recipient_email.replace(/(.{2}).+(@.+)/, '$1•••$2');

  return {
    intent_id: intent.intent_id,
    template_id: intent.template_id,
    event_type: intent.event_type,
    recipient_masked,
    subject: rendered?.subject ?? '—',
    from_identity: fromAddress(),
    reply_to_configured: Boolean(process.env.SITE00_DF_TRANSACTIONAL_REPLY_TO?.trim()),
    invitation_links,
    invitation_link_valid,
    allowlisted_recipient: isRecipientAllowedForFounderTestSend(intent.recipient_email),
    synthetic_artifact: synthetic,
    ready_to_send: blockers.length === 0,
    blockers,
    html_preview_chars: html.length,
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

export async function dispatchQueuedEmail(intentId: string, opts: { founderApprovedSend?: boolean } = {}) {
  if (!opts.founderApprovedSend) {
    const preview = prepareTestInvitation(intentId);
    return { preview, intent: null as null, blocked: 'FOUNDER_APPROVAL_REQUIRED — pass founder_approved_send: true to dispatch via Resend' };
  }
  const result = await processSendIntent(intentId);
  return { preview: prepareTestInvitation(intentId), intent: result.intent, blocked: result.blocked };
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
