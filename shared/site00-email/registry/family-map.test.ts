import { describe, expect, it } from 'vitest';
import { EMAIL_TEMPLATES } from '../registry/templates.js';
import { EMAIL_FAMILY_CANON_LIST } from '../families/registry.js';
import { familyMappingAudit, getPrimaryFamily, listTemplatesByFamily } from '../registry/family-map.js';
import { renderEmailTemplateSync } from '../render.js';

describe('family-map', () => {
  it('maps all 80 templates to a primary family', () => {
    expect(EMAIL_TEMPLATES).toHaveLength(80);
    for (const t of EMAIL_TEMPLATES) {
      const canon = getPrimaryFamily(t.id);
      expect(EMAIL_FAMILY_CANON_LIST).toContain(canon);
    }
  });

  it('has explicit mapping for every template', () => {
    const audit = familyMappingAudit();
    expect(audit.total).toBe(80);
    expect(audit.unresolved).toHaveLength(0);
  });

  it('assigns sign-in-link to ACCESS_SECURITY', () => {
    expect(getPrimaryFamily('sign-in-link')).toBe('ACCESS_SECURITY');
  });

  it('assigns access-credential-issued to WELCOME_ONBOARDING', () => {
    expect(getPrimaryFamily('access-credential-issued')).toBe('WELCOME_ONBOARDING');
  });

  it('assigns payment-failed to ALERT_BLOCKER', () => {
    expect(getPrimaryFamily('payment-failed')).toBe('ALERT_BLOCKER');
  });

  it('covers all nine families', () => {
    for (const canon of EMAIL_FAMILY_CANON_LIST) {
      expect(listTemplatesByFamily(canon).length).toBeGreaterThan(0);
    }
  });
});

describe('renderEmailTemplateSync', () => {
  const sampleByFamily: Record<string, string> = {
    ACCESS_SECURITY: 'sign-in-link',
    WELCOME_ONBOARDING: 'access-credential-issued',
    PROJECT_PRODUCTION: 'project-initialized',
    ACTION_REVIEW: 'review-ready',
    MILESTONE_CELEBRATION: 'milestone-recorded',
    DELIVERY_COMPLETE: 'production-complete',
    BILLING_PAYMENT: 'payment-receipt',
    ALERT_BLOCKER: 'production-paused',
    REENGAGEMENT_HUMAN: 're-engagement',
  };

  for (const [canon, templateId] of Object.entries(sampleByFamily)) {
    it(`renders ${canon} sample template ${templateId}`, () => {
      const { html, text, subject } = renderEmailTemplateSync(templateId);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('SITE 00');
      expect(subject.length).toBeGreaterThan(0);
      expect(text).toContain('SITE 00');
      expect(getPrimaryFamily(templateId)).toBe(canon);
    });
  }

  it('includes QR for ACCESS_SECURITY templates when async', async () => {
    const { renderEmailTemplate } = await import('../render.js');
    const r = await renderEmailTemplate('sign-in-link');
    expect(r.html).toContain('data:image');
  });
});
