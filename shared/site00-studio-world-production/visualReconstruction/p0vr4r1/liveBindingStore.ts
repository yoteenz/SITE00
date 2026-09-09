/**
 * P0.VR.4R1 — Persistent live binding store (Supabase + in-memory).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { isTemporaryProviderUrl } from '../p0vr4/supabaseStorage.js';
import { PROJECTS_GOLDEN_TEST } from '../p0vr4/constants.js';
import type { LiveBindingSlotRecord, PersistedLiveBindingSlot } from './types.js';
import { PROJECTS_HEADER_PLANET_SLOT_ID } from './browserConstants.js';

export const LIVE_BINDINGS_REGISTRY_PATH = 'public/studio-world/design/design-asset-live-bindings.json';
export { PROJECTS_HEADER_PLANET_SLOT_ID };

const slotStore = new Map<string, LiveBindingSlotRecord>();

export function clearLiveBindingStoreForTest(): void {
  slotStore.clear();
}

export function getLiveBindingSlot(slotId: string): LiveBindingSlotRecord | null {
  return slotStore.get(slotId) ?? null;
}

export function getProjectsHeaderPlanetBinding(): LiveBindingSlotRecord | null {
  return getLiveBindingSlot(PROJECTS_HEADER_PLANET_SLOT_ID);
}

export function resolveStoragePathToPublicUrl(
  storagePath: string,
  getUrl: (path: string) => string,
): string {
  return getUrl(storagePath);
}

export function toPersistedSlot(slot: LiveBindingSlotRecord): PersistedLiveBindingSlot {
  const currentStoragePath =
    slot.currentStoragePath ??
    slot.versions.find((v) => v.version === slot.currentVersion)?.storagePath ??
    '';
  const previousStoragePath =
    slot.previousStoragePath ??
    (slot.previousAssetUrl && slot.versions.length > 1
      ? slot.versions[slot.versions.length - 2]?.storagePath ?? null
      : null);

  return {
    slotId: slot.slotId,
    projectId: slot.projectId,
    pageId: slot.pageId,
    route: slot.route,
    componentPath: slot.componentPath,
    componentName: slot.componentName,
    assetSlot: slot.assetSlot,
    currentVersion: slot.currentVersion,
    currentStoragePath,
    previousStoragePath,
    assetId: slot.assetId,
    versions: slot.versions.map((v) => ({
      version: v.version,
      storagePath: v.storagePath ?? currentStoragePath,
      assetId: v.assetId,
      boundAt: v.boundAt,
    })),
    updatedAt: slot.updatedAt,
  };
}

export function fromPersistedSlot(
  persisted: PersistedLiveBindingSlot,
  getUrl: (path: string) => string,
): LiveBindingSlotRecord {
  return {
    slotId: persisted.slotId,
    projectId: persisted.projectId,
    pageId: persisted.pageId,
    route: persisted.route,
    componentPath: persisted.componentPath,
    componentName: persisted.componentName,
    assetSlot: persisted.assetSlot,
    currentVersion: persisted.currentVersion,
    currentStoragePath: persisted.currentStoragePath,
    currentAssetUrl: resolveStoragePathToPublicUrl(persisted.currentStoragePath, getUrl),
    previousStoragePath: persisted.previousStoragePath,
    previousAssetUrl: persisted.previousStoragePath
      ? resolveStoragePathToPublicUrl(persisted.previousStoragePath, getUrl)
      : null,
    assetId: persisted.assetId,
    versions: persisted.versions.map((v) => ({
      version: v.version,
      storagePath: v.storagePath,
      url: resolveStoragePathToPublicUrl(v.storagePath, getUrl),
      assetId: v.assetId,
      boundAt: v.boundAt,
    })),
    updatedAt: persisted.updatedAt,
  };
}

export function applyLiveBindingSlot(input: {
  assetId: string;
  canonicalUrl: string;
  storagePath: string;
  version: number;
  previousAssetUrl?: string | null;
  previousStoragePath?: string | null;
}): LiveBindingSlotRecord {
  if (isTemporaryProviderUrl(input.canonicalUrl)) {
    throw new Error('TEMP_PROVIDER_URL_IN_LIVE_UI: cannot bind temporary FAL URL');
  }

  const existing = slotStore.get(PROJECTS_HEADER_PLANET_SLOT_ID);
  const previousAssetUrl = input.previousAssetUrl ?? existing?.currentAssetUrl ?? null;
  const previousStoragePath = input.previousStoragePath ?? existing?.currentStoragePath ?? null;

  const record: LiveBindingSlotRecord = {
    slotId: PROJECTS_HEADER_PLANET_SLOT_ID,
    projectId: PROJECTS_GOLDEN_TEST.projectId,
    pageId: PROJECTS_GOLDEN_TEST.pageId,
    route: PROJECTS_GOLDEN_TEST.route,
    componentPath: PROJECTS_GOLDEN_TEST.componentPath,
    componentName: PROJECTS_GOLDEN_TEST.componentName,
    assetSlot: PROJECTS_GOLDEN_TEST.assetSlot,
    currentVersion: input.version,
    currentAssetUrl: input.canonicalUrl,
    currentStoragePath: input.storagePath,
    previousAssetUrl,
    previousStoragePath,
    assetId: input.assetId,
    versions: [
      ...(existing?.versions ?? []),
      {
        version: input.version,
        url: input.canonicalUrl,
        storagePath: input.storagePath,
        assetId: input.assetId,
        boundAt: new Date().toISOString(),
      },
    ],
    updatedAt: new Date().toISOString(),
  };

  slotStore.set(PROJECTS_HEADER_PLANET_SLOT_ID, record);
  return record;
}

export function loadLiveBindingsFromRepo(
  repoRoot: string,
  getUrl?: (path: string) => string,
): LiveBindingSlotRecord[] {
  const path = join(repoRoot, LIVE_BINDINGS_REGISTRY_PATH);
  if (!existsSync(path)) return [];
  try {
    const data = JSON.parse(readFileSync(path, 'utf8')) as { slots?: PersistedLiveBindingSlot[] };
    const resolve = getUrl ?? ((p: string) => p);
    const slots = (data.slots ?? []).map((s) => fromPersistedSlot(s, resolve));
    for (const slot of slots) {
      slotStore.set(slot.slotId, slot);
    }
    return slots;
  } catch {
    return [];
  }
}

export function saveLiveBindingsToRepo(repoRoot: string): void {
  const path = join(repoRoot, LIVE_BINDINGS_REGISTRY_PATH);
  mkdirSync(dirname(path), { recursive: true });
  const payload = {
    schemaVersion: 'site00-design-asset-live-bindings@1',
    updatedAt: new Date().toISOString(),
    slots: [...slotStore.values()].map(toPersistedSlot),
  };
  writeFileSync(path, JSON.stringify(payload, null, 2), 'utf8');
}

export function projectsHeaderBindingUsesCanonicalSource(): boolean {
  const binding = getProjectsHeaderPlanetBinding();
  if (!binding?.currentAssetUrl) return false;
  return !isTemporaryProviderUrl(binding.currentAssetUrl);
}
