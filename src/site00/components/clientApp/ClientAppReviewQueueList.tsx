import { Link } from 'react-router-dom';
import type { ClientReviewObject, ClientReviewViewport } from '../../../../shared/site00-client-reviews/types.js';
import { ClientRoomArrowIcon } from '../../icons/ClientProjectRoomNavIcons';

type ClientAppReviewQueueListProps = {
  reviews: ClientReviewObject[];
  emptyMessage?: string | null;
  reviewHref: (reviewId: string) => string;
};

function viewportLabel(viewports: ClientReviewViewport[]): string {
  return viewports.join(' · ');
}

function statusTone(status: string): string {
  if (status === 'READY_FOR_REVIEW') return 'orange';
  if (status === 'REVISION_IN_PROGRESS') return 'blue';
  if (status === 'APPROVED') return 'green';
  return 'grey';
}

export function ClientAppReviewQueueList({ reviews, emptyMessage, reviewHref }: ClientAppReviewQueueListProps) {
  if (reviews.length === 0) {
    return <div className="site00-app-state">{emptyMessage ?? 'NOTHING NEEDS YOUR REVIEW RIGHT NOW.'}</div>;
  }

  return (
    <div className="site00-app-review-queue">
      {reviews.map((review) => (
        <Link key={review.reviewId} to={reviewHref(review.reviewId)} className="site00-app-review-card">
          <div className="site00-app-review-card__thumb">
            {review.thumbnailUrl ? (
              <img src={review.thumbnailUrl} alt="" />
            ) : (
              <span className="site00-app-review-card__placeholder">PREVIEW</span>
            )}
          </div>
          <div className="site00-app-review-card__body">
            <div className="site00-app-review-card__title">{review.title}</div>
            <div className="site00-app-review-card__meta">
              <span className={`site00-app-badge site00-app-badge--${statusTone(review.status)}`}>
                {review.statusLabel}
              </span>
              <span>{review.versionLabel}</span>
            </div>
            {review.subtitle ? <div className="site00-app-review-card__subtitle">{review.subtitle}</div> : null}
            {review.availableViewports.length > 0 ? (
              <div className="site00-app-review-card__viewports">{viewportLabel(review.availableViewports)}</div>
            ) : null}
          </div>
          <div className="site00-app-review-card__cta">
            REVIEW
            <ClientRoomArrowIcon size={12} />
          </div>
        </Link>
      ))}
    </div>
  );
}
