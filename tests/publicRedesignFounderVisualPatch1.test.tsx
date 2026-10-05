/**
 * P0.SITE00.PUBLIC-REDESIGN.FOUNDER-VISUAL-PATCH1 — regression guards.
 */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { IDNTY_FRAMEWORK_PILLARS } from '../src/site00/config/identity';
import { BLDR_FRAMEWORK_PILLARS } from '../src/site00/config/builder';
import { OriginDualEnvironment } from '../src/site00/components/public-redesign/OriginDualEnvironment';
import { OriginBldrFrameworkIcon, OriginIdntyFrameworkIcon } from '../src/site00/components/public-redesign/OriginFrameworkGlyphs';

describe('FOUNDER-VISUAL-PATCH1 — Origin dual environment', () => {
  it('renders both plates with active layer tied to expanded flag', () => {
    const collapsed = renderToStaticMarkup(<OriginDualEnvironment expanded={false} />);
    expect(collapsed).toContain('ENV.ORIGIN.COLLAPSED');
    expect(collapsed).toContain('ENV.ORIGIN.EXPANDED');
    expect(collapsed).toMatch(/s00pr-origin-env-layer--active[^"]*"[^>]*data-origin-env="collapsed"/);

    const expanded = renderToStaticMarkup(<OriginDualEnvironment expanded={true} />);
    expect(expanded).toMatch(/s00pr-origin-env-layer--active[^"]*"[^>]*data-origin-env="expanded"/);
  });
});

describe('FOUNDER-VISUAL-PATCH1 — Origin framework live-code icons', () => {
  it('renders IDNTY framework row as inline SVG (no Supabase img)', () => {
    for (const pillar of IDNTY_FRAMEWORK_PILLARS) {
      const html = renderToStaticMarkup(<OriginIdntyFrameworkIcon id={pillar.icon} className="s00pr-framework__icon" />);
      expect(html).toContain('<svg');
      expect(html).toContain(`data-idnty-framework-glyph="${pillar.icon}"`);
      expect(html).not.toContain('<img');
      expect(html).not.toContain('live-preview');
    }
  });

  it('renders BLDR framework row via FrameworkGlyph (no Supabase img)', () => {
    for (const pillar of BLDR_FRAMEWORK_PILLARS) {
      const html = renderToStaticMarkup(<OriginBldrFrameworkIcon id={pillar.icon} className="s00pr-framework__icon" />);
      expect(html).toContain('<svg');
      expect(html).not.toContain('<img');
      expect(html).not.toContain('live-preview');
    }
  });
});
