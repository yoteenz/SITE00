import { friendLocationLabel } from '../../../../../shared/site00-astral-world/presenceService.js';
import type { AstralFriend } from '../../../../../shared/site00-astral-world/types.js';
import { useAstralWorld } from '../../context/AstralWorldContext';
import { AstralWorldScene } from '../immersive/AstralWorldScene';
import { AstralPortrait } from '../immersive/AstralPortrait';
import { AstralDrawer } from '../immersive/AstralDrawer';
import { AstralPresenceItem } from '../immersive/AstralPresenceItem';
import { destinationCropKeys } from '../immersive/immersiveHelpers';
import { AstralScene } from '../immersive/AstralScene';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const DEST_LABELS: Record<string, string> = {
  'coffee-shop': 'Coffee Shop',
  'tarot-suite': 'Tarot Suite',
  'astral-mall': 'Astral Mall',
  astrea: 'Astréa',
};

/** Friends shown in places — spatial grouping over district environment */
export function MobileFriendsScene() {
  const { friends, path } = useAstralWorld();
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);

  const byDestination = friends.reduce<Record<string, AstralFriend[]>>((acc, f) => {
    const key = f.currentDestination ?? 'astrea';
    const bucket = acc[key] ?? [];
    acc[key] = [...bucket, f];
    return acc;
  }, {});

  const selectedFriend = selectedFriendId ? friends.find((f) => f.id === selectedFriendId) : null;

  return (
    <>
      <AstralWorldScene
        sceneId="FRIENDS_PRESENCE"
        overlay={
          <div className="aw-friends-scene-overlay">
            <h1 className="aw-display aw-display--scene">Meet My Friends</h1>
            <button type="button" className="aw-world-action aw-world-action--sm" onClick={() => setDirectoryOpen(true)}>
              Full Directory
            </button>
          </div>
        }
        interaction={
          <div className="aw-friends-by-place">
            {Object.entries(byDestination).map(([dest, group], idx) => {
              const crops = destinationCropKeys(dest === 'astrea' ? 'coffee-shop' : dest);
              return (
                <button
                  key={dest}
                  type="button"
                  className="aw-friends-place-cluster"
                  style={{ left: `${8 + (idx % 3) * 30}%`, top: `${42 + Math.floor(idx / 3) * 22}%` }}
                  onClick={() => setSelectedFriendId(group[0]?.id ?? null)}
                >
                  <div className="aw-friends-place-cluster__thumb">
                    <AstralScene crop={crops.mobile} minHeight={48} responsive={false} />
                  </div>
                  <span className="aw-friends-place-cluster__label">{DEST_LABELS[dest] ?? dest}</span>
                  <div className="aw-portrait-row">
                    {group.slice(0, 3).map((f) => (
                      <AstralPortrait key={f.id} personId={f.id} name={f.name} initials={f.avatarInitials} size={32} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        }
      />

      <AstralDrawer open={directoryOpen} onClose={() => setDirectoryOpen(false)} title="Friends Directory">
        {friends.map((f) => {
          const loc = friendLocationLabel(f.id);
          return (
            <AstralPresenceItem
              key={f.id}
              personId={f.id}
              name={f.name}
              initials={f.avatarInitials}
              subtitle={loc ? `at ${loc}` : 'In Astréa'}
              status={f.joinable ? undefined : 'Busy'}
              actionTo={f.joinable && f.currentDestination ? path(`astrea/${f.currentDestination}`) : undefined}
              actionLabel={f.joinable ? (f.tableId ? 'Join Table' : 'Join Here') : undefined}
            />
          );
        })}
      </AstralDrawer>

      <AstralDrawer open={Boolean(selectedFriend)} onClose={() => setSelectedFriendId(null)} title={selectedFriend?.name ?? 'Friend'}>
        {selectedFriend ? (
          <>
            <AstralPortrait personId={selectedFriend.id} name={selectedFriend.name} initials={selectedFriend.avatarInitials} size={56} showPresence />
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
