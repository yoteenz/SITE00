/**
 * P0.VR.REPLICATION.3B — Vision literal NDX overview (multi-zone hero, authority-aligned host).
 */

import type { ReconstructionTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';
import { ShellFirstNdxOverviewTwin } from './ShellFirstNdxOverviewTwin.js';
import { useProjectOperatingState } from '../../hooks/useProjectOperatingState';
import '../../styles/site00-vision-literal-twin.css';

type Props = {
  projectSlug: string;
  session?: ReconstructionTwinSession;
};

function LiteralHeroBand({ projectSlug }: { projectSlug: string }) {
  const { state: operatingState } = useProjectOperatingState(projectSlug);
  const productionCards = operatingState?.inProduction ?? [];
  const focusTitle = productionCards[0]?.title ?? 'Current production focus';

  return (
    <section className="site00-vlt__hero-literal-wrap site00-sft__band" data-shell-band="hero-editorial" data-literal-hero="vision">
      <div className="site00-vlt__hero-literal">
        <div className="site00-vlt__left-copy-region" data-literal-subregion="left_copy_region">
          <p className="site00-vlt__hero-kicker">EDITORIAL</p>
          <p className="site00-vlt__hero-headline">{focusTitle.toUpperCase()}</p>
          <button type="button" className="site00-vlt__hero-cta">
            VIEW
          </button>
        </div>
        <div className="site00-vlt__center-image-region" data-literal-subregion="center_image_region">
          {['slice_a', 'slice_b', 'slice_c'].map((id) => (
            <div key={id} className="site00-vlt__image-slice site00-vlt__image-slice--missing" data-asset-slot={id}>
              <span className="site00-vlt__asset-tag">ASSET_MISSING</span>
            </div>
          ))}
        </div>
        <div className="site00-vlt__right-visual-region" data-literal-subregion="right_visual_region">
          <div className="site00-vlt__right-graphic" data-asset-slot="right_graphic" />
        </div>
      </div>
      <div className="site00-vlt__lime-ndx-region" data-literal-subregion="lime_ndx_region" aria-hidden="true" />
    </section>
  );
}

export function VisionLiteralNdxOverviewTwin({ projectSlug, session }: Props) {
  const subregions = session?.visionLiteralRegionSpecs?.find((s) => s.regionId === 'hero-editorial')?.subregions.length ?? 4;
  return (
    <div className="site00-vlt" data-vision-literal-twin="ndx-overview-mobile" data-hero-subregions={subregions}>
      <ShellFirstNdxOverviewTwin
        projectSlug={projectSlug}
        hostClassName="site00-vlt__host"
        heroOverride={<LiteralHeroBand projectSlug={projectSlug} />}
      />
    </div>
  );
}
