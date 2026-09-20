/**
 * P0.VR.DESIGN-WORKSPACE-SELF-NBP-INTEGRATION-AUDIT1
 */

import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  buildWorkspaceSelfGenerationPlan,
  listExpectedNbpJobKeys,
  WORKSPACE_SELF_NBP_MODEL,
} from '../shared/site00-design-workspace-production/workspaceSelfConcept/generationPlan.js';
import {
  applyCreativeBriefSet,
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
    expect(page).toContain('GENERATE 3 WORKSPACE CONCEPTS');
    expect(page).not.toContain('GENERATE PAGE CONCEPTS');
    expect(page).toContain('workspace-self-generation-confirm');
    expect(read('src/site00/hooks/useWorkspaceSelfConcept.ts')).toContain('runWorkspaceSelfConceptGeneration');
    expect(read('src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace.ts')).toContain(
      'galleryGenerateLabel: \'GENERATE PAGE CONCEPTS\'',
    );
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
    expect(plan.functionContractVersion).toBe(WORKSPACE_FUNCTION_CONTRACT_VERSION);
    expect(plan.outputCount).toBe(6);
    expect(listExpectedNbpJobKeys()).toHaveLength(6);
  });

  it('creative layer produces exactly 3 territories and 6 NBP jobs under vitest', async () => {
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

    expect(result.creativeBriefSet.territories).toHaveLength(3);
    expect(result.jobs).toHaveLength(6);
    expect(result.jobs.every((j) => j.model === WORKSPACE_SELF_NBP_MODEL || j.model === 'vitest-nbp')).toBe(true);
    expect(new Set(result.jobs.map((j) => j.conceptId)).size).toBe(3);
  });

  it('maps artifacts to concept gallery slots', async () => {
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

    s = applyCreativeBriefSet(s, result.creativeBriefSet);
    s = beginWorkspaceConceptSet(s, {
      captureSetId: result.plan.captureSetId,
      functionContractId: result.plan.functionContractId,
      creativeBriefSetId: result.creativeBriefSet.creativeBriefSetId,
      createdBy: 'f',
    });
    s = registerGenerationJobs(
      s,
      result.jobs.map((j) => ({
        ...j,
        imageUri: `data:image/png;base64,${j.status === 'READY' ? 'c3R1Yg==' : ''}`,
        artifactPath: j.status === 'READY' ? `local://${j.artifactId}` : null,
      })),
    );
    s = mergeGenerationArtifactsIntoConcepts(s);
    expect(s.generationStatus).toBe('READY_FOR_REVIEW');
    expect(s.concepts.find((c) => c.conceptId === 'CONCEPT_A')?.mobileArtifactPath).toBeTruthy();
    expect(s.concepts.find((c) => c.conceptId === 'CONCEPT_C')?.desktopArtifactPath).toBeTruthy();
  });

  it('does not mutate production DESIGN workflow module', () => {
    expect(read('shared/site00-design-workspace-production/workspaceSelfConcept/workflow.ts')).toContain(
      'assertProductionWorkspaceUnmutated',
    );
  });
});
