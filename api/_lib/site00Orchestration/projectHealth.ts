import type { LaunchManifestRow, ManifestRequirementRow, OrganizationRow } from './types.js';
import { calculateReadiness } from './readinessCalculator.js';
import { READINESS_EXCLUDED_CLASSIFICATIONS } from './types.js';

export type ProjectHealth =
  | 'ON_TRACK'
  | 'ATTENTION_REQUIRED'
  | 'BLOCKED'
  | 'WAITING'
  | 'READY_FOR_LAUNCH_REVIEW'
  | 'LAUNCHED'
  | 'POST_LAUNCH';

export function deriveProjectHealth(input: {
  organization: OrganizationRow;
  manifest?: LaunchManifestRow | null;
  requirements: ManifestRequirementRow[];
  overrides: Set<string>;
  pendingReconciliations: number;
  pendingApprovals: number;
}): ProjectHealth {
  const readiness = input.manifest
    ? calculateReadiness(input.requirements, input.overrides)
    : null;

  if (input.organization.state === 'LAUNCHED') return 'LAUNCHED';

  const blocked = input.requirements.filter(
    (r) => r.classification === 'BLOCKED' || r.execution_status === 'BLOCKED',
  ).length;

  if (blocked > 0) return 'BLOCKED';

  if (input.pendingReconciliations > 0 || input.pendingApprovals > 0) return 'ATTENTION_REQUIRED';

  if (readiness && readiness.blockingRequirementsRemaining === 0 && input.manifest?.is_provisional === false) {
    return 'READY_FOR_LAUNCH_REVIEW';
  }

  if (readiness && readiness.blockingRequirementsRemaining === 0 && input.manifest?.is_provisional !== false) {
    return 'READY_FOR_LAUNCH_REVIEW';
  }

  const deferredOnly = input.requirements.every(
    (r) =>
      READINESS_EXCLUDED_CLASSIFICATIONS.includes(r.classification) ||
      r.execution_status === 'COMPLETE' ||
      r.classification === 'COMPLETE',
  );
  if (deferredOnly && input.requirements.length > 0) return 'POST_LAUNCH';

  if (readiness && readiness.blockingRequirementsRemaining > 3) return 'ATTENTION_REQUIRED';

  return 'ON_TRACK';
}

export function infrastructureHealth(input: { connectionStates: string[] }): string {
  if (input.connectionStates.some((s) => s === 'CONNECTED')) return 'OPERATIONAL';
  if (input.connectionStates.some((s) => s === 'CONFIGURED' || s === 'UNVERIFIED')) return 'CONFIGURED';
  return 'UNKNOWN';
}
