/**
 * B5.9R9 — Resolve client project owner profile for Projects index simulation.
 */

import { getSupabaseAdmin } from '../supabase.js';

export type ClientProjectOwnerProfile = {
  accountId: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
};

function splitDisplayName(displayName: string | null): { firstName: string | null; lastName: string | null } {
  if (!displayName?.trim()) return { firstName: null, lastName: null };
  const parts = displayName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0] ?? null, lastName: null };
  return { firstName: parts[0] ?? null, lastName: parts.slice(1).join(' ') };
}

export async function resolveClientProjectOwnerProfile(clientEmail: string | null | undefined): Promise<ClientProjectOwnerProfile | null> {
  const email = (clientEmail ?? '').trim().toLowerCase();
  if (!email) return null;

  const supabase = getSupabaseAdmin();
  const { data: identity } = await supabase
    .from('site00_identities')
    .select('id, email, display_name, metadata')
    .eq('email', email)
    .maybeSingle();

  if (!identity) {
    return {
      accountId: email,
      email,
      firstName: null,
      lastName: null,
      displayName: null,
    };
  }

  const meta = (identity.metadata ?? {}) as Record<string, unknown>;
  const metaFirst = typeof meta.first_name === 'string' ? meta.first_name : typeof meta.firstName === 'string' ? meta.firstName : null;
  const metaLast = typeof meta.last_name === 'string' ? meta.last_name : typeof meta.lastName === 'string' ? meta.lastName : null;
  const split = splitDisplayName(typeof identity.display_name === 'string' ? identity.display_name : null);

  return {
    accountId: String(identity.id ?? email),
    email,
    firstName: metaFirst ?? split.firstName,
    lastName: metaLast ?? split.lastName,
    displayName: typeof identity.display_name === 'string' ? identity.display_name : null,
  };
}

export async function enrichClientProjectsWithOwnerIdentity<T extends { clientEmail?: string | null }>(
  projects: T[],
): Promise<Array<T & ClientProjectOwnerProfile>> {
  const enriched: Array<T & ClientProjectOwnerProfile> = [];
  for (const project of projects) {
    const owner = await resolveClientProjectOwnerProfile(project.clientEmail ?? null);
    enriched.push({
      ...project,
      accountId: owner?.accountId ?? null,
      email: owner?.email ?? project.clientEmail ?? null,
      firstName: owner?.firstName ?? null,
      lastName: owner?.lastName ?? null,
      displayName: owner?.displayName ?? null,
    });
  }
  return enriched;
}
