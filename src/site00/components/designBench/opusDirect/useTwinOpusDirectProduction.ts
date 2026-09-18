import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { createInitialDesignProductionState } from '../../../../../shared/site00-design-workspace-production/designProductionStore.js';
import {
  readDesignProductionCache,
  readLegacyDesignProductionLocal,
  writeDesignProductionCache,
} from '../../../../../shared/site00-design-workspace-production/designProductionCache.js';
import { projectDesignProductionProjection } from '../../../../../shared/site00-design-workspace-production/designProductionProjection.js';
import {
  transitionConfirmComposerHandoff,
  transitionMarkTwinPageReviewed,
  transitionOpenPairReview,
  transitionPromoteViewportMaster,
  transitionSelectGalleryCandidate,
  transitionSelectViewportCandidate,
  transitionSubmitAuthorityReview,
} from '../../../../../shared/site00-design-workspace-production/designProductionTransitions.js';
import type {
  AuthorityReviewDecision,
  DesignProductionState,
  DesignProductionUiOverlay,
  DesignProductionUiPayload,
  DesignWorkspaceArtifactView,
  FounderActor,
} from '../../../../../shared/site00-design-workspace-production/types.js';
import {
  createComposerHandoffPackage,
  loadPageAuthorityWorkflow,
  savePageAuthorityWorkflow,
} from '../../../../../shared/site00-design-workspace-production/designPageAuthorityWorkflow.js';
import { getCurrentUser, isAdminFounderAccount } from '../../../../utils/adminAuth';
import { readDesignPageTarget } from '../production/designProductionPageTarget';
import {
  fetchDesignWorkspaceProductionSession,
  postDesignWorkspaceProductionCommand,
  type DesignWorkspaceProductionCommand,
} from './designWorkspaceProductionClient.js';

export type AuthoritySyncStatus = 'HYDRATING' | 'SYNCED' | 'STALE' | 'UNAVAILABLE';

export type TwinOpusDirectProductionActions = {
  setOverlay: (overlay: DesignProductionUiOverlay) => void;
  openOverflowMenu: () => void;
  openReadinessReceipt: () => void;
  openContractVersions: () => void;
  openCreativeContext: () => void;
  openProvenance: () => void;
  openHostModuleNav: () => void;
  runPairReview: () => void;
  runReviewAuthority: (decision: AuthorityReviewDecision) => void;
  runLockAuthorityPair: () => void;
  runMoveToBuild: () => void;
  requestSpendConfirm: (input: {
    action: 'REFINE' | 'REGENERATE';
    estimatedUsd: number;
    onConfirmed: (spendConfirmationId: string) => void;
  }) => void;
  confirmPendingSpend: () => void;
  cancelPendingSpend: () => void;
  dismissProductionError: () => void;
  runRefineConcept: (input: {
    parentCandidateId: string;
    spendConfirmationId: string;
    estimatedUsd: number;
  }) => void;
  runRegenerateConcept: (input: {
    siblingOfCandidateId: string;
    spendConfirmationId: string;
    estimatedUsd: number;
  }) => void;
  openReviewAuthority: () => void;
  openViewportAuthorityEditor: (viewport: 'MOBILE' | 'DESKTOP') => void;
  openComposerHandoff: () => void;
  confirmComposerHandoff: () => void;
  markTwinPageReviewed: () => void;
  openFullscreenArtifact: (artifact: DesignWorkspaceArtifactView) => void;
  openInspectCandidate: (candidateId: string) => void;
  openCompareConcepts: (leftId: string, rightId: string) => void;
  openStructuredArtifact: (columnId: string) => void;
  openPageBatchEdit: (input: { sourcePageId: string; pageIds: string[]; scope: string }) => void;
  openPageAssetInspect: (assetId: string) => void;
  openPageInteractionsInspector: () => void;
  openAmendmentDetail: () => void;
  selectGalleryCandidate: (candidateId: string) => void;
  selectViewportCandidate: (viewport: 'MOBILE' | 'DESKTOP', candidateId: string, candidateVersion: string) => void;
  promoteViewportMaster: (viewport: 'MOBILE' | 'DESKTOP') => void;
  clearUiPayload: () => void;
};

export type TwinOpusDirectProduction = {
  state: DesignProductionState;
  overlay: DesignProductionUiOverlay;
  uiPayload: DesignProductionUiPayload;
  projection: ReturnType<typeof projectDesignProductionProjection>;
  actor: FounderActor;
  actions: TwinOpusDirectProductionActions;
  productionError: string | null;
  syncStatus: AuthoritySyncStatus;
  serverSessionVersion: number | null;
  pendingSpend: {
    action: 'REFINE' | 'REGENERATE';
    estimatedUsd: number;
    onConfirmed: (spendConfirmationId: string) => void;
  } | null;
  refresh: () => void;
};

function resolveActor(): FounderActor {
  const user = getCurrentUser();
  const email = user?.email ?? null;
  return { email, isFounder: isAdminFounderAccount(user) };
}

export function useTwinOpusDirectProduction(projectSlug: string): TwinOpusDirectProduction {
  const projectId = (projectSlug || 'ndxbook').trim().toLowerCase();
  const [state, setState] = useState<DesignProductionState>(() => createInitialDesignProductionState(projectId));
  const [serverSessionVersion, setServerSessionVersion] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<AuthoritySyncStatus>('HYDRATING');
  const [overlay, setOverlay] = useState<DesignProductionUiOverlay>(null);
  const [uiPayload, setUiPayload] = useState<DesignProductionUiPayload>({});
  const [productionError, setProductionError] = useState<string | null>(null);
  const [pendingSpend, setPendingSpend] = useState<TwinOpusDirectProduction['pendingSpend']>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const versionRef = useRef<number | null>(null);
  versionRef.current = serverSessionVersion;

  const applyServerState = useCallback(
    (next: DesignProductionState, version: number) => {
      setState(next);
      setServerSessionVersion(version);
      writeDesignProductionCache(projectId, next, version);
      setSyncStatus('SYNCED');
    },
    [projectId],
  );

  const hydrate = useCallback(async () => {
    setSyncStatus('HYDRATING');
    const fetched = await fetchDesignWorkspaceProductionSession(projectId);
    if (fetched.unavailable) {
      const cache = readDesignProductionCache(projectId);
      if (cache) {
        setState(cache.state);
        setServerSessionVersion(cache.serverSessionVersion);
        setSyncStatus('STALE');
      } else {
        setState(createInitialDesignProductionState(projectId));
        setServerSessionVersion(null);
        setSyncStatus('UNAVAILABLE');
      }
      return;
    }

    if (fetched.state && fetched.sessionVersion !== null) {
      applyServerState(fetched.state, fetched.sessionVersion);
      setProductionError(null);
      return;
    }

    const legacy = readLegacyDesignProductionLocal(projectId);
    const actor = resolveActor();
    if (legacy && actor.isFounder) {
      try {
        const migrated = await postDesignWorkspaceProductionCommand({
          projectId,
          command: 'MIGRATE_FROM_LOCAL',
          expectedSessionVersion: null,
          payload: { localState: legacy },
        });
        if (migrated.unavailable) throw new Error('UNAVAILABLE');
        applyServerState(migrated.state, migrated.sessionVersion);
        setProductionError(null);
        return;
      } catch {
        /* fall through */
      }
    }

    setState(createInitialDesignProductionState(projectId));
    setServerSessionVersion(null);
    setSyncStatus('SYNCED');
    setProductionError(null);
  }, [applyServerState, projectId]);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const applyLocalState = useCallback(
    (next: DesignProductionState) => {
      setState(next);
      writeDesignProductionCache(projectId, next, versionRef.current ?? next.sessionVersion);
    },
    [projectId],
  );

  const runCommand = useCallback(
    async (
      command: DesignWorkspaceProductionCommand,
      payload?: Record<string, unknown>,
      localFallback?: (current: DesignProductionState, actor: FounderActor) => DesignProductionState,
    ) => {
      const act = resolveActor();
      if (syncStatus === 'UNAVAILABLE' || syncStatus === 'STALE') {
        if (localFallback) {
          try {
            applyLocalState(localFallback(stateRef.current, act));
            setProductionError(null);
          } catch (err) {
            setProductionError(err instanceof Error ? err.message : String(err));
          }
          return;
        }
        setProductionError('AUTHORITY STATE UNAVAILABLE');
        return;
      }
      const previous = stateRef.current;
      const expected = versionRef.current;
      try {
        setProductionError(null);
        const result = await postDesignWorkspaceProductionCommand({
          projectId,
          command,
          expectedSessionVersion: expected,
          payload,
        });
        if (result.unavailable) {
          setSyncStatus('UNAVAILABLE');
          setProductionError('AUTHORITY STATE UNAVAILABLE');
          setState(previous);
          return;
        }
        if (result.forbidden) {
          setProductionError(`FOUNDER_ONLY:${command}`);
          return;
        }
        if (result.stale) {
          setSyncStatus('STALE');
          setProductionError('STALE_STATE — refreshing authority');
          await hydrate();
          return;
        }
        applyServerState(result.state, result.sessionVersion);
      } catch (err) {
        setState(previous);
        setProductionError(err instanceof Error ? err.message : String(err));
      }
    },
    [applyServerState, hydrate, projectId, syncStatus],
  );

  const actor = useMemo(() => resolveActor(), [state.sessionVersion, overlay]);

  const projection = useMemo(() => projectDesignProductionProjection(state), [state]);

  const actions = useMemo<TwinOpusDirectProductionActions>(
    () => ({
      setOverlay,
      openOverflowMenu: () => setOverlay('OV-OVERFLOW-MENU'),
      openReadinessReceipt: () => setOverlay('OV-READINESS-RECEIPT'),
      openContractVersions: () => setOverlay('OV-CONTRACT-VERSIONS'),
      openCreativeContext: () => setOverlay('OV-CREATIVE-CONTEXT'),
      openProvenance: () => setOverlay('OV-PROVENANCE'),
      openHostModuleNav: () => setOverlay('OV-HOST-MODULE-NAV'),
      runPairReview: () => {
        void runCommand('START_PAIR_REVIEW', undefined, (current, act) => transitionOpenPairReview(current, act));
        setOverlay('OV-PAIR-REVIEW');
      },
      openReviewAuthority: () => {
        setOverlay('OV-REVIEW-TWIN-PAGE');
      },
      openViewportAuthorityEditor: (viewport) => {
        setUiPayload({ authorityEditorViewport: viewport });
        setOverlay('OV-VIEWPORT-AUTHORITY-EDITOR');
      },
      openComposerHandoff: () => setOverlay('OV-COMPOSER-HANDOFF'),
      markTwinPageReviewed: () => {
        try {
          applyLocalState(transitionMarkTwinPageReviewed(stateRef.current, resolveActor()));
        } catch (err) {
          setProductionError(err instanceof Error ? err.message : String(err));
        }
      },
      confirmComposerHandoff: () => {
        const pageId = readDesignPageTarget(projectId)?.pageId ?? `${projectId}:overview`;
        const wf = loadPageAuthorityWorkflow(projectId, pageId);
        const { state: wfNext } = createComposerHandoffPackage(wf, {
          projectId,
          pageId,
          interactionContractVersion: stateRef.current.contractFreeze.contractVersion,
          assetManifestVersion: 'twin-opus-direct-assets-v1',
          pageContextVersion: pageId,
          tabletPolicy: stateRef.current.tabletMode === 'OVERRIDE' ? 'OVERRIDE' : 'DERIVED',
        });
        savePageAuthorityWorkflow(projectId, pageId, wfNext);
        void runCommand('LOCK_AUTHORITY_PAIR', undefined, (current, act) =>
          transitionConfirmComposerHandoff(current, act),
        );
        setOverlay(null);
      },
      runReviewAuthority: (decision) => {
        void runCommand(
          'APPROVE_AUTHORITY',
          { decision },
          (current, act) => transitionSubmitAuthorityReview(current, act, decision),
        );
        setOverlay(null);
      },
      openFullscreenArtifact: (artifact) => {
        setUiPayload({ artifact });
        setOverlay('OV-FULLSCREEN-ARTIFACT');
      },
      openInspectCandidate: (candidateId) => {
        setUiPayload({ inspectCandidateId: candidateId });
        setOverlay('OV-INSPECT-CANDIDATE');
      },
      openCompareConcepts: (leftId, rightId) => {
        setUiPayload({ compareCandidateIds: [leftId, rightId] });
        setOverlay('OV-COMPARE-CONCEPTS');
      },
      openStructuredArtifact: (columnId) => {
        setUiPayload({ structuredColumnId: columnId });
        setOverlay('OV-STRUCTURED-ARTIFACT');
      },
      openPageBatchEdit: (input) => {
        setUiPayload({ pageBatchEdit: input });
        setOverlay('OV-PAGE-BATCH-EDIT');
      },
      openPageAssetInspect: (assetId) => {
        setUiPayload({ pageAssetId: assetId });
        setOverlay('OV-PAGE-ASSET-INSPECT');
      },
      openPageInteractionsInspector: () => {
        setUiPayload({});
        setOverlay('OV-PAGE-INTERACTIONS');
      },
      openAmendmentDetail: () => setOverlay('OV-AMENDMENT-DETAIL'),
      clearUiPayload: () => setUiPayload({}),
      selectGalleryCandidate: (candidateId) => {
        void runCommand(
          'SELECT_GALLERY_CANDIDATE',
          { candidateId },
          (current) => transitionSelectGalleryCandidate(current, candidateId),
        );
      },
      selectViewportCandidate: (viewport, candidateId, candidateVersion) => {
        void runCommand(
          'SELECT_VIEWPORT_CANDIDATE',
          { viewport, candidateId, candidateVersion },
          (current, act) =>
            transitionSelectViewportCandidate(current, act, { viewport, candidateId, candidateVersion }),
        );
      },
      promoteViewportMaster: (viewport) => {
        void runCommand(
          'PROMOTE_VIEWPORT_MASTER',
          { viewport },
          (current, act) => transitionPromoteViewportMaster(current, act, viewport),
        );
      },
      runLockAuthorityPair: () => setOverlay('OV-COMPOSER-HANDOFF'),
      runMoveToBuild: () => void runCommand('MOVE_TO_BUILD'),
      requestSpendConfirm: (input) => {
        setPendingSpend(input);
        setOverlay('OV-SPEND-CONFIRM');
      },
      confirmPendingSpend: () => {
        if (!pendingSpend) return;
        const id = `spend-${Date.now()}`;
        void (async () => {
          await runCommand('RECORD_SPEND_CONFIRMATION', {
            record: {
              id,
              action: pendingSpend.action,
              estimatedUsd: pendingSpend.estimatedUsd,
              runId: null,
              actualUsd: null,
              provider: 'site00-design',
              model: 'design-concept',
            },
          });
          pendingSpend.onConfirmed(id);
        })();
        setPendingSpend(null);
        setOverlay(null);
      },
      cancelPendingSpend: () => {
        setPendingSpend(null);
        setOverlay(null);
      },
      dismissProductionError: () => setProductionError(null),
      runRefineConcept: (input) => {
        void runCommand('REFINE_CONCEPT', input);
      },
      runRegenerateConcept: (input) => {
        void runCommand('REGENERATE_CONCEPT', input);
      },
    }),
    [pendingSpend, runCommand],
  );

  return {
    state,
    overlay,
    uiPayload,
    projection,
    actor,
    actions,
    productionError,
    syncStatus,
    serverSessionVersion,
    pendingSpend,
    refresh: () => {
      void hydrate();
    },
  };
}
