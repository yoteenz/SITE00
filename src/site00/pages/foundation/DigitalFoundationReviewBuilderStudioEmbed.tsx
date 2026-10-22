import { templateSystemEnabled } from '../../../studioos/estimation/flags';
import { SITE00_ROUTES } from '../../config/routes';
import { studioPathForReviewRoom } from '../../builder-studio/studioReviewSample';
import { reviewAnchorForView, scrollToReviewAnchor } from './reviewLinks';
import { APPROVED_FOUNDATION_BUILDER_SOURCE } from './digitalFoundationReviewRegistry';

/** Hybrid spatial studio room embedded on `/foundation/review` (sample mode — no persistence). */
export default function DigitalFoundationReviewBuilderStudioEmbed({
  anchorId,
  room,
}: {
  anchorId: string;
  room: string;
}) {
  const segment = studioPathForReviewRoom(room);
  const src = `${SITE00_ROUTES.bldrSpatialStudio}/${segment}?reviewRoom=${encodeURIComponent(room)}`;

  if (!templateSystemEnabled()) {
    return (
      <article className="df-review__item df-review__item--stage" id={anchorId} data-review-anchor={anchorId}>
        <div className="df-review__mark">
          <p className="df-review__label">{room} · HYBRID BUILDER</p>
        </div>
        <p className="df-review__wait df-review__wait--panel">
          BUILDER STUDIO PREVIEW REQUIRES <code>VITE_SITE00_TEMPLATE_SYSTEM_V1=1</code> (CLOUD DEV PREVIEW). P03 CONFIGURATOR
          REMAINS THE IDNTY FOUNDATION BUILDER: <code>{APPROVED_FOUNDATION_BUILDER_SOURCE}</code>.
        </p>
        <button
          type="button"
          className="df-review__route-name df-review__route-name--cta"
          onClick={() => scrollToReviewAnchor(reviewAnchorForView('P03'))}
        >
          OPEN P03 CONFIGURATOR
        </button>
      </article>
    );
  }

  return (
    <article className="df-review__item df-review__item--stage df-review__item--studio" id={anchorId} data-review-anchor={anchorId}>
      <div className="df-review__mark">
        <p className="df-review__label">{room} · HYBRID SPATIAL BUILDER</p>
        <a className="df-review__direct" href={`#${anchorId}`}>
          #{anchorId}
        </a>
      </div>
      <p className="df-review__sim df-review__sim--inline">DESIGN REVIEW · SAMPLE MODE · NO SAVE</p>
      <iframe className="df-review__studio" title={`Builder studio ${room}`} src={src} loading="lazy" />
    </article>
  );
}
