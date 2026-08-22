import { CTRL_ROOM_MOBILE_COPY } from '../../../config/ctrl-room-mobile';
import type { CtrlRoomOperatingSignal } from '../../../hooks/useCtrlRoomData';

type CtrlRoomOperatingStatusProps = {
  signals: CtrlRoomOperatingSignal[];
};

function SignalIcon({ label }: { label: string }) {
  if (label === 'DOMAINS') {
    return (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="site00-ctrl-room-opstatus__icon">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="0.75" />
        <circle cx="16" cy="16" r="4" fill="var(--site-red)" />
        <line x1="16" y1="4" x2="16" y2="28" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
        <line x1="4" y1="16" x2="28" y2="16" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
      </svg>
    );
  }
  if (label === 'ACCOUNT') {
    return (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="site00-ctrl-room-opstatus__icon">
        <path d="M16 6 L26 12 V20 L16 26 L6 20 V12 Z" stroke="currentColor" strokeWidth="0.75" />
        <circle cx="16" cy="16" r="2.5" fill="#1a9e4a" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="site00-ctrl-room-opstatus__icon">
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="16" cy="16" r="2.5" fill="var(--site-red)" />
      <line x1="16" y1="4" x2="16" y2="28" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
      <line x1="4" y1="16" x2="28" y2="16" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
    </svg>
  );
}

export function CtrlRoomOperatingStatus({ signals }: CtrlRoomOperatingStatusProps) {
  return (
    <section className="site00-ctrl-room-opstatus" aria-label={CTRL_ROOM_MOBILE_COPY.operatingStatus.label}>
      <p className="site00-ctrl-room-opstatus__label">{CTRL_ROOM_MOBILE_COPY.operatingStatus.label}</p>
      <div className="site00-ctrl-room-opstatus__rail" role="list">
        {signals.map((signal, index) => (
          <div
            key={signal.label}
            className={`site00-ctrl-room-opstatus__cell ${signal.state === 'loading' ? 'site00-ctrl-room-opstatus__cell--loading' : ''}`.trim()}
            role="listitem"
          >
            {index > 0 ? <span className="site00-ctrl-room-opstatus__divider" aria-hidden="true" /> : null}
            <SignalIcon label={signal.label} />
            <div className="site00-ctrl-room-opstatus__copy">
              <span className="site00-ctrl-room-opstatus__name">{signal.label}</span>
              <span className="site00-ctrl-room-opstatus__value">{signal.value}</span>
              <span className="site00-ctrl-room-opstatus__sub">{signal.sublabel}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
