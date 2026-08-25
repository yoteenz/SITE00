/**
 * P0.5E.4D — Character casting prompt contract + reference-driven recompilation.
 */

import { randomUUID } from 'node:crypto';
import {
  CASTING_NEGATIVE_CONSTRAINTS,
  CASTING_VARIATION_AXES,
  REFERENCE_DRIVEN_NEGATIVE_CONSTRAINTS,
} from './constants.js';
import type {
  ActiveCastingReferenceAuthority,
  CastingVariationAxis,
  CharacterBibleAssetSlot,
  CharacterCastingPromptContract,
  CharacterReferenceDecomposition,
  CharacterTruthSnapshot,
  CharacterVisualCastingState,
  ReferenceControlledVariationSlot,
} from './types.js';

const CULTURAL_IDENTITY_BLOCK = `Contemporary African-American woman. Editorial ease, cultural fluency, non-stereotyped representation. Natural/protective hair possibilities. Lived-in styling — not generic luxury influencer.`;

function formatField(label: string, field: { value: string; confidence: string }): string {
  return `${label}: ${field.value} [${field.confidence.replace(/_/g, ' ').toLowerCase()}]`;
}

function assetSlotInstruction(slot: CharacterBibleAssetSlot): string {
  const map: Record<CharacterBibleAssetSlot, string> = {
    PORTRAIT_FRONT: 'Front-facing identity portrait — neutral expression, same woman as reference',
    PORTRAIT_THREE_QUARTER: 'Three-quarter portrait — same facial identity as reference',
    PORTRAIT_LEFT_PROFILE: 'Left profile portrait — preserve identity anchors from reference',
    PORTRAIT_RIGHT_PROFILE: 'Right profile portrait — preserve identity anchors from reference',
    PORTRAIT_BACK_HAIR: 'Rear view emphasizing hair silhouette — same woman',
    FULL_BODY_FRONT: 'Full-body front view — same woman, wardrobe from reference decomposition',
    FULL_BODY_LEFT: 'Full-body left side view — continuity with reference identity',
    FULL_BODY_RIGHT: 'Full-body right side view — continuity with reference identity',
    FULL_BODY_BACK: 'Full-body back view — same woman, hair and wardrobe continuity',
    FULL_BODY_STANDING_NEUTRAL: 'Standing neutral full-body reference pose',
    WARDROBE_SHEET: 'Wardrobe breakdown sheet — isolated outfit callouts from reference look',
    ENVIRONMENT_SET: 'Environment/set reference derived from source image lighting and space',
    EXPRESSION_NEUTRAL: 'Expression reference — neutral, same identity',
    EXPRESSION_SLIGHT_SMILE: 'Expression reference — slight smile, same identity',
    EXPRESSION_SKEPTICAL: 'Expression reference — skeptical/thinking, same identity',
    EXPRESSION_OBSERVANT: 'Expression reference — observant gaze, same identity',
    EXPRESSION_CALM_DIRECT: 'Expression reference — calm direct gaze, same identity',
  };
  return map[slot];
}

function controlledVariationInstruction(slot: ReferenceControlledVariationSlot): string {
  const map: Record<ReferenceControlledVariationSlot, string> = {
    CONTROLLED_EXPRESSION: 'Minor expression variation only — same woman',
    CONTROLLED_HAIR_POLISH: 'Minor hair polish variation — same hairstyle identity',
    CONTROLLED_WARDROBE_POLISH: 'Minor wardrobe polish — same look lane',
    CONTROLLED_PRESENCE_INTENSITY: 'Minor presence intensity shift — same identity',
    CONTROLLED_CAMERA_ANGLE: 'Minor camera angle shift — same woman',
    CONTROLLED_ENVIRONMENT_FRAMING: 'Minor environment framing — same set lane',
  };
  return map[slot];
}

function buildReferenceAuthorityBlock(
  decomposition: CharacterReferenceDecomposition,
  authority: ActiveCastingReferenceAuthority,
): string {
  const d = decomposition;
  return [
    'REFERENCE IDENTITY AUTHORITY — PRIMARY SOURCE OF TRUTH',
    `Founder reference image: ${authority.previewUrl}`,
    `Storage path: ${authority.storagePath}`,
    formatField('Age range', d.identity.ageRange),
    formatField('Skin tone', d.identity.skinTone),
    formatField('Face shape', d.identity.faceShape),
    ...d.identity.likenessAnchors.map((anchor, index) => formatField(`Likeness anchor ${index + 1}`, anchor)),
    formatField('Hair structure', d.hair.styleStructure),
    formatField('Hair color', d.hair.color),
    formatField('Wardrobe look', d.wardrobe.lookNaming),
    formatField('Presence', d.presence.moodEnergy),
    formatField('Environment lighting', d.environment.lightingMood),
    'Recreate THIS woman by herself — reconstruct and extend, not inspired-by casting',
  ].join('\n');
}

export function compileReferenceDrivenCastingPromptContract(params: {
  snapshot: CharacterTruthSnapshot;
  decomposition: CharacterReferenceDecomposition;
  authority: ActiveCastingReferenceAuthority;
  assetSlot?: CharacterBibleAssetSlot;
  controlledVariationSlot?: ReferenceControlledVariationSlot;
}): CharacterCastingPromptContract {
  const d = params.decomposition;
  const referenceBlock = buildReferenceAuthorityBlock(d, params.authority);
  const legacySummary = params.snapshot.characterSummary?.text ?? 'Founder-confirmed character truth';
  const generationMode = params.assetSlot ? 'CHARACTER_BIBLE_ASSET_PACK' : 'REFERENCE_DRIVEN';
  const slotInstruction = params.assetSlot
    ? assetSlotInstruction(params.assetSlot)
    : params.controlledVariationSlot
      ? controlledVariationInstruction(params.controlledVariationSlot)
      : 'Reference-driven reconstruction of the same woman';

  return {
    contractId: randomUUID(),
    snapshotId: params.snapshot.snapshotId,
    variationAxis: 'FACE_STRUCTURE',
    generationMode,
    assetSlot: params.assetSlot ?? null,
    controlledVariationSlot: params.controlledVariationSlot ?? null,
    referenceAuthorityId: params.authority.authorityId,
    sections: {
      referenceAuthorityBlock: referenceBlock,
      characterTruth: `[SECONDARY] Psychological character context: ${legacySummary}`,
      culturalIdentity: CULTURAL_IDENTITY_BLOCK,
      ageRange: formatField('Age range authority', d.identity.ageRange),
      facePresence: [
        formatField('Face shape', d.identity.faceShape),
        formatField('Eye shape', d.identity.eyeShape),
        formatField('Presence energy', d.identity.presenceEnergy),
      ].join('\n'),
      hair: [
        formatField('Hair structure', d.hair.styleStructure),
        formatField('Hair texture', d.hair.texture),
        formatField('Hair color', d.hair.color),
      ].join('\n'),
      beauty: 'Premium natural skin texture — match reference, no plastic gloss',
      wardrobe: [
        formatField('Look', d.wardrobe.lookNaming),
        formatField('Silhouette', d.wardrobe.silhouette),
        formatField('Palette', d.wardrobe.colorPalette),
      ].join('\n'),
      jewelry: formatField('Jewelry', d.wardrobe.jewelry),
      posture: formatField('Posture', d.presence.posture),
      cameraRelationship: formatField('Camera relationship', d.presence.cameraRelationship),
      environment: [
        formatField('Room/set', d.environment.roomType),
        formatField('Lighting', d.environment.lightingMood),
        formatField('Realism lane', d.environment.realismLane),
      ].join('\n'),
      light: formatField('Lighting mood', d.environment.lightingMood),
      realism: 'Photorealistic editorial still — same woman continuity across all outputs',
      negativeIdentityConstraints: REFERENCE_DRIVEN_NEGATIVE_CONSTRAINTS.join('; '),
      variationAxis: `[REFERENCE LOCKED] ${slotInstruction}`,
      continuityIntent: 'Same woman controlled family — identity locked to founder reference',
      legacyPromptSecondary: `[LEGACY SECONDARY ONLY] Prior casting prompt assumptions must not override reference authority. ${legacySummary}`,
    },
  };
}

export function storePromptContractSnapshot(
  state: CharacterVisualCastingState,
  contract: CharacterCastingPromptContract,
): CharacterVisualCastingState {
  return {
    ...state,
    promptContractSnapshots: {
      ...(state.promptContractSnapshots ?? {}),
      [contract.contractId]: contract,
    },
  };
}

export function resolveStoredPromptContract(
  state: CharacterVisualCastingState,
  promptSnapshotId: string,
): CharacterCastingPromptContract | null {
  return state.promptContractSnapshots?.[promptSnapshotId] ?? null;
}

export function compileCharacterCastingPromptContract(params: {
  snapshot: CharacterTruthSnapshot;
  variationAxis: CastingVariationAxis;
  founderReferenceNotes?: string[];
}): CharacterCastingPromptContract {
  const summary = params.snapshot.characterSummary?.text ?? 'Founder-confirmed character truth';
  const axisLabel = params.variationAxis.replace(/_/g, ' ').toLowerCase();
  const referenceBlock =
    params.founderReferenceNotes && params.founderReferenceNotes.length > 0
      ? params.founderReferenceNotes.join('\n')
      : '';

  return {
    contractId: randomUUID(),
    snapshotId: params.snapshot.snapshotId,
    variationAxis: params.variationAxis,
    generationMode: 'LEGACY_VARIATION',
    sections: {
      characterTruth: summary,
      culturalIdentity: CULTURAL_IDENTITY_BLOCK,
      ageRange: 'Mid-30s editorial presence — believable, not teen glam',
      facePresence: referenceBlock.includes('FACE') || referenceBlock.includes('FULL_LOOK')
        ? `Intelligent, approachable presence — honor founder face reference signals. ${referenceBlock}`
        : 'Intelligent, approachable, camera-comfortable without performing',
      hair: referenceBlock.includes('HAIR') || referenceBlock.includes('FULL_LOOK')
        ? `Protective styles or natural texture — honor founder hair reference. ${referenceBlock}`
        : 'Protective styles or natural texture — authentic, not fantasy',
      beauty: 'Premium but natural skin texture — no plastic gloss',
      wardrobe: 'Black and neutrals dominate; signature accent feels chosen',
      jewelry: 'Gold jewelry may feel lived-in, not costume',
      posture: 'Looks like she had somewhere to be whether camera showed up or not',
      cameraRelationship: params.snapshot.cameraBehavior.map((c) => c.text).join(' · ') || 'At ease, not performing for content',
      environment: 'Upscale but real-world interior or transit — not AI fantasy luxury',
      light: 'Premium natural editorial light — golden hour or soft window',
      realism: 'Photorealistic, socially native, nearly indistinguishable from real editorial still',
      negativeIdentityConstraints: CASTING_NEGATIVE_CONSTRAINTS.join('; '),
      variationAxis: `Controlled variation on ${axisLabel} only — same character truth`,
      continuityIntent: 'Plausible manifestation of the same psychological character — not six random women',
    },
  };
}

export function buildInitialCastingPromptMatrix(
  snapshot: CharacterTruthSnapshot,
  founderReferenceNotes?: string[],
): CharacterCastingPromptContract[] {
  return CASTING_VARIATION_AXES.slice(0, 6).map((axis) =>
    compileCharacterCastingPromptContract({ snapshot, variationAxis: axis, founderReferenceNotes }),
  );
}

export function promptContractsShareCharacterTruth(contracts: CharacterCastingPromptContract[]): boolean {
  if (contracts.length < 2) return true;
  const base = contracts[0]?.sections.characterTruth;
  return contracts.every((c) => c.sections.characterTruth === base);
}

/** Flatten a casting prompt contract into provider-ready prompt text. */
export function compileCastingPromptFromContract(contract: CharacterCastingPromptContract): {
  prompt: string;
  negativePrompt: string;
} {
  const s = contract.sections;
  const isReferenceDriven =
    contract.generationMode === 'REFERENCE_DRIVEN' || contract.generationMode === 'CHARACTER_BIBLE_ASSET_PACK';

  const prompt = isReferenceDriven
    ? [
        'Reference-driven character reconstruction — founder uploaded image is primary authority.',
        s.referenceAuthorityBlock ?? '',
        s.variationAxis,
        s.facePresence,
        s.hair,
        s.wardrobe,
        s.posture,
        s.cameraRelationship,
        s.environment,
        s.light,
        s.realism,
        s.continuityIntent,
        s.legacyPromptSecondary ?? `[SECONDARY] ${s.characterTruth}`,
      ]
        .filter(Boolean)
        .join('\n')
    : [
        'Editorial casting still — photorealistic character interpretation for founder visual casting review.',
        s.characterTruth,
        s.culturalIdentity,
        s.ageRange,
        s.facePresence,
        s.hair,
        s.beauty,
        s.wardrobe,
        s.jewelry,
        s.posture,
        s.cameraRelationship,
        s.environment,
        s.light,
        s.realism,
        s.variationAxis,
        s.continuityIntent,
      ].join('\n');

  return { prompt, negativePrompt: s.negativeIdentityConstraints };
}

/** True when legacy prompt text would dominate over reference authority (should be false when active authority exists). */
export function legacyPromptWouldDominate(contract: CharacterCastingPromptContract): boolean {
  if (contract.generationMode === 'REFERENCE_DRIVEN' || contract.generationMode === 'CHARACTER_BIBLE_ASSET_PACK') {
    return false;
  }
  const truth = contract.sections.characterTruth ?? '';
  const reference = contract.sections.referenceAuthorityBlock ?? '';
  return truth.length > reference.length && !reference.includes('PRIMARY SOURCE OF TRUTH');
}
