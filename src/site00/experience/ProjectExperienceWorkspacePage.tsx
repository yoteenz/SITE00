import { useCallback, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getSite00ManagedProject } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js';
import { experienceWorkspacePath } from '../../../shared/site00-experience-workspace/paths.js';
import { useSite00OriginWideViewport } from '../components/shell/useSite00OriginWideViewport';
import { useSite00 } from '../state/Site00Context';
import { ExperienceWorkspaceShell } from './ExperienceWorkspaceShell';
import {
  ExperienceAssetsPanel,
  ExperienceBuildsPanel,
  ExperienceCharactersPanel,
  ExperienceEmptyState,
  ExperienceHistoryPanel,
  ExperienceMechanicsPanel,
  ExperienceMorePanel,
  ExperienceOverviewPanel,
  ExperienceScenesPanel,
} from './ExperienceWorkspacePanels';
import { useExperienceWorkspace } from './useExperienceWorkspace';
import '../styles/site00-experience-workspace.css';

type Props = {
  projectSlug: string;
  splat?: string;
};

function blockedActionMessage(actionId: string): string {
  if (actionId.startsWith('agent-')) {
    return 'Agent invocation requires explicit founder approval — not executed in this sprint.';
  }
  if (actionId === 'open-runtime') {
    return 'Runtime launch blocked — Unreal connection is NOT_CONFIGURED.';
  }
  if (actionId === 'generate-asset') {
    return 'Generate Asset requires an approved ExperienceTask and ToolPlan — none executed.';
  }
  return `Action "${actionId.replace(/-/g, ' ').toUpperCase()}" queued — integration not connected.`;
}

export function ProjectExperienceWorkspacePage({ projectSlug, splat }: Props) {
  const isWide = useSite00OriginWideViewport();
  const { isPreviewDesktop } = useSite00();
  const isDesktop = isPreviewDesktop || isWide;

  const {
    experienceList,
    activeExperienceSlug,
    activeExperience,
    activeTab,
    bundle,
    setExperience,
    setTab,
  } = useExperienceWorkspace(projectSlug, splat);

  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const projectLabel = useMemo(() => {
    const managed = getSite00ManagedProject(projectSlug);
    return managed?.displayName ?? projectSlug.replace(/-/g, ' ').toUpperCase();
  }, [projectSlug]);

  const onQuickAction = useCallback((actionId: string) => {
    setActionNotice(blockedActionMessage(actionId));
  }, []);

  if (experienceList.length === 0) {
    return <ExperienceEmptyState projectSlug={projectSlug} />;
  }

  if (!activeExperienceSlug) {
    const first = experienceList[0]!;
    return <Navigate to={experienceWorkspacePath(projectSlug, first.slug)} replace />;
  }

  if (!bundle || !activeExperience) {
    return <ExperienceEmptyState projectSlug={projectSlug} />;
  }

  let panel = null;
  switch (activeTab) {
    case 'overview':
      panel = (
        <ExperienceOverviewPanel
          experience={activeExperience}
          bundle={bundle}
          isDesktop={isDesktop}
          onQuickAction={onQuickAction}
        />
      );
      break;
    case 'scenes':
      panel = (
        <ExperienceScenesPanel scenes={bundle.scenes} onOpenScene={() => onQuickAction('open-scene')} />
      );
      break;
    case 'characters':
      panel = <ExperienceCharactersPanel characters={bundle.characters} />;
      break;
    case 'assets':
      panel = <ExperienceAssetsPanel assets={bundle.assets} />;
      break;
    case 'mechanics':
      panel = (
        <ExperienceMechanicsPanel
          mechanics={bundle.mechanics}
          onTest={(id) => onQuickAction(`test-mechanic-${id}`)}
        />
      );
      break;
    case 'builds':
      panel = <ExperienceBuildsPanel builds={bundle.builds} />;
      break;
    case 'history':
      panel = <ExperienceHistoryPanel activity={bundle.activity} />;
      break;
    case 'more':
      panel = <ExperienceMorePanel />;
      break;
    default:
      panel = null;
  }

  return (
    <ExperienceWorkspaceShell
      projectSlug={projectSlug}
      projectLabel={projectLabel}
      isDesktop={isDesktop}
      activeTab={activeTab}
      experienceList={experienceList}
      activeExperience={activeExperience}
      onSelectExperience={setExperience}
      onSelectTab={setTab}
      onQuickAction={onQuickAction}
      actionNotice={actionNotice}
    >
      {panel}
    </ExperienceWorkspaceShell>
  );
}
