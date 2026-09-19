import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  experienceWorkspacePath,
  resolveExperienceSlugFromSplat,
  resolveWorkspaceTabFromSplat,
} from '../../../shared/site00-experience-workspace/paths.js';
import {
  listFixtureExperiencesForProject,
  type ExperienceWorkspaceTab,
} from '../../../shared/site00-experience-workspace/index.js';
import {
  loadExperienceWorkspaceBundle,
  resolveDefaultExperienceSlug,
  setActiveExperienceSlug,
} from '../../../shared/site00-experience-workspace/store.js';

const STORAGE_EVENT = 'site00-experience-workspace-storage';

function subscribeExperienceStorage(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener(STORAGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(STORAGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

function notifyExperienceStorage(): void {
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function useExperienceWorkspace(projectSlug: string, splat: string | undefined) {
  const navigate = useNavigate();
  const storageVersion = useSyncExternalStore(subscribeExperienceStorage, () =>
    resolveDefaultExperienceSlug(projectSlug),
  );

  const experienceList = useMemo(
    () => listFixtureExperiencesForProject(projectSlug),
    [projectSlug],
  );

  const activeExperienceSlug = useMemo(() => {
    void storageVersion;
    const fromPath = resolveExperienceSlugFromSplat(
      projectSlug,
      splat,
      resolveDefaultExperienceSlug(projectSlug),
    );
    return fromPath;
  }, [projectSlug, splat, storageVersion]);

  const activeTab = useMemo(
    () => resolveWorkspaceTabFromSplat(splat),
    [splat],
  );

  const bundle = useMemo(() => {
    if (!activeExperienceSlug) return null;
    return loadExperienceWorkspaceBundle(projectSlug, activeExperienceSlug);
  }, [projectSlug, activeExperienceSlug, storageVersion]);

  const activeExperience = useMemo(
    () => bundle?.experiences.find((e) => e.slug === activeExperienceSlug) ?? null,
    [bundle, activeExperienceSlug],
  );

  const setExperience = useCallback(
    (experienceSlug: string) => {
      setActiveExperienceSlug(projectSlug, experienceSlug);
      notifyExperienceStorage();
      navigate(experienceWorkspacePath(projectSlug, experienceSlug, activeTab));
    },
    [navigate, projectSlug, activeTab],
  );

  const setTab = useCallback(
    (tab: ExperienceWorkspaceTab) => {
      if (!activeExperienceSlug) return;
      navigate(experienceWorkspacePath(projectSlug, activeExperienceSlug, tab));
    },
    [navigate, projectSlug, activeExperienceSlug],
  );

  return {
    experienceList,
    activeExperienceSlug,
    activeExperience,
    activeTab,
    bundle,
    setExperience,
    setTab,
  };
}
