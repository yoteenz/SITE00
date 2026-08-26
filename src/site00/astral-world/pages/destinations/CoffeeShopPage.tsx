import { useMemo, useState } from 'react';
import { useAstralWorld } from '../../context/AstralWorldContext';
import { TakeMeSomewherePanel } from '../../components/TakeMeSomewherePanel';
import { AstralScene } from '../../components/immersive/AstralScene';
import { AstralPortrait } from '../../components/immersive/AstralPortrait';
import { personDisplay } from '../../components/immersive/immersiveHelpers';
import { MobileCoffeeShopScene } from '../../components/scenes/MobileCoffeeShopScene';

function DesktopCoffeeShopLayout() {
  const { tables, joinHerTable, leaveCurrentTable, userPresence, readers, friends, selectedTableId } = useAstralWorld();
  const [message, setMessage] = useState<string | null>(null);
  const [viewTableId, setViewTableId] = useState<string | null>(null);
  const shopReaders = readers.filter((r) => r.currentDestination === 'coffee-shop');

  const lookup = useMemo(() => {
    const map = new Map<string, { name: string; initials?: string }>();
    for (const f of friends) map.set(f.id, { name: f.name, initials: f.avatarInitials });
    for (const r of readers) map.set(r.id, { name: r.name, initials: r.avatarInitials });
    return map;
  }, [friends, readers]);

  const handleJoin = (tableId: string) => {
    const err = joinHerTable(tableId);
    setMessage(err ?? 'Joined table');
  };

  const activeTable = viewTableId ? tables.find((t) => t.id === viewTableId) : null;

  return (
    <div className="aw-coffee-scene">
      <AstralScene crop="COFFEE_SHOP" minHeight={340}>
        <p className="aw-label">Astréa · Destination</p>
        <h1 className="aw-display aw-display--hero">Coffee Shop</h1>
        <p className="aw-muted">Conversation · comfort · community</p>
      </AstralScene>
      <div className="aw-table-overlay-grid">
        {tables.map((table, idx) => {
          const full = table.occupants.length >= table.capacity;
          return (
            <div key={table.id} className={`aw-table-overlay${full ? ' aw-table-card--full' : ''}`}>
              <div className="aw-label">Table {idx + 1}</div>
              <strong>{table.name}</strong>
              <div className="aw-portrait-row">
                {table.occupants.map((id) => {
                  const p = personDisplay(id, lookup);
                  return (
                    <AstralPortrait key={id} personId={id} name={p.name} initials={p.initials} size={36} showPresence />
                  );
                })}
              </div>
              {!full ? (
                <button type="button" className="aw-btn-primary" onClick={() => handleJoin(table.id)}>Join Her Table</button>
              ) : null}
              <button type="button" className="aw-btn-secondary" onClick={() => setViewTableId(table.id)}>View People Here</button>
            </div>
          );
        })}
        {userPresence.tableId || selectedTableId ? (
          <button type="button" className="aw-btn-secondary" onClick={leaveCurrentTable}>Leave Table</button>
        ) : null}
        {message ? <p className="aw-muted">{message}</p> : null}
      </div>
      {activeTable ? (
        <section className="aw-card" style={{ margin: '0 0.75rem 1rem' }}>
          <h2 className="aw-display aw-display--section">{activeTable.name}</h2>
          <p className="aw-muted">{activeTable.activityNote}</p>
        </section>
      ) : null}
      {shopReaders.length ? (
        <section className="aw-card" style={{ margin: '0 0.75rem 1rem' }}>
          <h2 className="aw-display aw-display--section">Readers Here</h2>
          {shopReaders.map((r) => (
            <div key={r.id} className="aw-reader-card-visual">
              <AstralPortrait personId={r.id} name={r.name} initials={r.avatarInitials} size={44} showPresence />
              <div className="aw-reader-card-visual__meta">
                <strong>{r.name}</strong>
                <div className="aw-muted">{r.specialty}</div>
              </div>
            </div>
          ))}
        </section>
      ) : null}
      <div style={{ padding: '0 0.75rem' }}>
        <TakeMeSomewherePanel compact />
      </div>
    </div>
  );
}

export default function CoffeeShopPage() {
  return (
    <>
      <div className="aw-desktop-only"><DesktopCoffeeShopLayout /></div>
      <div className="aw-mobile-only aw-route-scene"><MobileCoffeeShopScene /></div>
    </>
  );
}
