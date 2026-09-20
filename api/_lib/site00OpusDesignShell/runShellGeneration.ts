import { OPUS_DESIGN_SHELL_MODEL } from '../../../shared/site00-opus-design-shell/constants.js';
import {
  buildOpusDesignShellDynamicUserContext,
  buildOpusDesignShellStableSystemPrefix,
} from '../../../shared/site00-opus-design-shell/promptPrefix.js';
import type {
  OpusDesignShellPackage,
  OpusDesignShellProposedFile,
  OpusDesignShellResult,
  OpusShellUsageReceipt,
} from '../../../shared/site00-opus-design-shell/types.js';
import {
  ANTHROPIC_API_URL,
  ANTHROPIC_VERSION_HEADER,
  anthropicApiKey,
  modelAvailabilityBlocked,
  scriptedShellEnabled,
} from './config.js';

function parseShellResultJson(text: string): {
  summary: string;
  shellStrategy: string;
  proposedFiles: OpusDesignShellProposedFile[];
  visualComponents: string[];
  cssArtifacts: string[];
  responsiveNotes: string[];
  beforeAfterNotes: string[];
  preservedFunctionConfirmation: string;
  forbiddenMutationConfirmation: string;
} {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1] : text;
  const parsed = JSON.parse(raw.trim()) as Record<string, unknown>;
  const proposedFiles = Array.isArray(parsed.proposedFiles) ?
      (parsed.proposedFiles as OpusDesignShellProposedFile[])
    : [];
  return {
    summary: String(parsed.summary ?? 'Visual shell proposal'),
    shellStrategy: String(parsed.shellStrategy ?? ''),
    proposedFiles,
    visualComponents: Array.isArray(parsed.visualComponents) ? (parsed.visualComponents as string[]) : [],
    cssArtifacts: Array.isArray(parsed.cssArtifacts) ? (parsed.cssArtifacts as string[]) : [],
    responsiveNotes: Array.isArray(parsed.responsiveNotes) ? (parsed.responsiveNotes as string[]) : [],
    beforeAfterNotes: Array.isArray(parsed.beforeAfterNotes) ? (parsed.beforeAfterNotes as string[]) : [],
    preservedFunctionConfirmation: String(parsed.preservedFunctionConfirmation ?? ''),
    forbiddenMutationConfirmation: String(parsed.forbiddenMutationConfirmation ?? ''),
  };
}

function scriptedResult(pkg: OpusDesignShellPackage, usage: OpusShellUsageReceipt): Omit<OpusDesignShellResult, 'shellResultId' | 'createdAt'> {
  const staged: OpusDesignShellProposedFile = {
    path: 'src/site00/styles/site00-twin-opus-direct.css',
    summary: 'Staged spacing adjustment for authority rail (presentation only).',
    stagedContent: '/* STAGED_VISUAL_SHELL — not applied to production */\n.tod-rail { gap: 12px; }\n',
  };
  return {
    packageId: pkg.packageId,
    targetType: pkg.targetType,
    summary: 'Scripted visual shell — scoped presentation tweak.',
    shellStrategy: 'Increase breathing room in authority rail without touching handlers.',
    proposedFiles: [staged],
    visualComponents: ['authority-rail', 'current-concept-split'],
    cssArtifacts: ['site00-twin-opus-direct.css'],
    responsiveNotes: ['Mobile artboard unchanged; desktop rail widened 8px.'],
    beforeAfterNotes: ['Before: dense rail', 'After: staged spacing proposal'],
    preservedFunctionConfirmation: 'No routes, state, or API handlers modified.',
    forbiddenMutationConfirmation: 'Forbidden scopes not touched in staged output.',
    usageReceipt: usage,
    status: 'READY_FOR_REVIEW',
  };
}

export async function runOpusDesignShellGeneration(
  pkg: OpusDesignShellPackage,
  mode: 'CREATE' | 'REFINE',
): Promise<OpusDesignShellResult> {
  if (modelAvailabilityBlocked()) {
    throw new Error('BLOCKED_MODEL_UNAVAILABLE');
  }

  const started = Date.now();
  const shellResultId = `odsr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (scriptedShellEnabled()) {
    const usage: OpusShellUsageReceipt = {
      model: OPUS_DESIGN_SHELL_MODEL,
      requestId: `scripted-${shellResultId}`,
      durationMs: Date.now() - started,
      inputTokens: 900,
      outputTokens: 420,
      cacheCreationInputTokens: 640,
      cacheReadInputTokens: 0,
      estimatedCostUsd: 0,
      promptCacheEnabled: true,
    };
    return {
      shellResultId,
      createdAt: new Date().toISOString(),
      ...scriptedResult(pkg, usage),
    };
  }

  const key = anthropicApiKey();
  if (!key) throw new Error('BLOCKED_NO_ANTHROPIC_KEY');

  const stable = buildOpusDesignShellStableSystemPrefix();
  const dynamic = buildOpusDesignShellDynamicUserContext({
    targetType: pkg.targetType,
    projectId: pkg.projectId,
    pageId: pkg.pageId,
    workspaceTargetId: pkg.workspaceTargetId,
    functionContractId: pkg.functionContractId,
    componentMap: pkg.componentMap,
    relevantSourceFiles: pkg.relevantSourceFiles,
    currentVisualTokens: pkg.currentVisualTokens,
    founderInstruction: pkg.founderInstruction,
    mode,
  });

  const body = {
    model: OPUS_DESIGN_SHELL_MODEL,
    max_tokens: 8_192,
    system: [
      { type: 'text', text: stable, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: 'Dynamic target payloads follow in user messages.' },
    ],
    messages: [{ role: 'user', content: [{ type: 'text', text: dynamic }] }],
  };

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': ANTHROPIC_VERSION_HEADER,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(600_000),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    if (response.status === 404 && /model/i.test(text)) throw new Error('BLOCKED_MODEL_UNAVAILABLE');
    throw new Error(`API_FAILED:${response.status}`);
  }

  const payload = (await response.json()) as {
    id?: string;
    content?: { type: string; text?: string }[];
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
    };
  };

  const text = (payload.content ?? [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('\n');

  let parsed;
  try {
    parsed = parseShellResultJson(text);
  } catch {
    throw new Error('INVALID_OUTPUT');
  }

  const cacheRead = payload.usage?.cache_read_input_tokens ?? 0;
  const cacheWrite = payload.usage?.cache_creation_input_tokens ?? 0;

  const usage: OpusShellUsageReceipt = {
    model: OPUS_DESIGN_SHELL_MODEL,
    requestId: payload.id ?? null,
    durationMs: Date.now() - started,
    inputTokens: payload.usage?.input_tokens ?? 0,
    outputTokens: payload.usage?.output_tokens ?? 0,
    cacheCreationInputTokens: cacheWrite,
    cacheReadInputTokens: cacheRead,
    estimatedCostUsd: null,
    promptCacheEnabled: true,
  };

  return {
    shellResultId,
    packageId: pkg.packageId,
    targetType: pkg.targetType,
    createdAt: new Date().toISOString(),
    status: 'READY_FOR_REVIEW',
    usageReceipt: usage,
    ...parsed,
  };
}
