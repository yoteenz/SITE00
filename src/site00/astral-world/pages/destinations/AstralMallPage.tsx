import { useMemo, useState } from 'react';
import { getHotspotsForScene } from '../../../../../shared/site00-astral-world/scenes/hotspotRegistry.js';
import { useAstralWorld } from '../../context/AstralWorldContext';
import { AstralWorldScene } from '../../components/immersive/AstralWorldScene';
import { AstralHUD, AstralHUDChip } from '../../components/immersive/AstralHUD';
import { AstralHotspotLayer } from '../../components/immersive/AstralHotspot';
import { AstralKioskTray } from '../../components/immersive/AstralKioskTray';
import { AstralPortraitRow } from '../../components/immersive/AstralPortrait';
import { AstralScene } from '../../components/immersive/AstralScene';
import { KIOSK_HOTSPOT_MAP, MobileAstralMallScene } from '../../components/scenes/MobileAstralMallScene';

void AstralScene;

function DesktopAstralMallLayout() {
  const { kiosks, readers, selectKiosk, joinKioskWait } = useAstralWorld();
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const hotspots = getHotspotsForScene('ASTRAL_MALL', false);
  const mallReaders = readers.filter((r) => r.currentDestination === 'astral-mall');
  const liveReads = readers.filter((r) => r.presence === 'READING_NOW' && r.currentDestination === 'astral-mall').length;

  const kioskId = activeHotspot ? KIOSK_HOTSPOT_MAP[activeHotspot] : null;
  const activeKiosk = useMemo(
    () => (kioskId ? kiosks.find((k) => k.id === kioskId) ?? null : null),
    [kioskId, kiosks],
  );
  const kioskReader = activeKiosk?.readerId ? readers.find((r) => r.id === activeKiosk.readerId) : null;

  return (
    <div className="aw-route-scene aw-desktop-scene">
      <AstralWorldScene
        sceneId="ASTRAL_MALL"
        viewport
        overlay={
          <div className="aw-dest-scene-title">
            <p className="aw-label">Astréa · Mall</p>
            <h1 className="aw-display aw-display--scene">Astral Mall</h1>
          </div>
        }
        interaction={<AstralHotspotLayer hotspots={hotspots} onDrawer={(t: string) => { setActiveHotspot(t); const kid = KIOSK_HOTSPOT_MAP[t]; if (kid) selectKiosk(kid); }} />}
        presence={
          mallReaders.length ? (
            <div className="aw-mall-presence-strip">
              <AstralPortraitRow people={mallReaders.map((r) => ({ id: r.id, name: r.name, initials: r.avatarInitials }))} size={40} />
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
    </div>
  );
}

export default function AstralMallPage() {
  return (
    <>
      <div className="aw-desktop-only"><DesktopAstralMallLayout /></div>
      <div className="aw-mobile-only aw-route-scene"><MobileAstralMallScene /></div>
    </>
  );
}
