/**
 * P0.VR.DESIGN-WORKSPACE-SELF-AUTHORITY-PAIR-BINDING1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  resolveViewportAuthorityPreview,
  resolveWorkspaceSelfAuthorityPairPresentation,
} from '../shared/site00-design-workspace-production/workspaceSelfConcept/viewportAuthorityPreview.js';
import {
  beginWorkspaceConceptSet,
  mergeGenerationArtifactsIntoConcepts,
  registerGenerationJobs,
} from '../shared/site00-design-workspace-production/workspaceSelfConcept/generationWorkflow.js';
import {
  createInitialWorkspaceSelfState,
  compileAndFreezeFunctionContract,
  lockWorkspaceAuthority,
  openPairReview,
  completePairReview,
  promoteViewportConcept,
  selectViewportConcept,
  stageConceptArtifact,
} from '../shared/site00-design-workspace-production/workspaceSelfConcept/workflow.js';
import type { WorkspaceSelfGeneratedArtifact } from '../shared/site00-design-workspace-production/workspaceSelfConcept/generationTypes.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function job(
  conceptId: 'CONCEPT_A' | 'CONCEPT_B' | 'CONCEPT_C',
  viewport: 'MOBILE' | 'DESKTOP',
  captureSetId: string,
  artifactPath: string,
): WorkspaceSelfGeneratedArtifact {
  return {
    artifactId: `wsga-${conceptId}-${viewport}`,
    conceptId,
    territoryId: `wg2-${conceptId}`,
    viewport,
    captureSetId,
    functionContractId: 'wsfc-test',
    creativeBriefSetId: 'wsp-test',
    creativeDirectionId: `wdir-${conceptId}`,
    gpt2ConceptId: `wg2-${conceptId}`,
    provider: 'NBP',
    model: 'fal-ai/nano-banana-pro/edit',
    providerJobId: 'job-1',
    promptVersion: 'v2',
    createdAt: new Date().toISOString(),
    status: 'READY',
    artifactPath,
    imageUri: null,
    width: 390,
    height: 844,
  };
}

function withConceptSet(state: ReturnType<typeof createInitialWorkspaceSelfState>, captureSetId: string) {
  let s = compileAndFreezeFunctionContract(state);
  s = beginWorkspaceConceptSet(s, {
    captureSetId,
    functionContractId: s.functionContract!.contractId,
    creativeBriefSetId: 'wsp-1',
    createdBy: 'test',
  });
  return s;
}

describe('WORKSPACE_SELF authority pair preview binding', () => {
  it('does not reference design bench static authority fixtures in workspace-self panel', () => {
    const panel = read('src/site00/components/workspaceSelf/WorkspaceSelfAuthorityPairPanel.tsx');
    expect(panel).toContain('resolveWorkspaceSelfAuthorityPairPresentation');
    expect(panel).not.toContain('resolveActiveAuthorityImage');
    expect(panel).not.toContain('TWIN_OPUS_DIRECT');
  });

  it('empty state when no concepts generated', () => {
    const s = createInitialWorkspaceSelfState();
    const { mobile, desktop } = resolveWorkspaceSelfAuthorityPairPresentation(s);
    expect(mobile.state).toBe('EMPTY');
    expect(desktop.state).toBe('EMPTY');
    expect(mobile.imageRef).toBeNull();
    expect(mobile.emptyMessage).toMatch(/mobile/i);
  });

  it('mobile-only artifact renders mobile preview and desktop empty', () => {
    let s = withConceptSet(createInitialWorkspaceSelfState(), 'cap-1');
    s = registerGenerationJobs(s, [job('CONCEPT_A', 'MOBILE', 'cap-1', 'local://mob-a')]);
    s = mergeGenerationArtifactsIntoConcepts(s);
    s = stageConceptArtifact(s, 'CONCEPT_A', {});
    s = selectViewportConcept(s, 'MOBILE', 'CONCEPT_A');

    const mobile = resolveViewportAuthorityPreview(s, 'MOBILE');
    const desktop = resolveViewportAuthorityPreview(s, 'DESKTOP');
    expect(mobile.imageRef).toBe('local://mob-a');
    expect(mobile.state).toBe('SELECTED_PENDING_PROMOTION');
    expect(desktop.state).toBe('EMPTY');
  });

  it('desktop-only artifact renders desktop preview', () => {
    let s = withConceptSet(createInitialWorkspaceSelfState(), 'cap-1');
    s = registerGenerationJobs(s, [job('CONCEPT_B', 'DESKTOP', 'cap-1', 'local://desk-b')]);
    s = mergeGenerationArtifactsIntoConcepts(s);
    s = stageConceptArtifact(s, 'CONCEPT_B', {});
    s = selectViewportConcept(s, 'DESKTOP', 'CONCEPT_B');

    const desktop = resolveViewportAuthorityPreview(s, 'DESKTOP');
    expect(desktop.imageRef).toBe('local://desk-b');
    expect(desktop.conceptSlot).toBe('CONCEPT_B');
  });

  it('both viewport artifacts render when selected', () => {
    let s = withConceptSet(createInitialWorkspaceSelfState(), 'cap-1');
    s = registerGenerationJobs(s, [
      job('CONCEPT_A', 'MOBILE', 'cap-1', 'local://mob-a'),
      job('CONCEPT_A', 'DESKTOP', 'cap-1', 'local://desk-a'),
    ]);
    s = mergeGenerationArtifactsIntoConcepts(s);
    s = stageConceptArtifact(s, 'CONCEPT_A', {});
    s = selectViewportConcept(s, 'MOBILE', 'CONCEPT_A');
    s = selectViewportConcept(s, 'DESKTOP', 'CONCEPT_A');

    const { mobile, desktop } = resolveWorkspaceSelfAuthorityPairPresentation(s);
    expect(mobile.imageRef).toBe('local://mob-a');
    expect(desktop.imageRef).toBe('local://desk-a');
  });

  it('selecting mobile updates mobile preview binding', () => {
    let s = withConceptSet(createInitialWorkspaceSelfState(), 'cap-1');
    s = registerGenerationJobs(s, [
      job('CONCEPT_A', 'MOBILE', 'cap-1', 'local://mob-a'),
      job('CONCEPT_B', 'MOBILE', 'cap-1', 'local://mob-b'),
    ]);
    s = mergeGenerationArtifactsIntoConcepts(s);
    s = stageConceptArtifact(s, 'CONCEPT_A', {});
    s = stageConceptArtifact(s, 'CONCEPT_B', {});
    s = selectViewportConcept(s, 'MOBILE', 'CONCEPT_A');
    expect(resolveViewportAuthorityPreview(s, 'MOBILE').imageRef).toBe('local://mob-a');
    s = selectViewportConcept(s, 'MOBILE', 'CONCEPT_B');
    expect(resolveViewportAuthorityPreview(s, 'MOBILE').imageRef).toBe('local://mob-b');
  });

  it('promoting mobile retains same image path and updates state', () => {
    let s = withConceptSet(createInitialWorkspaceSelfState(), 'cap-1');
    s = registerGenerationJobs(s, [job('CONCEPT_A', 'MOBILE', 'cap-1', 'local://mob-a')]);
    s = mergeGenerationArtifactsIntoConcepts(s);
    s = stageConceptArtifact(s, 'CONCEPT_A', {});
    s = selectViewportConcept(s, 'MOBILE', 'CONCEPT_A');
    const before = resolveViewportAuthorityPreview(s, 'MOBILE');
    s = promoteViewportConcept(s, 'MOBILE');
    const after = resolveViewportAuthorityPreview(s, 'MOBILE');
    expect(after.imageRef).toBe(before.imageRef);
    expect(after.state).toBe('PROMOTED');
    expect(before.state).toBe('SELECTED_PENDING_PROMOTION');
  });

  it('promoting desktop retains same image path', () => {
    let s = withConceptSet(createInitialWorkspaceSelfState(), 'cap-1');
    s = registerGenerationJobs(s, [job('CONCEPT_C', 'DESKTOP', 'cap-1', 'local://desk-c')]);
    s = mergeGenerationArtifactsIntoConcepts(s);
    s = stageConceptArtifact(s, 'CONCEPT_C', {});
    s = selectViewportConcept(s, 'DESKTOP', 'CONCEPT_C');
    const path = resolveViewportAuthorityPreview(s, 'DESKTOP').imageRef;
    s = promoteViewportConcept(s, 'DESKTOP');
    expect(resolveViewportAuthorityPreview(s, 'DESKTOP').imageRef).toBe(path);
    expect(resolveViewportAuthorityPreview(s, 'DESKTOP').state).toBe('PROMOTED');
  });

  it('superseded capture set job is not shown as current preview', () => {
    let s = withConceptSet(createInitialWorkspaceSelfState(), 'cap-old');
    s = registerGenerationJobs(s, [job('CONCEPT_A', 'MOBILE', 'cap-old', 'local://stale')]);
    s = mergeGenerationArtifactsIntoConcepts(s);
    s = stageConceptArtifact(s, 'CONCEPT_A', {});
    s = selectViewportConcept(s, 'MOBILE', 'CONCEPT_A');

    s = beginWorkspaceConceptSet(s, {
      captureSetId: 'cap-new',
      functionContractId: s.functionContract!.contractId,
      creativeBriefSetId: 'wsp-2',
      createdBy: 'test',
    });
    s = registerGenerationJobs(s, []);

    const mobile = resolveViewportAuthorityPreview(s, 'MOBILE');
    expect(mobile.state).toBe('EMPTY');
    expect(mobile.imageRef).toBeNull();
  });

  it('pair review and lock states surface on previews', () => {
    let s = withConceptSet(createInitialWorkspaceSelfState(), 'cap-1');
    s = registerGenerationJobs(s, [
      job('CONCEPT_A', 'MOBILE', 'cap-1', 'local://mob-a'),
      job('CONCEPT_B', 'DESKTOP', 'cap-1', 'local://desk-b'),
    ]);
    s = mergeGenerationArtifactsIntoConcepts(s);
    s = stageConceptArtifact(s, 'CONCEPT_A', {});
    s = stageConceptArtifact(s, 'CONCEPT_B', {});
    s = selectViewportConcept(s, 'MOBILE', 'CONCEPT_A');
    s = selectViewportConcept(s, 'DESKTOP', 'CONCEPT_B');
    s = promoteViewportConcept(s, 'MOBILE');
    s = promoteViewportConcept(s, 'DESKTOP');
    s = openPairReview(s);
    expect(resolveViewportAuthorityPreview(s, 'MOBILE').state).toBe('PAIR_REVIEW');

    s = completePairReview(s);
    s = lockWorkspaceAuthority(s, 'founder@test');
    expect(resolveViewportAuthorityPreview(s, 'MOBILE').state).toBe('LOCKED');
    expect(resolveViewportAuthorityPreview(s, 'MOBILE').imageRef).toBe('local://mob-a');
  });

  it('page mounts authority pair panel with shared resolver', () => {
    const page = read('src/site00/pages/SystemDesignWorkspaceConceptsPage.tsx');
    expect(page).toContain('WorkspaceSelfAuthorityPairPanel');
    expect(read('src/site00/components/workspaceSelf/WorkspaceSelfAuthorityPairPanel.tsx')).toContain(
      'workspace-self-authority-pair',
    );
  });
});
