import type { DesignBoundPageRecord } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/types.js';
import { buildDesignProjectIntelligence } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/projectIntelligence.js';
import type { DesignProductionPageTarget } from './designProductionPageTarget';

export function designProductionPageTargetFromRecord(page: DesignBoundPageRecord): DesignProductionPageTarget {
  const intel = buildDesignProjectIntelligence(page.projectId);
  const projectLine = intel?.displayName ?? page.projectId.toUpperCase();
  const pageLine = page.pageName.toUpperCase();
  const roleLine =
    page.pageRole === 'PROJECT_OVERVIEW' ? 'PROJECT OVERVIEW' : page.pageRole.replace(/_/g, ' ');

  return {
    pageId: page.pageId,
    screenId: page.screenId,
    entryId: projectLine,
    pageLabel: pageLine,
    surfaceLabel: roleLine,
    route: page.route,
    pageRole: page.pageRole,
    designStatus: page.designStatus,
  };
}
