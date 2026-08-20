import { useState } from 'react';
import { hasFastTravelDestinationArt, resolveFastTravelDestinationArtUrl } from '../../config/fast-travel-assets';

type FastTravelDestinationArtProps = {
  destinationId: string;
};

/** Decorative UP NEXT illustration — does not intercept pointer events. */
export function FastTravelDestinationArt({ destinationId }: FastTravelDestinationArtProps) {
  const [failed, setFailed] = useState(false);
  const src = resolveFastTravelDestinationArtUrl(destinationId);
  const nudgeDown = destinationId === 'sign-in' || destinationId === 'create';
  const artClass = `site00-fast-travel__dest-art${nudgeDown ? ' site00-fast-travel__dest-art--idnty-entry' : ''}`.trim();

  if (!src || failed || !hasFastTravelDestinationArt(destinationId)) {
    return <span className={artClass} aria-hidden="true" />;
  }

  return (
    <span className={artClass} aria-hidden="true">
      <img
        className="site00-fast-travel__dest-art__img"
        src={src}
        alt=""
        decoding="async"
        loading="eager"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
