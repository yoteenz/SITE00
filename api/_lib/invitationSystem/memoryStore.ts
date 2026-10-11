import {
  defaultAttributionPolicy,
  defaultCommissionRules,
  seedAioPartner001,
  seedAioSharedOfficeCode,
  seedInvitation001Batch,
  seedInvitation001Campaign,
} from '../../../shared/site00-invitation-system/index.js';
import type {
  ClientAcquisitionAttribution,
  CommissionAdjustment,
  InvitationActivation,
  InvitationBatch,
  InvitationCampaign,
  InvitationCode,
  InvitationVisit,
  PartnerCommissionEntry,
  ReferralBusinessEvent,
  ReferralPartner,
} from '../../../shared/site00-invitation-system/types.js';
import { FIXTURE_INVITATION_CODES } from '../../../shared/site00-invitation-system/fixtures.js';

export type InvitationMemoryState = {
  policy: ReturnType<typeof defaultAttributionPolicy>;
  commissionRules: ReturnType<typeof defaultCommissionRules>;
  partners: Map<string, ReferralPartner>;
  campaigns: Map<string, InvitationCampaign>;
  batches: Map<string, InvitationBatch>;
  codes: Map<string, InvitationCode>;
  codesByValue: Map<string, string>;
  visits: Map<string, InvitationVisit>;
  activations: Map<string, InvitationActivation>;
  attributions: Map<string, ClientAcquisitionAttribution>;
  events: ReferralBusinessEvent[];
  commissions: Map<string, PartnerCommissionEntry>;
  adjustments: CommissionAdjustment[];
  processedIdempotency: Set<string>;
};

let state: InvitationMemoryState | null = null;

function nowIso(): string {
  return new Date().toISOString();
}

function seedFixtures(s: InvitationMemoryState): void {
  const now = nowIso();
  const partner = seedAioPartner001(now);
  const campaign = seedInvitation001Campaign(partner.partner_id, now);
  const batch = seedInvitation001Batch(campaign.campaign_id, now);
  const code = seedAioSharedOfficeCode(campaign.campaign_id, batch.batch_id, now);

  s.partners.set(partner.partner_id, partner);
  s.campaigns.set(campaign.campaign_id, campaign);
  s.batches.set(batch.batch_id, batch);
  s.codes.set(code.invitation_code_id, code);
  s.codesByValue.set(code.code, code.invitation_code_id);

  const expired: InvitationCode = {
    ...code,
    invitation_code_id: '00000000-0000-4000-8000-000000000302',
    code: FIXTURE_INVITATION_CODES.EXPIRED,
    status: 'EXPIRED',
    expires_at: '2020-01-01T00:00:00.000Z',
  };
  s.codes.set(expired.invitation_code_id, expired);
  s.codesByValue.set(expired.code, expired.invitation_code_id);

  const revoked: InvitationCode = {
    ...code,
    invitation_code_id: '00000000-0000-4000-8000-000000000303',
    code: FIXTURE_INVITATION_CODES.REVOKED,
    status: 'REVOKED',
    revoked_at: now,
  };
  s.codes.set(revoked.invitation_code_id, revoked);
  s.codesByValue.set(revoked.code, revoked.invitation_code_id);
}

export function getInvitationMemoryState(): InvitationMemoryState {
  if (!state) {
    state = {
      policy: defaultAttributionPolicy(),
      commissionRules: defaultCommissionRules(),
      partners: new Map(),
      campaigns: new Map(),
      batches: new Map(),
      codes: new Map(),
      codesByValue: new Map(),
      visits: new Map(),
      activations: new Map(),
      attributions: new Map(),
      events: [],
      commissions: new Map(),
      adjustments: [],
      processedIdempotency: new Set(),
    };
    seedFixtures(state);
  }
  return state;
}

export function resetInvitationMemoryState(): void {
  state = null;
}
