/**
 * Founder-authorized single-click staging E2E: real lifecycle ops + real Resend dispatch.
 * Server-only. Requires founder admin auth at API boundary.
 */
import {
  AUTOMATED_JOURNEY_STAGES,
  FOUNDER_E2E_AUTHORIZED_TESTER_EMAIL,
  formatE2eRunId,
  type AutomatedJourneyStageId,
  type EmailJourneyRunStatus,
} from '../../../shared/site00-digital-foundation/founderE2eEmailJourney.js';
import { isFounderTestModeEnabled, isRecipientAllowedForFounderTestSend } from '../../../shared/site00-digital-foundation/founderTestMode.js';
import { isDfCommunicationFlagEnabled, DF_COMM_FEATURE_FLAGS } from '../../../shared/site00-digital-foundation/communications/featureFlags.js';
import { isSupabaseDfPersistenceEnabled } from './persistence/supabaseStore.js';
import { isSupabaseIsolationVerifiedForStaging, resolveConfiguredPublicAppOrigin, detectStripeKeyMode } from './stagingEnvConfig.js';
import { resendApiKeyConfigured } from './communications/resendAdapter.js';
import * as mem from './memoryStore.js';
import {
  acceptQuote,
  getArtifactPayload,
  markFoundationComplete,
  markQuoteCommerciallyReady,
  updateProjectStage,
} from './service.js';
import {
  advanceSyntheticIntakeSubmitted,
  advanceSyntheticQuoteReady,
  createSyntheticTestClient,
} from './founderReadiness.js';
import { listSendIntentsForArtifact, processSendIntent } from './communications/deliveryWorker.js';
import { refreshIntentDeliveryFromResend } from './communications/resendDeliveryPoll.js';
import { simulateStripeCheckoutCompleted } from './payment/webhookHandler.js';
import type { CommunicationSendIntent } from '../../../shared/site00-digital-foundation/communications/types.js';

const E2E_ACCEPT_DISCLOSURES = [
  'I HAVE REVIEWED MY DIGITAL FOUNDATION SCOPE.',
  'I UNDERSTAND THAT DOMAIN / EMAIL PROVIDER SUBSCRIPTIONS AND OTHER THIRD-PARTY FEES MAY BE SEPARATE.',
  'I UNDERSTAND THAT THE PROJECTED TURNAROUND BEGINS AFTER REQUIRED INFORMATION, ACCESS AND PAYMENT ARE RECEIVED.',
] as const;

export type JourneyStageResult = {
  stage_id: AutomatedJourneyStageId;
  ok: boolean;
  error?: string;
  intent_ids: string[];
  provider_message_ids: string[];
};

export type EmailJourneyRunRecord = {
  run_id: string;
  status: EmailJourneyRunStatus;
  artifact_id: string | null;
  public_token_masked: string | null;
  personalized_url: string | null;
  contact_email_masked: string;
  started_at: string;
  completed_at: string | null;
  stages: JourneyStageResult[];
  error: string | null;
};

let activeRunId: string | null = null;
const runs = new Map<string, EmailJourneyRunRecord>();

function maskEmail(email: string): string {
  return email.replace(/(.{2}).+(@.+)/, '$1•••$2');
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function getActiveAutomatedE2eRunId(): string | null {
  return activeRunId;
}

export function getEmailJourneyRun(runId: string): EmailJourneyRunRecord | null {
  return runs.get(runId) ?? null;
}

export function listEmailJourneyRuns(): EmailJourneyRunRecord[] {
  return [...runs.values()].sort((a, b) => b.started_at.localeCompare(a.started_at));
}

function preflightBlockers(): string[] {
  const blockers: string[] = [];
  if (!isFounderTestModeEnabled()) blockers.push('SITE00_DF_FOUNDER_TEST_MODE is off');
  if (!isDfCommunicationFlagEnabled(DF_COMM_FEATURE_FLAGS.SITE00_DF_TRANSACTIONAL_EMAIL_SEND)) {
    blockers.push('SITE00_DF_TRANSACTIONAL_EMAIL_SEND is off');
  }
  if (!resendApiKeyConfigured()) blockers.push('RESEND_API_KEY not configured');
  if (!isRecipientAllowedForFounderTestSend(FOUNDER_E2E_AUTHORIZED_TESTER_EMAIL)) {
    blockers.push(`Allowlist must include ${FOUNDER_E2E_AUTHORIZED_TESTER_EMAIL}`);
  }
  if (!resolveConfiguredPublicAppOrigin()) {
    blockers.push('SITE00_PUBLIC_APP_ORIGIN not configured (email links)');
  }
  if (isSupabaseDfPersistenceEnabled() && !isSupabaseIsolationVerifiedForStaging()) {
    blockers.push('Supabase URL is not staging-isolated');
  }
  const stripe = detectStripeKeyMode();
  if (stripe === 'live') blockers.push('Stripe live key detected — abort');
  return blockers;
}

async function dispatchLatestIntentForEvent(
  artifactId: string,
  eventType: CommunicationSendIntent['event_type'],
  templateId: string,
): Promise<{ intents: CommunicationSendIntent[]; error?: string }> {
  const intents = listSendIntentsForArtifact(artifactId).filter(
    (i) => i.event_type === eventType && i.template_id === templateId,
  );
  const intent = intents.sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  if (!intent) return { intents: [], error: `No intent for ${eventType}/${templateId}` };

  if (intent.status === 'DELIVERED') return { intents: [intent] };

  const result = await processSendIntent(intent.intent_id, { e2eRunAuthorized: true });
  if (result.blocked) return { intents: [result.intent], error: result.blocked };

  await pollIntentDelivery(intent.intent_id, 3, 4000);
  const refreshed = listSendIntentsForArtifact(artifactId).find((i) => i.intent_id === intent.intent_id)!;
  return { intents: [refreshed] };
}

async function pollIntentDelivery(intentId: string, attempts: number, delayMs: number) {
  for (let i = 0; i < attempts; i++) {
    await refreshIntentDeliveryFromResend(intentId);
    const intent = [...mem.getDfMemoryState().sendIntents.values()].find((x) => x.intent_id === intentId);
    if (intent?.status === 'DELIVERED' || intent?.status === 'BOUNCED' || intent?.status === 'FAILED') break;
    if (i < attempts - 1) await sleep(delayMs);
  }
}

function stageOk(id: AutomatedJourneyStageId, intentIds: string[], providerIds: string[]): JourneyStageResult {
  return {
    stage_id: id,
    ok: true,
    intent_ids: intentIds,
    provider_message_ids: providerIds.filter(Boolean),
  };
}

function stageFail(id: AutomatedJourneyStageId, error: string, intentIds: string[] = []): JourneyStageResult {
  return { stage_id: id, ok: false, error, intent_ids: intentIds, provider_message_ids: [] };
}

/**
 * One founder authorization — full automated lifecycle + Resend sends for authorized tester only.
 */
export async function startAutomatedEmailJourneyRun(opts: {
  contact_email?: string;
  test_run_id?: string;
}): Promise<EmailJourneyRunRecord> {
  if (activeRunId) {
    const existing = runs.get(activeRunId);
    if (existing && (existing.status === 'RUNNING' || existing.status === 'WAITING_ON_PROVIDER')) {
      throw new Error('E2E_RUN_ALREADY_ACTIVE');
    }
  }

  const email = (opts.contact_email ?? FOUNDER_E2E_AUTHORIZED_TESTER_EMAIL).trim().toLowerCase();
  if (email !== FOUNDER_E2E_AUTHORIZED_TESTER_EMAIL.toLowerCase()) {
    throw new Error('E2E_RECIPIENT_NOT_AUTHORIZED');
  }
  if (!isRecipientAllowedForFounderTestSend(email)) {
    throw new Error('RECIPIENT_NOT_ON_ALLOWLIST');
  }

  const runId = opts.test_run_id?.trim() || formatE2eRunId();
  const record: EmailJourneyRunRecord = {
    run_id: runId,
    status: 'PREFLIGHT',
    artifact_id: null,
    public_token_masked: null,
    personalized_url: null,
    contact_email_masked: maskEmail(email),
    started_at: new Date().toISOString(),
    completed_at: null,
    stages: [],
    error: null,
  };
  runs.set(runId, record);
  activeRunId = runId;

  const preflight = preflightBlockers();
  if (preflight.length) {
    record.status = 'FAILED';
    record.error = preflight.join('; ');
    record.stages.push(stageFail('PREFLIGHT', record.error));
    record.completed_at = new Date().toISOString();
    activeRunId = null;
    return record;
  }
  record.stages.push(stageOk('PREFLIGHT', [], []));
  record.status = 'RUNNING';

  try {
    const created = await createSyntheticTestClient({
      display_name: 'E2E Email Journey',
      contact_email: email,
      contact_name: 'Kateena Test',
      test_run_id: runId,
    });
    record.artifact_id = created.artifact.artifact_id;
    record.public_token_masked = `${created.artifact.public_token.slice(0, 4)}…${created.artifact.public_token.slice(-4)}`;
    record.personalized_url = created.personalized_url;
    record.stages.push(stageOk('CREATE_PROJECT', [], []));

    let step = await dispatchLatestIntentForEvent(
      created.artifact.artifact_id,
      'ARTIFACT_CREATED',
      'personal-foundation-invitation',
    );
    if (step.error) throw new Error(step.error);
    record.stages.push(
      stageOk(
        'INVITATION',
        step.intents.map((i) => i.intent_id),
        step.intents.map((i) => i.provider_message_id ?? ''),
      ),
    );
    await sleep(800);

    advanceSyntheticIntakeSubmitted(created.artifact.artifact_id);
    step = await dispatchLatestIntentForEvent(created.artifact.artifact_id, 'INTAKE_COMPLETED', 'intake-completed');
    if (step.error) throw new Error(step.error);
    record.stages.push(
      stageOk(
        'INTAKE_COMPLETE',
        step.intents.map((i) => i.intent_id),
        step.intents.map((i) => i.provider_message_id ?? ''),
      ),
    );
    await sleep(800);

    advanceSyntheticQuoteReady(created.artifact.artifact_id);
    step = await dispatchLatestIntentForEvent(created.artifact.artifact_id, 'QUOTE_CREATED', 'quote-ready');
    if (step.error) throw new Error(step.error);
    record.stages.push(
      stageOk(
        'QUOTE_READY',
        step.intents.map((i) => i.intent_id),
        step.intents.map((i) => i.provider_message_id ?? ''),
      ),
    );
    await sleep(800);

    acceptQuote({ artifact_id: created.artifact.artifact_id, disclosures: [...E2E_ACCEPT_DISCLOSURES] });
    markQuoteCommerciallyReady(created.artifact.artifact_id);
    record.stages.push(stageOk('QUOTE_ACCEPTANCE', [], []));
    await sleep(400);

    const payload = getArtifactPayload(created.artifact.artifact_id);
    const quoteId = payload.quote?.quote_id;
    if (!quoteId) throw new Error('QUOTE_MISSING');

    const stripeMode = detectStripeKeyMode();
    if (stripeMode === 'test' || process.env.SITE00_DF_FOUNDER_E2E_STRIPE_SIM === '1') {
      await simulateStripeCheckoutCompleted({
        artifact_id: created.artifact.artifact_id,
        quote_id: quoteId,
        event_id: `evt_e2e_${runId}`,
      });
    } else {
      throw new Error('STRIPE_TEST_PAYMENT_REQUIRES_TEST_KEY_OR_SITE00_DF_FOUNDER_E2E_STRIPE_SIM=1');
    }

    step = await dispatchLatestIntentForEvent(created.artifact.artifact_id, 'PAYMENT_CONFIRMED', 'payment-confirmed');
    if (step.error) throw new Error(step.error);
    record.stages.push(
      stageOk(
        'PAYMENT_VERIFIED',
        step.intents.map((i) => i.intent_id),
        step.intents.map((i) => i.provider_message_id ?? ''),
      ),
    );
    await sleep(800);

    for (const stageCode of [
      '02_DOMAIN',
      '03_PROFESSIONAL_EMAIL',
      '04_DNS_SECURITY',
      '05_DEVICE_SIGNATURE',
      '06_FINAL_VERIFICATION',
    ] as const) {
      updateProjectStage(created.artifact.artifact_id, stageCode, 'COMPLETE');
    }

    markFoundationComplete(
      created.artifact.artifact_id,
      {
        business: payload.lead.business_name ?? 'SYNTH · E2E',
        domain: 'e2e-test.example.com',
        registrar: 'Staging Test Registrar (SIMULATED_TEST_EVIDENCE)',
        renewal_date: null,
        email_provider: 'Staging Mailbox',
        primary_mailbox: 'hello@e2e-test.example.com',
        aliases: [],
        dns_status: 'CONFIGURED',
        security_status: 'SIMULATED_TEST_EVIDENCE',
        owner: payload.lead.contact_name ?? 'Test',
        administrative_access_model: 'Staging E2E — not production delivery',
      },
      { founder_override: true, override_reason: 'Automated staging E2E email journey' },
    );

    step = await dispatchLatestIntentForEvent(
      created.artifact.artifact_id,
      'FOUNDATION_COMPLETED',
      'foundation-complete',
    );
    if (step.error) throw new Error(step.error);
    record.stages.push(
      stageOk(
        'FOUNDATION_COMPLETE',
        step.intents.map((i) => i.intent_id),
        step.intents.map((i) => i.provider_message_id ?? ''),
      ),
    );

    record.status = 'COMPLETED';
    record.completed_at = new Date().toISOString();
  } catch (e) {
    record.status = 'FAILED';
    record.error = e instanceof Error ? e.message : 'E2E_RUN_FAILED';
    record.completed_at = new Date().toISOString();
  } finally {
    activeRunId = null;
  }

  return record;
}

export function summarizeRunEmailStats(run: EmailJourneyRunRecord) {
  if (!run.artifact_id) {
    return { triggered: 0, sent: 0, delivered: 0, failed: 0, duplicated: 0 };
  }
  const intents = listSendIntentsForArtifact(run.artifact_id);
  const sent = intents.filter((i) => i.provider_message_id || i.status === 'ACCEPTED' || i.status === 'SENT' || i.status === 'DELIVERED');
  const delivered = intents.filter((i) => i.status === 'DELIVERED');
  const failed = intents.filter((i) => i.status === 'FAILED' || i.status === 'BOUNCED');
  const keys = new Set(intents.map((i) => i.idempotency_key));
  return {
    triggered: intents.length,
    sent: sent.length,
    delivered: delivered.length,
    failed: failed.length,
    duplicated: intents.length - keys.size,
  };
}

export { AUTOMATED_JOURNEY_STAGES };
