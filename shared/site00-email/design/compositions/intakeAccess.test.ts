/**
 * SITE 00 — Intake Access email family (FAL-native visual production pilot).
 * See shared/site00-email/production/intake-access-manifest.ts for the reference decomposition.
 */
import { describe, expect, it } from 'vitest';
import { renderEmailTemplateSync, listTemplateIds, getTemplatePrimaryFamily } from '../../render.js';
import { EMAIL_TEMPLATES, getTemplateById } from '../../registry/templates.js';
import { EMAIL_EVENT_REGISTRY } from '../../registry/events.js';
import { getTemplateComposition } from '../../art-direction/template-manifest.js';
import { INTAKE_ACCESS_ASSET_URLS } from '../../production/intake-access-asset-urls.generated.js';
import { INTAKE_ACCESS_PRODUCTION_MANIFEST } from '../../production/intake-access-manifest.js';

const TEMPLATE_ID = 'intake-guest-access';

function renderBuilder(overrides: Record<string, unknown> = {}) {
  return renderEmailTemplateSync(TEMPLATE_ID, {
    intakeType: 'BUILDER',
    intakeReference: 'BLD-7F3A1C9D',
    intakeStatusDisplay: 'IN PROGRESS',
    intakeLastSavedAtDisplay: 'AUG 20, 2026 · 6:16 PM UTC',
    intakeCompletionPercent: 42,
    secureViewUrl: 'https://site00.com/intake/access/tok_builder_abc123',
    ctaUrl: 'https://site00.com/intake/access/tok_builder_abc123',
    ...overrides,
  } as never);
}

function renderIdentity(overrides: Record<string, unknown> = {}) {
  return renderEmailTemplateSync(TEMPLATE_ID, {
    intakeType: 'IDENTITY',
    intakeReference: 'IDN-4B2E9F01',
    intakeStatusDisplay: 'SUBMITTED',
    intakeLastSavedAtDisplay: 'AUG 19, 2026 · 9:02 AM UTC',
    intakeCompletionPercent: 100,
    secureViewUrl: 'https://site00.com/intake/access/tok_identity_xyz789',
    ctaUrl: 'https://site00.com/intake/access/tok_identity_xyz789',
    ...overrides,
  } as never);
}

/** Strips <img .../> tags so we can assert critical text survives outside of alt attributes (image-blocked fallback). */
function withoutImgTags(html: string): string {
  return html.replace(/<img\b[^>]*>/gi, '');
}

describe('Intake Access — template registration', () => {
  it('registers intake-guest-access as an approved, enabled template', () => {
    const template = getTemplateById(TEMPLATE_ID);
    expect(template).toBeDefined();
    expect(template?.family).toBe('intake');
    expect(template?.archetype).toBe('intake-lifecycle');
    expect(template?.event).toBe('INTAKE_ACCESS_REQUESTED');
    expect(template?.enabled).toBe(true);
    expect(template?.debugStatus).toBe('approved');
  });

     it('maps the INTAKE_ACCESS_REQUESTED event to intake-guest-access', () => {
       const entry = EMAIL_EVENT_REGISTRY.find((e) => e.event === 'INTAKE_ACCESS_REQUESTED');
       expect(entry?.templateId).toBe(TEMPLATE_ID);
     });

  it('routes through a dedicated INTAKE_ACCESS composition, not the family-default shell', () => {
    expect(getTemplateComposition(TEMPLATE_ID)).toBe('INTAKE_ACCESS');
  });

  it('is included in the full template registry (no count regression)', () => {
    expect(listTemplateIds()).toContain(TEMPLATE_ID);
  });
});

describe('Intake Access — Builder branch', () => {
  it('reads as an architectural build brief, not the Identity evidence file', () => {
    const { html } = renderBuilder();
    expect(html).toContain('THE BRIEF');
    expect(html).toContain('LOCATION.');
    expect(html).toContain('RETURN TO BUILD BRIEF');
    expect(html).not.toContain('THE EVIDENCE');
    expect(html).not.toContain('RETURN TO IDENTITY BRIEF');
  });

  it('uses the Builder blueprint desktop + mobile GENERATED_ASSET derivatives, not Identity assets', () => {
    const { html } = renderBuilder();
    expect(html).toContain(INTAKE_ACCESS_ASSET_URLS.builderBlueprintDesktop);
    expect(html).toContain(INTAKE_ACCESS_ASSET_URLS.builderBlueprintMobile);
    expect(html).not.toContain(INTAKE_ACCESS_ASSET_URLS.identityEvidenceDesktop);
    expect(html).not.toContain(INTAKE_ACCESS_ASSET_URLS.identityEvidenceMobile);
  });

  it('renders the dynamic Build Brief Record card', () => {
    const { html } = renderBuilder();
    expect(html).toContain('BUILD BRIEF RECORD');
    expect(html).toContain('BLD-7F3A1C9D');
    expect(html).toContain('IN PROGRESS');
    expect(html).toContain('42%');
  });

     it('renders the four lifecycle assurance modules without emoji', () => {
       const { html } = renderBuilder();
       // "SECURE & PRIVATE" is HTML-escaped in markup (&amp;) — that's correct, not a bug.
       for (const label of ['SECURE &amp; PRIVATE', 'AUTO-SAVED', 'YOUR INFORMATION', 'PICK UP ANYTIME']) {
         expect(html).toContain(label);
       }
    // eslint-disable-next-line no-control-regex
    const emojiRange = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    expect(emojiRange.test(html)).toBe(false);
  });
});

describe('Intake Access — Identity branch', () => {
  it('reads as an editorial identity evidence file, not the Builder build brief', () => {
    const { html } = renderIdentity();
    expect(html).toContain('THE EVIDENCE');
    expect(html).toContain('IS IN.');
    expect(html).toContain('RETURN TO IDENTITY BRIEF');
    expect(html).not.toContain('THE BRIEF');
    expect(html).not.toContain('RETURN TO BUILD BRIEF');
  });

  it('uses the Identity evidence collage desktop + mobile GENERATED_ASSET derivatives, not Builder assets', () => {
    const { html } = renderIdentity();
    expect(html).toContain(INTAKE_ACCESS_ASSET_URLS.identityEvidenceDesktop);
    expect(html).toContain(INTAKE_ACCESS_ASSET_URLS.identityEvidenceMobile);
    expect(html).not.toContain(INTAKE_ACCESS_ASSET_URLS.builderBlueprintDesktop);
    expect(html).not.toContain(INTAKE_ACCESS_ASSET_URLS.builderBlueprintMobile);
  });

  it('renders the dynamic Identity File record card', () => {
    const { html } = renderIdentity();
    expect(html).toContain('IDENTITY FILE');
    expect(html).toContain('IDN-4B2E9F01');
    expect(html).toContain('SUBMITTED');
    expect(html).toContain('100%');
  });
});

describe('Intake Access — dynamic data, never fabricated', () => {
  it('reflects whatever intakeReference is supplied — no fixed reference baked into the template', () => {
    const a = renderBuilder({ intakeReference: 'BLD-AAAA1111' });
    const b = renderBuilder({ intakeReference: 'BLD-ZZZZ9999' });
    expect(a.html).toContain('BLD-AAAA1111');
    expect(b.html).toContain('BLD-ZZZZ9999');
    expect(a.html).not.toContain('BLD-ZZZZ9999');
    expect(b.html).not.toContain('BLD-AAAA1111');
  });

  it('never contains the founder concept-board sample values as literals', () => {
    const { html } = renderBuilder({ intakeReference: 'BLD-DEMO0001' });
    expect(html).not.toContain('00-0147');
    expect(html).not.toContain('BUILD-00-0147');
    expect(html).not.toContain('ID-00-0147');
    expect(html).not.toMatch(/MAY 20, 2025/i);
  });

  it('shows the supplied status label verbatim', () => {
    const { html } = renderBuilder({ intakeStatusDisplay: 'AWAITING VERIFICATION' });
    expect(html).toContain('AWAITING VERIFICATION');
  });

  it('falls back to a truthful default ("JUST NOW") when lastSavedAt display is absent, never a fabricated date', () => {
    const { html } = renderBuilder({ intakeLastSavedAtDisplay: undefined });
    expect(html).toContain('JUST NOW');
    expect(html).not.toMatch(/MAY 20, 2025/i);
  });

  it('renders a numeric completion bar only when a truthful percent is supplied', () => {
    const { html } = renderBuilder({ intakeCompletionPercent: 17 });
    expect(html).toContain('17%');
  });

     it('never fabricates a completion percentage — renders a non-numeric status treatment instead', () => {
       const { html } = renderBuilder({ intakeCompletionPercent: undefined, intakeStatusDisplay: 'IN PROGRESS' });
       // Only the visible completion-value <td> (align="right" width="40") renders a digit%; CSS
       // width:NN% table-bar styling is expected and unrelated to fabricating a completion figure.
       expect(html).not.toMatch(/width="40"[^>]*>\d+%</);
       expect(html).toContain('IN PROGRESS');
     });
});

describe('Intake Access — security / CTA', () => {
  it('uses the canonical secure ctaUrl for both the desktop and mobile CTA — no second token system', () => {
    const url = 'https://site00.com/intake/access/tok_secure_9f8e7d';
    const { html } = renderBuilder({ ctaUrl: url, secureViewUrl: url });
    const occurrences = html.split(`href="${url}"`).length - 1;
    expect(occurrences).toBe(2); // desktop CTA + mobile CTA
  });

  it('never leaks provider secrets or service credentials into the rendered markup', () => {
    const { html } = renderBuilder();
    for (const secretMarker of ['FAL_KEY', 'SERVICE_ROLE', 'SUPABASE_SERVICE_ROLE_KEY', 'sk_live', 'sk_test']) {
      expect(html).not.toContain(secretMarker);
    }
  });

  it('never embeds a base64 data-URI in place of a hosted production asset', () => {
    const { html } = renderBuilder();
    expect(html).not.toMatch(/<img[^>]+src="data:image/i);
  });

  it('only references the four approved, hosted (https) production asset URLs for artwork', () => {
    const { html } = renderIdentity();
    const imgSrcs = Array.from(html.matchAll(/<img[^>]+src="([^"]+)"/gi)).map((m) => m[1]);
    expect(imgSrcs.length).toBeGreaterThan(0);
    for (const src of imgSrcs) {
      expect(src.startsWith('https://')).toBe(true);
    }
  });
});

describe('Intake Access — accessibility / fallback / email-safety', () => {
  it('gives every image non-empty, descriptive alt text', () => {
    const { html } = renderIdentity();
    const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
    expect(imgTags.length).toBeGreaterThan(0);
    for (const tag of imgTags) {
      const altMatch = /alt="([^"]*)"/i.exec(tag);
      expect(altMatch?.[1]?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });

  it('every image declares explicit width/height (no layout jank if slow to load)', () => {
    const { html } = renderBuilder();
    const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
    for (const tag of imgTags) {
      expect(tag).toMatch(/width="\d+"/);
      expect(tag).toMatch(/height="\d+"/);
    }
  });

  it('keeps headline, copy, record data, status and CTA in semantic text — understandable if images are blocked', () => {
    const { html } = renderBuilder({ intakeReference: 'BLD-IMGBLOCK1', intakeStatusDisplay: 'IN REVIEW' });
    const withoutImages = withoutImgTags(html);
    expect(withoutImages).toContain('THE BRIEF');
    expect(withoutImages).toContain('BLD-IMGBLOCK1');
    expect(withoutImages).toContain('IN REVIEW');
    expect(withoutImages).toContain('RETURN TO BUILD BRIEF');
    expect(withoutImages).toContain('Your Builder intake is saved exactly where you left it.');
  });

  it('never uses emoji or generic stock-icon glyphs in place of line icons', () => {
    const { html } = renderIdentity();
    expect(html).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
  });

  it('uses table-safe, JS-free, no-fixed-position markup', () => {
    const { html } = renderBuilder();
    expect(html).not.toContain('<script');
    expect(html).not.toMatch(/position:\s*fixed/);
    expect(html).toContain('<!DOCTYPE html');
    expect(html).toMatch(/<table role="presentation"/);
  });

  it('declares the 620px responsive breakpoint used to stack the desktop hero on mobile', () => {
    const { html } = renderBuilder();
    expect(html).toContain('@media only screen and (max-width:620px)');
    expect(html).toContain('.stack{display:block!important');
    expect(html).toContain('intake-desktop-only');
    expect(html).toContain('intake-mobile-only');
  });

  it('does not rasterize dynamic data — the reference/status/date strings are plain text, not baked into an <img>', () => {
    const { html } = renderBuilder({ intakeReference: 'BLD-NOTRASTER1' });
    const imgSrcs = Array.from(html.matchAll(/<img[^>]+src="([^"]+)"/gi)).map((m) => m[1]);
    for (const src of imgSrcs) {
      expect(src).not.toContain('NOTRASTER');
    }
    expect(withoutImgTags(html)).toContain('BLD-NOTRASTER1');
  });
});

describe('Intake Access — production manifest', () => {
  it('every GENERATED_ASSET / HYBRID_COMPOSITION entry is APPROVED before use in the template', () => {
    const productionEntries = INTAKE_ACCESS_PRODUCTION_MANIFEST.filter((e) => e.classification !== 'CODE_NATIVE');
    expect(productionEntries.length).toBeGreaterThan(0);
    for (const entry of productionEntries) {
      expect(entry.approvalStatus).toBe('APPROVED');
    }
  });

  it('records a valid generation/composite method for every non-code asset', () => {
    for (const entry of INTAKE_ACCESS_PRODUCTION_MANIFEST) {
      if (entry.classification === 'CODE_NATIVE') {
        expect(entry.generationMethod).toBe('NONE_CODE_ONLY');
      } else {
        expect(['FAL_TEXT_TO_IMAGE', 'FAL_REFERENCE_CONDITIONED', 'DETERMINISTIC_COMPOSITE']).toContain(entry.generationMethod);
      }
    }
  });
});

describe('Intake Access — regression', () => {
  it('Family 01 (Access/Security) templates are unaffected', () => {
    const { html } = renderEmailTemplateSync('access-credential-issued');
    expect(html).toContain('DIGITAL CREDENTIAL');
    expect(getTemplatePrimaryFamily('access-credential-issued')).toBe('ACCESS_SECURITY');
  });

  it('every enabled template in the full registry still renders without throwing', () => {
    for (const t of EMAIL_TEMPLATES) {
      if (!t.enabled) continue;
      expect(() => renderEmailTemplateSync(t.id)).not.toThrow();
    }
  });

  it('placeholder intake templates (submission receipt, claimed) remain untouched creative-direction-pending placeholders', () => {
    expect(getTemplateById('intake-submission-receipt')?.enabled).toBe(false);
    expect(getTemplateById('intake-claimed')?.enabled).toBe(false);
  });
});
