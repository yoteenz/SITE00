import type { WorkspaceFunctionContract } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/types.js';
import type {
  WorkspaceCreativeContext,
  WorkspaceGPT2AuthorityConcept,
} from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/creativePipelineTypes.js';
import { WORKSPACE_SELF_GPT2_PROMPT_VERSION } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/generationPlan.js';
import { resolveTwinBenchmarkModel } from '../../../shared/site00-visual-generation/twinProviderBenchmarkCatalog.js';

export type Gpt2AuthorityInput = {
  creativeContext: WorkspaceCreativeContext;
  functionContract: WorkspaceFunctionContract;
  sourceRoute: string;
};

function vitestAuthority(input: Gpt2AuthorityInput): WorkspaceGPT2AuthorityConcept {
  const ctx = input.creativeContext;
  const now = new Date().toISOString();
  const conceptId = `wg2-vitest-${ctx.creativeContextId}`;
  return {
    conceptId,
    creativeContextId: ctx.creativeContextId,
    targetId: ctx.targetId,
    name: 'Unified workspace authority',
    premise: ctx.visualDirection,
    compositionStrategy: ctx.spatialDirection,
    hierarchyStrategy: ctx.hierarchyPriorities,
    interactionPresentation: 'Controls recessed; creative compare dominant',
    visualLanguage: ctx.identityContext.slice(0, 120),
    responsiveIntent: ctx.responsiveDirection,
    authorityImage: `data:image/png;base64,${Buffer.from('vitest-gpt2-authority', 'utf8').toString('base64')}`,
    layoutStrategy: 'Modular editorial panels',
    mobileComposition: 'Stack with sticky module nav',
    desktopComposition: 'Split editor + concept rail',
    preservedFunctions: [...input.functionContract.interactions.slice(0, 3)],
    prohibitedChanges: [...input.functionContract.immutableBehaviors.slice(0, 3)],
    gpt2Provider: 'vitest',
    gpt2Model: 'mock-gpt2-text',
    createdAt: now,
  };
}

function rejectMultiConcept(parsed: unknown): asserts parsed is Record<string, unknown> {
  if (!parsed || typeof parsed !== 'object') throw new Error('GPT2_AUTHORITY_FAILED: invalid JSON');
  const obj = parsed as Record<string, unknown>;
  if (Array.isArray(parsed)) throw new Error('GPT2_AUTHORITY_FAILED: array response rejected');
  if (Array.isArray(obj.concepts) || Array.isArray(obj.territories)) {
    throw new Error('GPT2_AUTHORITY_FAILED: multi-concept response rejected');
  }
}

/** GPT2 — exactly ONE authority concept per generation run. */
export async function generateWorkspaceGpt2AuthorityConcept(
  input: Gpt2AuthorityInput,
): Promise<WorkspaceGPT2AuthorityConcept> {
  if (process.env.VITEST === 'true') {
    return vitestAuthority(input);
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GPT2_AUTHORITY_FAILED: OPENAI_API_KEY not configured (GPT2 text adapter)');
  }

  const gpt2ImageModel = resolveTwinBenchmarkModel('GPT2_BASELINE').model;
  const model = process.env.SITE00_WORKSPACE_SELF_GPT2_TEXT_MODEL?.trim() || 'gpt-4o-mini';

  const system = `You are GPT2 — SITE 00 concept authority for WORKSPACE_SELF.
Given ONE CGPT creative context, return exactly ONE JSON object describing ONE coherent visual authority.
Never return arrays of concepts, territories, or options.`;

  const user = JSON.stringify({
    promptVersion: WORKSPACE_SELF_GPT2_PROMPT_VERSION,
    role: 'GPT2',
    creativeContext: input.creativeContext,
    functionContractVersion: input.functionContract.version,
    immutableBehaviors: input.functionContract.immutableBehaviors,
    sourceRoute: input.sourceRoute,
    gpt2VisualModelReference: gpt2ImageModel,
    outputFields: [
      'name',
      'premise',
      'compositionStrategy',
      'hierarchyStrategy',
      'interactionPresentation',
      'visualLanguage',
      'responsiveIntent',
      'layoutStrategy',
      'mobileComposition',
      'desktopComposition',
      'preservedFunctions',
      'prohibitedChanges',
    ],
  });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`GPT2_AUTHORITY_FAILED: ${res.status}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content ?? '';
  const parsed = JSON.parse(content) as unknown;
  rejectMultiConcept(parsed);

  const ctx = input.creativeContext;
  const now = new Date().toISOString();
  return {
    conceptId: `wg2-${Date.now()}`,
    creativeContextId: ctx.creativeContextId,
    targetId: ctx.targetId,
    name: String(parsed.name ?? 'Workspace authority'),
    premise: String(parsed.premise ?? ''),
    compositionStrategy: String(parsed.compositionStrategy ?? ''),
    hierarchyStrategy: String(parsed.hierarchyStrategy ?? ''),
    interactionPresentation: String(parsed.interactionPresentation ?? ''),
    visualLanguage: String(parsed.visualLanguage ?? ''),
    responsiveIntent: String(parsed.responsiveIntent ?? ''),
    authorityImage: null,
    layoutStrategy: String(parsed.layoutStrategy ?? ''),
    mobileComposition: String(parsed.mobileComposition ?? ''),
    desktopComposition: String(parsed.desktopComposition ?? ''),
    preservedFunctions: Array.isArray(parsed.preservedFunctions) ?
      parsed.preservedFunctions.map(String)
    : [],
    prohibitedChanges: Array.isArray(parsed.prohibitedChanges) ?
      parsed.prohibitedChanges.map(String)
    : [],
    gpt2Provider: 'openai',
    gpt2Model: model,
    createdAt: now,
  };
}
