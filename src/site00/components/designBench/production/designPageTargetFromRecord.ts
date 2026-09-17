import type { DesignBoundPageRecord } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/types.js';
import type { DesignProductionPageTarget } from './designProductionPageTarget';

export function designProductionPageTargetFromRecord(page: DesignBoundPageRecord): DesignProductionPageTarget {
  const entryId =
    page.screenId === 'entry-001-concept' ? 'ENTRY-001' : (
      page.screenId.replace(/-/g, ' ').toUpperCase().replace(/\s+/g, '-').slice(0, 24)
    );
  const surfaceLabel =
    page.screenId === 'entry-001-concept' ? 'HOMEPAGE HERO' : page.pageRole.replace(/_/g, ' ');

  return {
    pageId: page.pageId,
    screenId: page.screenId,
    entryId,
    pageLabel: page.pageName,
    surfaceLabel,
    route: page.route,
    pageRole: page.pageRole,
    designStatus: page.designStatus,
  };
}
