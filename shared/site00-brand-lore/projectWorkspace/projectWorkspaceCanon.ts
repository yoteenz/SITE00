/**
 * Project Workspace Canon — SITE 00-owned workspace invariants.
 */

import { SITE00_LAYER, PROJECT_WORKSPACE_CONCEPT_LABEL } from './constants.js';
import { buildProjectWorkspaceBible, type ProjectWorkspaceBible } from './projectWorkspaceBible.js';
import { EXPERIMENT_E_DISCOVERY_RECORD } from './constants.js';

export type ProjectWorkspaceCanon = {
  canonId: string;
  layer: typeof SITE00_LAYER.PROJECT_WORKSPACE_CANON;
  conceptLabel: typeof PROJECT_WORKSPACE_CONCEPT_LABEL;
  bible: ProjectWorkspaceBible;
  workbenchBehaviors: string[];
  dossierBehaviors: string[];
  prohibitedMutations: string[];
  experimentEDiscovery: typeof EXPERIMENT_E_DISCOVERY_RECORD;
  clientExpressionCannotMutate: true;
  cannotBecomeClientBrandCanon: true;
  compiledAt: string;
};

export function buildProjectWorkspaceCanon(): ProjectWorkspaceCanon {
  const bible = buildProjectWorkspaceBible();
  return {
    canonId: 'site00-project-workspace-canon-v1',
    layer: SITE00_LAYER.PROJECT_WORKSPACE_CANON,
    conceptLabel: PROJECT_WORKSPACE_CONCEPT_LABEL,
    bible,
    workbenchBehaviors: [
      'ON THE BENCH',
      'ACTIVE PIECE',
      'REVIEW TRAY',
      'WORK HISTORY',
      'active work',
      'current focus',
      'work awaiting judgment',
      'completed/history states',
      'production progression',
      'tool/action behavior',
    ],
    dossierBehaviors: [
      'asymmetric hierarchy',
      'varied information weight',
      'layered evidence',
      'visual interruption',
      'artifact presence',
      'deliberate focal areas',
      'expandable deeper intelligence',
      'summary/evidence relationship',
      'non-dashboard composition',
    ],
    prohibitedMutations: [
      'CLIENT_PROJECT_EXPRESSION cannot mutate PROJECT_WORKSPACE_CANON',
      'PROJECT_WORKSPACE_CANON cannot become CLIENT_BRAND_CANON',
      'Per-client pixel template lock-in prohibited',
    ],
    experimentEDiscovery: EXPERIMENT_E_DISCOVERY_RECORD,
    clientExpressionCannotMutate: true,
    cannotBecomeClientBrandCanon: true,
    compiledAt: new Date().toISOString(),
  };
}

export function workspaceCanonIsSite00Owned(canon: ProjectWorkspaceCanon): boolean {
  return canon.layer === SITE00_LAYER.PROJECT_WORKSPACE_CANON;
}

export function workspaceCanonBlocksClientMutation(canon: ProjectWorkspaceCanon): boolean {
  return canon.clientExpressionCannotMutate === true;
}

export function workspaceCanonCannotBecomeBrandCanon(canon: ProjectWorkspaceCanon): boolean {
  return canon.cannotBecomeClientBrandCanon === true;
}

export function historicalExperimentEProvenancePreserved(canon: ProjectWorkspaceCanon): boolean {
  return (
    canon.experimentEDiscovery.historicalRecordsImmutable === true &&
    canon.experimentEDiscovery.priorClassification === 'NDXBOOK_EXPERIENCE_CONCEPT'
  );
}
