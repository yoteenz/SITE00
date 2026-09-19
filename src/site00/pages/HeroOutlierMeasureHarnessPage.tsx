/**
 * Dev-only Playwright harness — live DOM hero measurement (twin forensic shell, no auth).
 */

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { buildDevHeroMeasureSession } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R4R1/buildDevHeroMeasureSession.js';
import { ForensicBlueprintNdxOverviewTwin } from '../components/reconstruction/ForensicBlueprintNdxOverviewTwin.js';
import '../styles/site00-forensic-blueprint-twin.css';

export default function HeroOutlierMeasureHarnessPage() {
  const session = buildDevHeroMeasureSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location.search.includes('blueprintDebug=hero')) {
      navigate(
        { pathname: location.pathname, search: '?blueprintDebug=hero', hash: '#hero-inspection' },
        { replace: true },
      );
    }
  }, [location.pathname, location.search, navigate]);

  return (
    <div className="site00-fb-measure-harness" style={{ width: 375, margin: '0 auto' }}>
      <ForensicBlueprintNdxOverviewTwin projectSlug="ndxbook" session={session} heroMeasureBaselineOnly />
    </div>
  );
}
