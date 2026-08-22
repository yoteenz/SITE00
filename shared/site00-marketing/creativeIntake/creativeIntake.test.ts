import { describe, expect, it, beforeEach } from 'vitest';
import { getCreativeIntakeExperience, getExperienceMatrix, listCreativeIntakeExperiences } from './experienceRegistry.js';
import { formStateToIntakeRecord, intakeRecordToFormState } from './fieldMapping.js';
import { validateStage, draftStorageKey } from './validation.js';
import { MARKETING_CONTENT_SERVICES } from '../serviceTaxonomy.js';
import type { MarketingServiceCategory } from '../types.js';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CREATIVE_INTAKE_CSS = readFileSync(
  join(__dirname, '../../../src/site00/styles/site00-creative-intake.css'),
  'utf8',
);

const ALL_DISCIPLINES: MarketingServiceCategory[] = [
  'social-content',
  'ugc-style',
  'brand-film',
  'campaign',
  'product-campaign',
  'launch-campaign',
  'content-system',
];

describe('EVOLVE adaptive creative intake', () => {
  it('routes every selectable discipline to an intentional experience family', () => {
    for (const service of MARKETING_CONTENT_SERVICES) {
      const exp = getCreativeIntakeExperience(service.id);
      expect(exp.discipline).toBe(service.id);
      expect(exp.signatureArtifact).not.toBe('GENERIC_FALLBACK');
      expect(exp.stages.length).toBeGreaterThan(3);
    }
  });

  it('assigns unique signature artifact per discipline', () => {
    const artifacts = ALL_DISCIPLINES.map((id) => getCreativeIntakeExperience(id).signatureArtifact);
    expect(new Set(artifacts).size).toBe(7);
    expect(getCreativeIntakeExperience('social-content').differentiationMarker).toBe('ATTENTION_MAP');
    expect(getCreativeIntakeExperience('ugc-style').differentiationMarker).toBe('UGC_STYLE_GUIDE');
    expect(getCreativeIntakeExperience('brand-film').differentiationMarker).toBe('FILM_TREATMENT');
    expect(getCreativeIntakeExperience('campaign').differentiationMarker).toBe('CAMPAIGN_CONTROL');
    expect(getCreativeIntakeExperience('product-campaign').differentiationMarker).toBe('PRODUCT_STAGE');
    expect(getCreativeIntakeExperience('launch-campaign').differentiationMarker).toBe('LAUNCH_BLUEPRINT');
    expect(getCreativeIntakeExperience('content-system').differentiationMarker).toBe('CONTENT_SYSTEM_MAP');
  });

  it('does not share ATTENTION family between social and UGC', () => {
    expect(getCreativeIntakeExperience('social-content').family).toBe('ATTENTION');
    expect(getCreativeIntakeExperience('ugc-style').family).toBe('UGC_AUTHENTICITY');
    expect(getCreativeIntakeExperience('social-content').family).not.toBe(getCreativeIntakeExperience('ugc-style').family);
  });

  it('does not share campaign family between campaign, product, and launch', () => {
    const families = ['campaign', 'product-campaign', 'launch-campaign'].map(
      (id) => getCreativeIntakeExperience(id as MarketingServiceCategory).family,
    );
    expect(new Set(families).size).toBe(3);
    expect(families).toContain('CAMPAIGN_CONTROL');
    expect(families).toContain('PRODUCT_STAGING');
    expect(families).toContain('LAUNCH_SEQUENCE');
  });

  it('uses discipline-specific stage vocabulary', () => {
    expect(getCreativeIntakeExperience('social-content').stages[0].progressLabel).toBe('POSITION');
    expect(getCreativeIntakeExperience('ugc-style').stages[1].progressLabel).toBe('STYLE');
    expect(getCreativeIntakeExperience('brand-film').stages[3].progressLabel).toBe('TREATMENT');
    expect(getCreativeIntakeExperience('campaign').stages[0].progressLabel).toBe('OBJECTIVE');
    expect(getCreativeIntakeExperience('product-campaign').stages[0].progressLabel).toBe('PRODUCT');
    expect(getCreativeIntakeExperience('launch-campaign').stages[4].progressLabel).toBe('LAUNCH');
    expect(getCreativeIntakeExperience('content-system').stages[2].progressLabel).toBe('CONTENT TYPES');
  });

  it('maps form state to MarketingIntakeRecord without schema changes', () => {
    const record = formStateToIntakeRecord({
      campaignObjective: 'GROW AWARENESS',
      platforms: ['INSTAGRAM', 'TIKTOK'],
      businessName: 'TEST BRAND',
    });
    expect(record.campaignObjective).toBe('GROW AWARENESS');
    expect(record.platforms).toEqual(['INSTAGRAM', 'TIKTOK']);
    expect(record.businessName).toBe('TEST BRAND');
  });

  it('round-trips intake record to form state', () => {
    const original = {
      campaignObjective: 'LAUNCH',
      targetAudience: 'FOUNDERS',
      platforms: ['LINKEDIN'],
    };
    const form = intakeRecordToFormState(original);
    const back = formStateToIntakeRecord(form);
    expect(back.campaignObjective).toBe('LAUNCH');
    expect(back.platforms).toEqual(['LINKEDIN']);
  });

  it('validates stages without blocking empty optional fields', () => {
    const exp = getCreativeIntakeExperience('social-content');
    const result = validateStage(exp, 1, { campaignObjective: 'TEST' });
    expect(result.ok).toBe(true);
  });

  it('uses discipline-specific draft storage keys', () => {
    expect(draftStorageKey('social-content')).toContain('social-content');
    expect(draftStorageKey('brand-film')).not.toBe(draftStorageKey('campaign'));
    expect(draftStorageKey('ugc-style')).not.toBe(draftStorageKey('social-content'));
  });

  it('experience matrix covers all catalog disciplines', () => {
    const matrix = getExperienceMatrix();
    const ids = matrix.map((m) => m.discipline);
    for (const s of MARKETING_CONTENT_SERVICES) {
      expect(ids).toContain(s.id);
    }
  });

  it('headline-removal markers differ across all seven disciplines', () => {
    const markers = new Set(ALL_DISCIPLINES.map((id) => getCreativeIntakeExperience(id).differentiationMarker));
    expect(markers.size).toBe(7);
  });

  it('does not embed fabricated analytics in experience config', () => {
    const json = JSON.stringify(listCreativeIntakeExperiences());
    expect(json).not.toMatch(/engagement rate|reach|conversion rate|views/i);
  });

  it('assigns distinct mobile modes per family', () => {
    expect(getCreativeIntakeExperience('social-content').mobileMode).toBe('viewport-attention');
    expect(getCreativeIntakeExperience('ugc-style').mobileMode).toBe('creator-frame');
    expect(getCreativeIntakeExperience('brand-film').mobileMode).toBe('director-monitor');
    expect(getCreativeIntakeExperience('campaign').mobileMode).toBe('active-node');
    expect(getCreativeIntakeExperience('product-campaign').mobileMode).toBe('product-stage');
    expect(getCreativeIntakeExperience('launch-campaign').mobileMode).toBe('launch-countdown');
    expect(getCreativeIntakeExperience('content-system').mobileMode).toBe('system-architecture');
  });

  it('uses uppercase prompts across all disciplines', () => {
    for (const id of ALL_DISCIPLINES) {
      const exp = getCreativeIntakeExperience(id);
      for (const stage of exp.stages) {
        expect(stage.prompt).toBe(stage.prompt.toUpperCase());
        expect(stage.progressLabel).toBe(stage.progressLabel.toUpperCase());
      }
    }
  });

  it('creative intake CSS enforces uppercase and blocks serif leakage', () => {
    expect(CREATIVE_INTAKE_CSS).toContain('text-transform: uppercase');
    expect(CREATIVE_INTAKE_CSS).not.toMatch(/Georgia|Times New Roman|'Times'/i);
    expect(CREATIVE_INTAKE_CSS).not.toContain('text-transform: none');
    expect(CREATIVE_INTAKE_CSS).toContain('Serif regression guard');
  });

  it('platform strategy selections do not imply provider connection in copy', () => {
    const json = JSON.stringify(listCreativeIntakeExperiences());
    expect(json).not.toMatch(/oauth|connected account|authorized provider/i);
  });

  it('empty artifact display values use pending language not fabricated metrics', () => {
    const exp = getCreativeIntakeExperience('social-content');
    expect(exp.progressMetaphor).not.toMatch(/views|engagement|reach/i);
    expect(exp.completionLanguage).not.toMatch(/analytics/i);
  });

  it('MarketingIntakePage uses Site00PublicShell for canonical SITE 00 shell', () => {
    const pageSource = readFileSync(
      join(__dirname, '../../../src/site00/pages/evolve/marketing/MarketingIntakePage.tsx'),
      'utf8',
    );
    expect(pageSource).toContain('Site00PublicShell');
    expect(pageSource).not.toContain('Site00AppShell');
  });

  it('each discipline resolves to correct unique experience via registry', () => {
    for (const id of ALL_DISCIPLINES) {
      const exp = getCreativeIntakeExperience(id);
      expect(exp.discipline).toBe(id);
      expect(exp.differentiationMarker).toBe(exp.signatureArtifact);
    }
  });

  it('content system no longer uses editorial story file artifact', () => {
    expect(getCreativeIntakeExperience('content-system').family).toBe('CONTENT_ENGINE');
    expect(getCreativeIntakeExperience('content-system').signatureArtifact).not.toBe('STORY_FILE');
  });
});
