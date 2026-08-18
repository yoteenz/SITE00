import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SITE00_ROUTES } from '../config/routes';
import { useLocationsBackgroundUrl } from '../components/mobile/MobileEnvironmentBackground';
import { prefersReducedSite00Motion, useSwipeUp } from './useSwipeUp';

const SWIPE_NAV_DELAY_MS = 720;

/** Screen 00 → Screen 01 navigation with optional swipe transition overlay. */
export function useOriginLocationsTransition() {
  const navigate = useNavigate();
  const locationsBg = useLocationsBackgroundUrl();
  const [transitioning, setTransitioning] = useState(false);
  const transitioningRef = useRef(false);

  const goToLocations = useCallback(() => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;

    const finish = () => {
      navigate(SITE00_ROUTES.locations, { state: { fromSwipe: true } });
      transitioningRef.current = false;
      setTransitioning(false);
    };

    if (prefersReducedSite00Motion()) {
      finish();
      return;
    }

    setTransitioning(true);
    window.setTimeout(finish, SWIPE_NAV_DELAY_MS);
  }, [navigate]);

  const swipeHandlers = useSwipeUp({ onSwipeUp: goToLocations, disabled: transitioning });

  return { goToLocations, transitioning, locationsBg, swipeHandlers };
}
