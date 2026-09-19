import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAstralWorld } from '../../../context/AstralWorldContext';
import { AstralOverlay } from '../../immersive/AstralOverlay';
import { SpatialPresenceGroups, groupPeopleByDestination } from '../SpatialPresenceGroups';
import { PlacesPopularPanel } from '../../PlacesPopularPanel';

type Tab = 'all' | 'friends' | 'readers' | 'favorites';

/** Who's Here — portrait tiles grouped by place */
export function WhosHereWorldOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { friends, readers, path } = useAstralWorld();
  const [tab, setTab] = useState<Tab>('all');

  const sourcePeople = useMemo(() => {
    if (tab === 'friends') return friends.map((f) => ({ ...f, kind: 'friend' as const }));
    if (tab === 'readers') return readers.map((r) => ({ ...r, kind: 'reader' as const, joinable: true }));
    if (tab === 'favorites') return readers.filter((r) => r.isFavorite).map((r) => ({ ...r, kind: 'reader' as const, joinable: true }));
    return [
      ...friends.map((f) => ({ ...f, kind: 'friend' as const })),
      ...readers.map((r) => ({ ...r, kind: 'reader' as const, joinable: true })),
    ];
  }, [tab, friends, readers]);

  const groups = groupPeopleByDestination(sourcePeople, (p) => ({
    name: p.name,
    initials: p.avatarInitials,
    avatarId: 'avatarId' in p ? p.avatarId : null,
    kind: p.kind,
    status: p.kind === 'friend'
      ? (p.joinable ? 'Joinable' : 'Busy')
      : ('presence' in p ? String(p.presence).replace(/_/g, ' ') : undefined),
  }));

  return (
    <AstralOverlay open={open} onClose={onClose} title="Who's Here">
      <div className="aw-tabs aw-tabs--sigil" role="tablist">
        {(['all', 'friends', 'readers', 'favorites'] as Tab[]).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className={`aw-tab${tab === t ? ' aw-tab--active' : ''}`} onClick={() => setTab(t)}>
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <SpatialPresenceGroups groups={groups} />
      <PlacesPopularPanel compact immersive />
      <Link to={path('friends')} className="aw-btn-secondary" onClick={onClose}>Meet My Friends →</Link>
    </AstralOverlay>
  );
}
