/**
 * Resolve founder index slugs to durable site00_projects UUID rows for FK columns.
 * Founder projects are indexed in code; DB rows are ensured on first durable write.
 */

import { getSupabaseAdmin } from '../supabase.js';
import { FOUNDER_PROJECTS, isFounderProjectSlug, type FounderProjectDefinition } from './projectRegistry.js';
import type { Site00FounderProjectSlug } from '../../../shared/site00-projects/types.js';

function founderDefinition(slug: Site00FounderProjectSlug): FounderProjectDefinition {
  const def = FOUNDER_PROJECTS.find((p) => p.slug === slug);
  if (!def) throw new Error(`Unknown founder project slug: ${slug}`);
  return def;
}

export async function resolveFounderProjectDbId(slug: string): Promise<string | null> {
  if (!isFounderProjectSlug(slug)) return null;
  const { data } = await getSupabaseAdmin().from('site00_projects').select('id').eq('slug', slug).maybeSingle();
  return (data?.id as string) ?? null;
}

export async function ensureFounderProjectDbId(slug: Site00FounderProjectSlug): Promise<string> {
  const existing = await resolveFounderProjectDbId(slug);
  if (existing) return existing;

  const def = founderDefinition(slug);
  const { data: project, error } = await getSupabaseAdmin()
    .from('site00_projects')
    .insert({
      slug,
      name: def.name,
      current_phase: 'CREATIVE_DIRECTION',
      metadata: {
        founderIndex: true,
        organizationSlug: def.organizationSlug,
        displayName: def.displayName,
      },
    })
    .select('id')
    .single();

  if (error?.code === '23505') {
    const retry = await resolveFounderProjectDbId(slug);
    if (retry) return retry;
  }
  if (error || !project?.id) throw error ?? new Error(`Failed to ensure founder project row for ${slug}`);
  return project.id as string;
}
