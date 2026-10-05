import type { ReactNode } from 'react';
import type { MallKiosk } from '../../../../../shared/site00-astral-world/types.js';
import { AstralPortrait } from './AstralPortrait';

type AstralKioskTrayProps = {
  open: boolean;
  onClose: () => void;
  kiosk: MallKiosk | null;
  readerName?: string | null;
  readerId?: string | null;
  readerInitials?: string;
  onStart?: () => void;
  onJoinWait?: () => void;
  children?: ReactNode;
};

/** Brass/gold mall placard tray — environment stays visible behind */
export function AstralKioskTray({
  open,
  onClose,
  kiosk,
  readerName,
  readerId,
  readerInitials,
  onStart,
  onJoinWait,
  children,
}: AstralKioskTrayProps) {
  if (!open || !kiosk) return null;

  return (
    <div className="aw-kiosk-tray-root" role="presentation">
      <button type="button" className="aw-kiosk-tray-backdrop" aria-label="Close kiosk" onClick={onClose} />
      <div className="aw-kiosk-tray" role="dialog" aria-modal="true" aria-label={kiosk.label}>
        <div className="aw-kiosk-tray__plate">
          <div className="aw-kiosk-tray__ornament" aria-hidden />
          <p className="aw-label">Mall Kiosk</p>
          <h2 className="aw-display aw-kiosk-tray__title">{kiosk.label}</h2>
          <p className="aw-muted">{kiosk.durationMin} min · ${kiosk.priceUsd} · {kiosk.kioskState.replace(/_/g, ' ')}</p>
          {readerId && readerName ? (
            <div className="aw-kiosk-tray__reader">
              <AstralPortrait personId={readerId} name={readerName} initials={readerInitials} size={44} showPresence />
              <span>{readerName}</span>
            </div>
          ) : null}
          {kiosk.kioskState === 'OPEN' ? (
            <button type="button" className="aw-btn-primary" onClick={onStart}>Start Quick Read</button>
          ) : kiosk.kioskState === 'BUSY' ? (
            <button type="button" className="aw-btn-secondary" onClick={onJoinWait}>Join Wait</button>
          ) : kiosk.kioskState === 'SHORT_WAIT' ? (
            <p className="aw-muted">On waitlist — prototype queue</p>
          ) : (
            <p className="aw-muted">Kiosk closed</p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
