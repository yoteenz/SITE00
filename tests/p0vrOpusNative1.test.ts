/**
 * P0.VR.OPUS-NATIVE1 — guards for the native Opus design runtime.
 *
 * The three properties worth defending here are the ones that would be
 * expensive to discover the hard way: the credential never reaches the client,
 * the model cannot be swapped for a cheaper one, and the agent cannot write
 * outside its declared boundary.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import {
  OPUS_DESIGN_EXECUTION_PROTOCOL_HASH,
  OPUS_DESIGN_EXECUTION_PROTOCOL_V1,
  OPUS_DESIGN_EXECUTION_PROTOCOL_VERSION,
  OPUS_PROTOCOL_SOURCE_LINEAGE,
  computeProtocolHash,
} from '../shared/site00-opus-native/protocol';
import {
  OPUS_NATIVE_MODE_CONTRACTS,
  modeContract,
  resolveEffort,
} from '../shared/site00-opus-native/modeContracts';
import {
  OPUS_NATIVE_DEFAULT_RATES,
  cacheSavingsUsd,
  estimateTokens,
  projectRunCost,
  usageCostUsd,
} from '../shared/site00-opus-native/pricing';
import { OPUS_NATIVE_MODES, OPUS_NATIVE_TOOLS } from '../shared/site00-opus-native/types';
import {
  OPUS_NATIVE_MODEL,
  OPUS_NATIVE_MODEL_HARD_BOUND,
  OPUS_NATIVE_USES_CURSOR_PROXY,
  anthropicReadiness,
  redactSecrets,
} from '../api/_lib/site00OpusNative/config';
import { auditForSecrets } from '../api/_lib/site00OpusNative/observability';
import { DESIGN_SURFACES, findSurface } from '../api/_lib/site00OpusNative/designSurfaceRegistry';
import { expandFileBoundary, isInspectablePath } from '../api/_lib/site00OpusNative/contextCompiler';
import { compileAgentContext } from '../api/_lib/site00OpusNative/contextCompiler';
import { RunCostMeter } from '../api/_lib/site00OpusNative/costLedger';
import { OPUS_TOOL_DEFINITIONS } from '../api/_lib/site00OpusNative/tools';
import { NATIVE_OPUS_VS_CURSOR_GAP, summariseGap } from '../api/_lib/site00OpusNative/cursorGap';
import { estimateMessageTokens } from '../api/_lib/site00OpusNative/provider';
import { buildSystemBlocks } from '../api/_lib/site00OpusNative/runtime';
import { FIRST_PROOF_TRANSCRIPT, PROOF_DIVIDER_TOKENS } from '../api/_lib/site00OpusNative/scriptedTranscripts';

function read(relative: string): string {
  return readFileSync(path.resolve(process.cwd(), relative), 'utf8');
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(path.resolve(process.cwd(), dir))) {
    const relative = path.join(dir, entry);
    const info = statSync(path.resolve(process.cwd(), relative));
    if (info.isDirectory()) walk(relative, out);
    else out.push(relative);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Security
// ---------------------------------------------------------------------------

describe('P0.VR.OPUS-NATIVE1 — the credential never reaches the browser', () => {
  it('reads ANTHROPIC_API_KEY in exactly one place in the runtime', () => {
    const runtimeFiles = walk('api/_lib/site00OpusNative');
    const readers = runtimeFiles.filter((file) => read(file).includes('process.env.ANTHROPIC_API_KEY'));
    // config.ts owns the read; observability re-reads it only to audit for leaks.
    expect(readers.sort()).toEqual([
      'api/_lib/site00OpusNative/config.ts',
      'api/_lib/site00OpusNative/observability.ts',
    ]);
  });

  it('never mentions the key or the server config module from client code', () => {
    const clientFiles = [
      ...walk('src/site00/components/designBench/opusNative'),
      'src/site00/pages/DesignOpusNativePage.tsx',
    ];
    for (const file of clientFiles) {
      const source = read(file);
      // The panel may name the variable when telling the founder to configure
      // it; what it must never do is read it or import the module that does.
      expect(source).not.toContain('env.ANTHROPIC_API_KEY');
      expect(source).not.toContain('process.env');
      expect(source).not.toContain('site00OpusNative/config');
      expect(source).not.toContain('api/_lib');
      expect(source).not.toContain('sk-ant');
    }
  });

  it('keeps every shared module free of the credential', () => {
    for (const file of walk('shared/site00-opus-native')) {
      expect(read(file)).not.toContain('ANTHROPIC_API_KEY');
    }
  });

  it('redacts credential material from any string leaving the runtime', () => {
    const fake = 'sk-ant-api03-ABCDEFGHIJKLMNOP';
    expect(redactSecrets(`failed with ${fake}`)).not.toContain(fake);
    expect(redactSecrets(`failed with ${fake}`)).toContain('[REDACTED_ANTHROPIC_KEY]');
  });

  it('audits outbound payloads for credential material', () => {
    expect(auditForSecrets({ detail: 'sk-ant-api03-LEAKED' })).toBe(true);
    expect(auditForSecrets({ detail: 'nothing sensitive' })).toBe(false);
  });

  it('reports readiness as a boolean and a reason, never a key fragment', () => {
    const readiness = anthropicReadiness();
    expect(typeof readiness.ready).toBe('boolean');
    expect(auditForSecrets(readiness)).toBe(false);
  });

  it('blocks any response that would carry a secret', () => {
    const handler = read('api/site00/opus-native.ts');
    expect(handler).toContain('RESPONSE_BLOCKED_SECRET_LEAK');
    expect(handler).toContain('auditForSecrets(payload)');
  });
});

// ---------------------------------------------------------------------------
// Model binding
// ---------------------------------------------------------------------------

describe('P0.VR.OPUS-NATIVE1 — Opus 5 is hard-bound', () => {
  it('pins the model with no environment override', () => {
    expect(OPUS_NATIVE_MODEL).toBe('claude-opus-5');
    expect(OPUS_NATIVE_MODEL_HARD_BOUND).toBe(true);

    const config = read('api/_lib/site00OpusNative/config.ts');
    const modelLine = /export const OPUS_NATIVE_MODEL = ([^;]+);/.exec(config)?.[1] ?? '';
    expect(modelLine).toContain("'claude-opus-5'");
    expect(modelLine).not.toContain('process.env');
  });

  it('sends that exact model and never proxies through Cursor', () => {
    const provider = read('api/_lib/site00OpusNative/provider.ts');
    expect(provider).toContain('model: OPUS_NATIVE_MODEL');
    expect(provider).toContain('fetch(ANTHROPIC_API_URL');
    expect(read('api/_lib/site00OpusNative/config.ts')).toContain(
      "ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'",
    );
    expect(provider).not.toMatch(/cursor/i);
    expect(OPUS_NATIVE_USES_CURSOR_PROXY).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Phase 1 — protocol
// ---------------------------------------------------------------------------

describe('P0.VR.OPUS-NATIVE1 — OPUS_DESIGN_EXECUTION_PROTOCOL_V1', () => {
  it('captures the operational method the benchmark lineage actually used', () => {
    for (const rule of [
      'Inspect before you touch anything',
      'Parent geometry first',
      'Render it, then look at it',
      'Compare quantitatively',
      'Asset boundary',
      'The founder approval boundary',
    ]) {
      expect(OPUS_DESIGN_EXECUTION_PROTOCOL_V1).toContain(rule);
    }
  });

  it('forbids self-certification and self-approval', () => {
    expect(OPUS_DESIGN_EXECUTION_PROTOCOL_V1).toContain('You may not certify your own work from code inspection');
    expect(OPUS_DESIGN_EXECUTION_PROTOCOL_V1).toContain('You never mark your own work approved');
  });

  it('records the shipped sprints it was reconstructed from', () => {
    expect(OPUS_PROTOCOL_SOURCE_LINEAGE.length).toBeGreaterThanOrEqual(6);
    for (const sprint of OPUS_PROTOCOL_SOURCE_LINEAGE) {
      expect(sprint.startsWith('P0.VR.DESIGNBENCH.')).toBe(true);
    }
  });

  it('hashes deterministically so a cache miss can be explained', () => {
    expect(computeProtocolHash()).toBe(OPUS_DESIGN_EXECUTION_PROTOCOL_HASH);
    expect(computeProtocolHash('different')).not.toBe(OPUS_DESIGN_EXECUTION_PROTOCOL_HASH);
    expect(OPUS_DESIGN_EXECUTION_PROTOCOL_VERSION).toBe('opus-design-execution-protocol-v1');
  });
});

// ---------------------------------------------------------------------------
// Phase 15 / 16 — modes and effort
// ---------------------------------------------------------------------------

describe('P0.VR.OPUS-NATIVE1 — mode contracts', () => {
  it('defines all three execution policies', () => {
    expect(Object.keys(OPUS_NATIVE_MODE_CONTRACTS).sort()).toEqual([...OPUS_NATIVE_MODES].sort());
  });

  it('escalates budget monotonically from QUICK to FORENSIC', () => {
    const [quick, design, forensic] = [modeContract('QUICK'), modeContract('DESIGN'), modeContract('FORENSIC')];
    for (const key of ['contextBudgetTokens', 'maxVisualLoops', 'dependencyDepth'] as const) {
      expect(quick[key]).toBeLessThan(design[key]);
      expect(design[key]).toBeLessThanOrEqual(forensic[key]);
    }
    for (const key of ['maxIterations', 'maxRunCostUsd', 'maxInputTokens'] as const) {
      expect(quick.limits[key]).toBeLessThan(design.limits[key]);
      expect(design.limits[key]).toBeLessThan(forensic.limits[key]);
    }
  });

  it('gives QUICK enough turns for the protocol\'s own required method', () => {
    // inspect, render, patch, render, verify, report
    expect(modeContract('QUICK').limits.maxIterations).toBeGreaterThanOrEqual(6);
  });

  it('warns before it hard-stops, and never above the ceiling', () => {
    for (const mode of OPUS_NATIVE_MODES) {
      const { limits } = modeContract(mode);
      expect(limits.warnAtCostUsd).toBeLessThan(limits.hardStopAtCostUsd);
      expect(limits.hardStopAtCostUsd).toBeLessThanOrEqual(limits.maxRunCostUsd);
    }
  });

  it('does not run every task at maximum reasoning', () => {
    expect(modeContract('QUICK').defaultEffort).toBe('low');
    expect(modeContract('DESIGN').defaultEffort).toBe('medium');
    expect(modeContract('FORENSIC').defaultEffort).toBe('high');
  });

  it('lets the founder escalate but not past the mode ceiling or below the floor', () => {
    expect(resolveEffort('QUICK', null)).toEqual({ effort: 'low', escalated: false });
    expect(resolveEffort('QUICK', 'medium')).toEqual({ effort: 'medium', escalated: true });
    // QUICK cannot reach maximum reasoning without also changing mode.
    expect(resolveEffort('QUICK', 'high').effort).toBe('medium');
    expect(resolveEffort('FORENSIC', 'low')).toEqual({ effort: 'high', escalated: false });
  });
});

// ---------------------------------------------------------------------------
// Phase 6 / 7 — cost
// ---------------------------------------------------------------------------

describe('P0.VR.OPUS-NATIVE1 — cost ledger and guard', () => {
  it('prices cache reads far below fresh input and records the saving', () => {
    expect(OPUS_NATIVE_DEFAULT_RATES.cacheRead).toBeLessThan(OPUS_NATIVE_DEFAULT_RATES.input);
    expect(OPUS_NATIVE_DEFAULT_RATES.cacheWrite).toBeGreaterThan(OPUS_NATIVE_DEFAULT_RATES.input);
    const saving = cacheSavingsUsd({
      inputTokens: 0,
      outputTokens: 0,
      cacheWriteTokens: 0,
      cacheReadTokens: 100_000,
    });
    expect(saving).toBeGreaterThan(0);
  });

  it('projects a whole loop rather than one request', () => {
    const projection = {
      volatileTokens: 500,
      cacheableTokens: 2_000,
      expectedTurns: 5,
      maxOutputTokens: 4_000,
    };
    const singleTurn = usageCostUsd({
      inputTokens: 500,
      outputTokens: 1_000,
      cacheWriteTokens: 2_000,
      cacheReadTokens: 0,
    });
    const cold = projectRunCost({ ...projection, cacheWarm: false });
    const warm = projectRunCost({ ...projection, cacheWarm: true });

    expect(cold).toBeGreaterThan(singleTurn);
    expect(warm).toBeLessThan(cold);
  });

  it('blocks before dispatch once a ceiling is reached', () => {
    const meter = new RunCostMeter('run', 'QUICK', 'ndxbook', 'page', 'hash');
    expect(meter.check().state).toBe('OK');

    meter.record({ inputTokens: 30_000, outputTokens: 0, cacheWriteTokens: 0, cacheReadTokens: 0 });
    expect(meter.check().state).toBe('WARNING');

    meter.record({ inputTokens: 0, outputTokens: 20_000, cacheWriteTokens: 0, cacheReadTokens: 0 });
    const blocked = meter.check();
    expect(blocked.state).toBe('BLOCKED');
    expect(blocked.reason).toBeTruthy();
  });

  it('clamps a founder override to the mode ceiling rather than above it', () => {
    const generous = new RunCostMeter('run', 'QUICK', 'p', 'pg', 'h', 999);
    expect(generous.limits.maxRunCostUsd).toBe(modeContract('QUICK').limits.maxRunCostUsd);

    const tighter = new RunCostMeter('run', 'QUICK', 'p', 'pg', 'h', 0.1);
    expect(tighter.limits.maxRunCostUsd).toBe(0.1);
  });

  it('issues a receipt with the tokens the sprint requires', () => {
    const meter = new RunCostMeter('run-1', 'DESIGN', 'ndxbook', 'twin-opus-direct', 'hash');
    meter.record({ inputTokens: 100, outputTokens: 50, cacheWriteTokens: 10, cacheReadTokens: 20 });
    meter.iterations = 2;
    const receipt = meter.receipt();

    for (const key of [
      'runId', 'model', 'mode', 'inputTokens', 'outputTokens', 'cacheWriteTokens',
      'cacheReadTokens', 'estimatedUsd', 'actualUsd', 'toolCalls', 'iterations',
      'projectId', 'pageId', 'taskType', 'cacheSavingsUsd',
    ]) {
      expect(receipt).toHaveProperty(key);
    }
    expect(receipt.model).toBe('claude-opus-5');
  });

  it('counts an image at its real token weight, not its base64 length', () => {
    const bigImage = 'A'.repeat(200_000);
    const tokens = estimateMessageTokens([
      {
        role: 'user',
        content: [{ type: 'image', source: { type: 'base64', media_type: 'image/png', data: bigImage } }],
      },
    ]);
    expect(tokens).toBeLessThan(estimateTokens(bigImage) / 10);
    expect(tokens).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Phase 3 / 4 / 9 — context
// ---------------------------------------------------------------------------

describe('P0.VR.OPUS-NATIVE1 — scoped context compiler', () => {
  it('emits the stable tiers first, cacheable, and the task last', async () => {
    const { compiled } = await compileAgentContext({
      mode: 'DESIGN',
      task: 'test',
      target: { pageId: 'opus-native-proof' },
    });

    const tiers = compiled.blocks.map((block) => block.tier);
    expect(tiers[0]).toBe('STABLE_CACHEABLE_CONTEXT');
    expect(tiers[tiers.length - 1]).toBe('TASK_CONTEXT');

    const lastCacheable = tiers.lastIndexOf(
      [...tiers].reverse().find((tier) => tier !== 'PAGE_CONTEXT' && tier !== 'TASK_CONTEXT')!,
    );
    const firstVolatile = tiers.findIndex((tier) => tier === 'PAGE_CONTEXT' || tier === 'TASK_CONTEXT');
    expect(lastCacheable).toBeLessThan(firstVolatile);

    expect(compiled.cacheableEstimatedTokens).toBeGreaterThan(0);
    expect(compiled.protocolHash).toBe(OPUS_DESIGN_EXECUTION_PROTOCOL_HASH);
  });

  it('gives a QUICK run less context than a FORENSIC one', async () => {
    const target = { pageId: 'opus-native-proof' };
    const quick = await compileAgentContext({ mode: 'QUICK', task: 't', target });
    const forensic = await compileAgentContext({ mode: 'FORENSIC', task: 't', target });
    expect(quick.compiled.totalEstimatedTokens).toBeLessThan(forensic.compiled.totalEstimatedTokens);
  });

  it('resolves the golden to an identity rather than a description', async () => {
    const { context } = await compileAgentContext({
      mode: 'QUICK',
      task: 't',
      target: { pageId: 'opus-native-proof' },
    });
    const golden = context.goldenReference!;
    expect(golden.hash).toMatch(/^[0-9a-f]{16}$/);
    expect(golden.width).toBeGreaterThan(0);
    expect(golden.height).toBeGreaterThan(0);
    expect(golden.approvalState).toBe('APPROVED');
  });

  it('refuses paths outside the inspectable roots', () => {
    expect(isInspectablePath('src/site00/styles/site00-opus-native.css')).toBe(true);
    for (const bad of ['../../etc/passwd', '/etc/passwd', 'server/index.ts', 'src/../../secret', '.env']) {
      expect(isInspectablePath(bad)).toBe(false);
    }
  });

  it('expands only as far as the mode allows', async () => {
    const entry = ['src/site00/pages/DesignOpusNativePage.tsx'];
    const shallow = await expandFileBoundary(entry, 0);
    const deep = await expandFileBoundary(entry, 2);
    expect(shallow).toEqual(entry);
    expect(deep.length).toBeGreaterThan(shallow.length);
    for (const file of deep) expect(isInspectablePath(file)).toBe(true);
  });

  it('puts a cache breakpoint at the end of the stable region only', async () => {
    const { compiled, context, surface } = await compileAgentContext({
      mode: 'DESIGN',
      task: 't',
      target: { pageId: 'opus-native-proof' },
    });
    const blocks = buildSystemBlocks({ compiled, context, surface } as never);
    const breakpoints = blocks.filter((block) => block.cache_control);
    expect(breakpoints).toHaveLength(1);

    const stableCount = compiled.blocks.filter((block) => block.cacheable).length;
    expect(blocks.indexOf(breakpoints[0])).toBe(stableCount - 1);
  });
});

// ---------------------------------------------------------------------------
// Phase 8 / 10 / 11 — tools and the write boundary
// ---------------------------------------------------------------------------

describe('P0.VR.OPUS-NATIVE1 — tool surface and write boundary', () => {
  it('implements every tool the sprint named, and no general shell', () => {
    const implemented = OPUS_TOOL_DEFINITIONS.map((tool) => tool.name).sort();
    expect(implemented).toEqual([...OPUS_NATIVE_TOOLS].sort());

    for (const forbidden of ['run_command', 'shell', 'exec', 'bash', 'eval']) {
      expect(implemented).not.toContain(forbidden);
    }
  });

  it('never passes a model-supplied string to a shell', () => {
    const tools = read('api/_lib/site00OpusNative/tools.ts');
    expect(tools).toContain('execFile');
    expect(tools).not.toContain('shell: true');
    expect(tools).not.toMatch(/\bexec\(/);
    // The one model-influenced argument is validated to a character class.
    expect(tools).toContain('/^[\\w.\\-/]+$/.test(pattern)');
  });

  it('marks exactly the mutating tools as mutating', () => {
    const mutating = OPUS_TOOL_DEFINITIONS.filter((tool) => tool.mutating).map((tool) => tool.name).sort();
    // create_file joined the mutating set in P0.VR.OPUS-NATIVE2.
    expect(mutating).toEqual(['compare_screenshot', 'create_file', 'revert_patch', 'write_patch']);
  });

  it('keeps the canonical reconstruction read-only to the agent', async () => {
    const canonical = findSurface({ pageId: 'twin-opus-direct' })!;
    expect(canonical.writable).toEqual([]);
    expect(canonical.writeFirewallReason).toBeTruthy();

    const { compiled } = await compileAgentContext({
      mode: 'FORENSIC',
      task: 'anything',
      target: { pageId: 'twin-opus-direct' },
    });
    expect(compiled.writeAllowlist).toEqual([]);
    // It remains fully readable — the firewall is on writes only.
    expect(compiled.fileAllowlist.length).toBeGreaterThan(0);
  });

  it('limits the proof surface to its own stylesheet', async () => {
    const { compiled } = await compileAgentContext({
      mode: 'QUICK',
      task: 'anything',
      target: { pageId: 'opus-native-proof' },
    });
    expect(compiled.writeAllowlist).toEqual(['src/site00/styles/site00-opus-native.css']);
    for (const file of compiled.writeAllowlist) {
      expect(compiled.fileAllowlist).toContain(file);
    }
  });

  it('captures an exact baseline so revert restores content, not an approximation', () => {
    const sandbox = read('api/_lib/site00OpusNative/workspaceSandbox.ts');
    expect(sandbox).toContain('baseline[entry.file] = entry.before');
    expect(sandbox).toContain('export async function revertPatch');
    // Ambiguous anchors are a conflict, not a silent first-match replacement.
    expect(sandbox).toContain('matches ${occurrences} times');
  });
});

// ---------------------------------------------------------------------------
// Phase 17 — the approval boundary
// ---------------------------------------------------------------------------

describe('P0.VR.OPUS-NATIVE1 — founder approval boundary', () => {
  it('terminates a successful run at WAITING_FOR_FOUNDER_REVIEW', () => {
    const runtime = read('api/_lib/site00OpusNative/runtime.ts');
    expect(runtime).toContain("run.touch('WAITING_FOR_FOUNDER_REVIEW')");
    expect(runtime).not.toContain("touch('APPROVED')");
  });

  it('only lets a reviewable run be approved', () => {
    const approval = read('api/_lib/site00OpusNative/approval.ts');
    expect(approval).toContain('WAITING_FOR_FOUNDER_REVIEW');
    expect(approval).toContain('requireReviewable');
  });

  it('keeps the agent out of git entirely', () => {
    for (const file of walk('api/_lib/site00OpusNative')) {
      const source = read(file);
      // Prose about git is fine; invoking it is not.
      expect(source).not.toMatch(/(execFile|exec|spawn|spawnSync|execSync)\w*\(\s*['"`]git['"`]/);
      expect(source).not.toContain('simple-git');
    }
    // The only process the runtime ever launches is npm, for typecheck and tests.
    const launched = read('api/_lib/site00OpusNative/tools.ts').match(/execFileAsync\(\s*'([^']+)'/g) ?? [];
    expect(launched).toEqual(["execFileAsync('npm'"]);
  });

  it('allows revert from any state, including a failed run', () => {
    const approval = read('api/_lib/site00OpusNative/approval.ts');
    const revert = approval.slice(approval.indexOf('export async function revertRun'));
    expect(revert).not.toContain('requireReviewable');
  });

  it('records lineage with the source golden and the founder decision', () => {
    const runtime = read('api/_lib/site00OpusNative/runtime.ts');
    expect(runtime).toContain('sourceGolden: run.context.goldenReference');
    expect(runtime).toContain("founderDecision: 'PENDING'");
  });
});

// ---------------------------------------------------------------------------
// Phase 23 / 24
// ---------------------------------------------------------------------------

describe('P0.VR.OPUS-NATIVE1 — proof and parity', () => {
  it('anchors the proof transcript to a token that really exists', () => {
    expect(read('src/site00/styles/site00-opus-native.css')).toContain(PROOF_DIVIDER_TOKENS.before);
    expect(PROOF_DIVIDER_TOKENS.before).not.toBe(PROOF_DIVIDER_TOKENS.after);
  });

  it('closes the whole visual loop in the proof, not just the patch', () => {
    const tools = FIRST_PROOF_TRANSCRIPT.turns.flatMap((turn) => (turn.toolUses ?? []).map((use) => use.name));
    for (const required of [
      'read_file',
      'capture_current_render',
      'write_patch',
      'capture_screenshot',
      'compare_screenshot',
      'run_targeted_tests',
    ]) {
      expect(tools).toContain(required);
    }
    // Inspection precedes the patch, as the protocol requires.
    expect(tools.indexOf('read_file')).toBeLessThan(tools.indexOf('write_patch'));
    expect(tools.indexOf('capture_current_render')).toBeLessThan(tools.indexOf('write_patch'));
  });

  it('fits the proof inside the QUICK iteration budget', () => {
    expect(FIRST_PROOF_TRANSCRIPT.turns.length).toBeLessThanOrEqual(
      modeContract('QUICK').limits.maxIterations,
    );
  });

  it('keeps the scripted provider off unless the server enables it', () => {
    const runtime = read('api/_lib/site00OpusNative/runtime.ts');
    expect(runtime).toContain('if (!scriptedProviderEnabled())');
    expect(read('api/_lib/site00OpusNative/config.ts')).toContain('SITE00_OPUS_NATIVE_ALLOW_SCRIPTED');
  });

  it('classifies every parity row and names what blocks Cursor exit', () => {
    for (const row of NATIVE_OPUS_VS_CURSOR_GAP) {
      expect(['PARITY', 'BETTER_NATIVE', 'MISSING_NATIVE']).toContain(row.status);
      expect(row.capability.length).toBeGreaterThan(0);
    }
    const summary = summariseGap();
    expect(summary.parity + summary.betterNative + summary.missingNative).toBe(
      NATIVE_OPUS_VS_CURSOR_GAP.length,
    );
    // Honest reporting: git and editing are genuinely not there yet.
    expect(summary.blockers).toContain('git');
    expect(summary.cursorExitReady).not.toBe('YES');
  });
});

// ---------------------------------------------------------------------------
// Integration with the rest of DESIGN
// ---------------------------------------------------------------------------

describe('P0.VR.OPUS-NATIVE1 — does not disturb the existing DESIGN workspace', () => {
  it('registers the runtime endpoint and the isolated route', () => {
    expect(read('server/routes.ts')).toContain("{ path: '/api/site00/opus-native'");
    expect(read('src/site00/config/routes.ts')).toContain(
      "projectDesignOpusNative: '/projects/:projectSlug/design/opus-native'",
    );
    expect(read('src/routes/Site00Routes.tsx')).toContain('SITE00_ROUTES.projectDesignOpusNative');
  });

  it('shares no component or stylesheet with the canonical reconstruction', () => {
    const page = read('src/site00/pages/DesignOpusNativePage.tsx');
    expect(page).not.toContain('opusDirect');
    expect(page).not.toContain('twin-opus-direct');

    const css = read('src/site00/styles/site00-opus-native.css');
    expect(css).not.toContain('.tod-');
  });

  it('leaves the canonical surface registered but unwritable', () => {
    const writable = DESIGN_SURFACES.filter((surface) => surface.writable.length > 0);
    expect(writable.map((surface) => surface.pageId)).toEqual(['opus-native-proof']);
  });
});
