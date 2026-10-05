import { useState } from 'react';
import { Link } from 'react-router-dom';
import { friendLocationLabel } from '../../../../../shared/site00-astral-world/presenceService.js';
import { useAstralWorld } from '../../context/AstralWorldContext';
import { AstralWorldScene } from '../immersive/AstralWorldScene';
import { AstralDrawer } from '../immersive/AstralDrawer';
import { AstralPortrait } from '../immersive/AstralPortrait';
import { SpatialPresenceGroups, groupPeopleByDestination } from './SpatialPresenceGroups';

/** Friends grouped by where they are — WHERE ARE MY PEOPLE? */
export function MobileFriendsScene() {
  const { friends, path } = useAstralWorld();
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);

  const groups = groupPeopleByDestination(friends, (f) => ({
    name: f.name,
    initials: f.avatarInitials,
    kind: 'friend',
    status: f.joinable ? 'Joinable' : 'Busy',
  }));

  const selectedFriend = selectedFriendId ? friends.find((f) => f.id === selectedFriendId) : null;

  return (
    <>
      <AstralWorldScene
        sceneId="FRIENDS_PRESENCE"
        overlay={
          <div className="aw-friends-scene-overlay">
            <h1 className="aw-display aw-display--scene">Meet My Friends</h1>
            <p className="aw-muted">Where are my people?</p>
          </div>
        }
        interaction={
          <div className="aw-friends-scene-groups">
            <SpatialPresenceGroups groups={groups} onSelect={setSelectedFriendId} />
          </div>
        }
      />

      <AstralDrawer open={Boolean(selectedFriend)} onClose={() => setSelectedFriendId(null)} title={selectedFriend?.name ?? 'Friend'}>
        {selectedFriend ? (
          <>
            <AstralPortrait personId={selectedFriend.id} name={selectedFriend.name} initials={selectedFriend.avatarInitials} size={56} showPresence variant="friend" />
            <p className="aw-muted">{friendLocationLabel(selectedFriend.id) ?? 'In Astréa'}</p>
            {selectedFriend.joinable && selectedFriend.currentDestination ? (
              <Link to={path(`astrea/${selectedFriend.currentDestination}`)} className="aw-btn-primary">
                {selectedFriend.tableId ? 'Join Table' : 'Join Here'}
              </Link>
            ) : null}
          </>
        ) : null}
      </AstralDrawer>
    </>
  );
}
