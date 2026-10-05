/**
 * B5.9R4 — Evolve internal subshell (tab nav + workspace + MORE panel).
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ProjectEvolveSubnavItem } from '../../../../../shared/site00-projects/evolve/types.js';
import type { EvolveMoreItem, EvolveSubshellTabId } from '../../../../../shared/site00-projects/evolve/evolveSubshellTypes.js';
import { useSite00OriginWideViewport } from '../../shell/useSite00OriginWideViewport';
import { resolveEvolveTabFromPath, site00ProjectEvolveTabPath } from '../../../config/evolveSubshellRoutes';
import { EvolveSubshellNav } from './EvolveSubshellNav';
import { EvolveMorePanel } from './EvolveMorePanel';
import '../../../styles/site00-evolve-subshell.css';

type Props = {
  projectSlug: string;
  tabs: ProjectEvolveSubnavItem[];
  moreItems: EvolveMoreItem[];
  renderWorkspace: (screenId: string, activeTab: EvolveSubshellTabId) => ReactNode;
  resolveScreenId: (tabId: EvolveSubshellTabId) => string;
};

export function EvolveSubshell({
  projectSlug,
  tabs,
  moreItems,
  renderWorkspace,
  resolveScreenId,
}: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const isWide = useSite00OriginWideViewport();
  const activeTab = resolveEvolveTabFromPath(location.pathname, projectSlug);
  const [moreOpen, setMoreOpen] = useState(activeTab === 'MORE');
  const previousTabRef = useRef<EvolveSubshellTabId>('CAMPAIGNS');

  useEffect(() => {
    if (activeTab !== 'MORE') {
      previousTabRef.current = activeTab;
      setMoreOpen(false);
    } else {
      setMoreOpen(true);
    }
  }, [activeTab]);

  const previousTabLabel = tabs.find((t) => t.id === previousTabRef.current)?.label ?? 'CAMPAIGNS';

  const handleMoreClick = useCallback(() => {
    if (activeTab === 'MORE') {
      navigate(site00ProjectEvolveTabPath(projectSlug, previousTabRef.current));
      return;
    }
    navigate(site00ProjectEvolveTabPath(projectSlug, 'MORE'));
  }, [activeTab, navigate, projectSlug]);

  const handleMoreClose = useCallback(() => {
    navigate(site00ProjectEvolveTabPath(projectSlug, previousTabRef.current));
  }, [navigate, projectSlug]);

  const workspaceTab: EvolveSubshellTabId =
    activeTab === 'MORE' ? previousTabRef.current : activeTab;
  const screenId = resolveScreenId(workspaceTab);
  const showMorePage = activeTab === 'MORE';

  return (
    <div
      className="site00-evolve-subshell"
      data-evolve-tab={activeTab}
      data-evolve-subshell="true"
    >
      {isWide ? (
        <EvolveSubshellNav
          projectSlug={projectSlug}
          tabs={tabs}
          activeTab={activeTab}
          moreOpen={moreOpen}
          onMoreClick={handleMoreClick}
          layout="desktop"
        />
      ) : null}

      <div className="site00-evolve-subshell__workspace">
        {showMorePage ? (
          <EvolveMorePanel
            open
            onClose={handleMoreClose}
            items={moreItems}
            mode="page"
            previousTabLabel={previousTabLabel}
          />
        ) : (
          renderWorkspace(screenId, workspaceTab)
        )}
      </div>

      {!isWide ? (
        <EvolveSubshellNav
          projectSlug={projectSlug}
          tabs={tabs}
          activeTab={activeTab}
          moreOpen={moreOpen}
          onMoreClick={handleMoreClick}
          layout="mobile"
        />
      ) : null}
    </div>
  );
}
