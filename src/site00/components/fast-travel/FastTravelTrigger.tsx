import type { RefObject } from 'react';
import { Site00FastTravelIcon } from './Site00FastTravelIcon';

type FastTravelTriggerProps = {
  onOpen: () => void;
  expanded?: boolean;
  buttonRef?: RefObject<HTMLButtonElement>;
};

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
      <Site00FastTravelIcon className="site00-fast-travel-trigger__icon" size={24.2} />
    </button>
  );
}
