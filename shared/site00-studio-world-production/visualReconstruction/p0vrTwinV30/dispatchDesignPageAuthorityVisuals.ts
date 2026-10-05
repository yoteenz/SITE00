import { runFalImageJobsParallel } from '../../../site00-visual-generation/falParallelImageSubscribe.js';
import { TWIN_V2_VISUAL_PROVIDER, TWIN_V2_VISUAL_PROVIDER_LABEL } from '../p0vrTwinV21/constants.js';
import {
  DESIGN_PAGE_V3_R2_PROTOTYPE_DESKTOP,
  DESIGN_PAGE_V3_R2_PROTOTYPE_MOBILE,
} from './constants.js';
import {
  buildDesktopDesignPageAuthorityPrompt,
  buildMobileDesignPageAuthorityPrompt,
} from './buildDesignPageAuthorityPrompts.js';
import type { DesignPageAuthorityVisualArtifact } from './types.js';

export type DesignPageAuthorityVisualDispatch = {
  mobile: DesignPageAuthorityVisualArtifact;
  desktop: DesignPageAuthorityVisualArtifact;
  providerTrace: string[];
};

export async function dispatchDesignPageAuthorityVisuals(input: {
  authoritySessionId: string;
  clientProjectId: string;
  refineNotes?: string[];
}): Promise<DesignPageAuthorityVisualDispatch> {
  const mobilePrompt = buildMobileDesignPageAuthorityPrompt({
    clientProjectId: input.clientProjectId,
    refineNotes: input.refineNotes,
  });
  const desktopPrompt = buildDesktopDesignPageAuthorityPrompt({
    clientProjectId: input.clientProjectId,
    refineNotes: input.refineNotes,
  });
  const trace = ['DESIGN_PAGE_V3R2: parallel FAL batch (mobile + desktop)'];

  const falBatch =
    process.env.VITEST === 'true' ?
      {
        results: [
          { jobKey: 'mobile', url: DESIGN_PAGE_V3_R2_PROTOTYPE_MOBILE, jobRef: `vitest-mobile-${Date.now()}`, enqueueOffsetMs: 0 },
          { jobKey: 'desktop', url: DESIGN_PAGE_V3_R2_PROTOTYPE_DESKTOP, jobRef: `vitest-desktop-${Date.now()}`, enqueueOffsetMs: 0 },
        ],
        providerTrace: ['FAL_PARALLEL_ENQUEUE spreadMs=0 (vitest r2 pair)'],
      }
    : await runFalImageJobsParallel([
        { jobKey: 'mobile', prompt: mobilePrompt, aspectRatio: '9:16' },
        { jobKey: 'desktop', prompt: desktopPrompt, aspectRatio: '16:9' },
      ]);

  trace.push(...falBatch.providerTrace);
  const mobileJob = falBatch.results.find((r) => r.jobKey === 'mobile')!;
  const desktopJob = falBatch.results.find((r) => r.jobKey === 'desktop')!;
  trace.push(`mobile job ${mobileJob.jobRef}`);
  trace.push(`desktop job ${desktopJob.jobRef}`);

  const ts = Date.now();
  const provider = TWIN_V2_VISUAL_PROVIDER_LABEL;
  const model = TWIN_V2_VISUAL_PROVIDER;
  const mk = (viewport: 'mobile' | 'desktop', url: string, jobRef: string): DesignPageAuthorityVisualArtifact => ({
    artifactId: `dpa-v3r2-${viewport}-${input.authoritySessionId}-${ts}`,
    viewport,
    storageUrl: url,
    widthHintPx: viewport === 'mobile' ? 430 : 1440,
    heightHintPx: viewport === 'mobile' ? 920 : 900,
    provider,
    model,
    providerJobRef: jobRef,
    representativePrototype: process.env.VITEST === 'true',
    createdAt: new Date().toISOString(),
  });

  return {
    mobile: mk('mobile', mobileJob.url, mobileJob.jobRef),
    desktop: mk('desktop', desktopJob.url, desktopJob.jobRef),
    providerTrace: trace,
  };
}
