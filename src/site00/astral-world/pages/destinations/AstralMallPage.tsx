import { useState } from 'react';
import { useAstralWorld } from '../../context/AstralWorldContext';

export default function AstralMallPage() {
  const { kiosks, readers } = useAstralWorld();
  const [selected, setSelected] = useState<string | null>(null);
  const mallReaders = readers.filter((r) => r.currentDestination === 'astral-mall');

  return (
    <>
      <div className="aw-hero" style={{ minHeight: 200 }}>
        <div className="aw-hero__bg aw-hero__bg--pending" aria-hidden />
        <div className="aw-hero__content" style={{ minHeight: 200 }}>
          <p className="aw-label">Astréa · Destination</p>
          <h1 className="aw-display aw-display--hero">Astral Mall</h1>
          <p className="aw-muted">Fast · spontaneous · on-the-go readings</p>
        </div>
      </div>
      <section className="aw-card aw-card--gold">
        <h2 className="aw-display aw-display--section">Pick a Kiosk</h2>
        <div className="aw-kiosk-grid">
          {kiosks.map((k) => (
            <button
              key={k.id}
              type="button"
              className={`aw-kiosk${!k.available ? ' aw-kiosk--disabled' : ''}${selected === k.id ? ' aw-card--gold' : ''}`}
              disabled={!k.available}
              onClick={() => k.available && setSelected(k.id)}
              aria-pressed={selected === k.id}
            >
              <div>{k.label}</div>
              <div className="aw-muted">{k.durationMin} min</div>
              <div className="aw-kiosk__price">${k.priceUsd}</div>
              <div className="aw-kiosk__demo">{k.priceState}</div>
            </button>
          ))}
        </div>
        {selected ? <p className="aw-muted" style={{ marginTop: '0.75rem' }}>Kiosk selected — prototype queue (non-production)</p> : null}
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
