import { useEffect, useRef, useState } from 'react';
import { OverlayBody } from '../overlays/OverlayBody';
import { useFounderWorkspaceOverlay } from './OverlayContext';
import { overlayGeometryForViewport, overlayTitle } from './overlayRegistry';

export function OverlayHost() {
  const { open, closeOverlay, setOverlayDirty } = useFounderWorkspaceOverlay();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = dialogRef.current;
    root?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus();
  }, [open]);

  if (!open) return null;

  const geometry = overlayGeometryForViewport(open.id, viewportWidth);
  const title = overlayTitle(open.id);

  return (
    <div className="ifw-overlay-host" data-ifw-overlay={open.id} data-ifw-geometry={geometry}>
      <button type="button" className="ifw-overlay-host__scrim" aria-label="Close dialog" onClick={() => closeOverlay()} />
      <div
        ref={dialogRef}
        className={`ifw-overlay-host__panel ifw-overlay-host__panel--${geometry}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ifw-overlay-title"
      >
        <header className="ifw-overlay-host__head">
          <h2 id="ifw-overlay-title" className="ifw-overlay-host__title">
            {title}
          </h2>
          <button type="button" className="ifw-btn ifw-btn--ghost" onClick={() => closeOverlay()}>
            Close
          </button>
        </header>
        <div className="ifw-overlay-host__body">
          <OverlayBody id={open.id} payload={open.payload} onClose={() => closeOverlay(true)} markDirty={setOverlayDirty} />
        </div>
      </div>
    </div>
  );
}
