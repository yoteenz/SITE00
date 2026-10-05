/**
 * Identity Brief — derived from client truth, non-canonical.
 */

import { getSupabaseAdmin } from '../../supabase.js';
import { resolveCanonicalProject } from '../canonicalProject.js';
import { listClientTruthForProject } from '../clientTruthService.js';
import type { IdentityBriefPayload } from '../../../../shared/site00-identity/types.js';
import {
  ASTRAL_WORLD_FOUNDER_HIERARCHY_TRUTH,
  ASTRAL_WORLD_MASTER_BRAND,
  ASTRAL_WORLD_FLAGSHIP_DISTRICT,
} from '../../../../shared/site00-identity/astralWorldIdentity.js';

export type IdentityBriefRecord = {
  id: string;
  project_id: string;
  brief: IdentityBriefPayload;
  source_record_ids: string[];
  is_canonical: boolean;
  generated_at: string;
};

function labelFromPayload(payload: Record<string, unknown>): 'CLIENT_CONFIRMED' | 'CLIENT_PROPOSED' | 'DERIVED' | 'UNRESOLVED' {
  const label = payload.truthLabel as string | undefined;
  if (label === 'CLIENT_CONFIRMED') return 'CLIENT_CONFIRMED';
  if (payload.category === 'UNRESOLVED_DECISIONS') return 'UNRESOLVED';
  return 'CLIENT_PROPOSED';
}

export async function generateIdentityBrief(projectIdOrSlug: string): Promise<IdentityBriefRecord> {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) throw new Error(resolved.error.message);

  const records = await listClientTruthForProject(resolved.project.slug);
  const sourceIds = records.map((r) => r.id);
  const unresolved = records.filter((r) => (r.payload as Record<string, unknown>).category === 'UNRESOLVED_DECISIONS');

  const briefPayload: IdentityBriefPayload = {
    projectSlug: resolved.project.slug,
    masterBrand: ASTRAL_WORLD_MASTER_BRAND,
    flagshipDistrict: ASTRAL_WORLD_FLAGSHIP_DISTRICT,
    productHierarchy: 'ASTRAL WORLD → ASTRÉA → DESTINATIONS → READERS/EXPERIENCES',
    sections: {
      purpose: {
        label: 'DERIVED',
        content: records.find((r) => r.title === 'Core client concept')?.payload ?? 'Digital world for tarot readers and clients',
      },
      users: {
        label: 'CLIENT_PROPOSED',
        content: 'Tarot readers and clients/seekers',
      },
      masterHierarchy: {
        label: 'CLIENT_CONFIRMED',
        content: ASTRAL_WORLD_FOUNDER_HIERARCHY_TRUTH,
      },
      environments: {
        label: 'CLIENT_PROPOSED',
        content: 'Tarot Suite, Astral Mall, Coffee Shop — client concepts within Astréa district',
      },
      personalization: {
        label: 'CLIENT_PROPOSED',
        content: 'Custom tarot with family/personal references — personalization important; style unresolved',
      },
      businessModel: {
        label: 'CLIENT_PROPOSED',
        content: 'Subscription/membership direction — tiers and pricing unresolved',
      },
      unresolved: {
        label: 'UNRESOLVED',
        content: unresolved.map((r) => ({ title: r.title, detail: (r.payload as Record<string, unknown>).content })),
      },
    },
    sourceTruthCount: records.length,
    unresolvedCount: unresolved.length,
    note: 'Derived identity brief — does not replace client truth. Creative hypotheses marked separately in territories.',
  };

  const { data: existing } = await getSupabaseAdmin()
    .from('site00_identity_briefs')
    .select('*')
    .eq('project_id', resolved.project.id)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) return existing as IdentityBriefRecord;

  const { data, error } = await getSupabaseAdmin()
    .from('site00_identity_briefs')
    .insert({
      project_id: resolved.project.id,
      brief: briefPayload,
      source_record_ids: sourceIds,
      is_canonical: false,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as IdentityBriefRecord;
}

export async function getLatestIdentityBrief(projectIdOrSlug: string): Promise<IdentityBriefRecord | null> {
  const resolved = await resolveCanonicalProject({ slug: projectIdOrSlug, projectId: projectIdOrSlug });
  if (!resolved.ok) return null;

  const { data } = await getSupabaseAdmin()
    .from('site00_identity_briefs')
    .select('*')
    .eq('project_id', resolved.project.id)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as IdentityBriefRecord) ?? null;
}
