import type { CSSProperties, ReactNode } from 'react';
import {
  cropToBackgroundStyle,
  getReferenceCrop,
  mobileCropKey,
  type ReferenceCropKey,
} from '../../../../../shared/site00-astral-world/referenceCropRegistry.js';
import { useAstralAssets, useAstralSceneBackground } from '../../hooks/useAstralAssets';

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

function sceneStyleFromCrop(
  crop: ReferenceCropKey,
  overlay: boolean,
  minHeight: number | string,
  aspectRatio?: string,
  generatedStyle?: CSSProperties,
): CSSProperties {
  const spec = getReferenceCrop(crop);
  const base = generatedStyle ?? cropToBackgroundStyle(spec, overlay);
  return {
    ...base,
    minHeight,
    aspectRatio: aspectRatio ?? spec.aspectRatio,
  };
}

function AstralSceneLayer({
  crop,
  overlay,
  minHeight,
  aspectRatio,
  className,
}: {
  crop: ReferenceCropKey;
  overlay: boolean;
  minHeight: number | string;
  aspectRatio?: string;
  className: string;
}) {
  const { store } = useAstralAssets();
  const generatedStyle = useAstralSceneBackground(crop, store, overlay);
  return (
    <div
      className={className}
      style={sceneStyleFromCrop(crop, overlay, minHeight, aspectRatio, generatedStyle)}
    >
      <div className="aw-scene__veil" aria-hidden />
    </div>
  );
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
        <AstralSceneLayer
          crop={crop}
          overlay={overlay}
          minHeight={minHeight}
          aspectRatio={aspectRatio}
          className="aw-scene aw-scene__layer aw-desktop-only"
        />
        <AstralSceneLayer
          crop={mobileKey}
          overlay={overlay}
          minHeight={minHeight}
          aspectRatio={aspectRatio}
          className="aw-scene aw-scene__layer aw-mobile-only"
        />
        {children ? <div className="aw-scene__content">{children}</div> : null}
      </div>
    );
  }

  return (
    <div className={`${className} aw-scene--responsive`.trim()}>
      <AstralSceneLayer
        crop={crop}
        overlay={overlay}
        minHeight={minHeight}
        aspectRatio={aspectRatio}
        className="aw-scene"
      />
      {children ? <div className="aw-scene__content">{children}</div> : null}
    </div>
  );
}

export function AstralSceneOverlay({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`aw-scene-overlay ${className}`.trim()}>{children}</div>;
}
