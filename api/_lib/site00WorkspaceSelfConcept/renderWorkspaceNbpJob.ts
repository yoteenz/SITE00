import { WORKSPACE_SELF_NBP_MODEL } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/generationPlan.js';
import type {
  WorkspaceCreativeContext,
  WorkspaceGPT2AuthorityConcept,
} from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/creativePipelineTypes.js';
import type { WorkspaceConceptSlotId, WorkspaceFunctionContract } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/types.js';

export type NbpRenderInput = {
  gpt2Authority: WorkspaceGPT2AuthorityConcept;
  creativeContext: WorkspaceCreativeContext;
  renditionSlot: WorkspaceConceptSlotId;
  renditionDirective: string;
  viewport: 'MOBILE' | 'DESKTOP';
  referenceImageBase64: string;
  width: number;
  height: number;
  functionContract: WorkspaceFunctionContract;
};

export type NbpRenderResult = {
  providerJobId: string;
  imageBase64: string;
  model: string;
};

function mockPngBase64(label: string): string {
  const raw = Buffer.from(`vitest-nbp:${label}`, 'utf8');
  return raw.toString('base64');
}

function buildNbpPrompt(input: NbpRenderInput): string {
  const v = input.viewport;
  const g = input.gpt2Authority;
  const c = input.creativeContext;
  return [
    'SITE 00 DESIGN WORKSPACE — NBP visual authority render (presentation only).',
    `Viewport: ${v} (${input.width}x${input.height}).`,
    `Rendition slot: ${input.renditionSlot}.`,
    `Rendition directive: ${input.renditionDirective}`,
    `CGPT context ${c.creativeContextId}: ${c.visualDirection}`,
    `GPT2 authority ${g.conceptId}: ${g.name}`,
    `Premise: ${g.premise}`,
    `Visual language: ${g.visualLanguage}`,
    `Hierarchy: ${g.hierarchyStrategy}`,
    `Composition: ${g.compositionStrategy}`,
    v === 'MOBILE' ? `Mobile composition: ${g.mobileComposition}` : `Desktop composition: ${g.desktopComposition}`,
    `Preserved: ${g.preservedFunctions.join('; ')}`,
    `Prohibited: ${g.prohibitedChanges.join('; ')}`,
    'Interpret the SAME GPT2 authority concept — do not invent a new product idea.',
    'Preserve all functional regions from reference screenshot.',
    `Contract: ${input.functionContract.version}`,
  ].join('\n');
}

export async function renderWorkspaceNbpJob(input: NbpRenderInput): Promise<NbpRenderResult> {
  if (process.env.VITEST === 'true') {
    return {
      providerJobId: `vitest-nbp-${input.renditionSlot}-${input.viewport}`,
      imageBase64: mockPngBase64(`${input.renditionSlot}-${input.viewport}`),
      model: 'vitest-nbp',
    };
  }

  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('NBP_AUTH_FAILED: FAL_KEY not configured');

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const bytes = Buffer.from(input.referenceImageBase64, 'base64');
  const refUrl = await fal.storage.upload(new File([bytes], 'workspace-self-ref.png', { type: 'image/png' }));

  const model = WORKSPACE_SELF_NBP_MODEL;
  const prompt = buildNbpPrompt(input);

  const result = (await fal.subscribe(model, {
    input: {
      prompt,
      image_urls: [refUrl],
      num_images: 1,
    },
    logs: false,
  })) as { request_id?: string; data?: { images?: { url?: string }[] } };

  const imageUrl = result.data?.images?.[0]?.url;
  if (!imageUrl) throw new Error('NBP_JOB_FAILED: no image returned');

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`NBP_JOB_FAILED: fetch ${imgRes.status}`);
  const buf = Buffer.from(await imgRes.arrayBuffer());

  return {
    providerJobId: result.request_id ?? `fal-${Date.now()}`,
    imageBase64: buf.toString('base64'),
    model,
  };
}
