import {
  site00IdntyBrandStateIconUrl,
  type IdntyBrandStateIconId,
} from '../../config/idnty-brand-state-icons';

type IdntyBrandStateIconProps = {
  id: IdntyBrandStateIconId;
  title: string;
  className?: string;
};

/** Approved production PNG — IDNTY brand state cards and investment guide on /idnty/state. */
export function IdntyBrandStateIcon({ id, title, className = '' }: IdntyBrandStateIconProps) {
  const url = site00IdntyBrandStateIconUrl(id);

  if (!url) {
    return (
      <span className={`site00-idnty-brand-state-icon site00-idnty-brand-state-icon--fallback ${className}`.trim()} aria-hidden="true">
        <svg width={64} height={64} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="32" cy="32" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path d="M32 8V16M32 48V56M8 32H16M48 32H56" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </span>
    );
  }

  return (
    <img
      src={url}
      alt={`${title} icon`}
      className={`site00-idnty-brand-state-icon ${className}`.trim()}
      width={64}
      height={64}
      loading="lazy"
      decoding="async"
    />
  );
}
