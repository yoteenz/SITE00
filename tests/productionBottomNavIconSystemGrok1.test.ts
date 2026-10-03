import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ProductionBottomNav, ProductionHostNav, ProductionNavLabelRow, productionNavHref } from '../src/site00/components/productionHub/nav';
import { ProductionNavIcon, type ProductionNavGlyph } from '../src/site00/components/productionHub/productionNavIcon';

const GLYPHS: ProductionNavGlyph[] = ['hub', 'inbox', 'design', 'experience', 'expression', 'library', 'activity'];

describe('P0.STUDIOOS.PRODUCTION.BOTTOM-NAV.ICON-SYSTEM.GROK1', () => {
  it('ships all seven first-party glyphs', () => {
    for (const variant of GLYPHS) {
      const html = renderToStaticMarkup(createElement(ProductionNavIcon, { variant, active: false }));
      expect(html).toContain(`data-nav-glyph="${variant}"`);
      expect(html).toContain('data-nav-state="inactive"');
      expect(html).toContain('data-nav-fidelity="reference-masters"');
      expect(html).toContain('<img');
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

  it('keeps the reference red inside every glyph and still marks the active tab', () => {
    const idle = renderToStaticMarkup(createElement(ProductionNavIcon, { variant: 'hub', active: false }));
    const live = renderToStaticMarkup(createElement(ProductionNavIcon, { variant: 'library', active: true }));
    expect(idle).toContain('01_HUB');
    expect(idle).toContain('<img');
    expect(live).toContain('data-nav-state="active"');
    expect(live).toContain('open-book');
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

  it('puts mobile host labels in an unscaled row outside the icon strip', () => {
    const icons = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(ProductionBottomNav, { active: 'hub', projectId: 'ndxbook', inboxCount: 2, showLabels: false })),
    );
    const words = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(ProductionNavLabelRow, { active: 'hub', projectId: 'ndxbook', inboxCount: 2 })),
    );
    expect(icons).toContain('ph-nav--icons');
    expect(icons).not.toContain('>HUB<');
    expect(words).toContain('data-nav-labels="unscaled"');
    expect(words).toContain('prod-nav-labels');
    const labels = [...words.matchAll(/>(HUB|INBOX|DESIGN|EXPERIENCE|EXPRESSION|LIBRARY|ACTIVITY)</g)].map((m) => m[1]);
    expect(labels).toEqual(['HUB', 'INBOX', 'DESIGN', 'EXPERIENCE', 'EXPRESSION', 'LIBRARY', 'ACTIVITY']);
    const css = readHostChrome();
    expect(css).toContain('.prod-nav-labels');
    expect(css).toMatch(/\.prod-nav-labels__item\s*\{[^}]*font-size:\s*12px/);
  });
});

function readHostChrome(): string {
  return readFileSync(new URL('../src/site00/styles/site00-production-host-chrome.css', import.meta.url), 'utf8');
}
