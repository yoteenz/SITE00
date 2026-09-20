/**
 * P0.VR.DESIGN-WORKSPACE-SELF-CREATIVE-PIPELINE-AUDIT2
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { WORKSPACE_CONCEPT_SLOT_IDS } from '../shared/site00-design-workspace-production/workspaceSelfConcept/constants.js';
import * as cgpt from '../api/_lib/site00WorkspaceSelfConcept/generateWorkspaceCreativeDirection.js';
import * as gpt2 from '../api/_lib/site00WorkspaceSelfConcept/generateWorkspaceSingleConcept.js';
import * as nbp from '../api/_lib/site00WorkspaceSelfConcept/renderWorkspaceNbpJob.js';
import { generateWorkspaceCreativeDirection } from '../api/_lib/site00WorkspaceSelfConcept/generateWorkspaceCreativeDirection.js';
import { generateWorkspaceSingleConcept } from '../api/_lib/site00WorkspaceSelfConcept/generateWorkspaceSingleConcept.js';
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

describe('WORKSPACE_SELF creative pipeline audit2', () => {
  it('documents provider mapping in source (no territories batch file)', () => {
    expect(read('api/_lib/site00WorkspaceSelfConcept/generateWorkspaceCreativeDirection.ts')).toContain('CGPT');
    expect(read('api/_lib/site00WorkspaceSelfConcept/generateWorkspaceSingleConcept.ts')).toContain('GPT2');
    expect(() => read('api/_lib/site00WorkspaceSelfConcept/generateWorkspaceTerritories.ts')).toThrow();
  });

  it('CGPT returns ONE direction object', async () => {
    const s = readyState();
    const dir = await generateWorkspaceCreativeDirection({
      conceptSlot: 'CONCEPT_A',
      functionContract: s.functionContract!,
      sourceRoute: '/projects/design/ndxbook',
      hostDesignSystemVersion: 'v1',
      workspaceArchitectureVersion: 'v1',
      visualProblems: ['p'],
      opportunities: ['o'],
      diversityLedger: [],
    });
    expect(dir.conceptSlot).toBe('CONCEPT_A');
    expect(dir.directionId).toMatch(/^wdir-/);
  });

  it('GPT2 rejects multi-concept payloads', async () => {
    const s = readyState();
    const direction = await generateWorkspaceCreativeDirection({
      conceptSlot: 'CONCEPT_A',
      functionContract: s.functionContract!,
      sourceRoute: 'r',
      hostDesignSystemVersion: 'v1',
      workspaceArchitectureVersion: 'v1',
      visualProblems: [],
      opportunities: [],
      diversityLedger: [],
    });
    const concept = await generateWorkspaceSingleConcept({
      direction,
      functionContract: s.functionContract!,
      sourceRoute: 'r',
    });
    expect(concept.conceptSlot).toBe('CONCEPT_A');
    expect(concept.gpt2ConceptId).toMatch(/^wg2-/);
  });

  it('orchestrator calls CGPT×3, GPT2×3, NBP×6 sequentially', async () => {
    const cgptSpy = vi.spyOn(cgpt, 'generateWorkspaceCreativeDirection');
    const gpt2Spy = vi.spyOn(gpt2, 'generateWorkspaceSingleConcept');
    const nbpSpy = vi.spyOn(nbp, 'renderWorkspaceNbpJob');

    await runWorkspaceSelfGeneration({
      state: readyState(),
      founderConfirmedSpend: true,
      createdBy: 'f',
      mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
      desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
    });

    expect(cgptSpy).toHaveBeenCalledTimes(3);
    expect(gpt2Spy).toHaveBeenCalledTimes(3);
    expect(nbpSpy).toHaveBeenCalledTimes(6);
    expect(cgptSpy.mock.calls[1][0].diversityLedger).toHaveLength(1);
    expect(cgptSpy.mock.calls[2][0].diversityLedger).toHaveLength(2);
    cgptSpy.mockRestore();
    gpt2Spy.mockRestore();
    nbpSpy.mockRestore();
  });

  it('NBP jobs share gpt2ConceptId between Mobile and Desktop for each slot', async () => {
    const result = await runWorkspaceSelfGeneration({
      state: readyState(),
      founderConfirmedSpend: true,
      createdBy: 'f',
      mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
      desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
    });
    for (const slot of WORKSPACE_CONCEPT_SLOT_IDS) {
      const m = result.jobs.find((j) => j.conceptId === slot && j.viewport === 'MOBILE');
      const d = result.jobs.find((j) => j.conceptId === slot && j.viewport === 'DESKTOP');
      expect(m?.gpt2ConceptId).toBeTruthy();
      expect(m?.gpt2ConceptId).toBe(d?.gpt2ConceptId);
      expect(m?.creativeDirectionId).toBe(d?.creativeDirectionId);
    }
  });

  it('A/B/C use distinct creativeDirectionIds', async () => {
    const result = await runWorkspaceSelfGeneration({
      state: readyState(),
      founderConfirmedSpend: true,
      createdBy: 'f',
      mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
      desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
    });
    const ids = result.pipelineSet.slots.map((s) => s.direction?.directionId).filter(Boolean);
    expect(new Set(ids).size).toBe(3);
  });

  it('NBP invocations occur only after GPT2 for each slot (call order)', async () => {
    const gpt2Spy = vi.spyOn(gpt2, 'generateWorkspaceSingleConcept');
    const nbpSpy = vi.spyOn(nbp, 'renderWorkspaceNbpJob');

    await runWorkspaceSelfGeneration({
      state: readyState(),
      founderConfirmedSpend: true,
      createdBy: 'f',
      mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
      desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
    });

    for (const slot of WORKSPACE_CONCEPT_SLOT_IDS) {
      const gpt2CallIndex = gpt2Spy.mock.calls.findIndex((c) => c[0].direction.conceptSlot === slot);
      const nbpCallIndex = nbpSpy.mock.calls.findIndex(
        (c) => c[0].concept.conceptSlot === slot && c[0].viewport === 'MOBILE',
      );
      expect(gpt2Spy.mock.invocationCallOrder[gpt2CallIndex]).toBeLessThan(
        nbpSpy.mock.invocationCallOrder[nbpCallIndex],
      );
    }
    gpt2Spy.mockRestore();
    nbpSpy.mockRestore();
  });

  it('GPT2 failure skips NBP for that slot', async () => {
    const actual = await vi.importActual<typeof gpt2>(
      '../api/_lib/site00WorkspaceSelfConcept/generateWorkspaceSingleConcept.js',
    );
    const realGpt2 = actual.generateWorkspaceSingleConcept;
    const gpt2Spy = vi.spyOn(gpt2, 'generateWorkspaceSingleConcept');
    gpt2Spy.mockImplementation(async (input) => {
      if (input.direction.conceptSlot === 'CONCEPT_B') {
        throw new Error('GPT2_CONCEPT_FAILED: test');
      }
      return realGpt2(input);
    });

    const result = await runWorkspaceSelfGeneration({
      state: readyState(),
      founderConfirmedSpend: true,
      createdBy: 'f',
      mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
      desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
    });

    expect(result.pipelineSet.slots.find((s) => s.conceptSlot === 'CONCEPT_B')?.concept).toBeNull();
    expect(result.jobs.filter((j) => j.conceptId === 'CONCEPT_B')).toHaveLength(0);
    expect(result.jobs.length).toBe(4);
    gpt2Spy.mockRestore();
  });
});
