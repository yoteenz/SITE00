/**
 * P0.VR.3J — Design workspace composer review queue panel.
 */

import {
  buildNdxbookMissingRoutes,
  COMPOSER_DRAFT_SNAPSHOT_LABEL,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3h/client.js';
import {
  buildComplexShellReviewBriefs,
  buildEnrichedComposerReviewQueue,
  buildEnrichedComposerReviewSets,
  buildReviewQueueSummary,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3j/browserClient.js';

function Thumbnail({ url, label }: { url: string | null; label: string }) {
  return (
    <figure className="site00-dw-composer-review__thumb">
      <figcaption>{label}</figcaption>
      {url ? (
        <img src={url} alt={`${label} preview`} loading="lazy" />
      ) : (
        <div className="site00-dw-composer-review__thumb-missing">NO CAPTURE</div>
      )}
    </figure>
  );
}

export function DesignComposerReviewQueue() {
  const queue = buildEnrichedComposerReviewQueue();
  const sets = buildEnrichedComposerReviewSets();
  const summary = buildReviewQueueSummary();
  const complexBriefs = buildComplexShellReviewBriefs();
  const ndxGapCount = buildNdxbookMissingRoutes().length;

  const simpleQueue = queue.filter(
    (e) => e.readinessStatus !== 'NEEDS_CREATIVE_DIRECTION' && e.readinessStatus !== 'NEEDS_FUNCTIONAL_REVIEW',
  );

  return (
    <section className="site00-dw-composer-review" data-visual-reconstruction="p0vr3j-composer-review">
      <header className="site00-dw-composer-review__head">
        <h2>COMPOSER-CREATED PAGES</h2>
        <p className="site00-dw-composer-review__label">{COMPOSER_DRAFT_SNAPSHOT_LABEL}</p>
        <p className="site00-dw-composer-review__summary">
          {summary.readyForReview} ready · {summary.screenshotBlocked} screenshot blocked ·{' '}
          {summary.contentBlocked} content blocked
        </p>
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
                {set.batchApprovalAllowed ? 'allowed' : 'blocked'} · ready{' '}
                {set.readyForReview ? 'yes' : 'no'}
              </p>
              {set.unresolvedPlaceholders.length > 0 && (
                <p className="site00-dw-composer-review__warn">Placeholders: {set.unresolvedPlaceholders.join('; ')}</p>
              )}
              <div className="site00-dw-composer-review__set-actions">
                <button type="button" disabled={!set.readyForReview}>
                  APPROVE SET
                </button>
                <button type="button" disabled={!set.batchApprovalAllowed}>
                  APPROVE SELECTED
                </button>
                <button type="button">REQUEST CHANGES</button>
                <button type="button">OPEN INDIVIDUAL</button>
              </div>
            </article>
          ))
        )}
      </div>

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
        {complexBriefs.map((brief) => (
          <article key={brief.pageId} className="site00-dw-composer-review__complex-item">
            <h4>{brief.pageId.toUpperCase()}</h4>
            <p className="site00-dw-composer-review__route">
              {brief.route} · {brief.status}
            </p>
            <p>{brief.purpose}</p>
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
        ))}
      </div>

      <div className="site00-dw-composer-review__queue">
        <h3>SIMPLE PAGE REVIEW</h3>
        {simpleQueue.length === 0 ? (
          <p className="site00-dw-composer-review__empty">No simple pages in queue.</p>
        ) : (
          <ul className="site00-dw-composer-review__list">
            {simpleQueue.map((entry) => (
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
                  <Thumbnail url={entry.screenshots.mobile} label="MOBILE" />
                  <Thumbnail url={entry.screenshots.tablet} label="TABLET" />
                  <Thumbnail url={entry.screenshots.desktop} label="DESKTOP" />
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
