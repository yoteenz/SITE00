import { applyOpusV2BenchmarkImport } from './import/opusV2BenchmarkImport.js';
import { applyR3EditorialImport } from './import/r3EditorialImport.js';
import { applyR4PremiumImport } from './import/r4PremiumImport.js';
import { DIGITAL_FOUNDATION_TEMPLATE_COUNT } from './manifests/digital-foundation-lifecycle.js';
import type { CampaignDefinition, CorrespondenceWorkspaceManifest, ProjectDefinition } from './types.js';

let cached: CorrespondenceWorkspaceManifest | null = null;

export function getCorrespondenceWorkspace(options?: { includeOpusBenchmarks?: boolean }): CorrespondenceWorkspaceManifest {
  if (cached && options?.includeOpusBenchmarks !== false) return cached;
  const include = options?.includeOpusBenchmarks ?? true;
  const manifest = applyOpusV2BenchmarkImport({ apply: include });
  if (include) {
    applyR3EditorialImport(manifest);
    applyR4PremiumImport(manifest);
    cached = manifest;
  }
  return manifest;
}

export function resetCorrespondenceWorkspaceCache(): void {
  cached = null;
}

export function listProjects(manifest = getCorrespondenceWorkspace()): ProjectDefinition[] {
  return manifest.projects;
}

export function getProject(projectId: string, manifest = getCorrespondenceWorkspace()): ProjectDefinition | undefined {
  return manifest.projects.find((p) => p.project_id === projectId);
}

export function getCampaign(campaignId: string, manifest = getCorrespondenceWorkspace()): CampaignDefinition | undefined {
  return manifest.projects.flatMap((p) => p.campaigns).find((c) => c.campaign_id === campaignId);
}

export function registeredTemplateCount(manifest = getCorrespondenceWorkspace()): number {
  return Object.keys(manifest.templates).length;
}

export { DIGITAL_FOUNDATION_TEMPLATE_COUNT };
