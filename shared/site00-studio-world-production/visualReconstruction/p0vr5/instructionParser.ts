/**
 * P0.VR.5 — Parse founder natural-language instructions into structured job intent.
 */

import type {
  AssetJobType,
  BackgroundPolicy,
  CandidateClassification,
  DetectionOrderingRule,
  ParsedFounderInstruction,
  ReplacementSlotMatchingMode,
} from './types.js';

function normalize(text: string): string {
  return text.trim().toUpperCase();
}

function includesAny(text: string, phrases: string[]): boolean {
  return phrases.some((p) => text.includes(p));
}

export function parseFounderInstruction(rawInstruction: string): ParsedFounderInstruction {
  const text = normalize(rawInstruction);
  const keywords: string[] = [];

  const transparentOutput =
    includesAny(text, ['NO BACKGROUND', 'TRANSPARENT', 'BY ITSELF', 'WITHOUT BACKGROUND']) ||
    text.includes('WITH NO BACKGROUND');

  let backgroundPolicy: BackgroundPolicy = 'AUTO_IF_NEEDED';
  if (transparentOutput) backgroundPolicy = 'REMOVE_BACKGROUND';
  if (includesAny(text, ['KEEP BACKGROUND', 'WITH BACKGROUND'])) backgroundPolicy = 'KEEP_BACKGROUND';
  if (includesAny(text, ['BACKGROUND IMAGE ONLY', 'EXTRACT THE BACKGROUND', 'EXTRACT BACKGROUND'])) {
    backgroundPolicy = 'KEEP_BACKGROUND';
  }

  let multiAsset = includesAny(text, [
    'EACH OF THESE',
    'ONE BY ONE',
    'ALL ICONS',
    'ALL CARD',
    'MULTIPLE',
    'EACH ICON',
    'ICON SET',
    'INDIVIDUALLY',
  ]);

  let orderingRule: DetectionOrderingRule = 'LEFT_TO_RIGHT';
  if (includesAny(text, ['TOP TO BOTTOM', 'VERTICAL'])) orderingRule = 'TOP_TO_BOTTOM';
  if (includesAny(text, ['GRID'])) orderingRule = 'GRID_ORDER';
  if (includesAny(text, ['MANUAL ORDER', 'REORDER'])) orderingRule = 'MANUAL';

  let replacementBehavior: ReplacementSlotMatchingMode = 'NONE';
  let replacementTargetScope: string | null = null;
  if (includesAny(text, ['REPLACE THE CURRENT', 'REPLACE CURRENT', 'REPLACE LIVE', 'BIND IT TO'])) {
    replacementBehavior = multiAsset ? 'REPLACE_BY_ORDER' : 'REPLACE_CURRENT_SELECTION';
    if (includesAny(text, ['NAV ICON', 'BOTTOM NAV', 'NAVIGATION'])) {
      replacementTargetScope = 'NAV_ICON_SET';
      keywords.push('NAV_REPLACEMENT');
    } else if (includesAny(text, ['HEADER', 'HERO'])) {
      replacementTargetScope = 'PAGE_HEADER';
      keywords.push('HEADER_REPLACEMENT');
    } else if (includesAny(text, ['PROJECT CARD'])) {
      replacementTargetScope = 'PROJECT_CARD_VISUALS';
      keywords.push('PROJECT_CARD_REPLACEMENT');
    }
  }
  if (includesAny(text, ['SLOT NAME', 'BY SLOT'])) replacementBehavior = 'REPLACE_BY_SLOT_NAME';
  if (includesAny(text, ['MANUAL BIND'])) replacementBehavior = 'MANUAL_BIND';

  let intentType: AssetJobType = 'CUSTOM';
  const assetTypes: CandidateClassification[] = [];

  if (includesAny(text, ['BACKGROUND IMAGE ONLY', 'EXTRACT THE BACKGROUND', 'EXTRACT BACKGROUND'])) {
    intentType = 'BACKGROUND_EXTRACT';
    assetTypes.push('BACKGROUND_IMAGE');
    multiAsset = false;
    keywords.push('BACKGROUND');
  } else if (includesAny(text, ['HERO OBJECT', 'HERO VISUAL', 'HEADER VISUAL', 'DECORATIVE OBJECT'])) {
    intentType = 'HERO_EXTRACT';
    assetTypes.push(includesAny(text, ['DECORATIVE']) ? 'DECORATIVE_OBJECT' : 'HERO_OBJECT');
    multiAsset = false;
    keywords.push('HERO');
  } else if (includesAny(text, ['PROJECT CARD', 'CARD VISUAL', 'CARD IMAGE'])) {
    intentType = 'MULTI_ASSET';
    assetTypes.push('PROJECT_CARD_VISUAL');
    multiAsset = true;
    keywords.push('PROJECT_CARDS');
  } else if (includesAny(text, ['ICON SET', 'EACH OF THESE ICONS', 'NAV ICON', 'BOTTOM NAV'])) {
    intentType = 'ICON_SET';
    assetTypes.push('ICON_SET_MEMBER');
    multiAsset = true;
    keywords.push('ICON_SET');
  } else if (includesAny(text, ['SINGLE ICON', 'THIS ICON', 'GENERATE THIS ICON', 'ISOLATE THIS ICON'])) {
    intentType = 'SINGLE_ASSET';
    assetTypes.push('ICON');
    multiAsset = false;
    keywords.push('SINGLE_ICON');
  } else if (multiAsset && includesAny(text, ['REPLACE'])) {
    intentType = 'REPLACEMENT_BATCH';
    assetTypes.push('ICON_SET_MEMBER');
    keywords.push('REPLACEMENT_BATCH');
  } else if (multiAsset) {
    intentType = 'MULTI_ASSET';
    assetTypes.push('OTHER_SOLO_ASSET');
  } else {
    intentType = 'SINGLE_ASSET';
    assetTypes.push('OTHER_SOLO_ASSET');
  }

  if (replacementBehavior !== 'NONE' && intentType !== 'REPLACEMENT_BATCH') {
    intentType = multiAsset ? 'REPLACEMENT_BATCH' : intentType;
  }

  return {
    rawInstruction,
    intentType,
    assetTypes,
    multiAsset,
    orderingRule,
    backgroundPolicy,
    replacementBehavior,
    replacementTargetScope,
    transparentOutput,
    keywords,
  };
}

export function instructionMatchesPreset(
  instruction: ParsedFounderInstruction,
  presetIntent: AssetJobType,
  presetMulti: boolean,
): number {
  let score = 0;
  if (instruction.intentType === presetIntent) score += 0.5;
  if (instruction.multiAsset === presetMulti) score += 0.2;
  if (instruction.backgroundPolicy === 'REMOVE_BACKGROUND' && presetIntent === 'SINGLE_ASSET') score += 0.1;
  return Math.min(1, score);
}
