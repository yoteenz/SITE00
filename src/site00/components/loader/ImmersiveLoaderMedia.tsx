import { memo, useCallback, useState } from 'react';
import { stripSite00BootShellBackground } from './site00LoaderBoot';
import { Site00LoaderAnimation } from './Site00LoaderAnimation';
import { Site00LoaderEnvironment, type Site00LoaderEnvironmentFit } from './Site00LoaderEnvironment';
import type { LoaderPresentation } from './loader-composition-resolver';

type ImmersiveLoaderMediaProps = {
  backgroundUrl: string;
  envFit: Site00LoaderEnvironmentFit;
  backgroundFocal: string;
  animationEnabled: boolean;
  mediaPresentation: LoaderPresentation;
  reducedMotion: boolean;
  onBackgroundLoad: () => void;
  onAnimationReady: () => void;
  onAnimationOpeningHold?: () => void;
  onAnimationError: (detail: unknown) => void;
};

/**
 * Media stack isolated from copy/progress re-renders (smooth progress creep runs ~60fps).
 * Layer 1 (static still) strips once the MP4 pauses on the opening frame.
 */
export const ImmersiveLoaderMedia = memo(function ImmersiveLoaderMedia({
  backgroundUrl,
  envFit,
  backgroundFocal,
  animationEnabled,
  mediaPresentation,
  reducedMotion,
  onBackgroundLoad,
  onAnimationReady,
  onAnimationOpeningHold,
  onAnimationError,
}: ImmersiveLoaderMediaProps) {
  const [staticBackgroundStripped, setStaticBackgroundStripped] = useState(false);

  const handleAnimationOpeningHold = useCallback(() => {
    stripSite00BootShellBackground();
    setStaticBackgroundStripped(true);
    onAnimationOpeningHold?.();
  }, [onAnimationOpeningHold]);

  const handleAnimationError = useCallback(
    (detail: unknown) => {
      onAnimationError(detail);
    },
    [onAnimationError],
  );

  const mediaClass = [
    'site00-immersive-loader__media',
    staticBackgroundStripped ? 'site00-immersive-loader__media--static-stripped' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={mediaClass} aria-hidden="true">
      {!staticBackgroundStripped ? (
        <Site00LoaderEnvironment
          backgroundUrl={backgroundUrl}
          viewport
          fit={envFit}
          mediaFocal={backgroundFocal}
          onBackgroundLoad={onBackgroundLoad}
        />
      ) : null}

      {animationEnabled ? (
        <Site00LoaderAnimation
          mediaPresentation={mediaPresentation}
          mediaFocal={backgroundFocal}
          reducedMotion={reducedMotion}
          onReady={onAnimationReady}
          onOpeningHold={handleAnimationOpeningHold}
          onError={handleAnimationError}
        />
      ) : null}
    </div>
  );
});
