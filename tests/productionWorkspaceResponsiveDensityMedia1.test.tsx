/**
 * P0.SITE00.PRODUCTION-WORKSPACE.RESPONSIVE-DENSITY-MEDIA-FRAMING-REFINEMENT1
 * Guards for the shared Production Workspace density contract (HUB = authority) and the media slot contract.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  WORKSPACE_AUTHORITY_ARTBOARD,
  WORKSPACE_MEDIA_FIT_MODES,
  WORKSPACE_MEDIA_SLOTS,
  WORKSPACE_MEDIA_FRAME_OWNERSHIP,
  WORKSPACE_PANEL_DENSITY,
  WORKSPACE_TYPE_SCALE,
  WORKSPACE_TYPE_TIERS,
  resolveWorkspaceMedia,
  workspaceTypePx,
  type WorkspaceMediaFitMode,
  type WorkspaceTypeTier,
} from '../src/site00/config/production-workspace-density';
import { Thumb } from '../src/site00/components/productionAuthority/primitives';
import { WorkspaceMediaSlot, workspaceMediaAttrs } from '../src/site00/components/productionAuthority/WorkspaceMediaSlot';
import { HubImage } from '../src/site00/components/productionHub/HubImage';
import { WORKSPACE_PANEL_DEFAULT_SLOT, WorkspacePanel } from '../src/site00/components/productionAuthority/WorkspacePanel';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const DENSITY_CSS = 'src/site00/styles/site00-production-workspace-density.css';
const HUB_CSS = 'src/site00/styles/site00-production-hub-reconstruction.css';
const css = stripComments(read(DENSITY_CSS));

/** Body of the first rule block that follows `marker` (e.g. a media query) and declares --pw-u. */
function tokenBlock(marker: string): string {
  const start = marker ? css.indexOf(marker) : 0;
  expect(start, marker).toBeGreaterThanOrEqual(0);
  const from = css.indexOf('--pw-u:', start);
  const open = css.lastIndexOf('{', from);
  const close = css.indexOf('}', from);
  return css.slice(open + 1, close);
}

const TIERS: WorkspaceTypeTier[] = ['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'METRIC'];
const tokenName = (t: WorkspaceTypeTier) => (t === 'METRIC' ? '--pw-metric' : `--pw-${t.toLowerCase()}`);

describe('HUB type authority → shared type scale', () => {
  it('declares one token per tier, in order T0 … T6 + METRIC', () => {
    expect(WORKSPACE_TYPE_TIERS.map((t) => t.tier)).toEqual(TIERS);
    for (const t of WORKSPACE_TYPE_TIERS) expect(t.token).toBe(tokenName(t.tier));
  });

  it('reproduces the computed HUB mobile scale at 393px (live-measured forensic values)', () => {
    const hub393: Record<WorkspaceTypeTier, number> = { T0: 6.5, T1: 7, T2: 7, T3: 8.5, T4: 9.78, T5: 13.27, T6: 20.26, METRIC: 11.88 };
    for (const tier of TIERS) expect(workspaceTypePx('mobile', tier, 393)).toBeCloseTo(hub393[tier], 1);
  });

  it('uses the HUB artboard denominators and the HUB mobile legibility floors', () => {
    expect(WORKSPACE_AUTHORITY_ARTBOARD).toEqual({ mobile: 1125, tablet: 1792, desktop: 2000 });
    const hub = stripComments(read(HUB_CSS));
    // HUB's own mobile floors: micro 6.5px · main 7px · section 8.5px
    expect(hub).toMatch(/max\(6\.5px, calc\(var\(--u\) \* var\(--f-sub\)\)\)/);
    expect(hub).toMatch(/max\(7px, calc\(var\(--u\) \* var\(--f-main\)\)\)/);
    expect(hub).toMatch(/max\(8\.5px, calc\(var\(--u\) \* var\(--f-sec\)\)\)/);
    expect(WORKSPACE_TYPE_SCALE.mobile.T0.floorPx).toBe(6.5);
    expect(WORKSPACE_TYPE_SCALE.mobile.T2.floorPx).toBe(7);
    expect(WORKSPACE_TYPE_SCALE.mobile.T3.floorPx).toBe(8.5);
  });

  it('is strictly non-decreasing T0 → T6 in every family (display is the top, METRIC sits between T4 and T6)', () => {
    for (const family of ['mobile', 'tablet', 'desktop'] as const) {
      for (const w of family === 'mobile' ? [360, 393, 430] : family === 'tablet' ? [834, 1024] : [1440, 1920]) {
        const px = TIERS.filter((t) => t !== 'METRIC').map((t) => workspaceTypePx(family, t, w));
        for (let i = 1; i < px.length; i++) expect(px[i]!, `${family}@${w} ${TIERS[i]}`).toBeGreaterThanOrEqual(px[i - 1]!);
        const metric = workspaceTypePx(family, 'METRIC', w);
        expect(metric).toBeGreaterThan(workspaceTypePx(family, 'T4', w));
        expect(metric).toBeLessThan(workspaceTypePx(family, 'T6', w));
      }
    }
  });

  it('mirrors every tier in the CSS token blocks (same authority units, same floors) for all three families', () => {
    const blocks = {
      desktop: tokenBlock(''),
      tablet: tokenBlock('@media (min-width: 700px) and (max-width: 1119px)'),
      mobile: tokenBlock('@media (max-width: 699px)'),
    };
    for (const [family, block] of Object.entries(blocks) as [keyof typeof blocks, string][]) {
      expect(block).toContain(`--pw-u: calc(${family === 'desktop' ? 'min(100vw, 2200px)' : '100vw'} / ${WORKSPACE_AUTHORITY_ARTBOARD[family]})`);
      for (const tier of TIERS) {
        const { au, floorPx } = WORKSPACE_TYPE_SCALE[family][tier];
        expect(block, `${family} ${tier}`).toContain(`${tokenName(tier)}: max(${floorPx}px, calc(var(--pw-u) * ${au}));`);
      }
    }
  });

  it('mirrors the panel density tokens (gutter / gap from the HUB --pad / --row-gap)', () => {
    const mobile = tokenBlock('@media (max-width: 699px)');
    expect(mobile).toContain(`--pw-gutter: calc(var(--pw-u) * ${WORKSPACE_PANEL_DENSITY.mobile.pad});`);
    expect(mobile).toContain(`--pw-gap: calc(var(--pw-u) * ${WORKSPACE_PANEL_DENSITY.mobile.gap});`);
    expect(mobile).toContain(`--pw-target: ${WORKSPACE_PANEL_DENSITY.mobile.minTargetPx}px;`);
  });
});

describe('viewport scope', () => {
  it('slot geometry defaults and default focal points are mobile-only (tablet / desktop compositions untouched)', () => {
    const mobileStart = css.indexOf('@media (max-width: 699px) {\n  :where(.pxa[data-density], .pw[data-density]) :where([data-media-slot])');
    expect(mobileStart).toBeGreaterThan(-1);
    const outside = css.slice(0, mobileStart);
    expect(outside).not.toContain(":where([data-media-slot='");
    expect(read(DENSITY_CSS)).toMatch(/@media \(max-width: 699px\) \{\s*\/\* default focal per fit mode \*\//);
  });

  it('HUB thumbs declare THUMBNAIL_COVER (50% 50% — the focal HUB already rendered)', () => {
    const hub = read('src/site00/components/productionAuthority/HubBody.tsx');
    const thumbs = [...hub.matchAll(/<Thumb [^>]*\/>/g)].map((m) => m[0]);
    expect(thumbs.length).toBeGreaterThanOrEqual(4);
    for (const t of thumbs) expect(t, t).toContain('fit="THUMBNAIL_COVER"');
  });
});

describe('no whole-page scale hacks, no host chrome, HUB untouched', () => {
  it('never uses zoom, transform scale or a root / body font-size shrink', () => {
    expect(css).not.toMatch(/\bzoom\s*:/);
    expect(css).not.toMatch(/transform\s*:[^;]*scale/);
    expect(css).not.toMatch(/(^|[\s,}])(html|body|:root)\s*\{[^}]*font-size/);
  });

  it('never selects host chrome or the HUB body', () => {
    for (const s of ['.pxh-', '.ph-nav', 'prod-chrome', '.hubx']) expect(css, s).not.toContain(s);
  });

  it('is loaded by both production frames and anchors every rule on [data-density] or :where()', () => {
    expect(read('src/site00/components/productionAuthority/ProductionAuthorityFrame.tsx')).toMatch(/import '\.\.\/\.\.\/styles\/site00-production-workspace-density\.css';[\s\S]*data-density="hub-authority"/);
    expect(read('src/site00/components/production/PwFrame.tsx')).toMatch(/import '\.\.\/\.\.\/styles\/site00-production-workspace-density\.css';[\s\S]*data-density="hub-authority"/);
    // @property / @keyframes carry no selectors (scroll-pane fade); every selector rule must be anchored
    const selectorCss = css.replace(/@property[^{]*\{[^}]*\}/g, '').replace(/@keyframes[^{]*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g, '');
    const rules = [...selectorCss.matchAll(/([^{}@]+)\{[^{}]*\}/g)].map((m) => m[1]!.trim()).filter(Boolean);
    for (const sel of rules) for (const part of sel.split(/,(?![^()]*\))/)) expect(part.trim(), part).toMatch(/^(:is\(\.pxa, \.pw\)\[data-density\]|\.pxa\[data-density\]|\.pw\[data-density\]|:where\(\.pxa\[data-density\], \.pw\[data-density\]\))/);
  });
});

describe('media slot contract', () => {
  const FIT: WorkspaceMediaFitMode[] = [
    'THUMBNAIL_COVER',
    'THUMBNAIL_CONTAIN',
    'PORTRAIT_COVER',
    'LANDSCAPE_COVER',
    'LOGO_CONTAIN',
    'UI_CAPTURE_CONTAIN',
    'AUTHORITY_PREVIEW_COVER',
    'WIDE_SCENE_COVER',
    'DOCUMENT_PREVIEW_CONTAIN',
    // PANEL-MEDIA-GEOMETRY-REFINEMENT2: functional previews that must stay whole
    'AUTHORITY_PREVIEW_CONTAIN',
    'VIDEO_FRAME_CONTAIN',
  ];

  it('defines every fit mode with cover ⇔ intentional crop and contain ⇔ no crop', () => {
    expect(Object.keys(WORKSPACE_MEDIA_FIT_MODES).sort()).toEqual([...FIT].sort());
    for (const mode of FIT) {
      const def = WORKSPACE_MEDIA_FIT_MODES[mode];
      expect(def.fit).toBe(mode.endsWith('_COVER') ? 'cover' : 'contain');
      expect(def.crop).toBe(mode.endsWith('_COVER') ? 'INTENTIONAL' : 'NONE');
      expect(css, mode).toContain(`[data-media-fit='${mode}']`);
    }
  });

  it('applies object-fit by mode suffix, focal through --pw-focal, for <img> and for background plates', () => {
    expect(css).toMatch(/\[data-media-fit\$='_COVER'\] :is\(img, video\) \{\s*object-fit: cover;/);
    expect(css).toMatch(/\[data-media-fit\$='_CONTAIN'\] :is\(img, video\) \{\s*object-fit: contain;/);
    // cover + default focal are zero-specificity defaults (art-directed crops keep their zoom / position) …
    expect(css).toMatch(/:where\(\.pxa\[data-density\], \.pw\[data-density\]\) :where\(\[data-media-fit\$='_COVER'\]:not\(:has\(img, video\)\)\) \{\s*background-size: cover;/);
    expect(css).toMatch(/:where\(\[data-media-fit\] :is\(img, video\)\) \{\s*object-position: var\(--pw-focal, var\(--pw-focal-default, 50% 50%\)\)/);
    expect(css).toMatch(/:where\(\[data-media-fit\]:not\(:has\(img, video\)\)\) \{\s*background-position: var\(--pw-focal, var\(--pw-focal-default, 50% 50%\)\)/);
    // … while a declared contain and explicit focal metadata are strong
    expect(css).toMatch(/\[data-density\] \[data-media-fit\$='_CONTAIN'\]:not\(:has\(img, video\)\) \{\s*background-size: contain;/);
    expect(css).toMatch(/\[data-density\] \[data-media-fit\]\[style\*='--pw-focal'\] :is\(img, video\) \{\s*object-position: var\(--pw-focal\);/);
    expect(css).toMatch(/\[data-density\] \[data-media-fit\]\[style\*='--pw-focal'\]:not\(:has\(img, video\)\) \{\s*background-position: var\(--pw-focal\);/);
  });

  it('never stretches: no fill fit, no non-uniform background-size', () => {
    expect(css).not.toMatch(/object-fit:\s*fill/);
    expect(css).not.toMatch(/background-size:\s*\d+%\s+\d+%/);
  });

  it('every slot type has an aspect ratio and CSS geometry; the slot (not the source) sizes the image', () => {
    for (const [type, def] of Object.entries(WORKSPACE_MEDIA_SLOTS)) {
      expect(def.overflow).toBe('CLIP_TO_SLOT');
      if (def.aspect === 'COMPOSED') continue; // composition-owned box (DESIGN chamber board previews)
      expect(def.aspect, type).toMatch(/^\d+ \/ \d+$/);
      expect(css, type).toContain(`[data-media-slot='${type}']`);
    }
    expect(css).toMatch(/\[data-media-slot\] :is\(img, video\) \{[^}]*inline-size: 100%;[^}]*block-size: 100%;/);
  });

  it('portraits keep the face (upper focal), UI captures and authority previews keep the top band', () => {
    expect(resolveWorkspaceMedia('PORTRAIT').focal).toBe('50% 22%');
    expect(resolveWorkspaceMedia('UI_CAPTURE').fit).toBe('contain');
    expect(resolveWorkspaceMedia('UI_CAPTURE').focal).toBe('50% 0%');
    expect(resolveWorkspaceMedia('LOGO_MARK').fit).toBe('contain');
    expect(resolveWorkspaceMedia('DOCUMENT').fit).toBe('contain');
    expect(resolveWorkspaceMedia('CARD_MEDIA', 'LANDSCAPE_COVER', '30% 60%').focal).toBe('30% 60%');
  });

  it('Thumb declares slot / fit / focal; undeclared thumbs keep the default cover fit', () => {
    const declared = renderToStaticMarkup(<Thumb plate="/a.png" slot="PORTRAIT" focal="40% 10%" />);
    expect(declared).toContain('data-media-slot="PORTRAIT"');
    expect(declared).toContain('data-media-fit="PORTRAIT_COVER"');
    expect(declared).toContain('--pw-focal:40% 10%');
    expect(declared).toContain('background-image:url(/a.png)');
    const plain = renderToStaticMarkup(<Thumb plate="/a.png" />);
    expect(plain).not.toContain('data-media-slot');
    expect(plain).toContain('data-media-fit="THUMBNAIL_COVER"');
    expect(workspaceMediaAttrs({ slot: 'LOGO_MARK' })['data-media-fit']).toBe('LOGO_CONTAIN');
  });

  it('missing media keeps the slot geometry and shows a named empty state, never a broken <img>', () => {
    const missing = renderToStaticMarkup(<WorkspaceMediaSlot slot="CARD_MEDIA" src={null} label="NO PLATE" />);
    expect(missing).toContain('data-media-slot="CARD_MEDIA"');
    expect(missing).toContain('data-media-state="missing"');
    expect(missing).toContain('data-asset-state="missing"');
    expect(missing).toContain('NO PLATE');
    expect(missing).not.toContain('<img');
    const filled = renderToStaticMarkup(<WorkspaceMediaSlot slot="UI_CAPTURE" src="/ui.png" alt="BRAND SCREEN" />);
    expect(filled).toContain('data-media-fit="UI_CAPTURE_CONTAIN"');
    expect(filled).toContain('alt="BRAND SCREEN"');
  });
});

describe('WorkspacePanel (shared panel primitive)', () => {
  it('declares a layout mode and gives every mode a default media slot (no universal card)', () => {
    expect(Object.keys(WORKSPACE_PANEL_DEFAULT_SLOT).sort()).toEqual(
      ['FULL_BLEED_MEDIA_WITH_OVERLAY', 'MEDIA_LEFT_TEXT_RIGHT', 'MEDIA_ONLY_PREVIEW', 'MEDIA_TOP_TEXT_BOTTOM', 'METADATA_WITH_SMALL_THUMBNAIL', 'THUMBNAIL_INLINE'].sort(),
    );
    const html = renderToStaticMarkup(
      <WorkspacePanel layout="MEDIA_LEFT_TEXT_RIGHT" media={{ src: '/m.png', focal: '40% 30%' }} title="LONG TITLE" meta="META" actions={<button type="button">OPEN</button>} />,
    );
    expect(html).toContain('data-panel-layout="MEDIA_LEFT_TEXT_RIGHT"');
    expect(html).toContain('data-media-slot="FEATURE_MEDIA"');
    expect(html).toContain('data-media-fit="LANDSCAPE_COVER"');
    expect(html).toContain('--pw-focal:40% 30%');
    expect(html).toMatch(/pwk-panel__media[\s\S]*pwk-panel__text[\s\S]*pwk-panel__actions/);
  });

  it('keeps geometry for missing media and renders no text zone for MEDIA_ONLY_PREVIEW', () => {
    const missing = renderToStaticMarkup(<WorkspacePanel layout="THUMBNAIL_INLINE" media={{ src: null, label: 'NO ART' }} title="ROW" />);
    expect(missing).toContain('data-media-slot="ROW_THUMB"');
    expect(missing).toContain('data-asset-state="missing"');
    expect(missing).not.toContain('<img');
    const only = renderToStaticMarkup(<WorkspacePanel layout="MEDIA_ONLY_PREVIEW" media={{ src: '/a.png', slot: 'UI_CAPTURE' }} title="IGNORED" />);
    expect(only).toContain('data-media-fit="UI_CAPTURE_CONTAIN"');
    expect(only).not.toContain('pwk-panel__text');
  });

  it('stacks MEDIA_LEFT_TEXT_RIGHT by container query and clamps long title / metadata (CSS)', () => {
    expect(css).toMatch(/\.pwk-panel \{[^}]*container-type: inline-size;/);
    expect(css).toMatch(/@container \(max-width: 300px\) \{\s*:is\(\.pxa, \.pw\)\[data-density\] \.pwk-panel\[data-panel-layout='MEDIA_LEFT_TEXT_RIGHT'\] \.pwk-panel__grid \{\s*grid-template-columns: minmax\(0, 1fr\);/);
    expect(css).toMatch(/\.pwk-panel__title \{[^}]*-webkit-line-clamp: 2;/);
    expect(css).toMatch(/\.pwk-panel__meta \{[^}]*-webkit-line-clamp: 3;/);
  });
});

describe('every tab maps its layers onto the shared tokens (mobile)', () => {
  const mobile = css.slice(css.indexOf('3. LAYER NORMALIZATION') > -1 ? 0 : 0);
  it.each([
    ['INBOX', '.ibx-tabs a'],
    ['INBOX detail', '.ibx-dtitle h1'],
    ['ACTIVITY', '.iax-hero__copy h1'],
    ['ACTIVITY feed', '.iax-feed__text b'],
    ['EXPERIENCE', '.pxa-hero__copy h1'],
    ['EXPERIENCE child', '.pw-head__title'],
    ['EXPRESSION', '.pxa-making__copy b'],
    ['EXPRESSION family', '.exf-panel__head h3'],
    ['LIBRARY', '.pxa-vault__hero h2'],
    ['DESIGN', '.pxa-design .pxa-sec__head h2'],
  ])('%s → %s is re-pointed at a tier token', (_tab, selector) => {
    expect(mobile).toContain(selector);
  });

  it('caps every root hero title at T6 and child page titles at T5', () => {
    expect(css).toMatch(/:is\(\.iax-hero__copy h1, \.pxa-hero__copy h1, \.exf-hero \.pxa-hero__copy h1\) \{\s*font-size: var\(--pw-t6\);/);
    expect(css).toMatch(/\.pw\[data-density\] :is\(\.pw-head__title\) \{\s*font-size: var\(--pw-t5\);/);
  });
});

describe('caps never crush a frame (aspect holds under every max size)', () => {
  it('no shared rule caps a media frame by block size — caps go through the inline size', () => {
    expect(css).not.toMatch(/max-block-size:\s*var\(/);
    expect(css).not.toMatch(/max-height:\s*var\(--pw-media/);
  });

  it('primitive slot caps are min(100%, cap × the slot aspect)', () => {
    const caps: Record<string, string> = {
      STRIP_THUMB: 'var(--pw-thumb-strip) * 16 / 10',
      CARD_MEDIA: 'var(--pw-media-card) * 16 / 9',
      FEATURE_MEDIA: 'var(--pw-media-feature) * 3 / 2',
      PORTRAIT: 'var(--pw-media-portrait) * 4 / 5',
      DOCUMENT: 'var(--pw-media-portrait) * 3 / 4',
      UI_CAPTURE: 'var(--pw-media-capture) * 9 / 16',
    };
    for (const [slot, cap] of Object.entries(caps)) {
      const aspect = WORKSPACE_MEDIA_SLOTS[slot as keyof typeof WORKSPACE_MEDIA_SLOTS].aspect;
      expect(cap.endsWith(aspect), slot).toBe(true);
      const rule = new RegExp(`\\.pw-media\\[data-media-slot='${slot}'\\]\\)\\s*\\{[^}]*inline-size: min\\(100%, calc\\(${cap.replace(/[()*/]/g, '\\$&')}\\)\\);[^}]*aspect-ratio: ${aspect.replace(/\//g, '\\/')};`);
      expect(css, slot).toMatch(rule);
    }
  });

  it('slot geometry targets the shared primitive only; composition frames keep their authored box', () => {
    // owner-agnostic slot rules only square the edges of bands / marks (and never crop a mark): no frame size
    const generic = [...css.matchAll(/:where\(((?:\[data-media-slot='[A-Z_]+'\](?:, )?)+)\)\s*\{([^}]*)\}/g)];
    expect(generic.length).toBeGreaterThan(0);
    for (const [, sel, body] of generic) {
      expect(sel).toMatch(/HERO_PLATE|LOGO_MARK/);
      expect(body).not.toMatch(/inline-size|aspect-ratio|block-size|width|height/);
    }
    expect(WORKSPACE_MEDIA_FRAME_OWNERSHIP.composition).toMatch(/authored frame/);
  });
});

describe('internal scroll panes: the pane edge is a scroll edge, never a hard cut', () => {
  it('fades the last 18px only while the pane overflows (scroll-driven, mobile, progressive)', () => {
    expect(css).toMatch(/@property --pw-pane-fade \{\s*syntax: '<length>';\s*inherits: false;\s*initial-value: 0px;/);
    expect(css).toMatch(/@supports \(animation-timeline: scroll\(\)\) \{\s*@media \(max-width: 699px\) \{\s*\.pxa\[data-density\] :is\(\.exf-panel__body, \.ibx-pane\) \{[^}]*mask-image: linear-gradient\(to bottom, #000 calc\(100% - var\(--pw-pane-fade\)\), transparent\);[^}]*animation-timeline: scroll\(self block\);/);
  });
});

describe('EXPRESSION family imagery declares its slot', () => {
  // superseded by PANEL-MEDIA-GEOMETRY-REFINEMENT2: no cover-by-default — the media ROLE decides the fit
  it('family Img declares slot + role (fit from the role); faces use the portrait focal', () => {
    const shell = read('src/site00/components/productionAuthority/expression/ExpressionFamilyShell.tsx');
    expect(shell).toMatch(/slot = 'CARD_MEDIA',\s*fit,/);
    expect(shell).toContain('{...workspaceMediaAttrs({ slot, fit, focal, role, scale, aspect, crop })}');
    expect(shell).toContain('data-media-slot="HERO_PLATE" data-media-fit="WIDE_SCENE_COVER"');
    expect(read('src/site00/components/productionAuthority/expression/families/CastingFamily.tsx')).toMatch(/className="exf-face" \{\.\.\.media\} fit="PORTRAIT_COVER"/);
  });

  it('HubImage stays attribute-free unless a caller declares a slot', () => {
    const plain = renderToStaticMarkup(<HubImage slotId="s1" url="/a.png" label="A" />);
    expect(plain).not.toContain('data-media-');
    const declared = renderToStaticMarkup(<HubImage slotId="s1" url="/a.png" label="A" slot="STRIP_THUMB" fit="THUMBNAIL_COVER" />);
    expect(declared).toContain('data-media-slot="STRIP_THUMB"');
    expect(declared).toContain('data-media-fit="THUMBNAIL_COVER"');
  });
});
