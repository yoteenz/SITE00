import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { SITE00_ROUTES } from '../../../config/routes';
import type { SpatialRoomId } from '../../../builder-experience/spatialStudio/types';
type Props = {
  room: SpatialRoomId;
  roomNumber: string;
  roomName: string;
  title: string;
  subtitle: string;
  progressStep: number;
  progressTotal: number;
  scopeLabel: string;
  onBack?: () => void;
  primaryAction?: { label: string; onClick: () => void; disabled?: boolean };
  secondaryAction?: { label: string; onClick: () => void };
  stage: ReactNode;
  controls: ReactNode;
  footerNote?: string;
};

export function BuilderSpatialShell({
  room,
  roomNumber,
  roomName,
  title,
  subtitle,
  progressStep,
  progressTotal,
  scopeLabel,
  onBack,
  primaryAction,
  secondaryAction,
  stage,
  controls,
  footerNote,
}: Props) {
  return (
    <div className="bldr-spatial-shell" data-room={room}>
      <header className="bldr-spatial-shell__header">
        <div className="bldr-spatial-shell__brand">
          <Link to={SITE00_ROUTES.origin} className="bldr-spatial-shell__wordmark">
            SITE 00
          </Link>
          <span className="bldr-spatial-shell__product">BUILDER</span>
        </div>
        <button type="button" className="bldr-spatial-shell__menu" aria-label="Open menu">
          <span />
          <span />
        </button>
      </header>
      <p className="bldr-spatial-shell__room-id">
        <strong>{roomNumber}</strong> — {roomName}
      </p>

      <section className="bldr-spatial-shell__copy">
        <h1 className="bldr-spatial-shell__title">{title}</h1>
        <p className="bldr-spatial-shell__subtitle">{subtitle}</p>
      </section>

      <div className="bldr-spatial-shell__stage-wrap">{stage}</div>
      <div className="bldr-spatial-shell__controls">{controls}</div>

      <footer className="bldr-spatial-shell__footer">
        <div className="bldr-spatial-shell__progress" aria-label={`Room ${progressStep} of ${progressTotal}`}>
          <span className="bldr-spatial-shell__progress-label">
            {String(progressStep).padStart(2, '0')} / {String(progressTotal).padStart(2, '0')} {roomName}
          </span>
          <div className="bldr-spatial-shell__progress-track">
            <div
              className="bldr-spatial-shell__progress-fill"
              style={{ width: `${(progressStep / progressTotal) * 100}%` }}
            />
          </div>
        </div>
        <p className="bldr-spatial-shell__scope">{scopeLabel}</p>
        <div className="bldr-spatial-shell__actions">
          {onBack ? (
            <button type="button" className="bldr-spatial-shell__btn bldr-spatial-shell__btn--ghost" onClick={onBack}>
              BACK
            </button>
          ) : null}
          {secondaryAction ? (
            <button type="button" className="bldr-spatial-shell__btn bldr-spatial-shell__btn--ghost" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </button>
          ) : null}
          {primaryAction ? (
            <button
              type="button"
              className="bldr-spatial-shell__btn bldr-spatial-shell__btn--primary"
              disabled={primaryAction.disabled}
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </button>
          ) : null}
        </div>
        {footerNote ? <p className="bldr-spatial-shell__footnote">{footerNote}</p> : null}
      </footer>
    </div>
  );
}
