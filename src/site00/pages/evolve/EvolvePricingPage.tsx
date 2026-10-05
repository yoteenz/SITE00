import { useSite00DesktopArtboardPreview } from '../../components/shell/Site00DesktopArtboardContext';
import { Site00PublicShell } from '../../components/shell/Site00PublicShell';
import { EvolvePricingDesktopExperience } from '../../components/evolve/pricing/desktop/EvolvePricingDesktopExperience';
import { EvolvePricingMobileExperience } from '../../components/evolve/pricing/mobile/EvolvePricingMobileExperience';
import '../../styles/site00-evolve-pricing.css';

export default function EvolvePricingPage() {
  const isDesktopArtboard = useSite00DesktopArtboardPreview();

  return (
    <Site00PublicShell>
      <div className="site00-page site00-page--evolve-pricing">
        {isDesktopArtboard ? <EvolvePricingDesktopExperience /> : <EvolvePricingMobileExperience />}
      </div>
    </Site00PublicShell>
  );
}
