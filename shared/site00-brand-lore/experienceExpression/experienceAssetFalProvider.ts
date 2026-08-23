/**
 * Live FAL generation for Experience visual development assets.
 * Reuses @fal-ai/client + Supabase storage — GPT Image 2 via FAL.
 */

import { createHash } from 'node:crypto';
import { downloadUrlToBuffer, uploadSite00AssetBuffer } from '../../../api/_lib/site00Assts/storage.js';
import { EXPERIENCE_VISUAL_COST_ESTIMATE_USD } from './constants.js';
import type { DesignProofAssetRequirement } from './designProofManifest.js';
import {
  buildFalImageInput,
  EXPERIENCE_FAL_MODEL,
  SITE00_FAL_TEXT_TO_IMAGE_MODEL,
} from '../../site00-visual-generation/falImageModels.js';
import type { VisualReferencePackage, VisualGenerationMode } from '../../site00-visual-reference/types.js';
import { compileReferenceConditionedPrompt } from '../../site00-visual-reference/referencePromptCompiler.js';
import {
  assertReferenceConditioningSupported,
  getCurrentExperienceProviderCapability,
} from '../../site00-visual-reference/providerCapabilityRegistry.js';
import {
  resolveVisualGenerationMode,
  shouldFailWithoutReferenceConditioning,
} from '../../site00-visual-reference/generationModeResolver.js';

export { EXPERIENCE_FAL_MODEL, SITE00_FAL_TEXT_TO_IMAGE_MODEL };
export const EXPERIENCE_FAL_PROVIDER = 'fal';

export type FalGenerationResult =
  | {
      ok: true;
      storagePath: string;
      publicUrl: string;
      requestId: string | null;
      promptHash: string;
      costUsd: number;
      provider: string;
      model: string;
    }
  | { ok: false; error: string; requirementId: string };

export function buildDesignProofAssetPrompt(params: {
  requirement: DesignProofAssetRequirement;
  artDirectionSummary: string;
  proofConcept: string;
  owner: string;
  functionalSummary: string;
  antiDirection: string[];
}): { prompt: string; negativePrompt: string; promptHash: string } {
  const prompt = [
    'Complete desktop UI design proof fragment for SITE 00 Studio World.',
    `Proof: ${params.proofConcept}`,
    `Owner: ${params.owner}`,
    `Asset role: ${params.requirement.assetRole}`,
    `Category: ${params.requirement.category}`,
    `Purpose: ${params.requirement.purpose}`,
    `Art direction: ${params.artDirectionSummary}`,
    `Functional grounding: ${params.functionalSummary}`,
    'Requirements: authored visual expression, material depth, asymmetric hierarchy, no SaaS dashboard, no equal card grid, no wireframe, no placeholder rectangles, no literal workshop, no literal detective case file.',
    'High fidelity designed composition fragment suitable for final page assembly.',
  ].join('\n');

  const negativePrompt = [
    ...params.antiDirection,
    'wireframe',
    'placeholder',
    'stock photo',
    'generic admin dashboard',
    'equal cards',
    'white document page only',
    'text-only',
  ].join(', ');

  const promptHash = createHash('sha256').update(prompt).digest('hex').slice(0, 16);
  return { prompt, negativePrompt, promptHash };
}

export function buildComposedDesignProofPrompt(params: {
  proofId: string;
  proofConcept: string;
  owner: string;
  artDirectionSummary: string;
  functionalSummary: string;
  componentAssetDescriptions: string[];
}): { prompt: string; negativePrompt: string; promptHash: string } {
  const prompt = [
    'Single complete desktop page design proof image for SITE 00.',
    `Surface: ${params.proofId}`,
    `Concept: ${params.proofConcept}`,
    `Owner: ${params.owner}`,
    params.artDirectionSummary,
    `Functional categories to represent: ${params.functionalSummary}`,
    `Component assets integrated: ${params.componentAssetDescriptions.join('; ')}`,
    'ONE coherent full-page design — not a collage of separate panels.',
    'Asymmetric focal hierarchy, dossier structural sophistication, authored graphic layer, environmental depth.',
    '16:9 desktop aspect ratio design review frame.',
    'No wireframe, no CSS mockup, no bordered equal cards, no SaaS dashboard.',
  ].join('\n');

  const negativePrompt =
    'wireframe, placeholder, screenshot of existing page, equal cards, admin portal, literal workshop, literal case file, text-only layout';

  const promptHash = createHash('sha256').update(prompt).digest('hex').slice(0, 16);
  return { prompt, negativePrompt, promptHash };
}

async function runFalGeneration(params: {
  prompt: string;
  negativePrompt: string;
  promptHash: string;
  storagePath: string;
  aspectRatio?: string;
  requirementId: string;
  referenceImageUrls?: string[];
  strictHostRequired?: boolean;
}): Promise<FalGenerationResult> {
  const isVitest = process.env.VITEST === 'true';
  const falKey = process.env.FAL_KEY?.trim();

  if (isVitest) {
    return {
      ok: true,
      storagePath: params.storagePath,
      publicUrl: `https://vitest.local/${params.storagePath}`,
      requestId: `vitest-${params.requirementId}`,
      promptHash: params.promptHash,
      costUsd: 0,
      provider: 'vitest-mock',
      model: 'vitest-mock',
    };
  }

  if (!falKey) {
    return { ok: false, error: 'FAL_KEY not configured on server', requirementId: params.requirementId };
  }

  try {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });

    const refUrls = params.referenceImageUrls?.filter(Boolean) ?? [];
    const profile = getCurrentExperienceProviderCapability();
    const supportCheck = assertReferenceConditioningSupported({
      providerId: profile.providerId,
      modelId: profile.modelId,
      referenceCount: refUrls.length,
      strictHostRequired: Boolean(params.strictHostRequired && refUrls.length > 0),
    });
    if (!supportCheck.ok) {
      return { ok: false, error: supportCheck.error, requirementId: params.requirementId };
    }

    const fullPrompt = `${params.prompt}\n\nAvoid: ${params.negativePrompt}`;
    const { model, input } = buildFalImageInput({
      prompt: fullPrompt,
      aspectRatio: params.aspectRatio ?? '16:9',
      outputFormat: 'webp',
      referenceImageUrls: refUrls.length > 0 ? refUrls : undefined,
    });

    const result = (await fal.subscribe(model, { input: input as never, logs: false })) as {
      request_id?: string;
      data?: { images?: Array<{ url?: string }> };
    };

    const imageUrl = result?.data?.images?.[0]?.url;
    if (!imageUrl) {
      return { ok: false, error: 'FAL returned no image URL', requirementId: params.requirementId };
    }

    const buffer = await downloadUrlToBuffer(imageUrl);
    const upload = await uploadSite00AssetBuffer(params.storagePath, buffer, 'image/webp');

    return {
      ok: true,
      storagePath: upload.storagePath,
      publicUrl: upload.publicUrl,
      requestId: result.request_id ?? null,
      promptHash: params.promptHash,
      costUsd: EXPERIENCE_VISUAL_COST_ESTIMATE_USD,
      provider: EXPERIENCE_FAL_PROVIDER,
      model,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'FAL generation failed',
      requirementId: params.requirementId,
    };
  }
}

/** Server-only — invokes real FAL when FAL_KEY configured. */
export async function generateDesignProofAssetViaFal(params: {
  requirement: DesignProofAssetRequirement;
  storagePath: string;
  artDirectionSummary: string;
  proofConcept: string;
  owner: string;
  functionalSummary: string;
  antiDirection: string[];
  aspectRatio?: string;
}): Promise<FalGenerationResult> {
  const { prompt, negativePrompt, promptHash } = buildDesignProofAssetPrompt({
    requirement: params.requirement,
    artDirectionSummary: params.artDirectionSummary,
    proofConcept: params.proofConcept,
    owner: params.owner,
    functionalSummary: params.functionalSummary,
    antiDirection: params.antiDirection,
  });

  return runFalGeneration({
    prompt,
    negativePrompt,
    promptHash,
    storagePath: params.storagePath,
    aspectRatio: params.aspectRatio,
    requirementId: params.requirement.id,
  });
}

export async function composeDesignProofViaFal(params: {
  proofId: string;
  storagePath: string;
  proofConcept: string;
  owner: string;
  artDirectionSummary: string;
  functionalSummary: string;
  componentAssetDescriptions: string[];
  referencePackage?: VisualReferencePackage | null;
}): Promise<FalGenerationResult & { requirementId: string; generationMode?: VisualGenerationMode }> {
  const { prompt: basePrompt, negativePrompt: baseNegative, promptHash } = buildComposedDesignProofPrompt(params);

  let prompt = basePrompt;
  let negativePrompt = baseNegative;
  let referenceImageUrls: string[] | undefined;
  let generationMode: VisualGenerationMode = 'TEXT_TO_IMAGE';
  let strictHostRequired = false;

  if (params.referencePackage) {
    strictHostRequired = params.referencePackage.strictHostVisualConditioning;
    generationMode = resolveVisualGenerationMode({ referencePackage: params.referencePackage });
    referenceImageUrls = params.referencePackage.references
      .map((r) => r.publicUrl)
      .filter((u): u is string => Boolean(u));

    if (
      shouldFailWithoutReferenceConditioning({
        strictHostVisualConditioning: strictHostRequired,
        generationMode,
        referenceCount: referenceImageUrls.length,
      })
    ) {
      return {
        ok: false,
        error: 'STRICT_HOST_VISUAL_CONDITIONING requires reference-conditioned generation; cannot fall back to text-to-image',
        requirementId: `compose-${params.proofId}`,
        generationMode,
      };
    }

    const compiled = compileReferenceConditionedPrompt({
      referencePackage: params.referencePackage,
      basePrompt,
      negativePrompt: baseNegative,
    });
    prompt = compiled.prompt;
    negativePrompt = compiled.negativePrompt;
  }

  const result = await runFalGeneration({
    prompt,
    negativePrompt,
    promptHash,
    storagePath: params.storagePath,
    aspectRatio: '16:9',
    requirementId: `compose-${params.proofId}`,
    referenceImageUrls,
    strictHostRequired,
  });

  return { ...result, requirementId: `compose-${params.proofId}`, generationMode };
}

export function buildNdxbookHeroFrameComposePrompt(params: {
  workspaceConceptLabel: string;
  clientExpressionSummary: string;
  componentAssetDescriptions: string[];
}): { prompt: string; negativePrompt: string; promptHash: string } {
  const prompt = [
    'Single complete desktop hero frame design proof for NDXBOOK project home inside SITE 00 Project Workspace.',
    `Workspace canon: ${params.workspaceConceptLabel}`,
    `Client expression: ${params.clientExpressionSummary}`,
    `Hero component assets: ${params.componentAssetDescriptions.join('; ') || 'authored client artwork + environment plate'}`,
    'ONE coherent project-home hero — active workbench + dossier structural sophistication.',
    'Client-native expressive typography and artwork participation; not a generic SaaS dashboard.',
    '16:9 desktop design review frame.',
    'No wireframe, no equal card grid, no literal workshop carpentry, no literal detective case file.',
  ].join('\n');

  const negativePrompt =
    'wireframe, placeholder, screenshot of existing page, equal cards, admin portal, literal workshop, generic dashboard, text-only layout';

  const promptHash = createHash('sha256').update(prompt).digest('hex').slice(0, 16);
  return { prompt, negativePrompt, promptHash };
}

/** Server-only — composes NDXBOOK project-home hero frame via FAL when configured. */
export async function composeNdxbookHeroFrameViaFal(params: {
  storagePath: string;
  workspaceConceptLabel: string;
  clientExpressionSummary: string;
  componentAssetDescriptions: string[];
}): Promise<FalGenerationResult> {
  const { prompt, negativePrompt, promptHash } = buildNdxbookHeroFrameComposePrompt(params);
  return runFalGeneration({
    prompt,
    negativePrompt,
    promptHash,
    storagePath: params.storagePath,
    aspectRatio: '16:9',
    requirementId: 'compose-ndxbook-hero',
  });
}

/** Server-only — generates one experience hero component asset via FAL when configured. */
export async function generateExperienceHeroAssetViaFal(params: {
  compiledPrompt: string;
  promptHash: string;
  storagePath: string;
  requirementId: string;
}): Promise<FalGenerationResult> {
  const negativePrompt =
    'wireframe, placeholder, stock photo, generic admin dashboard, equal cards, literal workshop, literal case file, text-only layout';
  return runFalGeneration({
    prompt: params.compiledPrompt,
    negativePrompt,
    promptHash: params.promptHash,
    storagePath: params.storagePath,
    aspectRatio: '16:9',
    requirementId: params.requirementId,
  });
}

export function cssFallbackBlocked(): true {
  return true;
}

export function failedGenerationCannotMarkDesignProofReady(lifecycle: string): boolean {
  return lifecycle === 'GENERATION_FAILED' || lifecycle === 'GENERATING';
}
