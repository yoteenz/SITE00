/**
 * P0.SITE00.PRODUCTION-WORKSPACE.PANEL-MEDIA-GEOMETRY-REFINEMENT2
 * Guards for the panel ↔ media geometry contract: media roles decide fit, crops exist only where registered,
 * functional media drives panel geometry (never the reverse), and every media call site declares its role.
 * Live proof (crop windows, pane slicing, focal, legibility per viewport): scripts/production-workspace/media-geometry-*.mjs.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { WORKSPACE_MEDIA_FIT_MODES } from '../src/site00/config/production-workspace-density';
import {
  HUB_NODE_ART_ASPECT,
  WORKSPACE_INTENTIONAL_CROPS,
  WORKSPACE_MEDIA_ROLES,
  WORKSPACE_MEDIA_SCALES,
  WORKSPACE_MOBILE_ESCAPE_ORDER,
  WORKSPACE_PANEL_MEDIA_MODES,
  inferWorkspaceMediaRole,
  resolveWorkspaceAspect,
  resolveWorkspaceFocal,
  resolveWorkspaceMediaRole,
  workspaceAssetAspect,
  workspaceCropGuard,
  type WorkspaceMediaRole,
} from '../src/site00/config/production-workspace-media';
import { WorkspaceMediaSlot, workspaceMediaAttrs } from '../src/site00/components/productionAuthority/WorkspaceMediaSlot';
import { Grid, Img, Mono, Panel } from '../src/site00/components/productionAuthority/expression/ExpressionFamilyShell';
import { HUB_MEDIA } from '../src/site00/components/productionHub/HubImage';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const css = read('src/site00/styles/site00-production-workspace-density.css').replace(/\/\*[\s\S]*?\*\//g, '');
const ROLES = Object.keys(WORKSPACE_MEDIA_ROLES) as WorkspaceMediaRole[];

describe('media roles (asset type decides the fit)', () => {
  it('defines the ten roles of the sprint', () => {
    expect(ROLES.sort()).toEqual(
      ['DECORATIVE_ART', 'DOCUMENT_PREVIEW', 'LANDSCAPE_EDITORIAL', 'LOGO_MARK', 'OTHER_DECORATIVE', 'OTHER_FUNCTIONAL', 'PORTRAIT', 'REFERENCE_AUTHORITY', 'UI_SCREENSHOT', 'VIDEO_FRAME'].sort(),
    );
  });

  it('no-crop roles contain only and keep the whole source', () => {
    for (const role of ['UI_SCREENSHOT', 'LOGO_MARK', 'DOCUMENT_PREVIEW', 'OTHER_FUNCTIONAL'] as const) {
      const def = WORKSPACE_MEDIA_ROLES[role];
      expect(def.crop, role).toBe('NONE');
      expect(def.minVisibleAxis, role).toBe(1);
      for (const fit of def.allowedFits) expect(WORKSPACE_MEDIA_FIT_MODES[fit].fit, `${role} ${fit}`).toBe('contain');
    }
  });

  it('authority / reference media preserve the full frame by default (crop only with registered authority metadata)', () => {
    const def = WORKSPACE_MEDIA_ROLES.REFERENCE_AUTHORITY;
    expect(def.crop).toBe('CROP_SAFE');
    expect(def.defaultFit).toBe('AUTHORITY_PREVIEW_CONTAIN');
    expect(def.allowedFits.every((f) => f.endsWith('_CONTAIN'))).toBe(true);
    expect(def.aspects).toEqual(['SOURCE']);
  });

  it('only decorative roles crop by slot; functional covers are focal-safe or registered', () => {
    for (const role of ROLES) {
      const def = WORKSPACE_MEDIA_ROLES[role];
      if (def.crop === 'SLOT_DEFINED') expect(def.functional, role).toBe(false);
      if (def.functional) expect(def.crop, role).not.toBe('SLOT_DEFINED');
      if (def.functional && def.defaultFit.endsWith('_COVER')) expect(def.crop, role).toBe('FOCAL_SAFE');
    }
  });

  it('functional media is never covered by text unless the composition is approved', () => {
    for (const role of ROLES) if (WORKSPACE_MEDIA_ROLES[role].functional) expect(WORKSPACE_MEDIA_ROLES[role].textOverlay, role).not.toBe('ALLOWED');
  });

  it('resolves fit by role: a fit the role forbids is replaced, an authority cover needs a registered crop', () => {
    expect(resolveWorkspaceMediaRole({ role: 'UI_SCREENSHOT', fit: 'THUMBNAIL_COVER' })).toMatchObject({ fit: 'UI_CAPTURE_CONTAIN', coerced: 'FIT_NOT_ALLOWED_FOR_ROLE' });
    expect(resolveWorkspaceMediaRole({ role: 'LOGO_MARK', fit: 'LANDSCAPE_COVER' }).fit).toBe('LOGO_CONTAIN');
    expect(resolveWorkspaceMediaRole({ role: 'REFERENCE_AUTHORITY', fit: 'THUMBNAIL_COVER' })).toMatchObject({ fit: 'AUTHORITY_PREVIEW_CONTAIN', coerced: 'CROP_NOT_REGISTERED' });
    expect(resolveWorkspaceMediaRole({ role: 'REFERENCE_AUTHORITY', fit: 'THUMBNAIL_COVER', crop: 'NODE_ART_CHIP' })).toMatchObject({ fit: 'THUMBNAIL_COVER', cropId: 'NODE_ART_CHIP', coerced: null });
    expect(resolveWorkspaceMediaRole({ role: 'REFERENCE_AUTHORITY' }).fit).toBe('AUTHORITY_PREVIEW_CONTAIN');
    expect(resolveWorkspaceMediaRole({ role: 'VIDEO_FRAME' }).fit).toBe('VIDEO_FRAME_CONTAIN');
    expect(resolveWorkspaceMediaRole({ role: 'PORTRAIT' })).toMatchObject({ fit: 'PORTRAIT_COVER', focalRegion: resolveWorkspaceFocal('face').region });
    expect(resolveWorkspaceMediaRole({ role: 'DECORATIVE_ART' }).focalRegion).toBeNull();
  });
});

describe('focal contract (no computer vision)', () => {
  it('named points resolve to a CSS position and a protected region', () => {
    expect(resolveWorkspaceFocal('face')).toEqual({ position: '50% 19.4%', region: [0.3, 0.12, 0.7, 0.5] });
    expect(resolveWorkspaceFocal('top').position).toBe('50% 0%');
    expect(resolveWorkspaceFocal('center').region).toEqual([0.3, 0.3, 0.7, 0.7]);
  });
  it('custom points keep their region inside the source (face near the top / bottom edge)', () => {
    const top = resolveWorkspaceFocal({ x: 0.5, y: 0.06 });
    expect(top.position).toBe('50% 0%'); // region touches the top edge → anchored to the edge
    expect(top.region[1]).toBe(0);
    const bottom = resolveWorkspaceFocal({ x: 0.5, y: 0.9 });
    expect(bottom.region[3]).toBe(1);
  });
  it('region-anchored positions keep the whole region for every visible share ≥ the region size (edges included)', () => {
    const points = ['face', 'subject', 'center', 'top', { x: 0.5, y: 0.08, h: 0.16 }, { x: 0.5, y: 0.88, h: 0.2 }, { x: 0.1, y: 0.5, w: 0.2 }] as const;
    for (const f of points) {
      const { position, region } = resolveWorkspaceFocal(f);
      const [px, py] = position.split(' ').map((v) => parseFloat(v) / 100);
      for (const [p, r0, r1] of [[px!, region[0], region[2]], [py!, region[1], region[3]]] as const) {
        for (let v = r1 - r0; v <= 1.0001; v += 0.05) {
          const w0 = p * (1 - v);
          expect(w0 <= r0 + 0.002 && w0 + v >= r1 - 0.002, `${JSON.stringify(f)} visible ${v.toFixed(2)}`).toBe(true);
        }
      }
    }
  });

  it('crop guard: a cover that would break the bound or the focal rule in its rendered box falls back to contain', () => {
    const face = resolveWorkspaceFocal('face');
    const pos = face.position.split(' ').map((v) => parseFloat(v) / 100) as [number, number];
    const base = { position: pos, minVisible: 0.5, region: face.region, keep: 'REGION' as const };
    expect(workspaceCropGuard({ ...base, boxAspect: 4 / 5, sourceAspect: 4 / 5 })).toBe('cover'); // headshot in its slot
    expect(workspaceCropGuard({ ...base, boxAspect: 1, sourceAspect: 3 / 4 })).toBe('cover'); // 3:4 in a square chip
    expect(workspaceCropGuard({ ...base, boxAspect: 4 / 5, sourceAspect: 1 / 6 })).toBe('contain'); // very tall portrait
    expect(workspaceCropGuard({ ...base, boxAspect: 4, sourceAspect: 3 / 4 })).toBe('contain'); // letterbox strip
    expect(workspaceCropGuard({ position: [0.5, 0.5], minVisible: 0.28, region: [0.3, 0.3, 0.7, 0.7], keep: 'POINT', boxAspect: 1, sourceAspect: 272 / 110 })).toBe('cover'); // HUB node chip
    expect(workspaceCropGuard({ position: [0.5, 0.5], minVisible: 0.5, region: [0.3, 0.3, 0.7, 0.7], keep: 'REGION', boxAspect: 1, sourceAspect: 174 / 50 })).toBe('contain'); // keyframes art on a square card
  });
});

describe('semantic aspect contract (never the source pixel size)', () => {
  it('resolves approved keys, hub node art and literal ratios', () => {
    expect(resolveWorkspaceAspect('ACTOR_HEADSHOT')).toBe('4 / 5');
    expect(resolveWorkspaceAspect('node:cast')).toBe('272 / 110');
    expect(resolveWorkspaceAspect('3 / 2')).toBe('3 / 2');
    expect(resolveWorkspaceAspect('NOPE')).toBeNull();
    expect(workspaceAssetAspect('production.ndxbook.entry-002.node.look.primary')).toBe('node:look');
    expect(workspaceAssetAspect('production.ndxbook.entry-002.storyboard.frame.03')).toBe('STORYBOARD_FRAME');
  });

  it('HUB node art aspects match the approved receipt files (drift guard, QA only)', () => {
    const dims = (file: string) => {
      const b = readFileSync(file);
      const chunk = b.toString('ascii', 12, 16);
      if (chunk === 'VP8X') return [b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1];
      if (chunk === 'VP8L') {
        const v = b.readUInt32LE(21);
        return [(v & 0x3fff) + 1, ((v >> 14) & 0x3fff) + 1];
      }
      return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    };
    for (const [node, ratio] of Object.entries(HUB_NODE_ART_ASPECT)) {
      const [w, h] = dims(path.join(root, `public/site00/production-hub/production/ndxbook/entry-002/node/${node}/primary.webp`));
      expect(`${w} / ${h}`, node).toBe(ratio);
    }
  });
});

describe('media scales + legibility (HUB-calibrated)', () => {
  it('TILE and PREVIEW drive their panel, CHIP and PLATE never do', () => {
    expect(WORKSPACE_MEDIA_SCALES.TILE.drivesPanelHeight).toBe(true);
    expect(WORKSPACE_MEDIA_SCALES.PREVIEW.drivesPanelHeight).toBe(true);
    expect(WORKSPACE_MEDIA_SCALES.CHIP.drivesPanelHeight).toBe(false);
    expect(WORKSPACE_MEDIA_SCALES.PLATE.drivesPanelHeight).toBe(false);
  });
  it('minimums never exceed what HUB itself renders (chip ≈18px, smallest card media ≈49px)', () => {
    for (const fam of ['mobile', 'tablet', 'desktop'] as const) {
      expect(WORKSPACE_MEDIA_SCALES.CHIP.minPx[fam]).toBeLessThanOrEqual(18);
      expect(WORKSPACE_MEDIA_SCALES.TILE.minPx[fam]).toBeLessThanOrEqual(49);
      expect(WORKSPACE_MEDIA_SCALES.PREVIEW.minPx[fam]).toBeGreaterThanOrEqual(120);
    }
  });
});

describe('intentional crop registry — a crop not registered here is a failure', () => {
  it('ids are unique; every entry names a role, fits, scales, reason and authority', () => {
    const ids = WORKSPACE_INTENTIONAL_CROPS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of WORKSPACE_INTENTIONAL_CROPS) {
      expect(ROLES, c.id).toContain(c.role);
      expect(c.fits.length, c.id).toBeGreaterThan(0);
      for (const f of c.fits) expect(f.endsWith('_COVER'), `${c.id} ${f}`).toBe(true);
      expect(c.reason.length, c.id).toBeGreaterThan(40);
      expect(c.authority.length, c.id).toBeGreaterThan(10);
    }
  });
  it('never registers a crop for a no-crop role; functional crops keep their focal and at least half of each axis (chips: the point)', () => {
    for (const c of WORKSPACE_INTENTIONAL_CROPS) {
      const def = WORKSPACE_MEDIA_ROLES[c.role];
      expect(def.crop, c.id).not.toBe('NONE');
      if (def.functional) {
        expect(c.focal, c.id).not.toBe('NONE');
        if (c.focal === 'REGION') expect(c.minVisibleAxis, c.id).toBeGreaterThanOrEqual(0.5);
        else expect(c.scales, c.id).toEqual(['CHIP']);
      } else expect(c.focal, c.id).toBe('NONE');
    }
  });
  it('every crop id used in the workspace source exists in the registry', () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const f of readdirSync(dir)) {
        const p = path.join(dir, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (p.endsWith('.tsx')) files.push(p);
      }
    };
    for (const dir of ['src/site00/components/productionAuthority', 'src/site00/components/production', 'src/site00/components/productionHub', 'src/site00/pages/production']) walk(path.join(root, dir));
    const used = new Set<string>();
    for (const f of files) for (const m of readFileSync(f, 'utf8').matchAll(/(?:\bcrop=|data-media-crop=)["{']([A-Z_]+)["}']/g)) used.add(m[1]!);
    expect(used.size).toBeGreaterThan(8);
    for (const id of used) expect(WORKSPACE_INTENTIONAL_CROPS.map((c) => c.id), id).toContain(id);
  });
  it('HUB machine view declarations name HUB’s own crop classes — registered for that role, fit and scale, never coerced', () => {
    for (const [k, d] of Object.entries(HUB_MEDIA)) {
      const r = resolveWorkspaceMediaRole(d);
      expect(r.coerced, k).toBeNull();
      expect(r.fit, k).toBe(d.fit);
      const entry = WORKSPACE_INTENTIONAL_CROPS.find((c) => c.id === d.crop)!;
      expect(entry.role, k).toBe(d.role);
      expect(entry.fits, k).toContain(d.fit);
      expect(entry.scales, k).toContain(d.scale);
    }
    const machine = read('src/site00/components/productionHub/machine.tsx') + read('src/site00/components/productionHub/panels.tsx');
    expect([...machine.matchAll(/<HubImage\b[^>]*?\/>/gs)].every((m) => /\{\.\.\.(?:\(c === A \? )?HUB_MEDIA\./.test(m[0]))).toBe(true);
  });
});

describe('every media call site declares its role (explicit asset type)', () => {
  const FILES = [
    'src/site00/components/productionAuthority/HubBody.tsx',
    'src/site00/components/productionAuthority/InboxBody.tsx',
    'src/site00/components/productionAuthority/ActivityBody.tsx',
    'src/site00/components/productionAuthority/LibraryBody.tsx',
    'src/site00/components/productionAuthority/ExpressionBody.tsx',
    'src/site00/components/productionAuthority/DesignChamber.tsx',
    'src/site00/components/productionAuthority/ProjectFamilyChamber.tsx',
    'src/site00/components/productionAuthority/iaKit.tsx',
    'src/site00/components/production/PwFrame.tsx',
    'src/site00/pages/production/ExperienceProductionShellPage.tsx',
    ...readdirSync(path.join(root, 'src/site00/components/productionAuthority/expression/families')).map((f) => `src/site00/components/productionAuthority/expression/families/${f}`),
  ];
  it.each(FILES)('%s', (file) => {
    const src = read(file);
    // one JSX opening element per media primitive / raw media element
    const elements = [...src.matchAll(/<(Thumb|Img|HubImage|img|i|span|div)\b[^>]*?(?:\/>|>)/gs)].map((m) => m[0]);
    const media = elements.filter((e) => /^<(Thumb|Img)\b/.test(e) || /^<img\b/.test(e) || /data-media-slot=/.test(e) || (/^<HubImage\b/.test(e) && /\b(slot|fit)=/.test(e)));
    for (const e of media) expect(/\brole=|data-media-role=/.test(e) || /\{\.\.\.media\}/.test(e), e.slice(0, 160)).toBe(true);
  });
});

describe('panels respect their media (content-driven geometry)', () => {
  it('every content-driven panel mode is TILE / PREVIEW scale; MEDIA_INLINE (chips) keeps the composition', () => {
    for (const def of Object.values(WORKSPACE_PANEL_MEDIA_MODES)) {
      if (def.height === 'CONTENT_DRIVEN') expect(['TILE', 'PREVIEW'], def.mode).toContain(def.scale);
      else expect(def.scale, def.mode).toBe('CHIP');
    }
    expect(Object.keys(WORKSPACE_PANEL_MEDIA_MODES).sort()).toEqual(['AUTHORITY_PREVIEW', 'MEDIA_INLINE', 'MEDIA_LEAD', 'MEDIA_STACK', 'PORTRAIT_GRID', 'REFERENCE_FRAME']);
  });

  it('mobile escape order grows / stacks before anything else and never crops harder', () => {
    expect(WORKSPACE_MOBILE_ESCAPE_ORDER).toEqual(['INCREASE_PANEL_HEIGHT', 'STACK_MEDIA_ABOVE_COPY', 'TALLER_MEDIA_SLOT', 'REDUCE_COLUMNS', 'MOVE_SECONDARY_CONTENT_TO_NEXT_ROW', 'CONTINUATION_OR_DETAIL_VIEW']);
  });

  it('an EXPRESSION grid carrying functional media is content-driven on phones; a grid without media (or with media hidden on phones) keeps its composition', () => {
    const at = { d: [6, 1], t: [6, 1], m: [6, 1] } as const;
    const media = renderToStaticMarkup(
      <MemoryRouter>
        <Grid rows={{ d: '1fr', t: '1fr', m: '1fr' }}>
          <Panel title="A" at={at} media="AUTHORITY_PREVIEW">
            <Img url="/a.webp" label="A" role="REFERENCE_AUTHORITY" scale="PREVIEW" aspect="node:cast" />
          </Panel>
        </Grid>
      </MemoryRouter>,
    );
    expect(media).toContain('data-media-geometry="CONTENT"');
    expect(media).toContain('data-panel-media="AUTHORITY_PREVIEW"');
    expect(media).toContain('data-media-fit="AUTHORITY_PREVIEW_CONTAIN"');
    expect(media).toContain('--pw-media-aspect:272 / 110');
    const render = (panel: JSX.Element) => renderToStaticMarkup(<MemoryRouter><Grid rows={{ d: '1fr', t: '1fr', m: '1fr' }}>{panel}</Grid></MemoryRouter>);
    expect(render(<Panel title="B" at={at} media="MEDIA_INLINE"><span /></Panel>)).toContain('data-media-geometry="CONTENT"');
    expect(render(<Panel title="C" at={at}><span /></Panel>)).toContain('data-media-geometry="COMPOSITION"');
    expect(render(<Panel title="D" at={at} media="AUTHORITY_PREVIEW" hide="m"><span /></Panel>)).toContain('data-media-geometry="COMPOSITION"');
  });

  it('CSS: phones grow content-driven grids and scroll the frame; previews hold their aspect; portrait grids are tiles, not bands', () => {
    expect(css).toMatch(/\.exf-grid\[data-media-geometry='CONTENT'\] \{[^}]*height: auto;[^}]*grid-template-rows: none;[^}]*grid-auto-rows: auto;/);
    expect(css).toMatch(/:has\(\.exf-grid\[data-media-geometry='CONTENT'\]\) \.pxa-scroll \{\s*overflow-y: auto;/);
    expect(css).toMatch(/\[data-panel-media\] \[data-media-scale='PREVIEW'\] \{[^}]*aspect-ratio: var\(--pw-media-aspect, 16 \/ 10\);/);
    expect(css).toMatch(/\[data-panel-media='PORTRAIT_GRID'\] \.exf-tile > \[data-media-role='PORTRAIT'\] \{[^}]*aspect-ratio: var\(--pw-media-aspect, 4 \/ 5\);/);
    expect(css).toMatch(/grid-column: 1 \/ -1;/);
  });

  it('CSS: the crop guard contains a guarded cover; primitives observe their image', () => {
    expect(css).toMatch(/\[data-media-fit\] img\[data-crop-guard='contain'\] \{\s*object-fit: contain;/);
    expect(read('src/site00/components/productionHub/HubImage.tsx')).toMatch(/<img ref=\{guard\}/);
    expect(read('src/site00/components/productionAuthority/WorkspaceMediaSlot.tsx')).toMatch(/<img ref=\{guard\}/);
  });

  it('CSS: on tablet / desktop a MEDIA_LEAD card widens its art column to the PREVIEW floor instead of shrinking the authority', () => {
    const floor = WORKSPACE_MEDIA_SCALES.PREVIEW.minInlinePx!;
    expect(floor.tablet).toBe(240);
    expect(floor.desktop).toBe(240);
    for (const sel of ['.ibx-dcard', '.ibx-notice .ibx-dcard', '.iax-ms__head']) {
      const rule = new RegExp(`\\.pxa\\[data-density\\] ${sel.replace(/\./g, '\\.')}\\[data-panel-media='MEDIA_LEAD'\\] \\{\\s*grid-template-columns: (\\d+)px`, 'g');
      const widths = [...css.matchAll(rule)].map((m) => Number(m[1]));
      expect(widths.length, sel).toBeGreaterThan(0);
      for (const w of widths) expect(w, sel).toBeGreaterThanOrEqual(floor.tablet);
    }
  });

  it('CSS: a raw image that declares a no-crop role always contains; the media geometry layer never hides overflow or covers', () => {
    expect(css).toMatch(/:is\(img, video\):is\(\[data-media-role='UI_SCREENSHOT'\], \[data-media-role='LOGO_MARK'\], \[data-media-role='DOCUMENT_PREVIEW'\], \[data-media-role='OTHER_FUNCTIONAL'\]\),\s*:is\(\.pxa, \.pw\)\[data-density\] :is\(img, video\)\[data-media-role='REFERENCE_AUTHORITY'\]:not\(\[data-media-crop\]\) \{\s*object-fit: contain;/);
    const s8 = css.slice(css.indexOf("[data-media-fit='AUTHORITY_PREVIEW_CONTAIN']"));
    expect(s8).not.toMatch(/overflow: hidden/);
    expect(s8).not.toMatch(/object-fit: cover/);
    expect(s8).not.toMatch(/max-height: var\(--pw-media/);
  });
});

describe('primitives carry the contract', () => {
  it('workspaceMediaAttrs emits role / scale / crop / focal region / semantic aspect; legacy (no role) output is unchanged', () => {
    const a = workspaceMediaAttrs({ role: 'PORTRAIT', scale: 'TILE', aspect: 'ACTOR_HEADSHOT', focal: 'face', slot: 'PORTRAIT', crop: 'PORTRAIT_FACE_SAFE' });
    expect(a).toMatchObject({ 'data-media-role': 'PORTRAIT', 'data-media-scale': 'TILE', 'data-media-fit': 'PORTRAIT_COVER', 'data-media-crop': 'PORTRAIT_FACE_SAFE', 'data-media-focal-region': '0.3 0.12 0.7 0.5', 'data-media-guard': '0.5 REGION' });
    expect(a.style).toMatchObject({ '--pw-media-aspect': '4 / 5', '--pw-focal': '50% 19.4%' });
    expect(workspaceMediaAttrs({ role: 'UI_SCREENSHOT' })['data-media-guard']).toBeUndefined(); // contain roles need no guard
    expect(workspaceMediaAttrs({ role: 'REFERENCE_AUTHORITY', fit: 'THUMBNAIL_COVER', crop: 'NODE_ART_CHIP' })['data-media-guard']).toBe('0.28 POINT');
    expect(workspaceMediaAttrs({ slot: 'ROW_THUMB' })).toEqual({ 'data-media-slot': 'ROW_THUMB', 'data-media-fit': 'THUMBNAIL_COVER' });
  });

  it('EXPRESSION Img requires a role and has no cover default; the initials tile keeps the portrait slot when the headshot is missing', () => {
    const shell = read('src/site00/components/productionAuthority/expression/ExpressionFamilyShell.tsx');
    expect(shell).not.toMatch(/fit = 'THUMBNAIL_COVER'/);
    expect(shell).toMatch(/role: WorkspaceMediaRole \} & WorkspaceMediaProps/);
    const mono = renderToStaticMarkup(<Mono text="Maya Okonkwo" media={{ role: 'PORTRAIT', scale: 'TILE', aspect: 'ACTOR_HEADSHOT', slot: 'PORTRAIT' }} />);
    expect(mono).toContain('data-media-role="PORTRAIT"');
    expect(mono).toContain('data-media-state="missing"');
    expect(mono).toContain('--pw-media-aspect:4 / 5');
    expect(mono).toContain('>MO<');
  });

  it('loading and error keep the final slot: the aspect is declared before the source loads, a failed source shows the named empty state', () => {
    const filled = renderToStaticMarkup(<WorkspaceMediaSlot slot="CARD_MEDIA" role="REFERENCE_AUTHORITY" scale="PREVIEW" aspect="node:look" src="/x.webp" label="LOOK" />);
    expect(filled).toContain('--pw-media-aspect:168 / 60');
    expect(filled).toContain('data-media-fit="AUTHORITY_PREVIEW_CONTAIN"');
    const missing = renderToStaticMarkup(<WorkspaceMediaSlot slot="CARD_MEDIA" role="REFERENCE_AUTHORITY" scale="PREVIEW" aspect="node:look" src={null} label="LOOK" />);
    expect(missing).toContain('data-asset-state="missing"');
    expect(missing).toContain('--pw-media-aspect:168 / 60');
  });
});

describe('EXPRESSION → CASTING (the failure that caused this sprint)', () => {
  const casting = read('src/site00/components/productionAuthority/expression/families/CastingFamily.tsx');
  it('AVAILABLE TALENT is a portrait grid of portrait tiles (never a shallow band)', () => {
    expect(casting).toMatch(/title="AVAILABLE TALENT"[^>]*media="PORTRAIT_GRID"/);
    expect(casting).toMatch(/<ActorFace actor=\{a\} label=\{a\.stageName\} scale="TILE" \/>/);
    expect(casting).toMatch(/role: 'PORTRAIT', scale, aspect: 'ACTOR_HEADSHOT'/);
  });
  it('LEAD AUTHORITY is a dedicated authority preview at the approved cast-node ratio, full row on phones', () => {
    expect(casting).toMatch(/title="LEAD AUTHORITY"[^>]*m: \[6, 1\][^>]*media="AUTHORITY_PREVIEW"/);
    expect(casting).toMatch(/role="REFERENCE_AUTHORITY" scale="PREVIEW" aspect="node:cast"/);
  });
});

describe('inference of undeclared media (audit of legacy markup)', () => {
  it('reads the asset type from the source first', () => {
    expect(inferWorkspaceMediaRole({ src: 'node/cast/primary.webp', fit: 'THUMBNAIL_COVER' })).toBe('REFERENCE_AUTHORITY');
    expect(inferWorkspaceMediaRole({ src: 'storyboard/frame/03.webp' })).toBe('VIDEO_FRAME');
    expect(inferWorkspaceMediaRole({ slot: 'HERO_PLATE', isBg: true })).toBe('DECORATIVE_ART');
    expect(inferWorkspaceMediaRole({ fit: 'LOGO_CONTAIN' })).toBe('LOGO_MARK');
  });
});
