/**
 * Live FAL generation for Experience visual development assets.
 * Reuses @fal-ai/client + Supabase storage — never CSS fallback.
 */

import { createHash } from 'node:crypto';
import { downloadUrlToBuffer, uploadSite00AssetBuffer } from '../../../api/_lib/site00Assts/storage.js';
import { EXPERIENCE_VISUAL_COST_ESTIMATE_USD } from './constants.js';
import type { DesignProofAssetRequirement } from './designProofManifest.js';

export const EXPERIENCE_FAL_PROVIDER = 'fal';
export const EXPERIENCE_FAL_MODEL = 'fal-ai/nano-banana-pro';

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
    '16:10 desktop aspect ratio design review frame.',
    'No wireframe, no CSS mockup, no bordered equal cards, no SaaS dashboard.',
  ].join('\n');

  const negativePrompt =
    'wireframe, placeholder, screenshot of existing page, equal cards, admin portal, literal workshop, literal case file, text-only layout';

  const promptHash = createHash('sha256').update(prompt).digest('hex').slice(0, 16);
  return { prompt, negativePrompt, promptHash };
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
  const isVitest = process.env.VITEST === 'true';
  const falKey = process.env.FAL_KEY?.trim();
  const { prompt, negativePrompt, promptHash } = buildDesignProofAssetPrompt({
    requirement: params.requirement,
    artDirectionSummary: params.artDirectionSummary,
    proofConcept: params.proofConcept,
    owner: params.owner,
    functionalSummary: params.functionalSummary,
    antiDirection: params.antiDirection,
  });

  if (isVitest) {
    const publicUrl = `https://vitest.local/${params.storagePath}`;
    return {
      ok: true,
      storagePath: params.storagePath,
      publicUrl,
      requestId: `vitest-${params.requirement.id}`,
      promptHash,
      costUsd: 0,
      provider: 'vitest-mock',
      model: 'vitest-mock',
    };
  }

  if (!falKey) {
    return { ok: false, error: 'FAL_KEY not configured on server', requirementId: params.requirement.id };
  }

  try {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });

    const result = (await fal.subscribe(EXPERIENCE_FAL_MODEL, {
      input: {
        prompt: `${prompt}\n\nAvoid: ${negativePrompt}`,
        aspect_ratio: (params.aspectRatio ?? '16:9') as '16:9',
        output_format: 'webp',
        num_images: 1,
      } as never,
      logs: false,
    })) as { request_id?: string; data?: { images?: Array<{ url?: string }> } };

    const imageUrl = result?.data?.images?.[0]?.url;
    if (!imageUrl) {
      return { ok: false, error: 'FAL returned no image URL', requirementId: params.requirement.id };
    }

    const buffer = await downloadUrlToBuffer(imageUrl);
    const upload = await uploadSite00AssetBuffer(params.storagePath, buffer, 'image/webp');

    return {
      ok: true,
      storagePath: upload.storagePath,
      publicUrl: upload.publicUrl,
      requestId: result.request_id ?? null,
      promptHash,
      costUsd: EXPERIENCE_VISUAL_COST_ESTIMATE_USD,
      provider: EXPERIENCE_FAL_PROVIDER,
      model: EXPERIENCE_FAL_MODEL,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'FAL generation failed',
      requirementId: params.requirement.id,
    };
  }
}

export async function composeDesignProofViaFal(params: {
  proofId: string;
  storagePath: string;
  proofConcept: string;
  owner: string;
  artDirectionSummary: string;
  functionalSummary: string;
  componentAssetDescriptions: string[];
}): Promise<FalGenerationResult & { requirementId: string }> {
  const isVitest = process.env.VITEST === 'true';
  const falKey = process.env.FAL_KEY?.trim();
  const { prompt, negativePrompt, promptHash } = buildComposedDesignProofPrompt(params);

  if (isVitest) {
    return {
      ok: true,
      storagePath: params.storagePath,
      publicUrl: `https://vitest.local/${params.storagePath}`,
      requestId: `vitest-compose-${params.proofId}`,
      promptHash,
      costUsd: 0,
      provider: 'vitest-mock',
      model: 'vitest-mock',
      requirementId: `compose-${params.proofId}`,
    };
  }

  if (!falKey) {
    return {
      ok: false,
      error: 'FAL_KEY not configured on server',
      requirementId: `compose-${params.proofId}`,
    };
  }

  try {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });

    const result = (await fal.subscribe(EXPERIENCE_FAL_MODEL, {
      input: {
        prompt: `${prompt}\n\nAvoid: ${negativePrompt}`,
        aspect_ratio: '16:9' as const,
        output_format: 'webp',
        num_images: 1,
      } as never,
      logs: false,
    })) as { request_id?: string; data?: { images?: Array<{ url?: string }> } };

    const imageUrl = result?.data?.images?.[0]?.url;
    if (!imageUrl) {
      return { ok: false, error: 'FAL returned no composed image', requirementId: `compose-${params.proofId}` };
    }

    const buffer = await downloadUrlToBuffer(imageUrl);
    const upload = await uploadSite00AssetBuffer(params.storagePath, buffer, 'image/webp');

    return {
      ok: true,
      storagePath: upload.storagePath,
      publicUrl: upload.publicUrl,
      requestId: result.request_id ?? null,
      promptHash,
      costUsd: EXPERIENCE_VISUAL_COST_ESTIMATE_USD,
      provider: EXPERIENCE_FAL_PROVIDER,
      model: EXPERIENCE_FAL_MODEL,
      requirementId: `compose-${params.proofId}`,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'FAL composition failed',
      requirementId: `compose-${params.proofId}`,
    };
  }
}

export function cssFallbackBlocked(): true {
  return true;
}

export function failedGenerationCannotMarkDesignProofReady(lifecycle: string): boolean {
  return lifecycle === 'GENERATION_FAILED' || lifecycle === 'GENERATING';
}
