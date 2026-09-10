/**
 * In-memory store for inheritance runs, lineage, and exceptions.
 */

import type {
  InheritanceException,
  ParentChildInheritanceRunResult,
  ParentExperienceAuthority,
} from './types.js';

const runs = new Map<string, ParentChildInheritanceRunResult>();
const authorities = new Map<string, ParentExperienceAuthority>();
const exceptions = new Map<string, InheritanceException[]>();

export function storeParentExperienceAuthority(authority: ParentExperienceAuthority): void {
  authorities.set(authority.authorityId, authority);
}

export function getParentExperienceAuthority(authorityId: string): ParentExperienceAuthority | null {
  return authorities.get(authorityId) ?? null;
}

export function storeInheritanceRun(result: ParentChildInheritanceRunResult): void {
  runs.set(result.runId, result);
  storeParentExperienceAuthority(result.parentAuthority);
  if (result.exceptions.length) {
    exceptions.set(result.projectId, result.exceptions);
  }
}

export function getInheritanceRun(runId: string): ParentChildInheritanceRunResult | null {
  return runs.get(runId) ?? null;
}

export function listInheritanceRuns(projectId: string): ParentChildInheritanceRunResult[] {
  return [...runs.values()].filter((r) => r.projectId === projectId);
}

export function getProjectExceptions(projectId: string): InheritanceException[] {
  return exceptions.get(projectId) ?? [];
}

export function clearInheritanceStoreForTest(): void {
  runs.clear();
  authorities.clear();
  exceptions.clear();
}
