/**
 * CHARACTER FABRICATION ASSET REGISTRY — every legitimate photographic slot has a semantic id.
 * Sonnet generates NO imagery. Slots are empty/replaceable; runtime canonical images may fill a slot only via
 * `characterAssetUrl` (receipts, then canonical runtime resolvers). This becomes the Grok fabrication boundary.
 */
import { actorAngleSlotId, actorPortraitSlotId, listFabricationActors } from './actors.js';
import { APPEARANCE_LAYERS, HAIR_REFS, LOOK_CANDIDATES, MAKEUP_REFS, MOTION_LIBRARY, MOVEMENT_REFERENCES, WARDROBE_LIBRARY } from './library.js';
import { SEEDED_DEFECTS } from './simulation.js';

export type CharacterAssetSlot = {
  slotId: string;
  group: string;
  purpose: string;
  aspectRatio: string;
  minimumResolution: string;
  usedBy: readonly string[];
  /** canonical runtime source that may fill this slot without Grok (e.g. an existing authority board) */
  runtimeSource: string | null;
  grokRequired: boolean;
  destinationPath: string;
};

export type CharacterAssetReceipt = { slotId: string; canonicalAssetId: string; url: string; receivedAt: string };
/** Empty on purpose — Sonnet fulfils nothing. Composer appends receipts after Grok delivers. */
export const CHARACTER_ASSET_RECEIPTS: readonly CharacterAssetReceipt[] = [];

const dest = (id: string) => `public/site00/character-fabrication/${id.replace(/\./g, '/')}.webp`;
const slot = (slotId: string, group: string, purpose: string, aspectRatio: string, minimumResolution: string, usedBy: string[], runtimeSource: string | null = null): CharacterAssetSlot => ({
  slotId, group, purpose, aspectRatio, minimumResolution, usedBy, runtimeSource, grokRequired: !runtimeSource, destinationPath: dest(slotId),
});

export function buildCharacterAssetSlots(): CharacterAssetSlot[] {
  const out: CharacterAssetSlot[] = [];
  const AUTH = 'pre-storyboard authority board: SUBJECT WOMAN DUAL-ERA AUTHORITY';
  out.push(slot('fabrication.machine.chamber', 'MACHINE', 'Hero plate of the fabrication chamber behind the station machine (optional; chamber geometry itself is live SVG/CSS).', '9:16', '1080x1920', ['FabricationMachine']));
  for (const a of listFabricationActors()) {
    out.push(slot(actorPortraitSlotId(a.catalogueNumber), 'ACTOR', `Primary approved portrait of actor ${a.catalogueNumber}.`, '4:5', '1024x1280', ['ActorCard', 'ActorAuthorityCard', 'ActorProfile'], a.catalogueNumber === 'SW-017' ? AUTH : null));
  }
  for (const ang of ['front', 'left', 'right', 'back'] as const) out.push(slot(actorAngleSlotId('SW-017', ang), 'ACTOR', `Approved ${ang} angle of SW-017.`, '4:5', '1024x1280', ['ActorProfile']));
  for (const v of ['front', 'side', 'back'] as const) out.push(slot(`actor.sw017.body.neutral.${v}`, 'BODY', `Neutral full-body ${v} authority for SW-017.`, '9:16', '1080x1920', ['ContinuityInspector', 'BodyGate']));
  out.push(slot('actor.sw017.continuity.eye', 'ACTOR', 'Continuity reference: eye detail.', '1:1', '512x512', ['ActorProfile']));
  out.push(slot('actor.sw017.continuity.skin', 'ACTOR', 'Continuity reference: skin detail.', '1:1', '512x512', ['ActorProfile']));
  out.push(slot('actor.sw017.continuity.scar', 'ACTOR', 'Continuity reference: scar detail.', '1:1', '512x512', ['ActorProfile']));
  out.push(slot('character.subject-woman.portrait.primary', 'CHARACTER', 'Character portrait (SUBJECT WOMAN, NDXBOOK Entry 002).', '4:5', '1024x1280', ['CharacterAuthorityCard', 'AuthorityReview'], AUTH));
  for (const m of MOVEMENT_REFERENCES) out.push(slot(`actor.sw017.movement.${m.refId}`, 'BODY', `Movement reference still: ${m.label}.`, '16:10', '1280x800', ['ContinuityInspector']));
  for (const g of WARDROBE_LIBRARY) out.push(slot(g.slotId, 'WARDROBE', `Product photography for ${g.name}.`, '1:1', '800x800', ['GarmentAssetCard', 'FittingSlot']));
  for (const c of LOOK_CANDIDATES) out.push(slot(c.slotId, 'LOOK', `Full-length render of look ${c.label}.`, '9:16', '1080x1920', ['CandidateComparison']));
  for (const r of [...HAIR_REFS, ...MAKEUP_REFS]) out.push(slot(r.slotId, 'APPEARANCE', `${r.kind === 'HAIR' ? 'Hair' : 'Makeup'} reference ${r.refId}.`, '4:5', '800x1000', ['AppearanceLayerList']));
  for (const l of APPEARANCE_LAYERS) out.push(slot(l.slotId, 'APPEARANCE', `Layer swatch/thumbnail: ${l.label}.`, '1:1', '400x400', ['AppearanceLayerList']));
  for (const st of ['current', 'candidate'] as const) out.push(slot(`appearance.sw017.compare.${st}.primary`, 'APPEARANCE', `${st} appearance treatment — primary view.`, '4:5', '1280x1600', ['AuthorityComparison']));
  for (const st of ['current', 'candidate'] as const) for (const v of ['left', 'back', 'right']) out.push(slot(`appearance.sw017.compare.${st}.${v}`, 'APPEARANCE', `${st} appearance treatment — ${v} angle.`, '4:5', '800x1000', ['AuthorityComparison']));
  out.push(slot('appearance.sw017.compare.overlay', 'APPEARANCE', 'Side-by-side overlay crop source.', '16:9', '1280x720', ['AuthorityComparison']));
  out.push(slot('behavior.sw017.composite.preview', 'CHARACTER', 'Behavioral composite preview portrait.', '4:5', '800x1000', ['BehaviorLayerControl', 'BehaviorLibrary']));
  out.push(slot('behavior.sw017.layer.preview', 'CHARACTER', 'Behavior layer preview portrait.', '4:5', '800x1000', ['BehaviorLibrary']));
  for (const m of MOTION_LIBRARY) out.push(slot(m.slotId, 'MOTION', `Motion preview thumbnail/poster for ${m.motionId}.`, '9:16', '720x1280', ['MotionLibrary', 'MotionInspector']));
  out.push(slot('motion.sw017.rig.wireframe', 'MOTION', 'Biomechanical wireframe figure.', '3:4', '600x800', ['MotionInspector']));
  for (const t of ['walk', 'idle', 'sit', 'turn', 'enter', 'exit', 'speak', 'react', 'interact']) out.push(slot(`simulation.sw017.test.${t}.preview`, 'SIMULATION', `Testing Ground preview frame for ${t.toUpperCase()}.`, '1:1', '1024x1024', ['TestingGround']));
  out.push(slot('simulation.sw017.current.preview', 'SIMULATION', 'Live feed / current simulation frame.', '16:9', '1920x1080', ['TestingGround', 'SimulationResult']));
  for (const d of ['wardrobe-top', 'wardrobe-bottom', 'scar-visibility', 'motion-timing', 'lighting-response', 'physique-measurement', 'skin-tone', 'breath-pattern']) out.push(slot(`simulation.sw017.evidence.${d}`, 'SIMULATION', `Continuity check evidence thumbnail: ${d}.`, '1:1', '400x400', ['ContinuityChecklist']));
  return out;
}

export const characterGrokSlots = (slots = buildCharacterAssetSlots()): CharacterAssetSlot[] => slots.filter((s) => s.grokRequired && !CHARACTER_ASSET_RECEIPTS.some((r) => r.slotId === s.slotId));

export function characterAssetUrl(slotId: string, runtimeUrls: Readonly<Record<string, string | null | undefined>> = {}): string | null {
  return CHARACTER_ASSET_RECEIPTS.find((r) => r.slotId === slotId)?.url ?? runtimeUrls[slotId] ?? null;
}

export function buildCharacterAssetManifest() {
  const all = buildCharacterAssetSlots();
  const need = characterGrokSlots(all);
  return {
    sprint: 'P0.SW.CHARACTER-FABRICATION-LIVE-MACHINE1',
    receiptContract: 'Grok output → canonical asset id → CHARACTER_ASSET_RECEIPTS (shared/site00-character-fabrication/assets.ts) → semantic slot → CfImage',
    visualAssetsGeneratedBySonnet: 0,
    seededDefects: SEEDED_DEFECTS,
    totalSlots: all.length,
    runtimeCanonicalSlots: all.filter((s) => !s.grokRequired).length,
    grokRequiredCount: need.length,
    slotsByGroup: Object.fromEntries([...new Set(all.map((s) => s.group))].map((g) => [g, all.filter((s) => s.group === g).length])),
    assets: need.map((s) => ({ ...s, assetId: `grok.site00.character-fabrication.${s.slotId}.v1`, doNotChange: ['No baked UI, text, captions or logos.', 'Actor identity must match canonical actor authority (SW-017).', 'Exact aspect ratio; no crops from authority screenshots.'] })),
    canonicalRuntime: all.filter((s) => !s.grokRequired).map((s) => ({ slotId: s.slotId, source: s.runtimeSource })),
  };
}

