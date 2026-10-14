/**
 * Founder-only Digital Foundation E2E testing guards.
 * Synthetic clients must never reach real clients or live Stripe/email without explicit env + allowlist.
 */

export const SYNTHETIC_BUSINESS_PREFIX = 'SYNTH · ';

export function isSyntheticBusinessName(name: string | null | undefined): boolean {
  return Boolean(name?.startsWith(SYNTHETIC_BUSINESS_PREFIX));
}

export function formatSyntheticBusinessName(displayName: string): string {
  const trimmed = displayName.trim() || 'Test Client';
  return trimmed.startsWith(SYNTHETIC_BUSINESS_PREFIX) ? trimmed : `${SYNTHETIC_BUSINESS_PREFIX}${trimmed}`;
}

function parseAllowlist(raw: string | undefined): Set<string> {
  if (!raw?.trim()) return new Set();
  return new Set(
    raw
      .split(/[,;\s]+/)
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

/** Server env: comma-separated founder-controlled inboxes permitted for real provider sends in test mode. */
export function founderTestRecipientAllowlist(): Set<string> {
  const raw =
    (typeof process !== 'undefined' ? process.env.SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST : undefined) ??
    undefined;
  return parseAllowlist(raw);
}

export function isFounderTestModeEnabled(): boolean {
  const raw =
    (typeof process !== 'undefined' ? process.env.SITE00_DF_FOUNDER_TEST_MODE : undefined) ??
    undefined;
  return raw === '1' || raw?.toLowerCase() === 'true';
}

export function isRecipientAllowedForFounderTestSend(email: string): boolean {
  const list = founderTestRecipientAllowlist();
  if (!list.size) return false;
  return list.has(email.trim().toLowerCase());
}

export function maskToken(token: string | null | undefined): string {
  if (!token) return '—';
  if (token.length <= 8) return '••••';
  return `${token.slice(0, 4)}…${token.slice(-4)}`;
}
