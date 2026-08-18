import { Site00DirectionInterchangeIcon } from '../mobile/Site00MobileIcons';

/** Decorative vertical interchange marker between SITE and WORLD cards. */
export function DirectionInterchange() {
  return (
    <div className="site00-bldr-direction-interchange" aria-hidden="true">
      <span className="site00-bldr-direction-interchange__circle">
        <Site00DirectionInterchangeIcon size={14} />
      </span>
    </div>
  );
}
