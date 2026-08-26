/**
 * P0.VR.3H — Design workspace composer review queue panel.
 */

import {
  buildComposerReviewQueue,
  buildComposerReviewSets,
  COMPOSER_DRAFT_SNAPSHOT_LABEL,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3h/client.js';

export function DesignComposerReviewQueue() {
  const queue = buildComposerReviewQueue();
  const sets = buildComposerReviewSets();

  return (
    <section className="site00-dw-composer-review" data-visual-reconstruction="p0vr3h-composer-review">
      <header className="site00-dw-composer-review__head">
        <h2>COMPOSER-CREATED PAGES</h2>
        <p className="site00-dw-composer-review__label">{COMPOSER_DRAFT_SNAPSHOT_LABEL}</p>
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
                {set.pageIds.length} pages · batch approval {set.batchApprovalAllowed ? 'allowed' : 'blocked'}
              </p>
            </article>
          ))
        )}
      </div>

      <div className="site00-dw-composer-review__queue">
        <h3>INDIVIDUAL REVIEW</h3>
        {queue.length === 0 ? (
          <p className="site00-dw-composer-review__empty">No composer draft pages in queue.</p>
        ) : (
          <ul className="site00-dw-composer-review__list">
            {queue.map((entry) => (
              <li key={entry.queueId} className="site00-dw-composer-review__item">
                <div>
                  <strong>{entry.pageId.toUpperCase()}</strong>
                  <span className="site00-dw-composer-review__route">{entry.route}</span>
                </div>
                <p>
                  {entry.completionMode} · {entry.reviewStatus} · {entry.reviewDimensions.join(', ')}
                </p>
                <p className="site00-dw-composer-review__provenance">{entry.contentProvenance.join(' · ')}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
