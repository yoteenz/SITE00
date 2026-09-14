/**
 * P0.VR.TWINV3.0R5 — viewport master selection + authority pair lock (R4 grounding retained).
 */

import { useCallback, useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import {
  appendDesignPageAuthorityRefineNote,
  createDesignPageAuthorityReviewSession,
  galleryCandidateCount,
  forceReplaceDesignPageAuthorityWithPrototypeGallery,
  mergeDesignPageAuthorityApiResponse,
  readDesignPageAuthoritySession,
  DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP,
  DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE,
  DESIGN_PAGE_V3_FOUNDER_TERRITORY_VERDICTS,
  DESIGN_PAGE_V3_HOST_PRODUCT_NAME,
  DESIGN_PAGE_V3_PILOT_PROJECT_ID,
  getCandidateViewportState,
  getProjectCreativeContextVersion,
  isDesignPageAuthorityFullyLocked,
  isDesignPageAuthorityViewportLocked,
  isViewportCandidateSelected,
  applyFounderR5F2RecoveryIfNeeded,
  AUTHORITY_IMAGE_DISPLAY_BROKEN_ISSUE_ID,
  resolveDerivationButtonView,
  runDesignWorkspaceDerivation,
  lockDesignWorkspaceAuthorityPair,
  normalizeDesignPageAuthoritySession,
  P0_VR_TWIN_V30R5F1_LINEAGE,
  P0_VR_TWIN_V30R5F2_LINEAGE,
  DESIGN_WORKSPACE_FEATURE_MANIFEST_V1,
  masterAmendmentStatusLabel,
  P0_VR_TWIN_V30_BUILD,
  promoteViewportMaster,
  requestDesignPageAuthorityGeneration,
  resolveViewportMasterArtifact,
  seedDesignPageAuthorityPrototypeGallery,
  rewritePrototypeGalleryUrls,
  selectDesignPageAuthorityTerritory,
  selectDesignPageAuthorityTerritoryCandidate,
  selectViewportCandidate,
  setDesignPageAuthorityTerritoryVerdict,
  territoryDisplayName,
  beginViewportMasterReplacement,
  unselectViewportCandidate,
  writeDesignPageAuthoritySession,
  type DesignPageAuthorityReviewSession,
  type DesignPageAuthorityTerritoryScope,
  type DesignPageV3FounderTerritoryVerdict,
  type DesignPageV3TerritoryId,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import {
  authorityPrototypeBundledFallbackSrc,
  DESIGN_PAGE_AUTHORITY_R3_PROTOTYPE_URLS,
  resolveDesignPageAuthorityImageSrc,
} from './designPageAuthorityR3PrototypeUrls.js';
import { DesignPageV3AuthorityPairDock } from './DesignPageV3AuthorityPairDock.js';
import { DesignPageV3AuthorityRecoveryStrip } from './DesignPageV3AuthorityRecoveryStrip.js';
import { DesignPageV3DerivationReviewPanel } from './DesignPageV3DerivationReviewPanel.js';
import { DesignPageV3MobileTwinPipelinePanel } from './DesignPageV3MobileTwinPipelinePanel.js';
import { DesignPageV3MobileTwinBlueprintRetryStrip } from './DesignPageV3MobileTwinBlueprintRetryStrip.js';
import { DesignPageV3MobileTwinBuildRouteStrip } from './DesignPageV3MobileTwinBuildRouteStrip.js';
import { syncFounderMobileTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/syncFounderMobileTwinSession.js';
import { DesignPageV3MobileTwinFounderPathPanel } from './DesignPageV3MobileTwinFounderPathPanel.js';
import { DesignPageV3MobileTwinCapabilityTestPanel } from './DesignPageV3MobileTwinCapabilityTestPanel.js';
import { DesignPageV3MobileTwinProviderBenchmarkPanel } from './DesignPageV3MobileTwinProviderBenchmarkPanel.js';
import { DesignPageV3MobileTwinFocusedHybridPanel } from './DesignPageV3MobileTwinFocusedHybridPanel.js';
import { DesignPageV3MobileTwinLockedProviderPanel } from './DesignPageV3MobileTwinLockedProviderPanel.js';
import { DesignPageV3SectionErrorBoundary } from './DesignPageV3SectionErrorBoundary.js';
import '../../styles/site00-twin-v3-design-authority.css';

function syncPilotSessionSafe(session: DesignPageAuthorityReviewSession, projectId: string): DesignPageAuthorityReviewSession {
  try {
    return syncFounderMobileTwinSession(session, projectId);
  } catch (err) {
    console.error('site00: mobile twin session sync failed', err);
    return session;
  }
}

type Props = {
  projectId: string;
};

type ConfirmKind =
  | 'promote-mobile'
  | 'promote-desktop'
  | 'lock-pair'
  | 'replace-promoted-mobile'
  | 'replace-promoted-desktop';

const TERRITORY_ORDER: DesignPageV3TerritoryId[] = ['A', 'B', 'C'];

function viewportStateLabel(state: string): string {
  return state.replace(/_/g, ' ');
}

function onAuthorityImageError(
  ev: SyntheticEvent<HTMLImageElement>,
  hint: { territoryId: DesignPageV3TerritoryId; viewport: 'mobile' | 'desktop' },
) {
  const el = ev.currentTarget;
  const fallback = authorityPrototypeBundledFallbackSrc(hint);
  if (el.src !== fallback) el.src = fallback;
}

export function DesignPageV3AuthorityReviewPanel({ projectId }: Props) {
  const pilot = projectId.toLowerCase() === DESIGN_PAGE_V3_PILOT_PROJECT_ID;
  const [session, setSession] = useState<DesignPageAuthorityReviewSession>(() => {
    if (!pilot) return createDesignPageAuthorityReviewSession({ projectId });
    const stored = readDesignPageAuthoritySession(projectId);
    if (stored) {
      const normalized = normalizeDesignPageAuthoritySession(stored);
      return pilot ? syncPilotSessionSafe(normalized, projectId) : normalized;
    }
    const seeded = seedDesignPageAuthorityPrototypeGallery(
      createDesignPageAuthorityReviewSession({ projectId }),
    );
    writeDesignPageAuthoritySession(seeded);
    const normalized = normalizeDesignPageAuthoritySession(seeded);
    return pilot ? syncPilotSessionSafe(normalized, projectId) : normalized;
  });
  const [refineDraft, setRefineDraft] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [persistWarning, setPersistWarning] = useState<string | null>(null);
  const [confirmKind, setConfirmKind] = useState<ConfirmKind | null>(null);
  const [fullscreenSrc, setFullscreenSrc] = useState<string | null>(null);
  const [mobileDockOpen, setMobileDockOpen] = useState(false);
  const [derivationGenerating, setDerivationGenerating] = useState(false);
  const promotionPersistAttempted = useRef(false);

  useEffect(() => {
    if (!pilot) return;
    const receiptOk = session.authorityPipeline?.founderAuthorityInjectionReceipt?.status === 'PASS';
    const locked = session.authorityPipeline?.authorityPair?.status === 'PAIR_LOCKED';
    if (receiptOk && locked) {
      setMobileDockOpen(true);
    }
  }, [pilot, session.authorityPipeline?.founderAuthorityInjectionReceipt?.status, session.authorityPipeline?.authorityPair?.status]);

  const sessionView = useMemo(() => {
    const normalized = normalizeDesignPageAuthoritySession(session);
    const rewritten = rewritePrototypeGalleryUrls(normalized, DESIGN_PAGE_AUTHORITY_R3_PROTOTYPE_URLS);
    return pilot ? syncPilotSessionSafe(rewritten, projectId) : rewritten;
  }, [session, pilot, projectId]);

  useEffect(() => {
    if (!pilot) return;
    let loaded = readDesignPageAuthoritySession(projectId);
    if (!loaded) {
      loaded = seedDesignPageAuthorityPrototypeGallery(createDesignPageAuthorityReviewSession({ projectId }));
    }
    loaded = applyFounderR5F2RecoveryIfNeeded(normalizeDesignPageAuthoritySession(loaded));
    const synced = syncPilotSessionSafe(loaded, projectId);
    writeDesignPageAuthoritySession(synced);
    setSession(synced);
    promotionPersistAttempted.current = true;
  }, [pilot, projectId]);

  const persist = useCallback((next: DesignPageAuthorityReviewSession) => {
    const normalized = normalizeDesignPageAuthoritySession(next);
    setSession(normalized);
    const ok = writeDesignPageAuthoritySession(normalized);
    setPersistWarning(
      ok ? null : 'Could not save territory gallery to this browser (storage full?). Images stay until you reload.',
    );
  }, []);

  useEffect(() => {
    if (!pilot || promotionPersistAttempted.current) return;
    const viewLocked = sessionView.mobileTwinPipeline?.mobileTwinProviderLock?.locked;
    const storedLocked = session.mobileTwinPipeline?.mobileTwinProviderLock?.locked;
    if (!viewLocked || storedLocked) return;
    promotionPersistAttempted.current = true;
    persist(sessionView);
  }, [pilot, sessionView, session.mobileTwinPipeline?.mobileTwinProviderLock?.locked, persist]);

  const run = useCallback(
    async (input: {
      action: 'GENERATE' | 'REFINE' | 'REGENERATE' | 'REGENERATE_TERRITORY';
      territoryScope?: DesignPageAuthorityTerritoryScope;
    }) => {
      setRunning(true);
      setError(null);
      try {
        let working = sessionView;
        if (input.action === 'REFINE' && refineDraft.trim()) {
          working = appendDesignPageAuthorityRefineNote(working, refineDraft);
          setRefineDraft('');
          persist(working);
        }
        const apiAction = input.action === 'GENERATE' ? 'GENERATE' : input.action;
        const res = await requestDesignPageAuthorityGeneration({
          session: working,
          action: apiAction,
          territoryScope: input.territoryScope ?? 'ALL',
          founderConfirmedSpend: true,
        });
        let merged = mergeDesignPageAuthorityApiResponse(working, { result: res.result, session: res.session }, apiAction);
        merged = rewritePrototypeGalleryUrls(merged, DESIGN_PAGE_AUTHORITY_R3_PROTOTYPE_URLS);
        persist(merged);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Generation failed');
      } finally {
        setRunning(false);
      }
    },
    [persist, refineDraft, sessionView],
  );

  const onSelectTerritory = useCallback(
    (territoryId: DesignPageV3TerritoryId) => {
      persist(selectDesignPageAuthorityTerritory(sessionView, territoryId));
    },
    [persist, sessionView],
  );

  const onSelectCandidate = useCallback(
    (territoryId: DesignPageV3TerritoryId, candidateId: string) => {
      persist(selectDesignPageAuthorityTerritoryCandidate(sessionView, territoryId, candidateId));
    },
    [persist, sessionView],
  );

  const onTerritoryVerdict = useCallback(
    (territoryId: DesignPageV3TerritoryId, verdict: DesignPageV3FounderTerritoryVerdict) => {
      persist(setDesignPageAuthorityTerritoryVerdict(sessionView, territoryId, verdict));
    },
    [persist, sessionView],
  );

  const onSelectForViewport = useCallback(
    (viewport: 'mobile' | 'desktop', territoryId: DesignPageV3TerritoryId, candidateId: string) => {
      try {
        persist(
          selectViewportCandidate(sessionView, viewport, {
            territoryId,
            candidateId,
          }),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Select failed');
      }
    },
    [persist, sessionView],
  );

  const executePromote = useCallback(
    (viewport: 'mobile' | 'desktop') => {
      try {
        persist(promoteViewportMaster(sessionView, viewport));
        setConfirmKind(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Promotion failed');
      }
    },
    [persist, sessionView],
  );

  const executeLockPair = useCallback(() => {
    try {
      persist(lockDesignWorkspaceAuthorityPair(sessionView));
      setConfirmKind(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Pair lock failed');
    }
  }, [persist, sessionView]);

  const onGenerateDerivatives = useCallback(() => {
    const view = resolveDerivationButtonView(sessionView);
    if (view.state === 'REVIEW_DERIVATIVES') {
      setMobileDockOpen(true);
      setPersistWarning(null);
      setError(null);
      requestAnimationFrame(() => {
        document.querySelector('[data-testid="v3-derivation-review-panel"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }
    setDerivationGenerating(true);
    setError(null);
    setPersistWarning(null);
    void runDesignWorkspaceDerivation(sessionView)
      .then(({ session: derived, reusedExisting }) => {
        persist(derived);
        setPersistWarning(
          reusedExisting ?
            'Existing derivation package reused (same frozen authority inputs).'
          : 'Derivation complete — scroll to TRANSLATION REVIEW below.',
        );
        requestAnimationFrame(() => {
          document.querySelector('[data-testid="v3-derivation-review-panel"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      })
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : 'Derivation blocked';
        setError(message);
        requestAnimationFrame(() => {
          document.querySelector('[data-testid="v3-derivation-feedback"]')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      })
      .finally(() => {
        setDerivationGenerating(false);
      });
  }, [persist, sessionView]);

  const onReplaceViewport = useCallback(
    (viewport: 'mobile' | 'desktop') => {
      const master =
        viewport === 'mobile' ?
          sessionView.authorityPipeline?.mobileMaster
        : sessionView.authorityPipeline?.desktopMaster;
      if (master) {
        setConfirmKind(viewport === 'mobile' ? 'replace-promoted-mobile' : 'replace-promoted-desktop');
        return;
      }
      try {
        persist(unselectViewportCandidate(sessionView, viewport));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Replace failed');
      }
    },
    [persist, sessionView],
  );

  const onViewViewport = useCallback(
    (viewport: 'mobile' | 'desktop') => {
      const art = resolveViewportMasterArtifact(sessionView, viewport);
      const sel = sessionView.authorityPipeline?.viewportSelection[viewport];
      if (art) {
        setFullscreenSrc(resolveDesignPageAuthorityImageSrc(art.storageUrl));
        return;
      }
      if (sel) {
        const row = sessionView.territoryGallery[sel.territoryId].find((c) => c.candidateId === sel.candidateId);
        const frame = row ? (viewport === 'mobile' ? row.mobile : row.desktop) : null;
        if (frame) setFullscreenSrc(resolveDesignPageAuthorityImageSrc(frame.storageUrl));
      }
    },
    [sessionView],
  );

  if (!pilot) return null;

  const pairLocked = sessionView.authorityPipeline?.authorityPair?.status === 'PAIR_LOCKED';
  const fullyLocked = isDesignPageAuthorityFullyLocked(sessionView) || pairLocked;
  const mobileLocked = isDesignPageAuthorityViewportLocked(sessionView, 'mobile');
  const desktopLocked = isDesignPageAuthorityViewportLocked(sessionView, 'desktop');
  const galleryStats = `Batch 1 legacy · batch #${sessionView.candidateGeneration} · A:${sessionView.territoryGallery.A.length} B:${sessionView.territoryGallery.B.length} C:${sessionView.territoryGallery.C.length} · ${galleryCandidateCount(sessionView.territoryGallery)} frames · build ${P0_VR_TWIN_V30_BUILD}`;
  const selectedTerritory = sessionView.founderReview.selectedTerritoryId;
  const result = sessionView.lastResult;
  const contextVersion = getProjectCreativeContextVersion(sessionView);
  const bothPromoted = Boolean(
    sessionView.authorityPipeline?.mobileMaster && sessionView.authorityPipeline?.desktopMaster,
  );

  const founderRecoveryApplied = Boolean(sessionView.authorityPipeline?.founderAuthorityInjectionReceipt?.status === 'PASS');
  const derivationReady = sessionView.authorityPipeline?.authorityPair?.derivationStatus === 'READY';
  const mobileProviderLocked = Boolean(sessionView.mobileTwinPipeline?.mobileTwinProviderLock?.locked);

  const dock = (
    <DesignPageV3AuthorityPairDock
      session={sessionView}
      onReplaceViewport={onReplaceViewport}
      onViewViewport={onViewViewport}
      onPromoteViewport={(viewport) => setConfirmKind(viewport === 'mobile' ? 'promote-mobile' : 'promote-desktop')}
      onLockPair={() => setConfirmKind('lock-pair')}
      onGenerateDerivatives={onGenerateDerivatives}
      pairLocked={pairLocked}
      generating={derivationGenerating}
    />
  );

  return (
    <section
      className="site00-dw-v3-authority"
      aria-label="Twin V3 SITE 00 design page authority batch 1 legacy review"
      data-batch-module="1"
      data-build-ref={P0_VR_TWIN_V30_BUILD}
    >
      <header className="site00-dw-v3-authority__head">
        <strong>
          BATCH 1 · LEGACY · {P0_VR_TWIN_V30R5F1_LINEAGE} · {DESIGN_PAGE_V3_HOST_PRODUCT_NAME} DESIGN PAGE
        </strong>
        <span>
          Project {projectId.toUpperCase()} · context {contextVersion} · features {DESIGN_WORKSPACE_FEATURE_MANIFEST_V1}
        </span>
        <span className="site00-dw-v3-authority__hint" data-testid="v3-master-amendment-status">
          {masterAmendmentStatusLabel(sessionView.authorityPipeline?.mobileMaster)} ·{' '}
          {masterAmendmentStatusLabel(sessionView.authorityPipeline?.desktopMaster)}
        </span>
        {mobileLocked ? (
          <span className="site00-dw-v3-authority__lock">{DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE}</span>
        ) : null}
        {desktopLocked ? (
          <span className="site00-dw-v3-authority__lock">{DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP}</span>
        ) : null}
        {pairLocked ? <span className="site00-dw-v3-authority__lock">TRANSLATION MODE</span> : null}
        {founderRecoveryApplied ?
          <span className="site00-dw-v3-authority__lock" data-testid="v3-r5f2-recovery-banner">
            {P0_VR_TWIN_V30R5F2_LINEAGE} · PAIR LOCKED · DERIVATION {derivationReady ? 'READY' : 'BLOCKED'}
          </span>
        : null}
      </header>
      {sessionView.authorityPipeline?.authorityImageDisplayIssue?.status === 'OPEN' ?
        <p className="site00-dw-v3-authority__hint" data-testid="v3-broken-image-issue">
          Tracked issue {AUTHORITY_IMAGE_DISPLAY_BROKEN_ISSUE_ID} remains OPEN — gallery display fix is separate from
          founder authority injection.
        </p>
      : null}

      <DesignPageV3AuthorityRecoveryStrip
        session={sessionView}
        onGenerateDerivatives={onGenerateDerivatives}
        generating={derivationGenerating}
        feedbackMessage={derivationGenerating ? null : (error ?? persistWarning)}
        feedbackKind={error ? 'error' : persistWarning ? 'success' : null}
      />

      <DesignPageV3MobileTwinBlueprintRetryStrip session={sessionView} onSessionUpdate={persist} />

      <DesignPageV3MobileTwinBuildRouteStrip session={sessionView} />

      <div data-testid="v3-derivation-feedback">
        {error ?
          <p className="site00-dw-v3-authority__error" role="alert" data-testid="v3-derivation-error-banner">
            {error}
          </p>
        : null}
        {!error && persistWarning ?
          <p className="site00-dw-v3-authority__hint" role="status" data-testid="v3-derivation-success-banner">
            {persistWarning}
          </p>
        : null}
      </div>

      <DesignPageV3SectionErrorBoundary label="Mobile twin review">
        <DesignPageV3MobileTwinFounderPathPanel session={sessionView} projectId={projectId} onSessionUpdate={persist} />
        <DesignPageV3MobileTwinCapabilityTestPanel session={sessionView} onSessionUpdate={persist} />
      <DesignPageV3MobileTwinLockedProviderPanel session={sessionView} onSessionUpdate={persist} />
        {mobileProviderLocked ?
          <details className="site00-dw-v3-mobile-twin-benchmark-history" data-testid="v3-benchmark-history-details">
            <summary>History · provider benchmarks (routing superseded)</summary>
            <DesignPageV3MobileTwinProviderBenchmarkPanel session={sessionView} onSessionUpdate={persist} />
            <DesignPageV3MobileTwinFocusedHybridPanel session={sessionView} onSessionUpdate={persist} />
          </details>
        : <>
            <DesignPageV3MobileTwinProviderBenchmarkPanel session={sessionView} onSessionUpdate={persist} />
            <DesignPageV3MobileTwinFocusedHybridPanel session={sessionView} onSessionUpdate={persist} />
          </>
        }
        <DesignPageV3MobileTwinPipelinePanel session={sessionView} onSessionUpdate={persist} />
      </DesignPageV3SectionErrorBoundary>
      <DesignPageV3DerivationReviewPanel session={sessionView} onSessionUpdate={persist} />

      <p className="site00-dw-v3-authority__hint" data-testid="v3-authority-gallery-stats">
        {galleryStats}
      </p>
      <p className="site00-dw-v3-authority__hint">
        Legacy batch-1 storage (masters / pair lock). New FAL runs live in the <strong>BATCH 2</strong> panel above —
        separate localStorage key, not merged with batch 1. Use RESET WORKING PROTOTYPES here only to fix broken batch-1
        prototypes.
      </p>
      {running ? (
        <p className="site00-dw-v3-authority__hint" role="status" data-testid="v3-authority-generating">
          Generating live frames via api.site00.com — do not switch apps (iOS may reload and drop in-flight results).
        </p>
      ) : null}
      <div className="site00-dw-v3-authority__actions">
        <button
          type="button"
          className="site00-dw-v3-btn site00-dw-v3-btn--compact"
          disabled
          title="Use BATCH 2 panel above for FAL generation"
        >
          FAL moved to BATCH 2 panel ↑
        </button>
        <button
          type="button"
          className="site00-dw-v3-btn site00-dw-v3-btn--compact"
          disabled={running || fullyLocked}
          onClick={() => persist(forceReplaceDesignPageAuthorityWithPrototypeGallery(sessionView))}
        >
          RESET WORKING PROTOTYPES
        </button>
      </div>

      <div className="site00-dw-v3-authority-dock--desktop">{dock}</div>

      <button
        type="button"
        className="site00-dw-v3-authority-dock-toggle"
        aria-expanded={mobileDockOpen}
        onClick={() => setMobileDockOpen((v) => !v)}
      >
        {pairLocked ?
          `AUTHORITY PAIR · LOCKED · tap to ${mobileDockOpen ? 'hide' : 'show'} dock`
        : `AUTHORITY PAIR · tap to ${mobileDockOpen ? 'hide' : 'manage'}`}
      </button>
      {mobileDockOpen ? <div className="site00-dw-v3-authority-dock--mobile">{dock}</div> : null}

      {bothPromoted ?
        <section className="site00-dw-v3-authority-pair-review" aria-label="Authority pair review">
          <header>
            <strong>PAIR REVIEW</strong>
            <span>Checksum {sessionView.authorityPipeline?.authorityPair?.pairChecksum?.slice(0, 12) ?? '—'}…</span>
          </header>
          <div className="site00-dw-v3-authority-pair-review__grid">
            {(['mobile', 'desktop'] as const).map((viewport) => {
              const art = resolveViewportMasterArtifact(sessionView, viewport);
              const master =
                viewport === 'mobile' ?
                  sessionView.authorityPipeline?.mobileMaster
                : sessionView.authorityPipeline?.desktopMaster;
              return (
                <figure key={viewport} className="site00-dw-v3-authority-pair-review__figure">
                  <figcaption>
                    {viewport.toUpperCase()} MASTER ·{' '}
                    {master?.founderApproved ? 'FOUNDER APPROVED' : master?.sourceTerritoryId}
                  </figcaption>
                  {art ?
                    <img
                      src={resolveDesignPageAuthorityImageSrc(art.storageUrl)}
                      alt={`${viewport} authority master`}
                      onClick={() => onViewViewport(viewport)}
                    />
                  : null}
                  <div className="site00-dw-v3-authority__frame-actions">
                    <button
                      type="button"
                      className="site00-dw-v3-btn site00-dw-v3-btn--compact"
                      onClick={() => onViewViewport(viewport)}
                    >
                      VIEW FULLSCREEN
                    </button>
                    {!pairLocked ?
                      <button
                        type="button"
                        className="site00-dw-v3-btn site00-dw-v3-btn--compact"
                        onClick={() => onReplaceViewport(viewport)}
                      >
                        REPLACE
                      </button>
                    : null}
                  </div>
                </figure>
              );
            })}
          </div>
          {!pairLocked ?
            <button
              type="button"
              className="site00-dw-v3-btn site00-dw-v3-btn--primary site00-dw-v3-btn--lock"
              onClick={() => setConfirmKind('lock-pair')}
            >
              LOCK MOBILE + DESKTOP AUTHORITY PAIR
            </button>
          : null}
        </section>
      : null}

      <div className="site00-dw-v3-authority__refine">
        <label htmlFor="v3-authority-refine">Refine notes (host / project firewall preserved)</label>
        <textarea
          id="v3-authority-refine"
          value={refineDraft}
          disabled={fullyLocked}
          onChange={(e) => setRefineDraft(e.target.value)}
          placeholder="e.g. stronger NDXBOOK lime in workspace; keep SITE 00 red on host only; less card grid"
        />
        <button
          type="button"
          className="site00-dw-v3-btn site00-dw-v3-btn--compact"
          disabled={running || fullyLocked || !refineDraft.trim()}
          onClick={() => void run({ action: 'REFINE', territoryScope: 'ALL' })}
        >
          REFINE + REGENERATE ALL
        </button>
      </div>
      {error ? (
        <p className="site00-dw-v3-authority__error" role="alert">
          {error}
        </p>
      ) : null}
      {persistWarning ? (
        <p className="site00-dw-v3-authority__error" role="status">
          {persistWarning}
        </p>
      ) : null}
      {result ? (
        <>
          <p className="site00-dw-v3-authority__hint">
            Last batch #{sessionView.candidateGeneration} · R3 {result.r3SelfCheck.pass ? 'PASS' : 'FAIL'} · R4{' '}
            {result.r4SelfCheck?.pass ? 'PASS' : 'FAIL'} ·{' '}
            {result.classification.replace(/DESIGN_PAGE_AUTHORITY_/, '')}
            {selectedTerritory ? ` · focus territory ${selectedTerritory}` : ''}
          </p>
          {result.projectGroundingQa ? (
            <p className="site00-dw-v3-authority__hint" data-testid="v3-project-grounding-qa">
              Project grounding: {result.projectGroundingQa.projectGrounding} · Artifact vocabulary:{' '}
              {result.projectGroundingQa.artifactVocabulary} · Random asset risk:{' '}
              {result.projectGroundingQa.randomAssetRisk} · Territory consistency:{' '}
              {result.projectGroundingQa.territoryContentConsistency} · Host firewall:{' '}
              {result.projectGroundingQa.hostProjectFirewall} · context {result.projectCreativeContextVersion} ·
              ungrounded assets {result.ungroundedAssetCount ?? 0}
            </p>
          ) : null}
          {result.falProviderTrace?.length ? (
            <p className="site00-dw-v3-authority__hint" data-testid="v3-fal-trace">
              FAL:{' '}
              {result.falProviderTrace
                .filter((l) => l.includes('FAL_PARALLEL') || l.includes('ENQUEUED'))
                .slice(0, 4)
                .join(' · ')}
            </p>
          ) : null}
        </>
      ) : null}
      <div className="site00-dw-v3-authority__territories">
        {TERRITORY_ORDER.map((territoryId) => {
          const candidates = sessionView.territoryGallery[territoryId];
          const isSelectedTerritory = sessionView.founderReview.selectedTerritoryId === territoryId;
          const verdict = sessionView.founderReview.territoryVerdicts[territoryId];
          const selectedCandidateId = sessionView.selectedCandidateByTerritory[territoryId];
          return (
            <article
              key={territoryId}
              className={`site00-dw-v3-authority__territory${isSelectedTerritory ? ' site00-dw-v3-authority__territory--selected' : ''}`}
            >
              <header className="site00-dw-v3-authority__territory-head">
                <strong>
                  Territory {territoryId} · {territoryDisplayName(territoryId)} · {candidates.length} candidate
                  {candidates.length === 1 ? '' : 's'}
                </strong>
                <div className="site00-dw-v3-authority__territory-actions">
                  <button
                    type="button"
                    className="site00-dw-v3-btn site00-dw-v3-btn--compact"
                    disabled={running || fullyLocked}
                    onClick={() => void run({ action: 'REGENERATE_TERRITORY', territoryScope: territoryId })}
                  >
                    + GENERATE THIS TERRITORY
                  </button>
                  <button
                    type="button"
                    className="site00-dw-v3-btn site00-dw-v3-btn--compact"
                    disabled={fullyLocked || !candidates.length}
                    onClick={() => onSelectTerritory(territoryId)}
                  >
                    {isSelectedTerritory ? 'FOCUS TERRITORY' : 'COMPARE TERRITORY'}
                  </button>
                </div>
              </header>
              <div className="site00-dw-v3-authority__verdicts" role="group" aria-label={`Verdict territory ${territoryId}`}>
                {DESIGN_PAGE_V3_FOUNDER_TERRITORY_VERDICTS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`site00-dw-v3-btn site00-dw-v3-btn--verdict${verdict === v ? ' site00-dw-v3-btn--verdict-on' : ''}`}
                    disabled={fullyLocked}
                    onClick={() => onTerritoryVerdict(territoryId, v)}
                  >
                    {v.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
              {!candidates.length ?
                <p className="site00-dw-v3-authority__hint">No generations yet — run batch or “+ GENERATE THIS TERRITORY”.</p>
              : <div className="site00-dw-v3-authority__candidate-stack">
                  {candidates.map((candidate, index) => {
                    const isActive = selectedCandidateId === candidate.candidateId;
                    const mobileSelected = isViewportCandidateSelected(sessionView, 'mobile', {
                      territoryId,
                      candidateId: candidate.candidateId,
                    });
                    const desktopSelected = isViewportCandidateSelected(sessionView, 'desktop', {
                      territoryId,
                      candidateId: candidate.candidateId,
                    });
                    const mobileState = getCandidateViewportState(sessionView, candidate.candidateId, 'mobile');
                    const desktopState = getCandidateViewportState(sessionView, candidate.candidateId, 'desktop');
                    const isLiveFal =
                      !candidate.mobile.representativePrototype && !candidate.mobile.storageUrl.includes('.svg');
                    return (
                      <div
                        key={candidate.candidateId}
                        className={`site00-dw-v3-authority__candidate${isActive ? ' site00-dw-v3-authority__candidate--active' : ''}`}
                      >
                        <header className="site00-dw-v3-authority__candidate-head">
                          <span>
                            {candidate.candidateId.slice(-10)} · batch {candidate.batchGeneration}
                            {isLiveFal ? ' · FAL' : ' · prototype'} · gen #{index + 1}
                          </span>
                          <button
                            type="button"
                            className="site00-dw-v3-btn site00-dw-v3-btn--compact"
                            disabled={fullyLocked}
                            onClick={() => onSelectCandidate(territoryId, candidate.candidateId)}
                          >
                            {isActive ? 'COMPARE OPEN' : 'COMPARE'}
                          </button>
                        </header>
                        <div className="site00-dw-v3-authority__pair">
                          <figure
                            className={`site00-dw-v3-authority__frame${mobileSelected ? ' site00-dw-v3-authority__frame--viewport-selected' : ''}${mobileState === 'PROMOTED' ? ' site00-dw-v3-authority__frame--viewport-promoted' : ''}`}
                          >
                            <figcaption>
                              MOBILE · {viewportStateLabel(mobileState)}
                            </figcaption>
                            <img
                              src={resolveDesignPageAuthorityImageSrc(candidate.mobile.storageUrl, {
                                territoryId,
                                viewport: 'mobile',
                              })}
                              alt={`Territory ${territoryId} mobile candidate ${index + 1}`}
                              loading="lazy"
                              onError={(ev) => onAuthorityImageError(ev, { territoryId, viewport: 'mobile' })}
                            />
                            <div className="site00-dw-v3-authority__frame-actions">
                              <button
                                type="button"
                                className="site00-dw-v3-btn site00-dw-v3-btn--compact site00-dw-v3-btn--primary"
                                disabled={fullyLocked || mobileState === 'PROMOTED'}
                                onClick={() => onSelectForViewport('mobile', territoryId, candidate.candidateId)}
                              >
                                {mobileSelected ? 'SELECTED FOR MOBILE' : 'SELECT FOR MOBILE'}
                              </button>
                            </div>
                          </figure>
                          <figure
                            className={`site00-dw-v3-authority__frame${desktopSelected ? ' site00-dw-v3-authority__frame--viewport-selected' : ''}${desktopState === 'PROMOTED' ? ' site00-dw-v3-authority__frame--viewport-promoted' : ''}`}
                          >
                            <figcaption>
                              DESKTOP · {viewportStateLabel(desktopState)}
                            </figcaption>
                            <img
                              src={resolveDesignPageAuthorityImageSrc(candidate.desktop.storageUrl, {
                                territoryId,
                                viewport: 'desktop',
                              })}
                              alt={`Territory ${territoryId} desktop candidate ${index + 1}`}
                              loading="lazy"
                              onError={(ev) => onAuthorityImageError(ev, { territoryId, viewport: 'desktop' })}
                            />
                            <div className="site00-dw-v3-authority__frame-actions">
                              <button
                                type="button"
                                className="site00-dw-v3-btn site00-dw-v3-btn--compact site00-dw-v3-btn--primary"
                                disabled={fullyLocked || desktopState === 'PROMOTED'}
                                onClick={() => onSelectForViewport('desktop', territoryId, candidate.candidateId)}
                              >
                                {desktopSelected ? 'SELECTED FOR DESKTOP' : 'SELECT FOR DESKTOP'}
                              </button>
                            </div>
                          </figure>
                        </div>
                      </div>
                    );
                  })}
                </div>
              }
            </article>
          );
        })}
      </div>

      {confirmKind ?
        <div className="site00-dw-v3-authority-modal" role="dialog" aria-modal="true">
          <div className="site00-dw-v3-authority-modal__panel">
            {confirmKind === 'promote-mobile' || confirmKind === 'promote-desktop' ?
              <>
                <p>
                  YOU ARE PROMOTING THIS GENERATED CONCEPT AS THE{' '}
                  {confirmKind === 'promote-mobile' ? 'MOBILE' : 'DESKTOP'} DESIGN WORKSPACE MASTER.
                </p>
                <p className="site00-dw-v3-authority__hint">
                  This freezes its visual composition for downstream blueprint and package derivation. Literal placeholder
                  project content inside the mockup is not automatically frozen as live content.
                </p>
                <div className="site00-dw-v3-authority-modal__actions">
                  <button type="button" className="site00-dw-v3-btn" onClick={() => setConfirmKind(null)}>
                    CANCEL
                  </button>
                  <button
                    type="button"
                    className="site00-dw-v3-btn site00-dw-v3-btn--primary"
                    onClick={() => executePromote(confirmKind === 'promote-mobile' ? 'mobile' : 'desktop')}
                  >
                    PROMOTE {confirmKind === 'promote-mobile' ? 'MOBILE' : 'DESKTOP'} MASTER
                  </button>
                </div>
              </>
            : null}
            {confirmKind === 'lock-pair' ?
              <>
                <p>LOCK DESIGN WORKSPACE AUTHORITY PAIR</p>
                <p className="site00-dw-v3-authority__hint">
                  Mobile and Desktop will become the frozen visual authorities for downstream blueprint, asset, function,
                  implementation, and fidelity work. Downstream AI must translate these authorities — it may not reinterpret
                  the workspace. Literal placeholder project content remains data-bound.
                </p>
                <div className="site00-dw-v3-authority-modal__actions">
                  <button type="button" className="site00-dw-v3-btn" onClick={() => setConfirmKind(null)}>
                    CANCEL
                  </button>
                  <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={executeLockPair}>
                    LOCK AUTHORITY PAIR
                  </button>
                </div>
              </>
            : null}
            {confirmKind === 'replace-promoted-mobile' || confirmKind === 'replace-promoted-desktop' ?
              <>
                <p>Replace an already promoted viewport master?</p>
                <p className="site00-dw-v3-authority__hint">
                  Downstream lineage from the prior master may become stale. Select a new candidate and promote again.
                </p>
                <div className="site00-dw-v3-authority-modal__actions">
                  <button type="button" className="site00-dw-v3-btn" onClick={() => setConfirmKind(null)}>
                    CANCEL
                  </button>
                  <button
                    type="button"
                    className="site00-dw-v3-btn site00-dw-v3-btn--primary"
                    onClick={() => {
                      const vp = confirmKind === 'replace-promoted-mobile' ? 'mobile' : 'desktop';
                      setConfirmKind(null);
                      try {
                        persist(beginViewportMasterReplacement(sessionView, vp));
                      } catch (e) {
                        setError(e instanceof Error ? e.message : 'Replace failed');
                      }
                    }}
                  >
                    CLEAR &amp; REPLACE
                  </button>
                </div>
              </>
            : null}
          </div>
        </div>
      : null}

      {fullscreenSrc ?
        <div
          className="site00-dw-v3-authority-modal site00-dw-v3-authority-modal--fullscreen"
          role="dialog"
          onClick={() => setFullscreenSrc(null)}
        >
          <img src={fullscreenSrc} alt="Authority fullscreen preview" />
        </div>
      : null}
    </section>
  );
}
