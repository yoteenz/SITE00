import type { CreativeContextPack, CreativeDirectorTaskMode } from '../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';
import { validateTaskOutput } from '../../../shared/studioos-experience-compiler/creativeDirector/outputValidation.js';
import {
  CREATIVE_DIRECTOR_PROMPT_VERSION,
  creativeDirectorRuntimeBlocked,
  resolveCreativeDirectorModelConfig,
  type CreativeDirectorReasoningEffort,
} from './config.js';

export type GatewayRequest = {
  task_mode: CreativeDirectorTaskMode;
  context_pack: CreativeContextPack;
  revision_context?: Record<string, unknown>;
  founder_initiated: boolean;
  reasoning_effort?: CreativeDirectorReasoningEffort;
};

export type GatewaySuccess = {
  ok: true;
  model: string;
  reasoning_effort: CreativeDirectorReasoningEffort;
  parsed: Record<string, unknown>;
  raw: string;
  input_token_estimate: number | null;
  output_token_estimate: number | null;
  provider_path: 'openai.responses';
};

export type GatewayFailure =
  | { ok: false; blocked: NonNullable<ReturnType<typeof creativeDirectorRuntimeBlocked>> }
  | { ok: false; error: string; raw?: string; state: 'LIVE_RUN_FAILED' | 'FAILED_VALIDATION' };

function taskSystemPrompt(taskMode: CreativeDirectorTaskMode): string {
  const base = `You are CreativeDirectorAgent inside Studio OS Experience Compiler (MAP2).
You produce structured creative direction — not chat filler, not implementation code.
Prompt version: ${CREATIVE_DIRECTOR_PROMPT_VERSION}.
Return ONE JSON object matching the task contract. No markdown fences.`;

  const contracts: Partial<Record<CreativeDirectorTaskMode, string>> = {
    CONCEPT_TERRITORIES: `${base}
Task: CONCEPT_TERRITORIES — exactly 3 genuinely distinct territories (different spatial metaphor, interaction philosophy, information rhythm, visual expression, emotional experience, project-status storytelling).
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

function extractResponsesOutputText(body: Record<string, unknown>): string {
  const parsed = body.output_parsed;
  if (parsed && typeof parsed === 'object') return JSON.stringify(parsed);
  const output = body.output;
  if (!Array.isArray(output)) return '';
  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    if (row.type !== 'message') continue;
    const content = row.content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (!part || typeof part !== 'object') continue;
      const p = part as Record<string, unknown>;
      if (p.type === 'output_text' && typeof p.text === 'string') return p.text;
    }
  }
  return '';
}

function usageTokens(body: Record<string, unknown>): { input: number | null; output: number | null } {
  const usage = body.usage as Record<string, unknown> | undefined;
  return {
    input: typeof usage?.input_tokens === 'number' ? usage.input_tokens : null,
    output: typeof usage?.output_tokens === 'number' ? usage.output_tokens : null,
  };
}

export async function creativeModelGateway(req: GatewayRequest): Promise<GatewaySuccess | GatewayFailure> {
  if (!req.founder_initiated) {
    return { ok: false, error: 'EXPENSIVE_RUN_REQUIRES_FOUNDER_INITIATION', state: 'LIVE_RUN_FAILED' };
  }

  const blocked = creativeDirectorRuntimeBlocked();
  if (blocked) return { ok: false, blocked };

  const cfg = resolveCreativeDirectorModelConfig({
    reasoning_effort: req.reasoning_effort,
  });
  const apiKey = process.env.OPENAI_API_KEY!.trim();

  const userPayload = {
    task_mode: req.task_mode,
    context_pack: req.context_pack,
    revision_context: req.revision_context ?? null,
  };

  const user = JSON.stringify(userPayload);
  const bodyPayload = {
    model: cfg.model,
    reasoning: { effort: cfg.reasoning_effort },
    instructions: taskSystemPrompt(req.task_mode),
    input: [
      {
        role: 'user',
        content: [{ type: 'input_text', text: user }],
      },
    ],
    text: { format: { type: 'json_object' } },
    max_output_tokens: cfg.max_output_tokens,
  };

  let lastError = 'LIVE_RUN_FAILED';
  for (let attempt = 1; attempt <= cfg.retry_policy.max_attempts; attempt++) {
    const res = await fetch(cfg.responses_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(bodyPayload),
      signal: AbortSignal.timeout(cfg.timeout_ms),
    });

    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      lastError = typeof (body.error as { message?: string } | undefined)?.message === 'string'
        ? (body.error as { message: string }).message
        : `OpenAI HTTP ${res.status}`;
      if (attempt < cfg.retry_policy.max_attempts && [429, 500, 502, 503, 504].includes(res.status)) {
        await new Promise((r) => setTimeout(r, cfg.retry_policy.backoff_ms * attempt));
        continue;
      }
      return { ok: false, error: lastError, state: 'LIVE_RUN_FAILED' };
    }

    const raw = extractResponsesOutputText(body);
    if (!raw.trim()) return { ok: false, error: 'Empty model response', state: 'LIVE_RUN_FAILED' };

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { ok: false, error: 'Model response was not valid JSON', raw, state: 'FAILED_VALIDATION' };
    }

    const validation = validateTaskOutput(req.task_mode, parsed);
    if (!validation.ok) {
      return { ok: false, error: validation.error, raw, state: 'FAILED_VALIDATION' };
    }

    const usage = usageTokens(body);
    return {
      ok: true,
      model: cfg.model,
      reasoning_effort: cfg.reasoning_effort,
      parsed: validation.data,
      raw,
      input_token_estimate: usage.input,
      output_token_estimate: usage.output,
      provider_path: 'openai.responses',
    };
  }

  return { ok: false, error: lastError, state: 'LIVE_RUN_FAILED' };
}
