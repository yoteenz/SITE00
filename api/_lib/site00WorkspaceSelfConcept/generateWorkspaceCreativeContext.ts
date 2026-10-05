import {
  ANTHROPIC_API_URL,
  ANTHROPIC_CREATIVE_MODEL,
  isAnthropicConfigured,
} from '../site00Evolve/creativeDirection/creativeIntelligence/config.js';
import type { WorkspaceFunctionContract } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/types.js';
import type { WorkspaceCreativeContext } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/creativePipelineTypes.js';
import { WORKSPACE_SELF_CGPT_PROMPT_VERSION } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/generationPlan.js';
import { WORKSPACE_SELF_TARGET_ID } from '../../../shared/site00-design-workspace-production/designTargetModel.js';

export type CgptContextInput = {
  captureSetId: string;
  functionContract: WorkspaceFunctionContract;
  sourceRoute: string;
  hostDesignSystemVersion: string;
  workspaceArchitectureVersion: string;
  visualProblems: string[];
  opportunities: string[];
};

function vitestContext(input: CgptContextInput): WorkspaceCreativeContext {
  const now = new Date().toISOString();
  return {
    creativeContextId: `wctx-vitest-${input.captureSetId}`,
    targetId: WORKSPACE_SELF_TARGET_ID,
    captureSetId: input.captureSetId,
    functionContractId: input.functionContract.contractId,
    identityContext: 'SITE 00 host design language and founder creative appetite',
    pageOrWorkspacePurpose: 'Design workspace self-review and concept authority selection',
    requiredContent: 'Project tabs, viewport controls, pipeline readiness, concept gallery',
    functionalRequirements: input.functionContract.interactions.slice(0, 5).join('; '),
    visualProblems: input.visualProblems.join('; ') || 'Density and weak hierarchy',
    hierarchyPriorities: 'Creative-director tone; project context before technical rails',
    creativeLatitude: 'Premium editorial spatial layout within immutable function contract',
    visualDirection: input.opportunities[0] ?? 'Editorial SITE 00 chrome',
    spatialDirection: 'Breathable panels with clear compare rail',
    responsiveDirection: 'Mobile stack · Desktop split editor + concept rail',
    immutableRules: [...input.functionContract.immutableBehaviors.slice(0, 6)],
    createdAt: now,
    cgptProvider: 'vitest',
    cgptModel: 'mock-cgpt',
  };
}

function parseSingleContextJson(
  parsed: Record<string, unknown>,
  input: CgptContextInput,
  provider: string,
  model: string,
): WorkspaceCreativeContext {
  if (Array.isArray(parsed.concepts) || Array.isArray(parsed.territories) || Array.isArray(parsed.directions)) {
    throw new Error('CGPT_CONTEXT_FAILED: multi-direction response rejected');
  }
  const now = new Date().toISOString();
  return {
    creativeContextId: `wctx-${Date.now()}`,
    targetId: WORKSPACE_SELF_TARGET_ID,
    captureSetId: input.captureSetId,
    functionContractId: input.functionContract.contractId,
    identityContext: String(parsed.identityContext ?? ''),
    pageOrWorkspacePurpose: String(parsed.pageOrWorkspacePurpose ?? ''),
    requiredContent: String(parsed.requiredContent ?? ''),
    functionalRequirements: String(parsed.functionalRequirements ?? ''),
    visualProblems: String(parsed.visualProblems ?? ''),
    hierarchyPriorities: String(parsed.hierarchyPriorities ?? ''),
    creativeLatitude: String(parsed.creativeLatitude ?? ''),
    visualDirection: String(parsed.visualDirection ?? ''),
    spatialDirection: String(parsed.spatialDirection ?? ''),
    responsiveDirection: String(parsed.responsiveDirection ?? ''),
    immutableRules: Array.isArray(parsed.immutableRules) ? parsed.immutableRules.map(String) : [],
    createdAt: now,
    cgptProvider: provider,
    cgptModel: model,
  };
}

/** CGPT — exactly ONE WorkspaceCreativeContext per generation run. */
export async function generateWorkspaceCreativeContext(
  input: CgptContextInput,
): Promise<WorkspaceCreativeContext> {
  if (process.env.VITEST === 'true') {
    return vitestContext(input);
  }

  if (!isAnthropicConfigured()) {
    throw new Error('CGPT_CONTEXT_FAILED: ANTHROPIC_API_KEY not configured (CGPT adapter)');
  }

  const system = `You are CGPT — SITE 00 upstream creative-intelligence for WORKSPACE_SELF.
Return exactly ONE JSON object (not an array) as WorkspaceCreativeContext.
Synthesize brand, workspace role, function contract, content requirements, and creative latitude.
Do NOT author three concepts or A/B/C territories. One direction package only.`;

  const user = JSON.stringify({
    promptVersion: WORKSPACE_SELF_CGPT_PROMPT_VERSION,
    role: 'CGPT',
    captureSetId: input.captureSetId,
    functionContract: {
      contractId: input.functionContract.contractId,
      version: input.functionContract.version,
      immutableBehaviors: input.functionContract.immutableBehaviors,
      interactions: input.functionContract.interactions,
    },
    sourceRoute: input.sourceRoute,
    hostDesignSystemVersion: input.hostDesignSystemVersion,
    workspaceArchitectureVersion: input.workspaceArchitectureVersion,
    visualProblems: input.visualProblems,
    opportunities: input.opportunities,
    requiredFields: [
      'identityContext',
      'pageOrWorkspacePurpose',
      'requiredContent',
      'functionalRequirements',
      'visualProblems',
      'hierarchyPriorities',
      'creativeLatitude',
      'visualDirection',
      'spatialDirection',
      'responsiveDirection',
      'immutableRules',
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
      max_tokens: 4096,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  if (!res.ok) {
    throw new Error(`CGPT_CONTEXT_FAILED: ${res.status}`);
  }

  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content?.find((c) => c.type === 'text')?.text ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('CGPT_CONTEXT_FAILED: invalid JSON');

  const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  return parseSingleContextJson(parsed, input, 'anthropic', ANTHROPIC_CREATIVE_MODEL);
}
