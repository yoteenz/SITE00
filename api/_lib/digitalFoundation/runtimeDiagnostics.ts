/**
 * Non-secret Digital Foundation runtime flags for /api/health (launch certification).
 */
import { isLaunchGateIntakeOnly } from '../../../shared/site00-digital-foundation/launchGate.js';
import {
  DF_FEATURE_FLAGS,
  isDigitalFoundationFlagEnabled,
} from '../../../shared/site00-digital-foundation/featureFlags.js';
import { isSupabaseDfPersistenceEnabled } from './persistence/supabaseStore.js';
import { isFounderTestModeEnabled } from '../../../shared/site00-digital-foundation/founderTestMode.js';
import { isDfCommunicationFlagEnabled, DF_COMM_FEATURE_FLAGS } from '../../../shared/site00-digital-foundation/communications/featureFlags.js';
import { resendApiKeyConfigured } from './communications/resendAdapter.js';
import { resendWebhookSecretConfigured } from './communications/resendWebhookHandler.js';
import {
  detectStripeKeyMode,
  effectivePublicAppOrigin,
  extractSupabaseProjectRefFromUrl,
  isSupabaseIsolationVerifiedForStaging,
  resolveConfiguredPublicAppOrigin,
  SITE00_STAGING_FRONTEND_ORIGIN,
} from './stagingEnvConfig.js';

export type DigitalFoundationRuntimeDiagnostics = {
  persistSupabaseEnv: boolean;
  persistenceStore: 'supabase' | 'memory';
  launchGateIntakeOnly: boolean;
  artifactV1: boolean;
  checkoutV1: boolean;
  projectPortalV2: boolean;
  migrationFilesExpected: string[];
  supabaseProjectRef: string | null;
  supabaseStagingIsolationVerified: boolean;
  publicAppOriginConfigured: boolean;
  publicAppOriginEffective: string;
  publicAppOriginMatchesStagingFrontend: boolean;
  /** PR #1642 founder E2E — env presence only (no secret values). */
  founderReadiness: {
    workspaceApiPresent: boolean;
    founderTestModeEnv: boolean;
    allowlistEnvPresent: boolean;
    resendApiKeyPresent: boolean;
    resendWebhookSecretPresent: boolean;
    transactionalFromPresent: boolean;
    transactionalReplyToPresent: boolean;
    transactionalSendFlag: boolean;
    stripeSecretPresent: boolean;
    stripeWebhookSecretPresent: boolean;
    stripeKeyMode: ReturnType<typeof detectStripeKeyMode>;
  };
};

export function getDigitalFoundationRuntimeDiagnostics(): DigitalFoundationRuntimeDiagnostics {
  const stripeSecret = Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() || process.env.SITE00_STRIPE_SECRET_KEY?.trim(),
  );
  const stripeWebhook = Boolean(
    process.env.STRIPE_WEBHOOK_SECRET?.trim() || process.env.SITE00_STRIPE_WEBHOOK_SECRET?.trim(),
  );
  const persist = isSupabaseDfPersistenceEnabled();
  const configuredOrigin = resolveConfiguredPublicAppOrigin();
  const effectiveOrigin = effectivePublicAppOrigin();
  const supabaseRef = extractSupabaseProjectRefFromUrl(process.env.SUPABASE_URL);

  return {
    persistSupabaseEnv: persist,
    persistenceStore: persist ? 'supabase' : 'memory',
    launchGateIntakeOnly: isLaunchGateIntakeOnly(),
    artifactV1: isDigitalFoundationFlagEnabled(DF_FEATURE_FLAGS.SITE00_DIGITAL_FOUNDATION_ARTIFACT_V1),
    checkoutV1: isDigitalFoundationFlagEnabled(DF_FEATURE_FLAGS.SITE00_DIGITAL_FOUNDATION_CHECKOUT_V1),
    projectPortalV2: isDigitalFoundationFlagEnabled(DF_FEATURE_FLAGS.SITE00_DIGITAL_FOUNDATION_PROJECT_PORTAL_V2),
    supabaseProjectRef: supabaseRef,
    supabaseStagingIsolationVerified: isSupabaseIsolationVerifiedForStaging(),
    publicAppOriginConfigured: Boolean(configuredOrigin),
    publicAppOriginEffective: effectiveOrigin,
    publicAppOriginMatchesStagingFrontend:
      effectiveOrigin.replace(/\/$/, '') === SITE00_STAGING_FRONTEND_ORIGIN.replace(/\/$/, ''),
    founderReadiness: {
      workspaceApiPresent: true,
      founderTestModeEnv: isFounderTestModeEnabled(),
      allowlistEnvPresent: Boolean(process.env.SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST?.trim()),
      resendApiKeyPresent: resendApiKeyConfigured(),
      resendWebhookSecretPresent: resendWebhookSecretConfigured(),
      transactionalFromPresent: Boolean(process.env.SITE00_DF_TRANSACTIONAL_FROM?.trim()),
      transactionalReplyToPresent: Boolean(process.env.SITE00_DF_TRANSACTIONAL_REPLY_TO?.trim()),
      transactionalSendFlag: isDfCommunicationFlagEnabled(DF_COMM_FEATURE_FLAGS.SITE00_DF_TRANSACTIONAL_EMAIL_SEND),
      stripeSecretPresent: stripeSecret,
      stripeWebhookSecretPresent: stripeWebhook,
      stripeKeyMode: detectStripeKeyMode(),
    },
    migrationFilesExpected: [
      '20261008160000_site00_digital_foundation_artifact_v1.sql',
      '20261008170000_site00_digital_foundation_persistence_v2.sql',
      '20261010103000_site00_df_project_messaging.sql',
      '20261015120000_site00_df_project_messages_rls.sql',
    ],
  };
}
