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

type NavItem = { to: string; label: string; end?: boolean };

const NAV_ITEMS: NavItem[] = [
  { to: '/projects/astral-world/experience/home', label: 'Home', end: true },
  { to: '/projects/astral-world/experience/astrea', label: 'Astréa' },
  { to: '/projects/astral-world/experience/readers', label: 'Readers' },
  { to: '/projects/astral-world/experience/friends', label: 'Friends' },
  { to: '/projects/astral-world/experience/journal', label: 'Journal' },
  { to: '/projects/astral-world/experience/profile', label: 'Profile' },
];

export function AstralWorldDesktopNav() {
  const { energy, setEnergy, checkIn } = useAstralWorld();

  return (
    <aside className="aw-shell__nav aw-desktop-only" aria-label="Astral World navigation">
      <div className="aw-brand">
        Astral World
        <span className="aw-brand__sub">Experience Prototype</span>
      </div>
      <nav>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `aw-nav-link${isActive ? ' aw-nav-link--active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
        <NavLink to="/projects/astral-world/experience/home#membership" className="aw-nav-link">
          Membership
        </NavLink>
        <NavLink to="/projects/astral-world/experience/home#shop" className="aw-nav-link">
          Shop
        </NavLink>
      </nav>
      <div className="aw-user-card">
        <div className="aw-user-card__name">Rea</div>
        <label className="aw-label" htmlFor="aw-energy">
          Your Energy
        </label>
        <select
          id="aw-energy"
          className="aw-energy-select"
          value={energy}
          onChange={(e) => setEnergy(e.target.value as EnergyState)}
          aria-label="Your energy state"
        >
          {ENERGY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button type="button" className="aw-btn-checkin" onClick={checkIn}>
          Check In
        </button>
      </div>
    </aside>
  );
}

export function AstralWorldMobileNav() {
  const tabs = [
    { to: '/projects/astral-world/experience/home', label: 'Home', end: true },
    { to: '/projects/astral-world/experience/astrea', label: 'World' },
    { to: '/projects/astral-world/experience/journal', label: 'Journal' },
    { to: '/projects/astral-world/experience/friends', label: 'Friends' },
    { to: '/projects/astral-world/experience/profile', label: 'Profile' },
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
