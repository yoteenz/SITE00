/**
 * P0.5E.4E — Character Bible asset view contracts (anchor-dependent generation tasks).
 */

import { ANCHOR_DEPENDENT_NEGATIVE_CONSTRAINTS } from './constants.js';
import type { CharacterBibleAssetGenerationContract, CharacterBibleAssetSlot } from './types.js';

const BASE_SAME_WOMAN = 'Same woman as uploaded reference and approved canonical anchor — no re-cast';
const BASE_SAME_OUTFIT = 'Same outfit as reference authority — document, do not restyle';
const BASE_SAME_ENV = 'Same environment family as reference — controlled scene continuity';

export function buildCharacterBibleViewContract(slot: CharacterBibleAssetSlot): CharacterBibleAssetGenerationContract {
  const contracts: Record<CharacterBibleAssetSlot, CharacterBibleAssetGenerationContract> = {
    FRONT_VIEW: {
      contractId: slot,
      assetSlot: slot,
      sameWomanRule: BASE_SAME_WOMAN,
      sameOutfitRule: BASE_SAME_OUTFIT,
      sameEnvironmentFamilyRule: BASE_SAME_ENV,
      viewOrientation: 'Front-facing full look — neutral reference framing, minimal expression drift',
      inferenceRules: 'Preserve visible facial structure; infer unseen ear/back hair per visibility map',
      negativeConstraints: [...ANCHOR_DEPENDENT_NEGATIVE_CONSTRAINTS],
    },
    LEFT_SIDE_VIEW: {
      contractId: slot,
      assetSlot: slot,
      sameWomanRule: BASE_SAME_WOMAN,
      sameOutfitRule: BASE_SAME_OUTFIT,
      sameEnvironmentFamilyRule: BASE_SAME_ENV,
      viewOrientation: 'Left profile / left three-quarter — same outfit, preserve hair behavior from anchor',
      inferenceRules: 'Profile geometry must match anchor identity signature',
      negativeConstraints: [...ANCHOR_DEPENDENT_NEGATIVE_CONSTRAINTS],
    },
    RIGHT_SIDE_VIEW: {
      contractId: slot,
      assetSlot: slot,
      sameWomanRule: BASE_SAME_WOMAN,
      sameOutfitRule: BASE_SAME_OUTFIT,
      sameEnvironmentFamilyRule: BASE_SAME_ENV,
      viewOrientation: 'Right profile / right three-quarter — preserve jewelry/accessories where consistent',
      inferenceRules: 'Maintain proportions and hair fall from approved anchor',
      negativeConstraints: [...ANCHOR_DEPENDENT_NEGATIVE_CONSTRAINTS],
    },
    BACK_VIEW: {
      contractId: slot,
      assetSlot: slot,
      sameWomanRule: BASE_SAME_WOMAN,
      sameOutfitRule: BASE_SAME_OUTFIT,
      sameEnvironmentFamilyRule: BASE_SAME_ENV,
      viewOrientation: 'Back-facing — preserve back silhouette, hair fall, garment structure',
      inferenceRules: 'Unseen facial features follow ViewInferenceMap as inferred only',
      negativeConstraints: [...ANCHOR_DEPENDENT_NEGATIVE_CONSTRAINTS],
    },
    FULL_BODY_VIEW: {
      contractId: slot,
      assetSlot: slot,
      sameWomanRule: BASE_SAME_WOMAN,
      sameOutfitRule: BASE_SAME_OUTFIT,
      sameEnvironmentFamilyRule: BASE_SAME_ENV,
      viewOrientation: 'Head-to-toe full body — outfit fully visible, documentation-grade framing',
      inferenceRules: 'Shoes/bottom garments follow wardrobe lock when not visible in source',
      negativeConstraints: [...ANCHOR_DEPENDENT_NEGATIVE_CONSTRAINTS],
    },
    SEATED_EDITORIAL_VIEW: {
      contractId: slot,
      assetSlot: slot,
      sameWomanRule: BASE_SAME_WOMAN,
      sameOutfitRule: BASE_SAME_OUTFIT,
      sameEnvironmentFamilyRule: BASE_SAME_ENV,
      viewOrientation: 'Seated editorial pose — same person in same styling system, continuity-safe',
      inferenceRules: 'Editorial energy allowed; identity and wardrobe locks remain strict',
      negativeConstraints: [...ANCHOR_DEPENDENT_NEGATIVE_CONSTRAINTS],
    },
    WARDROBE_DOCUMENTATION_SHEET: {
      contractId: slot,
      assetSlot: slot,
      sameWomanRule: BASE_SAME_WOMAN,
      sameOutfitRule: 'Document actual uploaded outfit — garment breakdown, not a new fashion concept',
      sameEnvironmentFamilyRule: 'Neutral documentation backdrop or reference environment family',
      viewOrientation: 'Wardrobe documentation sheet — silhouette, palette, material notes from WardrobeLock',
      inferenceRules: 'Documentation-first; editorial crops allowed but must remain outfit-faithful',
      negativeConstraints: [...ANCHOR_DEPENDENT_NEGATIVE_CONSTRAINTS, 'do not create a new fashion concept when documenting wardrobe'],
    },
    WARDROBE_ITEM_DETAIL_SET: {
      contractId: slot,
      assetSlot: slot,
      sameWomanRule: BASE_SAME_WOMAN,
      sameOutfitRule: 'Detail studies derived from WardrobeLock — no restyle',
      sameEnvironmentFamilyRule: 'Neutral or reference-matched backdrop for detail crops',
      viewOrientation: 'Close views of garments, jewelry, shoes, fabric, and color swatches',
      inferenceRules: 'Extract details from locked wardrobe authority only',
      negativeConstraints: [...ANCHOR_DEPENDENT_NEGATIVE_CONSTRAINTS, 'do not create a new fashion concept when documenting wardrobe'],
    },
    ENVIRONMENT_REFERENCE_SET: {
      contractId: slot,
      assetSlot: slot,
      sameWomanRule: BASE_SAME_WOMAN,
      sameOutfitRule: BASE_SAME_OUTFIT,
      sameEnvironmentFamilyRule: 'Derive scene family from EnvironmentLock — not random alternate interiors',
      viewOrientation: 'Environment/set reference guidance for character Bible',
      inferenceRules: 'Props and furnishing grammar from environment lock',
      negativeConstraints: [...ANCHOR_DEPENDENT_NEGATIVE_CONSTRAINTS, 'do not substitute a different environment aesthetic'],
    },
    CHARACTER_BIBLE_CONTACT_SHEET: {
      contractId: slot,
      assetSlot: slot,
      sameWomanRule: BASE_SAME_WOMAN,
      sameOutfitRule: BASE_SAME_OUTFIT,
      sameEnvironmentFamilyRule: BASE_SAME_ENV,
      viewOrientation: 'Contact sheet / reference pack summary — continuity-safe composite overview',
      inferenceRules: 'Summarize approved anchor + key views; include visible vs inferred notes',
      negativeConstraints: [...ANCHOR_DEPENDENT_NEGATIVE_CONSTRAINTS],
    },
  };
  return contracts[slot];
}
