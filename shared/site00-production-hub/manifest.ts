/**
 * GROK ASSET MANIFEST builder — derived ONLY from the asset slot registry.
 * Every entry is an empty named slot; nothing here is (or references) fabricated imagery.
 */
import { buildHubAssetSlots, hubGrokRequiredSlots } from './assets.js';
import type { HubAssetSlot } from './types.js';

const CAMERA: Record<string, string> = {
  NARRATIVE_EVIDENCE: 'Overhead / three-quarter documentary evidence framing, shallow depth.',
  ACTOR_PORTRAIT: 'Chest-up portrait, 85mm equivalent, eye-level.',
  WARDROBE_LOOK: 'Full-length paired look study, straight-on.',
  PERFORMANCE_STILL: 'Medium shot, 50mm equivalent, eye-level, mid-performance.',
  SET_PLATE: 'Wide establishing plate, empty set, 24–35mm equivalent.',
  KEYFRAME_PLATE: 'Cinematic keyframe, follows approved storyboard framing.',
  SCENE_REFERENCE: 'Cinematic 16:9 reference plate matching the scene beat.',
  PROJECT_COVER: 'Centered emblematic composition, square crop-safe.',
  CHAMBER_ATMOSPHERE: 'Locked-off wide, deep depth of field, no foreground subject.',
  STORYBOARD_FRAME: 'Pipeline-governed.',
};

const ASSET_ID_PREFIX = 'grok.site00.production-hub';

export type HubGrokManifestEntry = {
  assetId: string;
  slotId: string;
  project: string;
  production: string | null;
  scene: string | null;
  department: string;
  assetType: string;
  purpose: string;
  composition: string;
  cameraAngle: string;
  continuity: string;
  lighting: string;
  aspectRatio: string;
  minimumResolution: string;
  background: string;
  transparency: 'none' | 'alpha-required';
  doNotChange: string[];
  destinationPath: string;
  dependentComponents: readonly string[];
  promptBrief: string;
};

function entry(s: HubAssetSlot): HubGrokManifestEntry {
  return {
    assetId: `${ASSET_ID_PREFIX}.${s.slotId}.v1`,
    slotId: s.slotId,
    project: s.projectId,
    production: s.productionId,
    scene: s.sceneId,
    department: s.department,
    assetType: s.assetType,
    purpose: s.purpose,
    composition: s.visualContext,
    cameraAngle: CAMERA[s.assetType] ?? 'Per continuity requirements.',
    continuity: s.continuityRequirements,
    lighting: s.assetType === 'CHAMBER_ATMOSPHERE' ? 'Bright white daylight, soft red accent.' : 'Neutral cinematic key, consistent with Entry 002 grade; no stylized color cast.',
    aspectRatio: s.aspectRatio,
    minimumResolution: s.minimumResolution,
    background: s.assetType === 'CHAMBER_ATMOSPHERE' ? 'The plate itself is the background.' : 'In-scene background appropriate to the asset; no UI, no text, no watermark.',
    transparency: 'none',
    doNotChange: [
      'No text, captions, logos or UI chrome baked into the image.',
      'No chamber machinery (rings, beams, rails, nodes) — those are live code.',
      'Identity / wardrobe continuity must match canonical Entry 002 cast and looks.',
      'Deliver at the exact aspect ratio; do not crop from reference screenshots.',
    ],
    destinationPath: s.destinationPath,
    dependentComponents: s.usedBy,
    promptBrief: s.grokPromptBrief,
  };
}

export function buildHubGrokManifest() {
  const all = buildHubAssetSlots();
  const required = hubGrokRequiredSlots(all);
  return {
    sprint: 'P0.PRODUCTION-HUB.AUTHORITY-RECONSTRUCTION-AND-HANDOFF1',
    generatedBy: 'shared/site00-production-hub/manifest.ts (deterministic; from asset registry)',
    receiptContract: 'Grok output → canonical asset id → HUB_ASSET_RECEIPTS (shared/site00-production-hub/assetReceipts.ts) → declared slot → HubImage component',
    visualAssetsGeneratedBySonnet: 0,
    totalSlots: all.length,
    canonicalRuntimeSlots: all.filter((s) => s.status === 'CANONICAL_RUNTIME').length,
    grokRequiredCount: required.length,
    assets: required.map(entry),
  };
}
