import { useEffect, useRef, useState } from 'react';
import { Site00LogoBlock } from '../shell/Site00LogoBlock';
import { FastTravelPanel } from '../fast-travel/FastTravelPanel';
import { FastTravelTrigger } from '../fast-travel/FastTravelTrigger';
import { AccessTargetMark } from './AccessTargetMark';

/** Mobile top bar — SITE 00 mark, target symbol, Fast Travel menu. */
export function AccessMobileHeader() {
  const [fastTravelOpen, setFastTravelOpen] = useState(false);
  const fastTravelTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!fastTravelOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFastTravelOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fastTravelOpen]);

  return (
    <>
      <header className="site00-access-header site00-access-header--mobile">
        <Site00LogoBlock showBracket={false} />
        <div className="site00-access-header__controls">
          <AccessTargetMark />
          <FastTravelTrigger
            onOpen={() => setFastTravelOpen(true)}
            expanded={fastTravelOpen}
            buttonRef={fastTravelTriggerRef}
          />
        </div>
      </header>
      <FastTravelPanel
        open={fastTravelOpen}
        onClose={() => setFastTravelOpen(false)}
        returnFocusRef={fastTravelTriggerRef}
      />
    </>
  );
}
