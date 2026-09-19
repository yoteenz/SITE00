/**
 * B5.10 — Project repository sync service (server-side).
 */

import { getProjectOperatingAdapter } from '../../../shared/site00-projects/adapters/index.js';
import { buildProjectCodebaseIntelligence } from '../../../shared/site00-projects/technical/buildProjectCodebaseIntelligence.js';
import type { ProjectCodebaseIntelligence } from '../../../shared/site00-projects/technical/types.js';
import { getProjectRepositoryBinding } from '../../../shared/site00-projects/technical/projectRepositoryRegistry.js';
import {
  buildDisconnectedConnection,
  fetchGitHubProjectSnapshot,
} from './githubProjectConnector.js';
import { getProjectMilestones, getProjectNotes } from './projectTechnicalMemoryStore.js';
import { resolveSite00Project } from './projectResolver.js';

const cache = new Map<string, { intelligence: ProjectCodebaseIntelligence; cachedAt: number }>();
const STALE_MS = 1000 * 60 * 15;

export const ProjectRepositorySyncService = {
  async syncProject(projectId: string, mode: 'MANUAL_SYNC' | 'ON_LOAD_IF_STALE' = 'ON_LOAD_IF_STALE'): Promise<ProjectCodebaseIntelligence> {
    const cached = cache.get(projectId);
    if (mode === 'ON_LOAD_IF_STALE' && cached && Date.now() - cached.cachedAt < STALE_MS) {
      return cached.intelligence;
    }

    const binding = getProjectRepositoryBinding(projectId);
    const detail = await resolveSite00Project(projectId).catch(() => null);
    const adapter = getProjectOperatingAdapter(projectId);
    const ctx = {
      projectDetail: detail as import('../../../shared/site00-projects/types.js').Site00ProjectDetail | null,
    };
    const codebaseState = adapter.buildCodebaseState(ctx);
    const declaredPhase = detail?.currentPhase ?? null;

    let githubSnapshot = null;
    let connection = buildDisconnectedConnection(projectId, 'GITHUB NOT CONFIGURED OR REPOSITORY UNRESOLVED');

    if (binding.status === 'BOUND') {
      try {
        githubSnapshot = await fetchGitHubProjectSnapshot(projectId);
        connection = githubSnapshot.connection;
      } catch (e) {
        connection = buildDisconnectedConnection(
          projectId,
          e instanceof Error ? e.message : 'SYNC FAILED',
        );
      }
    } else {
      connection = buildDisconnectedConnection(projectId, binding.notes ?? 'REPOSITORY UNRESOLVED');
    }

    const intelligence = buildProjectCodebaseIntelligence({
      projectId,
      declaredPhase,
      codebaseState,
      githubSnapshot,
      connection,
      notes: getProjectNotes(projectId),
      milestones: getProjectMilestones(projectId),
      syncMode: mode === 'MANUAL_SYNC' ? 'MANUAL_SYNC' : 'ON_LOAD_IF_STALE',
    });

    cache.set(projectId, { intelligence, cachedAt: Date.now() });
    return intelligence;
  },

  invalidate(projectId: string): void {
    cache.delete(projectId);
  },

  getCached(projectId: string): ProjectCodebaseIntelligence | null {
    return cache.get(projectId)?.intelligence ?? null;
  },
};

export async function getProjectTechnicalIntelligence(projectId: string): Promise<ProjectCodebaseIntelligence> {
  return ProjectRepositorySyncService.syncProject(projectId, 'ON_LOAD_IF_STALE');
}
