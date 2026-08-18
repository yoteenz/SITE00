import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isLibraryHeroRefMapEnabled } from './library-home-hero-lock';

/** Dev toggle for hero coordinate mode — ?heroRefMap=1 */
export function LibraryHomeHeroRefMapToggle() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [on, setOn] = useState(isLibraryHeroRefMapEnabled());

  useEffect(() => {
    setOn(isLibraryHeroRefMapEnabled());
  }, [searchParams]);

  if (on) return null;

  return (
    <button
      type="button"
      className="assts-hero-ref-map-toggle"
      onClick={() => {
        const next = new URLSearchParams(searchParams);
        next.set('heroRefMap', '1');
        setSearchParams(next, { replace: true });
      }}
      aria-label="Enable hero coordinate debug mode"
    >
      HERO MAP
    </button>
  );
}
