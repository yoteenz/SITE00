import { listPageConceptCandidates } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/designPageConceptModel.js';
import { readDesignPageTarget, resolveDesignPageTargetForShell } from '../production/designProductionPageTarget';
import type { TwinOpusDirectProduction } from './useTwinOpusDirectProduction';
import { usePageAuthorityWorkflow } from './usePageAuthorityWorkflow';
import { ViewportAuthorityEditor } from './ViewportAuthorityEditor';

export function DesignViewportAuthorityEditorOverlay({
  projectSlug,
  production,
  viewport,
  onClose,
}: {
  projectSlug: string;
  production: TwinOpusDirectProduction;
  viewport: 'MOBILE' | 'DESKTOP';
  onClose: () => void;
}) {
  const pageTarget = readDesignPageTarget(projectSlug) ?? resolveDesignPageTargetForShell(projectSlug);
  const pageId = pageTarget.pageId;
  const workflowApi = usePageAuthorityWorkflow(projectSlug, pageId);
  const concepts = listPageConceptCandidates(projectSlug, pageId);
  const concept = concepts.find((entry) => entry.status === 'SELECTED' || entry.status === 'PROMOTED') ?? concepts[0] ?? null;
  const reference =
    viewport === 'MOBILE' ? workflowApi.workflow.mobileAuthority : workflowApi.workflow.desktopAuthority;

  return (
    <ViewportAuthorityEditor
      viewport={viewport}
      reference={reference}
      workflowApi={workflowApi}
      pageLabel={pageTarget.pageLabel}
      conceptLabel={concept?.conceptTitle ?? null}
      onClose={onClose}
      onFullscreen={(src, title, subtitle) =>
        production.actions.openFullscreenArtifact({ src, title, subtitle, role: 'authority-reference', viewport })
      }
    />
  );
}
