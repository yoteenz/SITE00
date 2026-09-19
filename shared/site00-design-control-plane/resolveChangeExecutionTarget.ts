/**
 * P0.BRIDGE.1B — Resolve change execution target repo + bridge requirements.
 */

import { getProjectAuthority, type ManagedProjectExecutionMode } from './projectAuthorityRegistry.js';
import { getRepoDefaultBranch, validateRepoBindingBranch } from './repoBranchAuthority.js';
import type { Site00ChangeExecutionClass, Site00ImplementationMode, Site00RepoBindingRow } from './types.js';

export type ChangeExecutionTarget = {
  projectKey: string;
  sourceRepo: string | null;
  executionMode: ManagedProjectExecutionMode;
  bridgeRequired: boolean;
  repoBindingId: string | null;
  defaultBranch: string | null;
  implementationMode: Site00ImplementationMode;
  implementationModeLabel: string;
  sourceProjectPath: string | null;
};

export function resolveImplementationMode(
  executionMode: ManagedProjectExecutionMode,
  changeExecutionClass: Site00ChangeExecutionClass,
): { mode: Site00ImplementationMode; label: string } {
  if (executionMode === 'SITE00_NATIVE') {
    return {
      mode: 'SITE00_NATIVE',
      label: changeExecutionClass === 'RUNTIME_SAFE_BINDING' ? 'SITE 00 NATIVE · RUNTIME BINDING' : 'SITE 00 NATIVE',
    };
  }
  if (changeExecutionClass === 'RUNTIME_SAFE_BINDING') {
    return { mode: 'RUNTIME_BINDING', label: 'RUNTIME BINDING' };
  }
  return { mode: 'SOURCE_REPO_CHANGE', label: 'SOURCE REPO CHANGE' };
}

export function resolveChangeExecutionTarget(input: {
  projectKey: string;
  changeExecutionClass: Site00ChangeExecutionClass;
  changeType: string;
  activeBinding?: Site00RepoBindingRow | null;
}): ChangeExecutionTarget {
  const authority = getProjectAuthority(input.projectKey);
  if (!authority) {
    throw new Error(`Unknown project authority: ${input.projectKey}`);
  }

  const binding = input.activeBinding ?? null;
  const sourceRepo = authority.sourceRepo;
  const defaultBranch =
    binding?.defaultBranch ?? getRepoDefaultBranch(sourceRepo) ?? null;
  const impl = resolveImplementationMode(authority.executionMode, input.changeExecutionClass);

  return {
    projectKey: input.projectKey,
    sourceRepo,
    executionMode: authority.executionMode,
    bridgeRequired: authority.externalRepoBridgeRequired,
    repoBindingId: binding?.metadata?.bindingStatus === 'SUPERSEDED' ? null : binding?.id ?? null,
    defaultBranch,
    implementationMode: impl.mode,
    implementationModeLabel: impl.label,
    sourceProjectPath: authority.sourceProjectKey,
  };
}

export function assertReadyForRepoAuthority(input: {
  projectKey: string;
  repoBinding: Site00RepoBindingRow | null;
  expectedSourceBranch?: string | null;
}): { allowed: boolean; status?: 'BLOCKED_REPO_AUTHORITY_MISMATCH' | 'BLOCKED_REPO_BRANCH_MISMATCH'; reason?: string } {
  const authority = getProjectAuthority(input.projectKey);
  if (!authority) {
    return { allowed: false, status: 'BLOCKED_REPO_AUTHORITY_MISMATCH', reason: 'Unknown project' };
  }

  if (authority.executionMode === 'SITE00_NATIVE') {
    if (input.repoBinding && `${input.repoBinding.repoOwner}/${input.repoBinding.repoName}` === 'yoteenz/fsbw') {
      return {
        allowed: false,
        status: 'BLOCKED_REPO_AUTHORITY_MISMATCH',
        reason: 'INVALID_REPO_AUTHORITY: SITE00_NATIVE project cannot target FSBW',
      };
    }
  }

  if (authority.externalRepoBridgeRequired) {
    if (!input.repoBinding || `${input.repoBinding.repoOwner}/${input.repoBinding.repoName}` !== 'yoteenz/fsbw') {
      return {
        allowed: false,
        status: 'BLOCKED_REPO_AUTHORITY_MISMATCH',
        reason: 'CROSS_REPO_FSBW project requires yoteenz/fsbw binding',
      };
    }
    const branch = input.expectedSourceBranch ?? input.repoBinding.defaultBranch;
    const branchCheck = validateRepoBindingBranch({ sourceRepo: authority.sourceRepo, defaultBranch: branch });
    if (!branchCheck.valid) {
      return {
        allowed: false,
        status: 'BLOCKED_REPO_BRANCH_MISMATCH',
        reason: branchCheck.error,
      };
    }
  }

  return { allowed: true };
}

export function fsbwConsumerMayConsumeRequest(input: {
  projectKey: string;
  repoBinding: Site00RepoBindingRow | null;
  status: string;
}): boolean {
  if (input.status !== 'READY_FOR_REPO') return false;
  if (!isFsbwBridgeProject(input.projectKey)) return false;
  if (!input.repoBinding) return false;
  return input.repoBinding.repoOwner === 'yoteenz' && input.repoBinding.repoName === 'fsbw';
}

function isFsbwBridgeProject(projectKey: string): boolean {
  return getProjectAuthority(projectKey)?.executionMode === 'CROSS_REPO_FSBW';
}
