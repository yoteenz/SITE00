/**
 * B5.9R1 — Hook for universal project operating system state.
 */

import { useMemo } from 'react';
import type { Site00ProjectDetail } from '../../../shared/site00-projects/types.js';
import { getProjectOperatingAdapter } from '../../../shared/site00-projects/adapters/index.js';
import type { GeneralizedProjectOperatingState } from '../../../shared/site00-projects/generalizedProjectOperatingState.js';
import type { ProjectCapabilityManifest } from '../../../shared/site00-projects/projectCapabilityManifest.js';
import { resolveVisibleModules } from '../../../shared/site00-projects/projectCapabilityManifest.js';
import { useProjectViewMode } from '../context/ProjectViewModeContext.js';
import { getProjectStateVersion } from '../services/projectModuleSyncService.js';

export function useProjectOperatingSystem(
  projectSlug: string,
  project: Site00ProjectDetail | null,
): {
  operatingState: GeneralizedProjectOperatingState | null;
  manifest: ProjectCapabilityManifest | null;
  visibleModules: string[];
  loading: boolean;
} {
  const { viewMode } = useProjectViewMode();
  const stateVersion = getProjectStateVersion();

  return useMemo(() => {
    if (!projectSlug) {
      return { operatingState: null, manifest: null, visibleModules: [], loading: true };
    }

    const adapter = getProjectOperatingAdapter(projectSlug);
    const ctx = { projectDetail: project, projectStateVersion: stateVersion };
    const manifest = adapter.buildManifest(ctx);
    const operatingState = adapter.buildOperatingState(ctx);
    const visibleModules = resolveVisibleModules(manifest, viewMode);

    return {
      operatingState,
      manifest,
      visibleModules,
      loading: false,
    };
  }, [project, projectSlug, stateVersion, viewMode]);
}
