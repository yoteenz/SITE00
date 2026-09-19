/**
 * P0.VR.8R1 — ProjectPageCapture registry (project + route + viewport identity).
 */

import type { DesignViewportClass } from '../p0vr2/types.js';

export type ProjectPageCaptureStatus = 'CURRENT' | 'STALE' | 'CAPTURING' | 'CAPTURE_FAILED' | 'PENDING';

export type ProjectPageCapture = {
  projectId: string;
  route: string;
  viewport: DesignViewportClass;
  captureId: string;
  capturedAt: string | null;
  sourceVersion: string | null;
  deploymentVersion: string | null;
  screenshotAssetId: string | null;
  captureStatus: ProjectPageCaptureStatus;
  staleReason: string | null;
  screenId: string;
};

const captureRegistry = new Map<string, ProjectPageCapture>();

function captureKey(projectId: string, route: string, viewport: DesignViewportClass): string {
  return `${projectId}::${route}::${viewport}`;
}

export function buildProjectPageCaptureId(projectId: string, route: string, viewport: DesignViewportClass): string {
  return captureKey(projectId, route, viewport);
}

export function upsertProjectPageCapture(record: ProjectPageCapture): ProjectPageCapture {
  const key = captureKey(record.projectId, record.route, record.viewport);
  captureRegistry.set(key, record);
  return record;
}

export function getProjectPageCapture(
  projectId: string,
  route: string,
  viewport: DesignViewportClass,
): ProjectPageCapture | null {
  return captureRegistry.get(captureKey(projectId, route, viewport)) ?? null;
}

export function listProjectPageCaptures(projectId: string): ProjectPageCapture[] {
  return [...captureRegistry.values()].filter((c) => c.projectId === projectId);
}

export function assertCaptureProjectScope(
  capture: ProjectPageCapture,
  activeProjectId: string,
): boolean {
  return capture.projectId === activeProjectId;
}

export function clearProjectPageCaptureRegistryForTest(): void {
  captureRegistry.clear();
}
