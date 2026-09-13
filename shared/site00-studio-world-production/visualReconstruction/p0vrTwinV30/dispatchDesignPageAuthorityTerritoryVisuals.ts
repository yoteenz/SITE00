import { runFalImageJobsParallel } from '../../../site00-visual-generation/falParallelImageSubscribe.js';
import { TWIN_V2_VISUAL_PROVIDER, TWIN_V2_VISUAL_PROVIDER_LABEL } from '../p0vrTwinV21/constants.js';
import { DESIGN_PAGE_V3_R3_TERRITORY_PROTOTYPES } from './constants.js';
import { buildTerritoryDesignPageAuthorityPrompt } from './buildDesignPageAuthorityTerritoryPrompts.js';
import { DESIGN_PAGE_V3_TERRITORY_DEFINITIONS, type DesignPageV3TerritoryId } from './hostProjectExpressionModel.js';
import type { DesignPageAuthorityTerritoryBundle, DesignPageAuthorityVisualArtifact } from './types.js';

function prototypePath(territoryId: DesignPageV3TerritoryId, viewport: 'mobile' | 'desktop'): string {
  return DESIGN_PAGE_V3_R3_TERRITORY_PROTOTYPES[territoryId][viewport];
}

export type DesignPageAuthorityTerritoryVisualDispatch = {
  territories: DesignPageAuthorityTerritoryBundle[];
  providerTrace: string[];
};

type TerritoryFrameJob = {
  territoryId: DesignPageV3TerritoryId;
  viewport: 'mobile' | 'desktop';
  prompt: string;
  aspectRatio: '9:16' | '16:9';
  storageLabel: string;
};

export async function dispatchDesignPageAuthorityTerritoryVisuals(input: {
  authoritySessionId: string;
  clientProjectId: string;
  refineNotes?: string[];
}): Promise<DesignPageAuthorityTerritoryVisualDispatch> {
  const trace = ['DESIGN_PAGE_V3R3: parallel FAL batch (6 frames: A/B/C × mobile/desktop)'];
  const territoryIds: DesignPageV3TerritoryId[] = ['A', 'B', 'C'];
  const ts = Date.now();
  const provider = TWIN_V2_VISUAL_PROVIDER_LABEL;
  const model = TWIN_V2_VISUAL_PROVIDER;

  const mk = (
    territoryId: DesignPageV3TerritoryId,
    viewport: 'mobile' | 'desktop',
    url: string,
    jobRef: string,
  ): DesignPageAuthorityVisualArtifact => ({
    artifactId: `dpa-v3r3-${territoryId}-${viewport}-${input.authoritySessionId}-${ts}`,
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

  const frameJobs: TerritoryFrameJob[] = territoryIds.flatMap((territoryId) => {
    const mobilePrompt = buildTerritoryDesignPageAuthorityPrompt({
      territoryId,
      viewport: 'mobile',
      clientProjectId: input.clientProjectId,
      refineNotes: input.refineNotes,
    });
    const desktopPrompt = buildTerritoryDesignPageAuthorityPrompt({
      territoryId,
      viewport: 'desktop',
      clientProjectId: input.clientProjectId,
      refineNotes: input.refineNotes,
    });
    const mobileLabel = prototypePath(territoryId, 'mobile');
    const desktopLabel = prototypePath(territoryId, 'desktop');
    return [
      {
        territoryId,
        viewport: 'mobile',
        prompt: mobilePrompt,
        aspectRatio: '9:16',
        storageLabel: mobileLabel,
      },
      {
        territoryId,
        viewport: 'desktop',
        prompt: desktopPrompt,
        aspectRatio: '16:9',
        storageLabel: desktopLabel,
      },
    ];
  });

  const falBatch =
    process.env.VITEST === 'true' ?
      {
        results: frameJobs.map((job) => ({
          jobKey: `${job.territoryId}-${job.viewport}`,
          url: job.storageLabel,
          jobRef: `vitest-${job.territoryId}-${job.viewport}-${ts}`,
          enqueueOffsetMs: 0,
        })),
        providerTrace: ['FAL_PARALLEL_ENQUEUE spreadMs=0 (vitest territory batch)'],
      }
    : await runFalImageJobsParallel(
        frameJobs.map((job) => ({
          jobKey: `${job.territoryId}-${job.viewport}`,
          prompt: job.prompt,
          aspectRatio: job.aspectRatio,
        })),
      );

  trace.push(...falBatch.providerTrace);

  const resultByKey = new Map(falBatch.results.map((r) => [r.jobKey, r]));

  const territories: DesignPageAuthorityTerritoryBundle[] = territoryIds.map((territoryId) => {
    const mobileResult = resultByKey.get(`${territoryId}-mobile`)!;
    const desktopResult = resultByKey.get(`${territoryId}-desktop`)!;
    trace.push(`${territoryId} mobile ${mobileResult.jobRef}`);
    trace.push(`${territoryId} desktop ${desktopResult.jobRef}`);
    return {
      territoryId,
      territoryName: DESIGN_PAGE_V3_TERRITORY_DEFINITIONS[territoryId].name,
      mobile: mk(territoryId, 'mobile', mobileResult.url, mobileResult.jobRef),
      desktop: mk(territoryId, 'desktop', desktopResult.url, desktopResult.jobRef),
    };
  });

  return { territories, providerTrace: trace };
}
