import { WORKSPACE_SELF_NBP_MODEL } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/generationPlan.js';
import type {
  WorkspaceCreativeDirection,
  WorkspaceSingleConceptBrief,
} from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/creativePipelineTypes.js';
import type { WorkspaceFunctionContract } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/types.js';

export type NbpRenderInput = {
  concept: WorkspaceSingleConceptBrief;
  direction: WorkspaceCreativeDirection;
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
  const c = input.concept;
  const d = input.direction;
  return [
    'SITE 00 DESIGN WORKSPACE — NBP visual authority render (presentation only).',
    `Viewport: ${v} (${input.width}x${input.height}).`,
    `CGPT direction ${d.directionId}: ${d.creativeIntent}`,
    `GPT2 concept ${c.gpt2ConceptId}: ${c.name}`,
    `Premise: ${c.premise}`,
    `Visual system: ${c.visualSystem}`,
    `Hierarchy: ${c.hierarchyStrategy}`,
    `Layout: ${c.layoutStrategy}`,
    v === 'MOBILE' ? `Mobile composition: ${c.mobileComposition}` : `Desktop composition: ${c.desktopComposition}`,
    `Preserved: ${c.preservedFunctions.join('; ')}`,
    `Prohibited: ${c.prohibitedChanges.join('; ')}`,
    'Preserve all functional regions from reference screenshot.',
    `Contract: ${input.functionContract.version}`,
  ].join('\n');
}

export async function renderWorkspaceNbpJob(input: NbpRenderInput): Promise<NbpRenderResult> {
  if (process.env.VITEST === 'true') {
    return {
      providerJobId: `vitest-nbp-${input.concept.conceptSlot}-${input.viewport}`,
      imageBase64: mockPngBase64(`${input.concept.conceptSlot}-${input.viewport}`),
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
  if (!imageUrl) throw new Error('NBP_JOB_FAILED: empty image response');

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error('NBP_JOB_FAILED: could not download image');
  const buf = Buffer.from(await imgRes.arrayBuffer());

  return {
    providerJobId: result.request_id ?? `nbp-${Date.now()}`,
    imageBase64: buf.toString('base64'),
    model,
  };
}
