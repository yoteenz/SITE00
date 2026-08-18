import type { CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { LocationsDirectoryEntry } from '../../config/locations-directory';
import { resolveDirectoryEntryHref } from '../../config/locations-directory';
import { useSignedInFromStorage } from '../../../hooks/useSignedInFromStorage';
import { Site00DirectoryArrowIcon, Site00LockIcon } from '../mobile/Site00MobileIcons';

type DirectoryCardProps = {
  entry: LocationsDirectoryEntry;
  style?: CSSProperties;
};

export function DirectoryCard({ entry, style }: DirectoryCardProps) {
  const { pathname } = useLocation();
  const [isSignedIn] = useSignedInFromStorage();
  const locked = entry.requiresAuth && !isSignedIn;
  const href = resolveDirectoryEntryHref(entry, pathname, isSignedIn);

  const content = (
    <>
      <div className="site00-directory-card__copy">
        <span className="site00-directory-card__index">{entry.index}</span>
        <span className="site00-directory-card__title">{entry.title}</span>
        <span className="site00-directory-card__description">
          {entry.descriptionLines[0]}
          <br />
          {entry.descriptionLines[1]}
        </span>
        {locked ? (
          <span className="site00-directory-card__auth">
            <Site00LockIcon size={12} />
            <span>
              SIGN IN
              <br />
              TO ENTER
            </span>
          </span>
        ) : null}
      </div>
      <span className="site00-directory-card__arrow" aria-hidden="true">
        <Site00DirectoryArrowIcon size={18} />
      </span>
    </>
  );

  if (!entry.enabled) {
    return (
      <div className="site00-directory-card site00-directory-card--disabled" style={style} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link
      to={href}
      className={`site00-directory-card ${locked ? 'site00-directory-card--locked' : ''}`.trim()}
      style={style}
      aria-label={
        locked
          ? `${entry.title} — sign in to enter`
          : `${entry.title} — ${entry.descriptionLines.join(' ')}`
      }
    >
      {content}
    </Link>
  );
}
