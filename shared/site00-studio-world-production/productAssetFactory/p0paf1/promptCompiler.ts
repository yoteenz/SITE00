/**
 * P0.PAF.1 — Product variant prompt compiler.
 * Master hero image = primary authority. Text supports reference only.
 */

import { getHairColorById } from './hairColorRegistry.js';
import { getHairStyleById } from './hairStyleRegistry.js';
import { lockedRegionsForColorEdit } from './editRegionMap.js';
import { routeProductFalProvider } from './falProviderRouting.js';
import type {
  BackgroundMode,
  CompiledProductVariantPrompt,
  LockedAttributes,
  ProductMasterHero,
  ProductVariantKey,
} from './types.js';

const promptVersionStore = new Map<string, number>();

export function compileProductVariantPrompt(input: {
  masterHero: ProductMasterHero;
  variantKey: ProductVariantKey;
  backgroundMode: BackgroundMode;
  styleReferenceUrl?: string | null;
  lockedAttributes?: LockedAttributes;
}): CompiledProductVariantPrompt {
  const route = routeProductFalProvider({
    hasMasterHero: true,
    variationAxes: input.variantKey.axes,
    backgroundMode: input.backgroundMode,
    styleReferenceUrl: input.styleReferenceUrl,
  });

  const targetDescription = describeTargetVariation(input.variantKey.axes);
  const locked = input.lockedAttributes ?? input.masterHero.lockedAttributes;
  const lockedRegionList = lockedRegionsForColorEdit(input.masterHero.masterHeroId).join(', ');

  const instruction = buildShortAuthorityPrompt({
    targetDescription,
    lockedRegionList,
    backgroundMode: input.backgroundMode,
    hasStyleRef: Boolean(input.styleReferenceUrl),
  });

  const version = nextPromptVersion(input.variantKey.configurationHash);

  return {
    promptId: `paf-prompt-${input.variantKey.configurationHash}-v${version}`,
    masterHeroId: input.masterHero.masterHeroId,
    variantKey: input.variantKey.key,
    version,
    provider: route.provider,
    model: route.model,
    promptText: instruction,
    inputReferenceImages: [
      input.masterHero.publicUrl,
      ...(input.styleReferenceUrl ? [input.styleReferenceUrl] : []),
    ],
    imageReferencePrimary: true,
    textToImagePrimary: false,
    styleReferenceUrl: input.styleReferenceUrl ?? null,
    backgroundMode: input.backgroundMode,
    lockedAttributes: locked,
    targetVariation: input.variantKey.axes,
    compiledAt: new Date().toISOString(),
  };
}

function buildShortAuthorityPrompt(input: {
  targetDescription: string;
  lockedRegionList: string;
  backgroundMode: BackgroundMode;
  hasStyleRef: boolean;
}): string {
  const bg =
    input.backgroundMode === 'TRANSPARENT_CUTOUT'
      ? 'Output transparent PNG cutout.'
      : input.backgroundMode === 'WHITE_STUDIO'
        ? 'White studio background.'
        : input.backgroundMode === 'REMOVE_BACKGROUND'
          ? 'Remove background — isolated product.'
          : 'Keep original background.';

  const styleRef = input.hasStyleRef
    ? 'Style reference controls hair style only — master hero controls product/mannequin identity.'
    : '';

  return [
    'PRIMARY IMAGE: exact master hero.',
    `INSTRUCTION: ${input.targetDescription}`,
    'Preserve the exact same mannequin, wig silhouette, texture, density, hairline, lace, length, pose, camera, lighting, crop and proportions.',
    `LOCKED: ${input.lockedRegionList}.`,
    bg,
    styleRef,
    'No redesign.',
  ]
    .filter(Boolean)
    .join(' ');
}

function describeTargetVariation(axes: Record<string, string>): string {
  if (axes.COLOR || axes.variantValue) {
    const colorId = axes.COLOR ?? axes.variantValue;
    const color = getHairColorById(colorId);
    return `Change only the hair color to ${color?.promptDescription ?? colorId}.`;
  }
  if (axes.STYLE) {
    const style = getHairStyleById(axes.STYLE);
    return `Change only the hair style to ${style?.promptDescription ?? axes.STYLE}.`;
  }
  const parts = Object.entries(axes).map(([k, v]) => `${k.toLowerCase()}=${v}`);
  return `Change only: ${parts.join(', ')}.`;
}

function nextPromptVersion(configurationHash: string): number {
  const prev = promptVersionStore.get(configurationHash) ?? 0;
  const next = prev + 1;
  promptVersionStore.set(configurationHash, next);
  return next;
}

export function colorOnlyEditPreservesNonColorAttributes(prompt: CompiledProductVariantPrompt): boolean {
  const text = prompt.promptText.toLowerCase();
  return (
    text.includes('change only the hair color') &&
    text.includes('preserve') &&
    prompt.imageReferencePrimary &&
    !prompt.textToImagePrimary
  );
}

export function resetPromptVersionStoreForTest(): void {
  promptVersionStore.clear();
}
