import { useMemo, useState } from 'react';
import { getHotspotsForScene } from '../../../../../shared/site00-astral-world/scenes/hotspotRegistry.js';
import { useAstralWorld } from '../../context/AstralWorldContext';
import { AstralWorldScene } from '../immersive/AstralWorldScene';
import { AstralHUD, AstralHUDChip } from '../immersive/AstralHUD';
import { AstralHotspotLayer } from '../immersive/AstralHotspot';
import { AstralDrawer } from '../immersive/AstralDrawer';
import { AstralPortraitRow } from '../immersive/AstralPortrait';

const KIOSK_TARGET_MAP: Record<string, string> = {
  'kiosk-central': 'kiosk-1',
  'kiosk-love': 'kiosk-4',
  'kiosk-career': 'kiosk-5',
  'kiosk-quick': 'kiosk-3',
};

export function MobileAstralMallScene() {
  const { kiosks, readers, selectKiosk, joinKioskWait, selectedKioskId } = useAstralWorld();
  const [drawerTarget, setDrawerTarget] = useState<string | null>(null);
  const hotspots = getHotspotsForScene('ASTRAL_MALL', true);
  const mallReaders = readers.filter((r) => r.currentDestination === 'astral-mall');
  const liveReads = readers.filter((r) => r.presence === 'READING_NOW' && r.currentDestination === 'astral-mall').length;

  const drawerKioskId = drawerTarget ? KIOSK_TARGET_MAP[drawerTarget] : null;
  const drawerKiosk = useMemo(
    () => (drawerKioskId ? kiosks.find((k) => k.id === drawerKioskId) : null),
    [drawerKioskId, kiosks],
  );

  const openKioskDrawer = (target: string) => {
    setDrawerTarget(target);
    const kid = KIOSK_TARGET_MAP[target];
    if (kid) selectKiosk(kid);
  };

  return (
    <>
      <AstralWorldScene
        sceneId="ASTRAL_MALL"
        overlay={
          <div className="aw-dest-scene-title">
            <p className="aw-label">Astréa · Mall</p>
            <h1 className="aw-display aw-display--scene">Astral Mall</h1>
          </div>
        }
        interaction={<AstralHotspotLayer hotspots={hotspots} onDrawer={openKioskDrawer} />}
        presence={
          mallReaders.length ? (
            <div className="aw-mall-presence-strip">
              <AstralPortraitRow people={mallReaders.map((r) => ({ id: r.id, name: r.name, initials: r.avatarInitials }))} size={36} />
            </div>
          ) : null
        }
        hud={
          <AstralHUD position="top">
            <AstralHUDChip live>{mallReaders.length} readers here</AstralHUDChip>
            <AstralHUDChip live>{liveReads} live readings</AstralHUDChip>
          </AstralHUD>
        }
      />

      <AstralDrawer
        open={Boolean(drawerKiosk)}
        onClose={() => setDrawerTarget(null)}
        title={drawerKiosk?.label ?? 'Kiosk'}
      >
        {drawerKiosk ? (
          <>
            <p className="aw-muted">{drawerKiosk.durationMin} min · ${drawerKiosk.priceUsd} · {drawerKiosk.kioskState.replace(/_/g, ' ')}</p>
            {drawerKiosk.kioskState === 'OPEN' ? (
              <button type="button" className="aw-btn-primary">Start Quick Read</button>
            ) : drawerKiosk.kioskState === 'BUSY' ? (
              <button type="button" className="aw-btn-secondary" onClick={() => joinKioskWait(drawerKiosk.id)}>Join Wait</button>
            ) : drawerKiosk.kioskState === 'SHORT_WAIT' ? (
              <p className="aw-muted">On waitlist — prototype queue</p>
            ) : (
              <p className="aw-muted">Kiosk closed</p>
            )}
            <div className="aw-kiosk-tray-list">
              {kiosks.filter((k) => k.kioskState !== 'CLOSED').slice(0, 4).map((k) => (
                <button
                  key={k.id}
                  type="button"
                  className={`aw-kiosk-tray-item${selectedKioskId === k.id ? ' aw-kiosk-tray-item--active' : ''}`}
                  onClick={() => selectKiosk(k.id)}
                >
                  <strong>{k.label}</strong>
                  <span className="aw-muted">{k.durationMin} min</span>
                </button>
              ))}
            </div>
          </>
        ) : null}
      </AstralDrawer>
    </>
  );
}
