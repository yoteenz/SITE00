import { buildFalImageInput } from '../../../site00-visual-generation/falImageModels.js';
import {
  TWIN_V2_VISUAL_PROVIDER,
  TWIN_V2_VISUAL_PROVIDER_LABEL,
} from '../p0vrTwinV21/constants.js';
import {
  buildAuthorityVisualPrompt,
  buildBlueprintTwinVisualPrompt,
  buildStandaloneAssetProofPrompt,
} from './buildFalParallelTwinPrompts.js';
import type { FalTwinGenerationMode, FalVisualArtifact, MinimalTwinGenerationState } from './types.js';

export type FalDispatchResult = {
  generationMode: FalTwinGenerationMode;
  authority: { url: string; jobRef: string; artifactId: string };
  blueprint: { url: string; jobRef: string; artifactId: string };
  providerTrace: string[];
};

export type StandaloneAssetDispatchResult = {
  objectId: string;
  url: string;
  jobRef: string;
  artifactId: string;
};

function vitestTwinFixtures(conceptId: string): FalDispatchResult {
  const ts = Date.now();
  return {
    generationMode: 'COORDINATED_DUAL_CALL',
    authority: {
      url: '/assets/ndxbook-reconstruction/ndxbook-mobile-authority.jpg',
      jobRef: `vitest-fal-authority-${ts}`,
      artifactId: `fal-art-authority-${conceptId}-${ts}`,
    },
    blueprint: {
      url: '/assets/ndxbook-reconstruction/ndxbook-mobile-authority.jpg?v=fal-blueprint-twin-fixture',
      jobRef: `vitest-fal-blueprint-${ts}`,
      artifactId: `fal-art-blueprint-twin-${conceptId}-${ts}`,
    },
    providerTrace: [
      'VITEST: skipped live FAL — two distinct artifact IDs and job refs only',
      'MODE: COORDINATED_DUAL_CALL (simulated)',
    ],
  };
}

async function falSubscribeOne(prompt: string, label: string): Promise<{ url: string; jobRef: string }> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) {
    throw new Error('FAL_KEY_MISSING');
  }
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const input = buildFalImageInput({ prompt, aspectRatio: '9:16' });
  const result = await fal.subscribe(input.model, { input: input.input });
  const requestId =
    (result as { requestId?: string }).requestId ??
    (result as { request_id?: string }).request_id ??
    `fal-${label}-${Date.now()}`;
  const imageUrl =
    (result.data as { images?: { url?: string }[] })?.images?.[0]?.url ??
    (result.data as { image?: { url?: string } })?.image?.url;
  if (!imageUrl) throw new Error(`FAL ${label} returned no image URL`);
  return { url: imageUrl, jobRef: String(requestId) };
}

/** Probe whether a single call can return two distinct images (usually same prompt — not used for final twin pass). */
export async function probeFalMultiOutputSupport(prompt: string): Promise<{
  supported: boolean;
  imageCount: number;
  note: string;
}> {
  if (process.env.VITEST === 'true') {
    return { supported: false, imageCount: 0, note: 'VITEST skips live probe' };
  }
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) {
    return { supported: false, imageCount: 0, note: 'FAL_KEY missing' };
  }
  try {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });
    const input = buildFalImageInput({ prompt, aspectRatio: '9:16' });
    const multiInput = { ...input.input, num_images: 2 };
    const result = await fal.subscribe(input.model, { input: multiInput });
    const images = (result.data as { images?: { url?: string }[] })?.images ?? [];
    return {
      supported: images.length >= 2,
      imageCount: images.length,
      note:
        images.length >= 2
          ? 'Provider returned multiple images; twin proof still uses dual coordinated calls for authority vs blueprint roles'
          : 'Single-output only for multi-image probe',
    };
  } catch {
    return { supported: false, imageCount: 0, note: 'Multi-output probe failed' };
  }
}

export async function dispatchFalParallelTwinGeneration(input: {
  state: MinimalTwinGenerationState;
  pageIntentSummary: string;
}): Promise<FalDispatchResult> {
  if (process.env.VITEST === 'true') {
    return vitestTwinFixtures(input.state.conceptId);
  }

  const trace: string[] = [];
  const probe = await probeFalMultiOutputSupport('probe');
  trace.push(`Multi-output probe: ${probe.note} (count=${probe.imageCount})`);

  const authorityPrompt = buildAuthorityVisualPrompt(input.state, input.pageIntentSummary);
  const blueprintPrompt = buildBlueprintTwinVisualPrompt(input.state, input.pageIntentSummary);

  trace.push('MODE: COORDINATED_DUAL_CALL — authority then blueprint twin from same MinimalTwinGenerationState');
  const authority = await falSubscribeOne(authorityPrompt, 'authority');
  trace.push(`Authority job: ${authority.jobRef}`);
  const blueprint = await falSubscribeOne(blueprintPrompt, 'blueprint-twin');
  trace.push(`Blueprint twin job: ${blueprint.jobRef}`);

  const ts = Date.now();
  return {
    generationMode: 'COORDINATED_DUAL_CALL',
    authority: {
      ...authority,
      artifactId: `fal-art-authority-${input.state.conceptId}-${ts}`,
    },
    blueprint: {
      ...blueprint,
      artifactId: `fal-art-blueprint-twin-${input.state.conceptId}-${ts}`,
    },
    providerTrace: trace,
  };
}

export async function dispatchStandaloneAssetProof(input: {
  state: MinimalTwinGenerationState;
  objectId: string;
}): Promise<StandaloneAssetDispatchResult> {
  if (process.env.VITEST === 'true') {
    const ts = Date.now();
    return {
      objectId: input.objectId,
      url: `/assets/ndxbook-reconstruction/ndxbook-mobile-authority.jpg?standalone=${input.objectId}`,
      jobRef: `vitest-fal-asset-${ts}`,
      artifactId: `fal-art-standalone-${input.objectId}-${ts}`,
    };
  }
  const prompt = buildStandaloneAssetProofPrompt(input.state, input.objectId);
  const result = await falSubscribeOne(prompt, `asset-${input.objectId}`);
  return {
    objectId: input.objectId,
    url: result.url,
    jobRef: result.jobRef,
    artifactId: `fal-art-standalone-${input.objectId}-${Date.now()}`,
  };
}

export function toFalVisualArtifacts(input: {
  state: MinimalTwinGenerationState;
  dispatch: FalDispatchResult;
}): { authority: FalVisualArtifact; blueprint: FalVisualArtifact } {
  const provider = TWIN_V2_VISUAL_PROVIDER_LABEL;
  const model = TWIN_V2_VISUAL_PROVIDER;
  return {
    authority: {
      artifactId: input.dispatch.authority.artifactId,
      artifactKind: 'AUTHORITY_VISUAL',
      compositionStateId: input.state.compositionStateId,
      conceptId: input.state.conceptId,
      conceptVersionId: input.state.conceptVersionId,
      objectId: null,
      storageUrl: input.dispatch.authority.url,
      providerJobRef: input.dispatch.authority.jobRef,
      provider,
      model,
    },
    blueprint: {
      artifactId: input.dispatch.blueprint.artifactId,
      artifactKind: 'BLUEPRINT_TWIN_VISUAL',
      compositionStateId: input.state.compositionStateId,
      conceptId: input.state.conceptId,
      conceptVersionId: input.state.conceptVersionId,
      objectId: null,
      storageUrl: input.dispatch.blueprint.url,
      providerJobRef: input.dispatch.blueprint.jobRef,
      provider,
      model,
    },
  };
}
