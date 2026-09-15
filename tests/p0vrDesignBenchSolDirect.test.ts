import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SITE00_ROUTES } from '../src/site00/config/routes';

const root = process.cwd();
const pageSource = readFileSync(join(root, 'src/site00/pages/NdxbookSolDirectPage.tsx'), 'utf8');
const cssSource = readFileSync(join(root, 'src/site00/styles/site00-ndxbook-sol-direct.css'), 'utf8');
const routerSource = readFileSync(join(root, 'src/routes/Site00Routes.tsx'), 'utf8');

describe('P0.VR.DESIGNBENCH.SOL-DIRECT1', () => {
  it('registers the isolated direct reconstruction route', () => {
    expect(SITE00_ROUTES.projectDesignTwinSolDirect).toBe('/projects/:projectSlug/design/twin-sol-direct');
    expect(routerSource).toContain('path={SITE00_ROUTES.projectDesignTwinSolDirect}');
    expect(routerSource).toContain('<NdxbookSolDirectPage />');
  });

  it('uses a dedicated React page and scoped CSS implementation', () => {
    expect(pageSource).toContain('data-testid="ndxbook-sol-direct"');
    expect(pageSource).toContain('CONCEPT CANDIDATE GALLERY');
    expect(pageSource).toContain('STRUCTURED OUTPUT REVIEW');
    expect(pageSource).toContain('PIPELINE / READINESS');
    expect(cssSource).toContain('.sol-main-stage');
    expect(cssSource).toContain('grid-template-columns: 386px 150px');
  });

  it('does not rasterize the supplied golden reference', () => {
    expect(pageSource).not.toContain('01a0a6e4-5d78-78a0-9429-5c8691380acf');
    expect(pageSource).not.toContain('01a0a719-5252-7a5d-9c44-2033071cb0d8');
    expect(pageSource).not.toContain('mobile-master.jpg');
    expect(cssSource).not.toMatch(/background(?:-image)?:\s*url\(/);
    expect(pageSource).not.toContain('<canvas');
  });

  it('keeps Sol structural geometry frozen while using reconstructed plates', () => {
    expect(cssSource).toContain('height: 305px');
    expect(cssSource).toContain('grid-template-columns: 386px 150px');
    expect(cssSource).toContain('height: 147px');
    expect(cssSource).toContain('height: 142px');
    expect(cssSource).toContain('height: 113px');
    expect(pageSource).toContain('/site00/twin-sol-direct/sol-hand-plate.jpg');
    expect(pageSource).toContain('/site00/twin-sol-direct/sol-blueprint.jpg');
    expect(pageSource).not.toContain('ndx-entry-002-pre-sba-ndx-hands-001.jpg');
    expect(pageSource).not.toContain('sol-hand-silhouette');
  });

  it('uses reference-traced SVG marks instead of generic unicode icons', () => {
    expect(pageSource).toContain('function Mark');
    expect(pageSource).toContain('name="sliders"');
    expect(pageSource).toContain('name="target"');
    expect(pageSource).toContain('name="expand"');
    expect(pageSource).toContain('name="lock"');
    expect(pageSource).toContain('name="gridFill"');
    expect(pageSource).toContain('name="clock"');
    expect(pageSource).toContain('name="bolt"');
    expect(pageSource).toContain('name="file"');
    expect(pageSource).not.toContain('☰');
    expect(pageSource).not.toContain('☷');
    expect(pageSource).not.toContain('▦');
    expect(pageSource).not.toContain('ϟ');
    expect(cssSource).toContain('grid-template-columns: 386px 150px');
  });

  it('inventories every golden icon slot with a live data-slot', () => {
    const slots = [
      'A1-hamburger', 'A2-crumb-1', 'A3-crumb-2', 'A4-compiler-dot', 'A5-overflow-dots', 'A6-more-caret', 'A7-context-dot',
      'B1-mobile', 'B2-tablet', 'B3-desktop', 'B4-mobile-underline', 'B5-authority-lock',
      'C1-select-check', 'C2-pair-caret', 'C3-lock-pair', 'C4-hero-evidence', 'C5-card-check',
      'D1-compare-sliders', 'D2-gallery-next',
      'E1-refine', 'E2-regenerate', 'E3-inspect', 'E4-fullscreen',
      'F1-grounding-file', 'F2-blueprint-file', 'F3-overlay-file', 'F4-assets-file', 'F5-function-file',
      'G1-ready-ring', 'G2-compiles-dot', 'G3-check-layout', 'G4-check-type', 'G5-check-assets', 'G6-check-function', 'G7-check-a11y',
      'G8-status-approved', 'G9-status-pending', 'G10-status-blockers', 'G11-status-warnings',
      'H1-tab-grabber',
      'I1-workspace', 'I2-design-history', 'I3-feature-change', 'I4-master-amendment', 'I5-contextual-next',
    ];
    expect(slots).toHaveLength(45);
    for (const slot of slots) {
      const present = pageSource.includes(`data-slot="${slot}"`) || pageSource.includes(`slot="${slot}"`) || pageSource.includes(`'${slot}'`);
      expect(present, slot).toBe(true);
    }
    expect(pageSource).toContain('name="file"');
    expect(pageSource).toContain('name="gridFill"');
    expect(pageSource).toContain('G8-status-approved');
  });
});
