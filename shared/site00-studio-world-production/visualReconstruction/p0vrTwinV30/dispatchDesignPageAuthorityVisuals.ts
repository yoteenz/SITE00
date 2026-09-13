import { buildFalImageInput } from '../../../site00-visual-generation/falImageModels.js';
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

async function falOne(prompt: string, aspectRatio: '9:16' | '16:9', label: string): Promise<{ url: string; jobRef: string }> {
  if (process.env.VITEST === 'true') {
    const ts = Date.now();
    const file = label === 'mobile' ? DESIGN_PAGE_V3_R2_PROTOTYPE_MOBILE : DESIGN_PAGE_V3_R2_PROTOTYPE_DESKTOP;
    return { url: `${file}?v=r2-${ts}`, jobRef: `vitest-design-page-v3r2-${label}-${ts}` };
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
    `fal-design-v3-${label}-${Date.now()}`;
  const url =
    (result.data as { images?: { url?: string }[] })?.images?.[0]?.url ??
    (result.data as { image?: { url?: string } })?.image?.url;
  if (!url) throw new Error(`FAL design page authority ${label} missing url`);
  return { url, jobRef: String(jobRef) };
}

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
  const [mobileJob, desktopJob] = await Promise.all([
    falOne(mobilePrompt, '9:16', 'mobile'),
    falOne(desktopPrompt, '16:9', 'desktop'),
  ]);
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
