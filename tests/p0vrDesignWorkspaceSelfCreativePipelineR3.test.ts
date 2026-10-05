/**
 * P0.VR.DESIGN-WORKSPACE-SELF-CREATIVE-PIPELINE-R3
 */

import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { WORKSPACE_CONCEPT_SLOT_IDS } from '../shared/site00-design-workspace-production/workspaceSelfConcept/constants.js';
import { buildWorkspaceSelfGenerationPlan } from '../shared/site00-design-workspace-production/workspaceSelfConcept/generationPlan.js';
import { planWorkspaceNbpRenditions } from '../shared/site00-design-workspace-production/workspaceSelfConcept/renditionPlanner.js';
import {
  WORKSPACE_SELF_PIPELINE_SCHEMA_LEGACY,
  WORKSPACE_SELF_PIPELINE_SCHEMA_SINGLE,
} from '../shared/site00-design-workspace-production/workspaceSelfConcept/pipelineLegacy.js';
import { buildCompareRenditionColumns, resolveInspectLineage } from '../shared/site00-design-workspace-production/workspaceSelfConcept/reviewState.js';
import {
  beginWorkspaceConceptSet,
  mergeGenerationArtifactsIntoConcepts,
  registerGenerationJobs,
} from '../shared/site00-design-workspace-production/workspaceSelfConcept/generationWorkflow.js';
import {
  compileAndFreezeFunctionContract,
  createInitialWorkspaceSelfState,
} from '../shared/site00-design-workspace-production/workspaceSelfConcept/workflow.js';
import {
  applyWorkspaceSelfCapturePair,
  beginWorkspaceSelfCaptureSet,
  normalizeWorkspaceSelfState,
} from '../shared/site00-design-workspace-production/workspaceSelfConcept/captureWorkflow.js';
import * as cgpt from '../api/_lib/site00WorkspaceSelfConcept/generateWorkspaceCreativeContext.js';
import * as gpt2 from '../api/_lib/site00WorkspaceSelfConcept/generateWorkspaceGpt2AuthorityConcept.js';
import * as nbp from '../api/_lib/site00WorkspaceSelfConcept/renderWorkspaceNbpJob.js';
import { generateWorkspaceCreativeContext } from '../api/_lib/site00WorkspaceSelfConcept/generateWorkspaceCreativeContext.js';
import { generateWorkspaceGpt2AuthorityConcept } from '../api/_lib/site00WorkspaceSelfConcept/generateWorkspaceGpt2AuthorityConcept.js';
import { runWorkspaceSelfGeneration } from '../api/_lib/site00WorkspaceSelfConcept/runWorkspaceSelfGeneration.js';

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

describe('WORKSPACE_SELF creative pipeline R3', () => {
  it('generation plan: 1 CGPT, 1 GPT2, 3 renditions, 6 NBP outputs', () => {
    const plan = buildWorkspaceSelfGenerationPlan(readyState());
    expect(plan.cgptCalls).toBe(1);
    expect(plan.gpt2Calls).toBe(1);
    expect(plan.conceptCount).toBe(1);
    expect(plan.nbpRenditions).toBe(3);
    expect(plan.nbpJobs).toBe(6);
  });

  it('one run creates exactly one CGPT context and one GPT2 authority', async () => {
    const ctx = await generateWorkspaceCreativeContext({
      captureSetId: 'cap-1',
      functionContract: readyState().functionContract!,
      sourceRoute: 'r',
      hostDesignSystemVersion: 'v1',
      workspaceArchitectureVersion: 'v1',
      visualProblems: ['p'],
      opportunities: ['o'],
    });
    expect(ctx.creativeContextId).toMatch(/^wctx-/);

    const authority = await generateWorkspaceGpt2AuthorityConcept({
      creativeContext: ctx,
      functionContract: readyState().functionContract!,
      sourceRoute: 'r',
    });
    expect(authority.conceptId).toMatch(/^wg2-/);
    expect(authority.creativeContextId).toBe(ctx.creativeContextId);
  });

  it('GPT2 rejects multi-concept arrays at parse layer', async () => {
    const mod = await import('../api/_lib/site00WorkspaceSelfConcept/generateWorkspaceGpt2AuthorityConcept.js');
    expect(read('api/_lib/site00WorkspaceSelfConcept/generateWorkspaceGpt2AuthorityConcept.ts')).toContain(
      'multi-concept response rejected',
    );
    expect(mod.generateWorkspaceGpt2AuthorityConcept).toBeDefined();
  });

  it('orchestrator: CGPT×1, GPT2×1, NBP×6; renditions share sourceGpt2ConceptId', async () => {
    const cgptSpy = vi.spyOn(cgpt, 'generateWorkspaceCreativeContext');
    const gpt2Spy = vi.spyOn(gpt2, 'generateWorkspaceGpt2AuthorityConcept');
    const nbpSpy = vi.spyOn(nbp, 'renderWorkspaceNbpJob');

    const result = await runWorkspaceSelfGeneration({
      state: readyState(),
      founderConfirmedSpend: true,
      createdBy: 'f',
      mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
      desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
    });

    expect(cgptSpy).toHaveBeenCalledTimes(1);
    expect(gpt2Spy).toHaveBeenCalledTimes(1);
    expect(nbpSpy).toHaveBeenCalledTimes(6);
    expect(result.pipelineSet.schemaVersion).toBe(WORKSPACE_SELF_PIPELINE_SCHEMA_SINGLE);
    expect(result.pipelineSet.gpt2AuthorityConcept).toBeTruthy();
    const gpt2Id = result.pipelineSet.gpt2AuthorityConcept!.conceptId;
    expect(result.pipelineSet.renditions).toHaveLength(3);
    for (const r of result.pipelineSet.renditions) {
      expect(r.sourceGpt2ConceptId).toBe(gpt2Id);
    }
    const jobGpt2 = new Set(result.jobs.map((j) => j.gpt2ConceptId));
    expect(jobGpt2.size).toBe(1);
    expect([...jobGpt2][0]).toBe(gpt2Id);

    cgptSpy.mockRestore();
    gpt2Spy.mockRestore();
    nbpSpy.mockRestore();
  });

  it('NBP planner creates three rendition groups with mobile + desktop each', () => {
    expect(planWorkspaceNbpRenditions()).toHaveLength(3);
    for (const slot of WORKSPACE_CONCEPT_SLOT_IDS) {
      expect(planWorkspaceNbpRenditions().some((p) => p.slot === slot)).toBe(true);
    }
  });

  it('concept set carries single gpt2AuthorityConceptId after merge', () => {
    let s = readyState();
    s = beginWorkspaceConceptSet(s, {
      captureSetId: s.activeCaptureSetId!,
      functionContractId: s.functionContract!.contractId,
      creativeBriefSetId: 'wsp-1',
      createdBy: 't',
    });
    expect(s.conceptSet?.schemaVersion).toBe(WORKSPACE_SELF_PIPELINE_SCHEMA_SINGLE);
  });

  it('legacy pipeline with slots is marked LEGACY_MULTI_CONCEPT without reinterpretation', () => {
    const legacy = normalizeWorkspaceSelfState({
      ...createInitialWorkspaceSelfState(),
      creativePipelineSet: {
        pipelineSetId: 'old',
        targetId: 'workspace-self',
        captureSetId: 'c1',
        functionContractId: 'fc1',
        creativeContext: null,
        gpt2AuthorityConcept: null,
        renditions: [],
        slots: [
          { conceptSlot: 'CONCEPT_A', direction: null, concept: null },
          { conceptSlot: 'CONCEPT_B', direction: null, concept: null },
          { conceptSlot: 'CONCEPT_C', direction: null, concept: null },
        ],
        createdAt: new Date().toISOString(),
      } as never,
    });
    expect(legacy.creativePipelineSet?.schemaVersion).toBe(WORKSPACE_SELF_PIPELINE_SCHEMA_LEGACY);
  });

  it('compare UI uses renditions semantics', () => {
    let s = readyState();
    s = beginWorkspaceConceptSet(s, {
      captureSetId: s.activeCaptureSetId!,
      functionContractId: s.functionContract!.contractId,
      creativeBriefSetId: 'wsp-1',
      createdBy: 't',
    });
    const cols = buildCompareRenditionColumns(s, 'MOBILE');
    expect(cols[0].conceptName).toContain('RENDITION');
  });

  it('inspect lineage exposes GPT2 authority separately from NBP rendition', () => {
    const lineage = resolveInspectLineage(readyState(), 'CONCEPT_B');
    expect(lineage).toHaveProperty('gpt2AuthorityConcept');
    expect(lineage).toHaveProperty('nbpRendition');
    expect(lineage).toHaveProperty('cgptCreativeContext');
  });

  it('no Opus or Grok provider adapters in workspace self generation path', () => {
    const orch = read('api/_lib/site00WorkspaceSelfConcept/runWorkspaceSelfGeneration.ts');
    expect(orch).not.toMatch(/generateOpus|grok-4|xai\.com|anthropic.*opus/i);
    expect(orch).toContain('generateWorkspaceCreativeContext');
    expect(read('src/site00/pages/SystemDesignWorkspaceConceptsPage.tsx')).toContain('COMPARE RENDITIONS');
  });

  it('GPT2 failure skips all NBP jobs', async () => {
    const gpt2Spy = vi.spyOn(gpt2, 'generateWorkspaceGpt2AuthorityConcept');
    gpt2Spy.mockRejectedValueOnce(new Error('GPT2_AUTHORITY_FAILED: test'));

    const result = await runWorkspaceSelfGeneration({
      state: readyState(),
      founderConfirmedSpend: true,
      createdBy: 'f',
      mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
      desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
    });

    expect(result.jobs).toHaveLength(0);
    expect(result.pipelineSet.gpt2AuthorityConcept).toBeNull();
    gpt2Spy.mockRestore();
  });
});
