import { Link } from 'react-router-dom';
import { Site00ComplexPageShell } from '../../components/experience/Site00ComplexPageShell';
import { SITE00_ROUTES } from '../../config/routes';

export default function BrandPage() {
  return (
    <Site00ComplexPageShell
      pageClassName="site00-page--brand"
      pageLabel="BRAND"
      title="BRAND"
      subtitle="BRAND EXPERIENCE TERMINAL — CREATIVE DIRECTION REQUIRED."
      reviewFlag="CREATIVE_DIRECTION_REQUIRED"
      primarySlot={
        <div className="site00-complex-shell__placeholder-grid">
          <div className="site00-system-panel">
            <p className="site00-label-red">BRAND PANEL SLOT</p>
            <p className="site00-body">RESERVED FOR IDENTITY BRAND PANEL INTEGRATION OR DEDICATED BRAND TERMINAL.</p>
          </div>
          <div className="site00-system-panel">
            <p className="site00-label-red">VISUAL DIRECTION SLOT</p>
            <p className="site00-body">NO AUTO ART DIRECTION — FOUNDER REVIEW REQUIRED.</p>
          </div>
        </div>
      }
      secondarySlot={
        <p className="site00-body">
          BEGIN IDENTITY DISCOVERY AT{' '}
          <Link to={SITE00_ROUTES.idntyState} className="site00-link-red">
            IDNTY STATE →
          </Link>
        </p>
      }
    />
  );
}
