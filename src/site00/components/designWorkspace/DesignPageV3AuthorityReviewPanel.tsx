/**
 * P0.VR.TWINV3.0R3 — SITE 00 shell + NDXBOOK project-reactive workspace authority.
 */

import { useCallback, useMemo, useState } from 'react';
import {
  approveDesignPageAuthorityViewport,
  appendDesignPageAuthorityRefineNote,
  createDesignPageAuthorityReviewSession,
  DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP,
  DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE,
  DESIGN_PAGE_V3_FOUNDER_TERRITORY_VERDICTS,
  DESIGN_PAGE_V3_HOST_PRODUCT_NAME,
  DESIGN_PAGE_V3_PILOT_PROJECT_ID,
  isDesignPageAuthorityFullyLocked,
  isDesignPageAuthorityViewportLocked,
  normalizeDesignPageAuthoritySession,
  P0_VR_TWIN_V30R3_LINEAGE,
  P0_VR_TWIN_V30_BUILD,
  readDesignPageAuthoritySession,
  requestDesignPageAuthorityGeneration,
  selectDesignPageAuthorityTerritory,
  selectDesignPageAuthorityTerritoryCandidate,
  setDesignPageAuthorityTerritoryVerdict,
  territoryDisplayName,
  territoryGalleryHasCandidates,
  writeDesignPageAuthoritySession,
  type DesignPageAuthorityReviewSession,
  type DesignPageAuthorityTerritoryScope,
  type DesignPageV3FounderTerritoryVerdict,
  type DesignPageV3TerritoryId,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import '../../styles/site00-twin-v3-design-authority.css';

type Props = {
  projectId: string;
};

const TERRITORY_ORDER: DesignPageV3TerritoryId[] = ['A', 'B', 'C'];

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

  const sessionView = useMemo(() => normalizeDesignPageAuthoritySession(session), [session]);

  const persist = useCallback((next: DesignPageAuthorityReviewSession) => {
    const normalized = normalizeDesignPageAuthoritySession(next);
    setSession(normalized);
    writeDesignPageAuthoritySession(normalized);
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
        const res = await requestDesignPageAuthorityGeneration({
          session: working,
          action: input.action === 'GENERATE' ? 'GENERATE' : input.action,
          territoryScope: input.territoryScope ?? 'ALL',
          founderConfirmedSpend: true,
        });
        persist(res.session);
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

  const approveViewport = useCallback(
    (viewport: 'mobile' | 'desktop') => {
      try {
        persist(approveDesignPageAuthorityViewport(sessionView, viewport));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Approve failed');
      }
    },
    [persist, sessionView],
  );

  if (!pilot) return null;

  const fullyLocked = isDesignPageAuthorityFullyLocked(sessionView);
  const mobileLocked = isDesignPageAuthorityViewportLocked(sessionView, 'mobile');
  const desktopLocked = isDesignPageAuthorityViewportLocked(sessionView, 'desktop');
  const hasGallery = territoryGalleryHasCandidates(sessionView.territoryGallery);
  const selectedTerritory = sessionView.founderReview.selectedTerritoryId;
  const result = sessionView.lastResult;

  return (
    <section
      className="site00-dw-v3-authority"
      aria-label="Twin V3 SITE 00 design page authority review"
      data-build-ref={P0_VR_TWIN_V30_BUILD}
    >
      <header className="site00-dw-v3-authority__head">
        <strong>
          {P0_VR_TWIN_V30R3_LINEAGE} · {DESIGN_PAGE_V3_HOST_PRODUCT_NAME} DESIGN PAGE
        </strong>
        <span>Project {projectId.toUpperCase()} · territory galleries persist on this page</span>
        {mobileLocked ? (
          <span className="site00-dw-v3-authority__lock">{DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE}</span>
        ) : null}
        {desktopLocked ? (
          <span className="site00-dw-v3-authority__lock">{DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP}</span>
        ) : null}
      </header>
      <p className="site00-dw-v3-authority__hint">
        Each territory (A Central Stage, B Editorial Workbench, C Spatial Workflow) keeps its own stack of generated
        mobile+desktop pairs. Regenerate one category to add another compare candidate — all stay visible here (not only
        in FAL history). Select a territory + candidate, then lock mobile and desktop.
      </p>
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
        <button
          type="button"
          className="site00-dw-v3-btn site00-dw-v3-btn--outline"
          disabled={!selectedTerritory || !hasGallery || mobileLocked}
          onClick={() => approveViewport('mobile')}
        >
          APPROVE MOBILE ({DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE})
        </button>
        <button
          type="button"
          className="site00-dw-v3-btn site00-dw-v3-btn--outline"
          disabled={!selectedTerritory || !hasGallery || desktopLocked}
          onClick={() => approveViewport('desktop')}
        >
          APPROVE DESKTOP ({DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP})
        </button>
      </div>
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
      {result ? (
        <>
          <p className="site00-dw-v3-authority__hint">
            Last batch #{sessionView.candidateGeneration} · R3 {result.r3SelfCheck.pass ? 'PASS' : 'FAIL'} ·{' '}
            {result.classification.replace(/DESIGN_PAGE_AUTHORITY_/, '')}
            {selectedTerritory ? ` · lock territory ${selectedTerritory}` : ' · select territory for lock'}
          </p>
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
                    {isSelectedTerritory ? 'SELECTED FOR LOCK' : 'SELECT FOR LOCK'}
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
              {!candidates.length ? (
                <p className="site00-dw-v3-authority__hint">No generations yet — run batch or “+ GENERATE THIS TERRITORY”.</p>
              ) : (
                <div className="site00-dw-v3-authority__candidate-stack">
                  {candidates.map((candidate, index) => {
                    const isActive = selectedCandidateId === candidate.candidateId;
                    const isLiveFal =
                      !candidate.mobile.representativePrototype && !candidate.mobile.storageUrl.includes('.svg');
                    return (
                      <div
                        key={candidate.candidateId}
                        className={`site00-dw-v3-authority__candidate${isActive ? ' site00-dw-v3-authority__candidate--active' : ''}`}
                      >
                        <header className="site00-dw-v3-authority__candidate-head">
                          <span>
                            Compare #{index + 1} · batch {candidate.batchGeneration}
                            {isLiveFal ? ' · FAL' : ' · prototype'}
                          </span>
                          <button
                            type="button"
                            className="site00-dw-v3-btn site00-dw-v3-btn--compact"
                            disabled={fullyLocked}
                            onClick={() => onSelectCandidate(territoryId, candidate.candidateId)}
                          >
                            {isActive ? 'VIEWING' : 'VIEW'}
                          </button>
                        </header>
                        <div className="site00-dw-v3-authority__pair">
                          <figure className="site00-dw-v3-authority__frame">
                            <figcaption>
                              Mobile · {candidate.mobile.providerJobRef.slice(0, 20)}
                              {candidate.mobile.providerJobRef.length > 20 ? '…' : ''}
                            </figcaption>
                            <img
                              src={candidate.mobile.storageUrl}
                              alt={`Territory ${territoryId} mobile candidate ${index + 1}`}
                              loading="lazy"
                            />
                          </figure>
                          <figure className="site00-dw-v3-authority__frame">
                            <figcaption>
                              Desktop · {candidate.desktop.providerJobRef.slice(0, 20)}
                              {candidate.desktop.providerJobRef.length > 20 ? '…' : ''}
                            </figcaption>
                            <img
                              src={candidate.desktop.storageUrl}
                              alt={`Territory ${territoryId} desktop candidate ${index + 1}`}
                              loading="lazy"
                            />
                          </figure>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
