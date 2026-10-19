import type { FoundationAdminListRow, ReferralSourceRow } from '../../services/foundationAdminApi';

export type ReferralActivityEvent = {
  id: string;
  occurred_at: string;
  verb: string;
  subject: string;
  partner_label: string;
  artifact_id: string;
  category: 'attribution' | 'lifecycle';
};

/**
 * Derives display-only activity from persisted registry rows.
 * Does not fabricate commission/payout/partner-commerce events (no GET /api/admin/referrals/events yet).
 */
export function referralActivityFromRegistry(
  artifacts: FoundationAdminListRow[],
  sources: ReferralSourceRow[],
): ReferralActivityEvent[] {
  const sourceById = new Map(sources.map((s) => [s.referral_source_id, s]));
  const attributed = artifacts.filter((a) => a.referral_source_id);
  const events: ReferralActivityEvent[] = attributed.map((a) => {
    const partner = sourceById.get(a.referral_source_id ?? '')?.label ?? 'Unknown partner';
    const subject = a.business_name?.trim() || a.artifact_id.slice(0, 8);
    const at = a.last_activity_at ?? a.created_at;
    return {
      id: `attr-${a.artifact_id}`,
      occurred_at: at,
      verb: 'Attributed client in registry',
      subject,
      partner_label: partner,
      artifact_id: a.artifact_id,
      category: 'attribution',
    };
  });
  events.sort((a, b) => Date.parse(b.occurred_at) - Date.parse(a.occurred_at));
  return events;
}

export function formatReferralActivityTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
