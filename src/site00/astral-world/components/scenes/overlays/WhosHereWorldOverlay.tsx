import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAstralWorld } from '../../../context/AstralWorldContext';
import { AstralOverlay } from '../../immersive/AstralOverlay';
import { AstralPresenceItem } from '../../immersive/AstralPresenceItem';
import { PlacesPopularPanel } from '../../PlacesPopularPanel';

type Tab = 'all' | 'friends' | 'readers' | 'favorites';

/** Who's Here as world-presence overlay — district stays visible behind dimmed backdrop */
export function WhosHereWorldOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { friends, readers, path } = useAstralWorld();
  const [tab, setTab] = useState<Tab>('all');

  const items =
    tab === 'friends'
      ? friends.map((f) => ({ id: f.id, name: f.name, initials: f.avatarInitials, status: f.joinable ? 'Joinable' : 'Reading Now', dest: f.currentDestination ?? 'astrea', kind: 'friend' as const, tableId: f.tableId }))
      : tab === 'readers'
        ? readers.map((r) => ({ id: r.id, name: r.name, initials: r.avatarInitials, status: r.presence.replace(/_/g, ' '), dest: r.currentDestination, kind: 'reader' as const, tableId: null }))
        : tab === 'favorites'
          ? readers.filter((r) => r.isFavorite).map((r) => ({ id: r.id, name: r.name, initials: r.avatarInitials, status: r.presence.replace(/_/g, ' '), dest: r.currentDestination, kind: 'reader' as const, tableId: null }))
          : [
              ...friends.map((f) => ({ id: f.id, name: f.name, initials: f.avatarInitials, status: f.joinable ? 'Joinable' : 'Reading Now', dest: f.currentDestination, kind: 'friend' as const, tableId: f.tableId })),
              ...readers.map((r) => ({ id: r.id, name: r.name, initials: r.avatarInitials, status: r.presence.replace(/_/g, ' '), dest: r.currentDestination, kind: 'reader' as const, tableId: null })),
            ];

  return (
    <AstralOverlay open={open} onClose={onClose} title="Who's Here">
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
      <div role="tabpanel" className="aw-whos-here-overlay-list">
        {items.slice(0, 12).map((item) => (
          <AstralPresenceItem
            key={item.id}
            personId={item.id}
            name={item.name}
            initials={item.initials}
            subtitle={`${item.kind === 'reader' ? 'Reader · ' : ''}${item.dest ? String(item.dest).replace(/-/g, ' ') : 'In Astréa'}${item.tableId ? ' · Table' : ''}`}
            status={item.status}
          />
        ))}
      </div>
      <PlacesPopularPanel compact immersive />
      <Link to={path('friends')} className="aw-btn-secondary" onClick={onClose}>Meet My Friends →</Link>
    </AstralOverlay>
  );
}
