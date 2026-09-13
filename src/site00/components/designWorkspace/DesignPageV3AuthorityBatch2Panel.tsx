/**
 * Twin V3 — Batch 2 FAL gallery (isolated module; does not read batch-1 ledger/backup/recovery).
 */

import { useCallback, useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import {
  batch2ModuleToReviewSession,
  normalizeDesignPageAuthorityBatch2Module,
  reviewSessionToBatch2Module,
  createDesignPageAuthorityReviewSession,
  DESIGN_PAGE_V3_HOST_PRODUCT_NAME,
  DESIGN_PAGE_V3_PILOT_PROJECT_ID,
  galleryCandidateCount,
  mergeDesignPageAuthorityApiResponse,
  P0_VR_TWIN_V30_BUILD,
  readDesignPageAuthorityBatch2Module,
  readDesignPageAuthoritySession,
  requestDesignPageAuthorityGeneration,
  territoryDisplayName,
  territoryGalleryHasCandidates,
  writeDesignPageAuthorityBatch2Module,
  type DesignPageAuthorityBatch2ModuleState,
  type DesignPageAuthorityTerritoryScope,
  type DesignPageV3TerritoryId,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import {
  publicAuthorityPrototypeImageUrl,
  resolveDesignPageAuthorityImageSrc,
} from './designPageAuthorityR3PrototypeUrls.js';
import '../../styles/site00-twin-v3-design-authority.css';

type Props = {
  projectId: string;
};

const TERRITORY_ORDER: DesignPageV3TerritoryId[] = ['A', 'B', 'C'];

function onAuthorityImageError(
  ev: SyntheticEvent<HTMLImageElement>,
  hint: { territoryId: DesignPageV3TerritoryId; viewport: 'mobile' | 'desktop' },
) {
  const el = ev.currentTarget;
  const fallback = publicAuthorityPrototypeImageUrl(
    `/site00/twin-v3-design-page-authority/${hint.viewport}-territory-${hint.territoryId.toLowerCase()}-r3.svg`,
  );
  if (el.src !== fallback) el.src = fallback;
}

export function DesignPageV3AuthorityBatch2Panel({ projectId }: Props) {
  const pilot = projectId.toLowerCase() === DESIGN_PAGE_V3_PILOT_PROJECT_ID;
  const [batch2, setBatch2] = useState<DesignPageAuthorityBatch2ModuleState>(() =>
    pilot ? readDesignPageAuthorityBatch2Module(projectId) : readDesignPageAuthorityBatch2Module(projectId),
  );
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [persistWarning, setPersistWarning] = useState<string | null>(null);
  const [fullscreenSrc, setFullscreenSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!pilot) return;
    setBatch2(readDesignPageAuthorityBatch2Module(projectId));
  }, [pilot, projectId]);

  const hasGallery = territoryGalleryHasCandidates(batch2.territoryGallery);
  const stats = useMemo(
    () =>
      `Batch 2 module · gen #${batch2.candidateGeneration} · A:${batch2.territoryGallery.A.length} B:${batch2.territoryGallery.B.length} C:${batch2.territoryGallery.C.length} · ${galleryCandidateCount(batch2.territoryGallery)} frames · build ${P0_VR_TWIN_V30_BUILD}`,
    [batch2],
  );

  const persistBatch2 = useCallback((next: DesignPageAuthorityBatch2ModuleState) => {
    setBatch2(next);
    const ok = writeDesignPageAuthorityBatch2Module(next);
    setPersistWarning(
      ok ? null : 'Batch 2 could not save to localStorage (quota?). Re-run ADD BATCH after freeing space.',
    );
  }, []);

  const run = useCallback(
    async (input: {
      action: 'GENERATE' | 'REGENERATE' | 'REGENERATE_TERRITORY';
      territoryScope?: DesignPageAuthorityTerritoryScope;
    }) => {
      setRunning(true);
      setError(null);
      try {
        const mainTemplate =
          readDesignPageAuthoritySession(projectId) ??
          createDesignPageAuthorityReviewSession({ projectId });
        const apiSession = batch2ModuleToReviewSession(batch2, mainTemplate);
        const res = await requestDesignPageAuthorityGeneration({
          session: apiSession,
          action: input.action,
          territoryScope: input.territoryScope ?? 'ALL',
          founderConfirmedSpend: true,
        });
        const merged = mergeDesignPageAuthorityApiResponse(
          apiSession,
          { result: res.result, session: res.session },
          input.action,
        );
        persistBatch2(
          normalizeDesignPageAuthorityBatch2Module(reviewSessionToBatch2Module(merged)),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Batch 2 generation failed');
      } finally {
        setRunning(false);
      }
    },
    [batch2, persistBatch2, projectId],
  );

  if (!pilot) return null;

  const result = batch2.lastResult;

  return (
    <section
      className="site00-dw-v3-authority site00-dw-v3-authority-batch2"
      aria-label="Twin V3 design page authority batch 2 module"
      data-batch-module="2"
      data-build-ref={P0_VR_TWIN_V30_BUILD}
    >
      <header className="site00-dw-v3-authority__head">
        <strong>BATCH 2 · LIVE FAL GALLERY</strong>
        <span>{DESIGN_PAGE_V3_HOST_PRODUCT_NAME} · isolated storage · not merged with batch 1 below</span>
      </header>
      <p className="site00-dw-v3-authority__hint" data-testid="v3-authority-batch2-stats">
        {stats}
      </p>
      <p className="site00-dw-v3-authority__hint">
        Use this panel for new FAL runs. Batch 1 below is legacy storage only — it cannot overwrite batch 2.
      </p>
      {running ? (
        <p className="site00-dw-v3-authority__hint" role="status" data-testid="v3-authority-batch2-generating">
          Generating batch 2 via api.site00.com…
        </p>
      ) : null}
      <div className="site00-dw-v3-authority__actions">
        <button
          type="button"
          className="site00-dw-v3-btn site00-dw-v3-btn--primary"
          disabled={running}
          onClick={() =>
            void run({
              action: hasGallery ? 'REGENERATE' : 'GENERATE',
              territoryScope: 'ALL',
            })
          }
        >
          {running ? 'Generating…' : hasGallery ? 'ADD BATCH 2 (A+B+C)' : 'GENERATE BATCH 2 (A+B+C)'}
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
        <p className="site00-dw-v3-authority__hint">
          Last batch 2 run · R3 {result.r3SelfCheck.pass ? 'PASS' : 'FAIL'} · R4 {result.r4SelfCheck?.pass ? 'PASS' : 'FAIL'}
        </p>
      ) : null}
      <div className="site00-dw-v3-authority__territories">
        {TERRITORY_ORDER.map((territoryId) => {
          const candidates = batch2.territoryGallery[territoryId];
          return (
            <article key={territoryId} className="site00-dw-v3-authority__territory">
              <header className="site00-dw-v3-authority__territory-head">
                <strong>
                  Territory {territoryId} · {territoryDisplayName(territoryId)} · batch 2
                </strong>
                <div className="site00-dw-v3-authority__territory-actions">
                  <button
                    type="button"
                    className="site00-dw-v3-btn site00-dw-v3-btn--compact"
                    disabled={running}
                    onClick={() => void run({ action: 'REGENERATE_TERRITORY', territoryScope: territoryId })}
                  >
                    + REGEN TERRITORY
                  </button>
                </div>
              </header>
              {!candidates.length ?
                <p className="site00-dw-v3-authority__hint">No batch 2 frames yet — run GENERATE BATCH 2.</p>
              : <div className="site00-dw-v3-authority__candidate-stack">
                  {candidates.map((candidate, index) => (
                    <div key={candidate.candidateId} className="site00-dw-v3-authority__candidate">
                      <header className="site00-dw-v3-authority__candidate-head">
                        <span>
                          batch {candidate.batchGeneration} · gen #{index + 1} ·{' '}
                          {!candidate.mobile.representativePrototype && !candidate.mobile.storageUrl.includes('.svg') ?
                            'FAL'
                          : 'prototype'}
                        </span>
                      </header>
                      <div className="site00-dw-v3-authority__pair">
                        {(['mobile', 'desktop'] as const).map((viewport) => {
                          const frame = viewport === 'mobile' ? candidate.mobile : candidate.desktop;
                          return (
                            <figure key={viewport} className="site00-dw-v3-authority__frame">
                              <figcaption>{viewport.toUpperCase()}</figcaption>
                              <img
                                src={resolveDesignPageAuthorityImageSrc(frame.storageUrl, { territoryId, viewport })}
                                alt={`Batch 2 territory ${territoryId} ${viewport}`}
                                loading="lazy"
                                onClick={() =>
                                  setFullscreenSrc(
                                    resolveDesignPageAuthorityImageSrc(frame.storageUrl, { territoryId, viewport }),
                                  )
                                }
                                onError={(ev) => onAuthorityImageError(ev, { territoryId, viewport })}
                              />
                            </figure>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              }
            </article>
          );
        })}
      </div>
      {fullscreenSrc ?
        <div
          className="site00-dw-v3-authority-modal site00-dw-v3-authority-modal--fullscreen"
          role="dialog"
          onClick={() => setFullscreenSrc(null)}
        >
          <img src={fullscreenSrc} alt="Batch 2 fullscreen preview" />
        </div>
      : null}
    </section>
  );
}
