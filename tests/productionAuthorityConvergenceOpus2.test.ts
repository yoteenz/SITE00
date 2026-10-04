/**
 * P0.STUDIOOS.PRODUCTION.AUTHORITY-CONVERGENCE.OPUS2
 * Guards for the final live-browser convergence: VIEWPORT drives real client geometry (DESKTOP is a true
 * landscape canvas), Experience children use the current capsules without the dead legacy link, the
 * descendant / grandchild / fabrication / design-workspace layers are scoped away from host chrome and from
 * the standalone surfaces that share their widgets, and the retired production-mobile plates are gone
 * from the authority roots.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  VIEWPORT_PRESET_ORDER,
  VIEWPORT_PRESET_SIZE,
  isViewportPreset,
  resolveViewportTarget,
  viewportScale,
} from '../src/site00/components/productionAuthority/viewportTargets';
import { EXPERIENCE_CAPSULES } from '../src/site00/components/productionAuthority/ExperienceBody';
import { DESIGN_CHAMBER } from '../src/site00/components/productionAuthority/designChamberConfig';
import { AUTHORITY_ASSETS } from '../src/site00/components/productionAuthority/authorityAssets';
import { DESIGN_PACK_FILES } from '../src/site00/components/productionAuthority/designPackAssets';
import { PRODUCTION_DESIGN_MODE_ORDER } from '../src/site00/config/production-authority-registry';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

function selectors(css: string): string[] {
  const out: string[] = [];
  for (const m of stripComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)) out.push(m[1]!.trim());
  return out.filter((s) => !s.startsWith('@'));
}

/** Split a selector list on top-level commas (not the ones inside :is() / :has()). */
function parts(sel: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of sel) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

const OPUS2_CSS = 'src/site00/styles/site00-production-authority-opus2.css';
const DESC_CSS = 'src/site00/styles/site00-production-descendants-opus2.css';
const FAB_CSS = 'src/site00/styles/site00-production-fabrication-opus2.css';
const DWS_CSS = 'src/site00/styles/site00-production-design-workspace-opus2.css';
const HOST_CHROME = /\.pxh-|\.ph-top|\.ph-nav|prod-chrome|hub-bottom-nav|production-workspace-header/;

describe('VIEWPORT target geometry', () => {
  it('keeps the four presets in order with real logical sizes', () => {
    expect(VIEWPORT_PRESET_ORDER).toEqual(['MOBILE', 'MOBILE XL', 'TABLET', 'DESKTOP']);
    expect(VIEWPORT_PRESET_SIZE.MOBILE).toMatchObject({ w: 390, h: 844, kind: 'phone' });
    expect(VIEWPORT_PRESET_SIZE['MOBILE XL']).toMatchObject({ w: 430, h: 932, kind: 'phone' });
    expect(VIEWPORT_PRESET_SIZE.TABLET).toMatchObject({ w: 834, h: 1194, kind: 'tablet' });
    expect(VIEWPORT_PRESET_SIZE.DESKTOP).toMatchObject({ w: 1440, h: 900, kind: 'desktop' });
    expect(isViewportPreset('DESKTOP')).toBe(true);
    expect(isViewportPreset('WATCH')).toBe(false);
  });

  it('DESKTOP is never a phone: always a landscape canvas wider than tall, orientation locked', () => {
    for (const o of ['PORTRAIT', 'LANDSCAPE'] as const) {
      const t = resolveViewportTarget('DESKTOP', o);
      expect(t.kind).toBe('desktop');
      expect(t.orientation).toBe('LANDSCAPE');
      expect(t.orientationLocked).toBe(true);
      expect(t.w).toBe(1440);
      expect(t.h).toBe(900);
      expect(t.w).toBeGreaterThan(t.h);
    }
  });

  it('handheld targets honour orientation by swapping their long and short edges', () => {
    for (const p of ['MOBILE', 'MOBILE XL', 'TABLET'] as const) {
      const portrait = resolveViewportTarget(p, 'PORTRAIT');
      const landscape = resolveViewportTarget(p, 'LANDSCAPE');
      expect(portrait.orientationLocked).toBe(false);
      expect(portrait.h).toBeGreaterThan(portrait.w);
      expect(landscape.w).toBeGreaterThan(landscape.h);
      expect([landscape.w, landscape.h]).toEqual([portrait.h, portrait.w]);
    }
  });

  it('FIT shows the whole target without upscaling; fixed zooms are true scales', () => {
    const desk = resolveViewportTarget('DESKTOP', 'PORTRAIT');
    expect(viewportScale(desk, { w: 720, h: 900 }, 'FIT')).toBeCloseTo(0.5);
    expect(viewportScale(desk, { w: 4000, h: 3000 }, 'FIT')).toBe(1);
    expect(viewportScale(desk, { w: 2000, h: 450 }, 'FIT')).toBeCloseTo(0.5);
    expect(viewportScale(desk, { w: 300, h: 300 }, '100%')).toBe(1);
    expect(viewportScale(desk, { w: 300, h: 300 }, '75%')).toBe(0.75);
    expect(viewportScale(desk, { w: 0, h: 0 }, 'FIT')).toBeGreaterThan(0);
  });

  it('the chamber sizes the client iframe from the resolved target (no PORTRAIT swap of DESKTOP)', () => {
    const src = read('src/site00/components/productionAuthority/DesignChamber.tsx');
    expect(src).toContain("from './viewportTargets'");
    expect(src).toMatch(/resolveViewportTarget\(preset, orientation\)/);
    expect(src).toMatch(/width: target\.w, height: target\.h/);
    expect(src).toContain('data-testid="design-viewport-device"');
    expect(src).toContain('data-testid="design-viewport-target"');
    expect(src).not.toMatch(/VIEWPORT_PRESETS\s*[:=]/);
    expect(src).toContain('<iframe');
  });
});

describe('Experience children', () => {
  it('capsules map onto real Experience sub-workspaces only', () => {
    const subs = EXPERIENCE_CAPSULES.map((c) => c.sub);
    expect(subs).toEqual(['world', 'zones', 'environments', 'modules', 'simulations', 'assets', 'review']);
  });

  it('child view uses the authority world plate and drops the dead build-a-wig legacy link', () => {
    const page = read('src/site00/pages/production/ExperienceProductionShellPage.tsx');
    expect(page).toContain('EXPERIENCE_CAPSULES');
    expect(page).toContain('AUTHORITY_ASSETS.experienceWorld');
    expect(page).toContain('data-testid="experience-child-capsules"');
    expect(page).not.toMatch(/build-a-wig/);
    expect(page).not.toMatch(/site00ProjectExperienceWorkspacePath/);
  });
});

describe('legacy descendant detection', () => {
  it('every production descendant frame carries the authority hook and imports the descendant layer', () => {
    const frame = read('src/site00/components/production/PwFrame.tsx');
    expect(frame).toMatch(/className="pw pw--production pw--authority"/);
    expect(frame.indexOf('site00-production-descendants-opus2.css')).toBeGreaterThan(frame.indexOf('site00-production-mobile.css'));
  });

  it('the descendant layer only styles the authority frame and never host chrome', () => {
    for (const sel of selectors(read(DESC_CSS))) {
      for (const part of parts(sel)) {
        expect(part.trim(), part).toMatch(/^\.pw\.pw--authority\b/);
        expect(part, part).not.toMatch(HOST_CHROME);
      }
    }
    expect(stripComments(read(DESC_CSS))).not.toMatch(/\bzoom\s*:/);
  });

  it('the Narrative Momentum grandchild is re-skinned only inside Production (expression engine untouched)', () => {
    const css = stripComments(read(DESC_CSS));
    expect(css).toMatch(/\.pw\.pw--authority \.site00-nme-wizard \{[^}]*--ndx-lime: #e5231b/);
    expect(css).toMatch(/--ndx-mono: var\(--pw-mono\)/);
    const nme = read('src/site00/styles/site00-narrative-momentum-wizard.css');
    expect(nme).toContain('--ndx-lime: #c8f542');
  });

  it('the design workspace palette is scoped to the production role (standalone bench untouched)', () => {
    for (const sel of selectors(read(DWS_CSS))) {
      for (const part of parts(sel)) expect(part.trim(), part).toMatch(/^\.site00-design-workspace\[data-workspace-role='production-provisional'\]/);
    }
    expect(read('src/site00/components/designBench/production/DesignWorkspaceCore.tsx')).toContain('data-workspace-role={role}');
    expect(read('src/site00/pages/DesignProductionWorkspacePage.tsx')).toContain('site00-production-design-workspace-opus2.css');
  });

  it('Character Fabrication keeps its canvas on phones and uses the host nav on wide hosts', () => {
    const cf = read('src/site00/components/characterFabrication/CharacterFabrication.tsx');
    expect(cf).toMatch(/family !== 'mobile'/);
    expect(cf).toContain('<ProductionHostNav active="expression"');
    expect(cf).toContain('<ProductionBottomNav active="expression"');
    for (const sel of selectors(read(FAB_CSS))) expect(sel, sel).not.toMatch(HOST_CHROME);
  });
});

describe('style contracts', () => {
  it('the OPUS2 authority layer loads after the asset layer and never selects or scales host chrome', () => {
    const frame = read('src/site00/components/productionAuthority/ProductionAuthorityFrame.tsx');
    expect(frame.indexOf('site00-production-authority-opus2.css')).toBeGreaterThan(frame.indexOf('site00-production-authority-assets.css'));
    const css = stripComments(read(OPUS2_CSS));
    for (const sel of selectors(css)) expect(sel, sel).not.toMatch(HOST_CHROME);
    expect(css).not.toMatch(/\bzoom\s*:/);
  });

  it('host chrome stylesheet is still unscaled', () => {
    const css = stripComments(read('src/site00/styles/site00-production-host-chrome.css'));
    expect(css).not.toMatch(/\bzoom\s*:/);
    expect(css).not.toMatch(/(^|[^-])\btransform\s*:/m);
  });
});

describe('Grok asset integration converged', () => {
  it('authority roots no longer read the retired production-mobile plates', () => {
    for (const f of ['ExpressionBody.tsx', 'LibraryBody.tsx', 'ActivityBody.tsx']) {
      expect(read(`src/site00/components/productionAuthority/${f}`), f).not.toMatch(/PW_IMG/);
    }
  });

  it('Expression floor cards read live hub node art, with Character Fabrication first', () => {
    const body = read('src/site00/components/productionAuthority/ExpressionBody.tsx');
    const floors = body.slice(body.indexOf('const FLOORS'), body.indexOf('const FORMATS'));
    expect(floors.indexOf("id: 'character-fabrication'")).toBeLessThan(floors.indexOf("id: 'campaign-concepts'"));
    for (const node of ['cast', 'narrative', 'performance', 'look', 'set', 'storyboard']) expect(floors).toContain(`node: '${node}'`);
    expect(body).toMatch(/graph\?\.byId\[f\.node\]\?\.assetSlotId/);
  });

  it('each ON YOUR TABLE card in a mode shows a distinct authority plate', () => {
    const shipped = new Set([
      AUTHORITY_ASSETS.designAtrium,
      AUTHORITY_ASSETS.experienceWorld,
      AUTHORITY_ASSETS.viewportCorridor,
      ...AUTHORITY_ASSETS.libraryPlates,
      ...Object.values(AUTHORITY_ASSETS.boards),
      // canonical DWS pack files (DESIGN.ASSET-AUTHORITY-CONVERGENCE.OPUS3)
      ...DESIGN_PACK_FILES,
    ]);
    for (const mode of PRODUCTION_DESIGN_MODE_ORDER) {
      const plates = DESIGN_CHAMBER[mode].table.map((t) => t.plate);
      expect(new Set(plates).size, mode).toBe(plates.length);
      for (const p of plates) {
        expect(shipped.has(p), `${mode} ${p}`).toBe(true);
        expect(existsSync(path.join(root, 'public', p)), p).toBe(true);
      }
    }
  });

  it('Activity hero uses the crystal chamber like the authority, not the glass-cylinder atmosphere slot', () => {
    expect(read('src/site00/components/productionAuthority/ActivityBody.tsx')).toContain('plate={AUTHORITY_ASSETS.hubCrystal}');
  });
});
