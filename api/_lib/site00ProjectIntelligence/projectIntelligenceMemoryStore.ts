/**
 * In-memory project intelligence store (manifest + readiness per project).
 */

import type { ProjectIntelligenceIntakeManifest } from '../../../shared/site00-project-intelligence/types.js';

const manifests = new Map<string, ProjectIntelligenceIntakeManifest[]>();

export function getLatestManifest(projectSlug: string): ProjectIntelligenceIntakeManifest | null {
  const list = manifests.get(projectSlug) ?? [];
  return list[list.length - 1] ?? null;
}

export function getAllManifests(projectSlug: string): ProjectIntelligenceIntakeManifest[] {
  return manifests.get(projectSlug) ?? [];
}

export function saveManifest(manifest: ProjectIntelligenceIntakeManifest): ProjectIntelligenceIntakeManifest {
  const list = manifests.get(manifest.projectSlug) ?? [];
  list.push(manifest);
  manifests.set(manifest.projectSlug, list);
  return manifest;
}

export function resetProjectIntelligenceMemory(): void {
  manifests.clear();
}
