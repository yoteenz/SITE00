import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';
import { PlacesPopularPanel } from './PlacesPopularPanel';
import { AstralScene } from './immersive/AstralScene';
import { AstralPresenceItem } from './immersive/AstralPresenceItem';

type Tab = 'all' | 'friends' | 'readers' | 'favorites';

export function WhosHerePanel({ compact }: { compact?: boolean }) {
  const { friends, readers, path } = useAstralWorld();
  const [tab, setTab] = useState<Tab>('all');

  const items =
    tab === 'friends'
      ? friends.map((f) => ({ id: f.id, name: f.name, initials: f.avatarInitials, avatarId: null, status: f.joinable ? 'Joinable' : 'Reading Now', dest: f.currentDestination ?? 'astrea', kind: 'friend' as const, tableId: f.tableId }))
      : tab === 'readers'
        ? readers.map((r) => ({ id: r.id, name: r.name, initials: r.avatarInitials, avatarId: r.avatarId, status: r.presence.replace(/_/g, ' '), dest: r.currentDestination, kind: 'reader' as const, tableId: null }))
        : tab === 'favorites'
          ? readers.filter((r) => r.isFavorite).map((r) => ({ id: r.id, name: r.name, initials: r.avatarInitials, avatarId: r.avatarId, status: r.presence.replace(/_/g, ' '), dest: r.currentDestination, kind: 'reader' as const, tableId: null }))
          : [
              ...friends.map((f) => ({ id: f.id, name: f.name, initials: f.avatarInitials, avatarId: null, status: f.joinable ? 'Joinable' : 'Reading Now', dest: f.currentDestination, kind: 'friend' as const, tableId: f.tableId })),
              ...readers.map((r) => ({ id: r.id, name: r.name, initials: r.avatarInitials, avatarId: r.avatarId, status: r.presence.replace(/_/g, ' '), dest: r.currentDestination, kind: 'reader' as const, tableId: null })),
            ];

  return (
    <section className={`aw-card aw-whos-here--immersive${compact ? '' : ' aw-card--gold'}`}>
      <AstralScene crop="SOCIAL_PRESENCE" minHeight={compact ? 100 : 120} overlay />
      <div className="aw-whos-here__body">
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
            <AstralPresenceItem
              key={item.id}
              personId={item.id}
              avatarId={item.avatarId}
              name={item.name}
              initials={item.initials}
              subtitle={`${item.kind === 'reader' ? 'Reader · ' : ''}${item.dest ? String(item.dest).replace(/-/g, ' ') : 'In Astréa'}${item.tableId ? ' · Table' : ''}`}
              status={item.status}
            />
          ))}
        </div>
        <PlacesPopularPanel compact immersive />
        {!compact ? (
          <Link to={path('friends')} className="aw-btn-secondary">See Who&apos;s Here →</Link>
        ) : null}
      </div>
    </section>
  );
}
