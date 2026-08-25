/**
 * Canonical SITE 00 project resolution — single path for project identity.
 */

import { getSupabaseAdmin } from '../supabase.js';
import { FOUNDER_PROJECTS, isFounderProjectSlug } from './projectRegistry.js';
import { ensureFounderProjectDbId, isUuid, resolveFounderProjectDbId } from './founderProjectDbId.js';
import {
  getCapabilitiesForSlug,
  getActiveAndUnavailableCapabilities,
} from '../../../shared/site00-projects/capabilities.js';
import type { ProjectExperienceClass } from '../../../shared/site00-world-intake/constants.js';
import {
  normalizeProjectType,
  projectTypeToDefaultExperienceClass,
  type Site00CanonicalProject,
  type Site00ProjectStatus,
  type Site00ProjectType,
} from '../../../shared/site00-projects/projectTypes.js';
import type { Site00FounderProjectSlug } from '../../../shared/site00-projects/types.js';

export type ResolveProjectInput = {
  projectId?: string | null;
  slug?: string | null;
};

export type ResolveProjectError = {
  code: 'PROJECT_NOT_FOUND' | 'PROJECT_AMBIGUOUS' | 'INVALID_PROJECT_REF';
  message: string;
};

export type ResolveProjectResult =
  | { ok: true; project: Site00CanonicalProject; capabilities: ReturnType<typeof getActiveAndUnavailableCapabilities> }
  | { ok: false; error: ResolveProjectError };

type DbProjectRow = {
  id: string;
  slug: string;
  name: string;
  organization_id: string | null;
  project_type?: string | null;
  experience_class?: string | null;
  status?: string | null;
  metadata?: Record<string, unknown> | null;
};

const SLUG_OVERRIDES: Record<string, ProjectExperienceClass> = {
  ndxbook: 'IMMERSIVE_SITE',
  'frontal-slayer': 'WORLD',
  'all-in-one-enterprises': 'SITE',
  'studio-world': 'SITE',
  'astral-world': 'WORLD',
};

function normalizeStatus(value: string | null | undefined): Site00ProjectStatus {
  const upper = (value ?? 'ACTIVE').trim().toUpperCase();
  if (
    upper === 'PRE_INGESTION' ||
    upper === 'ORIGIN_INGESTED' ||
    upper === 'INGESTION' ||
    upper === 'PRODUCTION' ||
    upper === 'ARCHIVED'
  ) {
    return upper;
  }
  return 'ACTIVE';
}

function displayNameForSlug(slug: string, dbName: string): string {
  const founder = FOUNDER_PROJECTS.find((p) => p.slug === slug);
  if (founder) return founder.displayName;
  if (slug === 'astral-world') return 'Astral World';
  return dbName;
}

function rowToCanonical(row: DbProjectRow): Site00CanonicalProject {
  const slug = row.slug.trim().toLowerCase();
  const projectType = normalizeProjectType(row.project_type);
  const experienceClass =
    (row.experience_class as ProjectExperienceClass | null) ??
    SLUG_OVERRIDES[slug] ??
    projectTypeToDefaultExperienceClass(projectType);

  return {
    id: row.id,
    slug,
    displayName: displayNameForSlug(slug, row.name),
    organizationId: row.organization_id,
    projectType,
    experienceClass,
    status: normalizeStatus(row.status),
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
  };
}

async function loadProjectBySlug(slug: string): Promise<DbProjectRow | null> {
  const { data } = await getSupabaseAdmin()
    .from('site00_projects')
    .select('id, slug, name, organization_id, project_type, experience_class, status, metadata')
    .eq('slug', slug)
    .maybeSingle();
  return (data as DbProjectRow) ?? null;
}

async function loadProjectById(id: string): Promise<DbProjectRow | null> {
  const { data } = await getSupabaseAdmin()
    .from('site00_projects')
    .select('id, slug, name, organization_id, project_type, experience_class, status, metadata')
    .eq('id', id)
    .maybeSingle();
  return (data as DbProjectRow) ?? null;
}

/**
 * Resolve canonical project from UUID id and/or slug.
 * Founder slugs are ensured in DB on first resolution.
 */
export async function resolveCanonicalProject(input: ResolveProjectInput): Promise<ResolveProjectResult> {
  const slugArg = input.slug?.trim().toLowerCase() ?? null;
  const idArg = input.projectId?.trim() ?? null;

  if (!slugArg && !idArg) {
    return {
      ok: false,
      error: { code: 'INVALID_PROJECT_REF', message: 'projectId or slug required' },
    };
  }

  let row: DbProjectRow | null = null;

  if (idArg && isUuid(idArg)) {
    row = await loadProjectById(idArg);
  } else if (idArg && isFounderProjectSlug(idArg)) {
    const dbId = await ensureFounderProjectDbId(idArg);
    row = await loadProjectById(dbId);
  } else if (slugArg) {
    row = await loadProjectBySlug(slugArg);
    if (!row && isFounderProjectSlug(slugArg)) {
      const dbId = await ensureFounderProjectDbId(slugArg);
      row = await loadProjectById(dbId);
    }
  }

  if (!row) {
    return {
      ok: false,
      error: { code: 'PROJECT_NOT_FOUND', message: `Project not found: ${slugArg ?? idArg}` },
    };
  }

  const project = rowToCanonical(row);
  const capabilities = getActiveAndUnavailableCapabilities(project.slug);

  return { ok: true, project, capabilities };
}

export async function resolveProjectDbId(input: ResolveProjectInput): Promise<string | null> {
  const result = await resolveCanonicalProject(input);
  return result.ok ? result.project.id : null;
}

export async function resolveProjectSlug(input: ResolveProjectInput): Promise<string | null> {
  const result = await resolveCanonicalProject(input);
  return result.ok ? result.project.slug : null;
}

export function isKnownProjectSlug(slug: string): boolean {
  const normalized = slug.trim().toLowerCase();
  return isFounderProjectSlug(normalized) || normalized === 'astral-world';
}

export async function listRegisteredProjects(): Promise<Site00CanonicalProject[]> {
  const { data } = await getSupabaseAdmin()
    .from('site00_projects')
    .select('id, slug, name, organization_id, project_type, experience_class, status, metadata')
    .order('created_at', { ascending: true });

  return ((data ?? []) as DbProjectRow[]).map(rowToCanonical);
}

export { getCapabilitiesForSlug };
