import {
  site00BldrFrameworkIconUrl,
  type BldrFrameworkIconId,
} from '../../config/bldr-framework-icons';
import { SITE00_ORIGIN_DESKTOP_COMPOSITION } from '../../config/origin-home-composition';

type BldrFrameworkIconProps = {
  id: BldrFrameworkIconId;
  title: string;
  className?: string;
};

const FRAMEWORK_ICON_PX = Math.round(SITE00_ORIGIN_DESKTOP_COMPOSITION.frameworkIconSizePx);

/** Approved production PNG — BLDR framework pillars on Origin expanded panel (desktop). */
export function BldrFrameworkIcon({ id, title, className = '' }: BldrFrameworkIconProps) {
  return (
    <img
      src={site00BldrFrameworkIconUrl(id)}
      alt={`${title} icon`}
      className={`site00-bldr-framework-icon ${className}`.trim()}
      width={FRAMEWORK_ICON_PX}
      height={FRAMEWORK_ICON_PX}
      loading="lazy"
      decoding="async"
    />
  );
}
