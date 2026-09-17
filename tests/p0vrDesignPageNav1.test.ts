/**
 * P0.VR.DESIGN-PAGE-NAV1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { buildDesignPageTree } from '../src/site00/components/designBench/production/buildDesignPageTree';
import { buildProjectDesignPageRegistry } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.DESIGN-PAGE-NAV1', () => {
  it('context bar uses page-tree navigator instead of creative context CTA', () => {
    const screen = read('src/site00/components/designBench/opusDirect/TwinOpusDirectScreen.tsx');
    expect(screen).toContain('DesignPageTreeNavigator');
    expect(screen).not.toContain('openCreativeContext()');
    expect(screen).not.toContain('PROJECT CREATIVE CONTEXT');
  });

  it('project creative context relocated to overflow and MORE', () => {
    const overlays = read('src/site00/components/designBench/opusDirect/TwinOpusDirectOverlays.tsx');
    expect(overlays).toContain('PROJECT CREATIVE CONTEXT');
    expect(overlays).toContain('openCreativeContext');
    const more = read('src/site00/components/designBench/production/DesignProductionSections.tsx');
    expect(more).toContain('PROJECT CREATIVE CONTEXT');
  });

  it('NDXBOOK registry builds a multi-level page tree', () => {
    const registry = buildProjectDesignPageRegistry('ndxbook');
    const tree = buildDesignPageTree(registry);
    expect(tree.length).toBeGreaterThan(0);
    const contentOps = tree.find((n) => n.page.screenId === 'content-ops');
    expect(contentOps?.children.some((c) => c.page.screenId === 'campaign-board')).toBe(true);
  });

  it('page tree navigator has accessibility hooks', () => {
    const nav = read('src/site00/components/designBench/production/DesignPageTreeNavigator.tsx');
    expect(nav).toContain('aria-expanded');
    expect(nav).toContain('data-testid="design-page-tree-nav"');
  });
});
