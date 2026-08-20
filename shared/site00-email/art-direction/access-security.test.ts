import { describe, expect, it } from 'vitest';
import { renderEmailTemplateSync } from '../render.js';

const ACCESS_MARKERS = [
  'ACCESS GRANTED',
  'CREDENTIAL',
  'MEMBER ID',
  'ISSUED',
  'AUTHORIZED',
  'SCAN TO ACCESS',
  'ONE USE',
  'SECURE LINK',
  'ONE-TIME USE',
  'VERIFIED DEVICE',
  'CONTROLLED ENTRY',
  'ENTER SITE 00',
  'OPERATING SYSTEM',
  'SITE 00 IS AN OPERATING SYSTEM',
] as const;

describe('ACCESS / SECURITY reference fidelity', () => {
  it('renders reference structure for access-credential-issued', () => {
    const { html } = renderEmailTemplateSync('access-credential-issued');
    for (const marker of ACCESS_MARKERS) {
      expect(html.toUpperCase()).toContain(marker);
    }
  });

  it('renders shared reference shell for sign-in-link and verify-email', () => {
    for (const templateId of ['sign-in-link', 'verify-email'] as const) {
      const { html } = renderEmailTemplateSync(templateId);
      expect(html).toContain('ACCESS GRANTED');
      expect(html).toContain('CREDENTIAL');
      expect(html).toContain('SECURE LINK');
      expect(html).toContain('OPERATING SYSTEM');
    }
  });

  it('access-credential-issued has credential-left hero and no welcome artifacts', () => {
    const { html } = renderEmailTemplateSync('access-credential-issued');
    expect(html).not.toContain('LOCATION KEY');
    expect(html).not.toContain('YOUR LOCATION EXISTS NOW');
    expect(html).toContain('DIGITAL CREDENTIAL');
    expect(html).toContain('THIS LINK EXPIRES');
  });

  it('uses single hero credential pass — no duplicate generic white ID card', () => {
    const { html } = renderEmailTemplateSync('access-credential-issued');
    expect(html).not.toContain('PREVIEW CLIENT');
    expect(html).not.toContain('SITE 00 ACCESS');
    expect((html.match(/ACCESS<\/p>/g) ?? []).length).toBeLessThanOrEqual(2);
  });

  it('includes three-zone footer identity', () => {
    const { html } = renderEmailTemplateSync('access-credential-issued');
    expect(html).toContain('FOR CREATORS, BRANDS');
    expect(html).toContain('WE BUILD. YOU GUIDE. TOGETHER.');
    expect(html).toContain('SITE00.COM');
  });

  it('security strip includes module microcopy not labels only', () => {
    const { html } = renderEmailTemplateSync('access-credential-issued');
    expect(html).toContain('End-to-end encrypted');
    expect(html).toContain('Access validated at entry');
    expect(html).toContain('Protected environment for creators');
  });
});
