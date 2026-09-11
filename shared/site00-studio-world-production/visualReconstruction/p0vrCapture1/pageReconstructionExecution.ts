/**
 * P0.VR.UPGRADE.1 — Build session snapshots (authority + capture pinned at build start).
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import type { ReconstructionPlan } from './reconstructionPlan.js';

export type PageReconstructionExecution = {
  executionId: string;
  projectId: string;
  pageId: string;
  viewport: DesignViewportClass;
  plan: ReconstructionPlan;
  authorityVersionId: string;
  captureId: string;
  authorityAssetRef: string | null;
  captureAssetRef: string | null;
  startedAt: string;
  authorityUpdateAvailable: boolean;
  captureStale: boolean;
};

const executions = new Map<string, PageReconstructionExecution>();

function key(projectId: string, pageId: string, viewport: DesignViewportClass): string {
  return `${projectId}::${pageId}::${viewport}`;
}

export function startPageReconstructionExecution(input: {
  projectId: string;
  pageId: string;
  viewport: DesignViewportClass;
  plan: ReconstructionPlan;
  authorityVersionId: string;
  captureId: string;
  authorityAssetRef: string | null;
  captureAssetRef: string | null;
}): PageReconstructionExecution {
  const execution: PageReconstructionExecution = {
    executionId: `build_${input.projectId}_${Date.now()}`,
    projectId: input.projectId,
    pageId: input.pageId,
    viewport: input.viewport,
    plan: { ...input.plan, status: 'APPROVED' },
    authorityVersionId: input.authorityVersionId,
    captureId: input.captureId,
    authorityAssetRef: input.authorityAssetRef,
    captureAssetRef: input.captureAssetRef,
    startedAt: new Date().toISOString(),
    authorityUpdateAvailable: false,
    captureStale: false,
  };
  executions.set(key(input.projectId, input.pageId, input.viewport), execution);
  return execution;
}

export function getPageReconstructionExecution(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
): PageReconstructionExecution | null {
  return executions.get(key(projectId, pageId, viewport)) ?? null;
}

export function markAuthorityUpdateAvailable(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
): PageReconstructionExecution | null {
  const existing = getPageReconstructionExecution(projectId, pageId, viewport);
  if (!existing) return null;
  const updated = { ...existing, authorityUpdateAvailable: true };
  executions.set(key(projectId, pageId, viewport), updated);
  return updated;
}

export function resetPageReconstructionExecutionsForTest(): void {
  executions.clear();
}
