import type { MobileSiteNavIconId } from '../../config/mobile-site-nav';
import { site00MobileNavIconUrl } from '../../config/mobile-nav-icons';
import {
  SITE00_MOBILE_NAV_ICON_CENTER_SIZE,
  SITE00_MOBILE_NAV_ICON_DEFAULT_SIZE,
} from './site00MobileNavIconGeometry';

type Site00MobileNavAssetIconProps = {
  icon: MobileSiteNavIconId;
  center?: boolean;
  className?: string;
};

/** Approved production PNG — mobile bottom-nav bay icons. */
export function Site00MobileNavAssetIcon({ icon, center = false, className = '' }: Site00MobileNavAssetIconProps) {
  const size = center ? SITE00_MOBILE_NAV_ICON_CENTER_SIZE : SITE00_MOBILE_NAV_ICON_DEFAULT_SIZE;

  return (
    <img
      src={site00MobileNavIconUrl(icon)}
      alt=""
      className={`site00-mobile-nav__asset ${className}`.trim()}
      width={size}
      height={size}
      decoding="async"
    />
  );
}
