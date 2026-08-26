import { useAstralWorld } from '../../context/AstralWorldContext';
import { AstralCinematicBg } from '../../components/AstralCinematicBg';

export default function AstralMallPage() {
  const { kiosks, readers, selectKiosk, joinKioskWait, selectedKioskId } = useAstralWorld();
  const mallReaders = readers.filter((r) => r.currentDestination === 'astral-mall');
  const selected = kiosks.find((k) => k.id === selectedKioskId);

  return (
    <>
      <div className="aw-hero" style={{ minHeight: 200 }}>
        <AstralCinematicBg variant="desktop-mall" className="aw-hero__bg" />
        <div className="aw-hero__content" style={{ minHeight: 200 }}>
          <p className="aw-label">Astréa · Destination</p>
          <h1 className="aw-display aw-display--hero">Astral Mall</h1>
          <p className="aw-muted">Fast · Fun · On the go</p>
        </div>
      </div>
      <section className="aw-card aw-card--gold">
        <h2 className="aw-display aw-display--section">Pick a Kiosk</h2>
        <div className="aw-kiosk-grid">
          {kiosks.map((k) => (
            <button
              key={k.id}
              type="button"
              className={`aw-kiosk${k.kioskState === 'CLOSED' ? ' aw-kiosk--disabled' : ''}${selectedKioskId === k.id ? ' aw-card--gold' : ''}`}
              disabled={k.kioskState === 'CLOSED'}
              onClick={() => selectKiosk(k.id)}
              aria-pressed={selectedKioskId === k.id}
            >
              <div>{k.label}</div>
              <div className="aw-muted">{k.durationMin} min</div>
              <div className="aw-kiosk__price">${k.priceUsd}</div>
              <div className="aw-kiosk__demo">{k.priceState}</div>
              <div className="aw-label">{k.kioskState.replace(/_/g, ' ')}</div>
            </button>
          ))}
        </div>
        {selected ? (
          <div style={{ marginTop: '0.75rem' }}>
            <p className="aw-muted">Kiosk: {selected.label} · {selected.kioskState}</p>
            {selected.kioskState === 'OPEN' ? (
              <button type="button" className="aw-btn-primary">Start Quick Read</button>
            ) : selected.kioskState === 'BUSY' ? (
              <button type="button" className="aw-btn-secondary" onClick={() => joinKioskWait(selected.id)}>Join Wait</button>
            ) : selected.kioskState === 'SHORT_WAIT' ? (
              <p className="aw-muted">On waitlist — prototype queue</p>
            ) : null}
            {selected.readerId ? (
              <p className="aw-muted">Reader: {readers.find((r) => r.id === selected.readerId)?.name ?? 'Any available'}</p>
            ) : null}
          </div>
        ) : null}
      </section>
      <section className="aw-card">
        <h2 className="aw-display aw-display--section">Readers at Mall · {mallReaders.length} active</h2>
        <div className="aw-avatar-row">
          {mallReaders.map((r) => (
            <div key={r.id} className="aw-avatar" title={r.name}>{r.avatarInitials}</div>
          ))}
        </div>
      </section>
    </>
  );
}
