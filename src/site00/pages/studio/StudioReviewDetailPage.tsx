import { Link, useParams } from 'react-router-dom';
import { site00StudioPath } from '../../config/routes';
import { useStudioData } from '../../hooks/useStudioData';
import {
  StudioErrorState,
  StudioLoadingState,
  StudioShell,
} from '../../components/studio';

/** Foundation review environment — directions, approve, revision request. */
export default function StudioReviewDetailPage() {
  const { projectSlug = '', reviewId = '' } = useParams();
  const { data, state, error, reload } = useStudioData(projectSlug);

  if (state === 'loading') {
    return (
      <StudioShell>
        <StudioLoadingState />
      </StudioShell>
    );
  }

  if (state === 'error' || !data) {
    return (
      <StudioShell>
        <StudioErrorState message={error ?? 'WE COULDN\'T LOAD THIS OPERATION. TRY AGAIN.'} onRetry={() => void reload()} />
      </StudioShell>
    );
  }

  const review = data.nextReview?.id === reviewId ? data.nextReview : null;

  return (
    <StudioShell>
      <div className="site00-studio-workspace site00-studio-review-detail">
        <header className="site00-studio-workspace__head">
          <Link to={site00StudioPath(projectSlug, 'reviews')} className="site00-studio-workspace__back">← REVIEWS</Link>
          <h1 className="site00-studio-workspace__title">{review?.title ?? 'REVIEW'}</h1>
        </header>

        {review ? (
          <div className="site00-studio-review-detail__body">
            <p className="site00-studio-review__subtitle">{review.subtitle}</p>
            {review.variantCount ? (
              <div className="site00-studio-review-directions" role="group" aria-label="DIRECTIONS">
                {['A', 'B', 'C'].slice(0, review.variantCount).map((label) => (
                  <button key={label} type="button" className="site00-studio-review-direction">
                    <span className="site00-studio-review-direction__label">{label}</span>
                    <span className="site00-studio-review-direction__hint">DIRECTION</span>
                  </button>
                ))}
              </div>
            ) : null}
            <div className="site00-studio-review-detail__actions">
              <button type="button" className="site00-studio-panel__cta" disabled>
                APPROVE →
              </button>
              <button type="button" className="site00-studio-panel__link site00-studio-review-detail__revision" disabled>
                REQUEST REVISION
              </button>
            </div>
            <p className="site00-studio-input-sub">APPROVAL ACTIONS RECORD STATE WHEN DELIVERABLES ARE READY FOR CLIENT DECISION.</p>
          </div>
        ) : (
          <p className="site00-studio-panel__empty">THIS REVIEW IS NOT AVAILABLE</p>
        )}
      </div>
    </StudioShell>
  );
}
