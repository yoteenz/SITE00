import { Link } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';
import { DESTINATION_PURPOSES } from '../../../../shared/site00-astral-world/types.js';

export default function AstralWorldAstreaPage() {
  const { occupancy, path, readers, friends, tables, kiosks } = useAstralWorld();
  const readersOnline = readers.filter((r) => r.presence !== 'OFFLINE').length;
  const friendsHere = friends.length;
  const activeTables = tables.filter((t) => t.occupants.length > 0).length;
  const openKiosks = kiosks.filter((k) => k.kioskState !== 'CLOSED').length;
  const privateReadings = readers.filter((r) => r.presence === 'READING_NOW').length;

  return (
    <>
      <div className="aw-hero" style={{ minHeight: 200 }}>
        <div className="aw-hero__bg aw-hero__bg--pending" aria-hidden />
        <div className="aw-hero__content" style={{ minHeight: 200 }}>
          <p className="aw-label">You are entering</p>
          <h1 className="aw-display aw-display--hero">Astréa</h1>
          <p className="aw-muted">Flagship district · {occupancy.current} souls here now</p>
        </div>
      </div>
      <section className="aw-card aw-card--gold">
        <h2 className="aw-display aw-display--section">District Activity</h2>
        <div className="aw-value-strip" style={{ marginTop: 0 }}>
          <span>{readersOnline} readers online</span>
          <span>{activeTables} tables active</span>
          <span>{privateReadings} private readings</span>
          <span>{openKiosks} kiosks open</span>
          <span>{friendsHere} friends here</span>
        </div>
      </section>
      <div className="aw-dest-grid">
        {DESTINATION_PURPOSES.map((d) => (
          <Link key={d.slug} to={path(`astrea/${d.slug}`)} className={`aw-dest-card aw-dest-card--${d.slug.split('-')[0]}`}>
            <strong>{d.label}</strong>
            <span className="aw-muted">{d.purpose}</span>
          </Link>
        ))}
      </div>
      <p className="aw-muted aw-desktop-only">Future districts remain structurally possible beyond Astréa.</p>
    </>
  );
}
