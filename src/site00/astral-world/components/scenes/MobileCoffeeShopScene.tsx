import { useMemo, useState } from 'react';
import { getHotspotsForScene } from '../../../../../shared/site00-astral-world/scenes/hotspotRegistry.js';
import { useAstralViewport } from '../../hooks/useAstralViewport';
import { useAstralWorld } from '../../context/AstralWorldContext';
import { AstralWorldScene } from '../immersive/AstralWorldScene';
import { AstralHUD, AstralHUDChip } from '../immersive/AstralHUD';
import { AstralHotspotLayer } from '../immersive/AstralHotspot';
import { AstralDrawer } from '../immersive/AstralDrawer';
import { AstralPortrait } from '../immersive/AstralPortrait';
import { personDisplay } from '../immersive/immersiveHelpers';

const TABLE_TARGETS = ['table-1', 'table-2', 'table-3'] as const;

export function MobileCoffeeShopScene() {
  const { tables, joinHerTable, leaveCurrentTable, userPresence, readers, friends, selectedTableId } = useAstralWorld();
  const { isMobile } = useAstralViewport();
  const [drawerTableIdx, setDrawerTableIdx] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const hotspots = useMemo(() => getHotspotsForScene('COFFEE_SHOP', isMobile), [isMobile]);
  const shopReaders = readers.filter((r) => r.currentDestination === 'coffee-shop');
  const joinableTables = tables.filter((t) => t.joinable && t.occupants.length < t.capacity).length;

  const lookup = useMemo(() => {
    const map = new Map<string, { name: string; initials?: string }>();
    for (const f of friends) map.set(f.id, { name: f.name, initials: f.avatarInitials });
    for (const r of readers) map.set(r.id, { name: r.name, initials: r.avatarInitials });
    return map;
  }, [friends, readers]);

  const openTableDrawer = (target: string) => {
    const idx = TABLE_TARGETS.indexOf(target as (typeof TABLE_TARGETS)[number]);
    setDrawerTableIdx(idx >= 0 ? idx : null);
  };

  const activeTable = drawerTableIdx != null ? tables[drawerTableIdx] : null;

  const handleJoin = (tableId: string) => {
    const err = joinHerTable(tableId);
    setMessage(err ?? 'Joined table');
  };

  return (
    <>
      <AstralWorldScene
        sceneId="COFFEE_SHOP"
        overlay={
          <div className="aw-dest-scene-title">
            <p className="aw-label">Astréa · Coffee Shop</p>
            <h1 className="aw-display aw-display--scene">Community Tables</h1>
          </div>
        }
        interaction={
          <AstralHotspotLayer hotspots={hotspots} onDrawer={openTableDrawer} />
        }
        hud={
          <AstralHUD position="top">
            <AstralHUDChip live>{joinableTables} tables joinable</AstralHUDChip>
            <AstralHUDChip>{shopReaders.length} readers here</AstralHUDChip>
          </AstralHUD>
        }
      />

      <AstralDrawer
        open={Boolean(activeTable)}
        onClose={() => setDrawerTableIdx(null)}
        title={activeTable?.name ?? 'Table'}
      >
        {activeTable ? (
          <>
            <p className="aw-muted">
              {activeTable.occupants.length}/{activeTable.capacity} · {activeTable.joinable ? 'Joinable' : 'Private'}
            </p>
            {activeTable.activityNote ? <p className="aw-muted">{activeTable.activityNote}</p> : null}
            <div className="aw-portrait-row">
              {activeTable.occupants.map((id) => {
                const p = personDisplay(id, lookup);
                return (
                  <AstralPortrait key={id} personId={id} name={p.name} initials={p.initials} size={40} showPresence />
                );
              })}
            </div>
            {activeTable.joinable && activeTable.occupants.length < activeTable.capacity ? (
              <button type="button" className="aw-btn-primary" onClick={() => handleJoin(activeTable.id)}>
                Join Her Table
              </button>
            ) : (
              <p className="aw-muted">This table is full or private.</p>
            )}
            {(userPresence.tableId || selectedTableId) ? (
              <button type="button" className="aw-btn-secondary" onClick={leaveCurrentTable}>Leave Table</button>
            ) : null}
            {message ? <p className="aw-muted">{message}</p> : null}
          </>
        ) : null}
      </AstralDrawer>
    </>
  );
}
