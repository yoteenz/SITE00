import { describe, it, expect } from 'vitest';
import {
  listCorrectionsFromSupabasePage,
  listJudgmentsFromSupabasePage,
} from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/creativeIntelligenceSupabaseStore.js';
import { listCampaignCopyPackagesFromSupabasePage } from '../api/_lib/site00ExpressionEngine/campaignCopy/campaignCopySupabaseStore.js';

describe('creative intelligence bounded list adapters', () => {
  it('exports paginated judgment listing', () => {
    expect(typeof listJudgmentsFromSupabasePage).toBe('function');
  });

  it('exports paginated correction listing', () => {
    expect(typeof listCorrectionsFromSupabasePage).toBe('function');
  });

  it('exports paginated campaign copy package listing', () => {
    expect(typeof listCampaignCopyPackagesFromSupabasePage).toBe('function');
  });
});
