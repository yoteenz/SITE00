import type { ReactNode } from 'react';
import { useFounderWorkspaceOverlay } from '../../overlay/OverlayContext';
import { OVERLAY_META, type RegisteredOverlayId } from '../../overlay/overlayRegistry';
import { WsBanner, WsButton } from '../../shell/wsKit';

type Props = {
  id: RegisteredOverlayId;
  lede?: ReactNode;
  blockedReason?: ReactNode;
  error?: string | null;
  children?: ReactNode;
  primaryLabel?: string;
  primaryDisabled?: boolean;
  primaryTone?: '' | 'red' | 'out' | 'danger';
  primaryArrow?: boolean;
  busy?: boolean;
  onPrimary?: () => void;
  /** Hide the primary action (read-only families). */
  noPrimary?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Left-aligned note in the footer (e.g. "NO EMAIL IS SENT"). */
  footNote?: ReactNode;
  /** Extra footer actions placed before the secondary/primary pair. */
  extra?: ReactNode;
  onClose: () => void;
};

/**
 * Overlay body + footer in the OPUS2 grammar (`ws-ov__b` / `ws-ov__f`). The host renders the head.
 * Cancel goes through unsaved-change protection; the primary action is disabled (never hidden) while blocked,
 * and shows a busy state while the server request is in flight.
 */
export function OverlayFormShell({
  id,
  lede,
  blockedReason,
  error,
  children,
  primaryLabel = 'CLOSE',
  primaryDisabled,
  primaryTone = '',
  primaryArrow = false,
  busy = false,
  onPrimary,
  noPrimary = false,
  secondaryLabel = 'CANCEL',
  onSecondary,
  footNote,
  extra,
  onClose,
}: Props) {
  const { closeOverlay } = useFounderWorkspaceOverlay();
  const meta = OVERLAY_META[id];
  const kind = meta.blockedByPolicy ? 'BLOCKED BY POLICY' : meta.blockedByBackend ? 'BLOCKED · BACKEND NOT BUILT' : 'UNAVAILABLE';
  return (
    <>
      <div className="ws-ov__b" data-overlay-body={id}>
        {lede ? (
          <p className="ws-meta" style={{ lineHeight: 1.55, color: 'var(--ws-ink-2)' }}>
            {lede}
          </p>
        ) : null}
        {blockedReason ? (
          <WsBanner tone="policy" icon="lock">
            {kind} · {blockedReason}
          </WsBanner>
        ) : null}
        {children}
        {error ? (
          <WsBanner tone="red" icon="warning">
            NOT SAVED — THE SERVER DID NOT CONFIRM. NOTHING WAS CHANGED. <span className="ws-data">{error}</span>
          </WsBanner>
        ) : null}
      </div>
      <div className="ws-ov__f">
        {footNote ? (
          <span className="ws-meta" style={{ marginRight: 'auto', alignSelf: 'center' }}>
            {footNote}
          </span>
        ) : null}
        {extra}
        <WsButton tone="out" onClick={onSecondary ?? (() => closeOverlay())}>
          {secondaryLabel.toUpperCase()}
        </WsButton>
        {noPrimary ? null : (
          <WsButton tone={primaryTone} arrow={primaryArrow} busy={busy} disabled={primaryDisabled || Boolean(blockedReason)} onClick={onPrimary ?? onClose}>
            {primaryLabel.toUpperCase()}
          </WsButton>
        )}
      </div>
    </>
  );
}
