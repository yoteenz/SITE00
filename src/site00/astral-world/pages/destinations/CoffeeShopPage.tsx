import { useState } from 'react';
import { useAstralWorld } from '../../context/AstralWorldContext';
import { TakeMeSomewherePanel } from '../../components/TakeMeSomewherePanel';

export default function CoffeeShopPage() {
  const { tables, joinHerTable, leaveCurrentTable, userPresence, readers, selectedTableId } = useAstralWorld();
  const [message, setMessage] = useState<string | null>(null);
  const [viewTableId, setViewTableId] = useState<string | null>(null);
  const shopReaders = readers.filter((r) => r.currentDestination === 'coffee-shop');

  const handleJoin = (tableId: string) => {
    const err = joinHerTable(tableId);
    setMessage(err ?? 'Joined table');
  };

  const activeTable = viewTableId ? tables.find((t) => t.id === viewTableId) : null;

  return (
    <>
      <div className="aw-desktop-only">
        <div className="aw-hero" style={{ minHeight: 240 }}>
          <div className="aw-hero__bg aw-hero__bg--pending" aria-hidden />
          <div className="aw-hero__content" style={{ minHeight: 240 }}>
            <p className="aw-label">Astréa · Destination</p>
            <h1 className="aw-display aw-display--hero">Coffee Shop</h1>
            <p className="aw-muted">Conversation · comfort · community</p>
          </div>
        </div>
      </div>
      <div className="aw-mobile-only aw-mobile-screen">
        <div className="aw-mobile-hero">
          <div className="aw-mobile-hero__bg aw-hero__bg--pending" aria-hidden />
          <div className="aw-hero__content" style={{ minHeight: 180 }}>
            <h1 className="aw-display" style={{ fontSize: '1.25rem' }}>Coffee Shop</h1>
          </div>
        </div>
      </div>
      <section className="aw-card aw-card--gold">
        <h2 className="aw-display aw-display--section">Live Tables</h2>
        {tables.map((table, idx) => {
          const full = table.occupants.length >= table.capacity;
          return (
            <div key={table.id} className={`aw-table-card${full ? ' aw-table-card--full' : ''}`}>
              <div className="aw-label">Table {idx + 1}</div>
              <strong>{table.name}</strong>
              <p className="aw-muted">{table.occupants.length}/{table.capacity} · {full ? 'Table Full' : 'Joinable'}</p>
              {table.activityNote ? <p className="aw-muted">{table.activityNote}</p> : null}
              <div className="aw-avatar-row">
                {table.occupants.map((id) => (
                  <div key={id} className="aw-avatar" aria-label={`Occupant ${id}`}>{id.slice(0, 2).toUpperCase()}</div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {!full ? (
                  <button type="button" className="aw-btn-primary" onClick={() => handleJoin(table.id)}>Join Her Table</button>
                ) : null}
                <button type="button" className="aw-btn-secondary" onClick={() => setViewTableId(table.id)}>View People Here</button>
              </div>
            </div>
          );
        })}
        {userPresence.tableId || selectedTableId ? (
          <button type="button" className="aw-btn-secondary" onClick={leaveCurrentTable}>Leave Table</button>
        ) : null}
        {message ? <p className="aw-muted">{message}</p> : null}
      </section>
      {activeTable ? (
        <section className="aw-card">
          <h2 className="aw-display aw-display--section">{activeTable.name} · Activity</h2>
          <p className="aw-muted">{activeTable.activityNote ?? 'Prototype table conversation panel — real-time chat architecture reserved for later.'}</p>
          <p className="aw-muted">{activeTable.occupants.length} people here</p>
        </section>
      ) : null}
      {shopReaders.length ? (
        <section className="aw-card">
          <h2 className="aw-display aw-display--section">Readers Here</h2>
          {shopReaders.map((r) => (
            <div key={r.id} className="aw-presence-item">
              <div className="aw-avatar">{r.avatarInitials}</div>
              <div><strong>{r.name}</strong><div className="aw-muted">{r.specialty}</div></div>
            </div>
          ))}
        </section>
      ) : null}
      <TakeMeSomewherePanel compact />
    </>
  );
}
