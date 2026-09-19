/**
 * P0.VR.3M.1 — Canonical SITE 00 icons for Design workspace host nav.
 */

import { Site00CrosshairIcon } from '../../icons/Site00CrosshairIcon';
import { Site00ProjectsIcon } from '../../icons/Site00ProjectsIcon';
import {
  Site00BellIcon,
  Site00CubeIcon,
  Site00GlobeIcon,
  Site00LayersIcon,
  Site00MonitorIcon,
  Site00MoreIcon,
  Site00TokenIcon,
} from '../../icons/Site00HubIcons';

const NAV_ICON_SIZE = 16;

export function DesignWorkspaceNavIcon({ navId }: { navId: string }) {
  switch (navId) {
    case 'design':
      return <Site00LayersIcon size={NAV_ICON_SIZE} className="site00-dw-shell__nav-icon-svg" />;
    case 'projects':
      return <Site00ProjectsIcon size={NAV_ICON_SIZE} className="site00-dw-shell__nav-icon-svg" />;
    case 'blueprints':
      return <Site00CubeIcon size={NAV_ICON_SIZE} className="site00-dw-shell__nav-icon-svg" />;
    case 'asset-vault':
      return <Site00TokenIcon size={NAV_ICON_SIZE} className="site00-dw-shell__nav-icon-svg" />;
    case 'system':
      return <Site00MonitorIcon size={NAV_ICON_SIZE} className="site00-dw-shell__nav-icon-svg" />;
    default:
      return <Site00GlobeIcon size={NAV_ICON_SIZE} className="site00-dw-shell__nav-icon-svg" />;
  }
}

export function DesignWorkspaceBrandMark() {
  return <Site00CrosshairIcon size={18} className="site00-dw-shell__brand-icon" />;
}

export function DesignWorkspaceBellIcon({ active }: { active?: boolean }) {
  return (
    <Site00BellIcon
      size={18}
      className={`site00-dw-shell__host-icon${active ? ' is-active' : ''}`}
    />
  );
}

export function DesignWorkspaceMoreIcon({ active }: { active?: boolean }) {
  return (
    <Site00MoreIcon
      size={18}
      className={`site00-dw-shell__host-icon${active ? ' is-active' : ''}`}
    />
  );
}
