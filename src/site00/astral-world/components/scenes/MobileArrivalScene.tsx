import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAstralWorld } from '../../context/AstralWorldContext';
import { AstralWorldScene } from '../immersive/AstralWorldScene';
import { AstralHUD, AstralHUDChip } from '../immersive/AstralHUD';
import { WhosHereWorldOverlay } from './overlays/WhosHereWorldOverlay';
import { TakeMeSomewhereWorldOverlay } from './overlays/TakeMeSomewhereWorldOverlay';

/**
 * SCENE 01: Arrival — full-bleed world entry, one primary action (Enter Astréa).
 * Secondary functions via floating world actions → overlays (not vertical page stack).
 */
export function MobileArrivalScene() {
  const { path, occupancy, readers, friends } = useAstralWorld();
  const [whosHereOpen, setWhosHereOpen] = useState(false);
  const [takeMeOpen, setTakeMeOpen] = useState(false);
  const readersOnline = readers.filter((r) => r.presence !== 'OFFLINE').length;

  return (
    <>
      <AstralWorldScene
        sceneId="HOME_ARRIVAL"
        overlay={
          <div className="aw-arrival-overlay">
            <p className="aw-label">Master Universe</p>
            <h1 className="aw-display aw-display--scene">Welcome to Astral World</h1>
            <Link to={path('astrea')} className="aw-btn-primary aw-btn-primary--hero">Enter Astréa →</Link>
          </div>
        }
        hud={
          <AstralHUD position="top">
            <AstralHUDChip live>{occupancy.current.toLocaleString()} in Astréa</AstralHUDChip>
            <AstralHUDChip live>{readersOnline} readers active</AstralHUDChip>
            <AstralHUDChip>{friends.length} friends here</AstralHUDChip>
          </AstralHUD>
        }
        interaction={
          <div className="aw-arrival-actions">
            <button type="button" className="aw-world-action" onClick={() => setWhosHereOpen(true)}>
              Who&apos;s Here
            </button>
            <button type="button" className="aw-world-action" onClick={() => setTakeMeOpen(true)}>
              Take Me Somewhere
            </button>
            <Link to={path('readers')} className="aw-world-action">Find My Reader</Link>
          </div>
        }
      />

      <WhosHereWorldOverlay open={whosHereOpen} onClose={() => setWhosHereOpen(false)} />
      <TakeMeSomewhereWorldOverlay open={takeMeOpen} onClose={() => setTakeMeOpen(false)} />
    </>
  );
}
