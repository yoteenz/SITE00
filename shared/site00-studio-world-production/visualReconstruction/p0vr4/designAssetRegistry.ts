/**
 * P0.VR.4 — Design asset registry with version history.
 */

import type { DesignAssetRegistryEntry, AssetVersionRecord, DesignAssetBinding, FounderJudgment } from './types.js';

const registry = new Map<string, DesignAssetRegistryEntry>();

export function registerDesignAsset(entry: DesignAssetRegistryEntry): DesignAssetRegistryEntry {
  registry.set(entry.canonicalAssetId, entry);
  return entry;
}

export function getDesignAssetRegistryEntry(canonicalAssetId: string): DesignAssetRegistryEntry | null {
  return registry.get(canonicalAssetId) ?? null;
}

export function listDesignAssetRegistry(projectId?: string): DesignAssetRegistryEntry[] {
  const all = [...registry.values()];
  return projectId ? all.filter((e) => e.projectId === projectId) : all;
}

export function appendAssetVersion(
  canonicalAssetId: string,
  version: AssetVersionRecord,
): DesignAssetRegistryEntry | null {
  const entry = registry.get(canonicalAssetId);
  if (!entry) return null;
  entry.versions.push(version);
  entry.currentVersion = version.versionNumber;
  entry.supabaseUrl = version.supabaseUrl;
  entry.founderApproval = version.founderJudgment;
  registry.set(canonicalAssetId, entry);
  return entry;
}

export function addLiveBinding(canonicalAssetId: string, binding: DesignAssetBinding): void {
  const entry = registry.get(canonicalAssetId);
  if (!entry) return;
  entry.liveBindings.push(binding);
  registry.set(canonicalAssetId, entry);
}

export function clearDesignAssetRegistryForTest(): void {
  registry.clear();
}

export function createRegistryEntryFromApproval(input: {
  assetId: string;
  projectId: string;
  pageId: string;
  route: string;
  semanticName: string;
  assetType: DesignAssetRegistryEntry['assetType'];
  supabaseUrl: string;
  storage: AssetVersionRecord['storage'];
  sourceReference: DesignAssetRegistryEntry['sourceReference'];
  founderJudgment: FounderJudgment;
}): DesignAssetRegistryEntry {
  const version: AssetVersionRecord = {
    versionId: `${input.assetId}-v001`,
    versionNumber: 1,
    supabaseUrl: input.supabaseUrl,
    storage: input.storage,
    approvedAt: new Date().toISOString(),
    founderJudgment: input.founderJudgment,
  };

  return registerDesignAsset({
    canonicalAssetId: input.assetId,
    projectId: input.projectId,
    pageId: input.pageId,
    route: input.route,
    semanticName: input.semanticName,
    assetType: input.assetType,
    currentVersion: 1,
    versions: [version],
    supabaseUrl: input.supabaseUrl,
    sourceReference: input.sourceReference,
    founderApproval: input.founderJudgment,
    liveBindings: [],
  });
}
