import { randomUUID } from 'node:crypto';
import type { ReferralSource, ReferralSourceKind } from './types.js';

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
    referral_source_id: randomUUID(),
    kind: s.kind,
    label: s.label,
    active: true,
  }));
}

export function findReferralByKind(sources: ReferralSource[], kind: ReferralSourceKind): ReferralSource | undefined {
  return sources.find((s) => s.kind === kind && s.active);
}
