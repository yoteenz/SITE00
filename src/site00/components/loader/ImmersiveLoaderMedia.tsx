import { memo, useCallback } from 'react';
import { Site00LoaderAnimation } from './Site00LoaderAnimation';
import { Site00LoaderEnvironment, type Site00LoaderEnvironmentFit } from './Site00LoaderEnvironment';
import type { LoaderPresentation } from './loader-composition-resolver';

type ImmersiveLoaderMediaProps = {
  backgroundUrl: string;
  envFit: Site00LoaderEnvironmentFit;
  backgroundFocal: string;
  animationFocal: string;
  animationEnabled: boolean;
  mediaPresentation: LoaderPresentation;
  reducedMotion: boolean;
  onBackgroundLoad: () => void;
  onAnimationReady: () => void;
  onAnimationError: (detail: unknown) => void;
};

/**
 * Media stack isolated from copy/progress re-renders (smooth progress creep runs ~60fps).
 * Inline object-position on img/video is the sole focal source — matches debug inspection.
 */
export const ImmersiveLoaderMedia = memo(function ImmersiveLoaderMedia({
  backgroundUrl,
  envFit,
  backgroundFocal,
  animationFocal,
  animationEnabled,
  mediaPresentation,
  reducedMotion,
  onBackgroundLoad,
  onAnimationReady,
  onAnimationError,
}: ImmersiveLoaderMediaProps) {
  const handleAnimationError = useCallback(
    (detail: unknown) => {
      onAnimationError(detail);
    },
    [onAnimationError],
  );

  return (
    <div className="site00-immersive-loader__media" aria-hidden="true">
      <Site00LoaderEnvironment
        backgroundUrl={backgroundUrl}
        viewport
        fit={envFit}
        mediaFocal={backgroundFocal}
        onBackgroundLoad={onBackgroundLoad}
      />

      {animationEnabled ? (
        <Site00LoaderAnimation
          mediaPresentation={mediaPresentation}
          mediaFocal={animationFocal}
          reducedMotion={reducedMotion}
          onReady={onAnimationReady}
          onError={handleAnimationError}
        />
      ) : null}
    </div>
  );
});
