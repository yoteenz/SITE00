import { Link } from 'react-router-dom';
import { SITE00_ORIGIN_COPY } from '../../config/status';
import { SITE00_ROUTES } from '../../config/routes';
import type { useOriginLocationsTransition } from '../../hooks/useOriginLocationsTransition';

type OriginMobileSwipeUpProps = {
  transition: ReturnType<typeof useOriginLocationsTransition>;
};

function ArrowUpIcon() {
  return (
    <svg
      className="site00-origin-mobile-swipe__arrow"
      width="16"
      height="20"
      viewBox="0 0 16 20"
      fill="none"
      aria-hidden="true"
    >
      <path d="M8 0V16M8 0L3 5M8 0L13 5" stroke="var(--site-red)" strokeWidth="1" />
    </svg>
  );
}

/** Origin homepage mobile — lower-center enter / swipe-up callout (approved reference). */
export function OriginMobileSwipeUp({ transition }: OriginMobileSwipeUpProps) {
  const copy = SITE00_ORIGIN_COPY.mobileSwipeUp;
  const { goToLocations, transitioning, locationsBg, swipeHandlers } = transition;

  return (
    <>
      <section
        className="site00-origin-mobile-swipe"
        aria-label="Swipe up to open SITE 00 locations directory"
        {...swipeHandlers}
      >
        <p className="site00-label site00-origin-mobile-swipe__eyebrow">{copy.eyebrow}</p>
        <p className="site00-label site00-origin-mobile-swipe__suffix">{copy.suffix}</p>
        <div className="site00-origin-mobile-swipe__connector" aria-hidden="true">
          <span className="site00-origin-mobile-swipe__connector-line" />
          <span className="site00-origin-mobile-swipe__connector-dot" />
          <span className="site00-origin-mobile-swipe__connector-line" />
        </div>
        <Link to={SITE00_ROUTES.enter} className="site00-origin-mobile-swipe__enter">
          {copy.enterLabel}
        </Link>
        <button type="button" className="site00-origin-mobile-swipe__swipe-btn" onClick={goToLocations}>
          {copy.swipeLabel}
        </button>
        <ArrowUpIcon />
      </section>

      {transitioning ? (
        <div className="site00-origin-swipe-transition site00-origin-swipe-transition--active" aria-hidden="true">
          <div
            className="site00-origin-swipe-transition__locations-preview"
            style={{ backgroundImage: `url("${locationsBg.replace(/"/g, '\\"')}")` }}
          />
        </div>
      ) : null}
    </>
  );
}
