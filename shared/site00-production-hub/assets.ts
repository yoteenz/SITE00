/**
 * Central asset slot registry for the Production Hub.
 * Every image-like element in the Hub is bound to a slot declared here. A slot with no approved
 * asset renders a deliberate named empty state — never a stand-in image.
 */

import { buildEntry002ProductionCastState } from '../site00-studio-world/acting-catalogue/index.js';
import { compileEntry002RetroactiveNarrativeMomentum } from '../site00-expression-engine/narrative-momentum/entry002RetroactiveIngest.js';
import { HUB_ASSET_RECEIPTS } from './assetReceipts.js';
import { HUB_NODE_LABEL, hubNodeAssetSlotId } from './graph.js';
import {
  HUB_NODE_ORDER,
  type HubAssetReceipt,
  type HubAssetSlot,
  type HubAssetType,
  type HubDepartment,
  type HubNodeId,
} from './types.js';

export const HUB_ENTRY002 = { projectId: 'ndxbook', productionId: 'entry-002' } as const;
export const HUB_STORYBOARD_FRAME_TARGET = 16 as const;

export const HUB_PROJECT_COVER_IDS = [
  'ndxbook',
  'studio-world',
  'frontal-slayer',
  'astral-world',
  'all-in-one-enterprises',
] as const;

export function hubSceneAssetSlotId(projectId: string, productionId: string, sceneId: string): string {
  return `production.${projectId}.${productionId}.scene.${sceneId}.reference`;
}
export function hubFrameAssetSlotId(projectId: string, productionId: string, n: number): string {
  return `production.${projectId}.${productionId}.storyboard.frame.${String(n).padStart(2, '0')}`;
}
export function hubProjectCoverSlotId(projectId: string): string {
  return `project.${projectId}.cover`;
}
export const HUB_ATMOSPHERE_SLOT_ID = 'production.hub.chamber.atmosphere';

const DEST_ROOT = 'public/site00/production-hub';
const dest = (slotId: string) => `${DEST_ROOT}/${slotId.replace(/\./g, '/')}.webp`;

const NODE_META: Record<HubNodeId, { department: HubDepartment; assetType: HubAssetType; aspect: string; min: string; purpose: string }> = {
  narrative: { department: 'NARRATIVE', assetType: 'NARRATIVE_EVIDENCE', aspect: '16:10', min: '1280x800', purpose: 'Narrative node artwork: archival evidence still that represents the Entry narrative.' },
  cast: { department: 'CASTING', assetType: 'ACTOR_PORTRAIT', aspect: '16:10', min: '1280x800', purpose: 'Cast node artwork: primary portrait of the locked subject actor in character.' },
  look: { department: 'WARDROBE', assetType: 'WARDROBE_LOOK', aspect: '16:10', min: '1280x800', purpose: 'Look node artwork: approved campaign looks (2016 / 2026) shown together.' },
  performance: { department: 'PERFORMANCE', assetType: 'PERFORMANCE_STILL', aspect: '16:10', min: '1280x800', purpose: 'Performance node artwork: still of the subject in the directed performance state.' },
  set: { department: 'SETS', assetType: 'SET_PLATE', aspect: '16:10', min: '1280x800', purpose: 'Set node artwork: approved environment/set plate for the production.' },
  storyboard: { department: 'STORYBOARD', assetType: 'STORYBOARD_FRAME', aspect: '16:10', min: '1280x800', purpose: 'Storyboard node artwork: representative storyboard frame (normally the pipeline frame).' },
  keyframes: { department: 'KEYFRAMES', assetType: 'KEYFRAME_PLATE', aspect: '16:10', min: '1280x800', purpose: 'Keyframes node artwork: representative locked keyframe plate.' },
};

/** Nodes whose artwork already exists as an approved SITE 00 asset at runtime (no Grok needed). */
export const HUB_NODE_CANONICAL_RUNTIME: Partial<Record<HubNodeId, string>> = {
  cast: 'pre-storyboard visual authority: SUBJECT WOMAN DUAL-ERA AUTHORITY',
  look: 'pre-storyboard visual authority: SUBJECT FASHION CONTINUITY AUTHORITY',
  storyboard: 'final cinematic storyboard pipeline output',
};

export function buildHubAssetSlots(): HubAssetSlot[] {
  const { projectId, productionId } = HUB_ENTRY002;
  const cast = buildEntry002ProductionCastState();
  const plan = compileEntry002RetroactiveNarrativeMomentum();
  const subject = cast.characters.find((c) => c.screenImportance === 'HERO');
  const looks = cast.looks.map((l) => `${l.label}: ${l.wardrobe}; hair ${l.hair}; makeup ${l.makeup}`).join(' || ');
  const slots: HubAssetSlot[] = [];

  for (const id of HUB_NODE_ORDER) {
    const m = NODE_META[id];
    const slotId = hubNodeAssetSlotId(projectId, productionId, id);
    const runtime = HUB_NODE_CANONICAL_RUNTIME[id];
    slots.push({
      slotId,
      projectId,
      productionId,
      sceneId: null,
      department: m.department,
      assetType: m.assetType,
      purpose: m.purpose,
      aspectRatio: m.aspect,
      minimumResolution: m.min,
      visualContext: `Chamber node card "${HUB_NODE_LABEL[id]}" on the Production Hub; also reused in Flow, Dependencies, attention cards and activity rows.`,
      continuityRequirements:
        id === 'cast' ? `Subject: ${subject?.characterName ?? 'subject woman'} — must match actor identity authority (${subject?.actorId ?? 'n/a'}).`
        : id === 'look' ? `Must match approved campaign looks — ${looks}`
        : 'Must be consistent with the Entry 002 world: 2016 Instagram-baddie fashion vs 2026 return; editorial documentary tone.',
      sourceAuthority: runtime ?? 'none — no approved asset exists',
      status: runtime ? 'CANONICAL_RUNTIME' : 'MISSING',
      canonicalAssetId: null,
      grokRequired: !runtime,
      grokPromptBrief: runtime ? '' : `Produce the ${m.assetType.replace(/_/g, ' ').toLowerCase()} for ${HUB_NODE_LABEL[id]} of Entry 002 "${plan.topic}".`,
      destinationPath: dest(slotId),
      usedBy: ['ChamberNode', 'FlowStage', 'DependencyNode', 'NodeInspector', 'AttentionCard'],
    });
  }

  for (const b of plan.beats) {
    const slotId = hubSceneAssetSlotId(projectId, productionId, b.beatId);
    slots.push({
      slotId,
      projectId,
      productionId,
      sceneId: b.beatId,
      department: 'NARRATIVE',
      assetType: 'SCENE_REFERENCE',
      purpose: `Scene selector reference plate for scene ${b.order} "${b.label}".`,
      aspectRatio: '16:9',
      minimumResolution: '1280x720',
      visualContext: `Scene Selector row and central artifact caption. Beat role: ${b.beatRole}. Change in beat: ${b.whatChangesInThisBeat}`,
      continuityRequirements: `Beat ${b.order}/${plan.beats.length}, tension ${b.tensionStage}. Same subject/world as Entry 002.`,
      sourceAuthority: 'none — no approved asset exists',
      status: 'MISSING',
      canonicalAssetId: null,
      grokRequired: true,
      grokPromptBrief: `Scene reference plate: ${b.label} — ${b.whatChangesInThisBeat}`,
      destinationPath: dest(slotId),
      usedBy: ['SceneSelector', 'ArtifactStage'],
    });
  }

  for (let n = 1; n <= HUB_STORYBOARD_FRAME_TARGET; n += 1) {
    const slotId = hubFrameAssetSlotId(projectId, productionId, n);
    slots.push({
      slotId,
      projectId,
      productionId,
      sceneId: null,
      department: 'STORYBOARD',
      assetType: 'STORYBOARD_FRAME',
      purpose: `Storyboard frame ${n}. Produced by the SITE 00 storyboard pipeline, NOT by Grok.`,
      aspectRatio: '9:16',
      minimumResolution: 'pipeline default',
      visualContext: 'Filmstrip, central artifact, Storyboard Authority, Frame Lightbox, Compare.',
      continuityRequirements: 'Pipeline-governed.',
      sourceAuthority: 'final cinematic storyboard pipeline (per-panel public path)',
      status: 'CANONICAL_RUNTIME',
      canonicalAssetId: null,
      grokRequired: false,
      grokPromptBrief: '',
      destinationPath: `runtime:/assets/expression-engine/entry-002/final-cinematic-storyboard/panels/`,
      usedBy: ['Filmstrip', 'ArtifactStage', 'AuthorityPanel', 'FrameLightbox', 'ComparisonWorkspace'],
    });
  }

  for (const pid of HUB_PROJECT_COVER_IDS) {
    const slotId = hubProjectCoverSlotId(pid);
    slots.push({
      slotId,
      projectId: pid,
      productionId: null,
      sceneId: null,
      department: 'PROJECT',
      assetType: 'PROJECT_COVER',
      purpose: `Square cover thumbnail for project "${pid}" in the header and the Project / Production selector.`,
      aspectRatio: '1:1',
      minimumResolution: '512x512',
      visualContext: 'Header project selector (40px) and Project / Production Selector rows (72px).',
      continuityRequirements: `Must represent the founder's personal project "${pid}" — use its existing brand/world; do not invent a different identity.`,
      sourceAuthority: 'none — project has no approved cover asset',
      status: 'MISSING',
      canonicalAssetId: null,
      grokRequired: true,
      grokPromptBrief: `Cover image for founder project ${pid}.`,
      destinationPath: dest(slotId),
      usedBy: ['ProjectProductionSelector', 'HubHeader'],
    });
  }

  slots.push({
    slotId: HUB_ATMOSPHERE_SLOT_ID,
    projectId: 'site00',
    productionId: null,
    sceneId: null,
    department: 'ATMOSPHERE',
    assetType: 'CHAMBER_ATMOSPHERE',
    purpose: 'Optional environmental plate behind the Production Chamber (bright white fabrication atrium).',
    aspectRatio: '9:16',
    minimumResolution: '1080x1920',
    visualContext: 'Full-bleed behind the chamber geometry. The chamber, rings, beam, rails and nodes are live CSS/SVG and are NOT part of this plate.',
    continuityRequirements: 'Bright white / chrome, soft depth of field, no people in the foreground, no text, no UI, no chamber machinery.',
    sourceAuthority: 'none',
    status: 'MISSING',
    canonicalAssetId: null,
    grokRequired: true,
    grokPromptBrief: 'Empty bright white industrial fabrication atrium, chrome and glass, soft red ambient accent light, no foreground objects, no text.',
    destinationPath: dest(HUB_ATMOSPHERE_SLOT_ID),
    usedBy: ['ProductionChamber'],
  });

  return applyReceipts(slots, HUB_ASSET_RECEIPTS);
}

export function applyReceipts(slots: HubAssetSlot[], receipts: readonly HubAssetReceipt[]): HubAssetSlot[] {
  const byId = new Map(receipts.map((r) => [r.slotId, r]));
  return slots.map((s) => {
    const r = byId.get(s.slotId);
    return r ? { ...s, status: 'FULFILLED', canonicalAssetId: r.canonicalAssetId, grokRequired: false } : s;
  });
}

export function hubAssetUrl(
  slotId: string,
  runtimeUrls: Readonly<Record<string, string | null | undefined>> = {},
  receipts: readonly HubAssetReceipt[] = HUB_ASSET_RECEIPTS,
): string | null {
  return receipts.find((r) => r.slotId === slotId)?.url ?? runtimeUrls[slotId] ?? null;
}

/** Slots Grok must fabricate. Only real visual material — never UI, chrome or text. */
export function hubGrokRequiredSlots(slots: readonly HubAssetSlot[] = buildHubAssetSlots()): HubAssetSlot[] {
  return slots.filter((s) => s.grokRequired && s.status === 'MISSING');
}
