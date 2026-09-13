import { buildFalImageInput } from '../../../site00-visual-generation/falImageModels.js';
import { TWIN_V2_VISUAL_PROVIDER, TWIN_V2_VISUAL_PROVIDER_LABEL } from '../p0vrTwinV21/constants.js';
import { DESIGN_PAGE_V3_R3_TERRITORY_PROTOTYPES } from './constants.js';
import { buildTerritoryDesignPageAuthorityPrompt } from './buildDesignPageAuthorityTerritoryPrompts.js';
import { DESIGN_PAGE_V3_TERRITORY_DEFINITIONS, type DesignPageV3TerritoryId } from './hostProjectExpressionModel.js';
import type { DesignPageAuthorityTerritoryBundle, DesignPageAuthorityVisualArtifact } from './types.js';

type FalJobResult = { url: string; jobRef: string };

async function falOne(
  prompt: string,
  aspectRatio: '9:16' | '16:9',
  label: string,
): Promise<FalJobResult> {
  if (process.env.VITEST === 'true') {
    const ts = Date.now();
    return { url: `${label}?v=r3-${ts}`, jobRef: `vitest-design-page-v3r3-${label}-${ts}` };
  }
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY_MISSING');
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const input = buildFalImageInput({ prompt, aspectRatio });
  const result = await fal.subscribe(input.model, { input: input.input });
  const jobRef =
    (result as { requestId?: string }).requestId ??
    (result as { request_id?: string }).request_id ??
    `fal-design-v3r3-${label}-${Date.now()}`;
  const url =
    (result.data as { images?: { url?: string }[] })?.images?.[0]?.url ??
    (result.data as { image?: { url?: string } })?.image?.url;
  if (!url) throw new Error(`FAL design page authority ${label} missing url`);
  return { url, jobRef: String(jobRef) };
}

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

  const frameResults = await Promise.all(
    frameJobs.map(async (job) => {
      const falResult =
        process.env.VITEST === 'true' ?
          {
            url: job.storageLabel,
            jobRef: `vitest-${job.territoryId}-${job.viewport}-${ts}`,
          }
        : await falOne(job.prompt, job.aspectRatio, job.storageLabel);
      return { job, falResult };
    }),
  );

  for (const { job, falResult } of frameResults) {
    trace.push(`${job.territoryId} ${job.viewport} ${falResult.jobRef}`);
  }

  const territories: DesignPageAuthorityTerritoryBundle[] = territoryIds.map((territoryId) => {
    const mobileResult = frameResults.find((r) => r.job.territoryId === territoryId && r.job.viewport === 'mobile')!;
    const desktopResult = frameResults.find((r) => r.job.territoryId === territoryId && r.job.viewport === 'desktop')!;
    return {
      territoryId,
      territoryName: DESIGN_PAGE_V3_TERRITORY_DEFINITIONS[territoryId].name,
      mobile: mk(territoryId, 'mobile', mobileResult.falResult.url, mobileResult.falResult.jobRef),
      desktop: mk(territoryId, 'desktop', desktopResult.falResult.url, desktopResult.falResult.jobRef),
    };
  });

  return { territories, providerTrace: trace };
}
