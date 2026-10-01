import type {
  CreativeContextPack,
  CreativeDirectorTaskMode,
  CreativeThread,
  FounderJudgment,
  WorkspaceCreativeDirectorSnapshot,
} from '../creativeDirectorTypes.js';

export const YOUR_SPACE_SEED_THEMES = [
  'private project threshold',
  'ownership',
  'project intelligence',
  'identity vault',
  'operations / control',
  'project gallery',
  'owned digital locations',
] as const;

export type CompileContextPackInput = {
  snapshot: WorkspaceCreativeDirectorSnapshot;
  thread: CreativeThread;
  task_mode: CreativeDirectorTaskMode;
  approved_artifacts: Record<string, unknown>[];
  rejected_directions: string[];
};

function estimateBytes(obj: unknown): number {
  try {
    return new TextEncoder().encode(JSON.stringify(obj)).length;
  } catch {
    return 0;
  }
}

function recentJudgments(judgments: FounderJudgment[], limit = 8): FounderJudgment[] {
  return [...judgments].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit);
}

function isYourSpaceThread(thread: CreativeThread): boolean {
  return /your\s*space/i.test(thread.title);
}

export function compileCreativeContextPack(input: CompileContextPackInput): CreativeContextPack {
  const { snapshot, thread, task_mode } = input;
  const context_pack_id = `ctx_${thread.thread_id}_${Date.now()}`;

  const brandTruth = {
    brand_name: snapshot.intelligence_summary.brand_name ?? snapshot.project_name,
    business_model: snapshot.intelligence_summary.business_model,
    audience: snapshot.intelligence_summary.audience,
  };

  const locked = input.approved_artifacts.flatMap((a) => {
    const id = (a as { territory_id?: string; graph_id?: string }).territory_id ?? (a as { graph_id?: string }).graph_id;
    return id ? [`LOCKED:${id}`] : [];
  });

  const taskBlock: Record<string, unknown> = { task_mode };
  if (isYourSpaceThread(thread) && snapshot.project_slug === 'site00') {
    taskBlock.your_space_seed = {
      public_vs_private: 'Public SITE 00 = what we can build; private YOUR SPACE = what we are building for this client.',
      surfaces: ['YOUR SPACE', 'IDENTITY', 'CTRL ROOM', 'PROJECTS', 'MY SITES', 'client web', 'client app'],
      exploration_themes: YOUR_SPACE_SEED_THEMES,
      client_app_nav_canon: ['HOME', 'PROJECT', 'REVIEWS', 'INBOX', 'LIBRARY'],
      note: 'Seed prompts only — territories must still be genuinely distinct.',
    };
  }

  const core_context = {
    BRAND_TRUTH: brandTruth,
    BRAND_PERSONALITY: snapshot.intelligence_summary.creative_appetite,
    FOUNDER_CREATIVE_APPETITE: snapshot.intelligence_summary.creative_appetite,
    PROJECT_INTELLIGENCE: snapshot.intelligence_summary,
    PROJECT_TYPE: snapshot.mode,
    CURRENT_PRODUCT_ARCHITECTURE: snapshot.pipeline_summary,
    LOCKED_CONSTRAINTS: locked,
    REJECTED_DIRECTIONS: input.rejected_directions,
  };

  const task_relevant_context = {
    CURRENT_TASK: taskBlock,
    CURRENT_EXPERIENCE_GRAPH: snapshot.pipeline_summary.graph ?? null,
    CURRENT_FAMILY_ARCHITECTURE: snapshot.pipeline_summary.families ?? null,
    CURRENT_SURFACE_EXPRESSIONS: snapshot.pipeline_summary.surfaces ?? null,
    VISUAL_AUTHORITIES: snapshot.pipeline_summary.authorities ?? [],
    FUNCTIONAL_CONSTRAINTS: snapshot.intelligence_summary.constraints ?? [],
    CURRENT_IMPLEMENTATION_STATE: snapshot.production_stage,
    CURRENT_PRODUCTION_STAGE: snapshot.production_stage,
  };

  const current_creative_thread = {
    thread_id: thread.thread_id,
    title: thread.title,
    active_artifact_id: thread.active_artifact_id,
    message_count: thread.messages.length,
  };

  const manifest = [
    { key: 'core_context', byte_estimate: estimateBytes(core_context), source: 'approved+locked', locked: true },
    { key: 'task_relevant_context', byte_estimate: estimateBytes(task_relevant_context), source: 'task_mode', locked: false },
    { key: 'current_creative_thread', byte_estimate: estimateBytes(current_creative_thread), source: 'thread', locked: false },
    { key: 'recent_founder_feedback', byte_estimate: estimateBytes(thread.judgments), source: 'judgments', locked: true },
  ];

  return {
    context_pack_id,
    project_id: snapshot.project_id,
    thread_id: thread.thread_id,
    compiled_at: new Date().toISOString(),
    core_context,
    task_relevant_context,
    current_creative_thread,
    locked_decisions: locked,
    recent_founder_feedback: recentJudgments(thread.judgments),
    visual_authority_references: (snapshot.pipeline_summary.authority_ids as string[] | undefined) ?? [],
    rejected_directions: input.rejected_directions,
    manifest,
  };
}

/** Priority: approved/locked > latest judgments > intelligence > graph > authorities > prior outputs > rejected (as do-not-repeat). */
export function contextSourcePriorityLabel(): string[] {
  return [
    'APPROVED / LOCKED project artifacts',
    'latest founder judgments',
    'canonical project intelligence',
    'active experience graph',
    'current authority records',
    'prior creative outputs',
    'historical rejected directions (DO NOT REPEAT)',
  ];
}
