import { Link } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';

export default function AstralWorldAstreaPage() {
  const { occupancy } = useAstralWorld();
  return (
    <>
      <div className="aw-desktop-only aw-card aw-card--gold">
        <p className="aw-label">Flagship District</p>
        <h1 className="aw-display aw-display--hero">Astréa</h1>
        <p className="aw-muted">Social sanctuary within Astral World · {occupancy.current} present</p>
        <div className="aw-hero" style={{ minHeight: 200, marginTop: '1rem' }}>
          <div className="aw-hero__bg aw-hero__bg--pending" aria-hidden />
          <div className="aw-hero__content" style={{ minHeight: 200 }}>
            <p className="aw-muted">District panorama · REFERENCE_ASSET_PENDING</p>
          </div>
        </div>
        <div className="aw-dest-grid" style={{ marginTop: '1rem' }}>
          <Link to="/projects/astral-world/experience/astrea/tarot-suite" className="aw-dest-card aw-dest-card--suite"><strong>Tarot Suite</strong></Link>
          <Link to="/projects/astral-world/experience/astrea/astral-mall" className="aw-dest-card aw-dest-card--mall"><strong>Astral Mall</strong></Link>
          <Link to="/projects/astral-world/experience/astrea/coffee-shop" className="aw-dest-card aw-dest-card--coffee"><strong>Coffee Shop</strong></Link>
        </div>
      </div>
      <div className="aw-mobile-only aw-mobile-screen">
        <h1 className="aw-display">Astréa</h1>
        <p className="aw-muted">{occupancy.current} here now</p>
        <div className="aw-dest-grid">
          <Link to="/projects/astral-world/experience/astrea/tarot-suite" className="aw-dest-card aw-dest-card--suite"><strong>Tarot Suite</strong></Link>
          <Link to="/projects/astral-world/experience/astrea/coffee-shop" className="aw-dest-card aw-dest-card--coffee"><strong>Coffee Shop</strong></Link>
          <Link to="/projects/astral-world/experience/astrea/astral-mall" className="aw-dest-card aw-dest-card--mall"><strong>Astral Mall</strong></Link>
        </div>
      </div>
    </>
  );
}
