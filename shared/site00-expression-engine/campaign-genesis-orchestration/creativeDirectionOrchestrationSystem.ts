/**
 * P0.CGO.1 — Creative Direction Orchestration System.
 */

import type {
  CampaignContentSequenceItem,
  CampaignExecutionBible,
  CampaignShotFamily,
  CampaignShotRole,
  CampaignWorldBible,
  CompiledProductionDirection,
} from './types.js';
import { compileProductionDirection } from './creativeDirectionPromptCompiler.js';
import { buildCreativeTaskGraph, resolveNextBestAction } from './creativeCampaignProjectManager.js';
import { planShotDiversity, detectShotRepetitionDrift } from './shotDiversityPlanner.js';
import { buildMotifPropagationMap } from './motifPropagationMap.js';
import { scoreLocationStoryPotential } from './locationStoryPotential.js';
import { buildCampaignCoverageMatrix } from './campaignCoverageMatrix.js';

const DEFAULT_SHOT_ROLES: Array<{ role: CampaignShotFamily; purpose: string; beat: string; req: CampaignShotRole['requirement'] }> = [
  { role: 'WORLD', purpose: 'Establish campaign environment', beat: 'SET THE WORLD', req: 'REQUIRED' },
  { role: 'CLUE', purpose: 'Introduce world without full product reveal', beat: 'INTRODUCE CLUE', req: 'REQUIRED' },
  { role: 'DETAIL', purpose: 'Motif or texture detail', beat: 'MOTIF DETAIL', req: 'REQUIRED' },
  { role: 'HANDS', purpose: 'Human interaction surface', beat: 'HANDS IN WORLD', req: 'REQUIRED' },
  { role: 'INTERACTION', purpose: 'Active behavior with environment/props', beat: 'BEHAVIOR', req: 'REQUIRED' },
  { role: 'REVEAL', purpose: 'Product more visible — world still active', beat: 'REVEAL', req: 'REQUIRED' },
  { role: 'PAYOFF', purpose: 'Fuller presence — keep behavior', beat: 'PAYOFF', req: 'REQUIRED' },
  { role: 'BEHIND_THE_SCENES', purpose: 'Production authenticity', beat: 'BTS', req: 'OPTIONAL' },
  { role: 'OUTTAKE', purpose: 'Wild card human moment', beat: 'OUTTAKE', req: 'EXPERIMENTAL' },
];

export class CreativeDirectionOrchestrationSystem {
  deriveExecutionBible(world: CampaignWorldBible): CampaignExecutionBible {
    return {
      executionBibleId: `exec-${world.worldId}`,
      worldId: world.worldId,
      conceptThesis: world.conceptThesis,
      worldRules: [
        `Setting ${world.setting} is story engine`,
        `Association chain: ${world.associationChain.connectiveLogic}`,
        ...world.nonNegotiables,
      ],
      visualGrammar: [
        'Mix wide establishing + detail macro',
        'Behavior before beauty portrait',
        world.graphicLanguage,
      ],
      environmentRules: [
        'Environment dominates clue frames',
        'Location enables action — not backdrop only',
      ],
      productIntegrationRules: [world.productRole, 'Progressive reveal — not immediate hero centering'],
      humanExpressionRules: [
        world.hairDirection,
        world.nailDirection,
        world.makeupDirection,
        world.wardrobeDirection,
      ].filter(Boolean),
      motifRules: world.motifs.map((m) => `Motif "${m}" — repeat with variation`),
      stylingRules: [world.stylingDirection],
      propRules: world.propSystem.map((p) => `Prop: ${p}`),
      shotFamilies: DEFAULT_SHOT_ROLES.map((s) => s.role),
      sequenceRules: world.sequenceGrammar,
      motionGrammar: [world.motionLogic],
      copyRules: [world.copyBehavior, `Title language: ${world.campaignTitleLanguage}`],
      channelRules: [
        'Feed: visual clue',
        'Story: BTS or progressive reveal',
        'Reel: narrative motion',
        'Email: payoff copy',
      ],
      continuityRules: ['Same location family', 'Motif continuity', 'Casting continuity'],
      requiredSurprises: [
        'Brand mark on environmental object',
        'Motif transfers into nail/styling detail',
        'Product discovered through gesture',
      ],
      antiGenericRules: world.avoidances,
      nonNegotiables: world.nonNegotiables,
      qaThresholds: { conceptFidelityMin: 0.72, visualQualityMin: 0.85 },
    };
  }

  buildShotSystem(world: CampaignWorldBible, _execution: CampaignExecutionBible): CampaignShotRole[] {
    return DEFAULT_SHOT_ROLES.map((s, i) => ({
      shotId: `shot-${s.role.toLowerCase()}-${i + 1}`,
      role: s.role,
      purpose: s.purpose,
      narrativeBeat: s.beat,
      productProminence: s.role === 'CLUE' || s.role === 'WORLD' ? 'LOW' : s.role === 'PAYOFF' ? 'HIGH' : 'MEDIUM',
      humanProminence: s.role === 'HANDS' ? 'MEDIUM' : s.role === 'PAYOFF' ? 'HIGH' : 'LOW',
      environmentProminence: s.role === 'WORLD' || s.role === 'CLUE' ? 'HIGH' : 'MEDIUM',
      motifsRequired: world.motifs.slice(0, s.role === 'DETAIL' ? 2 : 1),
      motifsOptional: world.motifs.slice(1),
      cameraDistance: s.role === 'WORLD' ? 'WIDE' : s.role === 'DETAIL' || s.role === 'HANDS' ? 'MACRO' : 'MEDIUM',
      cameraBehavior: s.role === 'MOTION' || s.role === 'INTERACTION' ? 'Follow action' : 'Observational',
      compositionRule:
        s.role === 'CLUE'
          ? 'Environment dominates — product off-center or partial'
          : 'Rule of thirds — behavior anchor',
      behaviorRule: s.role === 'CLUE' ? 'Active interaction — not posing' : 'Maintain world behavior',
      avoidances:
        s.role === 'CLUE'
          ? ['Center product', 'Hero product ad framing', 'Static model pose']
          : ['Generic editorial pose', 'Studio sterility'],
      sequencePosition: i + 1,
      requirement: s.req,
    }));
  }

  buildContentSequence(shots: CampaignShotRole[]): CampaignContentSequenceItem[] {
    const channels = ['INSTAGRAM_FEED', 'STORY', 'REEL', 'EMAIL'];
    return shots.map((shot, i) => ({
      sequenceIndex: i + 1,
      channel: channels[i % channels.length] ?? 'INSTAGRAM_FEED',
      shotRole: shot.role,
      storyBeat: shot.narrativeBeat,
      assetType: shot.role === 'MOTION' || shot.role === 'INTERACTION' ? 'VIDEO' : 'IMAGE',
      copyRole: shot.role === 'PAYOFF' ? 'PAYOFF COPY' : shot.role === 'CLUE' ? 'NONE' : 'OPTIONAL',
      revealLevel: shot.role === 'CLUE' ? 'PARTIAL' : shot.role === 'PAYOFF' ? 'FULL' : 'NONE',
      dependency: i > 0 ? shots[i - 1]?.shotId ?? null : null,
      continuityNotes: `Motifs: ${shot.motifsRequired.join(', ')}`,
    }));
  }

  orchestrate(world: CampaignWorldBible) {
    const execution = this.deriveExecutionBible(world);
    const shots = this.buildShotSystem(world, execution);
    const sequence = this.buildContentSequence(shots);
    const tasks = buildCreativeTaskGraph(world, shots);
    const nextAction = resolveNextBestAction(tasks, world.approvalStage);
    const diversity = planShotDiversity(shots);
    const motifs = world.motifs.map((m) => buildMotifPropagationMap(m, world));
    const location = scoreLocationStoryPotential(world.setting);
    const coverage = buildCampaignCoverageMatrix(shots);

    return {
      execution,
      shots,
      sequence,
      tasks,
      nextAction,
      diversity,
      motifs,
      location,
      coverage,
    };
  }

  compilePrompt(world: CampaignWorldBible, execution: CampaignExecutionBible, shot: CampaignShotRole): CompiledProductionDirection {
    return compileProductionDirection({ world, execution, shot });
  }

  checkShotRepetition(shots: CampaignShotRole[]): string[] {
    return detectShotRepetitionDrift(shots);
  }
}

export const creativeDirectionOrchestrationSystem = new CreativeDirectionOrchestrationSystem();
