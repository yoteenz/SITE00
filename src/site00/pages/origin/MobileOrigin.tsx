import { EnvironmentShell } from '../../components/environment/EnvironmentShell';
import { OriginMobileSwipeUp } from '../../components/homepage/OriginMobileSwipeUp';
import { StatusStrip } from '../../components/homepage/StatusStrip';
import { Site00MobileShell } from '../../components/mobile/Site00MobileShell';
import { SITE00_ORIGIN_COPY } from '../../config/status';
import { useOriginLocationsTransition } from '../../hooks/useOriginLocationsTransition';

/** Approved mobile Origin — 9:16 environment, hero, swipe-up, bottom nav. No desktop chrome. */
export function MobileOrigin() {
  const locationsTransition = useOriginLocationsTransition();

  return (
    <EnvironmentShell environmentId="ORIGIN_ENVIRONMENT">
      <div className="site00-origin-page site00-origin-page--mobile-layout">
        <Site00MobileShell activeNav="origin" showEnvironmentBackground={false}>
          <div
            className="site00-origin-swipe-surface"
            aria-hidden="true"
            {...locationsTransition.swipeHandlers}
          />
          <div className="site00-home-stage">
            <aside className="site00-home-hero" aria-label="Origin messaging">
              <p className="site00-label site00-home-hero__eyebrow">{SITE00_ORIGIN_COPY.headlineLine1}</p>
              <h1 className="site00-heading-xl">{SITE00_ORIGIN_COPY.headlineLine2}</h1>
              <p className="site00-tagline site00-home-hero__tagline">{SITE00_ORIGIN_COPY.tagline}</p>
            </aside>
            <OriginMobileSwipeUp transition={locationsTransition} />
          </div>
          <StatusStrip layout="mobile" />
        </Site00MobileShell>
      </div>
    </EnvironmentShell>
  );
}
