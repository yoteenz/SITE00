/**
 * SITE 00 host project scope — no NDXBOOK defaults.
 */

import { getSupabaseAdmin } from '../supabase.js';
import { SITE00_HOST_PROJECT_KEY } from '../../../shared/site00-experience-engine/constants.js';
import { SITE00_DESIGN_PROJECT_ID } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr3/constants.js';

export type Site00HostProjectScope = {
  projectKey: typeof SITE00_HOST_PROJECT_KEY;
  projectId: string;
  managedProjectDbId: string | null;
  organizationId: null;
};

const memoryScope: Site00HostProjectScope = {
  projectKey: SITE00_HOST_PROJECT_KEY,
  projectId: SITE00_DESIGN_PROJECT_ID,
  managedProjectDbId: null,
  organizationId: null,
};

export async function resolveSite00HostProjectScope(): Promise<Site00HostProjectScope> {
  try {
    const { data } = await getSupabaseAdmin()
      .from('site00_managed_projects')
      .select('id')
      .eq('project_key', SITE00_HOST_PROJECT_KEY)
      .maybeSingle();
    if (data?.id) {
      return {
        projectKey: SITE00_HOST_PROJECT_KEY,
        projectId: SITE00_DESIGN_PROJECT_ID,
        managedProjectDbId: data.id as string,
        organizationId: null,
      };
    }
  } catch {
    /* memory fallback for tests / offline */
  }
  return { ...memoryScope };
}

export function assertNoNdxbookFallback(scope: Site00HostProjectScope): void {
  if (scope.projectKey !== SITE00_HOST_PROJECT_KEY) {
    throw new Error('Experience Engine records must use SITE 00 host project scope');
  }
}
