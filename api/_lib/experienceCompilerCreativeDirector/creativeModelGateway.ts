import type { CreativeContextPack, CreativeDirectorTaskMode } from '../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';
import { validateTaskOutput } from '../../../shared/studioos-experience-compiler/creativeDirector/outputValidation.js';
import {
  CREATIVE_DIRECTOR_PROMPT_VERSION,
  creativeDirectorRuntimeBlocked,
  getCreativeDirectorModelId,
  getCreativeDirectorReasoningLevel,
} from './config.js';

export type GatewayRequest = {
  task_mode: CreativeDirectorTaskMode;
  context_pack: CreativeContextPack;
  revision_context?: Record<string, unknown>;
  founder_initiated: boolean;
};

export type GatewaySuccess = {
  ok: true;
  model: string;
  parsed: Record<string, unknown>;
  raw: string;
  input_token_estimate: number | null;
  output_token_estimate: number | null;
};

export type GatewayFailure =
  | { ok: false; blocked: NonNullable<ReturnType<typeof creativeDirectorRuntimeBlocked>> }
  | { ok: false; error: string; raw?: string };

function taskSystemPrompt(taskMode: CreativeDirectorTaskMode): string {
  const base = `You are CreativeDirectorAgent inside Studio OS Experience Compiler (MAP2).
You produce structured creative direction — not chat filler, not implementation code.
Prompt version: ${CREATIVE_DIRECTOR_PROMPT_VERSION}.
Return ONE JSON object matching the task contract. No markdown fences.`;

  const contracts: Partial<Record<CreativeDirectorTaskMode, string>> = {
    CONCEPT_TERRITORIES: `${base}
Task: CONCEPT_TERRITORIES — exactly 3 genuinely distinct territories (different spatial metaphor, interaction philosophy, information rhythm, visual expression, emotional experience).
Fields per territory: territory_id, name, core_idea, spatial_metaphor, emotional_objective, experience_logic, information_architecture, interaction_language, visual_language, mobile_expression, tablet_expression, desktop_expression, app_expression, image_authority_needs[], live_code_needs[], risks[], failure_conditions[], project_alignment.
Top-level: territories[], creative_rationale.`,
    EXPERIENCE_GRAPH: `${base}
Task: EXPERIENCE_GRAPH — complete graph with routes, meaningful states, entry_points, decision_points, transitions, private/public boundaries, completion, error/empty/locked states, project-reactive branches, surface relevance.`,
    FAMILY_ARCHITECTURE: `${base}
Task: FAMILY_ARCHITECTURE — page, experience, workflow, transaction, private client, app, immersive families as applicable.`,
    SURFACE_EXPRESSION: `${base}
Task: SURFACE_EXPRESSION — distinct MOBILE_WEB, TABLET_WEB, DESKTOP_WEB, CLIENT_APP_MOBILE, CLIENT_APP_TABLET (app is not a breakpoint).`,
    AUTHORITY_BRIEF: `${base}
Task: AUTHORITY_BRIEF — authority_briefs[] with authority_id, family_id, surface, state, visual objective, composition, hierarchy, spatial metaphor, material language, live-code vs image regions, must_include, must_exclude, continuity_group.`,
    HYBRIDIZE_TERRITORIES: `${base}
Task: HYBRIDIZE_TERRITORIES — resulting_territory object plus hybrid_rationale.`,
    FOUNDER_REVISION: `${base}
Task: FOUNDER_REVISION — apply preserve/reject instructions to prior creative artifacts; return revised payload under revised_output.`,
    CREATIVE_CRITIQUE: `${base}
Task: CREATIVE_CRITIQUE — structured critique with strengths, risks, alignment, recommended_next_mode.`,
    AUTHORITY_GAP_ANALYSIS: `${base}
Task: AUTHORITY_GAP_ANALYSIS — gaps[], recommended_briefs[], blocked_surfaces[].`,
    EXPERIENCE_ARCHITECTURE: `${base}
Task: EXPERIENCE_ARCHITECTURE — experience architecture summary + pillars + risks (structured JSON).`,
  };

  return contracts[taskMode] ?? base;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export async function creativeModelGateway(req: GatewayRequest): Promise<GatewaySuccess | GatewayFailure> {
  if (!req.founder_initiated) {
    return { ok: false, error: 'EXPENSIVE_RUN_REQUIRES_FOUNDER_INITIATION' };
  }

  const blocked = creativeDirectorRuntimeBlocked();
  if (blocked) return { ok: false, blocked };

  const apiKey = process.env.OPENAI_API_KEY!.trim();
  const model = getCreativeDirectorModelId();
  const reasoning = getCreativeDirectorReasoningLevel();

  const userPayload = {
    task_mode: req.task_mode,
    context_pack: req.context_pack,
    revision_context: req.revision_context ?? null,
    reasoning_level: reasoning,
  };

  const user = JSON.stringify(userPayload);
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
        { role: 'system', content: taskSystemPrompt(req.task_mode) },
        { role: 'user', content: user },
      ],
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof body?.error?.message === 'string' ? body.error.message : `OpenAI HTTP ${res.status}`;
    return { ok: false, error: msg };
  }

  const raw = String(body?.choices?.[0]?.message?.content ?? '');
  if (!raw.trim()) return { ok: false, error: 'Empty model response', raw };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'Model response was not valid JSON', raw };
  }

  const validation = validateTaskOutput(req.task_mode, parsed);
  if (!validation.ok) {
    return { ok: false, error: validation.error, raw };
  }

  return {
    ok: true,
    model,
    parsed: validation.data,
    raw,
    input_token_estimate: estimateTokens(user),
    output_token_estimate: estimateTokens(raw),
  };
}
