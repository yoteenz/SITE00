import { useCallback, useEffect, useState } from 'react';

import {
  addWorkspaceSelfCapture,
  approveOpusShell,
  compileAndFreezeFunctionContract,
  completePairReview,
  createComposerHandoff,
  createInitialWorkspaceSelfState,
  createNbpConceptPackage,
  lockWorkspaceAuthority,
  loadWorkspaceSelfState,
  markImplementationReady,
  markImplementationStarted,
  markOpusShellCreated,
  markWorkspaceSelfOpened,
  openPairReview,
  promoteViewportConcept,
  requestConceptGeneration,
  requestOpusDesignShell,
  saveWorkspaceSelfState,
  selectViewportConcept,
  stageConceptArtifact,
  type WorkspaceConceptSlotId,
  type WorkspaceSelfWorkflowState,
} from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/index.js';
import { WORKSPACE_SELF_TARGET } from '../../../shared/site00-design-workspace-production/designTargetModel.js';
import { getCurrentUser, isAdminFounderAccount } from '../../utils/adminAuth';

export function useWorkspaceSelfConcept() {
  const [state, setState] = useState<WorkspaceSelfWorkflowState>(() => createInitialWorkspaceSelfState());

  useEffect(() => {
    setState(loadWorkspaceSelfState());
  }, []);

  const run = useCallback((fn: (s: WorkspaceSelfWorkflowState) => WorkspaceSelfWorkflowState) => {
    setState((prev) => {
      const next = fn(prev);
      saveWorkspaceSelfState(next);
      return next;
    });
  }, []);

  const actorEmail = getCurrentUser()?.email ?? 'founder@unknown';

  return {
    state,
    target: WORKSPACE_SELF_TARGET,
    isFounder: isAdminFounderAccount(getCurrentUser()),
    open: () => run(markWorkspaceSelfOpened),
    recordCurrentCaptures: (build: string) => {
      run((s) => {
        let next = addWorkspaceSelfCapture(s, {
          viewport: 'MOBILE',
          route: '/projects/design/ndxbook',
          build,
          artifactPath: null,
          createdBy: actorEmail,
        });
        next = addWorkspaceSelfCapture(next, {
          viewport: 'DESKTOP',
          route: '/projects/design/ndxbook',
          build,
          artifactPath: null,
          createdBy: actorEmail,
        });
        return next;
      });
    },
    compileContract: () => run(compileAndFreezeFunctionContract),
    createNbpPackage: () => run(createNbpConceptPackage),
    requestGeneration: () => run(requestConceptGeneration),
    stageConcept: (id: WorkspaceConceptSlotId) =>
      run((s) =>
        stageConceptArtifact(s, id, {
          conceptTerritory: 'Pending NBP territory',
          rationale: 'Staged slot — NBP defines composition later.',
        }),
      ),
    selectMobile: (id: WorkspaceConceptSlotId) => run((s) => selectViewportConcept(s, 'MOBILE', id)),
    selectDesktop: (id: WorkspaceConceptSlotId) => run((s) => selectViewportConcept(s, 'DESKTOP', id)),
    promoteMobile: () => run((s) => promoteViewportConcept(s, 'MOBILE')),
    promoteDesktop: () => run((s) => promoteViewportConcept(s, 'DESKTOP')),
    openPairReview: () => run(openPairReview),
    completePairReview: () => run(completePairReview),
    lockAuthority: () => run((s) => lockWorkspaceAuthority(s, actorEmail)),
    requestOpusShell: () => run(requestOpusDesignShell),
    markOpusShellCreated: () => run(markOpusShellCreated),
    approveOpusShell: () => run(approveOpusShell),
    sendToComposer: () => run(createComposerHandoff),
    startImplementation: () => run(markImplementationStarted),
    markImplementationReady: () => run(markImplementationReady),
  };
}
