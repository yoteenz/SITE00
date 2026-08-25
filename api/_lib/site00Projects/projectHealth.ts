/**
 * Project isolation health diagnostic — exposes unscoped records and guard counts.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getSupabaseAdmin } from '../supabase.js';
import { listRegisteredProjects } from './canonicalProject.js';
import { getActiveAndUnavailableCapabilities } from '../../../shared/site00-projects/capabilities.js';
import { isNdxbookArchitecturalGuardPattern } from './projectCapabilityGuard.js';

export type ProjectHealthEntry = {
  projectId: string;
  slug: string;
  projectType: string | null;
  status: string;
  activeCapabilities: string[];
  unavailableCapabilities: string[];
};

export type ProjectIsolationHealthReport = {
  projectCount: number;
  projects: ProjectHealthEntry[];
  unscopedAssetCount: number;
  unscopedIngestionCount: number;
  ambiguousProjectRecordCount: number;
  ndxbookArchitecturalGuardCount: number;
};

function countNdxbookGuardsInProjectsApi(): number {
  try {
    const src = readFileSync(join(process.cwd(), 'api/site00/projects.ts'), 'utf8');
    return src.split('\n').filter(isNdxbookArchitecturalGuardPattern).length;
  } catch {
    return -1;
  }
}

export async function buildProjectIsolationHealthReport(): Promise<ProjectIsolationHealthReport> {
  const supabase = getSupabaseAdmin();

  const projects = await listRegisteredProjects();

  const { count: unscopedAssets } = await supabase
    .from('site00_logical_assets')
    .select('id', { count: 'exact', head: true })
    .is('project_id', null);

  const { count: unscopedIngestions } = await supabase
    .from('site00_project_ingestions')
    .select('id', { count: 'exact', head: true })
    .is('project_id', null);

  const { count: ambiguousProjects } = await supabase
    .from('site00_projects')
    .select('id', { count: 'exact', head: true })
    .or('project_type.is.null,experience_class.is.null');

  return {
    projectCount: projects.length,
    projects: projects.map((p) => {
      const caps = getActiveAndUnavailableCapabilities(p.slug);
      return {
        projectId: p.id,
        slug: p.slug,
        projectType: p.projectType,
        status: p.status,
        activeCapabilities: caps.active,
        unavailableCapabilities: caps.unavailable,
      };
    }),
    unscopedAssetCount: unscopedAssets ?? 0,
    unscopedIngestionCount: unscopedIngestions ?? 0,
    ambiguousProjectRecordCount: ambiguousProjects ?? 0,
    ndxbookArchitecturalGuardCount: countNdxbookGuardsInProjectsApi(),
  };
}
