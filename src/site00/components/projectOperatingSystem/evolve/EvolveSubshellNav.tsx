/**
 * B5.9R4 — Evolve subshell bottom / side nav with approved NDX icons.
 */

import { Link } from 'react-router-dom';
import { NDXBottomNavIcon } from '../../../icons/ndx/NDXBottomNavIcon';
import type { ProjectEvolveSubnavItem } from '../../../../../shared/site00-projects/evolve/types.js';
import type { EvolveSubshellTabId } from '../../../../../shared/site00-projects/evolve/evolveSubshellTypes.js';
import { site00ProjectEvolveTabPath } from '../../../config/evolveSubshellRoutes';

type Props = {
  projectSlug: string;
  tabs: ProjectEvolveSubnavItem[];
  activeTab: EvolveSubshellTabId;
  moreOpen: boolean;
  onMoreClick: () => void;
  layout: 'mobile' | 'desktop';
};

export function EvolveSubshellNav({
  projectSlug,
  tabs,
  activeTab,
  moreOpen,
  onMoreClick,
  layout,
}: Props) {
  const navClass =
    layout === 'mobile'
      ? 'site00-evolve-subshell__nav site00-evolve-subshell__nav--mobile'
      : 'site00-evolve-subshell__nav site00-evolve-subshell__nav--desktop';

  return (
    <nav className={navClass} aria-label="Evolve workspace">
      {tabs.map((tab) => {
        const tabId = tab.id as EvolveSubshellTabId;
        const iconName = tab.icon ?? 'more';
        const isMore = tabId === 'MORE';
        const active = isMore ? moreOpen || activeTab === 'MORE' : activeTab === tabId;
        const iconState = active ? 'active' : 'inactive';

        if (isMore) {
          return (
            <button
              key={tab.id}
              type="button"
              className={`site00-evolve-subshell__nav-item${active ? ' site00-evolve-subshell__nav-item--active' : ''}`}
              onClick={onMoreClick}
              aria-label="More evolve destinations"
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
            >
              <span className="site00-evolve-subshell__nav-icon" aria-hidden="true">
                <NDXBottomNavIcon name={iconName} state={iconState} decorative />
              </span>
              <span className="site00-evolve-subshell__nav-label">{tab.label}</span>
            </button>
          );
        }

        return (
          <Link
            key={tab.id}
            to={site00ProjectEvolveTabPath(projectSlug, tabId)}
            className={`site00-evolve-subshell__nav-item${active ? ' site00-evolve-subshell__nav-item--active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <span className="site00-evolve-subshell__nav-icon" aria-hidden="true">
              <NDXBottomNavIcon name={iconName} state={iconState} decorative />
            </span>
            <span className="site00-evolve-subshell__nav-label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
