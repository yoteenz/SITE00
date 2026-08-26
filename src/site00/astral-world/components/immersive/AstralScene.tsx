import type { CSSProperties, ReactNode } from 'react';
import {
  cropToBackgroundStyle,
  getReferenceCrop,
  mobileCropKey,
  type ReferenceCropKey,
} from '../../../../../shared/site00-astral-world/referenceCropRegistry.js';

type AstralSceneProps = {
  crop: ReferenceCropKey;
  cropMobile?: ReferenceCropKey;
  className?: string;
  minHeight?: number | string;
  overlay?: boolean;
  children?: ReactNode;
  aspectRatio?: string;
  responsive?: boolean;
};

function sceneStyle(
  key: ReferenceCropKey,
  overlay: boolean,
  minHeight: number | string,
  aspectRatio?: string,
): CSSProperties {
  const spec = getReferenceCrop(key);
  return {
    ...cropToBackgroundStyle(spec, overlay),
    minHeight,
    aspectRatio: aspectRatio ?? spec.aspectRatio,
  };
}

export function AstralScene({
  crop,
  cropMobile,
  className = 'aw-scene',
  minHeight = 280,
  overlay = true,
  children,
  aspectRatio,
  responsive = true,
}: AstralSceneProps) {
  const mobileKey = cropMobile ?? (responsive ? mobileCropKey(crop) : crop);
  const useResponsive = responsive && mobileKey !== crop;

  if (useResponsive) {
    return (
      <div className={`${className} aw-scene--responsive`.trim()}>
        <div
          className="aw-scene aw-scene__layer aw-desktop-only"
          style={sceneStyle(crop, overlay, minHeight, aspectRatio)}
        >
          <div className="aw-scene__veil" aria-hidden />
        </div>
        <div
          className="aw-scene aw-scene__layer aw-mobile-only"
          style={sceneStyle(mobileKey, overlay, minHeight, aspectRatio)}
        >
          <div className="aw-scene__veil" aria-hidden />
        </div>
        {children ? <div className="aw-scene__content">{children}</div> : null}
      </div>
    );
  }

  return (
    <div className={className} style={sceneStyle(crop, overlay, minHeight, aspectRatio)}>
      <div className="aw-scene__veil" aria-hidden />
      {children ? <div className="aw-scene__content">{children}</div> : null}
    </div>
  );
}

export function AstralSceneOverlay({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`aw-scene-overlay ${className}`.trim()}>{children}</div>;
}
