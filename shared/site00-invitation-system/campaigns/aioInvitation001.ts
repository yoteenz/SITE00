import { randomBytes } from 'node:crypto';
import type { InvitationBatch, InvitationCampaign, InvitationCode, ReferralPartner } from '../types.js';
import { ATTRIBUTION_POLICY_VERSION } from '../attributionPolicy.js';
import { COMMISSION_RULE_VERSION } from '../commissionRules.js';

export const AIO_PARTNER_NUMBER = '001';
export const AIO_PARTNER_DISPLAY_ID = 'AIO';
export const AIO_PARTNER_LEGAL_NAME = 'ALL IN ONE ENTERPRISES INC';

export const INVITATION_001_COLLECTION = 'INVITATION 001';

/** Stable opaque code for the shared office QR (campaign-managed, not PII). */
export function aioOfficeInvitationCodeValue(): string {
  return 'aio-office-inv001';
}

export function seedAioPartner001(now: string): ReferralPartner {
  return {
    partner_id: '00000000-0000-4000-8000-000000000001',
    partner_number: AIO_PARTNER_NUMBER,
    display_id: AIO_PARTNER_DISPLAY_ID,
    legal_name: AIO_PARTNER_LEGAL_NAME,
    status: 'ACTIVE',
    agreement_version: null,
    reporting_scope: 'SELF_ONLY',
    created_at: now,
    updated_at: now,
  };
}

export function seedInvitation001Campaign(partnerId: string, now: string): InvitationCampaign {
  return {
    campaign_id: '00000000-0000-4000-8000-000000000101',
    partner_id: partnerId,
    collection_label: INVITATION_001_COLLECTION,
    channel: 'OFFICE',
    placement: 'AIO FRONT OFFICE',
    audience: 'NEW BUSINESS OWNERS',
    primary_service: 'SITE 00 DIGITAL FOUNDATION',
    secondary_expansion: 'SITE 00 BLDR',
    invitation_type: 'SHARED_OFFICE',
    status: 'ACTIVE',
    attribution_policy_version: ATTRIBUTION_POLICY_VERSION,
    commission_rule_version: COMMISSION_RULE_VERSION,
    starts_at: now,
    ends_at: null,
    created_at: now,
    updated_at: now,
  };
}

export function seedInvitation001Batch(campaignId: string, now: string): InvitationBatch {
  return {
    batch_id: '00000000-0000-4000-8000-000000000201',
    campaign_id: campaignId,
    batch_label: 'AIO-OFFICE-BATCH-001',
    card_edition: 'INVITATION 001 — OFFICE STACK',
    print_status: 'NOT_PRINTED',
    distribution_location: 'AIO FRONT OFFICE',
    optional_inventory_count: null,
    created_at: now,
  };
}

export function seedAioSharedOfficeCode(campaignId: string, batchId: string, now: string): InvitationCode {
  return {
    invitation_code_id: '00000000-0000-4000-8000-000000000301',
    campaign_id: campaignId,
    batch_id: batchId,
    code: aioOfficeInvitationCodeValue(),
    invitation_type: 'SHARED_OFFICE',
    status: 'ACTIVE',
    expires_at: null,
    revoked_at: null,
    created_at: now,
  };
}

/** Opaque personalized code — no client PII in the string. */
export function newPersonalizedInvitationCode(): string {
  return randomBytes(16).toString('base64url');
}
