/**
 * P0.CGO.1 — Creative direction prompt compiler (NOT generic "beautiful woman" prompts).
 */

import type {
  CampaignExecutionBible,
  CampaignShotRole,
  CampaignWorldBible,
  CompiledProductionDirection,
} from './types.js';

export function compileProductionDirection(input: {
  world: CampaignWorldBible;
  execution: CampaignExecutionBible;
  shot: CampaignShotRole;
}): CompiledProductionDirection {
  const { world, execution, shot } = input;

  const promptSummary = [
    `CAMPAIGN WORLD: ${world.conceptThesis}`,
    `SETTING: ${world.setting}`,
    `SHOT ROLE: ${shot.role} — ${shot.purpose}`,
    `NARRATIVE BEAT: ${shot.narrativeBeat}`,
    `BEHAVIOR: ${shot.behaviorRule}`,
    `CAMERA: ${shot.cameraDistance} — ${shot.cameraBehavior}`,
    `COMPOSITION: ${shot.compositionRule}`,
    `MOTIFS: ${shot.motifsRequired.join(', ')}`,
    `PRODUCT PROMINENCE: ${shot.productProminence}`,
    `HUMAN: ${world.hairDirection}; ${world.nailDirection}`,
    `DO NOT: ${shot.avoidances.join('; ')}`,
  ].join('\n');

  return {
    promptSummary,
    shotRole: shot.role,
    worldRules: execution.worldRules,
    humanExpression: execution.humanExpressionRules,
    productRole: world.productRole,
    motifs: shot.motifsRequired,
    cameraBehavior: shot.cameraBehavior,
    composition: shot.compositionRule,
    antiGenericRules: execution.antiGenericRules,
    doNot: shot.avoidances,
  };
}
