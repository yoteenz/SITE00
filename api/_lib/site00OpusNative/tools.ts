/**
 * P0.VR.OPUS-NATIVE1 — Phase 8 + 9: the controlled tool interface.
 *
 * Cursor gave the model broad agent access, including arbitrary shell. That is
 * not inherited here. Every capability is a named tool with a typed input, a
 * fixed allowlist and no general execution path. There is no run_command, and
 * the two tools that do execute anything — typecheck and targeted tests — run
 * fixed argv arrays with no shell interpolation, so a model-supplied string can
 * never become a command.
 */

import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import type { OpusNativeToolName, OpusNativeViewport } from '../../../shared/site00-opus-native/types.js';
import type { DesignSurfaceWritePolicy } from '../../../shared/site00-opus-native/writePolicy.js';
import {
  validateRegionPlan,
  validateRouteIntent,
  type ComponentDecision,
  type RegionClassification,
} from '../../../shared/site00-opus-native/pageCreation.js';
import { redactSecrets, repoRoot } from './config.js';
import { isInspectablePath } from './contextCompiler.js';
import { DESIGN_SURFACES, type DesignSurfaceEntry } from './designSurfaceRegistry.js';
import { captureScreenshot, compareScreenshots, inspectDom, previewReadiness } from './preview.js';
import { checkAssetMutation, isCreatablePath } from './writeAuthority.js';
import {
  applyPatch,
  AssetFirewallError,
  revertPatch,
  ScopeViolationError,
  type PatchEdit,
} from './workspaceSandbox.js';
import type { RunContextHandle } from './runContext.js';

const execFileAsync = promisify(execFile);

export interface ToolDefinition {
  name: OpusNativeToolName;
  description: string;
  input_schema: { type: 'object'; properties: Record<string, unknown>; required?: string[] };
  /** Whether the tool can change the working tree. */
  mutating: boolean;
}

export const OPUS_TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'read_project_context',
    description:
      'Return the compiled project canon for the active surface: design language, authority lineage and the other registered surfaces in this project.',
    input_schema: { type: 'object', properties: {} },
    mutating: false,
  },
  {
    name: 'read_design_contract',
    description:
      'Read an approved contract document for the active surface. Use "interaction" for the element inventory or "state" for the state model.',
    input_schema: {
      type: 'object',
      properties: { which: { type: 'string', enum: ['interaction', 'state'] } },
      required: ['which'],
    },
    mutating: false,
  },
  {
    name: 'read_file',
    description:
      'Read one repository file. Only files on this run\'s allowlist are readable; anything else is refused as a scope violation.',
    input_schema: {
      type: 'object',
      properties: { file: { type: 'string' } },
      required: ['file'],
    },
    mutating: false,
  },
  {
    name: 'search_code',
    description:
      'Search for a literal string across the files on this run\'s allowlist. Returns file, line number and the matching line.',
    input_schema: {
      type: 'object',
      properties: { query: { type: 'string' }, maxResults: { type: 'number' } },
      required: ['query'],
    },
    mutating: false,
  },
  {
    name: 'read_asset_manifest',
    description: 'List the approved reference assets registered for the active surface.',
    input_schema: { type: 'object', properties: {} },
    mutating: false,
  },
  {
    name: 'read_golden_reference',
    description:
      'Load the approved golden reference as an image, with its explicit identity (assetId, version, hash, dimensions, approval state).',
    input_schema: { type: 'object', properties: {} },
    mutating: false,
  },
  {
    name: 'capture_current_render',
    description:
      'Screenshot the active route at the run viewport and record it as the current render baseline for later comparison.',
    input_schema: {
      type: 'object',
      properties: { viewport: { type: 'string', enum: ['MOBILE', 'TABLET', 'DESKTOP'] } },
    },
    mutating: false,
  },
  {
    name: 'inspect_dom',
    description:
      'Measure real rendered boxes and computed styles for CSS selectors on the active route. Use this instead of guessing geometry from source.',
    input_schema: {
      type: 'object',
      properties: {
        selectors: { type: 'array', items: { type: 'string' } },
        viewport: { type: 'string', enum: ['MOBILE', 'TABLET', 'DESKTOP'] },
      },
      required: ['selectors'],
    },
    mutating: false,
  },
  {
    name: 'write_patch',
    description:
      'Apply surgical edits to files on the write allowlist. Each edit needs a unique find anchor with enough surrounding context to match exactly once. Full-file rewrites are not supported.',
    input_schema: {
      type: 'object',
      properties: {
        reason: { type: 'string' },
        edits: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              file: { type: 'string' },
              find: { type: 'string' },
              replace: { type: 'string' },
            },
            required: ['file', 'find', 'replace'],
          },
        },
      },
      required: ['reason', 'edits'],
    },
    mutating: true,
  },
  /**
   * P0.VR.OPUS-NATIVE2 — Phase 10. Deliberately not "write a file anywhere".
   * Creation is confined to the surface's declared create directories, refuses
   * to clobber an existing file unless told to, and produces the same
   * reversible patch record as an edit — so a created file is revertible by
   * deletion rather than left behind.
   */
  {
    name: 'create_file',
    description:
      'Create one new file inside this run\'s allowed create directories. Fails if the run has no creation authority, if the path is outside those directories, or if the file already exists and overwrite is not set. Produces a reversible patch entry.',
    input_schema: {
      type: 'object',
      properties: {
        file: { type: 'string' },
        content: { type: 'string' },
        reason: { type: 'string' },
        overwrite: { type: 'boolean' },
      },
      required: ['file', 'content', 'reason'],
    },
    mutating: true,
  },
  /**
   * Phase 15. The cheapest thing for a model to do is create a component it
   * could have imported, which is how a design system acquires four buttons.
   * This makes looking first a tool call rather than a hope.
   */
  {
    name: 'discover_components',
    description:
      'Search the existing design system for components matching a need, before creating a new one. Returns candidates with their paths and exported names so you can decide REUSE, EXTEND, FORK or CREATE.',
    input_schema: {
      type: 'object',
      properties: { need: { type: 'string' }, maxResults: { type: 'number' } },
      required: ['need'],
    },
    mutating: false,
  },
  /**
   * Phase 12/13/14. The gate a creation run must pass before it is allowed to
   * write anything: route grammar, collision, and the inheritance
   * classification for every region the parent requires.
   */
  {
    name: 'propose_page_plan',
    description:
      'Submit the creation plan for validation before creating any file: the route, the region classification (INHERITED / OVERRIDDEN / NEW with justification) and the component dispositions (REUSE / EXTEND / FORK / CREATE). Creation tools stay locked until this passes.',
    input_schema: {
      type: 'object',
      properties: {
        route: { type: 'string' },
        regions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              region: { type: 'string' },
              classification: { type: 'string', enum: ['INHERITED', 'OVERRIDDEN', 'NEW'] },
              justification: { type: 'string' },
            },
            required: ['region', 'classification'],
          },
        },
        components: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              need: { type: 'string' },
              disposition: { type: 'string', enum: ['REUSE', 'EXTEND', 'FORK', 'CREATE'] },
              existingCandidate: { type: 'string' },
              justification: { type: 'string' },
            },
            required: ['need', 'disposition', 'justification'],
          },
        },
      },
      required: ['route', 'regions', 'components'],
    },
    mutating: false,
  },
  {
    name: 'run_typecheck',
    description: 'Run the repository TypeScript typecheck and return the result.',
    input_schema: { type: 'object', properties: {} },
    mutating: false,
  },
  {
    name: 'run_targeted_tests',
    description:
      'Run the vitest suites matching a name pattern. Scoped to the test files relevant to the surface you touched.',
    input_schema: {
      type: 'object',
      properties: { pattern: { type: 'string' } },
      required: ['pattern'],
    },
    mutating: false,
  },
  {
    name: 'launch_or_refresh_preview',
    description: 'Check that the preview server and browser are available for rendering.',
    input_schema: { type: 'object', properties: {} },
    mutating: false,
  },
  {
    name: 'capture_screenshot',
    description: 'Screenshot the active route at a given viewport and return the artifact id.',
    input_schema: {
      type: 'object',
      properties: {
        viewport: { type: 'string', enum: ['MOBILE', 'TABLET', 'DESKTOP'] },
        label: { type: 'string' },
      },
    },
    mutating: false,
  },
  {
    name: 'compare_screenshot',
    description:
      'Quantitatively compare two captured screenshots. Returns an overall changed-pixel percentage and a per-band breakdown so you can locate the change.',
    input_schema: {
      type: 'object',
      properties: { beforeId: { type: 'string' }, afterId: { type: 'string' } },
      required: ['beforeId', 'afterId'],
    },
    mutating: true,
  },
  {
    name: 'revert_patch',
    description: 'Restore every file this run touched to its exact pre-run content.',
    input_schema: { type: 'object', properties: {} },
    mutating: true,
  },
];

export interface ToolResult {
  ok: boolean;
  summary: string;
  /** Text handed back to the model. */
  content: string;
  /** Image handed back to the model, where the tool returns visual context. */
  image?: { mediaType: string; base64: string };
}

export interface ToolContext {
  run: RunContextHandle;
  surface: DesignSurfaceEntry;
  fileAllowlist: string[];
  writeAllowlist: string[];
  /** P0.VR.OPUS-NATIVE2 — resolved capability, not just a file list. */
  policy: DesignSurfaceWritePolicy;
  viewport: OpusNativeViewport;
  route: string;
}

export async function dispatchTool(
  name: string,
  rawInput: Record<string, unknown>,
  ctx: ToolContext,
): Promise<ToolResult> {
  try {
    return await dispatchInner(name, rawInput, ctx);
  } catch (error) {
    if (error instanceof ScopeViolationError) {
      return {
        ok: false,
        summary: `scope violation: ${error.file}`,
        content: `SCOPE_VIOLATION. ${error.file} is not on the write allowlist for this run (mode ${ctx.policy.mode}). Writable files: ${error.allowed.join(', ') || 'none'}. ${ctx.surface.writeFirewallReason ?? ''}\n\nNothing was written: the patch was rejected before any file was touched.`,
      };
    }
    if (error instanceof AssetFirewallError) {
      return {
        ok: false,
        summary: 'asset mutation blocked',
        content: `ASSET_MUTATION_BLOCKED. ${error.detail}\n\nYou own structure, typography, icons and interaction. Approved raster assets belong to Grok and their identity is not yours to change. Nothing was written. If the task genuinely requires an asset change, stop and say so — the founder must grant it explicitly.`,
      };
    }
    const message = redactSecrets((error as Error).message ?? String(error));
    return { ok: false, summary: `tool error: ${name}`, content: `TOOL_ERROR. ${message}` };
  }
}

async function dispatchInner(
  name: string,
  input: Record<string, unknown>,
  ctx: ToolContext,
): Promise<ToolResult> {
  switch (name) {
    case 'read_project_context':
      return textResult(
        'project context',
        ctx.run.projectContextText(),
      );

    case 'read_design_contract': {
      const which = String(input.which ?? 'interaction');
      const file = which === 'state' ? ctx.surface.stateContractPath : ctx.surface.interactionContractPath;
      if (!file) return failure(`no ${which} contract registered for this surface`);
      const text = await readAllowedFile(file, [...ctx.fileAllowlist, file]);
      return textResult(`${which} contract`, text);
    }

    case 'read_file': {
      const file = String(input.file ?? '');
      const text = await readAllowedFile(file, ctx.fileAllowlist);
      return textResult(`read ${file}`, text);
    }

    case 'search_code': {
      const query = String(input.query ?? '');
      if (!query) return failure('search_code requires a query');
      const maxResults = Math.min(Number(input.maxResults ?? 40) || 40, 200);
      const hits: string[] = [];
      for (const file of ctx.fileAllowlist) {
        if (hits.length >= maxResults) break;
        const text = await safeRead(file);
        if (!text) continue;
        const lines = text.split('\n');
        for (let i = 0; i < lines.length && hits.length < maxResults; i += 1) {
          if (lines[i].includes(query)) hits.push(`${file}:${i + 1}: ${lines[i].trim()}`);
        }
      }
      return textResult(
        `search "${query}" — ${hits.length} hit(s)`,
        hits.length > 0 ? hits.join('\n') : `No matches for "${query}" in the ${ctx.fileAllowlist.length} allowlisted files.`,
      );
    }

    case 'read_asset_manifest':
      return textResult(
        'asset manifest',
        ctx.surface.goldenReferencePath
          ? `Approved reference assets:\n  - ${ctx.surface.goldenReferencePath} (version ${ctx.surface.goldenReferenceVersion}, ${ctx.surface.goldenApprovalState})\n\nReminder: reference assets are for comparison only. Never use one as page content.`
          : 'No approved reference assets registered for this surface.',
      );

    case 'read_golden_reference': {
      const golden = ctx.run.golden();
      if (!golden || !ctx.surface.goldenReferencePath) return failure('no golden reference registered');
      const abs = path.resolve(repoRoot(), ctx.surface.goldenReferencePath);
      const buffer = await readFile(abs);
      const mediaType = ctx.surface.goldenReferencePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
      return {
        ok: true,
        summary: `golden ${golden.assetId} (${golden.width}x${golden.height})`,
        content: `GOLDEN REFERENCE\nassetId: ${golden.assetId}\nversion: ${golden.version}\nhash: ${golden.hash}\ndimensions: ${golden.width}x${golden.height}\napprovalState: ${golden.approvalState}`,
        image: { mediaType, base64: buffer.toString('base64') },
      };
    }

    case 'capture_current_render':
    case 'capture_screenshot': {
      const viewport = (String(input.viewport ?? ctx.viewport) as OpusNativeViewport);
      const label = name === 'capture_current_render' ? 'before' : String(input.label ?? 'after');
      const shot = await captureScreenshot({ route: ctx.route, viewport, label });
      ctx.run.addScreenshot(shot);
      const buffer = await readFile(shot.path);
      return {
        ok: true,
        summary: `screenshot ${shot.screenshotId} (${viewport})`,
        content: `Captured ${shot.screenshotId} at ${viewport} ${shot.width}x${shot.height}. Use this id with compare_screenshot.`,
        image: { mediaType: 'image/png', base64: buffer.toString('base64') },
      };
    }

    case 'inspect_dom': {
      const selectors = Array.isArray(input.selectors) ? input.selectors.map(String).slice(0, 25) : [];
      if (selectors.length === 0) return failure('inspect_dom requires at least one selector');
      const viewport = (String(input.viewport ?? ctx.viewport) as OpusNativeViewport);
      const measured = await inspectDom({ route: ctx.route, viewport, selectors });
      return textResult(`measured ${selectors.length} selector(s)`, JSON.stringify(measured, null, 2));
    }

    case 'write_patch': {
      const reason = String(input.reason ?? '').trim();
      const rawEdits = Array.isArray(input.edits) ? input.edits : [];
      if (!reason) return failure('write_patch requires a reason');
      if (rawEdits.length === 0) return failure('write_patch requires at least one edit');

      const edits: PatchEdit[] = rawEdits.map((edit) => {
        const record = edit as Record<string, unknown>;
        return {
          file: String(record.file ?? ''),
          find: String(record.find ?? ''),
          replace: String(record.replace ?? ''),
        };
      });

      const patch = await applyPatch({
        runId: ctx.run.runId,
        edits,
        reason,
        writeAllowlist: ctx.writeAllowlist,
        canCreate: (file) => isCreatablePath(file, ctx.policy),
        assetGuard: (candidate) => checkAssetMutation(candidate, ctx.surface, ctx.policy),
        existingBaseline: ctx.run.patch()?.baseline,
      });
      ctx.run.setPatch(patch);
      return textResult(
        `patched ${patch.filesChanged.join(', ')}`,
        `Patch ${patch.patchId} applied to the sandbox working tree.\nFiles: ${patch.filesChanged.join(', ')}\nReversible: yes.\n\nThis is NOT approved. Render the route, screenshot it, compare, and run the guards before handing to founder review.`,
      );
    }

    /** Phase 10 — creation, gated on capability, directory and plan. */
    case 'create_file': {
      const file = String(input.file ?? '');
      const content = String(input.content ?? '');
      const reason = String(input.reason ?? '').trim();
      if (!reason) return failure('create_file requires a reason');
      if (!ctx.policy.allowNewFiles) {
        return failure(
          `WRITE_AUTHORITY_INSUFFICIENT. This run is at ${ctx.policy.mode}, which cannot create files. File creation requires PAGE_CREATE or DERIVATIVE_CREATE, granted by the founder.`,
        );
      }
      if (!isCreatablePath(file, ctx.policy)) {
        return failure(
          `SCOPE_VIOLATION. ${file} is outside this run's create directories: ${ctx.policy.allowedDirectories.join(', ') || 'none'}.`,
        );
      }
      // Phase 12/14 — creating files before the plan is validated is how a
      // page acquires a route nobody agreed to.
      if (!ctx.run.creationPlanApproved()) {
        return failure(
          'PLAN_REQUIRED. Call propose_page_plan and pass its validation before creating files.',
        );
      }

      const patch = await applyPatch({
        runId: ctx.run.runId,
        edits: [],
        creates: [{ file, content, overwrite: input.overwrite === true }],
        reason,
        writeAllowlist: ctx.writeAllowlist,
        canCreate: (candidate) => isCreatablePath(candidate, ctx.policy),
        assetGuard: (candidate) => checkAssetMutation(candidate, ctx.surface, ctx.policy),
        existingBaseline: ctx.run.patch()?.baseline,
      });
      ctx.run.setPatch(patch);
      return textResult(
        `created ${file}`,
        `Created ${file} (${content.length} bytes) as part of patch ${patch.patchId}. Reverting this run deletes it.`,
      );
    }

    /** Phase 15 — look before you build. */
    case 'discover_components': {
      const need = String(input.need ?? '').trim();
      if (!need) return failure('discover_components requires a need');
      const maxResults = Math.min(Number(input.maxResults ?? 12) || 12, 40);
      const terms = need
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((term) => term.length > 2);

      const candidates: Array<{ file: string; exports: string[]; score: number }> = [];
      for (const file of ctx.fileAllowlist) {
        if (!/\.tsx$/.test(file)) continue;
        const text = await safeRead(file);
        if (!text) continue;
        const exported = [...text.matchAll(/export\s+function\s+([A-Z]\w+)/g)].map((match) => match[1]);
        if (exported.length === 0) continue;
        const haystack = `${file} ${exported.join(' ')}`.toLowerCase();
        const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
        if (score > 0) candidates.push({ file, exports: exported, score });
      }
      candidates.sort((a, b) => b.score - a.score);
      const top = candidates.slice(0, maxResults);

      return textResult(
        `${top.length} candidate component file(s) for "${need}"`,
        top.length > 0
          ? `Existing components that may already meet "${need}":\n${top
              .map((entry) => `  - ${entry.file}\n      exports: ${entry.exports.join(', ')}`)
              .join('\n')}\n\nDecide REUSE, EXTEND, FORK or CREATE for each need and justify it in propose_page_plan. Creating a duplicate of one of these is a rejected outcome.`
          : `No existing component matched "${need}" in the ${ctx.fileAllowlist.length} allowlisted files. CREATE is defensible here; say so in your plan.`,
      );
    }

    /** Phase 12/13/14 — the creation gate. */
    case 'propose_page_plan': {
      if (!ctx.policy.allowNewFiles) {
        return failure(
          `WRITE_AUTHORITY_INSUFFICIENT. propose_page_plan applies to creation runs; this run is at ${ctx.policy.mode}.`,
        );
      }
      const route = String(input.route ?? '').trim();
      const regions = (Array.isArray(input.regions) ? input.regions : []).map((raw) => {
        const record = raw as Record<string, unknown>;
        return {
          region: String(record.region ?? ''),
          classification: String(record.classification ?? 'NEW') as RegionClassification['classification'],
          justification: record.justification ? String(record.justification) : null,
        };
      });
      const components = (Array.isArray(input.components) ? input.components : []).map((raw) => {
        const record = raw as Record<string, unknown>;
        return {
          need: String(record.need ?? ''),
          disposition: String(record.disposition ?? 'CREATE') as ComponentDecision['disposition'],
          existingCandidate: record.existingCandidate ? String(record.existingCandidate) : null,
          justification: String(record.justification ?? ''),
        };
      });

      const problems: string[] = [];

      const routeCheck = validateRouteIntent(
        route,
        DESIGN_SURFACES.map((surface) => surface.route),
        ctx.surface.route,
      );
      if (!routeCheck.valid) problems.push(`ROUTE: ${routeCheck.reason}`);
      if (!ctx.policy.allowRouteCreation && route) {
        problems.push('ROUTE: this run has no route-creation authority');
      }

      const regionCheck = validateRegionPlan(regions, ctx.surface.inheritanceRules?.mustInherit ?? []);
      problems.push(...regionCheck.problems.map((problem) => `INHERITANCE: ${problem}`));

      for (const decision of components) {
        if (decision.disposition === 'CREATE' && !decision.justification.trim()) {
          problems.push(`COMPONENT: "${decision.need}" is CREATE with no justification`);
        }
        if (decision.disposition !== 'CREATE' && !decision.existingCandidate) {
          problems.push(`COMPONENT: "${decision.need}" is ${decision.disposition} but names no existing candidate`);
        }
      }

      if (problems.length > 0) {
        return {
          ok: false,
          summary: `plan rejected (${problems.length} problem(s))`,
          content: `PLAN_REJECTED. Fix these and resubmit:\n${problems.map((problem) => `  - ${problem}`).join('\n')}`,
        };
      }

      ctx.run.approveCreationPlan({ route, regions, components });
      return textResult(
        'plan accepted',
        `PLAN_ACCEPTED.\nRoute: ${route}\nRegions: ${regions
          .map((region) => `${region.region}=${region.classification}`)
          .join(', ')}\nComponents: ${components
          .map((decision) => `${decision.need}=${decision.disposition}`)
          .join(', ')}\n\ncreate_file is now unlocked for this run.`,
      );
    }

    case 'run_typecheck': {
      const result = await runNpm(['run', 'typecheck']);
      ctx.run.setTypecheck(result);
      return {
        ok: result.ok,
        summary: `typecheck ${result.ok ? 'passed' : 'failed'}`,
        content: `TYPECHECK ${result.ok ? 'PASS' : 'FAIL'}\n${tail(result.output, 4000)}`,
      };
    }

    case 'run_targeted_tests': {
      const pattern = String(input.pattern ?? '').trim();
      if (!pattern) return failure('run_targeted_tests requires a pattern');
      if (!/^[\w.\-/]+$/.test(pattern)) {
        return failure('test pattern may only contain letters, numbers, dot, dash, underscore and slash');
      }
      const result = await runNpm(['test', '--', pattern]);
      ctx.run.setTests(result);
      return {
        ok: result.ok,
        summary: `tests ${result.ok ? 'passed' : 'failed'}`,
        content: `TESTS ${result.ok ? 'PASS' : 'FAIL'}\n${tail(result.output, 4000)}`,
      };
    }

    case 'launch_or_refresh_preview': {
      const readiness = await previewReadiness(ctx.route);
      return {
        ok: readiness.ready,
        summary: `preview ${readiness.ready ? 'ready' : `blocked: ${readiness.reason}`}`,
        content: readiness.ready
          ? `PREVIEW READY. ${readiness.detail}`
          : `PREVIEW BLOCKED\nreason: ${readiness.reason}\ndetail: ${readiness.detail}\norigin: ${readiness.origin || '(none configured)'}\nenvironment: ${readiness.environment}\nremedy: ${readiness.remedy ?? 'none'}\n\nYou cannot see the render, so you cannot certify this change visually. Say so explicitly in your summary rather than inferring the result from the source.`,
      };
    }

    case 'compare_screenshot': {
      const before = ctx.run.screenshotById(String(input.beforeId ?? ''));
      const after = ctx.run.screenshotById(String(input.afterId ?? ''));
      if (!before || !after) return failure('compare_screenshot needs two ids captured during this run');
      const diff = await compareScreenshots(before.path, after.path);
      ctx.run.recordComparison(after.screenshotId, before.screenshotId, diff.diffPercent);
      return textResult(
        `diff ${diff.diffPercent}%`,
        `COMPARISON ${before.screenshotId} -> ${after.screenshotId}\nOverall changed pixels: ${diff.diffPercent}%\nPer band:\n${diff.changedRegions.map((r) => `  ${r.band}: ${r.diffPercent}%`).join('\n')}`,
      );
    }

    case 'revert_patch': {
      const patch = ctx.run.patch();
      if (!patch) return failure('this run has no patch to revert');
      const { reverted } = await revertPatch(patch);
      return textResult('patch reverted', `Reverted ${reverted.join(', ') || 'nothing'} to pre-run content.`);
    }

    default:
      return failure(`MALFORMED_TOOL_CALL: unknown tool "${name}"`);
  }
}

function textResult(summary: string, content: string): ToolResult {
  return { ok: true, summary, content: redactSecrets(content) };
}

function failure(message: string): ToolResult {
  return { ok: false, summary: message, content: redactSecrets(message) };
}

async function readAllowedFile(file: string, allowlist: string[]): Promise<string> {
  if (!isInspectablePath(file) || !allowlist.includes(file)) {
    throw new ScopeViolationError(file, allowlist);
  }
  const text = await safeRead(file);
  if (text === null) throw new Error(`file not found: ${file}`);
  return text.length > 40_000 ? `${text.slice(0, 40_000)}\n… [truncated]` : text;
}

async function safeRead(file: string): Promise<string | null> {
  try {
    return await readFile(path.resolve(repoRoot(), file), 'utf8');
  } catch {
    return null;
  }
}

/**
 * Fixed argv, no shell. The only model-influenced value is the test pattern,
 * which is validated to a character class above before it reaches here.
 */
async function runNpm(args: string[]): Promise<{ ran: boolean; ok: boolean; output: string }> {
  try {
    const { stdout, stderr } = await execFileAsync('npm', args, {
      cwd: repoRoot(),
      timeout: 300_000,
      maxBuffer: 16 * 1024 * 1024,
      env: { ...process.env, CI: '1', ANTHROPIC_API_KEY: '' },
    });
    return { ran: true, ok: true, output: redactSecrets(`${stdout}\n${stderr}`) };
  } catch (error) {
    const failed = error as { stdout?: string; stderr?: string; message?: string };
    return {
      ran: true,
      ok: false,
      output: redactSecrets(`${failed.stdout ?? ''}\n${failed.stderr ?? ''}\n${failed.message ?? ''}`),
    };
  }
}

function tail(text: string, max: number): string {
  return text.length <= max ? text : `… ${text.slice(-max)}`;
}
