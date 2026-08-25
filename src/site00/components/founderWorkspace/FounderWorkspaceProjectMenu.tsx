import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { NDXIcon } from '../../icons/ndx';
import { NDX_ICON_CONTEXT_SIZE } from '../../../../shared/site00-studio-world-ui/icons/index.js';
import type { NdxProjectMenuItem } from '../../config/ndxFounderWorkspaceIcons';
import { NDX_VR_REGION, vrRegionAttr } from '../../config/ndxVisualRegionIds';

type FounderWorkspaceProjectMenuProps = {
  open: boolean;
  onClose: () => void;
  items: NdxProjectMenuItem[];
  overflowItems?: Array<{ id: string; label: string; href: string; icon: NdxProjectMenuItem['icon'] }>;
};

export function FounderWorkspaceProjectMenu({ open, onClose, items, overflowItems = [] }: FounderWorkspaceProjectMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button type="button" className="site00-fws-menu-backdrop" aria-label="Close menu" onClick={onClose} />
      <div
        ref={panelRef}
        className="site00-fws-menu"
        {...vrRegionAttr(NDX_VR_REGION.projectMenu)}
        role="menu"
        aria-label="Project menu"
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
      </div>
    </>
  );
}
