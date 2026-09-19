/**
 * P0.VR.2A — NDXBOOK pilot asset slot seeds (campaign board + overview samples).
 */

import type { CanonicalVisualReference } from '../p0vr2/types.js';
import { CAMPAIGN_BOARD_VISUAL_ASSET_MANIFEST } from '../p0vr1d13/campaignBoardVisualAssetManifest.js';
import { detectVisualRegions } from './regionClassification.js';
import {
  clearSlotRegistryForTest,
  createSlotsFromDetectedRegions,
  listSlotsForScreen,
  updateReferenceVisualAssetSlot,
} from './referenceVisualAssetSlotRegistry.js';
import { registerExistingAssetCatalog } from './existingAssetLookup.js';
import type { ReferenceAssetRole, ReferenceAssetType } from './types.js';

const ndxPilotSeeded = new Set<string>();

export function seedNdxCampaignBoardAssetSlots(reference: CanonicalVisualReference): void {
  const key = `${reference.projectId}:${reference.screenId}:${reference.viewportClass}`;
  if (ndxPilotSeeded.has(key)) return;

  registerExistingAssetCatalog('ndxbook', CAMPAIGN_BOARD_VISUAL_ASSET_MANIFEST.map((e) => ({
    assetId: e.assetId,
    url: e.storagePath,
    role: mapCampaignRole(e.assetRole),
    canonical: e.status === 'READY' && e.source === 'EXISTING_ASSET',
    approvedPipeline: e.source === 'EXISTING_ASSET',
  })));

  const regions = detectVisualRegions(
    CAMPAIGN_BOARD_VISUAL_ASSET_MANIFEST.filter((e) => e.assetRole !== 'PAPER_TEXTURES').map((e, i) => ({
      regionId: e.assetId,
      kind: 'IMAGE_ASSET',
      bounds: campaignBoardSlotBounds(i),
      hasRasterContent: true,
      assetRoleHint: mapCampaignRole(e.assetRole),
      assetTypeHint: 'CAMPAIGN_ART' as ReferenceAssetType,
    })),
  );

  createSlotsFromDetectedRegions({
    createInput: {
      projectId: reference.projectId,
      screenId: reference.screenId,
      route: reference.route,
      viewportClass: reference.viewportClass,
      referenceId: reference.referenceId,
    },
    regions,
    referenceStoragePath: reference.storagePath,
    roleResolver: (region) => ({
      role: (region.assetRoleHint ?? 'CAMPAIGN_ARTWORK') as ReferenceAssetRole,
      type: 'CAMPAIGN_ART',
    }),
  });

  ndxPilotSeeded.add(key);
}

export function seedNdxOverviewSampleSlots(reference: CanonicalVisualReference): void {
  const key = `overview:${reference.referenceId}`;
  if (ndxPilotSeeded.has(key)) return;

  const regions = detectVisualRegions([
    {
      regionId: 'sticky-note-01',
      kind: 'IMAGE_ASSET',
      bounds: { x: 24, y: 420, width: 140, height: 92 },
      hasRasterContent: true,
      assetRoleHint: 'STICKY_NOTE',
      assetTypeHint: 'STICKY_NOTE',
    },
    {
      regionId: 'campaign-art-card',
      kind: 'IMAGE_ASSET',
      bounds: { x: 24, y: 540, width: 320, height: 210 },
      hasRasterContent: true,
      assetRoleHint: 'CAMPAIGN_ARTWORK',
      assetTypeHint: 'CAMPAIGN_ART',
    },
    {
      regionId: 'character-portrait',
      kind: 'IMAGE_ASSET',
      bounds: { x: 260, y: 120, width: 96, height: 128 },
      hasRasterContent: true,
      assetRoleHint: 'CHARACTER_PORTRAIT',
      assetTypeHint: 'CHARACTER_IMAGE',
    },
  ]);

  createSlotsFromDetectedRegions({
    createInput: {
      projectId: reference.projectId,
      screenId: reference.screenId,
      route: reference.route,
      viewportClass: reference.viewportClass,
      referenceId: reference.referenceId,
      requiresCharacterAuthority: false,
    },
    regions,
    referenceStoragePath: reference.storagePath,
    roleResolver: (region) => ({
      role: (region.assetRoleHint ?? 'DECORATIVE') as ReferenceAssetRole,
      type: (region.assetTypeHint ?? 'EDITORIAL_IMAGE') as ReferenceAssetType,
    }),
  });

  // Character slot should block without authority
  const slots = listSlotsForScreen(reference.projectId, reference.screenId, reference.viewportClass);
  const characterSlot = slots.find((s) => s.assetType === 'CHARACTER_IMAGE');
  if (characterSlot) {
    updateReferenceVisualAssetSlot(characterSlot.slotId, {
      requiresCharacterAuthority: true,
      characterAuthorityReady: false,
      generationStatus: 'BLOCKED',
      assetStatus: 'BLOCKED',
    });
  }

  ndxPilotSeeded.add(key);
}

function mapCampaignRole(role: string): ReferenceAssetRole {
  if (role.includes('PAGE')) return 'CAMPAIGN_ARTWORK';
  if (role.includes('BOOK')) return 'CAMPAIGN_ARTWORK';
  return 'CAMPAIGN_ARTWORK';
}

function campaignBoardSlotBounds(index: number): { x: number; y: number; width: number; height: number } {
  const layouts = [
    { x: 20, y: 180, width: 168, height: 220 },
    { x: 202, y: 180, width: 168, height: 220 },
    { x: 20, y: 420, width: 168, height: 220 },
    { x: 202, y: 420, width: 168, height: 220 },
    { x: 20, y: 660, width: 350, height: 120 },
  ];
  return layouts[index % layouts.length];
}

export function resetNdxPilotAssetSlotsForTest(): void {
  ndxPilotSeeded.clear();
  clearSlotRegistryForTest();
}

export function ensureNdxPilotAssetSlots(reference: CanonicalVisualReference): void {
  if (reference.screenId === 'campaign-board') {
    seedNdxCampaignBoardAssetSlots(reference);
  } else if (reference.screenId === 'overview') {
    seedNdxOverviewSampleSlots(reference);
  }
}
