import { NavLink } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';
import type { EnergyState } from '../../../../shared/site00-astral-world/types.js';
import {
  NavIconFriends,
  NavIconHome,
  NavIconJournal,
  NavIconProfile,
  NavIconReaders,
  NavIconWorld,
} from './AstralDestIcons';

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
    { to: path('home'), label: 'Home', end: true, Icon: NavIconHome },
    { to: path('astrea'), label: 'Astréa', Icon: NavIconWorld },
    { to: path('readers'), label: 'Readers', Icon: NavIconReaders },
    { to: path('friends'), label: 'Friends', Icon: NavIconFriends },
    { to: path('journal'), label: 'Journal', Icon: NavIconJournal },
    { to: path('profile'), label: 'Profile', Icon: NavIconProfile },
  ];

  return (
    <aside className="aw-shell__nav aw-desktop-only aw-ref-nav" aria-label="Astral World navigation">
      <div className="aw-brand">
        Astral World
        <span className="aw-brand__sub">Guidance · Community · Magic</span>
      </div>
      <nav>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `aw-nav-link${isActive ? ' aw-nav-link--active' : ''}`}
          >
            <item.Icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="aw-user-card aw-ref-user-card">
        <div className="aw-avatar aw-ref-user-avatar">{demoSession.displayName.charAt(0)}</div>
        <div className="aw-user-card__name">{demoSession.displayName}</div>
        <p className="aw-ref-member-badge">{demoSession.membershipBadge}</p>
        <p className="aw-muted aw-ref-user-stats">★ 1,245 · ◆ 34</p>
        <label className="aw-label" htmlFor="aw-energy">Your Energy</label>
        <div className="aw-ref-energy-compass" aria-hidden />
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
        <label className="aw-label aw-ref-join-label">
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
    { to: path('home'), label: 'Home', end: true, Icon: NavIconHome },
    { to: path('astrea'), label: 'World', Icon: NavIconWorld },
    { to: path('journal'), label: 'Journal', Icon: NavIconJournal },
    { to: path('friends'), label: 'Friends', Icon: NavIconFriends },
    { to: path('profile'), label: 'Profile', Icon: NavIconProfile },
  ];

  return (
    <nav className="aw-mobile-nav aw-mobile-only aw-ref-mobile-nav" aria-label="Mobile navigation">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `aw-mobile-nav__link${isActive ? ' aw-mobile-nav__link--active' : ''}`}
        >
          <tab.Icon size={20} />
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
