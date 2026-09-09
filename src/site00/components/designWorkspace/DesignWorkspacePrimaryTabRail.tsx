/**
 * P0.VR.6 — Primary tab rail: REFERENCES · ASSETS · PAGES · HISTORY · MORE
 */

import {
  DESIGN_WORKSPACE_PRIMARY_TABS,
  PRIMARY_TAB_LABELS,
  type DesignWorkspacePrimaryTab,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6/index.js';

type Props = {
  activeTab: DesignWorkspacePrimaryTab;
  onTabChange: (tab: DesignWorkspacePrimaryTab) => void;
};

export function DesignWorkspacePrimaryTabRail({ activeTab, onTabChange }: Props) {
  return (
    <nav className="site00-dw-v3-tabs" aria-label="Design workspace tabs">
      {DESIGN_WORKSPACE_PRIMARY_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          className={`site00-dw-v3-tabs__tab${activeTab === tab ? ' is-active' : ''}`}
          onClick={() => onTabChange(tab)}
          aria-current={activeTab === tab ? 'page' : undefined}
        >
          {PRIMARY_TAB_LABELS[tab]}
        </button>
      ))}
    </nav>
  );
}
