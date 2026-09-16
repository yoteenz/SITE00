/**
 * P0.VR.OPUS-NATIVE1 — Phase 3, 4, 5, 9, 14, 18.
 *
 * Compiles the minimum sufficient context for one task, in four tiers ordered
 * so the stable prefix can be cached by Anthropic and the volatile task detail
 * sits last.
 *
 * The ordering is the whole point. Tier 1 and 2 change rarely and are marked
 * with cache breakpoints; tier 3 changes per page; tier 4 changes per run. A
 * second run against the same page therefore re-reads most of its input from
 * cache at a tenth of the price instead of paying full input rate for the
 * protocol and project canon again.
 */

import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import {
  OPUS_DESIGN_EXECUTION_PROTOCOL_HASH,
  OPUS_DESIGN_EXECUTION_PROTOCOL_V1,
  OPUS_DESIGN_EXECUTION_PROTOCOL_VERSION,
} from '../../../shared/site00-opus-native/protocol.js';
import { modeContract } from '../../../shared/site00-opus-native/modeContracts.js';
import { estimateTokens } from '../../../shared/site00-opus-native/pricing.js';
import type {
  CompiledAgentContext,
  DesignAgentContext,
  OpusContextBlock,
  OpusNativeGoldenReference,
  OpusNativeMode,
  OpusNativeViewport,
} from '../../../shared/site00-opus-native/types.js';
import type { OpusNativeTargetRef } from '../../../shared/site00-opus-native/contracts.js';
import { repoRoot } from './config.js';
import { DESIGN_SURFACES, defaultSurface, findSurface, type DesignSurfaceEntry } from './designSurfaceRegistry.js';

const MAX_FILE_CHARS = 24_000;

async function readRepoFile(relative: string): Promise<string | null> {
  try {
    const abs = path.resolve(repoRoot(), relative);
    const text = await readFile(abs, 'utf8');
    return text.length > MAX_FILE_CHARS ? `${text.slice(0, MAX_FILE_CHARS)}\n… [truncated]` : text;
  } catch {
    return null;
  }
}

/** Phase 14 — resolve the golden to an identity, not a description. */
async function resolveGolden(surface: DesignSurfaceEntry): Promise<OpusNativeGoldenReference | null> {
  if (!surface.goldenReferencePath) return null;
  const abs = path.resolve(repoRoot(), surface.goldenReferencePath);
  try {
    const info = await stat(abs);
    const buffer = await readFile(abs);
    const hash = createHash('sha256').update(buffer).digest('hex').slice(0, 16);
    const dimensions = readJpegOrPngDimensions(buffer);
    return {
      assetId: surface.goldenReferenceVersion,
      path: surface.goldenReferencePath,
      version: surface.goldenReferenceVersion,
      hash,
      width: dimensions?.width ?? 0,
      height: dimensions?.height ?? 0,
      approvalState: surface.goldenApprovalState,
    };
  } catch {
    return {
      assetId: surface.goldenReferenceVersion,
      path: surface.goldenReferencePath,
      version: surface.goldenReferenceVersion,
      hash: 'UNAVAILABLE',
      width: 0,
      height: 0,
      approvalState: 'UNKNOWN',
    };
  }
}

/** Minimal header parse so reference dimensions are measured, never assumed. */
export function readJpegOrPngDimensions(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length > 24 && buffer.readUInt32BE(0) === 0x89504e47) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (buffer.length > 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      const segmentLength = buffer.readUInt16BE(offset + 2);
      const isSof = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
      if (isSof) {
        return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      }
      offset += 2 + segmentLength;
    }
  }
  return null;
}

/**
 * Phase 9 — dependency-aware expansion. Start from the surface's declared entry
 * points and follow relative imports outwards only as far as the mode allows.
 * A QUICK run sees the entry points and nothing else; FORENSIC walks two hops.
 * Nothing outside the repository, and nothing outside src/shared/docs, is ever
 * reachable.
 */
export async function expandFileBoundary(
  entryPoints: string[],
  depth: number,
): Promise<string[]> {
  const seen = new Set(entryPoints);
  let frontier = [...entryPoints];

  for (let hop = 0; hop < depth; hop += 1) {
    const next: string[] = [];
    for (const file of frontier) {
      const text = await readRepoFile(file);
      if (!text) continue;
      for (const spec of text.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
        const resolved = await resolveRelativeImport(file, spec[1]);
        if (resolved && !seen.has(resolved)) {
          seen.add(resolved);
          next.push(resolved);
        }
      }
    }
    if (next.length === 0) break;
    frontier = next;
  }

  return [...seen].filter(isInspectablePath);
}

const INSPECTABLE_ROOTS = ['src/', 'shared/', 'docs/', 'public/site00/'];

export function isInspectablePath(relative: string): boolean {
  if (relative.includes('..')) return false;
  if (path.isAbsolute(relative)) return false;
  return INSPECTABLE_ROOTS.some((root) => relative.startsWith(root));
}

async function resolveRelativeImport(fromFile: string, spec: string): Promise<string | null> {
  const base = path.posix.join(path.posix.dirname(fromFile), spec);
  const candidates = [
    base,
    base.replace(/\.js$/, '.ts'),
    base.replace(/\.js$/, '.tsx'),
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.css`,
    `${base}/index.ts`,
    `${base}/index.tsx`,
  ];
  for (const candidate of candidates) {
    if (!isInspectablePath(candidate)) continue;
    try {
      await stat(path.resolve(repoRoot(), candidate));
      return candidate;
    } catch {
      /* try next */
    }
  }
  return null;
}

export function buildDesignAgentContext(
  target: OpusNativeTargetRef | undefined,
  surface: DesignSurfaceEntry,
  golden: OpusNativeGoldenReference | null,
): DesignAgentContext {
  return {
    projectId: target?.projectSlug ?? surface.projectSlug,
    projectName: surface.projectName,
    projectType: surface.projectType,

    route: surface.route.replace(':projectSlug', target?.projectSlug ?? surface.projectSlug),
    pageId: surface.pageId,
    pageRole: surface.pageRole,

    viewMode: target?.viewMode ?? 'canonical',
    viewport: (target?.viewport ?? 'MOBILE') as OpusNativeViewport,

    goldenReference: golden,
    approvedReferenceAssets: surface.goldenReferencePath ? [surface.goldenReferencePath] : [],

    brandWorldContext: surface.creativeContext,
    projectDesignLanguage: surface.designLanguage,
    creativeContext: surface.creativeContext,

    currentDesignAuthority: surface.currentDesignAuthority,
    parentDesignAuthority: surface.parentDesignAuthority,

    currentScreenshot: null,

    relevantComponents: surface.components,
    relevantStyles: surface.styles,
    relevantAssets: surface.goldenReferencePath ? [surface.goldenReferencePath] : [],

    interactionContract: surface.interactionContractPath,
    stateContract: surface.stateContractPath,

    approvedLineage: surface.approvedLineage,
  };
}

export interface CompileInput {
  mode: OpusNativeMode;
  task: string;
  target?: OpusNativeTargetRef;
}

export interface CompileResult {
  context: DesignAgentContext;
  compiled: CompiledAgentContext;
  surface: DesignSurfaceEntry;
}

export async function compileAgentContext(input: CompileInput): Promise<CompileResult> {
  const surface = findSurface({ route: input.target?.route, pageId: input.target?.pageId }) ?? defaultSurface();
  const contract = modeContract(input.mode);
  const golden = await resolveGolden(surface);
  const context = buildDesignAgentContext(input.target, surface, golden);

  const blocks: OpusContextBlock[] = [];

  // ---- Tier 1: STABLE_CACHEABLE_CONTEXT -----------------------------------
  // Identical for every run in every project. The largest single block, and
  // the one that most rewards caching.
  blocks.push(makeBlock(
    'STABLE_CACHEABLE_CONTEXT',
    'OPUS_DESIGN_EXECUTION_PROTOCOL_V1',
    OPUS_DESIGN_EXECUTION_PROTOCOL_V1,
    true,
    ['shared/site00-opus-native/protocol.ts'],
  ));

  blocks.push(makeBlock(
    'STABLE_CACHEABLE_CONTEXT',
    'DESIGN_AUTHORITY_RULES',
    designAuthorityRules(),
    true,
    ['api/_lib/site00OpusNative/contextCompiler.ts'],
  ));

  // ---- Tier 2: PROJECT_CONTEXT --------------------------------------------
  // Stable per project, so still cacheable, but only compiled for modes that
  // need it. A QUICK border fix does not need the project canon.
  if (contract.includeProjectContext) {
    blocks.push(makeBlock(
      'PROJECT_CONTEXT',
      `PROJECT_CANON:${context.projectName}`,
      projectCanon(context, surface),
      true,
      ['api/_lib/site00OpusNative/designSurfaceRegistry.ts'],
    ));
  }

  if (contract.includeInteractionContract && surface.interactionContractPath) {
    const interaction = await readRepoFile(surface.interactionContractPath);
    if (interaction) {
      blocks.push(makeBlock(
        'PROJECT_CONTEXT',
        'APPROVED_INTERACTION_CONTRACT',
        interaction,
        true,
        [surface.interactionContractPath],
      ));
    }
  }

  // ---- Tier 3: PAGE_CONTEXT ------------------------------------------------
  const fileAllowlist = await expandFileBoundary(
    [...surface.components, ...surface.styles, ...surface.stateHooks, ...surface.contentModules,
      ...(input.target?.focusFiles ?? []).filter(isInspectablePath)],
    contract.dependencyDepth,
  );

  blocks.push(makeBlock(
    'PAGE_CONTEXT',
    `PAGE:${surface.pageId}`,
    pageContext(context, surface, fileAllowlist),
    false,
    [surface.route],
  ));

  // ---- Tier 4: TASK_CONTEXT ------------------------------------------------
  blocks.push(makeBlock(
    'TASK_CONTEXT',
    'TASK',
    taskContext(input, surface, contract.maxVisualLoops),
    false,
    [],
  ));

  const trimmed = trimToBudget(blocks, contract.contextBudgetTokens);

  return {
    context,
    surface,
    compiled: {
      blocks: trimmed,
      totalEstimatedTokens: trimmed.reduce((sum, block) => sum + block.estimatedTokens, 0),
      cacheableEstimatedTokens: trimmed
        .filter((block) => block.cacheable)
        .reduce((sum, block) => sum + block.estimatedTokens, 0),
      fileAllowlist,
      writeAllowlist: surface.writable.filter((file) => isInspectablePath(file)),
      protocolVersion: OPUS_DESIGN_EXECUTION_PROTOCOL_VERSION,
      protocolHash: OPUS_DESIGN_EXECUTION_PROTOCOL_HASH,
    },
  };
}

function makeBlock(
  tier: OpusContextBlock['tier'],
  label: string,
  text: string,
  cacheable: boolean,
  sources: string[],
): OpusContextBlock {
  return { tier, label, text, cacheable, sources, estimatedTokens: estimateTokens(text) };
}

/**
 * Budget enforcement never drops a stable tier — dropping the protocol to save
 * tokens would remove the thing that makes the run correct. Page and task
 * context are trimmed instead, and the agent is told it happened so it can
 * request specific files rather than assume it saw everything.
 */
function trimToBudget(blocks: OpusContextBlock[], budget: number): OpusContextBlock[] {
  let total = blocks.reduce((sum, block) => sum + block.estimatedTokens, 0);
  if (total <= budget) return blocks;

  const out = [...blocks];
  for (let i = out.length - 1; i >= 0 && total > budget; i -= 1) {
    const block = out[i];
    if (block.tier === 'STABLE_CACHEABLE_CONTEXT' || block.tier === 'TASK_CONTEXT') continue;
    const overBy = total - budget;
    const keepChars = Math.max(500, block.text.length - overBy * 4);
    if (keepChars >= block.text.length) continue;
    const trimmedText = `${block.text.slice(0, keepChars)}\n… [trimmed to fit the ${budget} token context budget for this mode. Request specific files with read_file if you need more.]`;
    out[i] = { ...block, text: trimmedText, estimatedTokens: estimateTokens(trimmedText) };
    total = out.reduce((sum, b) => sum + b.estimatedTokens, 0);
  }
  return out;
}

function designAuthorityRules(): string {
  return `# DESIGN AUTHORITY RULES

- The approved golden reference is the visual authority. Load it; never work from a description of it.
- The product architecture is the behavioural authority. Where the reference implies a behaviour the architecture contradicts, the architecture wins and you flag the reference.
- Selection is reversible. Promotion is forward-only. Locking is irreversible and has no unlock path.
- Never render a value that has no computation behind it. Allowed status vocabulary: READY, MISSING, BLOCKED, UNKNOWN, STALE.
- A card is not a page. Inspection surfaces are inline, dock, sheet or drawer — not routes.
- You may not create routes, invent state values outside declared unions, or add audit event types.
- You may not mark your own work approved. Every run ends at the founder review boundary.`;
}

function projectCanon(context: DesignAgentContext, surface: DesignSurfaceEntry): string {
  return `# PROJECT CANON — ${context.projectName}

Project type: ${context.projectType}
Creative context: ${context.creativeContext ?? 'unknown'}
Design language: ${context.projectDesignLanguage ?? 'unknown'}

Current design authority: ${context.currentDesignAuthority ?? 'none'}
Parent design authority: ${context.parentDesignAuthority ?? 'none'}
Approved lineage (oldest first):
${surface.approvedLineage.map((entry) => `  - ${entry}`).join('\n') || '  - none recorded'}

Registered design surfaces in this project:
${DESIGN_SURFACES.filter((s) => s.projectSlug === surface.projectSlug)
  .map((s) => `  - ${s.pageId} (${s.route}) — ${s.writable.length > 0 ? 'writable' : 'READ ONLY'}`)
  .join('\n')}`;
}

function pageContext(
  context: DesignAgentContext,
  surface: DesignSurfaceEntry,
  allowlist: string[],
): string {
  const golden = context.goldenReference;
  return `# ACTIVE PAGE

Route: ${context.route}
Page id: ${context.pageId}
Page role: ${context.pageRole}
View mode: ${context.viewMode}
Viewport: ${context.viewport}

## Golden reference
${golden
  ? `assetId: ${golden.assetId}
path: ${golden.path}
version: ${golden.version}
hash: ${golden.hash}
dimensions: ${golden.width}x${golden.height}
approvalState: ${golden.approvalState}

Call read_golden_reference to load it as an image. Do not describe it from memory.`
  : 'No golden reference registered for this surface.'}

## Files you may read (${allowlist.length})
${allowlist.map((file) => `  - ${file}`).join('\n')}

## Files you may write
${surface.writable.length > 0
  ? surface.writable.map((file) => `  - ${file}`).join('\n')
  : `  NONE. ${surface.writeFirewallReason ?? 'This surface is read-only.'}`}

Any attempt to read or write outside these lists is refused by the tool layer and recorded as a scope violation.`;
}

function taskContext(input: CompileInput, surface: DesignSurfaceEntry, maxLoops: number): string {
  const contract = modeContract(input.mode);
  return `# TASK

Mode: ${input.mode} — ${contract.purpose}
Visual loop budget: ${maxLoops}
Iteration ceiling: ${contract.limits.maxIterations}
Spend ceiling: $${contract.limits.maxRunCostUsd}

Founder's task:
${input.task}

## Required method for this run
1. Inspect the reference and the source before changing anything.
2. Map the discrepancy in measurable terms.
3. Correct parent geometry before child geometry.
4. Patch only files on the write allowlist, using write_patch.
5. Render and screenshot the route. You may not certify from code inspection.
6. Run a typecheck and the targeted tests for what you touched.
7. Stop and hand to founder review. Do not attempt to approve or apply.

${surface.writable.length === 0
  ? 'This surface is READ ONLY. If the task requires an edit here, stop immediately and report the firewall rather than patching anything.'
  : ''}`;
}
