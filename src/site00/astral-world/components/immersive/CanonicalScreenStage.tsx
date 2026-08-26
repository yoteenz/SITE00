import type { CSSProperties, ReactNode } from 'react';
import type { CanonicalStageConfig } from '../../../../../shared/site00-astral-world/screen-masters/canonicalScreenStage.js';

export type CanonicalScreenStageProps = {
  stage: CanonicalStageConfig;
  backgroundSrc: string;
  backgroundAlt?: string;
  className?: string;
  maxWidth?: number | string;
  children: ReactNode;
};

/**
 * P0.E.FT5.2D — One canonical coordinate plane per viewport.
 * Background and all overlay children share the same uniform stage transform.
 */
export function CanonicalScreenStage({
  stage,
  backgroundSrc,
  backgroundAlt = '',
  className = '',
  maxWidth,
  children,
}: CanonicalScreenStageProps) {
  const { referenceWidth, referenceHeight, screenId, backgroundSlot } = stage;

  const rootStyle: CSSProperties = {
    ['--aw-stage-ref-w' as string]: referenceWidth,
    ['--aw-stage-ref-h' as string]: referenceHeight,
    ...(maxWidth != null ? { maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth } : {}),
  };

  return (
    <div
      className={`aw-canonical-stage ${className}`.trim()}
      style={rootStyle}
      data-screen-master={screenId}
      data-background-slot={backgroundSlot}
      data-canonical-width={referenceWidth}
      data-canonical-height={referenceHeight}
    >
      <div className="aw-canonical-stage__inner">
        <img
          className="aw-canonical-stage__bg"
          src={backgroundSrc}
          alt={backgroundAlt}
          width={referenceWidth}
          height={referenceHeight}
          decoding="async"
          draggable={false}
        />
        <div className="aw-canonical-stage__overlays">{children}</div>
      </div>
    </div>
  );
}
