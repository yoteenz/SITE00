/**
 * P0.VR.4R1 — Projects header planet from canonical design asset binding.
 */

import { useDesignAssetBinding } from '../../hooks/useDesignAssetBinding';
import { Site00OrbitalMark } from '../auth/Site00OrbitalMark';

type ProjectsHeaderPlanetProps = {
  className?: string;
};

export function ProjectsHeaderPlanet({ className = '' }: ProjectsHeaderPlanetProps) {
  const { binding, loading } = useDesignAssetBinding();

  if (!loading && binding?.currentAssetUrl) {
    return (
      <div className={`site00-orbital-mark site00-projects-header-planet ${className}`.trim()} aria-hidden="true">
        <img
          src={binding.currentAssetUrl}
          alt=""
          className="site00-orbital-mark__img site00-projects-header-planet__img"
          decoding="async"
          fetchPriority="high"
          data-design-asset-slot="header-planet-icon"
          data-design-asset-version={binding.currentVersion}
        />
      </div>
    );
  }

  return <Site00OrbitalMark className={className} />;
}
