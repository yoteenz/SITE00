import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { OverlayBody } from '../overlays/OverlayBody';
import { WsButton, WsIconButton } from '../shell/wsKit';
import { useFounderWorkspaceOverlay } from './OverlayContext';
import { OVERLAY_MODES, overlayGeometryForViewport, overlayTitle } from './overlayRegistry';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/** Kicker line above the headline: the subject of the overlay when the trigger passed one. */
function kickOf(payload?: Record<string, unknown>): string | null {
  const v = payload?.business_name ?? payload?.partner_label ?? payload?.module ?? payload?.task_title;
  return typeof v === 'string' && v.trim() ? v.trim().toUpperCase() : null;
}

/**
 * Shared overlay host — OPUS2 `ws-ov` container modes for all 40 families:
 * phone full-screen / bottom sheet / drawer / action sheet · tablet dialog / right sheet / popover / palette ·
 * desktop dialog / inspector sheet / popover / palette. Scrim, scroll lock, focus entry + trap + return, Escape,
 * unsaved-change confirmation, safe-area and z-index above navigation. Never undismissable: the close control and
 * Escape always work; only financial / destructive confirmations ignore scrim clicks.
 */
export function OverlayHost() {
  const { open, closeOverlay, setOverlayDirty, confirmingDiscard, cancelDiscard } = useFounderWorkspaceOverlay();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Focus entry: the first field, else the first action, else the panel itself.
  useLayoutEffect(() => {
    if (!open) return;
    const root = dialogRef.current;
    const first = root?.querySelector<HTMLElement>('.ws-ov__b input, .ws-ov__b textarea, .ws-ov__b ' + FOCUSABLE.split(', ')[0]) ?? root?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? root)?.focus();
  }, [open?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll lock on the workspace stage (the page scrolls inside .ws-stage, not the body).
  useEffect(() => {
    if (!open) return;
    const root = document.querySelector<HTMLElement>('.ws.ifw');
    root?.setAttribute('data-ifw-locked', '');
    return () => root?.removeAttribute('data-ifw-locked');
  }, [open]);

  if (!open) return null;

  const modes = OVERLAY_MODES[open.id];
  const geometry = overlayGeometryForViewport(open.id, viewportWidth);
  const tier = viewportWidth < 768 ? modes.m : viewportWidth < 1280 ? modes.t : modes.d;
  const popover = tier === 'popover';
  const title = modes.head ?? overlayTitle(open.id).toUpperCase();
  const kick = kickOf(open.payload);
  const labelId = `${open.id}-t`;

  const style: CSSProperties & Record<string, string | number> = { ['--w']: `${modes.w}px` };
  if (popover && open.anchor) {
    const left = modes.place === 'above-start' ? open.anchor.left : open.anchor.right - modes.w;
    style['--ax'] = `${Math.round(left)}px`;
    if (modes.place === 'above-start') {
      style.top = 'auto';
      style.bottom = `${Math.round(window.innerHeight - open.anchor.top + 8)}px`;
      style.maxHeight = `${Math.round(open.anchor.top - 24)}px`;
    } else {
      style['--ay'] = `${Math.round(open.anchor.bottom + 8)}px`;
    }
  }

  // Focus trap.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const nodes = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter((n) => n.offsetParent !== null);
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const showHead = modes.kind !== 'palette' && !(modes.kind === 'menu' && open.id === 'OL-06');

  return (
    <div className="ifw-ov-root" data-ifw-overlay={open.id} data-ifw-geometry={geometry} data-ifw-tier-mode={tier}>
      <button
        type="button"
        className={`ws-scrim ${popover ? 'ws-scrim--light' : ''}`.trim()}
        aria-label="CLOSE"
        tabIndex={-1}
        onClick={() => {
          if (!modes.scrimLocked) closeOverlay();
        }}
      />
      <div
        ref={dialogRef}
        className="ws-ov"
        role={modes.kind === 'menu' ? 'menu' : 'dialog'}
        aria-modal={modes.kind === 'menu' ? undefined : true}
        aria-labelledby={showHead ? labelId : undefined}
        aria-label={showHead ? undefined : overlayTitle(open.id).toUpperCase()}
        data-ol={open.id}
        data-kind={modes.kind}
        data-m={modes.m}
        data-t={modes.t}
        data-d={modes.d}
        style={style}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        {showHead && modes.kind !== 'insp' ? (
          <div className="ws-ov__h">
            <div>
              {kick ? <div className="ws-ov__kick">{kick}</div> : null}
              <h2 className="ws-h2" id={labelId}>
                {title}
                <i className="ws-period" />
              </h2>
            </div>
            <WsIconButton icon="close" label="CLOSE" onClick={() => closeOverlay()} />
          </div>
        ) : modes.kind === 'insp' ? (
          <span id={labelId} className="ifw-sr">
            {overlayTitle(open.id).toUpperCase()}
          </span>
        ) : null}
        {confirmingDiscard ? (
          <div className="ws-ov__b" role="alertdialog" aria-label="DISCARD UNSAVED CHANGES">
            <div className="ws-banner ws-banner--red" role="alert">
              <span>YOU HAVE UNSAVED CHANGES. CLOSING DISCARDS THEM — NOTHING WAS SAVED.</span>
            </div>
            <div className="ws-btn-row" style={{ justifyContent: 'flex-end' }}>
              <WsButton tone="out" onClick={cancelDiscard}>
                KEEP EDITING
              </WsButton>
              <WsButton tone="danger" onClick={() => closeOverlay(true)}>
                DISCARD CHANGES
              </WsButton>
            </div>
          </div>
        ) : null}
        <div style={confirmingDiscard ? { display: 'none' } : { display: 'contents' }}>
          <OverlayBody id={open.id} payload={open.payload} onClose={() => closeOverlay(true)} markDirty={setOverlayDirty} />
        </div>
      </div>
    </div>
  );
}
