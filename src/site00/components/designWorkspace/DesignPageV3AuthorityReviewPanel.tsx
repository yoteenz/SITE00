/**
 * P0.VR.TWINV3.0R5 — viewport master selection + authority pair lock (R4 grounding retained).
 */

import { useCallback, useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import {
  appendDesignPageAuthorityRefineNote,
  createDesignPageAuthorityReviewSession,
  galleryCandidateCount,
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
  lockDesignWorkspaceAuthorityPair,
  normalizeDesignPageAuthoritySession,
  P0_VR_TWIN_V30R5F1_LINEAGE,
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
  territoryGalleryHasCandidates,
  beginViewportMasterReplacement,
  unselectViewportCandidate,
  writeDesignPageAuthoritySession,
  type DesignPageAuthorityReviewSession,
  type DesignPageAuthorityTerritoryScope,
  type DesignPageV3FounderTerritoryVerdict,
  type DesignPageV3TerritoryId,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import {
  DESIGN_PAGE_AUTHORITY_R3_PROTOTYPE_URLS,
  resolveDesignPageAuthorityImageSrc,
} from './designPageAuthorityR3PrototypeUrls.js';
import { DesignPageV3AuthorityPairDock } from './DesignPageV3AuthorityPairDock.js';
import '../../styles/site00-twin-v3-design-authority.css';

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
  const fallback = resolveDesignPageAuthorityImageSrc(
    `/site00/twin-v3-design-page-authority/${hint.viewport}-territory-${hint.territoryId.toLowerCase()}-r3.svg`,
  );
  if (el.src !== fallback) el.src = fallback;
}

export function DesignPageV3AuthorityReviewPanel({ projectId }: Props) {
  const pilot = projectId.toLowerCase() === DESIGN_PAGE_V3_PILOT_PROJECT_ID;
  const [session, setSession] = useState<DesignPageAuthorityReviewSession>(() => {
    if (!pilot) return createDesignPageAuthorityReviewSession({ projectId });
    const stored = readDesignPageAuthoritySession(projectId);
    return stored ? normalizeDesignPageAuthoritySession(stored) : createDesignPageAuthorityReviewSession({ projectId });
  });
  const [refineDraft, setRefineDraft] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [persistWarning, setPersistWarning] = useState<string | null>(null);
  const [confirmKind, setConfirmKind] = useState<ConfirmKind | null>(null);
  const [fullscreenSrc, setFullscreenSrc] = useState<string | null>(null);
  const [mobileDockOpen, setMobileDockOpen] = useState(false);

  const sessionView = useMemo(() => {
    const normalized = normalizeDesignPageAuthoritySession(session);
    return rewritePrototypeGalleryUrls(normalized, DESIGN_PAGE_AUTHORITY_R3_PROTOTYPE_URLS);
  }, [session]);

  useEffect(() => {
    if (!pilot) return;
    const fromDisk = readDesignPageAuthoritySession(projectId);
    setSession((prev) => {
      let base = prev;
      if (fromDisk && galleryCandidateCount(fromDisk.territoryGallery) >= galleryCandidateCount(prev.territoryGallery)) {
        base = fromDisk;
      }
      const normalized = normalizeDesignPageAuthoritySession(base);
      const galleryJson = JSON.stringify(normalized.territoryGallery);
      const priorJson = JSON.stringify(prev.territoryGallery);
      if (territoryGalleryHasCandidates(normalized.territoryGallery)) {
        if (galleryJson !== priorJson) writeDesignPageAuthoritySession(normalized);
        return normalized;
      }
      let seeded = seedDesignPageAuthorityPrototypeGallery(normalized);
      seeded = rewritePrototypeGalleryUrls(seeded, DESIGN_PAGE_AUTHORITY_R3_PROTOTYPE_URLS);
      writeDesignPageAuthoritySession(seeded);
      return seeded;
    });
  }, [pilot, projectId]);

  const persist = useCallback((next: DesignPageAuthorityReviewSession) => {
    const normalized = normalizeDesignPageAuthoritySession(next);
    setSession(normalized);
    const ok = writeDesignPageAuthoritySession(normalized);
    setPersistWarning(
      ok ? null : 'Could not save territory gallery to this browser (storage full?). Images stay until you reload.',
    );
  }, []);

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
  const hasGallery = territoryGalleryHasCandidates(sessionView.territoryGallery);
  const galleryStats = `Gallery · batch #${sessionView.candidateGeneration} · A:${sessionView.territoryGallery.A.length} B:${sessionView.territoryGallery.B.length} C:${sessionView.territoryGallery.C.length} · ${galleryCandidateCount(sessionView.territoryGallery)} frames · build ${P0_VR_TWIN_V30_BUILD}`;
  const selectedTerritory = sessionView.founderReview.selectedTerritoryId;
  const result = sessionView.lastResult;
  const contextVersion = getProjectCreativeContextVersion(sessionView);
  const bothPromoted = Boolean(
    sessionView.authorityPipeline?.mobileMaster && sessionView.authorityPipeline?.desktopMaster,
  );

  const dock = (
    <DesignPageV3AuthorityPairDock
      session={sessionView}
      onReplaceViewport={onReplaceViewport}
      onViewViewport={onViewViewport}
      onPromoteViewport={(viewport) => setConfirmKind(viewport === 'mobile' ? 'promote-mobile' : 'promote-desktop')}
      onLockPair={() => setConfirmKind('lock-pair')}
      pairLocked={pairLocked}
    />
  );

  return (
    <section
      className="site00-dw-v3-authority"
      aria-label="Twin V3 SITE 00 design page authority review"
      data-build-ref={P0_VR_TWIN_V30_BUILD}
    >
      <header className="site00-dw-v3-authority__head">
        <strong>
          {P0_VR_TWIN_V30R5F1_LINEAGE} · {DESIGN_PAGE_V3_HOST_PRODUCT_NAME} DESIGN PAGE
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
      </header>
      <p className="site00-dw-v3-authority__hint" data-testid="v3-authority-gallery-stats">
        {galleryStats}
      </p>
      <p className="site00-dw-v3-authority__hint">
        Browse generated candidates per territory (R5F1 feature manifest required in every A/B/C concept). Select
        independent MOBILE and DESKTOP masters, promote each (feature coverage must PASS), then lock the pair — run ADD
        ADD BATCH replaces the previous batch (one active batch per territory). Run when ready for six new R5F1 FAL authorities.
      </p>
      {running ? (
        <p className="site00-dw-v3-authority__hint" role="status" data-testid="v3-authority-generating">
          Generating live frames via api.site00.com — do not switch apps (iOS may reload and drop in-flight results).
        </p>
      ) : null}
      <div className="site00-dw-v3-authority__actions">
        <button
          type="button"
          className="site00-dw-v3-btn site00-dw-v3-btn--primary"
          disabled={running || fullyLocked}
          onClick={() =>
            void run({
              action: hasGallery ? 'REGENERATE' : 'GENERATE',
              territoryScope: 'ALL',
            })
          }
        >
          {running ? 'Generating…' : hasGallery ? 'ADD BATCH (A+B+C)' : 'GENERATE TERRITORIES A/B/C'}
        </button>
      </div>

      <div className="site00-dw-v3-authority-dock--desktop">{dock}</div>

      <button
        type="button"
        className="site00-dw-v3-authority-dock-toggle"
        aria-expanded={mobileDockOpen}
        onClick={() => setMobileDockOpen((v) => !v)}
      >
        AUTHORITY PAIR · tap to {mobileDockOpen ? 'hide' : 'manage'}
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
                  <figcaption>{viewport.toUpperCase()} MASTER · {master?.sourceTerritoryId}</figcaption>
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
