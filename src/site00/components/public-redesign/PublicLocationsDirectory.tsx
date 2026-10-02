import { Link, useLocation } from 'react-router-dom';
import {
  SITE00_LOCATIONS_SECTIONS,
  resolveDirectoryEntryHref,
  type LocationsDirectoryEntry,
} from '../../config/locations-directory';
import { site00AuthLockedAriaLabel } from '../../config/site00-copy';
import { useSignedInFromStorage } from '../../../hooks/useSignedInFromStorage';
import { Site00LockIcon } from '../mobile/Site00MobileIcons';
import { AssetSlot } from './AssetSlot';
import { PublicRedesignShell } from './PublicRedesignShell';
import { SpatialEnvironmentFrame } from './SpatialEnvironmentFrame';
import { StateNumeral } from './StateNumeral';

function ArrowCircle() {
  return (
    <span className="s00pr-locrow__go" aria-hidden="true">
      <svg viewBox="0 0 20 12" width="16" height="10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 6h17M13 1l5 5-5 5" />
      </svg>
    </span>
  );
}

const THUMB_SLOT: Record<string, string> = {
  bldr: 'CARD.LOCATIONS.BLDR',
  evolve: 'CARD.LOCATIONS.EVOLVE',
  sites: 'CARD.LOCATIONS.SITES',
  services: 'CARD.LOCATIONS.SERVICES',
  system: 'CARD.LOCATIONS.SYSTEM',
  about: 'CARD.LOCATIONS.ABOUT',
  journal: 'CARD.LOCATIONS.JOURNAL',
};

function LocationRow({ entry }: { entry: LocationsDirectoryEntry }) {
  const { pathname } = useLocation();
  const [isSignedIn] = useSignedInFromStorage();
  const locked = Boolean(entry.requiresAuth && !isSignedIn);
  const href = resolveDirectoryEntryHref(entry, pathname, isSignedIn);
  const slot = THUMB_SLOT[entry.id];

  const content = (
    <>
      {slot ? <AssetSlot slotId={slot} className="s00pr-locrow__thumb" /> : null}
      <span className="s00pr-locrow__copy">
        <span className="s00pr-locrow__index">
          {entry.index}
          <i aria-hidden="true" />
        </span>
        <span className="s00pr-locrow__title">{entry.title}</span>
        <span className="s00pr-locrow__desc">
          {entry.descriptionLines[0]}
          <br />
          {entry.descriptionLines[1]}
        </span>
        {locked ? (
          <span className="s00pr-locrow__lock">
            <Site00LockIcon size={11} />
            SIGN IN TO ENTER
          </span>
        ) : null}
      </span>
      <ArrowCircle />
    </>
  );

  if (!entry.enabled) {
    return (
      <div className="s00pr-locrow s00pr-locrow--disabled" aria-disabled="true">
        {content}
      </div>
    );
  }
  return (
    <Link
      to={href}
      className={`s00pr-locrow ${locked ? 's00pr-locrow--locked' : ''}`.trim()}
      aria-label={locked ? site00AuthLockedAriaLabel(entry.title) : `${entry.title} — ${entry.descriptionLines.join(' ')}`}
    >
      {content}
    </Link>
  );
}

/** LOCATIONS — directory of public destinations plus the signed-in space; same destinations and auth locks as before. */
export function PublicLocationsDirectory() {
  return (
    <PublicRedesignShell
      section="locations"
      headerVariant="directory"
      hideBottomNav
      authorityId="01_LOCATIONS_MAIN"
      className="s00pr-shell--locations"
      environment={<SpatialEnvironmentFrame slotId="ENV.LOCATIONS.ARCH" tone="arch" />}
    >
      <div className="s00pr-locations" data-locations-page="true">
        <header className="s00pr-locations__head">
          <h1 className="s00pr-locations__title">LOCATIONS</h1>
          <p className="s00pr-locations__sub">WHERE DO YOU NEED TO GO?</p>
        </header>
        {SITE00_LOCATIONS_SECTIONS.map((section) => (
          <section key={section.id} className="s00pr-locations__section" aria-label={`${section.title} DESTINATIONS`}>
            {section.id !== 'public-world' ? <h2 className="s00pr-locations__label">{section.title}</h2> : null}
            <div className="s00pr-locations__grid">
              <span className="s00pr-locations__spine" aria-hidden="true" />
              <ul className="s00pr-locations__list">
                {section.entries.map((entry) => (
                  <li key={entry.id} className="s00pr-locations__item">
                    <span className="s00pr-locations__dot" aria-hidden="true" />
                    <LocationRow entry={entry} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
        <p className="s00pr-locations__more" aria-hidden="true">
          <span className="s00pr-locations__ghost">
            <StateNumeral code="00" />
          </span>
          CONTINUE EXPLORING
        </p>
      </div>
    </PublicRedesignShell>
  );
}
