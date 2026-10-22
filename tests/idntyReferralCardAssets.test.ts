import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  APPROVED_REFERRAL_CARD_BY_PARTNER,
  REFERRAL_CARD_PRINT_READY,
  SITE00_IDNTY_REFERRAL_CARD_AIO,
  approvedReferralCardAssets,
} from '../src/site00/admin/founder-workspace/config/referralCardAssets';
import { AIO_PARTNER_DISPLAY } from '../src/site00/admin/founder-workspace/config/referralPolicy';

describe('approved referral card assets', () => {
  it('maps AIO partner to canonical front/back paths only', () => {
    const aio = approvedReferralCardAssets(AIO_PARTNER_DISPLAY.legalName);
    expect(aio).toEqual(SITE00_IDNTY_REFERRAL_CARD_AIO);
    expect(approvedReferralCardAssets('Other Partner LLC')).toBeNull();
    expect(Object.keys(APPROVED_REFERRAL_CARD_BY_PARTNER)).toHaveLength(1);
  });

  it('keeps print readiness disabled', () => {
    expect(REFERRAL_CARD_PRINT_READY).toBe(false);
  });

  it('commits founder JPEGs under public/', () => {
    for (const rel of [SITE00_IDNTY_REFERRAL_CARD_AIO.frontSrc, SITE00_IDNTY_REFERRAL_CARD_AIO.backSrc]) {
      const path = new URL(`../public${rel}`, import.meta.url);
      const buf = readFileSync(path);
      expect(buf.length).toBeGreaterThan(10_000);
    }
  });

  it('FounderCard uses approved artwork img path for AIO', () => {
    const kit = readFileSync(new URL('../src/site00/admin/founder-workspace/referrals/rfKit.tsx', import.meta.url), 'utf8');
    expect(kit).toContain('rcard--approved-art');
    expect(kit).toContain('approvedReferralCardAssets');
    expect(kit).toContain('rcard__art');
  });
});
