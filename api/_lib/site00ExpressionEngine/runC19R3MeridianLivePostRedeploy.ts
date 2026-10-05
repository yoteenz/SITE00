/**
 * C1.9R3 — Post-redeploy live FULL_REASONING execution + Meridian comparison.
 */

import { MERIDIAN_ATELIER_LAUNCH_BRIEF } from './brandLanguage/c19BlindBrandFixture.js';
import { getDeploymentIdentity, type DeploymentIdentity } from './deploymentIdentity.js';
import {
  applyMeridianLiveAcceptanceEnv,
  captureMeridianLiveAcceptanceEnv,
  restoreMeridianLiveAcceptanceEnv,
} from './meridianLiveAcceptanceEnv.js';
import {
  runC19R1MeridianLiveProof,
  isC19R1LivePass,
  type C19R1MeridianLiveProofResult,
} from './runC19R1MeridianLiveProof.js';
import {
  verifyRailwayProviderConfig,
  verifyRailwayProviderHealthExtended,
  redactSecretsFromPayload,
} from './railwayProviderConfig.js';
import { getLastProviderCallDiagnostics } from './seniorCreativeJudgment/creativeReasoningProvider.js';
import { getPreservedControlRun } from './meridianLiveProofStore.js';
import { ANTHROPIC_CREATIVE_MODEL } from '../site00Evolve/creativeDirection/creativeIntelligence/config.js';

export type C19R3AcceptanceStatus =
  | 'FULL_REASONING_LIVE_PASS'
  | 'FULL_REASONING_LIVE_TEST_BLOCKED'
  | 'RAILWAY_PROVIDER_CONFIG_BLOCKED'
  | 'RAILWAY_DEPLOYMENT_STALE_OR_BLOCKED'
  | 'REASONING_PROVIDER_FAILURE'
  | 'CONTROL_COMPARISON_INVALID';

export type C19R3MeridianLivePostRedeployResult = C19R1MeridianLiveProofResult & {
  sprint: 'C1.9R3_LIVE_POST_REDEPLOY';
  deployment: DeploymentIdentity;
  railwayBaselineConfig: ReturnType<typeof verifyRailwayProviderConfig>;
  liveAcceptanceEnvOverride: boolean;
  mockMode: boolean;
  fallbackForcedAtBaseline: boolean;
  testProvider: boolean;
  acceptanceStatus: C19R3AcceptanceStatus;
  sameBriefKey: string;
  controlRunId: string;
  fullReasoningRunId: string | null;
  providerDiagnostics?: ReturnType<typeof getLastProviderCallDiagnostics>;
};

function expectedBriefKey(): string {
  return MERIDIAN_ATELIER_LAUNCH_BRIEF.briefId;
}

export async function runC19R3MeridianLivePostRedeploy(): Promise<C19R3MeridianLivePostRedeployResult> {
  const deployment = getDeploymentIdentity();
  const railwayBaselineConfig = verifyRailwayProviderConfig();
  const envSnapshot = captureMeridianLiveAcceptanceEnv();
  const fallbackForcedAtBaseline = railwayBaselineConfig.forceFallbackActive;
  const mockModeAtBaseline = railwayBaselineConfig.mockActive;
  const testProvider = railwayBaselineConfig.vitestStubActive;

  const buildBlocked = (
    partial: C19R1MeridianLiveProofResult,
    acceptanceStatus: C19R3AcceptanceStatus,
    blockReason: string,
  ): C19R3MeridianLivePostRedeployResult =>
    redactSecretsFromPayload({
      ...partial,
      sprint: 'C1.9R3_LIVE_POST_REDEPLOY',
      deployment,
      railwayBaselineConfig,
      liveAcceptanceEnvOverride: false,
      mockMode: mockModeAtBaseline,
      fallbackForcedAtBaseline,
      testProvider,
      acceptanceStatus,
      sameBriefKey: expectedBriefKey(),
      controlRunId: partial.controlRun.runId,
      fullReasoningRunId: partial.fullReasoningRun?.runId ?? null,
      blockReason,
      fullReasoningBlocked: true,
      capabilityStatus: 'FULL_REASONING_LIVE_TEST_BLOCKED',
      fullReasoningRun: null,
    });

  if (!railwayBaselineConfig.configured) {
    const partial = await runC19R1MeridianLiveProof();
    restoreMeridianLiveAcceptanceEnv(envSnapshot);
    return buildBlocked(
      partial,
      'RAILWAY_PROVIDER_CONFIG_BLOCKED',
      'RAILWAY_PROVIDER_CONFIG_BLOCKED: ANTHROPIC_API_KEY not configured in Railway API environment',
    );
  }

  if (mockModeAtBaseline || testProvider) {
    const partial = await runC19R1MeridianLiveProof();
    restoreMeridianLiveAcceptanceEnv(envSnapshot);
    const blockReason = mockModeAtBaseline
      ? 'SITE00_CREATIVE_REASONING_MOCK_FULL active — mock cannot satisfy acceptance'
      : 'VITEST provider stub active — cannot satisfy live acceptance';
    return buildBlocked(partial, 'FULL_REASONING_LIVE_TEST_BLOCKED', blockReason);
  }

  if (deployment.providerModel !== ANTHROPIC_CREATIVE_MODEL) {
    const partial = await runC19R1MeridianLiveProof();
    restoreMeridianLiveAcceptanceEnv(envSnapshot);
    return buildBlocked(
      partial,
      'RAILWAY_DEPLOYMENT_STALE_OR_BLOCKED',
      `Expected model ${ANTHROPIC_CREATIVE_MODEL}, deployment reports ${deployment.providerModel}`,
    );
  }

  applyMeridianLiveAcceptanceEnv();

  let result: C19R1MeridianLiveProofResult;
  try {
    result = await runC19R1MeridianLiveProof();
  } finally {
    restoreMeridianLiveAcceptanceEnv(envSnapshot);
  }

  const health = await verifyRailwayProviderHealthExtended();
  const diagnostics = getLastProviderCallDiagnostics();
  const sameBriefKey = expectedBriefKey();
  const briefValid = result.sameBriefHash === sameBriefKey && result.briefVerified;

  if (!briefValid) {
    return redactSecretsFromPayload({
      ...result,
      sprint: 'C1.9R3_LIVE_POST_REDEPLOY',
      deployment,
      railwayBaselineConfig,
      liveAcceptanceEnvOverride: true,
      mockMode: false,
      fallbackForcedAtBaseline,
      testProvider,
      acceptanceStatus: 'CONTROL_COMPARISON_INVALID',
      sameBriefKey,
      controlRunId: result.controlRun.runId,
      fullReasoningRunId: result.fullReasoningRun?.runId ?? null,
      providerDiagnostics: diagnostics,
      fullReasoningBlocked: true,
      blockReason: 'CONTROL_COMPARISON_INVALID: brief checksum mismatch',
    });
  }

  const providerFailure = result.runtimeReceipt.errors.some((e) =>
    e.includes('REASONING_PROVIDER_FAILURE'),
  );

  let acceptanceStatus: C19R3AcceptanceStatus;
  if (isC19R1LivePass(result)) {
    acceptanceStatus = 'FULL_REASONING_LIVE_PASS';
  } else if (providerFailure) {
    acceptanceStatus = 'REASONING_PROVIDER_FAILURE';
  } else {
    acceptanceStatus = 'FULL_REASONING_LIVE_TEST_BLOCKED';
  }

  return redactSecretsFromPayload({
    ...result,
    sprint: 'C1.9R3_LIVE_POST_REDEPLOY',
    deployment,
    railwayBaselineConfig,
    liveAcceptanceEnvOverride: true,
    mockMode: false,
    fallbackForcedAtBaseline,
    testProvider,
    acceptanceStatus,
    sameBriefKey,
    controlRunId: getPreservedControlRun()?.runId ?? result.controlRun.runId,
    fullReasoningRunId: result.fullReasoningRun?.runId ?? null,
    providerDiagnostics: diagnostics,
    providerHealth: {
      ...result.providerHealth,
      ...health,
      authConfigured: railwayBaselineConfig.authConfigured,
      reasoningDispatchAllowed: isC19R1LivePass(result),
    },
  });
}

export function isC19R3LiveAcceptancePass(result: C19R3MeridianLivePostRedeployResult): boolean {
  return (
    result.acceptanceStatus === 'FULL_REASONING_LIVE_PASS' &&
    result.liveAcceptanceEnvOverride &&
    !result.mockMode &&
    !result.testProvider &&
    result.fullReasoningRun !== null &&
    result.runtimeReceipt.creativeReasoningDispatchCount > 0 &&
    result.runtimeReceipt.copyReasoningDispatchCount > 0 &&
    result.runtimeReceipt.model === ANTHROPIC_CREATIVE_MODEL &&
    result.runtimeReceipt.runtimeMode === 'FULL_REASONING'
  );
}
