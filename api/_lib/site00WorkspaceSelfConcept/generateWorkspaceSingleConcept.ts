import type { WorkspaceFunctionContract } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/types.js';
import type {
  WorkspaceCreativeDirection,
  WorkspaceSingleConceptBrief,
} from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/creativePipelineTypes.js';
import { WORKSPACE_SELF_GPT2_PROMPT_VERSION } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/generationPlan.js';
import { resolveTwinBenchmarkModel } from '../../../shared/site00-visual-generation/twinProviderBenchmarkCatalog.js';

export type Gpt2ConceptInput = {
  direction: WorkspaceCreativeDirection;
  functionContract: WorkspaceFunctionContract;
  sourceRoute: string;
};

function vitestConcept(input: Gpt2ConceptInput): WorkspaceSingleConceptBrief {
  const slot = input.direction.conceptSlot;
  return {
    gpt2ConceptId: `wg2-vitest-${slot}`,
    conceptId: slot,
    conceptSlot: slot,
    directionId: input.direction.directionId,
    name: `Concept ${slot.replace('CONCEPT_', '')}`,
    premise: input.direction.creativeIntent,
    visualSystem: input.direction.spatialDirection,
    layoutStrategy: 'Modular panels',
    hierarchyStrategy: input.direction.hierarchyPriority,
    panelStrategy: 'Breathable gutters between rails',
    imageDataRelationship: input.direction.imageDataBalance,
    responsiveStrategy: `${input.direction.mobileDirection} / ${input.direction.desktopDirection}`,
    mobileComposition: input.direction.mobileDirection,
    desktopComposition: input.direction.desktopDirection,
    preservedFunctions: [...input.functionContract.interactions.slice(0, 3)],
    prohibitedChanges: [...input.functionContract.immutableBehaviors.slice(0, 3)],
    gpt2Provider: 'vitest',
    gpt2Model: 'mock-gpt2-text',
  };
}

function rejectMultiConcept(parsed: unknown): asserts parsed is Record<string, unknown> {
  if (!parsed || typeof parsed !== 'object') throw new Error('GPT2_CONCEPT_FAILED: invalid JSON');
  const obj = parsed as Record<string, unknown>;
  if (Array.isArray(parsed)) throw new Error('GPT2_CONCEPT_FAILED: array response rejected');
  if (Array.isArray(obj.concepts) || Array.isArray(obj.territories)) {
    throw new Error('GPT2_CONCEPT_FAILED: multi-concept response rejected');
  }
}

/** GPT2 concept-authoring layer — exactly ONE WorkspaceSingleConceptBrief per call. */
export async function generateWorkspaceSingleConcept(
  input: Gpt2ConceptInput,
): Promise<WorkspaceSingleConceptBrief> {
  if (process.env.VITEST === 'true') {
    return vitestConcept(input);
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GPT2_CONCEPT_FAILED: OPENAI_API_KEY not configured (GPT2 text adapter)');
  }

  const gpt2ImageModel = resolveTwinBenchmarkModel('GPT2_BASELINE').model;
  const model = process.env.SITE00_WORKSPACE_SELF_GPT2_TEXT_MODEL?.trim() || 'gpt-4o-mini';

  const system = `You are GPT2 — SITE 00 concept-authoring layer for WORKSPACE_SELF.
Return exactly ONE JSON object for a single concept brief. Never return arrays of concepts.`;

  const user = JSON.stringify({
    promptVersion: WORKSPACE_SELF_GPT2_PROMPT_VERSION,
    role: 'GPT2',
    cgptDirection: input.direction,
    functionContractVersion: input.functionContract.version,
    immutableBehaviors: input.functionContract.immutableBehaviors,
    sourceRoute: input.sourceRoute,
    gpt2VisualModelReference: gpt2ImageModel,
    outputFields: [
      'name',
      'premise',
      'visualSystem',
      'layoutStrategy',
      'hierarchyStrategy',
      'panelStrategy',
      'imageDataRelationship',
      'responsiveStrategy',
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
    throw new Error(`GPT2_CONCEPT_FAILED: ${res.status}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content ?? '';
  const parsed = JSON.parse(content) as unknown;
  rejectMultiConcept(parsed);

  const slot = input.direction.conceptSlot;
  return {
    gpt2ConceptId: `wg2-${Date.now()}-${slot}`,
    conceptId: slot,
    conceptSlot: slot,
    directionId: input.direction.directionId,
    name: String(parsed.name ?? `Concept ${slot}`),
    premise: String(parsed.premise ?? ''),
    visualSystem: String(parsed.visualSystem ?? ''),
    layoutStrategy: String(parsed.layoutStrategy ?? ''),
    hierarchyStrategy: String(parsed.hierarchyStrategy ?? ''),
    panelStrategy: String(parsed.panelStrategy ?? ''),
    imageDataRelationship: String(parsed.imageDataRelationship ?? ''),
    responsiveStrategy: String(parsed.responsiveStrategy ?? ''),
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
  };
}
