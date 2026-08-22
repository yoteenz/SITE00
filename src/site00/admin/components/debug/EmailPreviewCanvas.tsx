import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { measureEmailPreviewScaleBox } from '../../utils/emailPreviewScale';

type EmailPreviewCanvasProps = {
  html: string;
  canonicalWidth: number;
  minHeight: number;
  /** Horizontal padding inside the stage (each side). */
  stagePadding?: number;
};

/**
 * Debug-only email preview shell.
 * Renders email HTML at canonical width inside an iframe, then scales the canvas
 * to fit the available viewport without clipping or horizontal drift.
 * Iframe height follows document content to avoid false empty preview space.
 */
export function EmailPreviewCanvas({
  html,
  canonicalWidth,
  minHeight,
  stagePadding = 0,
}: EmailPreviewCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [contentHeight, setContentHeight] = useState(minHeight);

  const measureIframe = useCallback(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc?.body) return;
    const next = Math.max(minHeight, doc.documentElement.scrollHeight, doc.body.scrollHeight);
    setContentHeight((prev) => (Math.abs(prev - next) > 2 ? next : prev));
  }, [minHeight]);

  const effectiveHeight = contentHeight;

  const [box, setBox] = useState(() => {
    const initialWidth =
      typeof window !== 'undefined' ? window.innerWidth : canonicalWidth;
    return measureEmailPreviewScaleBox(initialWidth, canonicalWidth, effectiveHeight, stagePadding);
  });

  useLayoutEffect(() => {
    setContentHeight(minHeight);
  }, [html, minHeight]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      setBox(measureEmailPreviewScaleBox(stage.clientWidth, canonicalWidth, effectiveHeight, stagePadding));
    };

    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : undefined;
    ro?.observe(stage);
    window.addEventListener('resize', measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [canonicalWidth, effectiveHeight, stagePadding]);

  return (
    <div className="site00-email-debug-preview-stage" ref={stageRef}>
      <div
        className="site00-email-debug-preview-slot"
        style={{ width: box.scaledWidth, height: box.scaledHeight }}
      >
        <div
          className="site00-email-debug-preview-scaler"
          style={{
            width: canonicalWidth,
            height: effectiveHeight,
            transform: `scale(${box.scale})`,
            transformOrigin: 'top left',
          }}
        >
          <div className="site00-email-debug-inbox__frame" style={{ width: canonicalWidth }}>
            <iframe
              ref={iframeRef}
              title="Email preview"
              srcDoc={html}
              sandbox=""
              scrolling="no"
              onLoad={measureIframe}
              style={{
                width: canonicalWidth,
                height: effectiveHeight,
                border: 0,
                display: 'block',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
