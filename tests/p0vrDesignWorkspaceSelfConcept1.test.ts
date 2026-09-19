/**
 * P0.VR.DESIGN-WORKSPACE-SELF-CONCEPT1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  WORKSPACE_SELF_TARGET,
  assertWorkspaceSelfNotPage,
  isWorkspaceSelfTarget,
} from '../shared/site00-design-workspace-production/designTargetModel.js';
import {
  OPUS_FORBIDDEN_MUTATION_SCOPE,
  WORKSPACE_CONCEPT_SLOT_IDS,
  WORKSPACE_CONCEPT_GENERATION_COUNT,
} from '../shared/site00-design-workspace-production/workspaceSelfConcept/constants.js';
import {
  approveOpusShell,
  completePairReview,
  createComposerHandoff,
  createInitialWorkspaceSelfState,
  createNbpConceptPackage,
  lockWorkspaceAuthority,
  openPairReview,
  promoteViewportConcept,
  requestOpusDesignShell,
  selectViewportConcept,
  stageConceptArtifact,
  addWorkspaceSelfCapture,
  compileAndFreezeFunctionContract,
  assertProductionWorkspaceUnmutated,
} from '../shared/site00-design-workspace-production/workspaceSelfConcept/workflow.js';
import { SITE00_ROUTES } from '../src/site00/config/routes';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.DESIGN-WORKSPACE-SELF-CONCEPT1', () => {
  it('WORKSPACE_SELF is a valid DesignTargetType distinct from PAGE', () => {
    expect(WORKSPACE_SELF_TARGET.targetType).toBe('WORKSPACE_SELF');
    expect(() => assertWorkspaceSelfNotPage('WORKSPACE_SELF')).not.toThrow();
    expect(() => assertWorkspaceSelfNotPage('PAGE')).toThrow();
    expect(isWorkspaceSelfTarget(WORKSPACE_SELF_TARGET)).toBe(true);
  });

  it('self-design route does not replace project DESIGN route', () => {
    expect(SITE00_ROUTES.systemDesignWorkspaceConcepts).toBe('/system/design/workspace-concepts');
    expect(SITE00_ROUTES.projectDesign).toBe('/projects/:projectSlug/design');
    const routes = read('src/routes/Site00Routes.tsx');
    expect(routes).toContain('systemDesignWorkspaceConcepts');
    expect(routes).toContain('DesignTwinOpusDirectRouteGate');
  });

  it('supports exactly three concept slots and independent viewport selection', () => {
    expect(WORKSPACE_CONCEPT_SLOT_IDS).toHaveLength(3);
    expect(WORKSPACE_CONCEPT_GENERATION_COUNT).toBe(3);
    let s = createInitialWorkspaceSelfState();
    s = stageConceptArtifact(s, 'CONCEPT_A', { rationale: 'a' });
    s = stageConceptArtifact(s, 'CONCEPT_B', { rationale: 'b' });
    s = selectViewportConcept(s, 'MOBILE', 'CONCEPT_A');
    s = selectViewportConcept(s, 'DESKTOP', 'CONCEPT_B');
    expect(s.preferredMobileConceptId).toBe('CONCEPT_A');
    expect(s.preferredDesktopConceptId).toBe('CONCEPT_B');
  });

  it('selection does not equal promotion; promotion requires selection', () => {
    let s = createInitialWorkspaceSelfState();
    s = stageConceptArtifact(s, 'CONCEPT_A', {});
    s = selectViewportConcept(s, 'MOBILE', 'CONCEPT_A');
    expect(s.promotedMobileConceptId).toBeNull();
    s = promoteViewportConcept(s, 'MOBILE');
    expect(s.promotedMobileConceptId).toBe('CONCEPT_A');
    expect(() => promoteViewportConcept(createInitialWorkspaceSelfState(), 'DESKTOP')).toThrow();
  });

  it('Pair Review and lock gates follow promoted pair + completed review', () => {
    let s = createInitialWorkspaceSelfState();
    s = stageConceptArtifact(s, 'CONCEPT_A', {});
    s = stageConceptArtifact(s, 'CONCEPT_B', {});
    s = selectViewportConcept(s, 'MOBILE', 'CONCEPT_A');
    s = selectViewportConcept(s, 'DESKTOP', 'CONCEPT_B');
    s = promoteViewportConcept(s, 'MOBILE');
    s = promoteViewportConcept(s, 'DESKTOP');
    expect(() => lockWorkspaceAuthority(s, 'founder@test')).toThrow();
    s = openPairReview(s);
    s = completePairReview(s);
    s = compileAndFreezeFunctionContract(s);
    s = lockWorkspaceAuthority(s, 'founder@test');
    expect(s.authorityPair?.status).toBe('LOCKED');
  });

  it('Opus shell requires lock; Composer handoff requires approved Opus shell', () => {
    let s = createInitialWorkspaceSelfState();
    expect(() => requestOpusDesignShell(s)).toThrow();
    s = stageConceptArtifact(s, 'CONCEPT_A', {});
    s = stageConceptArtifact(s, 'CONCEPT_B', {});
    s = selectViewportConcept(s, 'MOBILE', 'CONCEPT_A');
    s = selectViewportConcept(s, 'DESKTOP', 'CONCEPT_B');
    s = promoteViewportConcept(s, 'MOBILE');
    s = promoteViewportConcept(s, 'DESKTOP');
    s = openPairReview(s);
    s = completePairReview(s);
    s = compileAndFreezeFunctionContract(s);
    s = lockWorkspaceAuthority(s, 'founder@test');
    s = requestOpusDesignShell(s);
    expect(s.opusShellPackage?.forbiddenMutationScope).toEqual([...OPUS_FORBIDDEN_MUTATION_SCOPE]);
    expect(() => createComposerHandoff(s)).toThrow();
    s = { ...s, opusShellPackage: { ...s.opusShellPackage!, status: 'STAGED', shellArtifactLabel: 'x' } };
    s = approveOpusShell(s);
    s = createComposerHandoff(s);
    expect(s.composerHandoff?.status).toBe('READY');
  });

  it('captures append without replacing history; production lock flag stays true', () => {
    let s = createInitialWorkspaceSelfState();
    s = addWorkspaceSelfCapture(s, {
      viewport: 'MOBILE',
      route: '/projects/design/ndxbook',
      build: 'v1',
      artifactPath: null,
      createdBy: 'test',
    });
    s = addWorkspaceSelfCapture(s, {
      viewport: 'MOBILE',
      route: '/projects/design/ndxbook',
      build: 'v2',
      artifactPath: null,
      createdBy: 'test',
    });
    expect(s.captures.filter((c) => c.viewport === 'MOBILE')).toHaveLength(2);
    expect(s.productionMutationLocked).toBe(true);
    expect(assertProductionWorkspaceUnmutated()).toBe(true);
  });

  it('NBP package requires contract + mobile/desktop captures', () => {
    let s = compileAndFreezeFunctionContract(createInitialWorkspaceSelfState());
    expect(() => createNbpConceptPackage(s)).toThrow();
    s = addWorkspaceSelfCapture(s, {
      viewport: 'MOBILE',
      route: '/r',
      build: 'b',
      artifactPath: null,
      createdBy: 't',
    });
    s = addWorkspaceSelfCapture(s, {
      viewport: 'DESKTOP',
      route: '/r',
      build: 'b',
      artifactPath: null,
      createdBy: 't',
    });
    s = createNbpConceptPackage(s);
    expect(s.nbpPackage?.generationCount).toBe(3);
  });

  it('MORE tab exposes founder entry link without replacing live workspace components', () => {
    const more = read('src/site00/components/designBench/production/projectTabs/ProjectMoreSurface.tsx');
    expect(more).toContain('systemDesignWorkspaceConcepts');
    expect(more).toContain('isAdminFounderAccount');
    const kit = read('src/site00/components/designBench/production/designProjectSurfaceKit.tsx');
    expect(kit).toContain('ProjectSurface');
  });
});
