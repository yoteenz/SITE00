import { useMemo, useState } from 'react';
import { getHotspotsForScene } from '../../../../../shared/site00-astral-world/scenes/hotspotRegistry.js';
import { useAstralViewport } from '../../hooks/useAstralViewport';
import { useAstralWorld } from '../../context/AstralWorldContext';
import { AstralWorldScene } from '../immersive/AstralWorldScene';
import { AstralHUD, AstralHUDChip } from '../immersive/AstralHUD';
import { AstralHotspotLayer } from '../immersive/AstralHotspot';
import { WhosHereWorldOverlay } from './overlays/WhosHereWorldOverlay';
import { TakeMeSomewhereWorldOverlay } from './overlays/TakeMeSomewhereWorldOverlay';

/** SCENE 02: Astréa — navigable district with spatial destination anchors + compact HUD */
export function MobileAstreaScene() {
  const { occupancy, readers, tables, kiosks } = useAstralWorld();
  const { isMobile } = useAstralViewport();
  const [whosHereOpen, setWhosHereOpen] = useState(false);
  const [takeMeOpen, setTakeMeOpen] = useState(false);
  const hotspots = useMemo(() => getHotspotsForScene('ASTREA_DISTRICT', isMobile), [isMobile]);
  const readersOnline = readers.filter((r) => r.presence !== 'OFFLINE').length;
  const activeTables = tables.filter((t) => t.occupants.length > 0).length;
  const openKiosks = kiosks.filter((k) => k.kioskState !== 'CLOSED').length;

  return (
    <>
      <AstralWorldScene
        sceneId="ASTREA_DISTRICT"
        overlay={
          <div className="aw-district-title">
            <p className="aw-label">Flagship District</p>
            <h1 className="aw-display aw-display--scene">Astréa</h1>
          </div>
        }
        interaction={<AstralHotspotLayer hotspots={hotspots} />}
        hud={
          <>
            <AstralHUD position="top">
              <AstralHUDChip live>{occupancy.current} in Astréa</AstralHUDChip>
              <AstralHUDChip live>{readersOnline} readers online</AstralHUDChip>
              <AstralHUDChip>{activeTables} tables active</AstralHUDChip>
              <AstralHUDChip>{openKiosks} kiosks open</AstralHUDChip>
            </AstralHUD>
            <div className="aw-district-world-actions">
              <button type="button" className="aw-world-action aw-world-action--sm" onClick={() => setWhosHereOpen(true)}>
                Who&apos;s Here
              </button>
              <button type="button" className="aw-world-action aw-world-action--sm" onClick={() => setTakeMeOpen(true)}>
                Take Me Somewhere
              </button>
            </div>
          </>
        }
      />
      <WhosHereWorldOverlay open={whosHereOpen} onClose={() => setWhosHereOpen(false)} />
      <TakeMeSomewhereWorldOverlay open={takeMeOpen} onClose={() => setTakeMeOpen(false)} />
    </>
  );
}
