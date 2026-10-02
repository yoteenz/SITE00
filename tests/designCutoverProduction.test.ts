import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { productionNavHref } from '../src/site00/components/productionHub/nav';

const ROOT = join(import.meta.dirname, '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

describe('P0 design cutover — routing and shell', () => {
  it('production DESIGN nav href targets canonical /design', () => {
    expect(productionNavHref('design', 'ndxbook')).toBe('/production/ndxbook/design');
  });

  it('registers canonical design route and legacy alias redirect', () => {
    const routes = read('src/routes/Site00Routes.tsx');
    expect(routes).toContain('ProductionCanonicalDesignRoute');
    expect(routes).toContain('ProductionDesignWorkspaceAliasRedirect');
    expect(routes).toContain('path="design/*"');
    expect(routes).toContain('path="design-workspace"');
    expect(routes).toContain('path="design-legacy/*"');
  });

  it('unified workspace hides duplicate footer when productionShell', () => {
    const dws = read('src/site00/components/designUnified/DesignUnifiedWorkspace.tsx');
    expect(dws).toContain('productionShell');
    expect(dws).toContain('dws--production-shell');
    expect(dws).toContain('data-testid="dws-footnav"');
    expect(dws).toContain('productionShell ?');
  });

  it('production layout uses chrome overlay host for canonical design', () => {
    const layout = read('src/site00/pages/production/ProductionWorkspaceProjectHubPage.tsx');
    expect(layout).toContain('production-design-host');
    expect(layout).toContain('ProductionChromeOverlay');
    expect(layout).toContain('isCanonicalDesign');
  });

  it('legacy design sections redirect to canonical design', () => {
    const gate = read('src/site00/pages/production/ProductionCanonicalDesignRoute.tsx');
    expect(gate).toContain('references');
    expect(gate).toContain('site00ProductionDesignPath');
  });

  it('migration matrix documents legacy vs new mapping', () => {
    const doc = read('docs/studio-os/design-cutover-migration-matrix.md');
    expect(doc).toContain('design-legacy');
    expect(doc).toContain('COMPILER');
  });
});
