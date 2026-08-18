import type { RefObject } from 'react';
import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';
import { SITE00_FAST_TRAVEL_ICON_PATH } from '../../config/locations-directory';

type FastTravelTriggerProps = {
  onOpen: () => void;
  expanded?: boolean;
  buttonRef?: RefObject<HTMLButtonElement>;
};

const fastTravelIconUrl = resolveSite00PublicAsset(SITE00_FAST_TRAVEL_ICON_PATH);

/** Mobile header control — opens contextual Fast Travel (not the full directory). */
export function FastTravelTrigger({ onOpen, expanded = false, buttonRef }: FastTravelTriggerProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className="site00-fast-travel-trigger"
      aria-label="Open Fast Travel"
      aria-expanded={expanded}
      aria-controls="site00-fast-travel-panel"
      onClick={onOpen}
    >
      <img
        src={fastTravelIconUrl}
        alt=""
        className="site00-fast-travel-trigger__icon"
        width={22}
        height={22}
        decoding="async"
      />
    </button>
  );
}
