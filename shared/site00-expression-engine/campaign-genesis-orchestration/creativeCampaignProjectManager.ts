/**
 * P0.CGO.1 — Creative campaign project manager + next best action.
 */

import type {
  CampaignShotRole,
  CampaignWorldBible,
  CreativeNextBestAction,
  CreativeTaskNode,
  CreativeTaskType,
  DirectorWizardStep,
  FounderApprovalStage,
} from './types.js';

export function buildCreativeTaskGraph(
  world: CampaignWorldBible,
  shots: CampaignShotRole[],
): CreativeTaskNode[] {
  const tasks: CreativeTaskNode[] = [
    { taskId: 't-world', taskType: 'WORLD_APPROVAL', label: 'Approve campaign world', status: world.approvedAt ? 'APPROVED' : 'PENDING', dependsOn: [] },
    { taskId: 't-location', taskType: 'LOCATION', label: `Select location: ${world.setting}`, status: 'PENDING', dependsOn: ['t-world'] },
    { taskId: 't-props', taskType: 'PROP_SYSTEM', label: 'Approve prop system', status: 'PENDING', dependsOn: ['t-world'] },
    { taskId: 't-motifs', taskType: 'PROP_SYSTEM', label: 'Approve motif system', status: 'PENDING', dependsOn: ['t-world'] },
    { taskId: 't-nails', taskType: 'NAILS', label: 'Review nail direction', status: 'PENDING', dependsOn: ['t-motifs'] },
    { taskId: 't-hair', taskType: 'HAIR', label: 'Review hair direction', status: 'PENDING', dependsOn: ['t-world'] },
    { taskId: 't-shots', taskType: 'SHOT_LIST', label: 'Approve shot list', status: 'PENDING', dependsOn: ['t-location', 't-props', 't-motifs'] },
    { taskId: 't-sequence', taskType: 'SEQUENCE', label: 'Approve content sequence', status: 'PENDING', dependsOn: ['t-shots'] },
    { taskId: 't-qa', taskType: 'QA', label: 'Concept fidelity QA', status: 'PENDING', dependsOn: ['t-shots'] },
  ];

  if (shots.length > 0) {
    tasks.push({
      taskId: 't-keyframe-clue',
      taskType: 'KEYFRAME',
      label: `Review ${shots.find((s) => s.role === 'CLUE')?.role ?? 'CLUE'} shot direction`,
      status: 'PENDING',
      dependsOn: ['t-shots'],
    });
  }

  return tasks;
}

export function resolveNextBestAction(
  tasks: CreativeTaskNode[],
  stage: FounderApprovalStage,
): CreativeNextBestAction {
  const pending = tasks.filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
  const first = pending.find((t) => {
    return t.dependsOn.every((dep) => tasks.find((x) => x.taskId === dep)?.status === 'APPROVED');
  });

  if (!first) {
    return {
      action: 'REVIEW FINAL ASSETS',
      actionType: 'FINAL',
      reason: 'Core creative tasks approved',
      screen: 'review',
    };
  }

  const screenMap: Record<CreativeTaskType, DirectorWizardStep> = {
    WORLD_APPROVAL: 'world',
    LOCATION: 'world',
    PROP_SYSTEM: 'styling',
    WARDROBE: 'styling',
    HAIR: 'styling',
    NAILS: 'styling',
    MAKEUP: 'styling',
    CASTING: 'styling',
    SHOT_LIST: 'shots',
    KEYFRAME: 'shots',
    MOTION: 'production',
    COPY: 'sequence',
    EDIT: 'production',
    SEQUENCE: 'sequence',
    CHANNEL_ADAPTATION: 'sequence',
    QA: 'review',
    REVISION: 'review',
    FINAL: 'review',
  };

  return {
    action: first.label.toUpperCase(),
    actionType: first.taskType,
    reason: `Dependency gate — ${first.taskType.replace(/_/g, ' ').toLowerCase()} needed before production`,
    screen: screenMap[first.taskType] ?? stageToScreen(stage),
  };
}

function stageToScreen(stage: FounderApprovalStage): DirectorWizardStep {
  const map: Record<FounderApprovalStage, DirectorWizardStep> = {
    WORLD: 'world',
    LOOK: 'look',
    STYLING: 'styling',
    SHOT_SYSTEM: 'shots',
    KEY_VISUALS: 'shots',
    SEQUENCE: 'sequence',
    FINAL: 'review',
    NONE: 'world',
  };
  return map[stage];
}
