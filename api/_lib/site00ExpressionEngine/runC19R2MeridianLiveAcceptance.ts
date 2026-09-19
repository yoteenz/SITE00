/**
 * C1.9R2 — Live provider activation + Meridian acceptance run.
 */

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

export type C19R2MeridianLiveAcceptanceResult = Omit<C19R1MeridianLiveProofResult, 'sprint'> & {
  sprint: 'C1.9R2_LIVE_PROVIDER_ACTIVATION';
  railwayConfig: ReturnType<typeof verifyRailwayProviderConfig>;
  mockActive: boolean;
  fallbackActive: boolean;
  vitestStubActive: boolean;
  controlPreserved: boolean;
  providerDiagnostics?: ReturnType<typeof getLastProviderCallDiagnostics>;
  acceptanceStatus:
    | 'FULL_REASONING_LIVE_PASS'
    | 'FULL_REASONING_LIVE_TEST_BLOCKED'
    | 'RAILWAY_PROVIDER_CONFIG_BLOCKED'
    | 'REASONING_PROVIDER_FAILURE';
};

export async function runC19R2MeridianLiveAcceptance(): Promise<C19R2MeridianLiveAcceptanceResult> {
  const railwayConfig = verifyRailwayProviderConfig();
  const mockActive = railwayConfig.mockActive;
  const fallbackActive = railwayConfig.forceFallbackActive;
  const vitestStubActive = railwayConfig.vitestStubActive;

  if (!railwayConfig.configured) {
    const partial = await runC19R1MeridianLiveProof();
    const health = await verifyRailwayProviderHealthExtended();
    return redactSecretsFromPayload({
      ...partial,
      sprint: 'C1.9R2_LIVE_PROVIDER_ACTIVATION',
      railwayConfig,
      mockActive,
      fallbackActive,
      vitestStubActive,
      controlPreserved: Boolean(getPreservedControlRun()),
      acceptanceStatus: 'RAILWAY_PROVIDER_CONFIG_BLOCKED',
      fullReasoningBlocked: true,
      blockReason: 'RAILWAY_PROVIDER_CONFIG_BLOCKED: ANTHROPIC_API_KEY not configured in Railway API environment',
      capabilityStatus: 'FULL_REASONING_LIVE_TEST_BLOCKED',
      fullReasoningRun: null,
      providerHealth: health,
    });
  }

  if (mockActive || fallbackActive || vitestStubActive) {
    const partial = await runC19R1MeridianLiveProof();
    const blockReason = mockActive
      ? 'SITE00_CREATIVE_REASONING_MOCK_FULL active — mock cannot satisfy acceptance'
      : fallbackActive
        ? 'SITE00_CREATIVE_REASONING_FORCE_FALLBACK active — fallback cannot satisfy acceptance'
        : 'VITEST provider stub active — cannot satisfy live acceptance';
    return redactSecretsFromPayload({
      ...partial,
      sprint: 'C1.9R2_LIVE_PROVIDER_ACTIVATION',
      railwayConfig,
      mockActive,
      fallbackActive,
      vitestStubActive,
      controlPreserved: Boolean(getPreservedControlRun()),
      acceptanceStatus: 'FULL_REASONING_LIVE_TEST_BLOCKED',
      fullReasoningBlocked: true,
      blockReason,
      capabilityStatus: 'FULL_REASONING_LIVE_TEST_BLOCKED',
      fullReasoningRun: null,
    });
  }

  const result = await runC19R1MeridianLiveProof();
  const diagnostics = getLastProviderCallDiagnostics();
  const livePass = isC19R1LivePass(result);
  const providerFailure = result.runtimeReceipt.errors.some((e) =>
    e.includes('REASONING_PROVIDER_FAILURE'),
  );

  let acceptanceStatus: C19R2MeridianLiveAcceptanceResult['acceptanceStatus'];
  if (livePass) {
    acceptanceStatus = 'FULL_REASONING_LIVE_PASS';
  } else if (providerFailure) {
    acceptanceStatus = 'REASONING_PROVIDER_FAILURE';
  } else {
    acceptanceStatus = 'FULL_REASONING_LIVE_TEST_BLOCKED';
  }

  return redactSecretsFromPayload({
    ...result,
    sprint: 'C1.9R2_LIVE_PROVIDER_ACTIVATION',
    railwayConfig,
    mockActive,
    fallbackActive,
    vitestStubActive,
    controlPreserved: Boolean(getPreservedControlRun()),
    providerDiagnostics: diagnostics,
    acceptanceStatus,
  });
}

export function isC19R2LiveAcceptancePass(result: C19R2MeridianLiveAcceptanceResult): boolean {
  return (
    result.acceptanceStatus === 'FULL_REASONING_LIVE_PASS' &&
    result.railwayConfig.configured &&
    !result.mockActive &&
    !result.fallbackActive &&
    !result.vitestStubActive &&
    result.runtimeReceipt.creativeReasoningDispatchCount > 0 &&
    result.runtimeReceipt.copyReasoningDispatchCount > 0 &&
    result.fullReasoningRun !== null &&
    result.runtimeReceipt.runtimeMode === 'FULL_REASONING'
  );
}
