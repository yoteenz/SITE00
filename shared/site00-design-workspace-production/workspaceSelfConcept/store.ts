import { normalizeWorkspaceSelfState } from './captureWorkflow.js';
import { createInitialWorkspaceSelfState } from './workflow.js';
import type { WorkspaceSelfWorkflowState } from './types.js';
import { WORKSPACE_SELF_TARGET_ID } from '../designTargetModel.js';

const STORAGE_KEY = 'site00:workspace-self-concept:v1';

export function loadWorkspaceSelfState(): WorkspaceSelfWorkflowState {
  if (typeof localStorage === 'undefined') return createInitialWorkspaceSelfState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialWorkspaceSelfState();
    const parsed = JSON.parse(raw) as WorkspaceSelfWorkflowState;
    if (parsed.targetId !== WORKSPACE_SELF_TARGET_ID) return createInitialWorkspaceSelfState();
    return normalizeWorkspaceSelfState(parsed);
  } catch {
    return createInitialWorkspaceSelfState();
  }
}

export function saveWorkspaceSelfState(state: WorkspaceSelfWorkflowState): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
