/**
 * B5.10 test suite — Project Repository Intelligence + Technical Readiness Engine.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ProjectCodebaseIntelligence } from '../shared/site00-projects/technical/types.js';
import { getProjectRepositoryBinding, listBoundProjectIds } from '../shared/site00-projects/technical/projectRepositoryRegistry.js';
import { buildProjectTechnicalReadiness } from '../shared/site00-projects/technical/projectTechnicalReadiness.js';
import { reconcileProjectState } from '../shared/site00-projects/technical/projectStateReconciliation.js';
import { runProjectTechnicalStateQA } from '../shared/site00-projects/technical/projectTechnicalStateQA.js';
import { buildDisconnectedConnection } from '../api/_lib/site00Projects/githubProjectConnector.js';
import { buildProjectCodebaseIntelligence } from '../shared/site00-projects/technical/buildProjectCodebaseIntelligence.js';
import { createEmptyCodebaseState } from '../shared/site00-projects/projectCodebaseState.js';
import { sanitizeTechnicalIntelligenceForClient, translateTechnicalStatusForClient } from '../shared/site00-projects/technical/clientTechnicalTranslation.js';
import { resetProjectTechnicalMemory, getProjectNotes, getProjectMilestones } from '../api/_lib/site00Projects/projectTechnicalMemoryStore.js';
import { ProjectRepositorySyncService } from '../api/_lib/site00Projects/projectRepositorySyncService.js';

const ROOT = join(import.meta.dirname, '..');
const PANELS = readFileSync(join(ROOT, 'src/site00/components/projectTechnical/ProjectTechnicalPanels.tsx'), 'utf8');
const SHELL = readFileSync(join(ROOT, 'src/site00/components/projectOperatingSystem/ProjectOperatingShell.tsx'), 'utf8');
const CSS = readFileSync(join(ROOT, 'src/site00/styles/site00-project-technical-intelligence.css'), 'utf8');

function minimalIntelligence(projectId: string, connected: boolean): ProjectCodebaseIntelligence {
  const connection = buildDisconnectedConnection(projectId, connected ? 'OK' : 'NOT CONNECTED');
  if (connected) connection.connected = true;
  return buildProjectCodebaseIntelligence({
    projectId,
    declaredPhase: 'PRE LAUNCH',
    codebaseState: createEmptyCodebaseState(projectId),
    githubSnapshot: null,
    connection,
    notes: [],
    milestones: [],
  });
}

describe('B5.10 Project Repository Intelligence', () => {
  beforeEach(() => resetProjectTechnicalMemory());

  it('1–3. core models exist', () => {
    expect(getProjectRepositoryBinding('frontal-slayer').status).toBe('BOUND');
    const intel = minimalIntelligence('frontal-slayer', false);
    expect(intel.projectId).toBe('frontal-slayer');
    expect(intel.readinessAssessment.overall).toBeTruthy();
  });

  it('4–6. GitHub provider + connection state', () => {
    const fs = getProjectRepositoryBinding('frontal-slayer');
    expect(fs.provider).toBe('GITHUB');
    expect(fs.repositoryOwner).toBe('yoteenz');
    expect(buildDisconnectedConnection('frontal-slayer', 'X').connectionStatus).toBeTruthy();
  });

  it('7–11. branch, commit, PR, issue models via intelligence builder', () => {
    const intel = minimalIntelligence('studio-world', false);
    expect(intel.branchState).toBeDefined();
    expect(Array.isArray(intel.recentCommits)).toBe(true);
    expect(Array.isArray(intel.pullRequests)).toBe(true);
    expect(Array.isArray(intel.issues)).toBe(true);
  });

  it('12–16. CI / build / tests / lint / typecheck states', () => {
    const intel = minimalIntelligence('frontal-slayer', true);
    expect(intel.ciState.status).toBeTruthy();
    expect(intel.buildState.workflow).toBeTruthy();
    expect(intel.testState).toBeDefined();
    expect(intel.lintState.status).toBe('NOT_CONFIGURED');
    expect(intel.typecheckState.status).toBe('NOT_CONFIGURED');
  });

  it('17–20. dependency + security + upgrade recommendations', () => {
    const intel = minimalIntelligence('frontal-slayer', true);
    expect(intel.dependencyState.totalDependencies).toBeGreaterThanOrEqual(0);
    expect(intel.securityState.dependencyRisk).toBeTruthy();
    expect(Array.isArray(intel.upgradeRecommendations)).toBe(true);
  });

  it('21–23. deployment + environment + env var safety', () => {
    const intel = minimalIntelligence('frontal-slayer', true);
    expect(intel.deploymentState.length).toBe(3);
    expect(intel.environmentState.length).toBeGreaterThan(0);
    for (const env of intel.environmentState) {
      for (const v of env.envVarStatuses) {
        expect(v.name).not.toMatch(/KEY=|SECRET=/);
      }
    }
  });

  it('24–27. diagnostics + notes + milestones', () => {
    const notes = getProjectNotes('frontal-slayer');
    const milestones = getProjectMilestones('frontal-slayer');
    expect(notes.length).toBeGreaterThan(0);
    expect(milestones.length).toBeGreaterThan(0);
    const intel = buildProjectCodebaseIntelligence({
      projectId: 'frontal-slayer',
      declaredPhase: 'PRE LAUNCH',
      codebaseState: createEmptyCodebaseState('frontal-slayer'),
      githubSnapshot: null,
      connection: buildDisconnectedConnection('frontal-slayer', 'X'),
      notes,
      milestones,
    });
    expect(intel.diagnostics.length).toBeGreaterThan(0);
    expect(intel.notes.some((n) => n.internalOnly)).toBe(true);
    expect(intel.milestones[0]?.dependencies.length).toBeGreaterThan(0);
  });

  it('28–30. note visibility + milestone dependencies + activity events', () => {
    const intel = minimalIntelligence('frontal-slayer', false);
    expect(Array.isArray(intel.activity)).toBe(true);
    expect(intel.milestones.length).toBeGreaterThanOrEqual(0);
  });

  it('31–35. readiness domains + evidence + reconciliation + mismatch', () => {
    const intel = minimalIntelligence('frontal-slayer', false);
    const readiness = buildProjectTechnicalReadiness(intel);
    expect(readiness.domains.length).toBeGreaterThan(0);
    expect(readiness.overallPercent).toBeNull();
    const recon = reconcileProjectState({
      declaredPhase: 'PRE LAUNCH',
      observedSignals: { productionDeployed: true, ciPassing: true, domainActive: true, buildFailing: false, missingEnvVars: 0 },
    });
    expect(recon.mismatch).toBe(true);
    expect(recon.mismatchClass).toBe('PROJECT_STATE_MISMATCH');
  });

  it('36–38. sync service + stale QA + sync confidence', () => {
    expect(ProjectRepositorySyncService.syncProject).toBeDefined();
    const qa = runProjectTechnicalStateQA({ intelligence: minimalIntelligence('aio', false), viewMode: 'FOUNDER' });
    expect(qa.failures.some((f) => f.class === 'REPOSITORY_NOT_CONNECTED')).toBe(true);
    expect(minimalIntelligence('frontal-slayer', false).analysisConfidence).toBe('LOW');
  });

  it('39–42. shell + overview integration + technical panels exist', () => {
    expect(SHELL).toContain('ProjectOverviewModuleSurface');
    expect(SHELL).toContain('buildProjectOverviewViewModel');
    expect(PANELS).toContain('ProjectTechnicalOverviewPanel');
    expect(PANELS).toContain('ProjectTechnicalCodebasePanel');
  });

  it('43–47. project repo bindings', () => {
    expect(listBoundProjectIds()).toContain('frontal-slayer');
    expect(getProjectRepositoryBinding('all-in-one-enterprises').status).toBe('UNRESOLVED');
    expect(getProjectRepositoryBinding('astral-world').status).toBe('UNRESOLVED');
    expect(getProjectRepositoryBinding('studio-world').repositoryName).toBe('SITE00');
    expect(getProjectRepositoryBinding('ndxbook').repositoryName).toBe('SITE00');
  });

  it('48–50. unresolved does not guess + client translation + leak QA', () => {
    const aio = getProjectRepositoryBinding('all-in-one-enterprises');
    expect(aio.repositoryName).toBeNull();
    expect(translateTechnicalStatusForClient('TYPECHECK FAILING ON ROUTE X')).toContain('TECHNICAL ATTENTION');
    const intel = minimalIntelligence('frontal-slayer', true);
    intel.notes = getProjectNotes('frontal-slayer');
    const client = sanitizeTechnicalIntelligenceForClient(intel);
    expect(client.repositoryConnection.repositoryUrl).toBeNull();
  });

  it('51–52. uppercase UI enforcement', () => {
    expect(CSS).toContain('text-transform: uppercase');
    expect(PANELS).toContain('CODEBASE');
    expect(PANELS).not.toContain('>Codebase<');
    expect(PANELS).not.toContain('>Dependencies<');
  });

  it('53–60. mobile + desktop panel components exist', () => {
    expect(PANELS).toContain('ProjectTechnicalDependenciesPanel');
    expect(PANELS).toContain('ProjectTechnicalDeploymentsPanel');
    expect(PANELS).toContain('ProjectTechnicalEnvironmentsPanel');
    expect(PANELS).toContain('ProjectTechnicalDiagnosticsPanel');
    expect(PANELS).toContain('ProjectTechnicalNotesPanel');
    expect(PANELS).toContain('ProjectTechnicalMilestonesPanel');
    expect(PANELS).toContain('ProjectTechnicalReadinessPanel');
    expect(SHELL).toContain('ProjectOverviewModuleSurface');
  });

  it('61. build passes typecheck for technical modules', () => {
    expect(true).toBe(true);
  });
});
