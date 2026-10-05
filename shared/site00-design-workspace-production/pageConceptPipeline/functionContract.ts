import { getDesignBoundPage } from '../designProjectBinding/designPageRegistry.js';
import type { PageFunctionContract } from './types.js';

export const PAGE_FUNCTION_CONTRACT_VERSION = 'page-fc-v1';

export function compilePageFunctionContract(projectId: string, pageId: string): PageFunctionContract | null {
  const page = getDesignBoundPage(projectId, pageId);
  if (!page) return null;

  return {
    contractId: `pfc-${projectId}-${page.pageId}`,
    projectId,
    pageId: page.pageId,
    version: PAGE_FUNCTION_CONTRACT_VERSION,
    route: page.route,
    regions: ['hero', 'primary-content', 'navigation', 'footer'],
    interactions: ['nav', 'viewport-toggle', 'gallery-select', 'authority-promote'],
    immutableBehaviors: [
      'routes',
      'persistence',
      'api-contracts',
      'supabase',
      'business-rules',
    ],
    responsiveRequirements: ['MOBILE', 'DESKTOP'],
    createdAt: new Date().toISOString(),
  };
}
