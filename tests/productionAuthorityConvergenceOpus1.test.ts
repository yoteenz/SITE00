/**
 * P0.STUDIOOS.PRODUCTION.AUTHORITY-CONVERGENCE.OPUS1
 * Guards for the visual convergence layer: it stays interior-only (host chrome never scaled), the shared
 * Design chamber carries authority geometry for every family, VIEWPORT shows the live client app, and the
 * Sonnet structure (modes, pipeline lengths, Expression / Library canon) is untouched.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { PRODUCTION_DESIGN_MODE_ORDER } from '../src/site00/config/production-authority-registry';
import { DESIGN_CHAMBER } from '../src/site00/components/productionAuthority/designChamberConfig';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const OPUS_CSS = 'src/site00/styles/site00-production-authority-opus.css';

/** Top-level rules of a stylesheet (media blocks flattened), as [selector, body] pairs. */
function rules(css: string): [string, string][] {
  const out: [string, string][] = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  for (const m of stripComments(css).matchAll(re)) out.push([m[1]!.trim(), m[2]!]);
  return out;
}

describe('convergence layer is interior-only', () => {
  it('is loaded after the Sonnet body stylesheet by the authority frame', () => {
    const frame = read('src/site00/components/productionAuthority/ProductionAuthorityFrame.tsx');
    expect(frame.indexOf('site00-production-authority.css')).toBeGreaterThan(-1);
    expect(frame.indexOf('site00-production-authority-opus.css')).toBeGreaterThan(frame.indexOf('site00-production-authority.css'));
  });

  it('never targets host chrome (.pxh-* / .ph-nav / host top + bottom panels)', () => {
    for (const [sel] of rules(read(OPUS_CSS))) {
      if (sel.startsWith('@')) continue;
      expect(sel, sel).not.toMatch(/\.pxh-|\.ph-nav|hub-bottom-nav|production-workspace-header/);
    }
  });

  it('every transform / zoom / container unit lives inside the chamber or a body section', () => {
    for (const [sel, body] of rules(read(OPUS_CSS))) {
      if (!/(^|[^-])transform\s*:|zoom\s*:|\dcq[iwhb]/m.test(body)) continue;
      expect(sel, sel).toMatch(/pxa-(chamber|panel|overview-panel|vstage|device|xpanel|experience|hero)/);
      expect(body, sel).not.toMatch(/\bzoom\s*:/);
    }
  });

  it('host chrome still has no scaling (project mark fix is a static position override)', () => {
    const css = stripComments(read('src/site00/styles/site00-production-host-chrome.css'));
    expect(css).not.toMatch(/\bzoom\s*:/);
    expect(css).not.toMatch(/(^|[^-])\btransform\s*:/m);
    expect(css).not.toMatch(/\d(vw|vh|vmin|vmax|cqw|cqh|cqi|cqb|cqmin|cqmax|rem)\b/);
    expect(css).toMatch(/\.pxa \.pxh-top \.pxh-top__thumb\s*\{[^}]*position:\s*relative/);
  });
});

describe('shared Design chamber geometry', () => {
  const css = stripComments(read(OPUS_CSS));
  it('places the five boards and the overview board in all three viewport families', () => {
    for (const media of ['(min-width: 1120px)', '(min-width: 700px) and (max-width: 1119px)', '(max-width: 699px)']) {
      const at = css.indexOf(`@media ${media} {\n  .pxa .pxa-chamber {`);
      expect(at, media).toBeGreaterThan(-1);
      const block = css.slice(at, css.indexOf('\n}\n', at));
      for (const n of ['01', '02', '03', '04', '05']) expect(block, `${media} ${n}`).toMatch(new RegExp(`data-panel='${n}'\\]\\s*\\{[^}]*left:[^}]*top:[^}]*width:`));
      expect(block).toMatch(/\.pxa-overview-panel\s*\{[^}]*left:/);
      expect(block).toMatch(/--tilt:\s*\d+deg/);
    }
  });

  it('tilts left boards toward the core and right boards away (mirrored)', () => {
    expect(css).toMatch(/\.pxa-panel--left\s*\{[^}]*rotateY\(var\(--tilt\)\)/);
    expect(css).toMatch(/\.pxa-panel--right\s*\{[^}]*rotateY\(calc\(var\(--tilt\) \* -1\)\)/);
  });

  it('keeps the Sonnet structure: 6 modes, 5 boards + 5 stages per board mode, 7 stages + 4 cards for VIEWPORT', () => {
    expect(PRODUCTION_DESIGN_MODE_ORDER).toEqual(['brand', 'experience', 'surfaces', 'compiler', 'assets', 'viewport']);
    for (const mode of PRODUCTION_DESIGN_MODE_ORDER) {
      const cfg = DESIGN_CHAMBER[mode];
      if (mode === 'viewport') {
        expect(cfg.pipeline.map((s) => s.title)).toEqual(['RESEARCH', 'CONCEPT', 'AUTHORITY', 'PAGE FAMILY', 'COMPONENTS', 'VIEWPORT', 'PRODUCTION']);
        expect(cfg.table).toHaveLength(4);
      } else {
        expect(cfg.panels).toHaveLength(5);
        expect(cfg.pipeline).toHaveLength(5);
      }
    }
  });

  it('board copy is uppercase design-workspace copy (no sample counts baked in)', () => {
    for (const mode of PRODUCTION_DESIGN_MODE_ORDER) {
      const cfg = DESIGN_CHAMBER[mode];
      const strings = [cfg.label, cfg.lede, ...cfg.list, ...(cfg.intro ?? []), cfg.caption ?? '', ...cfg.panels.flatMap((p) => [p.title, p.sub, ...(p.rows ?? [])])];
      for (const s of strings) {
        expect(s, s).toBe(s.toUpperCase());
        expect(s, s).not.toMatch(/\b\d+ (ITEMS|ISSUES)\b/);
      }
    }
  });
});

describe('DESIGN / VIEWPORT', () => {
  const src = read('src/site00/components/productionAuthority/DesignChamber.tsx');
  it('renders the live client app in an isolated iframe sized to the preset and scaled to fit', () => {
    expect(src).toContain('<iframe');
    expect(src).toMatch(/\/app\/preview\/fixture-app-ndxbook/);
    expect(src).toMatch(/\/app\/projects\/\$\{projectSlug\}/);
    expect(src).toMatch(/transform: `scale\(\$\{scale\}\)`/);
  });
  it('keeps preset / route / orientation / zoom / safe area / validation controls', () => {
    for (const t of ['VIEWPORT PRESET', 'ROUTE', 'ORIENTATION', 'ZOOM', 'SAFE AREA', 'VALIDATION SHEET / REVIEW STATUS']) expect(src).toContain(t);
    expect(src).toContain('data-testid="design-validation-sheet"');
  });
});

describe('Expression + Library canon preserved', () => {
  it('Character Fabrication stays the first production floor', () => {
    const body = read('src/site00/components/productionAuthority/ExpressionBody.tsx');
    const floors = body.slice(body.indexOf('const FLOORS'), body.indexOf('const FORMATS'));
    expect(floors.indexOf("id: 'character-fabrication'")).toBeLessThan(floors.indexOf("id: 'campaign-concepts'"));
  });
  it('no max-width page wrapper is introduced for the Library or body', () => {
    const css = stripComments(read(OPUS_CSS));
    expect(css).not.toMatch(/\.pxa-library[^{]*\{[^}]*max-width/);
    expect(css).not.toMatch(/\.pxa-body[^{]*\{[^}]*max-width/);
  });
});
