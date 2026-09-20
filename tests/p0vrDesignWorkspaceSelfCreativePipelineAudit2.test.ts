/**
 * P0.VR.DESIGN-WORKSPACE-SELF-CREATIVE-PIPELINE-AUDIT2 (updated for R3 single-concept pipeline)
 */

import { describe, expect, it, vi } from 'vitest';

import { WORKSPACE_CONCEPT_SLOT_IDS } from '../shared/site00-design-workspace-production/workspaceSelfConcept/constants.js';
import * as cgpt from '../api/_lib/site00WorkspaceSelfConcept/generateWorkspaceCreativeContext.js';
import * as gpt2 from '../api/_lib/site00WorkspaceSelfConcept/generateWorkspaceGpt2AuthorityConcept.js';
import * as nbp from '../api/_lib/site00WorkspaceSelfConcept/renderWorkspaceNbpJob.js';
import { generateWorkspaceCreativeContext } from '../api/_lib/site00WorkspaceSelfConcept/generateWorkspaceCreativeContext.js';
import { generateWorkspaceGpt2AuthorityConcept } from '../api/_lib/site00WorkspaceSelfConcept/generateWorkspaceGpt2AuthorityConcept.js';
import { runWorkspaceSelfGeneration } from '../api/_lib/site00WorkspaceSelfConcept/runWorkspaceSelfGeneration.js';
import { createInitialWorkspaceSelfState, compileAndFreezeFunctionContract } from '../shared/site00-design-workspace-production/workspaceSelfConcept/workflow.js';
import {
  applyWorkspaceSelfCapturePair,
  beginWorkspaceSelfCaptureSet,
} from '../shared/site00-design-workspace-production/workspaceSelfConcept/captureWorkflow.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

function readyState() {
  let s = createInitialWorkspaceSelfState();
  s = compileAndFreezeFunctionContract(s);
  s = beginWorkspaceSelfCaptureSet(s, { build: 't', createdBy: 'f' });
  const setId = s.activeCaptureSetId!;
  s = applyWorkspaceSelfCapturePair(s, {
    captureSetId: setId,
    build: 't',
    createdBy: 'f',
    route: '/projects/design/ndxbook',
    mobile: { captureId: 'm1', artifactPath: 'local://m1' },
    desktop: { captureId: 'd1', artifactPath: 'local://d1' },
  });
  return s;
}

describe('WORKSPACE_SELF creative pipeline audit2 (R3-aligned)', () => {
  it('documents provider mapping in source (no territories batch file)', () => {
    expect(read('api/_lib/site00WorkspaceSelfConcept/generateWorkspaceCreativeContext.ts')).toContain('CGPT');
    expect(read('api/_lib/site00WorkspaceSelfConcept/generateWorkspaceGpt2AuthorityConcept.ts')).toContain('GPT2');
    expect(() => read('api/_lib/site00WorkspaceSelfConcept/generateWorkspaceTerritories.ts')).toThrow();
  });

  it('CGPT returns ONE creative context object', async () => {
    const s = readyState();
    const ctx = await generateWorkspaceCreativeContext({
      captureSetId: s.activeCaptureSetId!,
      functionContract: s.functionContract!,
      sourceRoute: '/projects/design/ndxbook',
      hostDesignSystemVersion: 'v1',
      workspaceArchitectureVersion: 'v1',
      visualProblems: ['p'],
      opportunities: ['o'],
    });
    expect(ctx.creativeContextId).toMatch(/^wctx-/);
  });

  it('GPT2 returns one authority concept bound to context', async () => {
    const s = readyState();
    const ctx = await generateWorkspaceCreativeContext({
      captureSetId: s.activeCaptureSetId!,
      functionContract: s.functionContract!,
      sourceRoute: 'r',
      hostDesignSystemVersion: 'v1',
      workspaceArchitectureVersion: 'v1',
      visualProblems: [],
      opportunities: [],
    });
    const authority = await generateWorkspaceGpt2AuthorityConcept({
      creativeContext: ctx,
      functionContract: s.functionContract!,
      sourceRoute: 'r',
    });
    expect(authority.creativeContextId).toBe(ctx.creativeContextId);
    expect(authority.conceptId).toMatch(/^wg2-/);
  });

  it('orchestrator calls CGPT×1, GPT2×1, NBP×6 sequentially', async () => {
    const cgptSpy = vi.spyOn(cgpt, 'generateWorkspaceCreativeContext');
    const gpt2Spy = vi.spyOn(gpt2, 'generateWorkspaceGpt2AuthorityConcept');
    const nbpSpy = vi.spyOn(nbp, 'renderWorkspaceNbpJob');

    await runWorkspaceSelfGeneration({
      state: readyState(),
      founderConfirmedSpend: true,
      createdBy: 'f',
      mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
      desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
    });

    expect(cgptSpy).toHaveBeenCalledTimes(1);
    expect(gpt2Spy).toHaveBeenCalledTimes(1);
    expect(nbpSpy).toHaveBeenCalledTimes(6);
    cgptSpy.mockRestore();
    gpt2Spy.mockRestore();
    nbpSpy.mockRestore();
  });

  it('NBP jobs share gpt2ConceptId between Mobile and Desktop for each rendition slot', async () => {
    const result = await runWorkspaceSelfGeneration({
      state: readyState(),
      founderConfirmedSpend: true,
      createdBy: 'f',
      mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
      desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
    });
    const sharedGpt2 = result.pipelineSet.gpt2AuthorityConcept!.conceptId;
    for (const slot of WORKSPACE_CONCEPT_SLOT_IDS) {
      const m = result.jobs.find((j) => j.conceptId === slot && j.viewport === 'MOBILE');
      const d = result.jobs.find((j) => j.conceptId === slot && j.viewport === 'DESKTOP');
      expect(m?.gpt2ConceptId).toBe(sharedGpt2);
      expect(d?.gpt2ConceptId).toBe(sharedGpt2);
      expect(m?.creativeContextId).toBe(d?.creativeContextId);
    }
  });

  it('all renditions share one creativeContextId', async () => {
    const result = await runWorkspaceSelfGeneration({
      state: readyState(),
      founderConfirmedSpend: true,
      createdBy: 'f',
      mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
      desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
    });
    const ctxId = result.pipelineSet.creativeContext!.creativeContextId;
    const ctxIds = result.jobs.map((j) => j.creativeContextId).filter(Boolean);
    expect(new Set(ctxIds).size).toBe(1);
    expect(ctxIds[0]).toBe(ctxId);
  });

  it('NBP invocations occur only after GPT2 (call order)', async () => {
    const gpt2Spy = vi.spyOn(gpt2, 'generateWorkspaceGpt2AuthorityConcept');
    const nbpSpy = vi.spyOn(nbp, 'renderWorkspaceNbpJob');

    await runWorkspaceSelfGeneration({
      state: readyState(),
      founderConfirmedSpend: true,
      createdBy: 'f',
      mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
      desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
    });

    const gpt2Index = gpt2Spy.mock.invocationCallOrder[0];
    const firstNbpIndex = nbpSpy.mock.invocationCallOrder[0];
    expect(gpt2Index).toBeLessThan(firstNbpIndex);
    gpt2Spy.mockRestore();
    nbpSpy.mockRestore();
  });
});
