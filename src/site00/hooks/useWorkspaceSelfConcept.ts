import { useCallback, useEffect, useState } from 'react';

import {
  applyWorkspaceSelfCapturePair,
  approveOpusShell,
  beginWorkspaceSelfCaptureSet,
  compileAndFreezeFunctionContract,
  completePairReview,
  createComposerHandoff,
  createInitialWorkspaceSelfState,
  createNbpConceptPackage,
  failWorkspaceSelfCaptureSet,
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
  evaluateNbpHandoffReadiness,
  type WorkspaceConceptSlotId,
  type WorkspaceSelfWorkflowState,
} from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/index.js';
import { WORKSPACE_SELF_TARGET } from '../../../shared/site00-design-workspace-production/designTargetModel.js';
import { getCurrentUser, isAdminFounderAccount } from '../../utils/adminAuth';
import { persistCaptureArtifact } from '../services/workspaceSelfArtifactStorage';
import { requestWorkspaceSelfDesignCapture } from '../services/workspaceSelfCaptureClient';

export function useWorkspaceSelfConcept() {
  const [state, setState] = useState<WorkspaceSelfWorkflowState>(() => createInitialWorkspaceSelfState());
  const [capturing, setCapturing] = useState(false);

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
  const buildLabel = import.meta.env.VITE_SITE00_BUILD ?? import.meta.env.MODE ?? 'dev';

  const recaptureCurrentWorkspace = useCallback(async () => {
    setCapturing(true);
    let captureSetId: string | null = null;
    try {
      const started = beginWorkspaceSelfCaptureSet(loadWorkspaceSelfState(), {
        build: buildLabel,
        createdBy: actorEmail,
      });
      captureSetId = started.activeCaptureSetId;
      if (!captureSetId) throw new Error('CAPTURE_SET_START_FAILED');
      saveWorkspaceSelfState(started);
      setState(started);

      const result = await requestWorkspaceSelfDesignCapture({
        build: buildLabel,
        sourceContext: started.sourceContext,
      });

      const mobilePath = persistCaptureArtifact(result.mobile.captureId, result.mobile.artifactBase64);
      const desktopPath = persistCaptureArtifact(result.desktop.captureId, result.desktop.artifactBase64);

      const setId = captureSetId;
      run((s) =>
        applyWorkspaceSelfCapturePair(s, {
          captureSetId: setId,
          build: result.build,
          createdBy: actorEmail,
          route: result.route,
          mobile: { captureId: result.mobile.captureId, artifactPath: mobilePath },
          desktop: { captureId: result.desktop.captureId, artifactPath: desktopPath },
        }),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Capture failed';
      if (captureSetId) {
        const failedId = captureSetId;
        run((s) => failWorkspaceSelfCaptureSet(s, { captureSetId: failedId, reason: message }));
      }
      throw err;
    } finally {
      setCapturing(false);
    }
  }, [actorEmail, buildLabel, run]);

  return {
    state,
    target: WORKSPACE_SELF_TARGET,
    isFounder: isAdminFounderAccount(getCurrentUser()),
    capturing,
    nbpReadiness: evaluateNbpHandoffReadiness(state),
    open: () => run(markWorkspaceSelfOpened),
    recaptureCurrentWorkspace,
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
