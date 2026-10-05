import type { NbpHandoffReadiness, WorkspaceSelfWorkflowState } from './types.js';
import { WORKSPACE_SELF_TARGET_ID } from '../designTargetModel.js';

export type { NbpHandoffReadiness };

export function latestReadyCapture(
  state: WorkspaceSelfWorkflowState,
  viewport: 'MOBILE' | 'DESKTOP',
): { captureId: string } | null {
  const row = [...state.captures]
    .reverse()
    .find((c) => c.viewport === viewport && c.status === 'READY' && c.artifactPath);
  return row ? { captureId: row.captureId } : null;
}

export function evaluateNbpHandoffReadiness(state: WorkspaceSelfWorkflowState): NbpHandoffReadiness {
  if (state.targetId !== WORKSPACE_SELF_TARGET_ID) return 'BLOCKED_NO_FUNCTION_CONTRACT';
  if (!state.functionContract) return 'BLOCKED_NO_FUNCTION_CONTRACT';
  if (!latestReadyCapture(state, 'MOBILE')) return 'BLOCKED_NO_MOBILE_CAPTURE';
  if (!latestReadyCapture(state, 'DESKTOP')) return 'BLOCKED_NO_DESKTOP_CAPTURE';
  return 'READY_FOR_NBP';
}
