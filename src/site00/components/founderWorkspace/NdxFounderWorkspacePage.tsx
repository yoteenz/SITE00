import type { ReactNode } from 'react';
import { EcosystemShell } from '../ecosystem/EcosystemShell';
import { FounderWorkspaceShell } from './FounderWorkspaceShell';
import { WorkspaceLoadingState } from './WorkspaceLoadingState';
import { WorkspaceErrorState } from './WorkspaceErrorState';
import { ndxFounderWorkspaceEnabled } from '../../config/ndxFounderWorkspace';
import '../../styles/site00-founder-workspace.css';

export type NdxFounderWorkspacePageProps = {
  projectSlug: string;
  title: string;
  subtitle?: string;
  attentionBadge?: string;
  loading?: boolean;
  loadingLabel?: string;
  error?: { title: string; message: string; preserved?: string; onRetry?: () => void } | null;
  operate: ReactNode;
  understand?: ReactNode;
  inspect?: ReactNode;
  inspectLabel?: string;
  actions?: ReactNode;
  hideWorkspaceNav?: boolean;
  hideWorkspaceHeader?: boolean;
  nonNdxFallback?: ReactNode;
};

/**
 * Canonical NDXBOOK founder route wrapper — EcosystemShell + FounderWorkspaceShell
 * with workspace-native loading/error states. Preserves shell + nav during load.
 */
export function NdxFounderWorkspacePage({
  projectSlug,
  title,
  subtitle,
  attentionBadge,
  loading = false,
  loadingLabel,
  error = null,
  operate,
  understand,
  inspect,
  inspectLabel,
  actions,
  hideWorkspaceNav,
  hideWorkspaceHeader,
  nonNdxFallback,
}: NdxFounderWorkspacePageProps) {
  if (!ndxFounderWorkspaceEnabled(projectSlug)) {
    return (
      <EcosystemShell hidePageHeader>
        {nonNdxFallback ?? <p>This workspace view is NDXBOOK-only.</p>}
      </EcosystemShell>
    );
  }

  const operateContent = error ? (
    <WorkspaceErrorState
      title={error.title}
      message={error.message}
      preserved={error.preserved}
      onRetry={error.onRetry}
    />
  ) : loading ? (
    <WorkspaceLoadingState label={loadingLabel} />
  ) : (
    operate
  );

  return (
    <EcosystemShell hidePageHeader>
      <FounderWorkspaceShell
        projectSlug={projectSlug}
        title={title}
        subtitle={subtitle}
        attentionBadge={attentionBadge}
        operate={operateContent}
        understand={understand}
        inspect={inspect}
        inspectLabel={inspectLabel}
        actions={actions}
        hideWorkspaceNav={hideWorkspaceNav}
        hideWorkspaceHeader={hideWorkspaceHeader}
      />
    </EcosystemShell>
  );
}
