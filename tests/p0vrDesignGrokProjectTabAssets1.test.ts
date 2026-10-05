/**
 * P0.VR.DESIGN.GROK-PROJECT-TAB-ASSETS1 — staged project-tab visual pack.
 *
 * Guards the construction grid, destination coverage for all seven live
 * tabs, the firewall (STAGED, no approved-manifest mutation), and that the
 * surfaces read the pack through existing slots rather than a new layout.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  PTV_COLLECTION_PLATE,
  PTV_FAMILY,
  PTV_HISTORY_ICON,
  PTV_ICON_BY_PS,
  PTV_ICON_IDS,
  PTV_PLATE_IDS,
  PTV_PUBLIC_ROOT,
  PTV_RASTER_PLATES,
  PTV_STATUS,
  PTV_STROKE,
  PTV_VERSION,
  PTV_VIEWBOX,
  getProjectTabIconDef,
  listProjectTabIconDefs,
  listProjectTabPlateDefs,
  pageFamilyPlateId,
  renderProjectTabIconSvg,
  renderProjectTabPlateSvg,
} from '../shared/site00-design-workspace-production/designProjectTabVisuals.js';

const MANIFEST = 'public/site00/project-tabs/staged/manifest.json';
const ICONS = 'src/site00/components/designBench/production/projectTabs/projectTabIcons.tsx';
const REFS = 'src/site00/components/designBench/production/projectTabs/ProjectReferencesSurface.tsx';
const ASSETS = 'src/site00/components/designBench/production/projectTabs/ProjectAssetsSurface.tsx';
const PAGES = 'src/site00/components/designBench/production/projectTabs/ProjectPagesSurface.tsx';
const MORE = 'src/site00/components/designBench/production/projectTabs/ProjectMoreSurface.tsx';
const HAMBURGER = 'src/site00/components/designBench/production/projectTabs/ProjectWorkspaceDrawer.tsx';

function read(relative: string): string {
  return readFileSync(join(import.meta.dirname, '..', relative), 'utf8');
}

describe('P0.VR.DESIGN.GROK-PROJECT-TAB-ASSETS1 — construction', () => {
  it('keeps one family, one viewBox, one stroke, STAGED status', () => {
    expect(PTV_VIEWBOX).toBe(24);
    expect(PTV_STROKE).toBe(1.5);
    expect(PTV_FAMILY).toBe('SITE00_PROJECT_TAB_LINE_V1');
    expect(PTV_STATUS).toBe('STAGED');
    expect(PTV_VERSION).toBe('P0.VR.DESIGN.GROK-PROJECT-TAB-ASSETS1');
    expect(PTV_PUBLIC_ROOT).toBe('/site00/project-tabs/staged');
  });

  it('defines a complete destination set and can render every icon', () => {
    expect(PTV_ICON_IDS.length).toBeGreaterThanOrEqual(70);
    for (const id of PTV_ICON_IDS) {
      const def = getProjectTabIconDef(id);
      expect(def.id).toBe(id);
      expect(def.primitives.length).toBeGreaterThan(0);
      const svg = renderProjectTabIconSvg(id);
      expect(svg).toContain('viewBox="0 0 24 24"');
      expect(svg).toContain(`data-ptv-icon="${id}"`);
      expect(svg).toContain('data-ptv-status="STAGED"');
    }
  });

  it('covers all seven live tab destinations', () => {
    const tabs = new Set(listProjectTabIconDefs().map((def) => def.tab));
    for (const tab of ['hamburger', 'references', 'assets', 'pages', 'skins', 'history', 'more']) {
      expect(tabs.has(tab as never)).toBe(true);
    }
  });

  it('keeps hamburger destination marks distinct and monoline', () => {
    const marks = ['dest-workspace', 'dest-references', 'dest-assets', 'dest-pages', 'dest-skins', 'dest-history', 'dest-more'] as const;
    const svgs = marks.map((id) => renderProjectTabIconSvg(id));
    expect(new Set(svgs).size).toBe(marks.length);
    for (const svg of svgs) {
      expect(svg).not.toMatch(/sparkle|brain|emoji|gradient|cartoon/i);
    }
  });

  it('maps every existing PsIcon wrapper onto the catalog', () => {
    expect(Object.keys(PTV_ICON_BY_PS).length).toBeGreaterThanOrEqual(20);
    const source = read(ICONS);
    expect(source).toContain('ProjectTabIcon');
    expect(source).toContain('PTV_ICON_BY_PS');
  });
});

describe('P0.VR.DESIGN.GROK-PROJECT-TAB-ASSETS1 — plates and wiring', () => {
  it('renders labelled 320×200 plates for every catalog id', () => {
    for (const id of PTV_PLATE_IDS) {
      const svg = renderProjectTabPlateSvg(id);
      expect(svg).toContain('viewBox="0 0 320 200"');
      expect(svg).toContain(`data-ptv-plate="${id}"`);
      expect(svg).toContain('STAGED');
    }
    expect(pageFamilyPlateId('CONTENT')).toBe('family-content');
  });

  it('keeps raster plates staged and destination-bound', () => {
    expect(PTV_RASTER_PLATES.length).toBe(8);
    for (const plate of PTV_RASTER_PLATES) {
      expect(plate.ready).toBe('STAGED');
      expect(plate.kind).toBe('raster');
      expect(plate.file.startsWith('raster/')).toBe(true);
    }
    expect(PTV_COLLECTION_PLATE.authority).toContain('plate-ref-authority');
    expect(PTV_HISTORY_ICON.AUTHORITY).toBe('hist-authority');
  });

  it('dumps a staged public pack without touching an approved manifest', () => {
    const manifest = JSON.parse(read(MANIFEST)) as {
      status: string;
      approvedAssetMutation: string;
      icons: unknown[];
      plates: unknown[];
    };
    expect(manifest.status).toBe('STAGED');
    expect(manifest.approvedAssetMutation).toBe('NONE');
    expect(manifest.icons.length).toBeGreaterThanOrEqual(70);
    expect(manifest.plates.length).toBeGreaterThanOrEqual(28);
    expect(existsSync(join(import.meta.dirname, '..', 'public/site00/project-tabs/staged/review.html'))).toBe(true);
    expect(existsSync(join(import.meta.dirname, '..', 'public/site00/project-tabs/staged/dest-workspace.svg'))).toBe(true);
    expect(existsSync(join(import.meta.dirname, '..', 'public/site00/project-tabs/staged/raster/plate-ref-brand.jpg'))).toBe(true);
  });

  it('wires plates into existing tab slots only', () => {
    expect(read(REFS)).toContain('PTV_COLLECTION_PLATE');
    expect(read(ASSETS)).toContain('PTV_ASSET_CATEGORY_PLATE');
    expect(read(PAGES)).toContain('pageFamilyPlateId');
    expect(read(MORE)).toContain('plate-more-banner.jpg');
    expect(read(HAMBURGER)).toContain('plate-ref-brand.jpg');
    expect(read(REFS)).not.toContain('tod-ps-redesign');
  });

  it('does not invent a fabricated reference library — plates are fallbacks', () => {
    const refs = read(REFS);
    expect(refs).toContain('ref.src ??');
    expect(listProjectTabPlateDefs().every((plate) => plate.ready === 'STAGED')).toBe(true);
  });
});
