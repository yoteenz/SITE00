import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { NDXIcon } from '../../icons/ndx';
import { NDX_ICON_CONTEXT_SIZE } from '../../../../shared/site00-studio-world-ui/icons/index.js';
import type { NdxProjectMenuItem } from '../../config/ndxFounderWorkspaceIcons';
import { NDX_VR_REGION } from '../../config/ndxVisualRegionIds';
import { FounderWorkspacePopoverSurface } from './FounderWorkspacePopoverSurface';

type FounderWorkspaceProjectMenuProps = {
  open: boolean;
  onClose: () => void;
  items: NdxProjectMenuItem[];
  overflowItems?: Array<{ id: string; label: string; href: string; icon: NdxProjectMenuItem['icon'] }>;
};

export function FounderWorkspaceProjectMenu({ open, onClose, items, overflowItems = [] }: FounderWorkspaceProjectMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <FounderWorkspacePopoverSurface
      open={open}
      onClose={onClose}
      placement="viewport-bottom-right"
      widthMode="menu"
      bottomOffsetPx={72}
      ariaRole="menu"
      ariaLabel="Project menu"
      className="site00-fws-menu"
      backdropClassName="site00-fws-menu-backdrop"
      vrRegion={NDX_VR_REGION.projectMenu}
      panelRef={panelRef}
    >
      {items.map((item) => (
        <Link key={item.id} to={item.href} className="site00-fws-menu__row" role="menuitem" onClick={onClose}>
          <span className="site00-fws-menu__icon" aria-hidden="true">
            <NDXIcon name={item.icon} size={NDX_ICON_CONTEXT_SIZE.menuRow} state="inactive" decorative />
          </span>
          <span className="site00-fws-menu__label">{item.label}</span>
        </Link>
      ))}
      {overflowItems.length > 0 ? (
        <div className="site00-fws-menu__section">
          <p className="site00-fws-menu__section-title">MORE DESTINATIONS</p>
          {overflowItems.map((item) => (
            <Link key={item.id} to={item.href} className="site00-fws-menu__row" role="menuitem" onClick={onClose}>
              <span className="site00-fws-menu__icon" aria-hidden="true">
                <NDXIcon name={item.icon} size={NDX_ICON_CONTEXT_SIZE.menuRow} state="inactive" decorative />
              </span>
              <span className="site00-fws-menu__label">{item.label}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </FounderWorkspacePopoverSurface>
  );
}
