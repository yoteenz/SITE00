/**
 * Non-secret Digital Foundation runtime flags for /api/health (launch certification).
 */
import { isLaunchGateIntakeOnly } from '../../../shared/site00-digital-foundation/launchGate.js';
import {
  DF_FEATURE_FLAGS,
  isDigitalFoundationFlagEnabled,
} from '../../../shared/site00-digital-foundation/featureFlags.js';
import { isSupabaseDfPersistenceEnabled } from './persistence/supabaseStore.js';

export type DigitalFoundationRuntimeDiagnostics = {
  persistSupabaseEnv: boolean;
  launchGateIntakeOnly: boolean;
  artifactV1: boolean;
  checkoutV1: boolean;
  projectPortalV2: boolean;
  migrationFilesExpected: string[];
};

export function getDigitalFoundationRuntimeDiagnostics(): DigitalFoundationRuntimeDiagnostics {
  return {
    persistSupabaseEnv: isSupabaseDfPersistenceEnabled(),
    launchGateIntakeOnly: isLaunchGateIntakeOnly(),
    artifactV1: isDigitalFoundationFlagEnabled(DF_FEATURE_FLAGS.SITE00_DIGITAL_FOUNDATION_ARTIFACT_V1),
    checkoutV1: isDigitalFoundationFlagEnabled(DF_FEATURE_FLAGS.SITE00_DIGITAL_FOUNDATION_CHECKOUT_V1),
    projectPortalV2: isDigitalFoundationFlagEnabled(DF_FEATURE_FLAGS.SITE00_DIGITAL_FOUNDATION_PROJECT_PORTAL_V2),
    migrationFilesExpected: [
      '20261008160000_site00_digital_foundation_artifact_v1.sql',
      '20261008170000_site00_digital_foundation_persistence_v2.sql',
      '20261010103000_site00_df_project_messaging.sql',
    ],
  };
}
