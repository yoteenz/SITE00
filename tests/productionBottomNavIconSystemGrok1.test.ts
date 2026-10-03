import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ProductionBottomNav, ProductionHostNav, productionNavHref } from '../src/site00/components/productionHub/nav';
import { ProductionNavIcon, type ProductionNavGlyph } from '../src/site00/components/productionHub/productionNavIcon';

const GLYPHS: ProductionNavGlyph[] = ['hub', 'inbox', 'design', 'experience', 'expression', 'library', 'activity'];

describe('P0.STUDIOOS.PRODUCTION.BOTTOM-NAV.ICON-SYSTEM.GROK1', () => {
  it('ships all seven first-party glyphs', () => {
    for (const variant of GLYPHS) {
      const html = renderToStaticMarkup(createElement(ProductionNavIcon, { variant, active: false }));
      expect(html).toContain(`data-nav-glyph="${variant}"`);
      expect(html).toContain('data-nav-state="inactive"');
      expect(html).not.toContain('#eb1c24');
    }
  });

  it('uses the locked concepts and drops the previous generic glyphs', () => {
    const map: Record<ProductionNavGlyph, string> = {
      hub: 'pavilion',
      inbox: 'envelope-tray',
      design: 'composition-planes',
      experience: 'portal',
      expression: 'prism-stage',
      library: 'open-book',
      activity: 'timeline',
    };
    for (const variant of GLYPHS) {
      const html = renderToStaticMarkup(createElement(ProductionNavIcon, { variant }));
      expect(html).toContain(`data-nav-concept="${map[variant]}"`);
    }
    const experience = renderToStaticMarkup(createElement(ProductionNavIcon, { variant: 'experience' }));
    expect(experience).not.toMatch(/play/i);
    const expression = renderToStaticMarkup(createElement(ProductionNavIcon, { variant: 'expression' }));
    expect(expression).toContain('prism-stage');
    const library = renderToStaticMarkup(createElement(ProductionNavIcon, { variant: 'library' }));
    expect(library).toContain('open-book');
    const hub = renderToStaticMarkup(createElement(ProductionNavIcon, { variant: 'hub' }));
    expect(hub).toContain('pavilion');
  });

  it('paints SITE00 red only on the active accent, and keeps inactive ink black', () => {
    const idle = renderToStaticMarkup(createElement(ProductionNavIcon, { variant: 'hub', active: false }));
    const live = renderToStaticMarkup(createElement(ProductionNavIcon, { variant: 'hub', active: true }));
    expect(idle).not.toContain('#eb1c24');
    expect(live).toContain('#eb1c24');
    expect(live).toContain('data-nav-state="active"');
    expect(live).toContain('#141414');
  });

  it('keeps notification marks outside the glyph and preserves routes', () => {
    const mobile = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(ProductionBottomNav, { active: 'hub', projectId: 'ndxbook', inboxCount: 2 })),
    );
    const host = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(ProductionHostNav, { active: 'design', projectId: 'ndxbook', inboxCount: 1 })),
    );
    expect(mobile).toContain('data-nav-notify="inbox"');
    expect(mobile).toContain('data-nav-notify="activity"');
    expect(mobile).toContain('>02<');
    expect(host).toContain('data-nav-notify="inbox"');
    expect(host).toContain('data-nav-notify="activity"');
    expect(productionNavHref('hub', 'ndxbook')).toBe('/production');
    expect(productionNavHref('expression', 'ndxbook')).toBe('/production/ndxbook/expression');
    expect(productionNavHref('activity', 'ndxbook')).toBe('/production/activity');
    const labels = [...mobile.matchAll(/>(HUB|INBOX|DESIGN|EXPERIENCE|EXPRESSION|LIBRARY|ACTIVITY)</g)].map((m) => m[1]);
    expect(labels).toEqual(['HUB', 'INBOX', 'DESIGN', 'EXPERIENCE', 'EXPRESSION', 'LIBRARY', 'ACTIVITY']);
  });
});
