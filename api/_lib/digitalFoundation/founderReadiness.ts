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
  createArtifactForLeadDurable,
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
import {
  buildEnvVarGroups,
  detectStripeKeyMode,
  effectivePublicAppOrigin,
  extractSupabaseProjectRefFromUrl,
  isSupabaseIsolationVerifiedForStaging,
  resolveConfiguredPublicAppOrigin,
  SITE00_STAGING_API_ORIGIN,
  SITE00_STAGING_FRONTEND_ORIGIN,
  SITE00_STAGING_SUPABASE_PROJECT_REF,
  type EnvVarGroup,
} from './stagingEnvConfig.js';
import {
  probeDfDatabaseSecurity,
  type DfDatabaseSecuritySnapshot,
} from './stagingDatabaseSecurityProbe.js';

export type EnvVarPresence = { name: string; present: boolean };

export type FounderOverallReadinessStatus =
  | 'BLOCKED'
  | 'ACTION_REQUIRED'
  | 'AWAITING_FOUNDER_APPROVAL'
  | 'UNVERIFIED';

export type FounderReadinessReport = {
  overall_status: FounderOverallReadinessStatus;
  ready: string[];
  needs_founder: string[];
  blocked: string[];
  unverified: string[];
  env_var_groups: EnvVarGroup[];
  database_security: DfDatabaseSecuritySnapshot | null;
  activation: {
    /** Allowlisted email send + Stripe checkout E2E (explicit founder approval only). */
    e2e_authorized: boolean;
    /** Create synthetic client + open real /foundation/:token intake. */
    synthetic_intake_ready: boolean;
    remote_migration_applied: boolean;
    deployment_performed: boolean;
    founder_login_verified: boolean;
  };
  staging_identities: {
    expected_frontend_origin: string;
    expected_api_origin: string;
    configured_public_origin: string | null;
    effective_public_origin: string;
    supabase_project_ref: string | null;
    supabase_staging_isolation_verified: boolean;
    persistence_store: 'supabase' | 'memory';
    email_sending_enabled: boolean;
    stripe_key_mode: ReturnType<typeof detectStripeKeyMode>;
    e2e_passed: false;
  };
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
  return effectivePublicAppOrigin();
}

function fromAddress(): string {
  return process.env.SITE00_DF_TRANSACTIONAL_FROM?.trim() || 'SITE 00 Digital Foundation <hello@site00.com>';
}

function computeOverallStatus(input: {
  blocked: string[];
  needs: string[];
  unverified: string[];
}): FounderOverallReadinessStatus {
  if (input.blocked.length) return 'BLOCKED';
  if (input.needs.length) return 'ACTION_REQUIRED';
  if (input.unverified.length) return 'AWAITING_FOUNDER_APPROVAL';
  return 'UNVERIFIED';
}

export function buildFounderReadinessReport(): FounderReadinessReport {
  const ready: string[] = [];
  const needs: string[] = [];
  const blocked: string[] = [];
  const unverified: string[] = [];
  const groups = buildEnvVarGroups();

  if (isFounderTestModeEnabled()) ready.push('Founder test mode enabled (synthetic clients only)');
  else blocked.push('Set SITE00_DF_FOUNDER_TEST_MODE=1 on Railway API staging service');

  const allowlist = process.env.SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST?.trim();
  if (allowlist) ready.push('Founder test recipient allowlist configured (server-enforced)');
  else blocked.push('Set SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST to founder inbox(es) only');

  if (isDfCommunicationFlagEnabled(DF_COMM_FEATURE_FLAGS.SITE00_DF_TRANSACTIONAL_EMAIL_SEND)) {
    unverified.push('Transactional email send flag is ON — delivery not verified in automated audit');
  } else {
    ready.push('Transactional email sending disabled (SITE00_DF_TRANSACTIONAL_EMAIL_SEND off)');
  }

  if (resendApiKeyConfigured()) unverified.push('Resend API key present — outbound delivery not tested this sprint');
  else needs.push('Add RESEND_API_KEY on Railway API when ready for allowlisted sends');

  if (isSupabaseIsolationVerifiedForStaging()) {
    ready.push(`API Supabase project is staging (${SITE00_STAGING_SUPABASE_PROJECT_REF})`);
  } else {
    blocked.push(
      'Railway API SUPABASE_URL must point only to staging project soocqbyjkxeubfjnuwvf — never production hyycomvcaqxxvyrfupes',
    );
  }

  if (!isSupabaseDfPersistenceEnabled()) {
    needs.push(
      'Set SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1 on Railway API reliable-creation (in-memory store loses data on restart until then)',
    );
  }

  const configuredOrigin = resolveConfiguredPublicAppOrigin();
  const effectiveOrigin = effectivePublicAppOrigin();
  if (!configuredOrigin) {
    needs.push(
      `Set SITE00_PUBLIC_APP_ORIGIN=${SITE00_STAGING_FRONTEND_ORIGIN} on Railway API so invitation and checkout links stay on staging`,
    );
  } else if (effectiveOrigin !== SITE00_STAGING_FRONTEND_ORIGIN.replace(/\/$/, '')) {
    needs.push(
      `SITE00_PUBLIC_APP_ORIGIN is ${effectiveOrigin} — expected ${SITE00_STAGING_FRONTEND_ORIGIN} for this staging stack`,
    );
  }

  const stripeMode = detectStripeKeyMode();
  if (stripeMode === 'live') {
    blocked.push('Stripe secret appears to be LIVE mode — replace with TEST keys on staging before checkout E2E');
  } else if (stripeMode === 'test') {
    unverified.push('Stripe TEST key prefix detected — checkout + webhook flow not verified this sprint');
  } else if (stripeMode === 'missing') {
    needs.push('Add Stripe TEST secret (STRIPE_SECRET_KEY or SITE00_STRIPE_SECRET_KEY) for payment stage');
  } else {
    unverified.push('Stripe secret present but key mode unrecognized — confirm TEST keys manually');
  }

  if (resendWebhookSecretConfigured()) unverified.push('Resend webhook secret present — webhook URL not verified');
  else needs.push('Configure Resend webhook → staging API POST /api/site00/digital-foundation-resend-webhook');

  if (process.env.SITE00_DF_TRANSACTIONAL_FROM?.trim()) ready.push('Transactional From identity configured');
  else needs.push('Set SITE00_DF_TRANSACTIONAL_FROM (verified Resend sender)');

  if (process.env.SITE00_DF_TRANSACTIONAL_REPLY_TO?.trim()) ready.push('Transactional Reply-To configured');
  else needs.push('Set SITE00_DF_TRANSACTIONAL_REPLY_TO');

  needs.push('Verify GoDaddy DKIM + Resend domain (founder DNS — not automated)');
  const deployCommit = getDeploymentIdentity().deploymentCommit;
  ready.push(`API deployment commit ${deployCommit ?? 'unknown'} (verify via ${SITE00_STAGING_API_ORIGIN}/api/health)`);

  const stripeSecret = Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() || process.env.SITE00_STRIPE_SECRET_KEY?.trim(),
  );

  const report: FounderReadinessReport = {
    overall_status: computeOverallStatus({ blocked, needs, unverified }),
    ready,
    needs_founder: needs,
    blocked,
    unverified,
    env_var_groups: groups,
    database_security: null,
    activation: {
      e2e_authorized: false,
      synthetic_intake_ready: false,
      remote_migration_applied: false,
      deployment_performed: false,
      founder_login_verified: false,
    },
    staging_identities: {
      expected_frontend_origin: SITE00_STAGING_FRONTEND_ORIGIN,
      expected_api_origin: SITE00_STAGING_API_ORIGIN,
      configured_public_origin: configuredOrigin,
      effective_public_origin: effectiveOrigin,
      supabase_project_ref: extractSupabaseProjectRefFromUrl(process.env.SUPABASE_URL),
      supabase_staging_isolation_verified: isSupabaseIsolationVerifiedForStaging(),
      persistence_store: isSupabaseDfPersistenceEnabled() ? 'supabase' : 'memory',
      email_sending_enabled: isDfCommunicationFlagEnabled(DF_COMM_FEATURE_FLAGS.SITE00_DF_TRANSACTIONAL_EMAIL_SEND),
      stripe_key_mode: stripeMode,
      e2e_passed: false,
    },
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
  return report;
}

export type FounderReadinessBuildContext = {
  founder_admin_verified?: boolean;
  founder_email?: string | null;
};

/** Adds live PostgREST exposure probes (staging API only; no secrets in response). */
export async function buildFounderReadinessReportAsync(
  ctx: FounderReadinessBuildContext = {},
): Promise<FounderReadinessReport> {
  const report = buildFounderReadinessReport();
  if (!process.env.SUPABASE_URL?.trim() || !process.env.SUPABASE_ANON_KEY?.trim()) {
    report.unverified.push('Database security probe skipped — SUPABASE_URL or SUPABASE_ANON_KEY not configured on API');
    report.overall_status = computeOverallStatus({
      blocked: report.blocked,
      needs: report.needs_founder,
      unverified: report.unverified,
    });
    return report;
  }

  let db: Awaited<ReturnType<typeof probeDfDatabaseSecurity>> | null = null;
  try {
    db = await probeDfDatabaseSecurity();
    report.database_security = db;
    if (!db.persistence_safe) {
      report.blocked.push('PostgREST anon can read site00_df_project_messages — staging database exposure risk');
    }
    for (const note of db.notes) {
      if (note.startsWith('BLOCKER:') && !report.blocked.includes(note.replace(/^BLOCKER:\s*/, ''))) {
        report.blocked.push(note.replace(/^BLOCKER:\s*/, ''));
      }
    }
  } catch {
    report.unverified.push('Database security probe failed — treat staging DB as UNVERIFIED');
  }

  const { applyStagingRuntimeReconciliation } = await import('./stagingReadinessRuntime.js');
  applyStagingRuntimeReconciliation(report, {
    founder_admin_verified: Boolean(ctx.founder_admin_verified),
    founder_email: ctx.founder_email,
  }, db);

  report.overall_status = computeOverallStatus({
    blocked: report.blocked,
    needs: report.needs_founder,
    unverified: report.unverified,
  });
  return report;
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
  invitation_uses_configured_origin: boolean;
  configured_public_origin: string;
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
  const stagingOrigin = assetBaseFromEnv();
  const invitation_link_valid = invitation_links.some((l) => l.includes(expectedPath));
  const invitation_uses_staging_origin = invitation_links.some((l) => l.startsWith(`${stagingOrigin}/foundation/`));

  if (intent.template_id === 'personal-foundation-invitation' && !invitation_link_valid) {
    blockers.push('INVITATION_LINK_MISSING_OR_MISMATCH');
  }
  if (
    intent.template_id === 'personal-foundation-invitation' &&
    invitation_link_valid &&
    !invitation_uses_staging_origin &&
    stagingOrigin !== 'https://site00.com'
  ) {
    blockers.push('INVITATION_LINK_NOT_USING_SITE00_PUBLIC_APP_ORIGIN');
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
    invitation_uses_configured_origin: invitation_uses_staging_origin,
    configured_public_origin: stagingOrigin,
    allowlisted_recipient: isRecipientAllowedForFounderTestSend(intent.recipient_email),
    synthetic_artifact: synthetic,
    ready_to_send: blockers.length === 0,
    blockers,
    html_preview_chars: html.length,
  };
}

export async function createSyntheticTestClient(input: {
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
  const artifact = await createArtifactForLeadDurable({
    lead_id: lead.lead_id,
    business_name: business,
    contact_email: input.contact_email,
  });
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

export async function resetSyntheticTestData() {
  if (!isFounderTestModeEnabled()) throw new Error('FOUNDER_TEST_MODE_DISABLED');
  mem.resetDigitalFoundationMemoryStore();
  if (isSupabaseDfPersistenceEnabled()) {
    const { syncAllArtifactsIntoMemory } = await import('./persistence/supabaseStore.js');
    await syncAllArtifactsIntoMemory();
  }
  return { ok: true as const };
}

