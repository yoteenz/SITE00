import { useSite00DesktopArtboardPreview } from '../../components/shell/Site00DesktopArtboardContext';
import { Site00PublicShell } from '../../components/shell/Site00PublicShell';
import { EvolveHubMobileExperience } from '../../components/evolve/hub-mobile/EvolveHubMobileExperience';
import { EvolveHubDesktopExperience } from '../../components/evolve/hub-desktop/EvolveHubDesktopExperience';

export default function EvolveHubPage() {
  const isDesktopArtboard = useSite00DesktopArtboardPreview();

  return (
    <Site00PublicShell>
      <div className="site00-page site00-page--evolve-hub">
        {isDesktopArtboard ? <EvolveHubDesktopExperience /> : <EvolveHubMobileExperience />}
      </div>
    </Site00PublicShell>
  );
}
