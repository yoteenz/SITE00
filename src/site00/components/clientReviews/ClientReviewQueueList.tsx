import { Link } from 'react-router-dom';
import type { ClientReviewObject, ClientReviewViewport } from '../../../../shared/site00-client-reviews/types.js';
import { clientReviewDetailPath } from '../../../../shared/site00-client-reviews/client.js';
import { ClientRoomArrowIcon } from '../../icons/ClientProjectRoomNavIcons';

type ClientReviewQueueListProps = {
  projectSlug: string;
  reviews: ClientReviewObject[];
  emptyMessage: string | null;
};

function viewportLabel(viewports: ClientReviewViewport[]): string {
  return viewports.join(' · ');
}

export function ClientReviewQueueList({ projectSlug, reviews, emptyMessage }: ClientReviewQueueListProps) {
  if (reviews.length === 0) {
    return <div className="site00-cpr-section-empty">{emptyMessage ?? 'NOTHING NEEDS YOUR REVIEW RIGHT NOW.'}</div>;
  }

  return (
    <div className="site00-cpr-reviews-queue">
      {reviews.map((review) => (
        <Link
          key={review.reviewId}
          to={clientReviewDetailPath(projectSlug, review.reviewId)}
          className="site00-cpr-review-card"
        >
          <div className="site00-cpr-review-card__thumb">
            {review.thumbnailUrl ? (
              <img src={review.thumbnailUrl} alt="" />
            ) : (
              <span className="site00-cpr-review-card__placeholder">PREVIEW</span>
            )}
          </div>
          <div className="site00-cpr-review-card__body">
            <div className="site00-cpr-review-card__title">{review.title}</div>
            <div className="site00-cpr-review-card__meta">
              <span>{review.phaseLabel}</span>
              <span>·</span>
              <span className={review.actionRequired ? 'site00-cpr-accent' : ''}>{review.statusLabel}</span>
            </div>
            <div className="site00-cpr-review-card__meta">
              <span>{review.versionLabel}</span>
              {review.availableViewports.length > 0 ? (
                <>
                  <span>·</span>
                  <span>{viewportLabel(review.availableViewports)}</span>
                </>
              ) : null}
            </div>
            {review.subtitle ? <div className="site00-cpr-review-card__subtitle">{review.subtitle}</div> : null}
          </div>
          <div className="site00-cpr-review-card__cta">
            REVIEW
            <ClientRoomArrowIcon size={12} />
          </div>
        </Link>
      ))}
    </div>
  );
}
