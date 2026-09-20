import {
  ANTHROPIC_API_URL,
  ANTHROPIC_CREATIVE_MODEL,
  isAnthropicConfigured,
} from '../site00Evolve/creativeDirection/creativeIntelligence/config.js';
import type { WorkspaceFunctionContract } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/types.js';
import type { WorkspaceSelfTerritoryBrief } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/generationTypes.js';
import { WORKSPACE_CONCEPT_SLOT_IDS } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/constants.js';
import { WORKSPACE_SELF_CREATIVE_PROMPT_VERSION } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/generationPlan.js';

export type WorkspaceCreativeContext = {
  functionContract: WorkspaceFunctionContract;
  sourceRoute: string;
  hostDesignSystemVersion: string;
  workspaceArchitectureVersion: string;
  visualProblems: string[];
  opportunities: string[];
};

function vitestTerritories(): WorkspaceSelfTerritoryBrief[] {
  return WORKSPACE_CONCEPT_SLOT_IDS.map((slot, i) => ({
    territoryId: `wst-vitest-${slot}`,
    conceptSlotId: slot,
    name: `Territory ${String.fromCharCode(65 + i)}`,
    premise: `Distinct workspace concept ${slot}`,
    spatialPhilosophy: 'Calmer vertical rhythm with decisive hero band',
    hierarchyStrategy: 'Project context first, pipeline second, gallery third',
    layoutStrategy: 'Modular panels with breathable gutters',
    imageDataBalance: 'Visual dominance in hero; data in structured rail',
    mobileStrategy: 'Single-column stack with sticky module nav',
    desktopStrategy: 'Split authority editor with persistent concept rail',
    visualDirection: 'SITE 00 host language — editorial, not SaaS dashboard',
  }));
}

export async function generateWorkspaceSelfTerritories(
  ctx: WorkspaceCreativeContext,
): Promise<{ territories: WorkspaceSelfTerritoryBrief[]; provider: string; model: string }> {
  if (process.env.VITEST === 'true') {
    return { territories: vitestTerritories(), provider: 'vitest', model: 'mock-cgpt' };
  }

  if (!isAnthropicConfigured()) {
    throw new Error('CREATIVE_BRIEF_FAILED: ANTHROPIC_API_KEY not configured');
  }

  const system = `You are CGPT/GPT2 creative conceptualization for SITE 00 DESIGN WORKSPACE_SELF.
Return exactly 3 distinct concept territories as JSON array. Each must preserve immutable function contract behaviors.
Do not propose route/logic/state changes. Focus hierarchy, layout, responsive strategy, visual direction.`;

  const user = JSON.stringify({
    promptVersion: WORKSPACE_SELF_CREATIVE_PROMPT_VERSION,
    targetType: 'WORKSPACE_SELF',
    functionContract: {
      version: ctx.functionContract.version,
      regions: ctx.functionContract.regions,
      immutableBehaviors: ctx.functionContract.immutableBehaviors,
    },
    sourceRoute: ctx.sourceRoute,
    hostDesignSystemVersion: ctx.hostDesignSystemVersion,
    workspaceArchitectureVersion: ctx.workspaceArchitectureVersion,
    visualProblems: ctx.visualProblems,
    opportunities: ctx.opportunities,
    requiredSlots: WORKSPACE_CONCEPT_SLOT_IDS,
    outputFields: [
      'name',
      'premise',
      'spatialPhilosophy',
      'hierarchyStrategy',
      'layoutStrategy',
      'imageDataBalance',
      'mobileStrategy',
      'desktopStrategy',
      'visualDirection',
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
    const text = await res.text();
    throw new Error(`CREATIVE_BRIEF_FAILED: ${res.status} ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content?.find((c) => c.type === 'text')?.text ?? '';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('CREATIVE_BRIEF_FAILED: invalid model JSON');

  const parsed = JSON.parse(jsonMatch[0]) as Record<string, string>[];
  if (parsed.length !== 3) throw new Error('CREATIVE_BRIEF_FAILED: expected 3 territories');

  const territories: WorkspaceSelfTerritoryBrief[] = WORKSPACE_CONCEPT_SLOT_IDS.map((slot, i) => {
    const row = parsed[i] ?? {};
    return {
      territoryId: `wst-${Date.now()}-${slot}`,
      conceptSlotId: slot,
      name: row.name ?? `Concept ${slot}`,
      premise: row.premise ?? row.premise ?? '',
      spatialPhilosophy: row.spatialPhilosophy ?? '',
      hierarchyStrategy: row.hierarchyStrategy ?? '',
      layoutStrategy: row.layoutStrategy ?? '',
      imageDataBalance: row.imageDataBalance ?? '',
      mobileStrategy: row.mobileStrategy ?? '',
      desktopStrategy: row.desktopStrategy ?? '',
      visualDirection: row.visualDirection ?? '',
    };
  });

  return { territories, provider: 'anthropic', model: ANTHROPIC_CREATIVE_MODEL };
}
