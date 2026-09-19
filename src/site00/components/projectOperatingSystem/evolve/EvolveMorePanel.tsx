/**
 * B5.9R4 — Evolve MORE secondary navigation surface (sheet / full panel).
 */

import { Link } from 'react-router-dom';
import { NDXIcon } from '../../../icons/ndx';
import { NDX_ICON_CONTEXT_SIZE } from '../../../../../shared/site00-studio-world-ui/icons/index.js';
import type { EvolveMoreItem } from '../../../../../shared/site00-projects/evolve/evolveSubshellTypes.js';
import { FounderWorkspacePopoverSurface } from '../../founderWorkspace/FounderWorkspacePopoverSurface';

type Props = {
  open: boolean;
  onClose: () => void;
  items: EvolveMoreItem[];
  mode: 'sheet' | 'page';
  previousTabLabel?: string;
};

export function EvolveMorePanel({ open, onClose, items, mode, previousTabLabel }: Props) {
  const content = (
    <div className="site00-evolve-more-panel__body">
      {mode === 'page' ? (
        <header className="site00-evolve-more-panel__header">
          <button type="button" className="site00-evolve-more-panel__back" onClick={onClose}>
            ← BACK{previousTabLabel ? ` TO ${previousTabLabel}` : ''}
          </button>
          <h2 className="site00-evolve-more-panel__title">MORE</h2>
          <p className="site00-evolve-more-panel__subtitle">SECONDARY EVOLVE SYSTEMS</p>
        </header>
      ) : (
        <p className="site00-evolve-more-panel__sheet-title">MORE DESTINATIONS</p>
      )}
      <ul className="site00-evolve-more-panel__list">
        {items.map((item) => (
          <li key={item.id}>
            <Link to={item.href} className="site00-evolve-more-panel__row" onClick={onClose}>
              <span className="site00-evolve-more-panel__icon" aria-hidden="true">
                <NDXIcon name={item.icon} size={NDX_ICON_CONTEXT_SIZE.menuRow} state="inactive" decorative />
              </span>
              <span className="site00-evolve-more-panel__label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      {mode === 'sheet' && previousTabLabel ? (
        <button type="button" className="site00-evolve-more-panel__close" onClick={onClose}>
          BACK TO {previousTabLabel}
        </button>
      ) : null}
    </div>
  );

  if (mode === 'page') {
    if (!open) return null;
    return <div className="site00-evolve-more-panel site00-evolve-more-panel--page">{content}</div>;
  }

  return (
    <FounderWorkspacePopoverSurface
      open={open}
      onClose={onClose}
      placement="viewport-bottom-right"
      widthMode="menu"
      bottomOffsetPx={72}
      ariaRole="menu"
      ariaLabel="Evolve more destinations"
      className="site00-evolve-more-panel site00-evolve-more-panel--sheet"
      backdropClassName="site00-evolve-more-panel__backdrop"
    >
      {content}
    </FounderWorkspacePopoverSurface>
  );
}
