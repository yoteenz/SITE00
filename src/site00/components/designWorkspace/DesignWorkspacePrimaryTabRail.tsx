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
  pendingActionCounts?: Partial<Record<DesignWorkspacePrimaryTab, number>>;
};

export function DesignWorkspacePrimaryTabRail({ activeTab, onTabChange, pendingActionCounts }: Props) {
  return (
    <nav className="site00-dw-v3-tabs" aria-label="Design workspace tabs">
      {DESIGN_WORKSPACE_PRIMARY_TABS.map((tab) => {
        const pending = pendingActionCounts?.[tab] ?? 0;
        return (
          <button
            key={tab}
            type="button"
            className={`site00-dw-v3-tabs__tab${activeTab === tab ? ' is-active' : ''}${pending > 0 ? ' has-pending-action' : ''}`}
            onClick={() => onTabChange(tab)}
            aria-current={activeTab === tab ? 'page' : undefined}
          >
            {PRIMARY_TAB_LABELS[tab]}
            {pending > 0 ? <span className="site00-dw-v3-tabs__badge">{pending}</span> : null}
          </button>
        );
      })}
    </nav>
  );
}
