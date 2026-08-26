/**
 * P0.VR.2A — Reference asset prompt compiler.
 * IMAGE REFERENCE > TEXT — text supports reference, does not reinterpret it.
 */

import type { CanonicalVisualReference } from '../p0vr2/types.js';
import { formatSafeAreaForPrompt } from './assetSafeAreaContract.js';
import { formatCropContractForPrompt } from './referenceAssetCropContract.js';
import type {
  CompiledReferenceAssetPrompt,
  ReferenceAssetBrief,
  ReferenceVisualAssetSlot,
} from './types.js';
import { routeFalProvider } from './falProviderRouting.js';

const promptVersionStore = new Map<string, number>();

export function compileReferenceAssetPrompt(input: {
  reference: CanonicalVisualReference;
  slot: ReferenceVisualAssetSlot;
  brief: ReferenceAssetBrief;
  brandCanon?: string;
  promptVersion?: number;
}): CompiledReferenceAssetPrompt {
  const route = routeFalProvider(input.slot, input.brief);
  const placementContext = formatCropContractForPrompt(input.slot.cropContract, input.slot.targetBounds);
  const safeAreaContext = formatSafeAreaForPrompt(input.slot.safeArea, input.slot.targetBounds);
  const hasReferenceCrop = Boolean(input.slot.referenceCropStoragePath);

  const sections: Record<string, string> = {
    'ASSET ROLE': `${input.brief.assetRole} — ${input.brief.visualPurpose}`,
    'REFERENCE AUTHORITY': hasReferenceCrop
      ? `Use provided reference crop as primary authority. Text supports the reference; do not reinterpret layout.`
      : 'No reference crop — reconstruct from brief while honoring slot geometry.',
    SUBJECT: input.brief.subject,
    COMPOSITION: input.brief.composition,
    'MATERIAL / TEXTURE': `${input.brief.material}. ${input.brief.texture}`,
    CAMERA: input.brief.camera,
    LIGHTING: input.brief.lighting,
    COLOR: input.brief.palette,
    BACKGROUND: `${input.brief.background}${input.brief.transparency ? ' — transparency required' : ''}`,
    EXCLUSIONS: input.brief.mustExclude.join('; '),
    'OUTPUT GEOMETRY': `Generate ${input.brief.outputGeometry.generationWidth}×${input.brief.outputGeometry.generationHeight} (${input.brief.outputGeometry.aspectRatio}:1). Display at ${input.brief.outputGeometry.displayWidth}×${input.brief.outputGeometry.displayHeight}.`,
    'PLACEMENT CONTEXT': placementContext,
    'SAFE AREA': safeAreaContext,
    'BRAND AUTHORITY': input.brief.brandAuthority,
  };

  if (input.brief.identityAuthority) {
    sections['IDENTITY AUTHORITY'] = input.brief.identityAuthority;
  }

  const promptText = Object.entries(sections)
    .map(([k, v]) => `[${k}]\n${v}`)
    .join('\n\n');

  const version =
    input.promptVersion ??
    (() => {
      const prev = promptVersionStore.get(input.slot.slotId) ?? 0;
      const next = prev + 1;
      promptVersionStore.set(input.slot.slotId, next);
      return next;
    })();

  return {
    promptId: `prompt-${input.slot.slotId}-v${version}`,
    slotId: input.slot.slotId,
    version,
    compiledAt: new Date().toISOString(),
    provider: route.provider,
    model: route.model,
    promptText,
    sections,
    inputReferenceImages: hasReferenceCrop && input.slot.referenceCropStoragePath
      ? [input.slot.referenceCropStoragePath]
      : [],
    imageReferencePrimary: hasReferenceCrop,
    textToImagePrimary: !hasReferenceCrop,
    editable: true,
  };
}

export function getPromptVersion(slotId: string): number {
  return promptVersionStore.get(slotId) ?? 0;
}

export function resetPromptVersionStoreForTest(): void {
  promptVersionStore.clear();
}

export function promptIncludesPlacementContext(prompt: CompiledReferenceAssetPrompt): boolean {
  return Boolean(prompt.sections['PLACEMENT CONTEXT']?.includes('slot'));
}

export function promptIncludesCropContract(prompt: CompiledReferenceAssetPrompt): boolean {
  return Boolean(prompt.sections['PLACEMENT CONTEXT']?.includes('Object fit'));
}

export function promptIncludesSafeArea(prompt: CompiledReferenceAssetPrompt): boolean {
  return Boolean(prompt.sections['SAFE AREA']?.includes('Safe area'));
}

export function promptIgnoresReferenceWhenCropAvailable(
  prompt: CompiledReferenceAssetPrompt,
  hasReferenceCrop: boolean,
): boolean {
  if (!hasReferenceCrop) return false;
  return !prompt.imageReferencePrimary || prompt.textToImagePrimary;
}
