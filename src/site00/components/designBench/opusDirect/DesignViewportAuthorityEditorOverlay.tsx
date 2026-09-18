import { readDesignPageTarget } from '../production/designProductionPageTarget';
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
  const pageId = readDesignPageTarget(projectSlug)?.pageId ?? `${projectSlug}:overview`;
  const workflowApi = usePageAuthorityWorkflow(projectSlug, pageId);
  const reference =
    viewport === 'MOBILE' ? workflowApi.workflow.mobileAuthority : workflowApi.workflow.desktopAuthority;

  return (
    <ViewportAuthorityEditor
      viewport={viewport}
      reference={reference}
      workflowApi={workflowApi}
      onClose={onClose}
      onFullscreen={(src, title, subtitle) =>
        production.actions.openFullscreenArtifact({ src, title, subtitle, role: 'authority-reference', viewport })
      }
    />
  );
}
