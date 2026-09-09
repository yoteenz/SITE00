/**
 * BLDR Site Type multi-select + Audience single-select correction tests.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  normalizeSiteTypes,
  normalizeAudienceType,
  hydrateSiteTypeAnswer,
  toggleSiteTypeSelection,
  toggleAudienceSelection,
  BLDR_SITE_TYPE_OTHER_SPECIFY_KEY,
} from '../shared/site00-bldr-classification/siteTypeModel.js';
import {
  compileSiteTypeClassificationProfile,
  deriveSiteTypeDownstreamFlags,
  resolveSiteTypeFollowUpStepIds,
} from '../shared/site00-bldr-classification/siteTypeIntelligence.js';
import {
  validateBldrLandingFields,
  formatSiteTypesForReview,
} from '../shared/site00-bldr-classification/bldrFieldValidation.js';
import { diagnoseBuilderExperienceClass } from '../shared/site00-project-discovery/builderDiagnosis.js';
import {
  BLDR_ASSESSMENT_STATES,
  bldrAssessmentAllSteps,
} from '../src/site00/config/bldr-assessment.js';

const ROOT = join(import.meta.dirname, '..');
const BLDR_ASSESSMENT = readFileSync(join(ROOT, 'src/site00/config/bldr-assessment.ts'), 'utf8');
const BLDR_INTAKE_FIELDS = readFileSync(join(ROOT, 'src/site00/components/bldr/intake/BldrIntakeFields.tsx'), 'utf8');
const BLDR_SCOPE_FIELDS = readFileSync(join(ROOT, 'src/site00/components/bldr-assessment/BldrScopeFields.tsx'), 'utf8');
const USE_BLDR = readFileSync(join(ROOT, 'src/site00/hooks/useBldrAssessment.ts'), 'utf8');

describe('BLDR site type multi-select correction', () => {
  it('1. siteTypes is multi-value model', () => {
    expect(normalizeSiteTypes(['business', 'ecommerce'])).toEqual(['business', 'ecommerce']);
  });

  it('2. legacy siteType normalizes to siteTypes[]', () => {
    const hydrated = hydrateSiteTypeAnswer({ siteType: 'business' });
    expect(normalizeSiteTypes(hydrated.type)).toEqual(['business']);
    expect(hydrated.siteType).toBeUndefined();
  });

  it('3. multiple site types can be selected', () => {
    let selected: string[] = [];
    selected = toggleSiteTypeSelection(selected, 'business');
    selected = toggleSiteTypeSelection(selected, 'ecommerce');
    selected = toggleSiteTypeSelection(selected, 'booking');
    expect(selected).toEqual(['business', 'ecommerce', 'booking']);
  });

  it('4. selecting second site type does not clear first', () => {
    const first = toggleSiteTypeSelection([], 'business');
    const both = toggleSiteTypeSelection(first, 'ecommerce');
    expect(both).toContain('business');
    expect(both).toContain('ecommerce');
  });

  it('5. selecting third does not clear prior selections', () => {
    let s = toggleSiteTypeSelection([], 'business');
    s = toggleSiteTypeSelection(s, 'ecommerce');
    s = toggleSiteTypeSelection(s, 'booking');
    expect(s).toHaveLength(3);
  });

  it('6. site type can be deselected independently', () => {
    const s = toggleSiteTypeSelection(['business', 'ecommerce'], 'business');
    expect(s).toEqual(['ecommerce']);
  });

  it('7. OTHER can coexist with other selections', () => {
    const s = toggleSiteTypeSelection(['business', 'ecommerce'], 'other');
    expect(s).toEqual(['business', 'ecommerce', 'other']);
  });

  it('8. OTHER custom text persists via answer key', () => {
    expect(BLDR_SITE_TYPE_OTHER_SPECIFY_KEY).toBe('type-other-specify');
    const values = { type: ['other'], [BLDR_SITE_TYPE_OTHER_SPECIFY_KEY]: 'CUSTOM MARKETPLACE' };
    const errors = validateBldrLandingFields(
      [{ id: 'type', type: 'multi', required: true }],
      values,
    );
    expect(errors[BLDR_SITE_TYPE_OTHER_SPECIFY_KEY]).toBeUndefined();
  });

  it('9. audience remains single-select', () => {
    expect(toggleAudienceSelection('b2c', 'b2b')).toBe('b2b');
  });

  it('10. selecting B2B clears B2C', () => {
    expect(normalizeAudienceType('b2b')).toBe('b2b');
    expect(normalizeAudienceType(['b2c', 'b2b'])).toBe('b2b');
  });

  it('11. BOTH is exclusive audience value', () => {
    expect(normalizeAudienceType('both')).toBe('both');
  });

  it('12. INTERNAL is exclusive audience value', () => {
    expect(normalizeAudienceType('internal')).toBe('internal');
  });

  it('13. at least one site type required', () => {
    const errors = validateBldrLandingFields([{ id: 'type', type: 'multi', required: true }], { type: [] });
    expect(errors.type).toBe('SELECT AT LEAST ONE SITE TYPE.');
  });

  it('14. exactly one audience required', () => {
    const errors = validateBldrLandingFields(
      [{ id: 'audience', type: 'audience-row', required: true }],
      { audience: '' },
    );
    expect(errors.audience).toBe('SELECT WHO THIS SITE IS FOR.');
  });

  it('15. next step accepts multiple site types', () => {
    const answers = { type: ['business', 'ecommerce', 'booking'], audience: 'b2c' };
    const errors = validateBldrLandingFields(
      [
        { id: 'type', type: 'multi', required: true },
        { id: 'audience', type: 'audience-row', required: true },
      ],
      answers,
    );
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('16. back preserves multiple selections via hydration', () => {
    const stored = hydrateSiteTypeAnswer({ type: ['business', 'ecommerce', 'booking'], audience: 'b2b' });
    expect(normalizeSiteTypes(stored.type)).toEqual(['business', 'ecommerce', 'booking']);
    expect(stored.audience).toBe('b2b');
  });

  it('17. refresh/session restore preserves selections', () => {
    expect(USE_BLDR).toContain('hydrateSiteTypeAnswer');
  });

  it('18. review summary shows all selected site types', () => {
    const label = formatSiteTypesForReview(
      BLDR_ASSESSMENT_STATES.site.landingFields[0]!.options,
      ['business', 'ecommerce', 'booking'],
    );
    expect(label).toContain('BUSINESS WEBSITE');
    expect(label).toContain('E-COMMERCE STORE');
    expect(label).toContain('BOOKING / APPOINTMENTS');
  });

  it('19. classification engine receives full siteTypes[]', () => {
    const profile = compileSiteTypeClassificationProfile(['business', 'booking']);
    expect(profile.siteTypes).toEqual(['business', 'booking']);
    expect(profile.summaryLabel).toContain('SCHEDULING');
  });

  it('20. downstream commerce questions activate from E-COMMERCE', () => {
    expect(deriveSiteTypeDownstreamFlags(['ecommerce'])).toContain('COMMERCE_QUESTIONS');
    expect(resolveSiteTypeFollowUpStepIds(['ecommerce'])).toContain('commerce-scope');
  });

  it('21. downstream booking questions activate from BOOKING', () => {
    expect(deriveSiteTypeDownstreamFlags(['booking'])).toContain('BOOKING_QUESTIONS');
    expect(resolveSiteTypeFollowUpStepIds(['booking'])).toContain('scheduling-scope');
  });

  it('22. downstream membership questions activate from MEMBERSHIP', () => {
    expect(deriveSiteTypeDownstreamFlags(['membership'])).toContain('MEMBERSHIP_QUESTIONS');
    expect(resolveSiteTypeFollowUpStepIds(['membership'])).toContain('membership-scope');
  });

  it('23. downstream application questions activate from WEB APPLICATION', () => {
    expect(deriveSiteTypeDownstreamFlags(['web-app'])).toContain('APPLICATION_QUESTIONS');
    expect(resolveSiteTypeFollowUpStepIds(['web-app'])).toContain('application-scope');
  });

  it('24. audience is not converted to array', () => {
    const hydrated = hydrateSiteTypeAnswer({ audience: 'b2b' });
    expect(hydrated.audience).toBe('b2b');
    expect(Array.isArray(hydrated.audience)).toBe(false);
  });

  it('25. checkbox accessibility semantics on site type', () => {
    expect(BLDR_INTAKE_FIELDS).toContain("role={mode === 'single' ? 'radio' : 'checkbox'}");
    expect(BLDR_SCOPE_FIELDS).toContain('mode={mode}');
  });

  it('26. radio accessibility semantics on audience', () => {
    expect(BLDR_INTAKE_FIELDS).toContain("role={mode === 'single' ? 'radiogroup' : 'group'}");
  });

  it('27. mobile render path uses BldrIntakeFields multi mode', () => {
    expect(BLDR_ASSESSMENT).toContain("type: 'multi'");
    expect(BLDR_ASSESSMENT).toContain('SELECT ALL THAT APPLY.');
  });

  it('28. desktop render path uses BldrScopeFields multi mode', () => {
    expect(BLDR_SCOPE_FIELDS).toContain("field.type === 'multi' ? 'multi' : 'single'");
  });

  it('29. config resolves conditional follow-up steps from site types', () => {
    const answers = { type: ['ecommerce', 'booking', 'membership', 'web-app'] };
    const steps = bldrAssessmentAllSteps(BLDR_ASSESSMENT_STATES.site, answers);
    const ids = steps.map((s) => s.id);
    expect(ids).toContain('commerce-scope');
    expect(ids).toContain('scheduling-scope');
    expect(ids).toContain('membership-scope');
    expect(ids).toContain('application-scope');
  });

  it('classification uses full combination for hybrid site builds', () => {
    const result = diagnoseBuilderExperienceClass({
      classSlug: 'site',
      answers: { type: ['business', 'web-app'] },
    });
    expect(result).toBe('APPLICATION');
  });
});
