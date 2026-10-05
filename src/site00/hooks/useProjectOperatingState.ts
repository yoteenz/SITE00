/**
 * B5.7 — Hydrate canonical ProjectOperatingState for all project module tabs.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  buildProjectOperatingState,
  type ProjectOperatingState,
} from '../../../shared/site00-brand-lore/founderWorkspace/projectOperatingState/index.js';
import type { ContentOperationsRun } from '../../../shared/site00-brand-lore/contentOperations/types.js';
import type { MarketingCampaignProductionRun } from '../../../shared/site00-studio-world-production/marketingCampaignProduction/types.js';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { fetchCampaignPackage } from '../components/founderWorkspace/entry001CampaignPackage/campaignPackageApi.js';
import {
  getProjectStateVersion,
  subscribeProjectStateVersion,
} from '../services/projectModuleSyncService.js';
import { deriveEntry001OperatingInput } from '../utils/deriveEntry001OperatingInput.js';

export type UseProjectOperatingStateResult = {
  state: ProjectOperatingState | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useProjectOperatingState(projectSlug: string): UseProjectOperatingStateResult {
  const [state, setState] = useState<ProjectOperatingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(getProjectStateVersion());

  useEffect(() => {
    return subscribeProjectStateVersion(() => setVersion(getProjectStateVersion()));
  }, []);

  const refresh = useCallback(async () => {
    if (!projectSlug) return;
    setLoading(true);
    setError(null);
    try {
      const [contentOps, campaignProduction, pkg] = await Promise.all([
        site00ProjectsApi.contentOperationsGet(projectSlug).catch(() => null),
        site00ProjectsApi.campaignProductionGet(projectSlug).catch(() => null),
        fetchCampaignPackage().catch(() => null),
      ]);

      const entry001Input = deriveEntry001OperatingInput(pkg);

      const built = buildProjectOperatingState({
        projectId: projectSlug,
        projectStateVersion: version,
        contentOpsRun: (contentOps?.run ?? null) as ContentOperationsRun | null,
        campaignProduction: (campaignProduction?.run ?? null) as MarketingCampaignProductionRun | null,
        entry001: entry001Input,
        expressionEngine: {
          entry002Stage: 'STORYBOARD',
          entry003NeedsReview: true,
        },
        characterContinuity: {
          systemReady: true,
          canonPartial: true,
          visualAuthorityNeeded: true,
        },
      });

      setState(built);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load project state');
    } finally {
      setLoading(false);
    }
  }, [projectSlug, version]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { state, loading, error, refresh };
}
