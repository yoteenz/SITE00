import type { ReactNode } from 'react';
import { OVERLAY_META, type RegisteredOverlayId } from '../../overlay/overlayRegistry';

type Props = {
  id: RegisteredOverlayId;
  lede?: string;
  blockedReason?: string;
  error?: string | null;
  children?: ReactNode;
  primaryLabel?: string;
  primaryDisabled?: boolean;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onClose: () => void;
};

export function OverlayFormShell({
  id,
  lede,
  blockedReason,
  error,
  children,
  primaryLabel = 'Close',
  primaryDisabled,
  onPrimary,
  secondaryLabel = 'Cancel',
  onSecondary,
  onClose,
}: Props) {
  const meta = OVERLAY_META[id];
  return (
    <div className="ifw-overlay-form" data-overlay-body={id}>
      {lede ? <p className="ifw-lede">{lede}</p> : null}
      {blockedReason ? (
        <p className="ifw-blocked-panel__title" role="status">
          {meta.blockedByPolicy ? 'Blocked by policy' : meta.blockedByBackend ? 'Blocked by backend' : 'Unavailable'}
        </p>
      ) : null}
      {blockedReason ? <p className="ifw-muted">{blockedReason}</p> : null}
      {error ? (
        <p role="alert" className="ifw-inline-error">
          {error}
        </p>
      ) : null}
      {children}
      <footer className="ifw-overlay-form__actions">
        <button type="button" className="ifw-btn ifw-btn--ghost" onClick={onSecondary ?? onClose}>
          {secondaryLabel}
        </button>
        <button
          type="button"
          className="ifw-btn ifw-btn--primary"
          disabled={primaryDisabled || Boolean(blockedReason)}
          onClick={onPrimary ?? onClose}
        >
          {primaryLabel}
        </button>
      </footer>
    </div>
  );
}
