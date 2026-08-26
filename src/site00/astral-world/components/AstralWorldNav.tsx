import { NavLink } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';
import type { EnergyState } from '../../../../shared/site00-astral-world/types.js';

const ENERGY_OPTIONS: { value: EnergyState; label: string }[] = [
  { value: 'ALIGNED_OPEN', label: 'Aligned & Open' },
  { value: 'NEED_CLARITY', label: 'Need Clarity' },
  { value: 'NEED_COMFORT', label: 'Need Comfort' },
  { value: 'CURIOUS', label: 'Curious' },
  { value: 'CELEBRATING', label: 'Celebrating' },
  { value: 'PRIVATE', label: 'Private' },
];

export function AstralWorldDesktopNav() {
  const { path, energy, setEnergy, checkIn, demoSession, allowFriendsToJoin, setAllowFriendsToJoin, setPrivacy, userPresence } = useAstralWorld();

  const navItems = [
    { to: path('home'), label: 'Home', end: true },
    { to: path('astrea'), label: 'Astréa' },
    { to: path('readers'), label: 'Readers' },
    { to: path('friends'), label: 'Friends' },
    { to: path('journal'), label: 'Journal' },
    { to: path('profile'), label: 'Profile' },
  ];

  return (
    <aside className="aw-shell__nav aw-desktop-only" aria-label="Astral World navigation">
      <div className="aw-brand">
        Astral World
        <span className="aw-brand__sub">Live Prototype</span>
      </div>
      <nav>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `aw-nav-link${isActive ? ' aw-nav-link--active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="aw-user-card">
        <div className="aw-user-card__name">{demoSession.displayName}</div>
        <p className="aw-muted" style={{ fontSize: '0.65rem', margin: '0.25rem 0' }}>{demoSession.membershipBadge}</p>
        <label className="aw-label" htmlFor="aw-energy">Your Energy</label>
        <select
          id="aw-energy"
          className="aw-energy-select"
          value={energy}
          onChange={(e) => setEnergy(e.target.value as EnergyState)}
          aria-label="Your energy state"
        >
          {ENERGY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <label className="aw-label" htmlFor="aw-privacy" style={{ marginTop: '0.5rem' }}>Presence</label>
        <select
          id="aw-privacy"
          className="aw-energy-select"
          value={userPresence.privacy}
          onChange={(e) => setPrivacy(e.target.value as typeof userPresence.privacy)}
          aria-label="Presence privacy"
        >
          <option value="EVERYONE">Everyone</option>
          <option value="FRIENDS">Friends Only</option>
          <option value="HIDDEN">Hidden</option>
        </select>
        <label className="aw-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            type="checkbox"
            checked={allowFriendsToJoin}
            onChange={(e) => setAllowFriendsToJoin(e.target.checked)}
            aria-label="Allow friends to join me"
          />
          Allow friends to join me
        </label>
        <button type="button" className="aw-btn-checkin" onClick={checkIn}>Check In</button>
      </div>
    </aside>
  );
}

export function AstralWorldMobileNav() {
  const { path } = useAstralWorld();
  const tabs = [
    { to: path('home'), label: 'Home', end: true },
    { to: path('astrea'), label: 'World' },
    { to: path('journal'), label: 'Journal' },
    { to: path('friends'), label: 'Friends' },
    { to: path('profile'), label: 'Profile' },
  ];

  return (
    <nav className="aw-mobile-nav aw-mobile-only" aria-label="Mobile navigation">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `aw-mobile-nav__link${isActive ? ' aw-mobile-nav__link--active' : ''}`}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
