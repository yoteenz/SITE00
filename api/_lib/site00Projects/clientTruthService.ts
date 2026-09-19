/**
 * Client truth storage — raw client-supplied information, non-canonical by default.
 */

import { getSupabaseAdmin } from '../supabase.js';
import { resolveCanonicalProject } from './canonicalProject.js';

export const CLIENT_TRUTH_CLASSES = ['CLIENT_SUPPLIED', 'FOUNDER_PROPOSED_CONCEPT'] as const;
export type ClientTruthClass = (typeof CLIENT_TRUTH_CLASSES)[number];

export const CLIENT_TRUTH_STATUSES = ['RAW', 'UNAPPROVED', 'REVIEW', 'WITHDRAWN'] as const;
export type ClientTruthStatus = (typeof CLIENT_TRUTH_STATUSES)[number];

export type ClientTruthRecord = {
  id: string;
  project_id: string;
  truth_class: ClientTruthClass;
  status: ClientTruthStatus;
  title: string | null;
  payload: Record<string, unknown>;
  source: string | null;
  created_at: string;
  updated_at: string;
};

export async function storeClientTruth(input: {
  projectIdOrSlug: string;
  truthClass?: ClientTruthClass;
  status?: ClientTruthStatus;
  title?: string | null;
  payload: Record<string, unknown>;
  source?: string | null;
}): Promise<ClientTruthRecord> {
  const resolved = await resolveCanonicalProject({
    projectId: input.projectIdOrSlug,
    slug: input.projectIdOrSlug,
  });
  if (!resolved.ok) {
    throw new Error(resolved.error.message);
  }

  const { data, error } = await getSupabaseAdmin()
    .from('site00_client_truth_records')
    .insert({
      project_id: resolved.project.id,
      truth_class: input.truthClass ?? 'CLIENT_SUPPLIED',
      status: input.status ?? 'RAW',
      title: input.title ?? null,
      payload: input.payload,
      source: input.source ?? 'client_truth_service',
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as ClientTruthRecord;
}

export async function listClientTruthForProject(projectIdOrSlug: string): Promise<ClientTruthRecord[]> {
  const resolved = await resolveCanonicalProject({
    projectId: projectIdOrSlug,
    slug: projectIdOrSlug,
  });
  if (!resolved.ok) return [];

  const { data } = await getSupabaseAdmin()
    .from('site00_client_truth_records')
    .select('*')
    .eq('project_id', resolved.project.id)
    .order('created_at', { ascending: false });

  return (data ?? []) as ClientTruthRecord[];
}

export function isNonCanonicalClientTruth(record: ClientTruthRecord): boolean {
  return record.status === 'RAW' || record.status === 'UNAPPROVED';
}
