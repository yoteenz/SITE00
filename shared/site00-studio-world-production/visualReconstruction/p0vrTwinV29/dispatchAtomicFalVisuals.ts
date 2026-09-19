import { runFalImageJobsParallel } from '../../../site00-visual-generation/falParallelImageSubscribe.js';
import {
  TWIN_V2_VISUAL_PROVIDER,
  TWIN_V2_VISUAL_PROVIDER_LABEL,
} from '../p0vrTwinV21/constants.js';
import type { ConceptCompositionState } from '../p0vrTwinV27/types.js';
import type { FalVisualArtifact } from '../p0vrTwinV28/types.js';
import {
  buildAuthorityPromptFromCompositionState,
  buildBlueprintTwinPromptFromCompositionState,
} from './buildFalPromptsFromCompositionState.js';

export type AtomicFalVisualDispatch = {
  generationMode: 'COORDINATED_SIBLING_CALLS';
  authority: FalVisualArtifact;
  blueprintTwin: FalVisualArtifact;
  providerTrace: string[];
};

async function falOne(prompt: string, label: string): Promise<{ url: string; jobRef: string }> {
  if (process.env.VITEST === 'true') {
    const ts = Date.now();
    return {
      url:
        label === 'authority'
          ? '/assets/ndxbook-reconstruction/ndxbook-mobile-authority.jpg'
          : `/assets/ndxbook-reconstruction/ndxbook-mobile-authority.jpg?v=atomic-blueprint-twin-${ts}`,
      jobRef: `vitest-atomic-${label}-${ts}`,
    };
  }
  const batch = await runFalImageJobsParallel([{ jobKey: label, prompt, aspectRatio: '9:16' }]);
  const row = batch.results[0]!;
  return { url: row.url, jobRef: row.jobRef };
}

export async function dispatchAtomicFalVisuals(input: {
  generationBundleId: string;
  compositionState: ConceptCompositionState;
  pageIntentSummary: string;
}): Promise<AtomicFalVisualDispatch> {
  const authPrompt = buildAuthorityPromptFromCompositionState(input.compositionState, input.pageIntentSummary);
  const bpPrompt = buildBlueprintTwinPromptFromCompositionState(input.compositionState, input.pageIntentSummary);
  const trace = ['MODE C: orchestrated creative transaction — parallel sibling FAL enqueue'];
  const batch =
    process.env.VITEST === 'true' ?
      {
        results: [
          { ...(await falOne(authPrompt, 'authority')), jobKey: 'authority', enqueueOffsetMs: 0 },
          { ...(await falOne(bpPrompt, 'blueprint-twin')), jobKey: 'blueprint-twin', enqueueOffsetMs: 0 },
        ],
        providerTrace: ['FAL_PARALLEL_ENQUEUE spreadMs=0 (vitest atomic)'],
      }
    : await runFalImageJobsParallel([
        { jobKey: 'authority', prompt: authPrompt, aspectRatio: '9:16' },
        { jobKey: 'blueprint-twin', prompt: bpPrompt, aspectRatio: '9:16' },
      ]);
  trace.push(...batch.providerTrace);
  const auth = batch.results.find((r) => r.jobKey === 'authority')!;
  const bp = batch.results.find((r) => r.jobKey === 'blueprint-twin')!;
  trace.push(`authority job ${auth.jobRef}`);
  trace.push(`blueprint twin job ${bp.jobRef}`);
  const ts = Date.now();
  const provider = TWIN_V2_VISUAL_PROVIDER_LABEL;
  const model = TWIN_V2_VISUAL_PROVIDER;
  const lineage = {
    compositionStateId: input.compositionState.compositionStateId,
    conceptId: input.compositionState.conceptId,
    conceptVersionId: input.compositionState.conceptVersionId,
  };
  return {
    generationMode: 'COORDINATED_SIBLING_CALLS',
    authority: {
      artifactId: `fal-auth-${input.generationBundleId}-${ts}`,
      artifactKind: 'AUTHORITY_VISUAL',
      ...lineage,
      objectId: null,
      storageUrl: auth.url,
      providerJobRef: auth.jobRef,
      provider,
      model,
    },
    blueprintTwin: {
      artifactId: `fal-bpt-${input.generationBundleId}-${ts}`,
      artifactKind: 'BLUEPRINT_TWIN_VISUAL',
      ...lineage,
      objectId: null,
      storageUrl: bp.url,
      providerJobRef: bp.jobRef,
      provider,
      model,
    },
    providerTrace: trace,
  };
}

export async function dispatchAtomicStandaloneAsset(input: {
  generationBundleId: string;
  compositionState: ConceptCompositionState;
  objectId: string;
  assetSlotId: string;
  transparent: boolean;
}): Promise<{ artifactId: string; url: string; jobRef: string; assetVersionId: string }> {
  const prompt = [
    `Standalone asset ${input.objectId} for bundle ${input.generationBundleId}`,
    `compositionStateId ${input.compositionState.compositionStateId}`,
    input.transparent ? 'Transparent background required.' : '',
    'Match authority object appearance — not a reinterpretation.',
  ].join(' ');
  const result = await falOne(prompt, `asset-${input.objectId}`);
  const ts = Date.now();
  return {
    artifactId: `fal-standalone-${input.objectId}-${ts}`,
    url: result.url,
    jobRef: result.jobRef,
    assetVersionId: `${input.objectId}-v1-${ts}`,
  };
}
