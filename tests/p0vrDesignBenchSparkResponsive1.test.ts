import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { SITE00_ROUTES, site00ProjectDesignTwinSparkResponsivePath } from '../src/site00/config/routes';
import {
  TWIN_SPARK_RESPONSIVE_BOTTOM_NAV,
  TWIN_SPARK_RESPONSIVE_CANDIDATES,
  TWIN_SPARK_RESPONSIVE_CANDIDATE_ACTIONS,
  TWIN_SPARK_RESPONSIVE_CONCEPT_TABS,
  TWIN_SPARK_RESPONSIVE_HERO,
  TWIN_SPARK_RESPONSIVE_LINEAGE,
  TWIN_SPARK_RESPONSIVE_OUTPUT_COLUMNS,
  TWIN_SPARK_RESPONSIVE_PAPER_TEXTURE,
  TWIN_SPARK_RESPONSIVE_PRIMARY_NAV,
  TWIN_SPARK_RESPONSIVE_RAIL_ACTIONS,
  TWIN_SPARK_RESPONSIVE_VIEWPORTS,
} from '../src/site00/components/designBench/sparkResponsive/twinSparkResponsiveContent';
import {
  TWIN_OPUS_DIRECT_BOTTOM_NAV,
  TWIN_OPUS_DIRECT_CANDIDATES,
  TWIN_OPUS_DIRECT_CANDIDATE_ACTIONS,
  TWIN_OPUS_DIRECT_CONCEPT_TABS,
  TWIN_OPUS_DIRECT_HERO,
  TWIN_OPUS_DIRECT_OUTPUT_COLUMNS,
  TWIN_OPUS_DIRECT_PAPER_TEXTURE,
  TWIN_OPUS_DIRECT_PRIMARY_NAV,
  TWIN_OPUS_DIRECT_RAIL_ACTIONS,
  TWIN_OPUS_DIRECT_VIEWPORTS,
} from '../src/site00/components/designBench/opusDirect/twinOpusDirectContent';

const repoRoot = path.resolve(__dirname, '..');
const readRepo = (relative: string) => readFileSync(path.join(repoRoot, relative), 'utf8');

const css = readRepo('src/site00/styles/site00-twin-spark-responsive.css');
const screen = readRepo('src/site00/components/designBench/sparkResponsive/TwinSparkResponsiveScreen.tsx');
const page = readRepo('src/site00/pages/DesignTwinSparkResponsivePage.tsx');
const content = readRepo('src/site00/components/designBench/sparkResponsive/twinSparkResponsiveContent.ts');
const icons = readRepo('src/site00/components/designBench/sparkResponsive/TwinSparkResponsiveIcons.tsx');
const routeTable = readRepo('src/routes/Site00Routes.tsx');

describe('P0.VR.DESIGNBENCH.SPARK-RESPONSIVE-OPUSGROK1 — isolated route', () => {
  it('registers a dedicated responsive-bench route', () => {
    expect(SITE00_ROUTES.projectDesignTwinSparkResponsive).toBe(
      '/projects/:projectSlug/design/twin-spark-responsive',
    );
    expect(site00ProjectDesignTwinSparkResponsivePath('NDXBOOK')).toBe(
      '/projects/ndxbook/design/twin-spark-responsive',
    );
  });

  it('mounts the route without the CTRL ROOM account guard', () => {
    const start = routeTable.indexOf('SITE00_ROUTES.projectDesignTwinSparkResponsive');
    const block = routeTable.slice(start, routeTable.indexOf('<Route', start));
    expect(block).toContain('<DesignTwinSparkResponsivePage />');
    expect(block).not.toContain('Site00AccountRouteGuard');
  });

  it('never imports the read-only opus source (fork isolation)', () => {
    const importsOf = (source: string) =>
      (source.match(/^\s*import[\s\S]*?from\s+'[^']+';/gm) ?? []).join('\n');
    for (const token of [
      'opusDirect',
      'OpusDirect',
      'OPUS_DIRECT',
      'twin-opus-direct',
      'site00-twin-opus-direct',
    ]) {
      for (const source of [screen, page, content, icons]) {
        expect(importsOf(source)).not.toContain(token);
      }
    }
    expect(css).not.toContain('opusDirect');
    expect(css).not.toContain('twin-opus-direct');
  });

  it('uses its own tsr- style namespace throughout', () => {
    expect(css).toContain('--tsr-w: 768px');
    expect(css).toContain('--tsr-hero-w: 517.9px');
    expect(css).toContain('--tsr-rail-w: 202.1px');
    expect(css).not.toMatch(/\.tod-/);
    expect(screen).not.toContain('tod-');
  });

  it('carries the opus R2 border hierarchy and small-UI weight', () => {
    for (const token of [
      '--tsr-border-major: #a9a9a9',
      '--tsr-border-panel: #b2b2b2',
      '--tsr-border-column: #c4c4c4',
      '--tsr-border-subtle: #dadada',
      '--tsr-border-control: #b8b8b8',
      '--tsr-weight-ui: 500',
    ]) {
      expect(css).toContain(token);
    }
    expect(css).not.toContain('var(--tsr-line)');
    expect(css).not.toContain('var(--tsr-line-soft)');
  });
});

describe('P0.VR.DESIGNBENCH.SPARK-RESPONSIVE-OPUSGROK1 — content freeze parity', () => {
  it('carries byte-identical live copy from the opus source', () => {
    expect(TWIN_SPARK_RESPONSIVE_HERO).toEqual(TWIN_OPUS_DIRECT_HERO);
    expect(TWIN_SPARK_RESPONSIVE_PRIMARY_NAV).toEqual(TWIN_OPUS_DIRECT_PRIMARY_NAV);
    expect(TWIN_SPARK_RESPONSIVE_CONCEPT_TABS).toEqual(TWIN_OPUS_DIRECT_CONCEPT_TABS);
    expect(TWIN_SPARK_RESPONSIVE_OUTPUT_COLUMNS).toEqual(TWIN_OPUS_DIRECT_OUTPUT_COLUMNS);
    expect(TWIN_SPARK_RESPONSIVE_CANDIDATES).toEqual(TWIN_OPUS_DIRECT_CANDIDATES);
    expect(TWIN_SPARK_RESPONSIVE_CANDIDATE_ACTIONS).toEqual(TWIN_OPUS_DIRECT_CANDIDATE_ACTIONS);
    expect(TWIN_SPARK_RESPONSIVE_RAIL_ACTIONS).toEqual(TWIN_OPUS_DIRECT_RAIL_ACTIONS);
    expect(TWIN_SPARK_RESPONSIVE_BOTTOM_NAV).toEqual(TWIN_OPUS_DIRECT_BOTTOM_NAV);
    expect(TWIN_SPARK_RESPONSIVE_VIEWPORTS).toEqual(TWIN_OPUS_DIRECT_VIEWPORTS);
  });

  it('reuses the approved paper texture without regenerating assets', () => {
    expect(TWIN_SPARK_RESPONSIVE_PAPER_TEXTURE).toBe(TWIN_OPUS_DIRECT_PAPER_TEXTURE);
  });

  it('records the sprint lineage', () => {
    expect(TWIN_SPARK_RESPONSIVE_LINEAGE).toBe('P0.VR.DESIGNBENCH.SPARK-RESPONSIVE-OPUSGROK1');
  });
});

describe('P0.VR.DESIGNBENCH.SPARK-RESPONSIVE-OPUSGROK1 — viewport authorities', () => {
  it('defines mobile / tablet / desktop media layers', () => {
    expect(css).toContain('@media (max-width: 640px)');
    expect(css).toContain('@media (min-width: 641px) and (max-width: 1024px)');
    expect(css).toContain('@media (min-width: 1025px)');
  });

  it('drops the fixed artboard scale shell for natural page flow', () => {
    expect(screen).not.toContain('useFullBleedShell');
    expect(screen).not.toContain('scale(');
    expect(css).not.toContain('position: fixed;\n  inset: 0;\n  background: var(--tsr-paper)');
  });

  it('never references the golden master (no raster cheat)', () => {
    for (const source of [screen, page, css]) {
      expect(source).not.toContain('founder-r5f2-ndxbook');
      expect(source).not.toContain('mobile-master');
    }
    expect(screen).not.toMatch(/<iframe/i);
    expect(screen).not.toMatch(/<canvas/i);
  });
});

describe('P0.VR.DESIGNBENCH.SPARK-RESPONSIVE-OPUSGROK1 — accessibility parity', () => {
  it('keeps the source control semantics', () => {
    for (const token of [
      'aria-pressed',
      'aria-current',
      'aria-expanded',
      'role="tablist"',
      'role="tabpanel"',
      'aria-selected',
      'aria-label="Authority rail"',
    ]) {
      expect(screen).toContain(token);
    }
  });

  it('renders forked decorative svg hidden from the a11y tree', () => {
    const svgCount = (icons.match(/<svg/g) ?? []).length;
    const hiddenCount = (icons.match(/aria-hidden="true"/g) ?? []).length;
    expect(svgCount).toBeGreaterThan(20);
    expect(hiddenCount).toBe(svgCount);
  });
});
