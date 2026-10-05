/**
 * P0.VR.OPUS-NATIVE-SHELL-SERVICE1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  assertScopedContextOnly,
  compileOpusDesignShellPackage,
  packageIncludesWholeRepo,
} from '../shared/site00-opus-design-shell/contextCompiler.js';
import { OPUS_DESIGN_SHELL_MODEL } from '../shared/site00-opus-design-shell/constants.js';
import { evaluateOpusDesignShellEligibility } from '../shared/site00-opus-design-shell/eligibility.js';
import {
  buildOpusDesignShellDynamicUserContext,
  buildOpusDesignShellStableSystemPrefix,
} from '../shared/site00-opus-design-shell/promptPrefix.js';
import { clearOpusDesignShellStore, getHandoff, getResult, saveResult } from '../api/_lib/site00OpusDesignShell/persistence.js';
import { runOpusDesignShellGeneration } from '../api/_lib/site00OpusDesignShell/runShellGeneration.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

const eligibleInput = {
  targetType: 'PAGE' as const,
  projectId: 'ndxbook',
  pageId: 'ndxbook:overview:/projects/ndxbook',
  mobilePromoted: true,
  desktopPromoted: true,
  pairReviewCompleted: true,
  pairLocked: true,
  hasFunctionContract: true,
  hasMobileCapture: true,
  hasDesktopCapture: true,
  anthropicConfigured: true,
  modelAvailable: true,
};

describe('P0.VR.OPUS-NATIVE-SHELL-SERVICE1', () => {
  beforeEach(() => {
    clearOpusDesignShellStore();
    vi.stubEnv('SITE00_OPUS_DESIGN_SHELL_SCRIPTED', '1');
    vi.stubEnv('ANTHROPIC_API_KEY', '');
  });

  it('uses claude-opus-5 model constant', () => {
    expect(OPUS_DESIGN_SHELL_MODEL).toBe('claude-opus-5');
    expect(read('api/_lib/site00OpusDesignShell/runShellGeneration.ts')).toContain('OPUS_DESIGN_SHELL_MODEL');
  });

  it('never exposes ANTHROPIC_API_KEY in client bundle sources', () => {
    const client = read('src/site00/services/opusDesignShellClient.ts');
    expect(client).not.toContain('ANTHROPIC_API_KEY');
    expect(client).not.toContain('process.env');
  });

  it('blocks shell when authority pair not locked', () => {
    const r = evaluateOpusDesignShellEligibility({ ...eligibleInput, pairLocked: false }, false);
    expect(r.eligible).toBe(false);
    expect(r.blockedCode).toBe('BLOCKED_PAIR_NOT_LOCKED');
  });

  it('blocks shell without function contract', () => {
    const r = evaluateOpusDesignShellEligibility({ ...eligibleInput, hasFunctionContract: false }, false);
    expect(r.blockedCode).toBe('BLOCKED_NO_FUNCTION_CONTRACT');
  });

  it('compiles scoped files only', () => {
    const pkg = compileOpusDesignShellPackage({
      targetType: 'PAGE',
      projectId: 'ndxbook',
      pageId: 'p1',
      authorityPairId: 'pair',
      mobileAuthorityArtifactId: 'm',
      desktopAuthorityArtifactId: 'd',
      functionContractId: 'fc',
      componentMap: [],
      createdBy: 'test',
    });
    expect(pkg.relevantSourceFiles.length).toBeGreaterThan(0);
    expect(pkg.relevantSourceFiles.length).toBeLessThanOrEqual(24);
    expect(packageIncludesWholeRepo(pkg)).toBe(false);
    assertScopedContextOnly(pkg.relevantSourceFiles);
  });

  it('does not include whole repo glob', () => {
    const pkg = compileOpusDesignShellPackage({
      targetType: 'PAGE',
      projectId: 'x',
      pageId: 'y',
      authorityPairId: 'pair',
      mobileAuthorityArtifactId: 'm',
      desktopAuthorityArtifactId: 'd',
      functionContractId: 'fc',
      componentMap: [],
      createdBy: 'test',
    });
    expect(pkg.relevantSourceFiles.some((f) => f.includes('node_modules'))).toBe(false);
  });

  it('stable prefix is cacheable and separate from dynamic context', () => {
    const stable = buildOpusDesignShellStableSystemPrefix();
    const dynamic = buildOpusDesignShellDynamicUserContext({
      targetType: 'PAGE',
      projectId: 'ndxbook',
      pageId: 'p',
      functionContractId: 'fc',
      componentMap: [{ id: 'a', label: 'A', role: 'shell' }],
      relevantSourceFiles: ['src/site00/styles/site00-twin-opus-direct.css'],
      currentVisualTokens: ['--x'],
      mode: 'CREATE',
    });
    expect(stable.length).toBeGreaterThan(512);
    expect(stable).toContain('VISUAL DESIGN SHELL AGENT');
    expect(dynamic).toContain('MODE: CREATE DESIGN SHELL');
    expect(stable).not.toContain('ndxbook');
  });

  it('staged output is not production write', async () => {
    const pkg = compileOpusDesignShellPackage({
      targetType: 'PAGE',
      projectId: 'ndxbook',
      pageId: 'p',
      authorityPairId: 'pair',
      mobileAuthorityArtifactId: 'm',
      desktopAuthorityArtifactId: 'd',
      functionContractId: 'fc',
      componentMap: [],
      createdBy: 'test',
    });
    const result = await runOpusDesignShellGeneration(pkg, 'CREATE');
    expect(result.proposedFiles[0]?.stagedContent).toContain('STAGED_VISUAL_SHELL');
    expect(result.status).toBe('READY_FOR_REVIEW');
  });

  it('persists usage telemetry on result', async () => {
    const pkg = compileOpusDesignShellPackage({
      targetType: 'PAGE',
      projectId: 'ndxbook',
      pageId: 'p',
      authorityPairId: 'pair',
      mobileAuthorityArtifactId: 'm',
      desktopAuthorityArtifactId: 'd',
      functionContractId: 'fc',
      componentMap: [],
      createdBy: 'test',
    });
    const result = await runOpusDesignShellGeneration(pkg, 'CREATE');
    saveResult(result);
    expect(getResult(result.shellResultId)?.usageReceipt.model).toBe('claude-opus-5');
  });

  it('wires OPUS launcher SHELL tab and panel', () => {
    expect(read('shared/site00-design-workspace-production/designAiConsolePresentation.ts')).toContain(
      "id: 'SHELL'",
    );
    expect(read('src/site00/components/designBench/designAgent/DesignAgentDock.tsx')).toContain(
      'OpusDesignShellPanel',
    );
  });

  it('registers dedicated API route on server', () => {
    expect(read('server/routes.ts')).toContain('/api/site00/opus-design-shell');
  });

  it('handler requires founder confirmation before run', () => {
    expect(read('api/site00/opus-design-shell.ts')).toContain('founderConfirmedRun !== true');
  });

  it('composer handoff requires approved shell', () => {
    expect(read('api/site00/opus-design-shell.ts')).toContain('SHELL_NOT_APPROVED');
  });

  it('forbidden scopes listed in package', () => {
    const pkg = compileOpusDesignShellPackage({
      targetType: 'PAGE',
      projectId: 'ndxbook',
      pageId: 'p',
      authorityPairId: 'pair',
      mobileAuthorityArtifactId: 'm',
      desktopAuthorityArtifactId: 'd',
      functionContractId: 'fc',
      componentMap: [],
      createdBy: 'test',
    });
    expect(pkg.forbiddenMutationScope).toContain('routes');
    expect(pkg.allowedMutationScope).toContain('CSS');
  });

  it('batch architecture noted as future-only in events list', () => {
    expect(read('shared/site00-opus-design-shell/events.ts')).toContain('opus_shell_generation_requested');
  });

  it('no IMPLEMENT WITH OPUS in shell panel', () => {
    expect(read('src/site00/components/designBench/opusDesignShell/OpusDesignShellPanel.tsx')).not.toContain(
      'IMPLEMENT WITH OPUS',
    );
  });

  it('composer handoff package shape persisted', () => {
    expect(getHandoff('missing')).toBeNull();
  });
});
