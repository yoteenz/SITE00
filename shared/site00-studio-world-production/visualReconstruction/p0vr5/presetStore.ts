/**
 * P0.VR.5 — Built-in and learned instruction presets.
 */

import { BUILT_IN_PRESET_IDS } from './constants.js';
import type { DesignInstructionPreset } from './types.js';

const now = () => new Date().toISOString();

function builtIn(partial: Omit<DesignInstructionPreset, 'usageCount' | 'lastUsedAt' | 'learnedFromJobs'>): DesignInstructionPreset {
  return {
    ...partial,
    usageCount: 0,
    lastUsedAt: null,
    learnedFromJobs: [],
  };
}

export const BUILT_IN_INSTRUCTION_PRESETS: DesignInstructionPreset[] = [
  builtIn({
    presetId: BUILT_IN_PRESET_IDS.CUSTOM,
    name: 'CUSTOM INSTRUCTION',
    instructionTemplate: '',
    intentType: 'CUSTOM',
    assetTypes: ['OTHER_SOLO_ASSET'],
    multiAsset: false,
    orderingRule: 'MANUAL',
    backgroundPolicy: 'AUTO_IF_NEEDED',
    cropConfirmationRequired: true,
    replacementBehavior: 'NONE',
    generationPolicy: 'GPT_IMAGE_2_EDIT_PRIMARY',
    targetScope: null,
    founderCreated: false,
    founderEdited: false,
    confidence: 1,
  }),
  builtIn({
    presetId: BUILT_IN_PRESET_IDS.SINGLE_ICON,
    name: 'ISOLATE SINGLE ICON',
    instructionTemplate: 'GENERATE THIS ICON BY ITSELF WITH NO BACKGROUND',
    intentType: 'SINGLE_ASSET',
    assetTypes: ['ICON'],
    multiAsset: false,
    orderingRule: 'MANUAL',
    backgroundPolicy: 'REMOVE_BACKGROUND',
    cropConfirmationRequired: true,
    replacementBehavior: 'REPLACE_CURRENT_SELECTION',
    generationPolicy: 'GPT_IMAGE_2_EDIT_PRIMARY',
    targetScope: null,
    founderCreated: false,
    founderEdited: false,
    confidence: 0.95,
  }),
  builtIn({
    presetId: BUILT_IN_PRESET_IDS.ICON_SET,
    name: 'ISOLATE ICON SET',
    instructionTemplate: 'ISOLATE EACH OF THESE ICONS ONE BY ONE',
    intentType: 'ICON_SET',
    assetTypes: ['ICON_SET_MEMBER'],
    multiAsset: true,
    orderingRule: 'LEFT_TO_RIGHT',
    backgroundPolicy: 'REMOVE_BACKGROUND',
    cropConfirmationRequired: true,
    replacementBehavior: 'REPLACE_BY_ORDER',
    generationPolicy: 'GPT_IMAGE_2_EDIT_PRIMARY',
    targetScope: 'NAV_ICON_SET',
    founderCreated: false,
    founderEdited: false,
    confidence: 0.95,
  }),
  builtIn({
    presetId: BUILT_IN_PRESET_IDS.REPLACE_NAV,
    name: 'REPLACE NAV ICON SET',
    instructionTemplate:
      'ISOLATE EACH OF THESE ICONS ONE BY ONE AND REPLACE THE CURRENT ICONS WITH THEM',
    intentType: 'REPLACEMENT_BATCH',
    assetTypes: ['ICON_SET_MEMBER'],
    multiAsset: true,
    orderingRule: 'LEFT_TO_RIGHT',
    backgroundPolicy: 'REMOVE_BACKGROUND',
    cropConfirmationRequired: true,
    replacementBehavior: 'REPLACE_BY_ORDER',
    generationPolicy: 'GPT_IMAGE_2_EDIT_PRIMARY',
    targetScope: 'NAV_ICON_SET',
    founderCreated: false,
    founderEdited: false,
    confidence: 0.95,
  }),
  builtIn({
    presetId: BUILT_IN_PRESET_IDS.HERO_OBJECT,
    name: 'EXTRACT HERO OBJECT',
    instructionTemplate: 'ISOLATE THE HERO OBJECT AND REPLACE THE CURRENT HEADER VISUAL',
    intentType: 'HERO_EXTRACT',
    assetTypes: ['HERO_OBJECT'],
    multiAsset: false,
    orderingRule: 'MANUAL',
    backgroundPolicy: 'AUTO_IF_NEEDED',
    cropConfirmationRequired: true,
    replacementBehavior: 'REPLACE_CURRENT_SELECTION',
    generationPolicy: 'GPT_IMAGE_2_EDIT_PRIMARY',
    targetScope: 'PAGE_HEADER',
    founderCreated: false,
    founderEdited: false,
    confidence: 0.9,
  }),
  builtIn({
    presetId: BUILT_IN_PRESET_IDS.BACKGROUND,
    name: 'EXTRACT BACKGROUND IMAGE',
    instructionTemplate: 'EXTRACT THE BACKGROUND IMAGE ONLY',
    intentType: 'BACKGROUND_EXTRACT',
    assetTypes: ['BACKGROUND_IMAGE'],
    multiAsset: false,
    orderingRule: 'MANUAL',
    backgroundPolicy: 'KEEP_BACKGROUND',
    cropConfirmationRequired: true,
    replacementBehavior: 'NONE',
    generationPolicy: 'GPT_IMAGE_2_EDIT_PRIMARY',
    targetScope: null,
    founderCreated: false,
    founderEdited: false,
    confidence: 0.95,
  }),
  builtIn({
    presetId: BUILT_IN_PRESET_IDS.PROJECT_CARDS,
    name: 'ISOLATE PROJECT CARD VISUALS',
    instructionTemplate: 'ISOLATE EACH PROJECT CARD IMAGE AS ITS OWN ASSET',
    intentType: 'MULTI_ASSET',
    assetTypes: ['PROJECT_CARD_VISUAL'],
    multiAsset: true,
    orderingRule: 'GRID_ORDER',
    backgroundPolicy: 'AUTO_IF_NEEDED',
    cropConfirmationRequired: true,
    replacementBehavior: 'REPLACE_BY_ORDER',
    generationPolicy: 'GPT_IMAGE_2_EDIT_PRIMARY',
    targetScope: 'PROJECT_CARD_VISUALS',
    founderCreated: false,
    founderEdited: false,
    confidence: 0.9,
  }),
  builtIn({
    presetId: BUILT_IN_PRESET_IDS.SOLO_TRANSPARENT,
    name: 'RECREATE SOLO ASSET WITH TRANSPARENT BACKGROUND',
    instructionTemplate: 'RECREATE THIS DECORATIVE OBJECT WITH NO BACKGROUND',
    intentType: 'SINGLE_ASSET',
    assetTypes: ['DECORATIVE_OBJECT'],
    multiAsset: false,
    orderingRule: 'MANUAL',
    backgroundPolicy: 'REMOVE_BACKGROUND',
    cropConfirmationRequired: true,
    replacementBehavior: 'MANUAL_BIND',
    generationPolicy: 'GPT_IMAGE_2_EDIT_PRIMARY',
    targetScope: null,
    founderCreated: false,
    founderEdited: false,
    confidence: 0.85,
  }),
  builtIn({
    presetId: BUILT_IN_PRESET_IDS.REPLICATE_PAGE_EXACTLY,
    name: 'REPLICATE PAGE EXACTLY',
    instructionTemplate: '',
    intentType: 'CUSTOM',
    assetTypes: ['OTHER_SOLO_ASSET'],
    multiAsset: false,
    orderingRule: 'MANUAL',
    backgroundPolicy: 'AUTO_IF_NEEDED',
    cropConfirmationRequired: true,
    replacementBehavior: 'NONE',
    generationPolicy: 'GPT_IMAGE_2_EDIT_PRIMARY',
    targetScope: null,
    founderCreated: false,
    founderEdited: false,
    confidence: 1,
  }),
  builtIn({
    presetId: BUILT_IN_PRESET_IDS.REPLICATE_MOBILE_EXACTLY,
    name: 'REPLICATE MOBILE SCREEN EXACTLY',
    instructionTemplate: '',
    intentType: 'CUSTOM',
    assetTypes: ['OTHER_SOLO_ASSET'],
    multiAsset: false,
    orderingRule: 'MANUAL',
    backgroundPolicy: 'AUTO_IF_NEEDED',
    cropConfirmationRequired: true,
    replacementBehavior: 'NONE',
    generationPolicy: 'GPT_IMAGE_2_EDIT_PRIMARY',
    targetScope: 'MOBILE_VIEWPORT',
    founderCreated: false,
    founderEdited: false,
    confidence: 1,
  }),
  builtIn({
    presetId: BUILT_IN_PRESET_IDS.REPLICATE_DESKTOP_EXACTLY,
    name: 'REPLICATE DESKTOP SCREEN EXACTLY',
    instructionTemplate: '',
    intentType: 'CUSTOM',
    assetTypes: ['OTHER_SOLO_ASSET'],
    multiAsset: false,
    orderingRule: 'MANUAL',
    backgroundPolicy: 'AUTO_IF_NEEDED',
    cropConfirmationRequired: true,
    replacementBehavior: 'NONE',
    generationPolicy: 'GPT_IMAGE_2_EDIT_PRIMARY',
    targetScope: 'DESKTOP_VIEWPORT',
    founderCreated: false,
    founderEdited: false,
    confidence: 1,
  }),
  builtIn({
    presetId: BUILT_IN_PRESET_IDS.EXTRACT_REPLACE_ASSETS_EXACTLY,
    name: 'EXTRACT + REPLACE ASSETS EXACTLY',
    instructionTemplate: 'ISOLATE EACH ASSET AND REPLACE WITH EXACT FIDELITY',
    intentType: 'MULTI_ASSET',
    assetTypes: ['ICON', 'HERO_OBJECT', 'DECORATIVE_OBJECT'],
    multiAsset: true,
    orderingRule: 'LEFT_TO_RIGHT',
    backgroundPolicy: 'REMOVE_BACKGROUND',
    cropConfirmationRequired: true,
    replacementBehavior: 'REPLACE_BY_ORDER',
    generationPolicy: 'GPT_IMAGE_2_EDIT_PRIMARY',
    targetScope: null,
    founderCreated: false,
    founderEdited: false,
    confidence: 1,
  }),
  builtIn({
    presetId: BUILT_IN_PRESET_IDS.RECONSTRUCT_REPLACE,
    name: 'RECONSTRUCT AND REPLACE CURRENT PAGE ASSET',
    instructionTemplate: 'RECONSTRUCT AND REPLACE THE CURRENT PAGE ASSET',
    intentType: 'SINGLE_ASSET',
    assetTypes: ['OTHER_SOLO_ASSET'],
    multiAsset: false,
    orderingRule: 'MANUAL',
    backgroundPolicy: 'AUTO_IF_NEEDED',
    cropConfirmationRequired: true,
    replacementBehavior: 'REPLACE_CURRENT_SELECTION',
    generationPolicy: 'GPT_IMAGE_2_EDIT_PRIMARY',
    targetScope: 'CURRENT_PAGE',
    founderCreated: false,
    founderEdited: false,
    confidence: 0.85,
  }),
  builtIn({
    presetId: BUILT_IN_PRESET_IDS.RECONSTRUCT_REFERENCE_ASSET,
    name: 'RECONSTRUCT REFERENCE ASSET',
    instructionTemplate: 'SOURCE CROP → CLEAN ASSET → OPTIONAL BACKGROUND REMOVAL → BIND',
    intentType: 'MULTI_ASSET',
    assetTypes: ['PROJECT_CARD_VISUAL', 'HERO_OBJECT', 'OTHER_SOLO_ASSET'],
    multiAsset: true,
    orderingRule: 'LEFT_TO_RIGHT',
    backgroundPolicy: 'AUTO_IF_NEEDED',
    cropConfirmationRequired: true,
    replacementBehavior: 'REPLACE_BY_SLOT_NAME',
    generationPolicy: 'GPT_IMAGE_2_EDIT_PRIMARY',
    targetScope: 'SKINS_REFERENCE',
    founderCreated: false,
    founderEdited: false,
    confidence: 1,
  }),
];

let learnedPresets: DesignInstructionPreset[] = [];

export function listAllPresets(): DesignInstructionPreset[] {
  return [...BUILT_IN_INSTRUCTION_PRESETS, ...learnedPresets];
}

export function getPresetById(presetId: string): DesignInstructionPreset | null {
  return listAllPresets().find((p) => p.presetId === presetId) ?? null;
}

export function applyInstructionPreset(presetId: string): DesignInstructionPreset | null {
  const preset = getPresetById(presetId);
  if (!preset) return null;
  preset.usageCount += 1;
  preset.lastUsedAt = now();
  return preset;
}

export function saveDesignInstructionPreset(input: {
  name: string;
  instructionTemplate: string;
  intentType: DesignInstructionPreset['intentType'];
  assetTypes: DesignInstructionPreset['assetTypes'];
  multiAsset: boolean;
  orderingRule: DesignInstructionPreset['orderingRule'];
  backgroundPolicy: DesignInstructionPreset['backgroundPolicy'];
  replacementBehavior: DesignInstructionPreset['replacementBehavior'];
  targetScope: string | null;
  fromJobId?: string;
}): DesignInstructionPreset {
  const preset: DesignInstructionPreset = {
    presetId: `preset-learned-${Date.now()}`,
    name: input.name.toUpperCase(),
    instructionTemplate: input.instructionTemplate,
    intentType: input.intentType,
    assetTypes: input.assetTypes,
    multiAsset: input.multiAsset,
    orderingRule: input.orderingRule,
    backgroundPolicy: input.backgroundPolicy,
    cropConfirmationRequired: true,
    replacementBehavior: input.replacementBehavior,
    generationPolicy: 'GPT_IMAGE_2_EDIT_PRIMARY',
    targetScope: input.targetScope,
    usageCount: 0,
    lastUsedAt: null,
    founderCreated: true,
    founderEdited: false,
    learnedFromJobs: input.fromJobId ? [input.fromJobId] : [],
    confidence: 0.7,
  };
  learnedPresets.push(preset);
  return preset;
}

export function suggestInstructionPresets(input: {
  founderInstruction: string;
  intentType: DesignInstructionPreset['intentType'];
  multiAsset: boolean;
}): DesignInstructionPreset[] {
  const text = input.founderInstruction.toUpperCase();
  const scored = listAllPresets()
    .filter((p) => p.presetId !== BUILT_IN_PRESET_IDS.CUSTOM)
    .map((p) => {
      let score = p.confidence * 0.3;
      if (p.intentType === input.intentType) score += 0.35;
      if (p.multiAsset === input.multiAsset) score += 0.15;
      if (p.instructionTemplate && text.includes(p.instructionTemplate.slice(0, 20))) score += 0.2;
      score += Math.min(0.2, p.usageCount * 0.02);
      return { preset: p, score };
    })
    .filter((s) => s.score >= 0.4)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((s) => s.preset);
}

export function recordPresetUsageFromJob(jobId: string, presetId: string): void {
  const preset = getPresetById(presetId);
  if (!preset) return;
  if (!preset.learnedFromJobs.includes(jobId)) preset.learnedFromJobs.push(jobId);
  preset.usageCount += 1;
  preset.lastUsedAt = now();
}

export function clearLearnedPresetsForTest(): void {
  learnedPresets = [];
}
