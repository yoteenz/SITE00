/**
 * P0.VR.5 — Job plan summarization.
 */

import { GENERATION_PROVIDER_PLAN } from './constants.js';
import { parseFounderInstruction } from './instructionParser.js';
import { applyInstructionPreset, getPresetById } from './presetStore.js';
import type {
  AssetJob,
  AssetJobPlanSummary,
  AssetJobType,
  BackgroundPolicy,
  CandidateClassification,
  DetectionOrderingRule,
  JobCostRiskLevel,
  JobWorkflowStep,
  ReplacementSlotMatchingMode,
} from './types.js';

export function summarizeAssetJobPlan(job: AssetJob): AssetJobPlanSummary {
  const confirmedCount = job.detectedRegions.filter((r) => r.founderDecision === 'CONFIRMED').length;
  const pendingCount = job.detectedRegions.filter((r) => r.founderDecision === 'PENDING').length;
  const expectedOutputs =
    job.status === 'DRAFT' || job.status === 'PLANNED'
      ? job.detectionCount || (job.multiAsset ? 2 : 1)
      : confirmedCount || job.detectionCount;

  const targetAssetType: CandidateClassification | 'MIXED' =
    job.targetAssetTypes.length === 1 ? job.targetAssetTypes[0] : job.targetAssetTypes.length > 1 ? 'MIXED' : 'OTHER_SOLO_ASSET';

  return {
    jobType: job.jobType,
    targetAssetType,
    singleOrMulti: job.multiAsset ? 'MULTI' : 'SINGLE',
    detectedCount: job.detectionCount,
    expectedOutputs,
    backgroundPolicy: job.backgroundPolicy,
    replacementTarget: job.replacementMapping?.replacementTargetScope ?? null,
    generationProviderPlan: [...job.generationProviderPlan],
    founderConfirmationRequired: job.cropConfirmationRequired && !job.cropsConfirmed,
    costRiskLevel: job.costRiskLevel,
    estimatedDispatchCount: expectedOutputs,
    workflowSteps: buildWorkflowSteps(job),
    ...(pendingCount > 0 && !job.cropsConfirmed ? { unconfirmedRegions: pendingCount } : {}),
  } as AssetJobPlanSummary & { unconfirmedRegions?: number };
}

function buildWorkflowSteps(job: AssetJob): JobWorkflowStep[] {
  const steps: JobWorkflowStep[] = ['UPLOAD', 'INSTRUCT'];
  if (job.sourceUploadIds.length) steps.push('DETECT');
  if (job.detectionCount > 0) steps.push('CONFIRM_CROP');
  if (job.cropsConfirmed) steps.push('RECONSTRUCT', 'APPROVE');
  if (job.replacementMapping && job.replacementMapping.slotMatchingMode !== 'NONE') steps.push('REPLACE');
  return steps;
}

export function computeCostRiskLevel(dispatchCount: number, multiAsset: boolean): JobCostRiskLevel {
  if (dispatchCount <= 1) return 'LOW';
  if (multiAsset && dispatchCount <= 4) return 'MODERATE';
  return 'HIGH';
}

export function buildJobFromInstruction(input: {
  workspaceId: string;
  projectId: string;
  pageId: string;
  route: string;
  founderInstruction: string;
  selectedPresetId?: string | null;
}): Pick<
  AssetJob,
  | 'jobType'
  | 'targetAssetTypes'
  | 'multiAsset'
  | 'backgroundPolicy'
  | 'orderingRule'
  | 'cropConfirmationRequired'
  | 'generationProviderPlan'
  | 'costRiskLevel'
  | 'replacementMapping'
> {
  let instruction = input.founderInstruction;
  let presetId = input.selectedPresetId ?? null;

  if (presetId && presetId !== 'preset-custom') {
    const preset = applyInstructionPreset(presetId);
    if (preset?.instructionTemplate && !instruction.trim()) {
      instruction = preset.instructionTemplate;
    }
  }

  const parsed = parseFounderInstruction(instruction);
  const preset = presetId ? getPresetById(presetId) : null;

  const jobType: AssetJobType = preset?.intentType ?? parsed.intentType;
  const multiAsset = preset?.multiAsset ?? parsed.multiAsset;
  const backgroundPolicy: BackgroundPolicy = preset?.backgroundPolicy ?? parsed.backgroundPolicy;
  const orderingRule: DetectionOrderingRule = preset?.orderingRule ?? parsed.orderingRule;
  const replacementBehavior: ReplacementSlotMatchingMode =
    preset?.replacementBehavior ?? parsed.replacementBehavior;

  const dispatchEstimate = multiAsset ? Math.max(2, parsed.keywords.includes('ICON_SET') ? 4 : 3) : 1;

  return {
    jobType,
    targetAssetTypes: preset?.assetTypes ?? parsed.assetTypes,
    multiAsset,
    backgroundPolicy,
    orderingRule,
    cropConfirmationRequired: true,
    generationProviderPlan: [...GENERATION_PROVIDER_PLAN],
    costRiskLevel: computeCostRiskLevel(dispatchEstimate, multiAsset),
    replacementMapping:
      replacementBehavior === 'NONE'
        ? null
        : {
            replacementTargetScope: parsed.replacementTargetScope ?? preset?.targetScope ?? null,
            replacementSlots: buildDefaultReplacementSlots(replacementBehavior, dispatchEstimate),
            slotMatchingMode: replacementBehavior,
            sourceOrderToTargetOrder: {},
          },
  };
}

function buildDefaultReplacementSlots(mode: ReplacementSlotMatchingMode, count: number) {
  if (mode === 'NONE') return [];
  return Array.from({ length: count }, (_, i) => ({
    slotId: `slot-${i + 1}`,
    slotName: `TARGET SLOT ${i + 1}`,
    route: null,
    componentPath: null,
    assetSlot: `slot-${i + 1}`,
    orderIndex: i,
    currentAssetUrl: null,
  }));
}
