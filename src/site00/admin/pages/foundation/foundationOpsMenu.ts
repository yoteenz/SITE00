import { SITE00_ROUTES } from '../../../config/routes';
import type { DfaMenuItem } from '../../../foundation-authority/DfAuthority';

type OpsScreen = 'pipeline' | 'command' | 'workbench' | 'communications';

export function foundationOpsMenu(current: OpsScreen, projectId?: string): DfaMenuItem[] {
  const items: DfaMenuItem[] = [
    { label: 'FOUNDATION PIPELINE', to: SITE00_ROUTES.digitalFoundationPipeline, current: current === 'pipeline' },
  ];
  if (projectId) {
    items.push(
      { label: 'PROJECT COMMAND', to: SITE00_ROUTES.digitalFoundationProjectCommand.replace(':id', encodeURIComponent(projectId)), current: current === 'command' },
      { label: 'EXECUTION WORKBENCH', to: SITE00_ROUTES.digitalFoundationWorkbench.replace(':id', encodeURIComponent(projectId)), current: current === 'workbench' },
      { label: 'FOUNDATION ARTIFACT', to: SITE00_ROUTES.digitalFoundationAdminDetail.replace(':id', encodeURIComponent(projectId)) },
    );
  }
  items.push(
    { label: 'COMMUNICATIONS COMMAND', to: SITE00_ROUTES.digitalFoundationCommunications, current: current === 'communications' },
    { label: 'ALL FOUNDATION ARTIFACTS', to: SITE00_ROUTES.digitalFoundationAdmin },
    { label: 'SCREEN REVIEW', to: SITE00_ROUTES.digitalFoundationScreenReview },
  );
  return items;
}

export const opsLabel = (value: string | null | undefined) =>
  value && value.trim() ? value.replace(/^\d+_/, '').replace(/_/g, ' ').toUpperCase() : '—';
