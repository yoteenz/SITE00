/**
 * B5.9R9 / B5.9R9R1 — Resolve client project owner profile for Projects index simulation.
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

async function resolveProfileByEmail(email: string): Promise<ClientProjectOwnerProfile | null> {
  const supabase = getSupabaseAdmin();
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name')
    .eq('email', email)
    .maybeSingle();

  if (!profile) return null;

  return {
    accountId: String(profile.id ?? email),
    email,
    firstName: typeof profile.first_name === 'string' ? profile.first_name : null,
    lastName: typeof profile.last_name === 'string' ? profile.last_name : null,
    displayName: null,
  };
}

export async function resolveClientProjectOwnerProfile(clientEmail: string | null | undefined): Promise<ClientProjectOwnerProfile | null> {
  const email = (clientEmail ?? '').trim().toLowerCase();
  if (!email) return null;

  const profileRecord = await resolveProfileByEmail(email);
  if (profileRecord?.firstName || profileRecord?.lastName) {
    return profileRecord;
  }

  const supabase = getSupabaseAdmin();
  const { data: identity } = await supabase
    .from('site00_identities')
    .select('id, email, display_name, metadata')
    .eq('email', email)
    .maybeSingle();

  if (!identity) {
    return profileRecord ?? {
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
    accountId: String(identity.id ?? profileRecord?.accountId ?? email),
    email,
    firstName: profileRecord?.firstName ?? metaFirst ?? split.firstName,
    lastName: profileRecord?.lastName ?? metaLast ?? split.lastName,
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
