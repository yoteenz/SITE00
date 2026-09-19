/**
 * B5.9R9R1 — Normalize account identity fields from any canonical SITE 00 source.
 */

export type NormalizedAccountIdentityFields = {
  accountId: string | null;
  userId: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  displayName: string | null;
};

function pickString(raw: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed && trimmed.toLowerCase() !== 'undefined' && trimmed.toLowerCase() !== 'null') {
        return trimmed;
      }
    }
  }
  return null;
}

/** Single normalization entry point for profile / auth / owner records. */
export function normalizeAccountIdentityFields(raw: Record<string, unknown> | null | undefined): NormalizedAccountIdentityFields {
  const record = raw && typeof raw === 'object' ? raw : {};
  const meta =
    record.user_metadata && typeof record.user_metadata === 'object'
      ? (record.user_metadata as Record<string, unknown>)
      : {};
  const rawMeta =
    record.raw_user_meta_data && typeof record.raw_user_meta_data === 'object'
      ? (record.raw_user_meta_data as Record<string, unknown>)
      : {};
  const merged = { ...rawMeta, ...meta, ...record };

  const firstName = pickString(merged, 'firstName', 'first_name', 'givenName', 'given_name');
  const lastName = pickString(merged, 'lastName', 'last_name', 'familyName', 'family_name');
  const explicitFullName = pickString(merged, 'fullName', 'full_name', 'name');
  const displayName = pickString(merged, 'displayName', 'display_name');
  const email = pickString(merged, 'email');
  const accountId = pickString(merged, 'accountId', 'account_id') ?? email;
  const userId = pickString(merged, 'userId', 'user_id', 'id', 'sub');

  return {
    accountId,
    userId,
    email,
    firstName,
    lastName,
    fullName: explicitFullName,
    displayName,
  };
}

export function constructAccountFullName(fields: Pick<NormalizedAccountIdentityFields, 'firstName' | 'lastName' | 'fullName'>): string | null {
  const parts = [fields.firstName, fields.lastName].filter(Boolean) as string[];
  if (parts.length) return parts.join(' ').replace(/\s+/g, ' ').trim();

  const explicit = fields.fullName?.replace(/\s+/g, ' ').trim();
  if (explicit) return explicit;

  if (fields.firstName) return fields.firstName.trim();
  if (fields.lastName) return fields.lastName.trim();
  return null;
}
