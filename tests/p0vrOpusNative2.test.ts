/**
 * P0.VR.OPUS-NATIVE2 — guards.
 *
 * These test behaviour, not the presence of strings. The write ladder is
 * exercised by resolving it, the sandbox by writing to a temporary tree, the
 * asset firewall by handing it edits that should be refused. A guard that only
 * asserts a file mentions a word is a guard that passes after the behaviour
 * has been deleted.
 */

import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  DESIGN_AGENT_INTENT_SPECS,
  DESIGN_WRITE_MODES,
  writeModeAtLeast,
  writeModeRank,
} from '../shared/site00-opus-native/writePolicy';
import {
  ROUTE_GRAMMAR,
  validateRegionPlan,
  validateRouteIntent,
} from '../shared/site00-opus-native/pageCreation';
import { renderCompaction } from '../shared/site00-opus-native/session';
import {
  DESIGN_SURFACES,
  findSurface,
} from '../api/_lib/site00OpusNative/designSurfaceRegistry';
import {
  checkAssetMutation,
  isCreatablePath,
  policyForMode,
  resolveWriteAuthority,
} from '../api/_lib/site00OpusNative/writeAuthority';

const CANONICAL = DESIGN_SURFACES.find((surface) => surface.pageId === 'twin-opus-direct')!;
const PROOF = DESIGN_SURFACES.find((surface) => surface.pageId === 'opus-native-proof')!;

describe('P0.VR.OPUS-NATIVE2 — Phase 6: the capability ladder is ordered', () => {
  it('ranks modes least to most capable', () => {
    const ranks = DESIGN_WRITE_MODES.map(writeModeRank);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    expect(writeModeAtLeast('PAGE_CREATE', 'STYLE_ONLY')).toBe(true);
    expect(writeModeAtLeast('STYLE_ONLY', 'PAGE_CREATE')).toBe(false);
  });

  it('opens strictly more files as the mode rises', () => {
    const style = policyForMode(CANONICAL, 'STYLE_ONLY').allowedFiles;
    const component = policyForMode(CANONICAL, 'COMPONENT_ONLY').allowedFiles;
    const edit = policyForMode(CANONICAL, 'PAGE_EDIT').allowedFiles;

    expect(style.length).toBeGreaterThan(0);
    expect(component.length).toBeGreaterThan(style.length);
    expect(edit.length).toBeGreaterThan(component.length);
    for (const file of style) expect(component).toContain(file);
    for (const file of component) expect(edit).toContain(file);
  });

  it('opens no file at READ_ONLY', () => {
    expect(policyForMode(CANONICAL, 'READ_ONLY').allowedFiles).toEqual([]);
  });

  it('never opens the component tree for a style grant', () => {
    const style = policyForMode(CANONICAL, 'STYLE_ONLY');
    expect(style.allowedFiles.every((file) => file.endsWith('.css'))).toBe(true);
    for (const component of CANONICAL.components) {
      expect(style.allowedFiles).not.toContain(component);
    }
  });
});

describe('P0.VR.OPUS-NATIVE2 — Phase 8: the canonical page stays protected by default', () => {
  it('stands at READ_ONLY', () => {
    expect(CANONICAL.standingWriteMode).toBe('READ_ONLY');
    const resolved = resolveWriteAuthority({
      surface: CANONICAL,
      intent: 'REFINE_CURRENT',
      route: CANONICAL.route,
    });
    expect(resolved.policy.allowedFiles).toEqual([]);
    expect(resolved.authorizationRequest).not.toBeNull();
  });

  it('asks for authorization when an intent outruns the standing policy', () => {
    const resolved = resolveWriteAuthority({
      surface: CANONICAL,
      intent: 'FIX_VISUAL',
      route: CANONICAL.route,
    });
    expect(resolved.authorizationRequest?.requestedMode).toBe('STYLE_ONLY');
    expect(resolved.authorizationRequest?.permittedMode).toBe('READ_ONLY');
    expect(resolved.authorizationRequest?.grantable).toBe(true);
    expect(resolved.authorizationRequest?.additionalFiles.length).toBeGreaterThan(0);
  });

  it('honours a style grant without widening past it', () => {
    const resolved = resolveWriteAuthority({
      surface: CANONICAL,
      intent: 'FIX_VISUAL',
      route: CANONICAL.route,
      grant: { mode: 'STYLE_ONLY' },
    });
    expect(resolved.authorizationRequest).toBeNull();
    expect(resolved.permittedMode).toBe('STYLE_ONLY');
    expect(resolved.grantApplied).toBe(true);
    expect(resolved.policy.allowStateChanges).toBe(false);
    expect(resolved.policy.allowNewFiles).toBe(false);
  });

  /** The sprint's explicit requirement: one style edit is not PAGE_EDIT. */
  it('clamps an over-broad grant to the surface ceiling', () => {
    const resolved = resolveWriteAuthority({
      surface: CANONICAL,
      intent: 'FIX_INTERACTION',
      route: CANONICAL.route,
      grant: { mode: 'DERIVATIVE_CREATE' },
    });
    expect(resolved.permittedMode).toBe('COMPONENT_ONLY');
    expect(resolved.policy.allowRouteCreation).toBe(false);
    expect(resolved.policy.allowNewFiles).toBe(false);
    expect(resolved.authorizationRequest?.grantable).toBe(false);
  });

  it('never grants asset mutation implicitly, at any mode', () => {
    for (const mode of DESIGN_WRITE_MODES) {
      expect(policyForMode(CANONICAL, mode).allowAssetReferenceChanges).toBe(false);
      expect(policyForMode(PROOF, mode).allowAssetReferenceChanges).toBe(false);
    }
  });

  it('never permits shared/parent component changes, at any mode', () => {
    for (const mode of DESIGN_WRITE_MODES) {
      expect(policyForMode(PROOF, mode).allowSharedComponentChanges).toBe(false);
    }
  });
});

describe('P0.VR.OPUS-NATIVE2 — Phase 9: the asset firewall reads edits, not paths', () => {
  const policy = policyForMode(CANONICAL, 'COMPONENT_ONLY');

  it('blocks an edit that swaps a raster reference', () => {
    const verdict = checkAssetMutation(
      [{ file: CANONICAL.components[0], find: 'tod-hand-plate.jpg', replace: 'something-else.jpg' }],
      CANONICAL,
      policy,
    );
    expect(verdict.blocked).toBe(true);
    expect(verdict.reason).toMatch(/asset/i);
  });

  it('blocks any edit to the asset manifest itself', () => {
    const verdict = checkAssetMutation(
      [{ file: CANONICAL.assetManifestPath!, find: 'a', replace: 'b' }],
      CANONICAL,
      policy,
    );
    expect(verdict.blocked).toBe(true);
  });

  it('allows an edit that mentions an asset without changing which one', () => {
    const verdict = checkAssetMutation(
      [
        {
          file: CANONICAL.components[0],
          find: 'src="/site00/x.jpg" className="a"',
          replace: 'src="/site00/x.jpg" className="b"',
        },
      ],
      CANONICAL,
      policy,
    );
    expect(verdict.blocked).toBe(false);
  });

  it('allows anything once the founder has explicitly granted asset mutation', () => {
    const granted = policyForMode(PROOF, 'PAGE_EDIT', { mode: 'PAGE_EDIT', allowAssetReferenceChanges: true });
    const verdict = checkAssetMutation(
      [{ file: 'src/site00/styles/site00-opus-native.css', find: 'a.png', replace: 'b.png' }],
      PROOF,
      granted,
    );
    expect(verdict.blocked).toBe(false);
  });
});

describe('P0.VR.OPUS-NATIVE2 — Phase 10: creation paths are confined', () => {
  const creating = policyForMode(PROOF, 'DERIVATIVE_CREATE');

  it('accepts a path inside a declared create directory', () => {
    expect(isCreatablePath('src/site00/styles/generated/x.css', creating)).toBe(true);
  });

  it('refuses a path outside every create directory', () => {
    expect(isCreatablePath('src/site00/styles/site00-twin-opus-direct.css', creating)).toBe(false);
    expect(isCreatablePath('package.json', creating)).toBe(false);
  });

  it('refuses traversal that resolves out of an allowed directory', () => {
    expect(isCreatablePath('src/site00/styles/generated/../../../../etc/passwd', creating)).toBe(false);
  });

  it('refuses creation entirely below PAGE_CREATE', () => {
    const editing = policyForMode(PROOF, 'PAGE_EDIT');
    expect(editing.allowNewFiles).toBe(false);
    expect(isCreatablePath('src/site00/styles/generated/x.css', editing)).toBe(false);
  });
});

/**
 * Phase 11. The sandbox writes to the real filesystem, so it is pointed at a
 * temporary repository root rather than mocked — the property under test is
 * that nothing reaches disk, and a mocked filesystem cannot demonstrate that.
 */
describe('P0.VR.OPUS-NATIVE2 — Phase 11: multi-file patches are atomic', () => {
  let root: string;
  let previousRoot: string | undefined;

  const ALPHA = 'src/site00/styles/alpha.css';
  const BETA = 'src/site00/styles/beta.css';
  const OUTSIDE = 'src/site00/styles/outside.css';

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'opus-native2-'));
    await mkdir(path.join(root, 'src/site00/styles'), { recursive: true });
    await writeFile(path.join(root, ALPHA), '.a { color: red; }\n', 'utf8');
    await writeFile(path.join(root, BETA), '.b { color: blue; }\n', 'utf8');
    await writeFile(path.join(root, OUTSIDE), '.c { color: green; }\n', 'utf8');
    previousRoot = process.env.SITE00_OPUS_NATIVE_REPO_ROOT;
    process.env.SITE00_OPUS_NATIVE_REPO_ROOT = root;
    process.env.SITE00_OPUS_NATIVE_WORKDIR = path.join(root, '.work');
  });

  afterEach(async () => {
    if (previousRoot === undefined) delete process.env.SITE00_OPUS_NATIVE_REPO_ROOT;
    else process.env.SITE00_OPUS_NATIVE_REPO_ROOT = previousRoot;
    await rm(root, { recursive: true, force: true });
  });

  it('applies every edit when all are in scope', async () => {
    const { applyPatch } = await import('../api/_lib/site00OpusNative/workspaceSandbox');
    const patch = await applyPatch({
      runId: 'r1',
      reason: 'both',
      writeAllowlist: [ALPHA, BETA],
      edits: [
        { file: ALPHA, find: 'red', replace: 'crimson' },
        { file: BETA, find: 'blue', replace: 'navy' },
      ],
    });
    expect(patch.filesChanged.sort()).toEqual([ALPHA, BETA].sort());
    expect(await readFile(path.join(root, ALPHA), 'utf8')).toContain('crimson');
    expect(await readFile(path.join(root, BETA), 'utf8')).toContain('navy');
  });

  it('writes nothing when a later edit is out of scope', async () => {
    const { applyPatch, ScopeViolationError } = await import('../api/_lib/site00OpusNative/workspaceSandbox');
    await expect(
      applyPatch({
        runId: 'r2',
        reason: 'partial',
        writeAllowlist: [ALPHA, BETA],
        edits: [
          { file: ALPHA, find: 'red', replace: 'crimson' },
          { file: BETA, find: 'blue', replace: 'navy' },
          { file: OUTSIDE, find: 'green', replace: 'olive' },
        ],
      }),
    ).rejects.toBeInstanceOf(ScopeViolationError);

    // The property that matters: the two in-scope files are untouched.
    expect(await readFile(path.join(root, ALPHA), 'utf8')).toContain('red');
    expect(await readFile(path.join(root, BETA), 'utf8')).toContain('blue');
    expect(await readFile(path.join(root, OUTSIDE), 'utf8')).toContain('green');
  });

  it('writes nothing when a later edit cannot find its anchor', async () => {
    const { applyPatch, PatchConflictError } = await import('../api/_lib/site00OpusNative/workspaceSandbox');
    await expect(
      applyPatch({
        runId: 'r3',
        reason: 'conflict',
        writeAllowlist: [ALPHA, BETA],
        edits: [
          { file: ALPHA, find: 'red', replace: 'crimson' },
          { file: BETA, find: 'not-present-anywhere', replace: 'x' },
        ],
      }),
    ).rejects.toBeInstanceOf(PatchConflictError);
    expect(await readFile(path.join(root, ALPHA), 'utf8')).toContain('red');
  });

  it('refuses the whole patch when the asset guard blocks one edit', async () => {
    const { applyPatch, AssetFirewallError } = await import('../api/_lib/site00OpusNative/workspaceSandbox');
    await expect(
      applyPatch({
        runId: 'r4',
        reason: 'asset',
        writeAllowlist: [ALPHA, BETA],
        assetGuard: () => ({ blocked: true, reason: 'nope' }),
        edits: [{ file: ALPHA, find: 'red', replace: 'crimson' }],
      }),
    ).rejects.toBeInstanceOf(AssetFirewallError);
    expect(await readFile(path.join(root, ALPHA), 'utf8')).toContain('red');
  });

  it('creates files and deletes them again on revert', async () => {
    const { applyPatch, revertPatch } = await import('../api/_lib/site00OpusNative/workspaceSandbox');
    const NEW_A = 'src/site00/styles/generated/one.css';
    const NEW_B = 'src/site00/styles/generated/two.css';

    const patch = await applyPatch({
      runId: 'r5',
      reason: 'create two',
      writeAllowlist: [],
      canCreate: (file) => file.startsWith('src/site00/styles/generated/'),
      creates: [
        { file: NEW_A, content: '.one {}\n' },
        { file: NEW_B, content: '.two {}\n' },
      ],
    });

    expect(patch.createdFiles?.sort()).toEqual([NEW_A, NEW_B].sort());
    expect(existsSync(path.join(root, NEW_A))).toBe(true);
    expect(existsSync(path.join(root, NEW_B))).toBe(true);

    await revertPatch(patch);
    expect(existsSync(path.join(root, NEW_A))).toBe(false);
    expect(existsSync(path.join(root, NEW_B))).toBe(false);
  });

  it('refuses to overwrite an existing file unless told to', async () => {
    const { applyPatch, PatchConflictError } = await import('../api/_lib/site00OpusNative/workspaceSandbox');
    await expect(
      applyPatch({
        runId: 'r6',
        reason: 'clobber',
        writeAllowlist: [],
        canCreate: () => true,
        creates: [{ file: ALPHA, content: 'wiped' }],
      }),
    ).rejects.toBeInstanceOf(PatchConflictError);
    expect(await readFile(path.join(root, ALPHA), 'utf8')).toContain('red');
  });

  it('restores exact prior bytes on revert of an edit', async () => {
    const { applyPatch, revertPatch } = await import('../api/_lib/site00OpusNative/workspaceSandbox');
    const original = await readFile(path.join(root, ALPHA), 'utf8');
    const patch = await applyPatch({
      runId: 'r7',
      reason: 'edit',
      writeAllowlist: [ALPHA],
      edits: [{ file: ALPHA, find: 'red', replace: 'crimson' }],
    });
    await revertPatch(patch);
    expect(await readFile(path.join(root, ALPHA), 'utf8')).toBe(original);
  });
});

describe('P0.VR.OPUS-NATIVE2 — Phase 14: route grammar is enforced mechanically', () => {
  const existing = DESIGN_SURFACES.map((surface) => surface.route);

  it('accepts a well-formed sibling route', () => {
    expect(validateRouteIntent('/projects/ndxbook/design/opus-native-derivative', existing, null).valid).toBe(true);
  });

  it('rejects capitals, spaces and non-design roots', () => {
    for (const bad of [
      '/projects/ndxbook/design/MyNewPage',
      '/projects/ndxbook/design/my new page',
      '/opus/whatever',
      '/projects/ndxbook/design/',
    ]) {
      expect(validateRouteIntent(bad, existing, null).valid).toBe(false);
    }
  });

  it('rejects a collision with a registered route', () => {
    const result = validateRouteIntent('/projects/ndxbook/design/twin-opus-direct', existing, null);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/collides/);
  });

  it('rejects a child that claims a different project from its parent', () => {
    const result = validateRouteIntent(
      '/projects/other/design/thing',
      [],
      '/projects/ndxbook/design/twin-opus-direct',
    );
    expect(result.valid).toBe(false);
  });

  it('keeps every registered route inside the grammar', () => {
    for (const surface of DESIGN_SURFACES) {
      expect(ROUTE_GRAMMAR.test(surface.route.replace(':projectSlug', 'ndxbook'))).toBe(true);
    }
  });
});

describe('P0.VR.OPUS-NATIVE2 — Phase 13: inheritance claims are validated', () => {
  const mustInherit = PROOF.inheritanceRules!.mustInherit;

  it('rejects an override with no justification', () => {
    const result = validateRegionPlan(
      [{ region: 'body', classification: 'OVERRIDDEN', justification: null }],
      [],
    );
    expect(result.valid).toBe(false);
    expect(result.problems[0]).toMatch(/justification/);
  });

  it('rejects a parent-required region declared NEW', () => {
    const regions = mustInherit.map((region) => ({
      region,
      classification: 'NEW' as const,
      justification: 'because',
    }));
    const result = validateRegionPlan(regions, mustInherit);
    expect(result.valid).toBe(false);
    expect(result.problems.length).toBe(mustInherit.length);
  });

  it('rejects a plan that simply omits a required region', () => {
    const result = validateRegionPlan([], mustInherit);
    expect(result.valid).toBe(false);
    expect(result.problems.every((problem) => /must be classified/.test(problem))).toBe(true);
  });

  it('accepts a plan that inherits everything required and justifies its overrides', () => {
    const regions = [
      ...mustInherit.map((region) => ({ region, classification: 'INHERITED' as const, justification: null })),
      { region: 'page body composition', classification: 'OVERRIDDEN' as const, justification: 'the reason this page exists' },
    ];
    expect(validateRegionPlan(regions, mustInherit).valid).toBe(true);
  });
});

describe('P0.VR.OPUS-NATIVE2 — Phase 25: compaction carries forward what was learned', () => {
  it('renders established facts, rejected approaches and the open request', () => {
    const text = renderCompaction({
      currentTask: 'Darken the panel borders',
      approvedFacts: ['Typecheck passes'],
      failedApproaches: [{ approach: 'raising --tod-border-panel', reason: 'inverted the border hierarchy' }],
      currentDesignState: 'one file patched',
      openRequest: 'go one step lighter',
      latestScreenshotId: 'shot-after-1',
      currentPatchState: 'APPLIED_PENDING_REVIEW',
      compactedAt: new Date().toISOString(),
    });

    expect(text).toContain('Typecheck passes');
    expect(text).toContain('inverted the border hierarchy');
    expect(text).toContain('go one step lighter');
    expect(text).toContain('Do not repeat a rejected approach');
  });
});

describe('P0.VR.OPUS-NATIVE2 — Phase 31: the registry carries its own intelligence', () => {
  it('declares policy, assets and inheritance for every surface', () => {
    for (const surface of DESIGN_SURFACES) {
      expect(DESIGN_WRITE_MODES).toContain(surface.standingWriteMode);
      expect(DESIGN_WRITE_MODES).toContain(surface.maxGrantableWriteMode);
      expect(writeModeRank(surface.maxGrantableWriteMode)).toBeGreaterThanOrEqual(
        writeModeRank(surface.standingWriteMode),
      );
      expect(Array.isArray(surface.protectedAssets)).toBe(true);
      expect(Array.isArray(surface.allowedCreateDirectories)).toBe(true);
    }
  });

  it('only declares create directories on surfaces that can reach a create mode', () => {
    for (const surface of DESIGN_SURFACES) {
      if (surface.allowedCreateDirectories.length > 0) {
        expect(writeModeAtLeast(surface.maxGrantableWriteMode, 'PAGE_CREATE')).toBe(true);
      }
    }
  });

  it('resolves a concrete route back to its surface', () => {
    expect(findSurface({ route: '/projects/ndxbook/design/twin-opus-direct' })?.pageId).toBe('twin-opus-direct');
    expect(findSurface({ route: '/projects/ndxbook/design/opus-native' })?.pageId).toBe('opus-native-proof');
  });
});

describe('P0.VR.OPUS-NATIVE2 — Phase 5: intents map to capability, not to prose', () => {
  it('gives every intent a required mode and a contract rule', () => {
    for (const spec of Object.values(DESIGN_AGENT_INTENT_SPECS)) {
      expect(DESIGN_WRITE_MODES).toContain(spec.requiredMode);
      expect(typeof spec.requiresCreationContract).toBe('boolean');
    }
  });

  it('requires a creation contract for exactly the creation intents', () => {
    const requiring = Object.values(DESIGN_AGENT_INTENT_SPECS)
      .filter((spec) => spec.requiresCreationContract)
      .map((spec) => spec.intent)
      .sort();
    expect(requiring).toEqual(['CREATE_CHILD', 'CREATE_GRANDCHILD', 'CREATE_PAGE']);
  });

  it('keeps INSPECT_ONLY at READ_ONLY', () => {
    expect(DESIGN_AGENT_INTENT_SPECS.INSPECT_ONLY.requiredMode).toBe('READ_ONLY');
  });
});
