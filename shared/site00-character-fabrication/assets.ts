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
/** Authority crops mounted 2026-09-30 from the founder reference pack. Components never import these files. */
export const CHARACTER_ASSET_RECEIPTS: readonly CharacterAssetReceipt[] = [
  {
    slotId: 'actor.sw008.portrait.primary',
    canonicalAssetId: 'asset.site00.actor.sw008.portrait.primary',
    url: '/site00/character-fabrication/actor/sw008/portrait/primary.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'actor.sw017.angle.back',
    canonicalAssetId: 'asset.site00.actor.sw017.angle.back',
    url: '/site00/character-fabrication/actor/sw017/angle/back.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'actor.sw017.angle.front',
    canonicalAssetId: 'asset.site00.actor.sw017.angle.front',
    url: '/site00/character-fabrication/actor/sw017/angle/front.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'actor.sw017.angle.left',
    canonicalAssetId: 'asset.site00.actor.sw017.angle.left',
    url: '/site00/character-fabrication/actor/sw017/angle/left.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'actor.sw017.angle.right',
    canonicalAssetId: 'asset.site00.actor.sw017.angle.right',
    url: '/site00/character-fabrication/actor/sw017/angle/right.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'actor.sw017.body.neutral.back',
    canonicalAssetId: 'asset.site00.actor.sw017.body.neutral.back',
    url: '/site00/character-fabrication/actor/sw017/body/neutral/back.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'actor.sw017.body.neutral.front',
    canonicalAssetId: 'asset.site00.actor.sw017.body.neutral.front',
    url: '/site00/character-fabrication/actor/sw017/body/neutral/front.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'actor.sw017.body.neutral.side',
    canonicalAssetId: 'asset.site00.actor.sw017.body.neutral.side',
    url: '/site00/character-fabrication/actor/sw017/body/neutral/side.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'actor.sw017.chamber.figure',
    canonicalAssetId: 'asset.site00.actor.sw017.chamber.figure',
    url: '/site00/character-fabrication/actor/sw017/chamber/figure.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'actor.sw017.continuity.eye',
    canonicalAssetId: 'asset.site00.actor.sw017.continuity.eye',
    url: '/site00/character-fabrication/actor/sw017/continuity/eye.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'actor.sw017.continuity.scar',
    canonicalAssetId: 'asset.site00.actor.sw017.continuity.scar',
    url: '/site00/character-fabrication/actor/sw017/continuity/scar.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'actor.sw017.continuity.skin',
    canonicalAssetId: 'asset.site00.actor.sw017.continuity.skin',
    url: '/site00/character-fabrication/actor/sw017/continuity/skin.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'actor.sw017.movement.arm-lift',
    canonicalAssetId: 'asset.site00.actor.sw017.movement.arm-lift',
    url: '/site00/character-fabrication/actor/sw017/movement/arm-lift.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'actor.sw017.movement.head-turn',
    canonicalAssetId: 'asset.site00.actor.sw017.movement.head-turn',
    url: '/site00/character-fabrication/actor/sw017/movement/head-turn.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'actor.sw017.movement.turn-table',
    canonicalAssetId: 'asset.site00.actor.sw017.movement.turn-table',
    url: '/site00/character-fabrication/actor/sw017/movement/turn-table.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'actor.sw017.movement.walk-cycle',
    canonicalAssetId: 'asset.site00.actor.sw017.movement.walk-cycle',
    url: '/site00/character-fabrication/actor/sw017/movement/walk-cycle.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'actor.sw017.portrait.primary',
    canonicalAssetId: 'asset.site00.actor.sw017.portrait.primary',
    url: '/site00/character-fabrication/actor/sw017/portrait/primary.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'actor.sw022.portrait.primary',
    canonicalAssetId: 'asset.site00.actor.sw022.portrait.primary',
    url: '/site00/character-fabrication/actor/sw022/portrait/primary.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'actor.sw031.portrait.primary',
    canonicalAssetId: 'asset.site00.actor.sw031.portrait.primary',
    url: '/site00/character-fabrication/actor/sw031/portrait/primary.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'actor.sw034.portrait.primary',
    canonicalAssetId: 'asset.site00.actor.sw034.portrait.primary',
    url: '/site00/character-fabrication/actor/sw034/portrait/primary.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'actor.sw042.portrait.primary',
    canonicalAssetId: 'asset.site00.actor.sw042.portrait.primary',
    url: '/site00/character-fabrication/actor/sw042/portrait/primary.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'actor.sw044.portrait.primary',
    canonicalAssetId: 'asset.site00.actor.sw044.portrait.primary',
    url: '/site00/character-fabrication/actor/sw044/portrait/primary.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.compare.candidate.back',
    canonicalAssetId: 'asset.site00.appearance.sw017.compare.candidate.back',
    url: '/site00/character-fabrication/appearance/sw017/compare/candidate/back.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.compare.candidate.left',
    canonicalAssetId: 'asset.site00.appearance.sw017.compare.candidate.left',
    url: '/site00/character-fabrication/appearance/sw017/compare/candidate/left.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.compare.candidate.primary',
    canonicalAssetId: 'asset.site00.appearance.sw017.compare.candidate.primary',
    url: '/site00/character-fabrication/appearance/sw017/compare/candidate/primary.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.compare.candidate.right',
    canonicalAssetId: 'asset.site00.appearance.sw017.compare.candidate.right',
    url: '/site00/character-fabrication/appearance/sw017/compare/candidate/right.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.compare.current.back',
    canonicalAssetId: 'asset.site00.appearance.sw017.compare.current.back',
    url: '/site00/character-fabrication/appearance/sw017/compare/current/back.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.compare.current.left',
    canonicalAssetId: 'asset.site00.appearance.sw017.compare.current.left',
    url: '/site00/character-fabrication/appearance/sw017/compare/current/left.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.compare.current.primary',
    canonicalAssetId: 'asset.site00.appearance.sw017.compare.current.primary',
    url: '/site00/character-fabrication/appearance/sw017/compare/current/primary.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.compare.current.right',
    canonicalAssetId: 'asset.site00.appearance.sw017.compare.current.right',
    url: '/site00/character-fabrication/appearance/sw017/compare/current/right.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.compare.overlay',
    canonicalAssetId: 'asset.site00.appearance.sw017.compare.overlay',
    url: '/site00/character-fabrication/appearance/sw017/compare/overlay.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.hero.closeup',
    canonicalAssetId: 'asset.site00.appearance.sw017.hero.closeup',
    url: '/site00/character-fabrication/appearance/sw017/hero/closeup.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.layer.eye-detail',
    canonicalAssetId: 'asset.site00.appearance.sw017.layer.eye-detail',
    url: '/site00/character-fabrication/appearance/sw017/layer/eye-detail.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.layer.grit',
    canonicalAssetId: 'asset.site00.appearance.sw017.layer.grit',
    url: '/site00/character-fabrication/appearance/sw017/layer/grit.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.layer.hair-color',
    canonicalAssetId: 'asset.site00.appearance.sw017.layer.hair-color',
    url: '/site00/character-fabrication/appearance/sw017/layer/hair-color.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.layer.hair-style',
    canonicalAssetId: 'asset.site00.appearance.sw017.layer.hair-style',
    url: '/site00/character-fabrication/appearance/sw017/layer/hair-style.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.layer.lip-tone',
    canonicalAssetId: 'asset.site00.appearance.sw017.layer.lip-tone',
    url: '/site00/character-fabrication/appearance/sw017/layer/lip-tone.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.layer.root-shadow',
    canonicalAssetId: 'asset.site00.appearance.sw017.layer.root-shadow',
    url: '/site00/character-fabrication/appearance/sw017/layer/root-shadow.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.layer.skin-finish',
    canonicalAssetId: 'asset.site00.appearance.sw017.layer.skin-finish',
    url: '/site00/character-fabrication/appearance/sw017/layer/skin-finish.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.reference.hair.01',
    canonicalAssetId: 'asset.site00.appearance.sw017.reference.hair.01',
    url: '/site00/character-fabrication/appearance/sw017/reference/hair/01.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.reference.hair.02',
    canonicalAssetId: 'asset.site00.appearance.sw017.reference.hair.02',
    url: '/site00/character-fabrication/appearance/sw017/reference/hair/02.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.reference.hair.03',
    canonicalAssetId: 'asset.site00.appearance.sw017.reference.hair.03',
    url: '/site00/character-fabrication/appearance/sw017/reference/hair/03.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.reference.hair.04',
    canonicalAssetId: 'asset.site00.appearance.sw017.reference.hair.04',
    url: '/site00/character-fabrication/appearance/sw017/reference/hair/04.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.reference.makeup.01',
    canonicalAssetId: 'asset.site00.appearance.sw017.reference.makeup.01',
    url: '/site00/character-fabrication/appearance/sw017/reference/makeup/01.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.reference.makeup.02',
    canonicalAssetId: 'asset.site00.appearance.sw017.reference.makeup.02',
    url: '/site00/character-fabrication/appearance/sw017/reference/makeup/02.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.reference.makeup.03',
    canonicalAssetId: 'asset.site00.appearance.sw017.reference.makeup.03',
    url: '/site00/character-fabrication/appearance/sw017/reference/makeup/03.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'appearance.sw017.reference.makeup.04',
    canonicalAssetId: 'asset.site00.appearance.sw017.reference.makeup.04',
    url: '/site00/character-fabrication/appearance/sw017/reference/makeup/04.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'behavior.sw017.composite.preview',
    canonicalAssetId: 'asset.site00.behavior.sw017.composite.preview',
    url: '/site00/character-fabrication/behavior/sw017/composite/preview.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'behavior.sw017.layer.preview',
    canonicalAssetId: 'asset.site00.behavior.sw017.layer.preview',
    url: '/site00/character-fabrication/behavior/sw017/layer/preview.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'character.subject-woman.portrait.primary',
    canonicalAssetId: 'asset.site00.character.subject-woman.portrait.primary',
    url: '/site00/character-fabrication/character/subject-woman/portrait/primary.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'look.sw017.candidate.a',
    canonicalAssetId: 'asset.site00.look.sw017.candidate.a',
    url: '/site00/character-fabrication/look/sw017/candidate/a.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'look.sw017.candidate.b',
    canonicalAssetId: 'asset.site00.look.sw017.candidate.b',
    url: '/site00/character-fabrication/look/sw017/candidate/b.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'look.sw017.candidate.c',
    canonicalAssetId: 'asset.site00.look.sw017.candidate.c',
    url: '/site00/character-fabrication/look/sw017/candidate/c.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'motion.sw017.overhead-r01.preview',
    canonicalAssetId: 'asset.site00.motion.sw017.overhead-r01.preview',
    url: '/site00/character-fabrication/motion/sw017/overhead-r01/preview.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'motion.sw017.pivot-r45.preview',
    canonicalAssetId: 'asset.site00.motion.sw017.pivot-r45.preview',
    url: '/site00/character-fabrication/motion/sw017/pivot-r45/preview.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'motion.sw017.reach-v02.preview',
    canonicalAssetId: 'asset.site00.motion.sw017.reach-v02.preview',
    url: '/site00/character-fabrication/motion/sw017/reach-v02/preview.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'motion.sw017.sit-v01.preview',
    canonicalAssetId: 'asset.site00.motion.sw017.sit-v01.preview',
    url: '/site00/character-fabrication/motion/sw017/sit-v01/preview.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'motion.sw017.stand-v03.preview',
    canonicalAssetId: 'asset.site00.motion.sw017.stand-v03.preview',
    url: '/site00/character-fabrication/motion/sw017/stand-v03/preview.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'motion.sw017.step-up-v02.preview',
    canonicalAssetId: 'asset.site00.motion.sw017.step-up-v02.preview',
    url: '/site00/character-fabrication/motion/sw017/step-up-v02/preview.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'motion.sw017.turn-l90.preview',
    canonicalAssetId: 'asset.site00.motion.sw017.turn-l90.preview',
    url: '/site00/character-fabrication/motion/sw017/turn-l90/preview.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'motion.sw017.walk-v07.preview',
    canonicalAssetId: 'asset.site00.motion.sw017.walk-v07.preview',
    url: '/site00/character-fabrication/motion/sw017/walk-v07/preview.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'simulation.sw017.current.preview',
    canonicalAssetId: 'asset.site00.simulation.sw017.current.preview',
    url: '/site00/character-fabrication/simulation/sw017/current/preview.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'simulation.sw017.evidence.breath-pattern',
    canonicalAssetId: 'asset.site00.simulation.sw017.evidence.breath-pattern',
    url: '/site00/character-fabrication/simulation/sw017/evidence/breath-pattern.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'simulation.sw017.evidence.lighting-response',
    canonicalAssetId: 'asset.site00.simulation.sw017.evidence.lighting-response',
    url: '/site00/character-fabrication/simulation/sw017/evidence/lighting-response.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'simulation.sw017.evidence.motion-timing',
    canonicalAssetId: 'asset.site00.simulation.sw017.evidence.motion-timing',
    url: '/site00/character-fabrication/simulation/sw017/evidence/motion-timing.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'simulation.sw017.evidence.physique-measurement',
    canonicalAssetId: 'asset.site00.simulation.sw017.evidence.physique-measurement',
    url: '/site00/character-fabrication/simulation/sw017/evidence/physique-measurement.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'simulation.sw017.evidence.scar-visibility',
    canonicalAssetId: 'asset.site00.simulation.sw017.evidence.scar-visibility',
    url: '/site00/character-fabrication/simulation/sw017/evidence/scar-visibility.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'simulation.sw017.evidence.skin-tone',
    canonicalAssetId: 'asset.site00.simulation.sw017.evidence.skin-tone',
    url: '/site00/character-fabrication/simulation/sw017/evidence/skin-tone.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'simulation.sw017.evidence.wardrobe-bottom',
    canonicalAssetId: 'asset.site00.simulation.sw017.evidence.wardrobe-bottom',
    url: '/site00/character-fabrication/simulation/sw017/evidence/wardrobe-bottom.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'simulation.sw017.evidence.wardrobe-top',
    canonicalAssetId: 'asset.site00.simulation.sw017.evidence.wardrobe-top',
    url: '/site00/character-fabrication/simulation/sw017/evidence/wardrobe-top.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'simulation.sw017.test.interact.preview',
    canonicalAssetId: 'asset.site00.simulation.sw017.test.interact.preview',
    url: '/site00/character-fabrication/simulation/sw017/test/interact/preview.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'wardrobe.sw017.garment.bodysuit-01',
    canonicalAssetId: 'asset.site00.wardrobe.sw017.garment.bodysuit-01',
    url: '/site00/character-fabrication/wardrobe/sw017/garment/bodysuit-01.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'wardrobe.sw017.garment.compression-top-01',
    canonicalAssetId: 'asset.site00.wardrobe.sw017.garment.compression-top-01',
    url: '/site00/character-fabrication/wardrobe/sw017/garment/compression-top-01.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'wardrobe.sw017.garment.crop-top-01',
    canonicalAssetId: 'asset.site00.wardrobe.sw017.garment.crop-top-01',
    url: '/site00/character-fabrication/wardrobe/sw017/garment/crop-top-01.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'wardrobe.sw017.garment.hoodie-01',
    canonicalAssetId: 'asset.site00.wardrobe.sw017.garment.hoodie-01',
    url: '/site00/character-fabrication/wardrobe/sw017/garment/hoodie-01.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'wardrobe.sw017.garment.jacket-02',
    canonicalAssetId: 'asset.site00.wardrobe.sw017.garment.jacket-02',
    url: '/site00/character-fabrication/wardrobe/sw017/garment/jacket-02.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'wardrobe.sw017.garment.long-sleeve-01',
    canonicalAssetId: 'asset.site00.wardrobe.sw017.garment.long-sleeve-01',
    url: '/site00/character-fabrication/wardrobe/sw017/garment/long-sleeve-01.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'wardrobe.sw017.garment.sports-bra-01',
    canonicalAssetId: 'asset.site00.wardrobe.sw017.garment.sports-bra-01',
    url: '/site00/character-fabrication/wardrobe/sw017/garment/sports-bra-01.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'wardrobe.sw017.garment.tank-top-02',
    canonicalAssetId: 'asset.site00.wardrobe.sw017.garment.tank-top-02',
    url: '/site00/character-fabrication/wardrobe/sw017/garment/tank-top-02.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'motion.sw017.rig.wireframe',
    canonicalAssetId: 'asset.site00.motion.sw017.rig.wireframe',
    url: '/site00/character-fabrication/motion/sw017/rig/wireframe.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'fabrication.machine.chamber',
    canonicalAssetId: 'grok.site00.character-fabrication.fabrication.machine.chamber.v1',
    url: '/site00/character-fabrication/fabrication/machine/chamber.webp',
    receivedAt: '2026-09-30',
  },
  {
    slotId: 'fabrication.environments.simulation-volume',
    canonicalAssetId: 'grok.site00.character-fabrication.fabrication.environments.simulation-volume.v1',
    url: '/site00/character-fabrication/fabrication/environments/simulation-volume.webp',
    receivedAt: '2026-09-30',
  },
];

/** Authority environment plates (Grok family). */
export const CF_FABRICATION_ENV_SLOT = 'fabrication.machine.chamber';
export const CF_SIMULATION_ENV_SLOT = 'fabrication.environments.simulation-volume';

const dest = (id: string) => `public/site00/character-fabrication/${id.replace(/\./g, '/')}.webp`;
const slot = (slotId: string, group: string, purpose: string, aspectRatio: string, minimumResolution: string, usedBy: string[], runtimeSource: string | null = null): CharacterAssetSlot => ({
  slotId, group, purpose, aspectRatio, minimumResolution, usedBy, runtimeSource, grokRequired: !runtimeSource, destinationPath: dest(slotId),
});

export function buildCharacterAssetSlots(): CharacterAssetSlot[] {
  const out: CharacterAssetSlot[] = [];
  const AUTH = 'pre-storyboard authority board: SUBJECT WOMAN DUAL-ERA AUTHORITY';
  out.push(slot('fabrication.machine.chamber', 'MACHINE', 'Hero plate of the fabrication chamber behind the station machine (optional; chamber geometry itself is live SVG/CSS).', '9:16', '1080x1920', ['FabricationMachine']));
  out.push(
    slot(
      'fabrication.environments.simulation-volume',
      'MACHINE',
      'Distinct capture-room environment for RUNNING SIMULATION (CF-18) only.',
      '9:16',
      '1080x1920',
      ['FabricationMachine'],
    ),
  );
  out.push(slot('actor.sw017.chamber.figure', 'BODY', 'Full-length chamber figure for SW-017, cropped from the look-station authority with no UI.', '9:16', '1080x1920', ['FabricationMachine']));
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
  for (const c of LOOK_CANDIDATES) out.push(slot(`${c.slotId}.layers`, 'LOOK', `Layer-breakdown flat lay of look ${c.label} (garments stacked, no model).`, '4:5', '800x1000', ['LayerBreakdown']));
  for (const r of [...HAIR_REFS, ...MAKEUP_REFS]) out.push(slot(r.slotId, 'APPEARANCE', `${r.kind === 'HAIR' ? 'Hair' : 'Makeup'} reference ${r.refId}.`, '4:5', '800x1000', ['AppearanceLayerList']));
  for (const l of APPEARANCE_LAYERS) out.push(slot(l.slotId, 'APPEARANCE', `Layer swatch/thumbnail: ${l.label}.`, '1:1', '400x400', ['AppearanceLayerList']));
  out.push(slot('appearance.sw017.hero.closeup', 'APPEARANCE', 'Hair + Makeup station hero: head-and-shoulders close-up of the subject inside the chamber (right two-thirds of frame).', '16:10', '1728x1240', ['AppearanceStation']));
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

