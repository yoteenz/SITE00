import {
  ANTHROPIC_API_URL,
  ANTHROPIC_CREATIVE_MODEL,
  isAnthropicConfigured,
} from '../site00Evolve/creativeDirection/creativeIntelligence/config.js';
import type { WorkspaceFunctionContract } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/types.js';
import type {
  WorkspaceConceptSlotId,
  WorkspaceCreativeDirection,
  WorkspaceDiversityLedgerEntry,
} from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/creativePipelineTypes.js';
import { WORKSPACE_SELF_CGPT_PROMPT_VERSION } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/generationPlan.js';

export type CgptDirectionInput = {
  conceptSlot: WorkspaceConceptSlotId;
  functionContract: WorkspaceFunctionContract;
  sourceRoute: string;
  hostDesignSystemVersion: string;
  workspaceArchitectureVersion: string;
  visualProblems: string[];
  opportunities: string[];
  diversityLedger: readonly WorkspaceDiversityLedgerEntry[];
};

function vitestDirection(input: CgptDirectionInput): WorkspaceCreativeDirection {
  return {
    directionId: `wdir-vitest-${input.conceptSlot}`,
    conceptSlot: input.conceptSlot,
    creativeIntent: `Independent intent for ${input.conceptSlot}`,
    designProblem: input.visualProblems[0] ?? 'Density',
    opportunity: input.opportunities[0] ?? 'Clarity',
    hierarchyPriority: 'Project context before pipeline',
    spatialDirection: `Spatial ${input.conceptSlot}`,
    informationDensityDirection: 'Reduce competing rails',
    imageDataBalance: 'Hero visual over data tables',
    mobileDirection: 'Stack with sticky module nav',
    desktopDirection: 'Split editor + concept rail',
    immutableFunctionContractId: input.functionContract.contractId,
    cgptProvider: 'vitest',
    cgptModel: 'mock-cgpt',
  };
}

function parseSingleDirectionJson(
  parsed: Record<string, unknown>,
  input: CgptDirectionInput,
  provider: string,
  model: string,
): WorkspaceCreativeDirection {
  if (Array.isArray(parsed.concepts) || Array.isArray(parsed.territories)) {
    throw new Error('CGPT_DIRECTION_FAILED: multi-concept response rejected');
  }
  const directionId = `wdir-${Date.now()}-${input.conceptSlot}`;
  return {
    directionId,
    conceptSlot: input.conceptSlot,
    creativeIntent: String(parsed.creativeIntent ?? ''),
    designProblem: String(parsed.designProblem ?? ''),
    opportunity: String(parsed.opportunity ?? ''),
    hierarchyPriority: String(parsed.hierarchyPriority ?? ''),
    spatialDirection: String(parsed.spatialDirection ?? ''),
    informationDensityDirection: String(parsed.informationDensityDirection ?? ''),
    imageDataBalance: String(parsed.imageDataBalance ?? ''),
    mobileDirection: String(parsed.mobileDirection ?? ''),
    desktopDirection: String(parsed.desktopDirection ?? ''),
    immutableFunctionContractId: input.functionContract.contractId,
    cgptProvider: provider,
    cgptModel: model,
  };
}

/** CGPT layer — exactly ONE WorkspaceCreativeDirection per call. */
export async function generateWorkspaceCreativeDirection(
  input: CgptDirectionInput,
): Promise<WorkspaceCreativeDirection> {
  if (process.env.VITEST === 'true') {
    return vitestDirection(input);
  }

  if (!isAnthropicConfigured()) {
    throw new Error('CGPT_DIRECTION_FAILED: ANTHROPIC_API_KEY not configured (CGPT adapter)');
  }

  const system = `You are CGPT — SITE 00 upstream creative-context intelligence for WORKSPACE_SELF.
Return exactly ONE JSON object (not an array) describing creative contextual direction for concept slot ${input.conceptSlot}.
Do NOT author the final rendered concept. Do NOT return multiple concepts or territories.
${input.diversityLedger.length ? 'Create a materially different creative direction from prior slots in the diversity ledger.' : ''}`;

  const user = JSON.stringify({
    promptVersion: WORKSPACE_SELF_CGPT_PROMPT_VERSION,
    role: 'CGPT',
    conceptSlot: input.conceptSlot,
    diversityLedger: input.diversityLedger,
    functionContract: {
      contractId: input.functionContract.contractId,
      version: input.functionContract.version,
      immutableBehaviors: input.functionContract.immutableBehaviors,
    },
    sourceRoute: input.sourceRoute,
    hostDesignSystemVersion: input.hostDesignSystemVersion,
    workspaceArchitectureVersion: input.workspaceArchitectureVersion,
    visualProblems: input.visualProblems,
    opportunities: input.opportunities,
    requiredFields: [
      'creativeIntent',
      'designProblem',
      'opportunity',
      'hierarchyPriority',
      'spatialDirection',
      'informationDensityDirection',
      'imageDataBalance',
      'mobileDirection',
      'desktopDirection',
    ],
  });

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!.trim(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_CREATIVE_MODEL,
      max_tokens: 2048,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  if (!res.ok) {
    throw new Error(`CGPT_DIRECTION_FAILED: ${res.status}`);
  }

  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content?.find((c) => c.type === 'text')?.text ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('CGPT_DIRECTION_FAILED: invalid JSON');

  const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  return parseSingleDirectionJson(parsed, input, 'anthropic', ANTHROPIC_CREATIVE_MODEL);
}
