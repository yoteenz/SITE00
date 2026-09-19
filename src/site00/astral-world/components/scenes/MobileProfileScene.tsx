import { Link } from 'react-router-dom';
import { useAstralWorld } from '../../context/AstralWorldContext';
import { AstralWorldScene } from '../immersive/AstralWorldScene';
import { AstralPortrait } from '../immersive/AstralPortrait';
import { AstralScene } from '../immersive/AstralScene';

const YWW_ITEMS = [
  { to: 'custom-avatar', label: 'Custom Avatar', crop: 'CUSTOM_AVATAR' as const },
  { to: 'join-circle', label: 'Join a Circle', crop: 'SOCIAL_PRESENCE' as const },
  { to: 'create-deck', label: 'Create a Deck', crop: 'CREATE_DECK' as const },
  { to: 'daily-card', label: 'Daily Card', crop: 'DAILY_CARD' as const },
] as const;

/** Profile as avatar-led astral identity scene */
export function MobileProfileScene() {
  const { demoSession, energy, userPresence, path } = useAstralWorld();

  return (
    <AstralWorldScene
      sceneId="PROFILE_AVATAR"
      overlay={
        <div className="aw-profile-scene-overlay">
          <AstralPortrait
            personId={demoSession.userId}
            name={demoSession.displayName}
            initials={demoSession.displayName[0]}
            size={72}
            showPresence
            className="aw-profile-avatar-hero"
          />
          <h1 className="aw-display aw-display--scene">{demoSession.displayName}</h1>
          <p className="aw-muted">Seeker · {demoSession.membershipBadge}</p>
          <p className="aw-muted">Energy: {energy.replace(/_/g, ' ')} · {userPresence.state.replace(/_/g, ' ')}</p>
        </div>
      }
      interaction={
        <div className="aw-profile-object-grid">
          {YWW_ITEMS.map((item, idx) => (
            <Link
              key={item.to}
              to={path(item.to)}
              className="aw-profile-portal"
              style={{
                left: `${6 + (idx % 2) * 48}%`,
                top: `${58 + Math.floor(idx / 2) * 20}%`,
                width: '44%',
                height: '18%',
              }}
            >
              <AstralScene crop={item.crop} minHeight="100%" responsive>
                <strong>{item.label}</strong>
              </AstralScene>
            </Link>
          ))}
          <Link to={path('journal')} className="aw-profile-portal aw-profile-portal--journey" style={{ left: '28%', top: '78%', width: '44%', height: '14%' }}>
            <span className="aw-label">My Journey</span>
          </Link>
        </div>
      }
    />
  );
}
