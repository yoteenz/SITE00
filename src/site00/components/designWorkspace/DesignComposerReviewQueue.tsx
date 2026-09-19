/**
 * P0.VR.3J.1 — Design workspace composer review queue (persistent snapshot hydration).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildNdxbookMissingRoutes,
  COMPOSER_DRAFT_SNAPSHOT_LABEL,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3h/client.js';
import type {
  EnrichedComposerReviewQueueEntry,
  EnrichedComposerReviewSet,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3j/browserClient.js';
import type { ComposerDraftReviewSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3j/composerDraftReviewSession.js';
import type { ComplexShellReviewBrief } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3j/types.js';

type ReviewViewport = 'mobile' | 'tablet' | 'desktop';

function Thumbnail({
  url,
  label,
  loading,
  active,
  onSelect,
}: {
  url: string | null;
  label: string;
  loading?: boolean;
  active?: boolean;
  onSelect?: () => void;
}) {
  return (
    <figure
      className={`site00-dw-composer-review__thumb${active ? ' site00-dw-composer-review__thumb--active' : ''}`}
    >
      <figcaption>
        {onSelect ? (
          <button type="button" className="site00-dw-composer-review__viewport-btn" onClick={onSelect}>
            {label}
          </button>
        ) : (
          label
        )}
      </figcaption>
      {loading ? (
        <div className="site00-dw-composer-review__thumb-loading">LOADING SNAPSHOT</div>
      ) : url ? (
        <img src={url} alt={`${label} preview`} loading="lazy" />
      ) : (
        <div className="site00-dw-composer-review__thumb-missing">NO CAPTURE</div>
      )}
    </figure>
  );
}

function snapshotForViewport(
  entry: EnrichedComposerReviewQueueEntry,
  viewport: ReviewViewport,
): string | null {
  return entry.screenshots[viewport];
}

export function DesignComposerReviewQueue() {
  const [session, setSession] = useState<ComposerDraftReviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [viewport, setViewport] = useState<ReviewViewport>('mobile');
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);

  const loadSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/site00/implementation-snapshots?view=composer_draft_review');
      if (!res.ok) throw new Error(`Review session load failed (${res.status})`);
      const data = (await res.json()) as ComposerDraftReviewSession;
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load composer draft review session');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const queue = session?.queue ?? [];
  const sets = session?.sets ?? [];
  const summary = session?.summary;
  const complexBriefs = session?.complexBriefs ?? [];
  const health = session?.health;
  const coverage = session?.coverage;

  const activeSet = useMemo(
    () => sets.find((s) => s.setId === activeSetId) ?? null,
    [activeSetId, sets],
  );

  const setPages = useMemo(() => {
    if (!activeSet) return [];
    return activeSet.pageIds
      .map((id) => queue.find((q) => q.pageId === id))
      .filter((e): e is EnrichedComposerReviewQueueEntry => Boolean(e));
  }, [activeSet, queue]);

  const currentPage = setPages[pageIndex] ?? null;

  const simpleQueue = queue.filter(
    (e) => e.readinessStatus !== 'NEEDS_CREATIVE_DIRECTION' && e.readinessStatus !== 'NEEDS_FUNCTIONAL_REVIEW',
  );

  const ndxGapCount = buildNdxbookMissingRoutes().length;

  const togglePageSelection = (pageId: string) => {
    setSelectedPageIds((prev) => (prev.includes(pageId) ? prev.filter((id) => id !== pageId) : [...prev, pageId]));
  };

  const openSet = (set: EnrichedComposerReviewSet) => {
    setActiveSetId(set.setId);
    setPageIndex(0);
    setViewport('mobile');
    setSelectedPageIds(set.approvablePageIds ?? []);
  };

  const closeSet = () => {
    setActiveSetId(null);
    setPageIndex(0);
    setSelectedPageIds([]);
  };

  const goPrev = () => setPageIndex((i) => Math.max(0, i - 1));
  const goNext = () => setPageIndex((i) => Math.min(setPages.length - 1, i + 1));

  if (loading && !session) {
    return (
      <section className="site00-dw-composer-review" data-visual-reconstruction="p0vr3j-composer-review">
        <p className="site00-dw-composer-review__loading">LOADING SNAPSHOT REGISTRY…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="site00-dw-composer-review" data-visual-reconstruction="p0vr3j-composer-review">
        <p className="site00-dw-composer-review__warn">{error}</p>
        <button type="button" onClick={() => void loadSession()}>
          RETRY
        </button>
      </section>
    );
  }

  return (
    <section className="site00-dw-composer-review" data-visual-reconstruction="p0vr3j-composer-review">
      <header className="site00-dw-composer-review__head">
        <h2>COMPOSER-CREATED PAGES</h2>
        <p className="site00-dw-composer-review__label">{COMPOSER_DRAFT_SNAPSHOT_LABEL}</p>
        {summary ? (
          <p className="site00-dw-composer-review__summary">
            {summary.readyForReview} ready · {summary.screenshotBlocked} screenshot blocked ·{' '}
            {summary.contentBlocked} content blocked · {summary.creativeDirection} creative ·{' '}
            {summary.functionalReview} functional
          </p>
        ) : null}
        {health ? (
          <p className="site00-dw-composer-review__health">
            Snapshots {health.valid}/{health.expected} valid · {health.persistentReused} reused · session dependency{' '}
            {health.sessionDependency ? 'yes' : 'no'}
          </p>
        ) : null}
        {coverage ? (
          <p className="site00-dw-composer-review__coverage">
            Draft pages {coverage.draftPages} · snapshot complete {coverage.snapshotCompletePages} · ready{' '}
            {coverage.readyForReview}
          </p>
        ) : null}
      </header>

      <div className="site00-dw-composer-review__sets">
        <h3>REVIEW SETS</h3>
        {sets.length === 0 ? (
          <p className="site00-dw-composer-review__empty">No review sets.</p>
        ) : (
          sets.map((set) => (
            <article key={set.setId} className="site00-dw-composer-review__set">
              <h4>{set.label}</h4>
              <p>
                {set.pageIds.length} pages · {set.sharedFamily} · {set.sharedTemplate}
              </p>
              <p>
                Screenshots {set.screenshotsComplete ? 'complete' : 'incomplete'} · batch approval{' '}
                {set.batchApprovalAllowed ? 'allowed' : 'blocked'} · partial{' '}
                {set.partialApprovalAllowed ? 'allowed' : 'blocked'} · ready {set.readyForReview ? 'yes' : 'no'}
              </p>
              {set.unresolvedPlaceholders.length > 0 && (
                <p className="site00-dw-composer-review__warn">Placeholders: {set.unresolvedPlaceholders.join('; ')}</p>
              )}
              <div className="site00-dw-composer-review__set-actions">
                <button type="button" disabled={!set.readyForReview}>
                  APPROVE SET
                </button>
                <button type="button" disabled={!set.partialApprovalAllowed}>
                  APPROVE SELECTED
                </button>
                <button type="button">REQUEST CHANGES</button>
                <button type="button" onClick={() => openSet(set)}>
                  OPEN SET
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {activeSet && currentPage ? (
        <div className="site00-dw-composer-review__set-nav">
          <div className="site00-dw-composer-review__set-nav-head">
            <h3>{activeSet.label}</h3>
            <button type="button" onClick={closeSet}>
              CLOSE SET
            </button>
          </div>
          <p>
            Page {pageIndex + 1} of {setPages.length}: <strong>{currentPage.pageId.toUpperCase()}</strong> ·{' '}
            {currentPage.readinessStatus}
          </p>
          <div className="site00-dw-composer-review__set-actions">
            <button type="button" disabled={pageIndex === 0} onClick={goPrev}>
              PREVIOUS PAGE
            </button>
            <button type="button" disabled={pageIndex >= setPages.length - 1} onClick={goNext}>
              NEXT PAGE
            </button>
            <label className="site00-dw-composer-review__select">
              <input
                type="checkbox"
                checked={selectedPageIds.includes(currentPage.pageId)}
                onChange={() => togglePageSelection(currentPage.pageId)}
              />
              SELECT FOR APPROVAL
            </label>
          </div>
          <div className="site00-dw-composer-review__item-head">
            <div>
              <strong>{currentPage.pageId.toUpperCase()}</strong>
              <span className="site00-dw-composer-review__route">{currentPage.route}</span>
            </div>
            <div className="site00-dw-composer-review__badges">
              {currentPage.badges.map((b) => (
                <span key={b} className="site00-dw-composer-review__badge">
                  {b}
                </span>
              ))}
            </div>
          </div>
          <div className="site00-dw-composer-review__thumbs">
            <Thumbnail
              url={snapshotForViewport(currentPage, 'mobile')}
              label="MOBILE"
              loading={loading}
              active={viewport === 'mobile'}
              onSelect={() => setViewport('mobile')}
            />
            <Thumbnail
              url={snapshotForViewport(currentPage, 'tablet')}
              label="TABLET"
              loading={loading}
              active={viewport === 'tablet'}
              onSelect={() => setViewport('tablet')}
            />
            <Thumbnail
              url={snapshotForViewport(currentPage, 'desktop')}
              label="DESKTOP"
              loading={loading}
              active={viewport === 'desktop'}
              onSelect={() => setViewport('desktop')}
            />
          </div>
          {snapshotForViewport(currentPage, viewport) ? (
            <figure className="site00-dw-composer-review__hero">
              <img
                src={snapshotForViewport(currentPage, viewport)!}
                alt={`${currentPage.pageId} ${viewport}`}
                loading="lazy"
              />
            </figure>
          ) : (
            <p className="site00-dw-composer-review__warn">LOADING SNAPSHOT — {viewport.toUpperCase()}</p>
          )}
        </div>
      ) : null}

      {ndxGapCount > 0 && (
        <div className="site00-dw-composer-review__ndx">
          <h3>NDXBOOK DESIGN PILOT GAPS</h3>
          <p>
            {ndxGapCount} registration gaps · reconcile via API (P0.VR.3J) — existing routes preserved, no new functional
            routes
          </p>
        </div>
      )}

      <div className="site00-dw-composer-review__complex">
        <h3>COMPLEX SHELLS — DIRECTION REQUIRED</h3>
        {complexBriefs.map((brief: ComplexShellReviewBrief) => {
          const entry = queue.find((q) => q.pageId === brief.pageId);
          return (
            <article key={brief.pageId} className="site00-dw-composer-review__complex-item">
              <h4>{brief.pageId.toUpperCase()}</h4>
              <p className="site00-dw-composer-review__route">
                {brief.route} · {brief.status}
              </p>
              <p>{brief.purpose}</p>
              {entry ? (
                <div className="site00-dw-composer-review__thumbs">
                  <Thumbnail url={entry.screenshots.mobile} label="MOBILE" />
                  <Thumbnail url={entry.screenshots.tablet} label="TABLET" />
                  <Thumbnail url={entry.screenshots.desktop} label="DESKTOP" />
                </div>
              ) : null}
              <ul>
                <li>
                  <strong>Composer created:</strong> {brief.composerCreated.join(', ')}
                </li>
                <li>
                  <strong>Placeholder:</strong> {brief.placeholders.join(', ')}
                </li>
                <li>
                  <strong>Requires founder direction:</strong> {brief.requiresFounderDirection.join(', ')}
                </li>
              </ul>
            </article>
          );
        })}
      </div>

      <div className="site00-dw-composer-review__queue">
        <h3>ALL COMPOSER DRAFT PAGES</h3>
        {simpleQueue.length === 0 && queue.length === 0 ? (
          <p className="site00-dw-composer-review__empty">No pages in queue.</p>
        ) : (
          <ul className="site00-dw-composer-review__list">
            {queue.map((entry) => (
              <li key={entry.queueId} className="site00-dw-composer-review__item">
                <div className="site00-dw-composer-review__item-head">
                  <div>
                    <strong>{entry.pageId.toUpperCase()}</strong>
                    <span className="site00-dw-composer-review__route">{entry.route}</span>
                  </div>
                  <div className="site00-dw-composer-review__badges">
                    {entry.badges.map((b) => (
                      <span key={b} className="site00-dw-composer-review__badge">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
                <p>
                  {entry.family} · {entry.readinessStatus} · {entry.reviewDimensions.join(', ')}
                </p>
                <p className="site00-dw-composer-review__provenance">
                  {entry.contentProvenance.join(' · ')} · inferred content: {entry.inferredContentCount}
                </p>
                <div className="site00-dw-composer-review__thumbs">
                  <Thumbnail url={entry.screenshots.mobile} label="MOBILE" loading={loading && !entry.screenshotComplete} />
                  <Thumbnail url={entry.screenshots.tablet} label="TABLET" loading={loading && !entry.screenshotComplete} />
                  <Thumbnail url={entry.screenshots.desktop} label="DESKTOP" loading={loading && !entry.screenshotComplete} />
                </div>
                {entry.captureFailures.length > 0 && (
                  <p className="site00-dw-composer-review__warn">{entry.captureFailures.join(' · ')}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
