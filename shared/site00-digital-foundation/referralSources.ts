import type { ReferralSource, ReferralSourceKind } from './types.js';

/** Stable IDs so Supabase FK on site00_df_leads.referral_source_id survives restarts and persist. */
export const DF_REFERRAL_SOURCE_ID: Record<ReferralSourceKind, string> = {
  AIO: '11111111-1111-4111-8111-111111111101',
  SISTER_REA: '11111111-1111-4111-8111-111111111102',
  DIRECT: '11111111-1111-4111-8111-111111111103',
  CLIENT_REFERRAL: '11111111-1111-4111-8111-111111111104',
  SITE00: '11111111-1111-4111-8111-111111111105',
  CUSTOM: '11111111-1111-4111-8111-111111111106',
};

const SEED: Array<{ kind: ReferralSourceKind; label: string }> = [
  { kind: 'AIO', label: 'AIO' },
  { kind: 'SISTER_REA', label: 'Sister / REA' },
  { kind: 'DIRECT', label: 'Direct' },
  { kind: 'CLIENT_REFERRAL', label: 'Client referral' },
  { kind: 'SITE00', label: 'SITE 00' },
  { kind: 'CUSTOM', label: 'Custom' },
];

export function seedReferralSources(): ReferralSource[] {
  return SEED.map((s) => ({
    referral_source_id: DF_REFERRAL_SOURCE_ID[s.kind],
    kind: s.kind,
    label: s.label,
    active: true,
  }));
}

export function findReferralByKind(sources: ReferralSource[], kind: ReferralSourceKind): ReferralSource | undefined {
  return sources.find((s) => s.kind === kind && s.active);
}
