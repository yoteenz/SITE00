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
  applyCreativeBriefSet,
  beginWorkspaceConceptSet,
  mergeGenerationArtifactsIntoConcepts,
  registerGenerationJobs,
  failedGenerationJobIds,
  buildWorkspaceSelfGenerationPlan,
  WORKSPACE_SELF_DESKTOP_CAPTURE,
  workspaceSelfViewportSpec,
  type WorkspaceConceptSlotId,
  type WorkspaceSelfGenerationPlan,
  type WorkspaceSelfWorkflowState,
} from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/index.js';
import { WORKSPACE_SELF_TARGET } from '../../../shared/site00-design-workspace-production/designTargetModel.js';
import { getCurrentUser, isAdminFounderAccount } from '../../utils/adminAuth';
import {
  loadCaptureArtifactBase64,
  persistCaptureArtifact,
  resolveCaptureArtifactDisplayUrl,
} from '../services/workspaceSelfArtifactStorage';
import { requestWorkspaceSelfDesignCapture } from '../services/workspaceSelfCaptureClient';
import {
  planWorkspaceSelfConceptGeneration,
  runWorkspaceSelfConceptGeneration,
} from '../services/workspaceSelfGenerationClient';
import { latestCaptureForViewport } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/workflow.js';

export function useWorkspaceSelfConcept() {
  const [state, setState] = useState<WorkspaceSelfWorkflowState>(() => createInitialWorkspaceSelfState());
  const [capturing, setCapturing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<WorkspaceSelfGenerationPlan | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

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

  const prepareGenerationPlan = useCallback(async () => {
    setGenerationError(null);
    const current = loadWorkspaceSelfState();
    try {
      buildWorkspaceSelfGenerationPlan(current);
    } catch (e) {
      throw e;
    }
    const plan = await planWorkspaceSelfConceptGeneration(current);
    setPendingPlan(plan);
    run((s) => ({ ...s, generationStatus: 'PLANNED', nbpPackage: s.nbpPackage ? { ...s.nbpPackage, status: 'GENERATION_REQUESTED' } : s.nbpPackage }));
    return plan;
  }, [run]);

  const persistJobArtifacts = useCallback((jobs: import('../../../shared/site00-design-workspace-production/workspaceSelfConcept/generationTypes.js').WorkspaceSelfGeneratedArtifact[]) => {
    return jobs.map((job) => {
      if (!job.imageUri?.startsWith('data:image/png;base64,')) return job;
      const b64 = job.imageUri.replace('data:image/png;base64,', '');
      const path = persistCaptureArtifact(job.artifactId, b64);
      return { ...job, artifactPath: path, imageUri: resolveCaptureArtifactDisplayUrl(path) };
    });
  }, []);

  const confirmWorkspaceConceptGeneration = useCallback(async () => {
    setGenerationError(null);
    setGenerating(true);
    try {
      const current = loadWorkspaceSelfState();
      const mobile = latestCaptureForViewport(current, 'MOBILE');
      const desktop = latestCaptureForViewport(current, 'DESKTOP');
      const mobileB64 = loadCaptureArtifactBase64(mobile?.artifactPath ?? null);
      const desktopB64 = loadCaptureArtifactBase64(desktop?.artifactPath ?? null);
      if (!mobile?.captureId || !desktop?.captureId || !mobileB64 || !desktopB64) {
        throw new Error('BLOCKED_NO_CAPTURE');
      }
      const mobileSpec = workspaceSelfViewportSpec('MOBILE');
      const desktopSpec = WORKSPACE_SELF_DESKTOP_CAPTURE;

      run((s) => ({ ...s, generationStatus: 'CREATIVE_BRIEF_RUNNING' }));

      const result = await runWorkspaceSelfConceptGeneration({
        state: current,
        founderConfirmedSpend: true,
        mobileCapture: {
          captureId: mobile.captureId,
          artifactBase64: mobileB64,
          width: mobileSpec.width,
          height: mobileSpec.height,
        },
        desktopCapture: {
          captureId: desktop.captureId,
          artifactBase64: desktopB64,
          width: desktopSpec.width,
          height: desktopSpec.height,
        },
      });

      const jobsWithPaths = persistJobArtifacts([...result.jobs]);

      run((s) => {
        let next = applyCreativeBriefSet(s, result.creativeBriefSet);
        next = beginWorkspaceConceptSet(next, {
          captureSetId: result.plan.captureSetId,
          functionContractId: result.plan.functionContractId,
          creativeBriefSetId: result.creativeBriefSet.creativeBriefSetId,
          createdBy: actorEmail,
        });
        next = registerGenerationJobs(next, jobsWithPaths);
        next = mergeGenerationArtifactsIntoConcepts(next);
        return next;
      });
      setPendingPlan(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'GENERATION_FAILED';
      setGenerationError(message);
      run((s) => ({
        ...s,
        generationStatus: message.includes('CREATIVE') ? 'CREATIVE_BRIEF_FAILED' : message.includes('NBP_AUTH') ? 'NBP_AUTH_FAILED' : 'NBP_JOB_FAILED',
        lastGenerationFailure: { message, at: new Date().toISOString() },
      }));
      throw err;
    } finally {
      setGenerating(false);
    }
  }, [actorEmail, persistJobArtifacts, run]);

  const retryFailedGenerationJobs = useCallback(async () => {
    const failed = failedGenerationJobIds(loadWorkspaceSelfState());
    if (failed.length === 0) return;
    setGenerating(true);
    setGenerationError(null);
    try {
      const current = loadWorkspaceSelfState();
      const mobile = latestCaptureForViewport(current, 'MOBILE');
      const desktop = latestCaptureForViewport(current, 'DESKTOP');
      const mobileB64 = loadCaptureArtifactBase64(mobile?.artifactPath ?? null);
      const desktopB64 = loadCaptureArtifactBase64(desktop?.artifactPath ?? null);
      if (!mobileB64 || !desktopB64) throw new Error('BLOCKED_NO_CAPTURE');

      const result = await runWorkspaceSelfConceptGeneration({
        state: current,
        founderConfirmedSpend: true,
        retryArtifactIds: failed,
        mobileCapture: {
          captureId: mobile!.captureId,
          artifactBase64: mobileB64,
          width: workspaceSelfViewportSpec('MOBILE').width,
          height: workspaceSelfViewportSpec('MOBILE').height,
        },
        desktopCapture: {
          captureId: desktop!.captureId,
          artifactBase64: desktopB64,
          width: WORKSPACE_SELF_DESKTOP_CAPTURE.width,
          height: WORKSPACE_SELF_DESKTOP_CAPTURE.height,
        },
      });

      const jobsWithPaths = persistJobArtifacts([...result.jobs]);
      run((s) => {
        const mergedJobs = s.generationJobs.map((j) => jobsWithPaths.find((r) => r.artifactId === j.artifactId) ?? j);
        let next = registerGenerationJobs(s, mergedJobs);
        next = mergeGenerationArtifactsIntoConcepts(next);
        return next;
      });
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : 'RETRY_FAILED');
      throw err;
    } finally {
      setGenerating(false);
    }
  }, [persistJobArtifacts, run]);

  return {
    state,
    target: WORKSPACE_SELF_TARGET,
    isFounder: isAdminFounderAccount(getCurrentUser()),
    capturing,
    generating,
    pendingPlan,
    generationError,
    nbpReadiness: evaluateNbpHandoffReadiness(state),
    open: () => run(markWorkspaceSelfOpened),
    recaptureCurrentWorkspace,
    compileContract: () => run(compileAndFreezeFunctionContract),
    createNbpPackage: () => run(createNbpConceptPackage),
    requestGeneration: () => run(requestConceptGeneration),
    prepareGenerationPlan,
    confirmWorkspaceConceptGeneration,
    retryFailedGenerationJobs,
    cancelGenerationPlan: () => setPendingPlan(null),
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
