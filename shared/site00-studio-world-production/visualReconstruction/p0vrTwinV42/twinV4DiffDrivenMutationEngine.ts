import type { TwinV4RegionDiffReceipt } from './twinV42Types.js';
import {
  hashTwinV42Implementation,
  type TwinV42ReconstructionContract,
  type TwinV42RegionId,
  writeTwinV42ReconstructionContract,
} from './twinV42ReconstructionContract.js';
import { TWIN_V42_REGION_MUTATION_PRIORITY } from './constants.js';

export type TwinV4MutationType =
  | 'POSITION'
  | 'WIDTH'
  | 'HEIGHT'
  | 'GAP'
  | 'PADDING'
  | 'MARGIN'
  | 'FONT_SIZE'
  | 'LINE_HEIGHT'
  | 'LETTER_SPACING'
  | 'COLOR'
  | 'BORDER'
  | 'BACKGROUND'
  | 'GRID_COLUMNS'
  | 'GRID_ROWS'
  | 'ABSOLUTE_OFFSET'
  | 'OBJECT_SCALE'
  | 'TEXT_WRAP'
  | 'VISIBILITY'
  | 'SECTION_ORDER';

export type TwinV4MutationPlan = {
  iteration: number;
  currentDiffPercent: number;
  highestDriftRegions: TwinV42RegionId[];
  targetElements: string[];
  targetSelectors: string[];
  mutationType: TwinV4MutationType;
  beforeValues: Record<string, number | string>;
  proposedValues: Record<string, number | string>;
  rationale: string;
  expectedVisualEffect: string;
  filesChanged: string[];
  selectorsChanged: string[];
  componentsChanged: string[];
  implementationHashBefore: string;
  implementationHashAfter: string;
};

function pickHighestDriftRegion(regionDiffs: TwinV4RegionDiffReceipt[]): TwinV42RegionId {
  const byPriority = [...TWIN_V42_REGION_MUTATION_PRIORITY];
  let worst: TwinV42RegionId = byPriority[0]!;
  let worstPct = -1;
  for (const id of byPriority) {
    const row = regionDiffs.find((r) => r.regionId === id);
    if (row && row.diffPercent > worstPct) {
      worstPct = row.diffPercent;
      worst = id;
    }
  }
  return worst;
}

function mutateTokensForRegion(
  contract: TwinV42ReconstructionContract,
  regionId: TwinV42RegionId,
): TwinV4MutationPlan {
  const beforeHash = hashTwinV42Implementation(contract);
  const tokens = { ...contract.tokens };
  const regionSteps = { ...contract.regionSteps, [regionId]: contract.regionSteps[regionId] + 1 };
  const beforeValues: Record<string, number | string> = {};
  const proposedValues: Record<string, number | string> = {};
  let mutationType: TwinV4MutationType = 'FONT_SIZE';
  let targetSelectors = ['.site00-twin-v42-forensic'];
  let rationale = 'Reduce drift toward golden reference.';

  switch (regionId) {
    case 'RIGHT_SPEC_TABLE':
      beforeValues.specTableFontPx = tokens.specTableFontPx;
      beforeValues.specTableRowPx = tokens.specTableRowPx;
      tokens.specTableFontPx = Math.min(12, tokens.specTableFontPx + 0.5);
      tokens.specTableRowPx = Math.max(10, tokens.specTableRowPx - 0.75);
      tokens.specTableColGapPx = Math.max(4, tokens.specTableColGapPx - 0.5);
      proposedValues.specTableFontPx = tokens.specTableFontPx;
      proposedValues.specTableRowPx = tokens.specTableRowPx;
      mutationType = 'LINE_HEIGHT';
      targetSelectors = ['[data-region="RIGHT_SPEC_TABLE"]', '.site00-twin-v42-spec-table'];
      rationale = 'Tighten spec table row density and typography toward forensic reference.';
      break;
    case 'TITLE_HEADER':
      beforeValues.headerTitlePx = tokens.headerTitlePx;
      tokens.headerTitlePx = Math.min(18, tokens.headerTitlePx + 0.75);
      tokens.headerRulePx = Math.min(3, tokens.headerRulePx + 0.25);
      proposedValues.headerTitlePx = tokens.headerTitlePx;
      mutationType = 'FONT_SIZE';
      targetSelectors = ['[data-region="TITLE_HEADER"]'];
      break;
    case 'LEFT_MAIN_BLUEPRINT':
      beforeValues.leftPanelInsetPx = tokens.leftPanelInsetPx;
      beforeValues.blueprintBandPx = tokens.blueprintBandPx;
      tokens.leftPanelInsetPx = Math.max(6, tokens.leftPanelInsetPx - 1);
      tokens.blueprintBandPx = Math.max(56, tokens.blueprintBandPx - 2);
      proposedValues.leftPanelInsetPx = tokens.leftPanelInsetPx;
      mutationType = 'PADDING';
      targetSelectors = ['[data-region="LEFT_MAIN_BLUEPRINT"]'];
      break;
    case 'LOWER_COLOR_PALETTE':
      beforeValues.paletteSwatchPx = tokens.paletteSwatchPx;
      tokens.paletteSwatchPx = Math.min(24, tokens.paletteSwatchPx + 1);
      tokens.paletteGapPx = Math.max(4, tokens.paletteGapPx - 0.5);
      proposedValues.paletteSwatchPx = tokens.paletteSwatchPx;
      mutationType = 'OBJECT_SCALE';
      targetSelectors = ['[data-region="LOWER_COLOR_PALETTE"]'];
      break;
    case 'LOWER_NOTES_CONTEXT':
      beforeValues.notesLinePx = tokens.notesLinePx;
      tokens.notesLinePx = Math.min(13, tokens.notesLinePx + 0.5);
      proposedValues.notesLinePx = tokens.notesLinePx;
      mutationType = 'LINE_HEIGHT';
      targetSelectors = ['[data-region="LOWER_NOTES_CONTEXT"]'];
      break;
    case 'LOWER_TYPOGRAPHY_KEY':
    case 'LOWER_DIVIDER_SPECS':
      beforeValues.dividerWeightPx = tokens.dividerWeightPx;
      tokens.dividerWeightPx = Math.min(2, tokens.dividerWeightPx + 0.25);
      proposedValues.dividerWeightPx = tokens.dividerWeightPx;
      mutationType = 'BORDER';
      targetSelectors = [`[data-region="${regionId}"]`];
      break;
    default:
      break;
  }

  const nextContract: TwinV42ReconstructionContract = {
    ...contract,
    correctionGeneration: contract.correctionGeneration + 1,
    regionSteps,
    tokens,
  };
  writeTwinV42ReconstructionContract(nextContract);
  const afterHash = hashTwinV42Implementation(nextContract);

  return {
    iteration: nextContract.correctionGeneration,
    currentDiffPercent: 0,
    highestDriftRegions: [regionId],
    targetElements: [regionId],
    targetSelectors,
    mutationType,
    beforeValues,
    proposedValues,
    rationale,
    expectedVisualEffect: 'Live DOM/CSS values update on next render.',
    filesChanged: nextContract.filesChanged,
    selectorsChanged: targetSelectors,
    componentsChanged: nextContract.componentsChanged,
    implementationHashBefore: beforeHash,
    implementationHashAfter: afterHash,
  };
}

export function buildTwinV4DiffDrivenMutationPlan(input: {
  regionDiffs: TwinV4RegionDiffReceipt[];
  currentDiffPercent: number;
  contract: TwinV42ReconstructionContract;
}): TwinV4MutationPlan {
  const regionId = pickHighestDriftRegion(input.regionDiffs);
  const plan = mutateTokensForRegion(input.contract, regionId);
  return { ...plan, currentDiffPercent: input.currentDiffPercent };
}
