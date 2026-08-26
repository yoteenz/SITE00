import { useMemo, useState } from 'react';
import { getHotspotsForScene } from '../../../../../shared/site00-astral-world/scenes/hotspotRegistry.js';
import { useAstralViewport } from '../../hooks/useAstralViewport';
import { useAstralWorld } from '../../context/AstralWorldContext';
import { AstralWorldScene } from '../immersive/AstralWorldScene';
import { AstralHUD, AstralHUDChip } from '../immersive/AstralHUD';
import { AstralHotspotLayer } from '../immersive/AstralHotspot';
import { AstralKioskTray } from '../immersive/AstralKioskTray';
import { AstralPortraitRow } from '../immersive/AstralPortrait';

/** Maps hotspot targets to fixture kiosk ids */
export const KIOSK_HOTSPOT_MAP: Record<string, string> = {
  'kiosk-quick-pull': 'kiosk-1',
  'kiosk-general': 'kiosk-2',
  'kiosk-yes-no': 'kiosk-3',
  'kiosk-love': 'kiosk-4',
  'kiosk-career': 'kiosk-5',
};

export function MobileAstralMallScene() {
  const { kiosks, readers, selectKiosk, joinKioskWait } = useAstralWorld();
  const { isMobile } = useAstralViewport();
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const hotspots = useMemo(() => getHotspotsForScene('ASTRAL_MALL', isMobile), [isMobile]);
  const mallReaders = readers.filter((r) => r.currentDestination === 'astral-mall');
  const liveReads = readers.filter((r) => r.presence === 'READING_NOW' && r.currentDestination === 'astral-mall').length;

  const kioskId = activeHotspot ? KIOSK_HOTSPOT_MAP[activeHotspot] : null;
  const activeKiosk = useMemo(
    () => (kioskId ? kiosks.find((k) => k.id === kioskId) ?? null : null),
    [kioskId, kiosks],
  );
  const kioskReader = activeKiosk?.readerId ? readers.find((r) => r.id === activeKiosk.readerId) : null;

  const openKiosk = (target: string) => {
    setActiveHotspot(target);
    const kid = KIOSK_HOTSPOT_MAP[target];
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
            <p className="aw-muted aw-dest-scene-hint">Tap a glowing kiosk in the scene</p>
          </div>
        }
        interaction={<AstralHotspotLayer hotspots={hotspots} onDrawer={openKiosk} />}
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

      <AstralKioskTray
        open={Boolean(activeKiosk)}
        onClose={() => setActiveHotspot(null)}
        kiosk={activeKiosk}
        readerId={kioskReader?.id}
        readerName={kioskReader?.name}
        readerInitials={kioskReader?.avatarInitials}
        onJoinWait={() => activeKiosk && joinKioskWait(activeKiosk.id)}
      />
    </>
  );
}
