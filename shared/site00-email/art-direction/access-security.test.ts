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

  it('uses single hero credential pass — responsive desktop/mobile glyphs only', () => {
    const { html } = renderEmailTemplateSync('access-credential-issued');
    expect(html).not.toContain('PREVIEW CLIENT');
    expect(html).not.toContain('SITE 00 ACCESS');
    expect(html.match(/class="access-glyph-desktop"/g)?.length).toBe(1);
    expect(html.match(/class="access-glyph-mobile"/g)?.length).toBe(1);
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

describe('ACCESS / SECURITY mobile responsive fidelity', () => {
  it('includes composition-preserving mobile CSS scoped to access-terminal', () => {
    const { html } = renderEmailTemplateSync('access-credential-issued');
    expect(html).toContain('access-terminal .access-hero-left');
    expect(html).toContain('access-terminal .access-hero-right');
    expect(html).toContain('access-terminal .access-cred-left');
    expect(html).toContain('access-terminal .access-cred-qr');
    expect(html).toContain('access-sec-2x2');
    expect(html).toContain('access-glyph-mobile');
  });

  it('does not use generic stack class on hero or credential columns', () => {
    const { html } = renderEmailTemplateSync('access-credential-issued');
    expect(html).not.toMatch(/class="stack access-hero/);
    expect(html).not.toMatch(/class="stack access-cred/);
    expect(html).not.toContain('class="stack footer-left"');
  });

  it('preserves grouped credential metadata and QR in same table row', () => {
    const { html } = renderEmailTemplateSync('access-credential-issued');
    expect(html).toContain('class="access-cred-left"');
    expect(html).toContain('class="access-cred-qr"');
    expect(html).toContain('MEMBER ID');
    expect(html).toContain('SCAN TO ACCESS');
  });

  it('preserves three-zone footer classes for compact mobile columns', () => {
    const { html } = renderEmailTemplateSync('access-credential-issued');
    expect(html).toContain('access-footer-left');
    expect(html).toContain('access-footer-center');
    expect(html).toContain('access-footer-right');
  });

  it('uses proportional mobile hero headline class instead of generic hero-xl', () => {
    const { html } = renderEmailTemplateSync('access-credential-issued');
    expect(html).toContain('class="access-hero-xl"');
    expect(html).toContain('access-terminal .access-hero-xl{font-size:22px');
  });

  it('does not affect welcome lifecycle template mobile structure', () => {
    const { html } = renderEmailTemplateSync('welcome-location-assigned');
    expect(html).not.toContain('access-terminal');
    expect(html).not.toContain('access-hero-left');
  });
});
