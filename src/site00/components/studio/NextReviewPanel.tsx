import { Link } from 'react-router-dom';
import type { ClientStudioReview } from '../../services/clientProductionApi';

type NextReviewPanelProps = {
  review: ClientStudioReview | null;
};

export function NextReviewPanel({ review }: NextReviewPanelProps) {
  return (
    <section className="site00-studio-panel site00-studio-panel--review" aria-labelledby="studio-next-review">
      <h2 id="studio-next-review" className="site00-studio-panel__eyebrow">NEXT REVIEW</h2>
      {review ? (
        <div className="site00-studio-review">
          <div className="site00-studio-review__thumb" aria-hidden="true">
            <span className="site00-studio-review__badge">{review.category.charAt(0)}</span>
          </div>
          <div>
            <p className="site00-studio-review__kicker">UPCOMING</p>
            <p className="site00-studio-review__title">{review.title}</p>
            {review.variantCount ? (
              <p className="site00-studio-review__subtitle">{review.variantCount} DIRECTIONS READY</p>
            ) : (
              <p className="site00-studio-review__subtitle">{review.subtitle}</p>
            )}
            <Link to={review.route} className="site00-studio-panel__cta">ENTER REVIEW →</Link>
          </div>
        </div>
      ) : (
        <>
          <p className="site00-studio-panel__empty">NO REVIEW READY YET</p>
          <p className="site00-studio-input-sub">IN PRODUCTION</p>
        </>
      )}
    </section>
  );
}
