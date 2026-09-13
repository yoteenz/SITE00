/**
 * P0.VR.TWINV3.0R3 — SITE 00 shell + NDXBOOK project-reactive workspace authority.
 */

import { useCallback, useState } from 'react';
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
  P0_VR_TWIN_V30R3_LINEAGE,
  P0_VR_TWIN_V30_BUILD,
  readDesignPageAuthoritySession,
  requestDesignPageAuthorityGeneration,
  selectDesignPageAuthorityTerritory,
  setDesignPageAuthorityTerritoryVerdict,
  writeDesignPageAuthoritySession,
  type DesignPageAuthorityReviewSession,
  type DesignPageV3FounderTerritoryVerdict,
  type DesignPageV3TerritoryId,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import '../../styles/site00-twin-v3-design-authority.css';

type Props = {
  projectId: string;
};

export function DesignPageV3AuthorityReviewPanel({ projectId }: Props) {
  const pilot = projectId.toLowerCase() === DESIGN_PAGE_V3_PILOT_PROJECT_ID;
  const [session, setSession] = useState<DesignPageAuthorityReviewSession>(() => {
    if (!pilot) return createDesignPageAuthorityReviewSession({ projectId });
    return readDesignPageAuthoritySession(projectId) ?? createDesignPageAuthorityReviewSession({ projectId });
  });
  const [refineDraft, setRefineDraft] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback((next: DesignPageAuthorityReviewSession) => {
    setSession(next);
    writeDesignPageAuthoritySession(next);
  }, []);

  const run = useCallback(
    async (action: 'GENERATE' | 'REFINE' | 'REGENERATE') => {
      setRunning(true);
      setError(null);
      try {
        let working = session;
        if (action === 'REFINE' && refineDraft.trim()) {
          working = appendDesignPageAuthorityRefineNote(working, refineDraft);
          setRefineDraft('');
          persist(working);
        }
        const res = await requestDesignPageAuthorityGeneration({
          session: working,
          action: action === 'GENERATE' ? 'GENERATE' : action,
          founderConfirmedSpend: true,
        });
        persist(res.session);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Generation failed');
      } finally {
        setRunning(false);
      }
    },
    [persist, refineDraft, session],
  );

  const onSelectTerritory = useCallback(
    (territoryId: DesignPageV3TerritoryId) => {
      persist(selectDesignPageAuthorityTerritory(session, territoryId));
    },
    [persist, session],
  );

  const onTerritoryVerdict = useCallback(
    (territoryId: DesignPageV3TerritoryId, verdict: DesignPageV3FounderTerritoryVerdict) => {
      persist(setDesignPageAuthorityTerritoryVerdict(session, territoryId, verdict));
    },
    [persist, session],
  );

  const approveViewport = useCallback(
    (viewport: 'mobile' | 'desktop') => {
      if (!session.lastResult) return;
      try {
        persist(approveDesignPageAuthorityViewport(session, viewport));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Approve failed');
      }
    },
    [persist, session],
  );

  if (!pilot) return null;

  const fullyLocked = isDesignPageAuthorityFullyLocked(session);
  const mobileLocked = isDesignPageAuthorityViewportLocked(session, 'mobile');
  const desktopLocked = isDesignPageAuthorityViewportLocked(session, 'desktop');
  const result = session.lastResult;
  const selectedTerritory = session.founderReview.selectedTerritoryId;

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
        <span>Project {projectId.toUpperCase()} · host shell + project atmosphere · no implementation</span>
        {mobileLocked ? (
          <span className="site00-dw-v3-authority__lock">{DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE}</span>
        ) : null}
        {desktopLocked ? (
          <span className="site00-dw-v3-authority__lock">{DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP}</span>
        ) : null}
      </header>
      <p className="site00-dw-v3-authority__hint">
        SITE 00 provides the architecture; NDXBOOK provides the atmosphere inside the workspace. Review territories A
        (Central Stage), B (Editorial Workbench), C (Spatial Workflow). Select one territory, then lock mobile +
        desktop as a pair — implementation sprint waits for both locks.
      </p>
      <div className="site00-dw-v3-authority__actions">
        <button
          type="button"
          className="site00-dw-v3-btn site00-dw-v3-btn--primary"
          disabled={running || fullyLocked}
          onClick={() => void run(result ? 'REGENERATE' : 'GENERATE')}
        >
          {running ? 'Generating…' : result ? 'REGENERATE 6 AUTHORITY FRAMES' : 'GENERATE TERRITORIES A/B/C'}
        </button>
        <button
          type="button"
          className="site00-dw-v3-btn site00-dw-v3-btn--outline"
          disabled={!selectedTerritory || !result || mobileLocked}
          onClick={() => approveViewport('mobile')}
        >
          APPROVE MOBILE ({DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE})
        </button>
        <button
          type="button"
          className="site00-dw-v3-btn site00-dw-v3-btn--outline"
          disabled={!selectedTerritory || !result || desktopLocked}
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
          onClick={() => void run('REFINE')}
        >
          REFINE + REGENERATE
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
            {result.lineage} · R2 {result.r2SelfCheck.pass ? 'PASS' : 'FAIL'} · R3 {result.r3SelfCheck.pass ? 'PASS' : 'FAIL'}{' '}
            · {result.classification.replace(/DESIGN_PAGE_AUTHORITY_/, '')} · candidate #{session.candidateGeneration}
            {selectedTerritory ? ` · selected territory ${selectedTerritory}` : ' · select territory before approve'}
          </p>
          {result.falProviderTrace?.length ? (
            <p className="site00-dw-v3-authority__hint" data-testid="v3-fal-trace">
              FAL: {result.falProviderTrace.filter((l) => l.includes('FAL_PARALLEL') || l.includes('ENQUEUED')).slice(0, 4).join(' · ')}
            </p>
          ) : null}
          <div className="site00-dw-v3-authority__territories">
            {result.territories.map((bundle) => {
              const isSelected = session.founderReview.selectedTerritoryId === bundle.territoryId;
              const verdict = session.founderReview.territoryVerdicts[bundle.territoryId];
              return (
                <article
                  key={bundle.territoryId}
                  className={`site00-dw-v3-authority__territory${isSelected ? ' site00-dw-v3-authority__territory--selected' : ''}`}
                >
                  <header className="site00-dw-v3-authority__territory-head">
                    <strong>
                      Territory {bundle.territoryId} · {bundle.territoryName}
                    </strong>
                    <button
                      type="button"
                      className="site00-dw-v3-btn site00-dw-v3-btn--compact"
                      disabled={fullyLocked}
                      onClick={() => onSelectTerritory(bundle.territoryId)}
                    >
                      {isSelected ? 'SELECTED' : 'SELECT FOR LOCK'}
                    </button>
                  </header>
                  <div className="site00-dw-v3-authority__verdicts" role="group" aria-label={`Verdict territory ${bundle.territoryId}`}>
                    {DESIGN_PAGE_V3_FOUNDER_TERRITORY_VERDICTS.map((v) => (
                      <button
                        key={v}
                        type="button"
                        className={`site00-dw-v3-btn site00-dw-v3-btn--verdict${verdict === v ? ' site00-dw-v3-btn--verdict-on' : ''}`}
                        disabled={fullyLocked}
                        onClick={() => onTerritoryVerdict(bundle.territoryId, v)}
                      >
                        {v.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                  <div className="site00-dw-v3-authority__pair">
                    <figure className="site00-dw-v3-authority__frame">
                      <figcaption>Mobile {bundle.mobile.representativePrototype ? '(prototype)' : ''}</figcaption>
                      <img src={bundle.mobile.storageUrl} alt={`Territory ${bundle.territoryId} mobile authority`} />
                    </figure>
                    <figure className="site00-dw-v3-authority__frame">
                      <figcaption>Desktop {bundle.desktop.representativePrototype ? '(prototype)' : ''}</figcaption>
                      <img src={bundle.desktop.storageUrl} alt={`Territory ${bundle.territoryId} desktop authority`} />
                    </figure>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      ) : null}
    </section>
  );
}
