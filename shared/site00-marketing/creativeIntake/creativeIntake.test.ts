import { describe, expect, it, beforeEach } from 'vitest';
import { getCreativeIntakeExperience, getExperienceMatrix, listCreativeIntakeExperiences } from './experienceRegistry.js';
import { formStateToIntakeRecord, intakeRecordToFormState } from './fieldMapping.js';
import { validateStage, draftStorageKey } from './validation.js';
import { MARKETING_CONTENT_SERVICES } from '../serviceTaxonomy.js';
import type { MarketingServiceCategory } from '../types.js';

describe('EVOLVE adaptive creative intake', () => {
  it('routes every selectable discipline to an intentional experience family', () => {
    for (const service of MARKETING_CONTENT_SERVICES) {
      const exp = getCreativeIntakeExperience(service.id);
      expect(exp.discipline).toBe(service.id);
      expect(exp.signatureArtifact).not.toBe('GENERIC_FALLBACK');
      expect(exp.stages.length).toBeGreaterThan(3);
    }
  });

  it('assigns correct signature artifact per major discipline', () => {
    expect(getCreativeIntakeExperience('social-content').differentiationMarker).toBe('ATTENTION_MAP');
    expect(getCreativeIntakeExperience('brand-film').differentiationMarker).toBe('FILM_TREATMENT');
    expect(getCreativeIntakeExperience('campaign').differentiationMarker).toBe('CAMPAIGN_CONTROL');
    expect(getCreativeIntakeExperience('content-system').differentiationMarker).toBe('STORY_FILE');
  });

  it('shares ATTENTION family for social and UGC without sharing campaign', () => {
    expect(getCreativeIntakeExperience('social-content').family).toBe('ATTENTION');
    expect(getCreativeIntakeExperience('ugc-style').family).toBe('ATTENTION');
    expect(getCreativeIntakeExperience('campaign').family).toBe('CAMPAIGN_CONTROL');
  });

  it('maps form state to MarketingIntakeRecord without schema changes', () => {
    const record = formStateToIntakeRecord({
      campaignObjective: 'Grow awareness',
      platforms: ['INSTAGRAM', 'TIKTOK'],
      businessName: 'Test Brand',
    });
    expect(record.campaignObjective).toBe('Grow awareness');
    expect(record.platforms).toEqual(['INSTAGRAM', 'TIKTOK']);
    expect(record.businessName).toBe('Test Brand');
  });

  it('round-trips intake record to form state', () => {
    const original = {
      campaignObjective: 'Launch',
      targetAudience: 'Founders',
      platforms: ['LINKEDIN'],
    };
    const form = intakeRecordToFormState(original);
    const back = formStateToIntakeRecord(form);
    expect(back.campaignObjective).toBe('Launch');
    expect(back.platforms).toEqual(['LINKEDIN']);
  });

  it('validates stages without blocking empty optional fields', () => {
    const exp = getCreativeIntakeExperience('social-content');
    const result = validateStage(exp, 1, { campaignObjective: 'test' });
    expect(result.ok).toBe(true);
  });

  it('uses discipline-specific draft storage keys', () => {
    expect(draftStorageKey('social-content')).toContain('social-content');
    expect(draftStorageKey('brand-film')).not.toBe(draftStorageKey('campaign'));
  });

  it('experience matrix covers all catalog disciplines', () => {
    const matrix = getExperienceMatrix();
    const ids = matrix.map((m) => m.discipline);
    for (const s of MARKETING_CONTENT_SERVICES) {
      expect(ids).toContain(s.id);
    }
  });

  it('headline-removal markers differ across major families', () => {
    const markers = new Set(
      (['social-content', 'brand-film', 'campaign', 'content-system'] as MarketingServiceCategory[]).map(
        (id) => getCreativeIntakeExperience(id).differentiationMarker,
      ),
    );
    expect(markers.size).toBe(4);
  });

  it('does not embed fabricated analytics in experience config', () => {
    const json = JSON.stringify(listCreativeIntakeExperiences());
    expect(json).not.toMatch(/engagement|reach|conversion rate|views/i);
  });

  it('campaign family covers product and launch campaigns', () => {
    expect(getCreativeIntakeExperience('product-campaign').family).toBe('CAMPAIGN_CONTROL');
    expect(getCreativeIntakeExperience('launch-campaign').family).toBe('CAMPAIGN_CONTROL');
  });

  it('mobile mode is assigned per family', () => {
    expect(getCreativeIntakeExperience('social-content').mobileMode).toBe('viewport-attention');
    expect(getCreativeIntakeExperience('brand-film').mobileMode).toBe('director-monitor');
    expect(getCreativeIntakeExperience('campaign').mobileMode).toBe('active-node');
    expect(getCreativeIntakeExperience('content-system').mobileMode).toBe('specimen-record');
  });
});
