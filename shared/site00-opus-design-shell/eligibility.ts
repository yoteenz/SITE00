import type { OpusDesignShellEligibility, OpusDesignShellEligibilityInput } from './types.js';

export function evaluateOpusDesignShellEligibility(
  input: OpusDesignShellEligibilityInput,
  hasExistingShell: boolean,
): OpusDesignShellEligibility {
  const primaryAction = hasExistingShell ? 'REFINE DESIGN SHELL' : 'CREATE DESIGN SHELL';

  if (!input.anthropicConfigured) {
    return {
      eligible: false,
      blockedCode: 'BLOCKED_NO_ANTHROPIC_KEY',
      blockedReason: 'ANTHROPIC_API_KEY is not configured on the API host.',
      primaryAction: null,
      hasExistingShell,
    };
  }
  if (!input.modelAvailable) {
    return {
      eligible: false,
      blockedCode: 'BLOCKED_MODEL_UNAVAILABLE',
      blockedReason: 'claude-opus-5 is unavailable for this account — no substitute model will be used.',
      primaryAction: null,
      hasExistingShell,
    };
  }
  if (!input.mobilePromoted || !input.desktopPromoted) {
    return {
      eligible: false,
      blockedCode: 'BLOCKED_NO_AUTHORITY',
      blockedReason: 'Promote Mobile and Desktop authority before Opus shell work.',
      primaryAction: null,
      hasExistingShell,
    };
  }
  if (!input.pairReviewCompleted) {
    return {
      eligible: false,
      blockedCode: 'BLOCKED_NO_AUTHORITY',
      blockedReason: 'Complete Pair Review before Opus shell work.',
      primaryAction: null,
      hasExistingShell,
    };
  }
  if (!input.pairLocked) {
    return {
      eligible: false,
      blockedCode: 'BLOCKED_PAIR_NOT_LOCKED',
      blockedReason: 'Lock the Mobile + Desktop authority pair before Opus shell work.',
      primaryAction: null,
      hasExistingShell,
    };
  }
  if (!input.hasFunctionContract) {
    return {
      eligible: false,
      blockedCode: 'BLOCKED_NO_FUNCTION_CONTRACT',
      blockedReason: 'Page function contract is required before Opus shell work.',
      primaryAction: null,
      hasExistingShell,
    };
  }
  if (input.targetType === 'PAGE' && (!input.hasMobileCapture || !input.hasDesktopCapture)) {
    return {
      eligible: false,
      blockedCode: 'BLOCKED_NO_SOURCE_CAPTURE',
      blockedReason:
        'Implementation captures for Mobile and Desktop are required (CAPTURE SCREEN for each viewport).',
      primaryAction: null,
      hasExistingShell,
    };
  }

  return {
    eligible: true,
    blockedCode: null,
    blockedReason: null,
    primaryAction,
    hasExistingShell,
  };
}
