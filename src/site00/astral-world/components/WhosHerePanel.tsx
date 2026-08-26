import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';

type Tab = 'all' | 'friends' | 'readers' | 'favorites';

export function WhosHerePanel({ compact }: { compact?: boolean }) {
  const { friends, readers } = useAstralWorld();
  const [tab, setTab] = useState<Tab>('all');

  const items =
    tab === 'friends'
      ? friends.map((f) => ({ id: f.id, name: f.name, initials: f.avatarInitials, status: f.joinable ? 'Joinable' : 'Reading Now', dest: f.currentDestination ?? 'astrea', kind: 'friend' as const }))
      : tab === 'readers'
        ? readers.map((r) => ({ id: r.id, name: r.name, initials: r.avatarInitials, status: r.presence.replace(/_/g, ' '), dest: r.currentDestination, kind: 'reader' as const }))
        : tab === 'favorites'
          ? readers.filter((r) => r.isFavorite).map((r) => ({ id: r.id, name: r.name, initials: r.avatarInitials, status: r.presence.replace(/_/g, ' '), dest: r.currentDestination, kind: 'reader' as const }))
          : [
              ...friends.map((f) => ({ id: f.id, name: f.name, initials: f.avatarInitials, status: f.joinable ? 'Joinable' : 'Reading Now', dest: f.currentDestination, kind: 'friend' as const })),
              ...readers.map((r) => ({ id: r.id, name: r.name, initials: r.avatarInitials, status: r.presence.replace(/_/g, ' '), dest: r.currentDestination, kind: 'reader' as const })),
            ];

  return (
    <section className={`aw-card${compact ? '' : ' aw-card--gold'}`}>
      <div className="aw-card__header">
        <h2 className="aw-display aw-display--section">Who&apos;s Here Now</h2>
        <span className="aw-label">Live</span>
      </div>
      <div className="aw-tabs" role="tablist">
        {(['all', 'friends', 'readers', 'favorites'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={`aw-tab${tab === t ? ' aw-tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {items.map((item) => (
          <div key={item.id} className="aw-presence-item">
            <div className="aw-avatar" aria-hidden>
              {item.initials}
            </div>
            <div style={{ flex: 1 }}>
              <strong>{item.name}</strong>
              <div className="aw-muted">{item.dest ? String(item.dest).replace(/-/g, ' ') : 'In Astréa'}</div>
            </div>
            <span className={`aw-status${item.status.toLowerCase().includes('join') ? ' aw-status--joinable' : item.status.toLowerCase().includes('read') ? ' aw-status--reading' : ' aw-status--available'}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
      {!compact ? (
        <Link to="/projects/astral-world/experience/friends" className="aw-btn-secondary">
          See Who&apos;s Here →
        </Link>
      ) : null}
    </section>
  );
}
