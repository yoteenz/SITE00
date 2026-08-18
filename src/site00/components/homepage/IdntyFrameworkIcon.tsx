import {
  site00IdntyFrameworkIconUrl,
  type IdntyFrameworkIconId,
} from '../../config/idnty-framework-icons';
import { SITE00_ORIGIN_DESKTOP_COMPOSITION } from '../../config/origin-home-composition';

type IdntyFrameworkIconProps = {
  id: IdntyFrameworkIconId;
  title: string;
  className?: string;
};

const FRAMEWORK_ICON_PX = Math.round(SITE00_ORIGIN_DESKTOP_COMPOSITION.frameworkIconSizePx);

/** Approved production PNG — IDNTY framework pillars on Origin expanded panel (desktop). */
export function IdntyFrameworkIcon({ id, title, className = '' }: IdntyFrameworkIconProps) {
  return (
    <img
      src={site00IdntyFrameworkIconUrl(id)}
      alt={`${title} icon`}
      className={`site00-idnty-framework-icon ${className}`.trim()}
      width={FRAMEWORK_ICON_PX}
      height={FRAMEWORK_ICON_PX}
      loading="lazy"
      decoding="async"
    />
  );
}
