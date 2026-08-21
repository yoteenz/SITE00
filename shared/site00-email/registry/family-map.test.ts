import { describe, expect, it } from 'vitest';
import { EMAIL_TEMPLATES } from '../registry/templates.js';
import { EMAIL_FAMILY_CANON_LIST } from '../families/registry.js';
import { familyMappingAudit, getPrimaryFamily, listTemplatesByFamily } from '../registry/family-map.js';
import { renderEmailTemplateSync } from '../render.js';
import { getTemplateManifest } from '../art-direction/template-manifest.js';

describe('family-map', () => {
  it('maps all 84 templates to a primary family', () => {
    expect(EMAIL_TEMPLATES).toHaveLength(84);
    for (const t of EMAIL_TEMPLATES) {
      const canon = getPrimaryFamily(t.id);
      expect(EMAIL_FAMILY_CANON_LIST).toContain(canon);
    }
  });

  it('has explicit mapping for every template', () => {
    const audit = familyMappingAudit();
    expect(audit.total).toBe(84);
    expect(audit.unresolved).toHaveLength(0);
  });

  it('assigns sign-in-link to ACCESS_SECURITY', () => {
    expect(getPrimaryFamily('sign-in-link')).toBe('ACCESS_SECURITY');
  });

  it('assigns access-credential-issued to ACCESS_SECURITY', () => {
    expect(getPrimaryFamily('access-credential-issued')).toBe('ACCESS_SECURITY');
  });

  it('assigns welcome-location-assigned to WELCOME_ONBOARDING', () => {
    expect(getPrimaryFamily('welcome-location-assigned')).toBe('WELCOME_ONBOARDING');
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
    ACCESS_SECURITY: 'access-credential-issued',
    WELCOME_ONBOARDING: 'welcome-location-assigned',
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

describe('lifecycle composition differentiation', () => {
  const lifecycleIds = [
    'access-credential-issued',
    'welcome-location-assigned',
    'identity-path-received',
    'identity-input-saved',
    'identity-calibration-complete',
    'identity-review-ready',
    'identity-foundation-locked',
  ] as const;

  it('defines manifest entries for lifecycle templates', () => {
    for (const id of lifecycleIds) {
      expect(getTemplateManifest(id)).toBeDefined();
    }
  });

  it('renders distinct HTML bodies without relying on identical family shell', () => {
    const bodies = lifecycleIds.map((id) => {
      const { html } = renderEmailTemplateSync(id);
      return html.replace(/<p class="hero-xl"[^>]*>[\s\S]*?<\/p>/gi, '')
        .replace(/<p class="hero-lg"[^>]*>[\s\S]*?<\/p>/gi, '');
    });
    const unique = new Set(bodies);
    expect(unique.size).toBe(lifecycleIds.length);
  });

  it('access credential uses dark credential artifact not location key', () => {
    const { html } = renderEmailTemplateSync('access-credential-issued');
    expect(html).toContain('CREDENTIAL');
    expect(html).toContain('ACCESS GRANTED');
    expect(html).toContain('DIGITAL CREDENTIAL');
    expect(html).not.toContain('LOCATION KEY');
  });

  it('welcome location uses location key artifact not credential slab', () => {
    const { html } = renderEmailTemplateSync('welcome-location-assigned');
    expect(html).toContain('LOCATION KEY');
    expect(html).not.toContain('ACCESS GRANTED');
  });

  it('identity path uses route map artifact', () => {
    const { html } = renderEmailTemplateSync('identity-path-received');
    expect(html).toContain('ROUTE MAP');
  });

  it('identity input uses input receipt artifact', () => {
    const { html } = renderEmailTemplateSync('identity-input-saved');
    expect(html).toContain('INPUT RECEIPT');
  });

  it('identity calibration uses calibration matrix', () => {
    const { html } = renderEmailTemplateSync('identity-calibration-complete');
    expect(html).toContain('CALIBRATION MATRIX');
  });

  it('identity review uses review dossier', () => {
    const { html } = renderEmailTemplateSync('identity-review-ready');
    expect(html).toContain('REVIEW DOSSIER');
  });

  it('identity foundation uses locked blueprint', () => {
    const { html } = renderEmailTemplateSync('identity-foundation-locked');
    expect(html).toContain('FOUNDATION SPECIFICATION');
  });
});
