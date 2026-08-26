import { friendLocationLabel } from '../../../../shared/site00-astral-world/presenceService.js';
import { useAstralWorld } from '../context/AstralWorldContext';
import { AstralScene } from '../components/immersive/AstralScene';
import { AstralPresenceItem } from '../components/immersive/AstralPresenceItem';

export default function AstralWorldFriendsPage() {
  const { friends, path } = useAstralWorld();

  return (
    <>
      <AstralScene crop="SOCIAL_PRESENCE" minHeight={200}>
        <h1 className="aw-display aw-display--hero" style={{ margin: 0 }}>Meet My Friends</h1>
        <p className="aw-muted">Find people in the world — not a contact list</p>
      </AstralScene>
      <section className="aw-card aw-card--gold" style={{ marginTop: '-2rem', position: 'relative', zIndex: 2 }}>
        <h2 className="aw-display aw-display--section">See Who&apos;s Here</h2>
        {friends.map((f) => {
          const loc = friendLocationLabel(f.id);
          const destPath = f.currentDestination
            ? path(`astrea/${f.currentDestination}`)
            : path('astrea');
          return (
            <AstralPresenceItem
              key={f.id}
              personId={f.id}
              name={f.name}
              initials={f.avatarInitials}
              subtitle={loc ? `at ${loc}` : 'In Astréa'}
              status={f.joinable ? undefined : 'Busy'}
              actionTo={f.joinable ? destPath : undefined}
              actionLabel={f.joinable ? (f.tableId ? 'Join Table' : 'Join Here') : undefined}
            />
          );
        })}
      </section>
    </>
  );
}
