/**
 * P0.VR.REPLICATION.3B/3C — Vision literal NDX overview with bound hero assets.
 */

import type { CSSProperties } from 'react';
import type { ReconstructionTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';
import type { ReplicationAssetSlot } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3c/types.js';
import { ShellFirstNdxOverviewTwin } from './ShellFirstNdxOverviewTwin.js';
import { HeroMaterializedSliceImage } from './HeroMaterializedSliceImage.js';
import { useProjectOperatingState } from '../../hooks/useProjectOperatingState';
import { HERO_MATERIALIZATION_PROOF_SLOT_ID } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3cR1/constants.js';
import { GeometryGridOverlay } from './GeometryGridOverlay.js';
import '../../styles/site00-vision-literal-twin.css';

type Props = {
  projectSlug: string;
  session?: ReconstructionTwinSession;
  executed?: boolean;
};

function slotMap(slots: ReplicationAssetSlot[] | null | undefined): Map<string, ReplicationAssetSlot> {
  return new Map((slots ?? []).map((s) => [s.slotId, s]));
}

function LiteralHeroBand({
  projectSlug,
  slots,
  executed,
}: {
  projectSlug: string;
  slots: Map<string, ReplicationAssetSlot>;
  executed: boolean;
}) {
  const { state: operatingState } = useProjectOperatingState(projectSlug);
  const productionCards = operatingState?.inProduction ?? [];
  const focusTitle = productionCards[0]?.title ?? 'INDEX BOOK · FOUNDER PILOT';

  const renderSlice = (id: string) => {
    const slot = slots.get(id);
    if (slot?.selectedStrategy === 'PROCEDURAL_DOM_GRAPHIC') {
      return <div key={id} className="site00-vlt__image-slice site00-vlt__image-slice--procedural" data-asset-slot={id} />;
    }
    const materialized = slot?.materializedPublicUrl ?? null;
    if (id === HERO_MATERIALIZATION_PROOF_SLOT_ID && materialized) {
      return (
        <HeroMaterializedSliceImage
          key={id}
          slotId={id}
          src={materialized}
          objectPosition={slot?.cropSpec?.backgroundPosition ?? 'center'}
        />
      );
    }

    if (slot?.status === 'BOUND' && slot.selectedAsset) {
      const crop = slot.cropSpec;
      if (slot.selectedAsset.startsWith('css:')) {
        return <div key={id} className="site00-vlt__image-slice site00-vlt__image-slice--procedural" data-asset-slot={id} />;
      }
      return (
        <div
          key={id}
          className="site00-vlt__image-slice site00-vlt__image-slice--bound"
          data-asset-slot={id}
          style={{
            backgroundImage: `url(${slot.selectedAsset})`,
            backgroundSize: crop?.backgroundSize ?? 'cover',
            backgroundPosition: crop?.backgroundPosition ?? 'center',
          }}
          role="img"
          aria-label={`Hero visual ${id}`}
        />
      );
    }
    return (
      <div
        key={id}
        className={`site00-vlt__image-slice${executed ? ' site00-vlt__image-slice--muted' : ' site00-vlt__image-slice--missing'}`}
        data-asset-slot={id}
        data-unresolved={executed ? undefined : 'true'}
      />
    );
  };

  const rightSlot = slots.get('right_graphic');

  return (
    <section className="site00-vlt__hero-literal-wrap site00-sft__band" data-shell-band="hero-editorial" data-literal-hero="vision">
      <div className="site00-vlt__hero-literal">
        <div className="site00-vlt__left-copy-region" data-literal-subregion="left_copy_region">
          <p className="site00-vlt__hero-kicker">NDXBOOK</p>
          <p className="site00-vlt__hero-headline">{focusTitle.toUpperCase()}</p>
          <button type="button" className="site00-vlt__hero-cta">
            VIEW ENTRY
          </button>
        </div>
        <div className="site00-vlt__center-image-region" data-literal-subregion="center_image_region">
          {['slice_a', 'slice_b', 'slice_c'].map(renderSlice)}
        </div>
        <div className="site00-vlt__right-visual-region" data-literal-subregion="right_visual_region">
          {rightSlot?.status === 'BOUND' && rightSlot.selectedAsset && !rightSlot.selectedAsset.startsWith('css:') ? (
            <div
              className="site00-vlt__right-graphic site00-vlt__right-graphic--bound"
              data-asset-slot="right_graphic"
              style={{
                backgroundImage: `url(${rightSlot.selectedAsset})`,
                backgroundSize: rightSlot.cropSpec?.backgroundSize ?? 'cover',
                backgroundPosition: rightSlot.cropSpec?.backgroundPosition ?? 'center',
              }}
            />
          ) : (
            <div className="site00-vlt__right-graphic site00-vlt__right-graphic--accent" data-asset-slot="right_graphic" />
          )}
        </div>
      </div>
      <div className="site00-vlt__lime-ndx-region" data-literal-subregion="lime_ndx_region" aria-hidden="true" />
    </section>
  );
}

export function VisionLiteralNdxOverviewTwin({ projectSlug, session, executed = false }: Props) {
  const slots = slotMap(session?.replicationAssetSlots);
  const subregions = session?.visionLiteralRegionSpecs?.find((s) => s.regionId === 'hero-editorial')?.subregions.length ?? 4;
  const useHostNav = executed || session?.twinRenderMode === 'VISION_LITERAL_EXECUTED_NDX_OVERVIEW';
  const geometryPatch = session?.twinGeometryCssPatch ?? undefined;
  const cssVars = geometryPatch as CSSProperties | undefined;

  return (
    <div
      className={`site00-vlt${executed ? ' site00-vlt--executed' : ''}${geometryPatch ? ' site00-vlt--geometry-locked' : ''}`}
      data-vision-literal-twin="ndx-overview-mobile"
      data-hero-subregions={subregions}
      data-3c-build={session?.replication3cReport?.buildRef ?? null}
      data-3d-build={session?.geometryLockReport?.buildRef ?? null}
      style={cssVars}
    >
      <GeometryGridOverlay session={session} />
      <ShellFirstNdxOverviewTwin
        projectSlug={projectSlug}
        hostClassName="site00-vlt__host"
        mastheadClassName={executed ? 'site00-vlt__masthead' : undefined}
        bottomNavMode={useHostNav ? 'site00-host' : 'ndx-project'}
        heroOverride={<LiteralHeroBand projectSlug={projectSlug} slots={slots} executed={executed} />}
      />
    </div>
  );
}
