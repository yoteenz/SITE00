/**
 * P0.VR.DESIGN-WORKSPACE-SELF-NBP-INTEGRATION-AUDIT1 (updated for CGPT→GPT2 pipeline)
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  buildWorkspaceSelfGenerationPlan,
  listExpectedNbpJobKeys,
  WORKSPACE_SELF_NBP_MODEL,
} from '../shared/site00-design-workspace-production/workspaceSelfConcept/generationPlan.js';
import {
  applyCreativePipelineSet,
  beginWorkspaceConceptSet,
  mergeGenerationArtifactsIntoConcepts,
  registerGenerationJobs,
} from '../shared/site00-design-workspace-production/workspaceSelfConcept/generationWorkflow.js';
import { compileAndFreezeFunctionContract } from '../shared/site00-design-workspace-production/workspaceSelfConcept/workflow.js';
import { applyWorkspaceSelfCapturePair, beginWorkspaceSelfCaptureSet } from '../shared/site00-design-workspace-production/workspaceSelfConcept/captureWorkflow.js';
import { createInitialWorkspaceSelfState } from '../shared/site00-design-workspace-production/workspaceSelfConcept/workflow.js';
import { WORKSPACE_FUNCTION_CONTRACT_VERSION } from '../shared/site00-design-workspace-production/workspaceSelfConcept/functionContract.js';
import { runWorkspaceSelfGeneration } from '../api/_lib/site00WorkspaceSelfConcept/runWorkspaceSelfGeneration.js';

const read = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

describe('WORKSPACE_SELF NBP integration audit', () => {
  it('workspace-concepts page uses WORKSPACE_SELF generate label, not PAGE path', () => {
    const page = read('src/site00/pages/SystemDesignWorkspaceConceptsPage.tsx');
    expect(page).toContain('GENERATE WORKSPACE CONCEPT');
    expect(page).not.toContain('GENERATE PAGE CONCEPTS');
    expect(read('src/site00/hooks/useWorkspaceSelfConcept.ts')).toContain('runWorkspaceSelfConceptGeneration');
  });

  it('requires WORKSPACE_SELF targetType and READY capture pair + contract for plan', () => {
    let s = createInitialWorkspaceSelfState();
    expect(() => buildWorkspaceSelfGenerationPlan(s)).toThrow('BLOCKED_NO_FUNCTION_CONTRACT');
    s = compileAndFreezeFunctionContract(s);
    expect(() => buildWorkspaceSelfGenerationPlan(s)).toThrow('BLOCKED_NO_CAPTURE');

    s = beginWorkspaceSelfCaptureSet(s, { build: 'test', createdBy: 'founder@test' });
    const setId = s.activeCaptureSetId!;
    s = applyWorkspaceSelfCapturePair(s, {
      captureSetId: setId,
      build: 'test',
      createdBy: 'founder@test',
      route: '/projects/design/ndxbook',
      mobile: { captureId: 'm1', artifactPath: 'local://m1' },
      desktop: { captureId: 'd1', artifactPath: 'local://d1' },
    });
    s = compileAndFreezeFunctionContract(s);
    const plan = buildWorkspaceSelfGenerationPlan(s);
    expect(plan.targetType).toBe('WORKSPACE_SELF');
    expect(plan.cgptCalls).toBe(1);
    expect(plan.gpt2Calls).toBe(1);
    expect(plan.nbpRenditions).toBe(3);
    expect(plan.nbpJobs).toBe(6);
    expect(listExpectedNbpJobKeys()).toHaveLength(6);
  });

  it('sequential pipeline produces 1 GPT2 authority and 6 NBP jobs under vitest', async () => {
    let s = createInitialWorkspaceSelfState();
    s = compileAndFreezeFunctionContract(s);
    s = beginWorkspaceSelfCaptureSet(s, { build: 'test', createdBy: 'f' });
    const setId = s.activeCaptureSetId!;
    s = applyWorkspaceSelfCapturePair(s, {
      captureSetId: setId,
      build: 'test',
      createdBy: 'f',
      route: '/projects/design/ndxbook',
      mobile: { captureId: 'm1', artifactPath: 'local://m1' },
      desktop: { captureId: 'd1', artifactPath: 'local://d1' },
    });

    const result = await runWorkspaceSelfGeneration({
      state: s,
      founderConfirmedSpend: true,
      createdBy: 'founder@test',
      mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
      desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
    });

    expect(result.pipelineSet.gpt2AuthorityConcept).toBeTruthy();
    expect(result.pipelineSet.renditions).toHaveLength(3);
    expect(result.jobs).toHaveLength(6);
    expect(new Set(result.jobs.map((j) => j.gpt2ConceptId)).size).toBe(1);
    expect(result.plan.functionContractVersion).toBe(WORKSPACE_FUNCTION_CONTRACT_VERSION);
  });

  it('maps artifacts to concept gallery slots with shared gpt2ConceptId per viewport pair', async () => {
    let s = createInitialWorkspaceSelfState();
    s = compileAndFreezeFunctionContract(s);
    s = beginWorkspaceSelfCaptureSet(s, { build: 'test', createdBy: 'f' });
    const setId = s.activeCaptureSetId!;
    s = applyWorkspaceSelfCapturePair(s, {
      captureSetId: setId,
      build: 'b',
      createdBy: 'f',
      route: '/projects/design/ndxbook',
      mobile: { captureId: 'm1', artifactPath: 'local://m1' },
      desktop: { captureId: 'd1', artifactPath: 'local://d1' },
    });

    const result = await runWorkspaceSelfGeneration({
      state: s,
      founderConfirmedSpend: true,
      createdBy: 'f',
      mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
      desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
    });

    s = applyCreativePipelineSet(s, result.pipelineSet);
    s = beginWorkspaceConceptSet(s, {
      captureSetId: result.plan.captureSetId,
      functionContractId: result.plan.functionContractId,
      creativeBriefSetId: result.pipelineSet.pipelineSetId,
      createdBy: 'f',
    });
    s = registerGenerationJobs(
      s,
      result.jobs.map((j) => ({
        ...j,
        artifactPath: j.status === 'READY' ? `local://${j.artifactId}` : null,
      })),
    );
    s = mergeGenerationArtifactsIntoConcepts(s);
    expect(s.generationStatus).toBe('READY_FOR_REVIEW');
    const aMobile = result.jobs.find((j) => j.conceptId === 'CONCEPT_A' && j.viewport === 'MOBILE');
    const aDesktop = result.jobs.find((j) => j.conceptId === 'CONCEPT_A' && j.viewport === 'DESKTOP');
    expect(aMobile?.gpt2ConceptId).toBe(aDesktop?.gpt2ConceptId);
  });
});
