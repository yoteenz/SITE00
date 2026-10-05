import { useMemo } from 'react';
import type { ViewportLabPreset } from '../../../../shared/site00-viewport-lab/presets.js';
import {
  computePreviewScale,
  effectiveViewportSize,
  type ViewportLabOrientation,
  type ViewportLabZoomMode,
} from '../../../../shared/site00-viewport-lab/viewportLabLogic.js';

type Props = {
  src: string;
  preset: ViewportLabPreset;
  orientation: ViewportLabOrientation;
  zoom: ViewportLabZoomMode;
  workspaceWidth: number;
  workspaceHeight: number;
  refreshKey: string;
  showSafeArea: boolean;
  title?: string;
};

export function ViewportLabPreviewFrame({
  src,
  preset,
  orientation,
  zoom,
  workspaceWidth,
  workspaceHeight,
  refreshKey,
  showSafeArea,
  title = 'Client app preview',
}: Props) {
  const { width, height } = useMemo(
    () => effectiveViewportSize(preset, orientation),
    [preset, orientation],
  );
  const scale = useMemo(
    () =>
      computePreviewScale({
        frameWidth: width,
        frameHeight: height,
        workspaceWidth,
        workspaceHeight,
        zoom,
      }),
    [width, height, workspaceWidth, workspaceHeight, zoom],
  );
  const safe = preset.safeArea;

  return (
    <div
      className="vl-preview-stage"
      data-testid="viewport-lab-preview-stage"
      style={{ width: workspaceWidth, height: workspaceHeight }}
    >
      <div
        className="vl-preview-scaler"
        style={{
          width: width * scale,
          height: height * scale,
        }}
      >
        <div
          className="vl-preview-frame-outer"
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          data-viewport-width={width}
          data-viewport-height={height}
          data-scale={scale}
        >
          <iframe
            key={refreshKey}
            title={title}
            src={src}
            className="vl-preview-iframe"
            data-testid="viewport-lab-iframe"
            width={width}
            height={height}
          />
          {showSafeArea && safe ?
            <div className="vl-safe-area" aria-hidden data-testid="viewport-lab-safe-area">
              <div className="vl-safe-area__top" style={{ height: safe.top }} />
              <div className="vl-safe-area__bottom" style={{ height: safe.bottom }} />
              {safe.left > 0 ?
                <div className="vl-safe-area__left" style={{ width: safe.left }} />
              : null}
              {safe.right > 0 ?
                <div className="vl-safe-area__right" style={{ width: safe.right }} />
              : null}
            </div>
          : null}
        </div>
      </div>
    </div>
  );
}
