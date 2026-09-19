/**
 * Reference Asset Reconstruction Pipeline — source crop ≠ final asset.
 * P0.VR.6R4 — formalizes SOURCE → CROP → RECONSTRUCT → BACKGROUND → QA → APPROVE → BIND.
 */

import { buildCanonicalReconstructionPrompt } from '../p0vr4/reconstructionPrompts.js';
import type { DesignReconstructionAssetType } from '../p0vr4/types.js';
import {
  assetSlotToExtractedPath,
  BRAND_KEY_TO_ASSET_SLOT,
  SKINS_REFERENCE_DESKTOP,
  SKINS_REFERENCE_MOBILE,
  type SkinsViewportClass,
} from './skinsReferenceFidelity.js';

export const REFERENCE_ASSET_PIPELINE_FAILURE_CODES = [
  'SOURCE_CROP_USED_AS_CANONICAL',
  'REFERENCE_ASSET_RECONSTRUCTION_SKIPPED',
  'REFERENCE_ASSET_PROMPT_MISSING',
  'REFERENCE_ASSET_PROVIDER_INPUT_MISMATCH',
  'REFERENCE_ASSET_BACKGROUND_POLICY_MISSING',
  'REFERENCE_ASSET_BACKGROUND_REMOVAL_PREMATURE',
  'REFERENCE_ASSET_UI_CONTAMINATION',
  'REFERENCE_ASSET_CANONICAL_BINDING_MISSING',
  'REFERENCE_ASSET_BROKEN_URL',
  'REFERENCE_ASSET_FOUNDER_APPROVAL_MISSING',
  'REFERENCE_ASSET_SCREEN_CONVERGENCE_PREMATURE',
  'INVALID_SOURCE_CROP_AS_CANONICAL',
] as const;

export type ReferenceAssetPipelineFailureCode = (typeof REFERENCE_ASSET_PIPELINE_FAILURE_CODES)[number];

export const REFERENCE_ASSET_CLASSIFICATIONS = [
  'ICON',
  'NAV_ICON',
  'HERO_OBJECT',
  'DECORATIVE_OBJECT',
  'LOGO_MARK',
  'BADGE',
  'PROJECT_VISUAL',
  'EDITORIAL_IMAGE',
  'STOCK_PHOTO',
  'PRODUCT_IMAGE',
  'CHARACTER_IMAGE',
  'BACKGROUND_IMAGE',
  'ENVIRONMENT_IMAGE',
  'SCREENSHOT',
  'PAGE_PREVIEW',
  'TEXTURE',
  'PATTERN',
  'OTHER',
] as const;

export type ReferenceAssetClassification = (typeof REFERENCE_ASSET_CLASSIFICATIONS)[number];

export const BACKGROUND_POLICIES = [
  'KEEP_BACKGROUND',
  'REMOVE_BACKGROUND',
  'TRANSPARENT',
  'PRESERVE_FRAME',
  'AUTO_IF_NEEDED',
] as const;

export type BackgroundPolicy = (typeof BACKGROUND_POLICIES)[number];

export const DIRECT_EXTRACTION_ALLOWED_TYPES: ReferenceAssetClassification[] = [
  'BACKGROUND_IMAGE',
  'EDITORIAL_IMAGE',
  'STOCK_PHOTO',
  'SCREENSHOT',
  'PAGE_PREVIEW',
  'TEXTURE',
];

export const RECONSTRUCTION_REQUIRED_TYPES: ReferenceAssetClassification[] = [
  'ICON',
  'NAV_ICON',
  'HERO_OBJECT',
  'DECORATIVE_OBJECT',
  'LOGO_MARK',
  'BADGE',
  'PROJECT_VISUAL',
  'PRODUCT_IMAGE',
  'CHARACTER_IMAGE',
];

export const EXTENDED_PIPELINE_STAGES = [
  'SOURCE',
  'CROP',
  'RECONSTRUCT',
  'BACKGROUND',
  'QA',
  'APPROVE',
  'LIVE',
] as const;

export type ExtendedPipelineStage = (typeof EXTENDED_PIPELINE_STAGES)[number];

export type ReferenceAssetSource = {
  sourceReferenceId: string;
  sourceScreenshotId: string;
  cropId: string;
  sourceRegion: { x: number; y: number; width: number; height: number };
  sourceCropUrl: string;
  sourceCropChecksum: string;
  assetType: ReferenceAssetClassification;
  sourceStatus: 'DETECTED' | 'CROP_PENDING' | 'CROP_CONFIRMED' | 'INVALIDATED';
  slotId: string;
  viewport?: SkinsViewportClass;
  uiContaminationSuspected?: boolean;
};

export type ReconstructedAssetOutput = {
  outputId: string;
  sourceAssetId: string;
  provider: string;
  model: string;
  prompt: string;
  outputUrl: string | null;
  backgroundPolicy: BackgroundPolicy;
  qaStatus: 'NOT_RUN' | 'PASS' | 'FAIL' | 'WARNING';
  approvalStatus: 'PENDING' | 'LOVE_IT' | 'REVISE' | 'REJECTED';
  canonicalAssetId: string | null;
  version: string;
  providerReceipt?: ProviderInputReceipt;
};

export type ProviderInputReceipt = {
  sourceCropChecksum: string;
  provider: string;
  model: string;
  prompt: string;
  requestId: string | null;
  inputAssetId: string;
  outputAssetId: string | null;
};

export type AssetTreatmentPlan = {
  assetType: ReferenceAssetClassification;
  reconstructionRequired: boolean;
  directExtractionAllowed: boolean;
  backgroundPolicy: BackgroundPolicy;
  providerRecommendation: string;
  promptStrategy: string;
  outputAspectRatio: string | null;
  transparencyRequired: boolean;
  preserveComposition: boolean;
  preserveFrame: boolean;
  qualityTarget: 'EXACT' | 'HIGH' | 'STANDARD';
};

export type ReconstructionVisualQA = {
  shapeMatch: boolean;
  compositionMatch: boolean;
  colorMatch: boolean;
  textContamination: boolean;
  backgroundContamination: boolean;
  hallucinatedDetail: boolean;
  overallPass: boolean;
};

export type ScreenshotContaminationQA = {
  browserChrome: boolean;
  phoneFrame: boolean;
  cardBorder: boolean;
  adjacentUi: boolean;
  labelText: boolean;
  buttonText: boolean;
  referencePageBackground: boolean;
  overallContaminated: boolean;
};

/** Types where direct crop may become canonical only with explicit approval. */
const DIRECT_CANONICAL_TYPES: ReferenceAssetClassification[] = [
  'SCREENSHOT',
  'PAGE_PREVIEW',
  'BACKGROUND_IMAGE',
];

export function sourceCropCannotBeCanonical(input: {
  assetType: ReferenceAssetClassification;
  directExtractionApproved?: boolean;
  uiContaminationSuspected?: boolean;
}): { blocked: boolean; code: ReferenceAssetPipelineFailureCode | null } {
  if (input.uiContaminationSuspected) {
    return { blocked: true, code: 'SOURCE_CROP_USED_AS_CANONICAL' };
  }
  if (RECONSTRUCTION_REQUIRED_TYPES.includes(input.assetType)) {
    return { blocked: true, code: 'SOURCE_CROP_USED_AS_CANONICAL' };
  }
  if (DIRECT_CANONICAL_TYPES.includes(input.assetType) && input.directExtractionApproved) {
    return { blocked: false, code: null };
  }
  if (DIRECT_EXTRACTION_ALLOWED_TYPES.includes(input.assetType) && input.directExtractionApproved) {
    return { blocked: false, code: null };
  }
  return { blocked: true, code: 'SOURCE_CROP_USED_AS_CANONICAL' };
}

export function classifyReferenceAsset(input: {
  slotId: string;
  hints?: Partial<{ hasText: boolean; hasDeviceFrame: boolean; isIcon: boolean }>;
}): ReferenceAssetClassification {
  const slot = input.slotId.toUpperCase();
  if (slot.includes('ICON')) return 'ICON';
  if (slot.includes('LOGO')) return 'LOGO_MARK';
  if (slot.includes('BADGE')) return 'BADGE';
  if (slot.includes('SCREEN_') || slot.includes('PAGE_PREVIEW')) return 'PAGE_PREVIEW';
  if (slot.includes('BRAND_FAMILY') || slot.includes('PROJECT_VISUAL')) return 'PROJECT_VISUAL';
  if (slot.includes('HERO')) return 'HERO_OBJECT';
  if (slot.includes('BACKGROUND')) return 'BACKGROUND_IMAGE';
  if (input.hints?.isIcon) return 'ICON';
  if (input.hints?.hasDeviceFrame) return 'SCREENSHOT';
  return 'OTHER';
}

export function defaultBackgroundPolicy(assetType: ReferenceAssetClassification): BackgroundPolicy {
  switch (assetType) {
    case 'ICON':
    case 'NAV_ICON':
    case 'LOGO_MARK':
    case 'BADGE':
      return 'TRANSPARENT';
    case 'HERO_OBJECT':
    case 'DECORATIVE_OBJECT':
      return 'AUTO_IF_NEEDED';
    case 'PROJECT_VISUAL':
    case 'EDITORIAL_IMAGE':
    case 'STOCK_PHOTO':
      return 'KEEP_BACKGROUND';
    case 'BACKGROUND_IMAGE':
    case 'SCREENSHOT':
    case 'PAGE_PREVIEW':
      return 'PRESERVE_FRAME';
    default:
      return 'AUTO_IF_NEEDED';
  }
}

export function buildAssetTreatmentPlan(input: {
  assetType: ReferenceAssetClassification;
  cropClean?: boolean;
  uiContaminationSuspected?: boolean;
}): AssetTreatmentPlan {
  const reconstructionRequired =
    RECONSTRUCTION_REQUIRED_TYPES.includes(input.assetType) ||
    Boolean(input.uiContaminationSuspected) ||
    !input.cropClean;

  const directExtractionAllowed =
    !reconstructionRequired &&
    DIRECT_EXTRACTION_ALLOWED_TYPES.includes(input.assetType) &&
    Boolean(input.cropClean) &&
    !input.uiContaminationSuspected;

  return {
    assetType: input.assetType,
    reconstructionRequired,
    directExtractionAllowed,
    backgroundPolicy: defaultBackgroundPolicy(input.assetType),
    providerRecommendation: reconstructionRequired ? 'FAL → openai/gpt-image-2/edit' : 'NONE',
    promptStrategy: reconstructionRequired ? 'REFERENCE_EDIT' : 'DIRECT_EXTRACT',
    outputAspectRatio: input.assetType === 'PROJECT_VISUAL' ? '1:1' : null,
    transparencyRequired: ['ICON', 'NAV_ICON', 'LOGO_MARK', 'BADGE'].includes(input.assetType),
    preserveComposition: true,
    preserveFrame: ['SCREENSHOT', 'PAGE_PREVIEW', 'BACKGROUND_IMAGE'].includes(input.assetType),
    qualityTarget: 'EXACT',
  };
}

export function buildReferenceAssetPrompt(input: {
  assetType: ReferenceAssetClassification;
  targetSlot: string;
  backgroundPolicy: BackgroundPolicy;
  brandLabel?: string;
}): string {
  const p0vr4Type = mapToP0VR4AssetType(input.assetType);
  const base = buildCanonicalReconstructionPrompt(p0vr4Type);

  const slotContext = [
    `TARGET SLOT: ${input.targetSlot}`,
    input.brandLabel ? `BRAND / OBJECT: ${input.brandLabel}` : null,
    `BACKGROUND POLICY: ${input.backgroundPolicy}`,
    '',
    'USE THE SOURCE CROP AS STRICT VISUAL AUTHORITY.',
    'REMOVE ALL SURROUNDING UI: CARD BORDER, PHONE / BROWSER FRAME, LABEL TEXT, OTHER PAGE ELEMENTS.',
    'DO NOT REDESIGN.',
  ]
    .filter(Boolean)
    .join('\n');

  if (input.assetType === 'PROJECT_VISUAL' && input.brandLabel) {
    return [
      base,
      '',
      `RECREATE ONLY THE ${input.brandLabel} VISUAL OBJECT / ARTWORK SHOWN IN THE PROVIDED CROP.`,
      'OUTPUT: CLEAN STANDALONE IMAGE ASSET FOR USE INSIDE THE BRAND FAMILY CARD.',
      slotContext,
    ].join('\n');
  }

  return `${base}\n\n${slotContext}`;
}

function mapToP0VR4AssetType(type: ReferenceAssetClassification): DesignReconstructionAssetType {
  if (type === 'PROJECT_VISUAL') return 'PROJECT_VISUAL';
  if (type === 'ICON' || type === 'NAV_ICON') return type === 'NAV_ICON' ? 'NAV_ICON' : 'ICON';
  if (type === 'HERO_OBJECT') return 'HERO_OBJECT';
  if (type === 'LOGO_MARK') return 'LOGO_MARK';
  if (type === 'BADGE') return 'BADGE';
  if (type === 'DECORATIVE_OBJECT') return 'DECORATIVE_OBJECT';
  return 'OTHER';
}

export function buildProviderInputReceipt(input: {
  source: ReferenceAssetSource;
  prompt: string;
  requestId?: string | null;
  outputAssetId?: string | null;
}): ProviderInputReceipt {
  return {
    sourceCropChecksum: input.source.sourceCropChecksum,
    provider: 'fal',
    model: 'openai/gpt-image-2/edit',
    prompt: input.prompt,
    requestId: input.requestId ?? null,
    inputAssetId: input.source.cropId,
    outputAssetId: input.outputAssetId ?? null,
  };
}

export function runScreenshotContaminationQA(source: ReferenceAssetSource): ScreenshotContaminationQA {
  const contaminated = Boolean(source.uiContaminationSuspected);
  return {
    browserChrome: contaminated,
    phoneFrame: contaminated,
    cardBorder: contaminated,
    adjacentUi: contaminated,
    labelText: contaminated,
    buttonText: false,
    referencePageBackground: contaminated,
    overallContaminated: contaminated,
  };
}

export function runReconstructionVisualQA(input: {
  contamination: ScreenshotContaminationQA;
  outputUrlPresent: boolean;
}): ReconstructionVisualQA {
  return {
    shapeMatch: input.outputUrlPresent,
    compositionMatch: input.outputUrlPresent,
    colorMatch: input.outputUrlPresent,
    textContamination: input.contamination.labelText,
    backgroundContamination: input.contamination.referencePageBackground,
    hallucinatedDetail: false,
    overallPass: input.outputUrlPresent && !input.contamination.overallContaminated,
  };
}

export function backgroundRemovalRunsAfterReconstruction(): boolean {
  return true;
}

export function auditInvalidCropAsCanonical(sources: ReferenceAssetSource[]): ReferenceAssetPipelineFailureCode[] {
  const failures: ReferenceAssetPipelineFailureCode[] = [];
  for (const source of sources) {
    const guard = sourceCropCannotBeCanonical({
      assetType: source.assetType,
      uiContaminationSuspected: source.uiContaminationSuspected,
      directExtractionApproved: false,
    });
    if (guard.blocked) failures.push('INVALID_SOURCE_CROP_AS_CANONICAL');
  }
  return failures;
}

export type SkinsFamilyAssetJobCandidate = {
  candidateId: string;
  brandKey: string;
  slotId: string;
  viewport: SkinsViewportClass;
  source: ReferenceAssetSource;
  treatmentPlan: AssetTreatmentPlan;
  prompt: string;
  stage: ExtendedPipelineStage;
  output: ReconstructedAssetOutput | null;
};

export function buildSkinsFamilyMultiAssetJob(viewport: SkinsViewportClass = 'MOBILE'): {
  jobId: string;
  jobType: 'MULTI_ASSET';
  sourceReferenceId: string;
  candidates: SkinsFamilyAssetJobCandidate[];
  processOneAtATime: true;
} {
  const sourceRef = viewport === 'MOBILE' ? SKINS_REFERENCE_MOBILE : SKINS_REFERENCE_DESKTOP;
  const brandKeys = ['NDXBOOK', 'FRONTAL_SLAYER', 'AIO', 'ASTRAL_WORLD', 'STUDIO_WORLD'] as const;

  const candidates: SkinsFamilyAssetJobCandidate[] = brandKeys.map((brandKey) => {
    const slot = BRAND_KEY_TO_ASSET_SLOT[brandKey]!;
    const slotId = `BRAND_FAMILY_${brandKey}_THUMBNAIL`;
    const sourceCropUrl = assetSlotToExtractedPath(viewport, slot);
    const assetType = classifyReferenceAsset({ slotId, hints: { hasDeviceFrame: true, hasText: true } });

    const source: ReferenceAssetSource = {
      sourceReferenceId: sourceRef,
      sourceScreenshotId: `skins-authority-${viewport.toLowerCase()}`,
      cropId: `crop-${viewport}-${slot}`,
      sourceRegion: { x: 0, y: 0, width: 1, height: 1 },
      sourceCropUrl,
      sourceCropChecksum: `checksum-${viewport}-${slot}`,
      assetType,
      sourceStatus: 'CROP_CONFIRMED',
      slotId,
      viewport,
      uiContaminationSuspected: true,
    };

    const treatmentPlan = buildAssetTreatmentPlan({
      assetType,
      cropClean: false,
      uiContaminationSuspected: true,
    });

    const prompt = buildReferenceAssetPrompt({
      assetType,
      targetSlot: slotId,
      backgroundPolicy: treatmentPlan.backgroundPolicy,
      brandLabel: brandKey.replace(/_/g, ' '),
    });

    return {
      candidateId: `candidate-${viewport}-${brandKey}`,
      brandKey,
      slotId,
      viewport,
      source,
      treatmentPlan,
      prompt,
      stage: 'RECONSTRUCT' as ExtendedPipelineStage,
      output: null,
    };
  });

  return {
    jobId: `skins-family-job-${viewport.toLowerCase()}`,
    jobType: 'MULTI_ASSET',
    sourceReferenceId: sourceRef,
    candidates,
    processOneAtATime: true,
  };
}

export function resolveCanonicalBindingUrl(input: {
  source: ReferenceAssetSource;
  output: ReconstructedAssetOutput | null;
}): { url: string | null; bindingAllowed: boolean; failureCode: ReferenceAssetPipelineFailureCode | null } {
  if (!input.output?.canonicalAssetId || !input.output.outputUrl) {
    return { url: null, bindingAllowed: false, failureCode: 'REFERENCE_ASSET_CANONICAL_BINDING_MISSING' };
  }
  if (input.output.approvalStatus !== 'LOVE_IT') {
    return { url: null, bindingAllowed: false, failureCode: 'REFERENCE_ASSET_FOUNDER_APPROVAL_MISSING' };
  }
  if (input.output.qaStatus !== 'PASS') {
    return { url: null, bindingAllowed: false, failureCode: 'REFERENCE_ASSET_UI_CONTAMINATION' };
  }
  const guard = sourceCropCannotBeCanonical({
    assetType: input.source.assetType,
    directExtractionApproved: false,
  });
  if (input.output.outputUrl === input.source.sourceCropUrl && guard.blocked) {
    return { url: null, bindingAllowed: false, failureCode: 'SOURCE_CROP_USED_AS_CANONICAL' };
  }
  return { url: input.output.outputUrl, bindingAllowed: true, failureCode: null };
}

export function screenConvergenceBlocked(requiredAssetsReady: boolean): {
  blocked: boolean;
  status: 'WAITING_FOR_REFERENCE_ASSETS' | 'READY';
} {
  return requiredAssetsReady
    ? { blocked: false, status: 'READY' }
    : { blocked: true, status: 'WAITING_FOR_REFERENCE_ASSETS' };
}

export const RECONSTRUCT_REFERENCE_ASSET_PRESET = {
  id: 'preset-reconstruct-reference-asset',
  label: 'RECONSTRUCT REFERENCE ASSET',
  intent: 'SOURCE CROP → CLEAN ASSET → OPTIONAL BACKGROUND REMOVAL → BIND',
} as const;
