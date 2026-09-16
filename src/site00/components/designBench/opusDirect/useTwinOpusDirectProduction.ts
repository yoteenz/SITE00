import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  lockAuthorityPair,
  moveToBuild,
  openPairReview,
  recordSpendConfirmation,
  submitAuthorityReview,
  type FounderActor,
} from '../../../../../shared/site00-design-workspace-production/designProductionActions.js';
import { loadDesignProductionState } from '../../../../../shared/site00-design-workspace-production/designProductionStore.js';
import { projectDesignProductionProjection } from '../../../../../shared/site00-design-workspace-production/designProductionProjection.js';
import type {
  AuthorityReviewDecision,
  DesignProductionState,
  DesignProductionUiOverlay,
} from '../../../../../shared/site00-design-workspace-production/types.js';
import { getCurrentUser, isAdminFounderAccount } from '../../../../utils/adminAuth';

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
};

export type TwinOpusDirectProduction = {
  state: DesignProductionState;
  overlay: DesignProductionUiOverlay;
  projection: ReturnType<typeof projectDesignProductionProjection>;
  actor: FounderActor;
  actions: TwinOpusDirectProductionActions;
  productionError: string | null;
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
  const [state, setState] = useState<DesignProductionState>(() => loadDesignProductionState(projectId));
  const [overlay, setOverlay] = useState<DesignProductionUiOverlay>(null);
  const [productionError, setProductionError] = useState<string | null>(null);
  const [pendingSpend, setPendingSpend] = useState<TwinOpusDirectProduction['pendingSpend']>(null);

  const refresh = useCallback(() => {
    setState(loadDesignProductionState(projectId));
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const actor = useMemo(() => resolveActor(), [state.sessionVersion, overlay]);

  const projection = useMemo(() => projectDesignProductionProjection(state), [state]);

  const runSafe = useCallback(
    (fn: () => DesignProductionState) => {
      try {
        setProductionError(null);
        const next = fn();
        setState(next);
      } catch (err) {
        setProductionError(err instanceof Error ? err.message : String(err));
      }
    },
    [],
  );

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
        runSafe(() => openPairReview(state, actor));
        setOverlay('OV-PAIR-REVIEW');
      },
      runReviewAuthority: (decision) => {
        runSafe(() => submitAuthorityReview(state, actor, decision));
        setOverlay(null);
      },
      runLockAuthorityPair: () => runSafe(() => lockAuthorityPair(state, actor)),
      runMoveToBuild: () => runSafe(() => moveToBuild(state, actor)),
      requestSpendConfirm: (input) => {
        setPendingSpend(input);
        setOverlay('OV-SPEND-CONFIRM');
      },
      confirmPendingSpend: () => {
        if (!pendingSpend) return;
        const id = `spend-${Date.now()}`;
        try {
          setProductionError(null);
          const next = recordSpendConfirmation(state, {
            id,
            action: pendingSpend.action,
            estimatedUsd: pendingSpend.estimatedUsd,
            runId: null,
            actualUsd: null,
            provider: 'site00-design',
            model: 'design-concept',
          });
          setState(next);
          pendingSpend.onConfirmed(id);
        } catch (err) {
          setProductionError(err instanceof Error ? err.message : String(err));
        }
        setPendingSpend(null);
        setOverlay(null);
      },
      cancelPendingSpend: () => {
        setPendingSpend(null);
        setOverlay(null);
      },
    }),
    [actor, pendingSpend, runSafe, state],
  );

  return {
    state,
    overlay,
    projection,
    actor,
    actions,
    productionError,
    pendingSpend,
    refresh,
  };
}
