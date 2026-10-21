import { AIO_PARTNER_DISPLAY } from './referralPolicy';

/** Founder gate — no print/export until a future production sprint authorizes it. */
export const REFERRAL_CARD_PRINT_READY = false;

export type ApprovedReferralCardAssets = {
  frontSrc: string;
  backSrc: string;
  altFront: string;
  altBack: string;
};

/** Canonical public paths (served from `public/`). */
export const SITE00_IDNTY_REFERRAL_CARD_AIO: ApprovedReferralCardAssets = {
  frontSrc: '/site00/idnty/referral-card/aio/site00-idnty-referral-card-front.jpg',
  backSrc: '/site00/idnty/referral-card/aio/site00-idnty-referral-card-back.jpg',
  altFront: 'SITE 00 DIGITAL FOUNDATION REFERRAL CARD — FRONT',
  altBack: 'SITE 00 DIGITAL FOUNDATION REFERRAL CARD — BACK',
};

const normalizePartnerKey = (name: string) => name.trim().toUpperCase();

/** Approved raster artwork by partner legal name. Other partners keep CSS placeholder until artwork is ingested. */
export const APPROVED_REFERRAL_CARD_BY_PARTNER: Record<string, ApprovedReferralCardAssets> = {
  [normalizePartnerKey(AIO_PARTNER_DISPLAY.legalName)]: SITE00_IDNTY_REFERRAL_CARD_AIO,
};

export function approvedReferralCardAssets(partnerName: string): ApprovedReferralCardAssets | null {
  return APPROVED_REFERRAL_CARD_BY_PARTNER[normalizePartnerKey(partnerName)] ?? null;
}
