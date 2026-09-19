/**
 * P0.VR.3L — Shell propagation impact analysis + governance.
 */

import { markSnapshotsStaleForProject } from '../p0vr3e/implementationSnapshotRegistry.js';
import {
  DEFAULT_PROPAGATION_SCOPE,
  P0_VR_3L_LINEAGE,
  SHELL_PROPAGATION_CONFIRMATION_REQUIRED,
} from './constants.js';
import {
  bumpDesignFamilyVersion,
  bumpShellVersion,
  getDesignFamilyVersion,
  getSharedShell,
} from './sharedShellRegistry.js';
import type {
  FamilyShellChangeRecord,
  RepoOwnedProjectId,
  ShellPropagationExceptionRecord,
  ShellPropagationImpact,
  ShellPropagationReceipt,
  ShellPropagationRecapturePlan,
  ShellPropagationScope,
} from './types.js';

const propagationExceptions = new Map<string, ShellPropagationExceptionRecord>();
const propagationReceipts: ShellPropagationReceipt[] = [];
const familyShellChanges: FamilyShellChangeRecord[] = [];

export function normalizePropagationScope(
  selected: Partial<Record<ShellPropagationScope, boolean>>,
): ShellPropagationScope {
  if (selected.SHARED_SHELL_GLOBAL) return 'SHARED_SHELL_GLOBAL';
  if (selected.DESIGN_FAMILY) return 'DESIGN_FAMILY';
  return DEFAULT_PROPAGATION_SCOPE;
}

export function analyzeShellPropagationImpact(input: {
  scope: ShellPropagationScope;
  projectId: RepoOwnedProjectId;
  shellId: string;
  familyId?: string | null;
  targetId?: string | null;
  exceptions?: string[];
}): ShellPropagationImpact {
  const shell = getSharedShell(input.shellId);
  if (!shell) {
    return {
      scope: input.scope,
      projectId: input.projectId,
      shellId: input.shellId,
      familyId: input.familyId ?? null,
      pages: [],
      families: [],
      materialScreens: [],
      states: [],
      routes: [],
      viewports: ['mobile', 'tablet', 'desktop'],
      references: [],
      snapshots: [],
      exceptions: input.exceptions ?? [],
      risk: 'HIGH',
      blastRadiusSummary: 'Unknown shell',
    };
  }

  const exceptions = new Set(input.exceptions ?? []);
  let pages = [...shell.consumerPageIds];
  let families = [...shell.consumerFamilyIds];
  let materialScreens = [...(shell.materialScreenIds ?? [])];

  if (input.scope === 'TARGET_ONLY' && input.targetId) {
    pages = pages.filter((p) => input.targetId!.includes(p)).slice(0, 1);
    if (pages.length === 0) pages = [input.targetId];
    materialScreens = materialScreens.filter((m) => input.targetId!.includes(m));
    families = [];
  }

  pages = pages.filter((p) => !exceptions.has(p));
  materialScreens = materialScreens.filter((m) => !exceptions.has(m));

  const risk: ShellPropagationImpact['risk'] =
    input.scope === 'SHARED_SHELL_GLOBAL' ? 'HIGH' : input.scope === 'DESIGN_FAMILY' ? 'MEDIUM' : 'LOW';

  const pageCount = pages.length + materialScreens.length;

  return {
    scope: input.scope,
    projectId: input.projectId,
    shellId: input.shellId,
    familyId: input.familyId ?? families[0] ?? null,
    pages,
    families,
    materialScreens,
    states: materialScreens.map((m) => `${m}-active`),
    routes: pages.map((p) => (input.projectId === 'NDXBOOK' ? `/projects/ndxbook/${p}` : `/${p}`)),
    viewports: ['mobile', 'tablet', 'desktop'],
    references: pages.map((p) => `ref:${input.projectId.toLowerCase()}:${p}`),
    snapshots: pages.flatMap((p) =>
      (['mobile', 'tablet', 'desktop'] as const).map((v) => `snap:${p}:${v}`),
    ),
    exceptions: [...exceptions],
    risk,
    blastRadiusSummary:
      input.scope === 'TARGET_ONLY'
        ? 'TARGET ONLY — 1 target'
        : input.scope === 'DESIGN_FAMILY'
          ? `UPDATE THIS FAMILY — ${pageCount} consumers`
          : `UPDATE EVERY PAGE USING THIS SHELL — ${pageCount} consumers across ${families.length} families`,
  };
}

export function crossProjectPropagationBlocked(
  sourceProject: RepoOwnedProjectId,
  targetProject: RepoOwnedProjectId,
): boolean {
  return sourceProject !== targetProject;
}

export function hostShellContaminationBlocked(scope: ShellPropagationScope, shellId: string): boolean {
  if (shellId.includes('design-workspace') || shellId.includes('host')) return true;
  return scope === 'SHARED_SHELL_GLOBAL' && shellId.includes('project-internal');
}

export function propagationRequiresFounderConfirmation(scope: ShellPropagationScope): boolean {
  if (scope === 'DESIGN_FAMILY') return SHELL_PROPAGATION_CONFIRMATION_REQUIRED.DESIGN_FAMILY;
  if (scope === 'SHARED_SHELL_GLOBAL') return SHELL_PROPAGATION_CONFIRMATION_REQUIRED.SHARED_SHELL_GLOBAL;
  return false;
}

export function commitShellPropagation(input: {
  scope: ShellPropagationScope;
  projectId: RepoOwnedProjectId;
  shellId: string;
  familyId?: string | null;
  targetId?: string | null;
  confirmedByFounder: boolean;
  exceptions?: string[];
}): ShellPropagationReceipt | { blocked: true; reason: string } {
  if (propagationRequiresFounderConfirmation(input.scope) && !input.confirmedByFounder) {
    return { blocked: true, reason: 'FOUNDER_CONFIRMATION_REQUIRED' };
  }

  if (hostShellContaminationBlocked(input.scope, input.shellId)) {
    return { blocked: true, reason: 'HOST_SHELL_CONTAMINATION_BLOCKED' };
  }

  const impact = analyzeShellPropagationImpact(input);

  if (input.scope === 'DESIGN_FAMILY' && impact.familyId) {
    const prev = getDesignFamilyVersion(impact.familyId);
    bumpDesignFamilyVersion(impact.familyId);
    familyShellChanges.push({
      changeId: `family-shell:${impact.familyId}:${Date.now()}`,
      shellId: input.shellId,
      familyId: impact.familyId,
      projectId: input.projectId,
      previousVersion: prev,
      nextVersion: prev + 1,
      scope: input.scope,
      createdAt: new Date().toISOString(),
      lineage: P0_VR_3L_LINEAGE,
    });
  } else if (input.scope === 'SHARED_SHELL_GLOBAL') {
    bumpShellVersion(input.shellId);
  }

  markSnapshotsStaleForProject(input.projectId.toLowerCase(), 'shell propagation');

  const receipt: ShellPropagationReceipt = {
    receiptId: `shell-prop:${input.shellId}:${Date.now()}`,
    scope: input.scope,
    projectId: input.projectId,
    shellId: input.shellId,
    familyId: impact.familyId,
    targetId: input.targetId ?? null,
    affectedPages: [...impact.pages, ...impact.materialScreens],
    exceptions: impact.exceptions,
    confirmedByFounder: input.confirmedByFounder,
    rolledBack: false,
    createdAt: new Date().toISOString(),
    lineage: P0_VR_3L_LINEAGE,
  };

  propagationReceipts.push(receipt);
  return receipt;
}

export function buildShellPropagationRecapturePlan(receipt: ShellPropagationReceipt): ShellPropagationRecapturePlan {
  return {
    planId: `recapture:${receipt.receiptId}`,
    projectId: receipt.projectId,
    consumerIds: receipt.affectedPages,
    viewports: ['mobile', 'tablet', 'desktop'],
    fullProjectRecapture: false,
  };
}

export function addShellPropagationException(input: {
  shellId: string;
  consumerId: string;
  reason: string;
}): ShellPropagationExceptionRecord {
  const record: ShellPropagationExceptionRecord = {
    exceptionId: `exc:${input.shellId}:${input.consumerId}`,
    shellId: input.shellId,
    consumerId: input.consumerId,
    reason: input.reason,
    createdAt: new Date().toISOString(),
    persists: true,
  };
  propagationExceptions.set(record.exceptionId, record);
  return record;
}

export function listShellPropagationExceptions(shellId?: string): ShellPropagationExceptionRecord[] {
  return [...propagationExceptions.values()].filter((e) => !shellId || e.shellId === shellId);
}

export function rollbackShellPropagation(receiptId: string): ShellPropagationReceipt | null {
  const receipt = propagationReceipts.find((r) => r.receiptId === receiptId);
  if (!receipt) return null;
  receipt.rolledBack = true;
  return receipt;
}

export function listShellPropagationReceipts(): ShellPropagationReceipt[] {
  return [...propagationReceipts];
}

export function listFamilyShellChanges(): FamilyShellChangeRecord[] {
  return [...familyShellChanges];
}

export function detectReferenceConflict(_pageId: string, hasActiveReference: boolean): boolean {
  return hasActiveReference;
}

export function clearShellPropagationForTest(): void {
  propagationExceptions.clear();
  propagationReceipts.length = 0;
  familyShellChanges.length = 0;
}
