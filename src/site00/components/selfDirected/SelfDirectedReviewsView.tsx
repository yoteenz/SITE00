import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { ClientReviewObject } from '../../../../shared/site00-client-reviews/types.js';
import { useSite00MobileViewport } from '../../hooks/useSite00MobileViewport';
import { AppSectionLabel, AppStatusDot } from '../clientApp/Site00ClientAppShell';

type SelfDirectedReviewsViewProps = {
  reviews: ClientReviewObject[];
  emptyMessage?: string | null;
  reviewHref: (reviewId: string) => string;
  projectLabel?: string;
};

function statusTone(status: string): 'accent' | 'green' | 'orange' | 'blue' | 'grey' {
  if (status === 'READY_FOR_REVIEW') return 'accent';
  if (status === 'APPROVED') return 'green';
  if (status === 'REVISION_IN_PROGRESS') return 'blue';
  if (status === 'AWAITING_CLIENT') return 'orange';
  return 'grey';
}

function ReviewSummaryBar({ reviews }: { reviews: ClientReviewObject[] }) {
  const pending = reviews.filter((r) => r.status === 'READY_FOR_REVIEW' || r.status === 'AWAITING_CLIENT').length;
  const approved = reviews.filter((r) => r.status === 'APPROVED').length;
  const inProgress = reviews.filter((r) => r.status === 'REVISION_IN_PROGRESS').length;

  return (
    <div className="site00-sd-reviews__summary">
      <div className="site00-sd-reviews__summary-stat">
        <strong>{pending > 0 ? pending : '—'}</strong>
        <span>PENDING YOUR REVIEW</span>
      </div>
      <div className="site00-sd-reviews__summary-stat">
        <strong>{approved > 0 ? approved : '—'}</strong>
        <span>APPROVED</span>
      </div>
      <div className="site00-sd-reviews__summary-stat">
        <strong>{inProgress > 0 ? inProgress : '—'}</strong>
        <span>IN REVISION</span>
      </div>
    </div>
  );
}

function ReviewQueueCard({
  review,
  href,
}: {
  review: ClientReviewObject;
  href: string;
}) {
  return (
    <Link to={href} className="site00-sd-reviews__card">
      <div className="site00-sd-reviews__card-thumb">
        {review.thumbnailUrl ? (
          <img src={review.thumbnailUrl} alt="" />
        ) : (
          <span className="site00-sd-reviews__card-placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="site00-sd-reviews__card-body">
        <div className="site00-sd-reviews__card-meta">
          <AppStatusDot tone={statusTone(review.status)} />
          <span>{review.phaseLabel}</span>
        </div>
        <h3 className="site00-sd-reviews__card-title">{review.title}</h3>
        {review.subtitle ? <p className="site00-sd-reviews__card-sub">{review.subtitle}</p> : null}
        <div className="site00-sd-reviews__card-footer">
          <span className={`site00-sd-reviews__badge site00-sd-reviews__badge--${statusTone(review.status)}`}>
            {review.statusLabel}
          </span>
          <span className="site00-sd-reviews__version">{review.versionLabel}</span>
        </div>
      </div>
      <span className="site00-sd-reviews__card-cta" aria-hidden="true">
        →
      </span>
    </Link>
  );
}

function ReviewsMobile({ reviews, emptyMessage, reviewHref, projectLabel }: SelfDirectedReviewsViewProps) {
  return (
    <div className="site00-sd-reviews site00-sd-reviews--mobile">
      <header className="site00-sd-reviews__header">
        <AppStatusDot />
        <span>REVIEWS</span>
        {projectLabel ? <span className="site00-sd-muted">{projectLabel}</span> : null}
      </header>
      <ReviewSummaryBar reviews={reviews} />
      <AppSectionLabel>
        REVIEW QUEUE <span className="site00-sd-muted">CAMPAIGNS · TREATMENTS · OUTPUTS</span>
      </AppSectionLabel>
      {reviews.length === 0 ? (
        <div className="site00-sd-reviews__empty">{emptyMessage ?? 'NOTHING NEEDS YOUR REVIEW RIGHT NOW.'}</div>
      ) : (
        <div className="site00-sd-reviews__queue">
          {reviews.map((review) => (
            <ReviewQueueCard key={review.reviewId} review={review} href={reviewHref(review.reviewId)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewsDesktop({ reviews, emptyMessage, reviewHref, projectLabel }: SelfDirectedReviewsViewProps) {
  const pending = reviews.filter((r) => r.status === 'READY_FOR_REVIEW' || r.status === 'AWAITING_CLIENT');
  const completed = reviews.filter((r) => r.status === 'APPROVED' || r.status === 'REVISION_IN_PROGRESS');

  return (
    <div className="site00-sd-reviews site00-sd-reviews--desktop">
      <header className="site00-sd-reviews__header site00-sd-reviews__header--desktop">
        <div>
          <AppStatusDot />
          <span>REVIEWS</span>
          <h1>CREATIVE APPROVAL QUEUE</h1>
        </div>
        {projectLabel ? <span className="site00-sd-muted">{projectLabel}</span> : null}
      </header>

      <div className="site00-sd-reviews__desktop-grid">
        <div className="site00-sd-reviews__desktop-main">
          <ReviewSummaryBar reviews={reviews} />
          <AppSectionLabel>PENDING REVIEW</AppSectionLabel>
          {pending.length === 0 ? (
            <div className="site00-sd-reviews__empty">{emptyMessage ?? 'NO PENDING REVIEWS.'}</div>
          ) : (
            <div className="site00-sd-reviews__queue site00-sd-reviews__queue--desktop">
              {pending.map((review) => (
                <ReviewQueueCard key={review.reviewId} review={review} href={reviewHref(review.reviewId)} />
              ))}
            </div>
          )}
        </div>

        <aside className="site00-sd-reviews__desktop-rail">
          <AppSectionLabel>RECENT ACTIVITY</AppSectionLabel>
          {completed.length === 0 ? (
            <p className="site00-sd-muted">NO COMPLETED REVIEWS YET.</p>
          ) : (
            <ul className="site00-sd-reviews__rail-list">
              {completed.slice(0, 5).map((review) => (
                <li key={review.reviewId}>
                  <Link to={reviewHref(review.reviewId)}>
                    <strong>{review.title}</strong>
                    <span>{review.statusLabel}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="site00-sd-reviews__rail-cta">
            <p>YOUR FEEDBACK SHAPES WHAT SHIPS NEXT.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function SelfDirectedReviewsView(props: SelfDirectedReviewsViewProps) {
  const isMobile = useSite00MobileViewport();
  return isMobile ? <ReviewsMobile {...props} /> : <ReviewsDesktop {...props} />;
}

/** Product-grammar wrapper for review detail child surface. */
export function SelfDirectedReviewDetailShell({
  children,
  title,
  backHref,
}: {
  children: ReactNode;
  title: string;
  backHref: string;
}) {
  const isMobile = useSite00MobileViewport();
  return (
    <div className={`site00-sd-review-detail${isMobile ? '' : ' site00-sd-review-detail--desktop'}`}>
      <header className="site00-sd-review-detail__header">
        <Link to={backHref} className="site00-sd-review-detail__back">
          ← BACK
        </Link>
        <h1>{title}</h1>
      </header>
      <div className="site00-sd-review-detail__body">{children}</div>
    </div>
  );
}
