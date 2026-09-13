import { buildFalImageInput } from '../../../site00-visual-generation/falImageModels.js';
import { TWIN_V2_VISUAL_PROVIDER, TWIN_V2_VISUAL_PROVIDER_LABEL } from '../p0vrTwinV21/constants.js';
import { DESIGN_PAGE_V3_R3_TERRITORY_PROTOTYPES } from './constants.js';
import { buildTerritoryDesignPageAuthorityPrompt } from './buildDesignPageAuthorityTerritoryPrompts.js';
import { DESIGN_PAGE_V3_TERRITORY_DEFINITIONS, type DesignPageV3TerritoryId } from './hostProjectExpressionModel.js';
import type { DesignPageAuthorityTerritoryBundle, DesignPageAuthorityVisualArtifact } from './types.js';

async function falOne(
  prompt: string,
  aspectRatio: '9:16' | '16:9',
  label: string,
): Promise<{ url: string; jobRef: string }> {
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

export async function dispatchDesignPageAuthorityTerritoryVisuals(input: {
  authoritySessionId: string;
  clientProjectId: string;
  refineNotes?: string[];
}): Promise<DesignPageAuthorityTerritoryVisualDispatch> {
  const trace = ['DESIGN_PAGE_V3R3: host shell + NDXBOOK atmosphere · territories A/B/C'];
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

  const territories: DesignPageAuthorityTerritoryBundle[] = [];

  for (const territoryId of territoryIds) {
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

    const mobileJob =
      process.env.VITEST === 'true' ?
        { url: mobileLabel, jobRef: `vitest-${territoryId}-mobile-${ts}` }
      : await falOne(mobilePrompt, '9:16', mobileLabel);
    trace.push(`${territoryId} mobile ${mobileJob.jobRef}`);

    const desktopJob =
      process.env.VITEST === 'true' ?
        { url: desktopLabel, jobRef: `vitest-${territoryId}-desktop-${ts}` }
      : await falOne(desktopPrompt, '16:9', desktopLabel);
    trace.push(`${territoryId} desktop ${desktopJob.jobRef}`);

    territories.push({
      territoryId,
      territoryName: DESIGN_PAGE_V3_TERRITORY_DEFINITIONS[territoryId].name,
      mobile: mk(territoryId, 'mobile', mobileJob.url, mobileJob.jobRef),
      desktop: mk(territoryId, 'desktop', desktopJob.url, desktopJob.jobRef),
    });
  }

  return { territories, providerTrace: trace };
}
