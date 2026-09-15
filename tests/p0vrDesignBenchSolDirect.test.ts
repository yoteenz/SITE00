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
    expect(cssSource).toContain('grid-template-columns: 387px 150px');
  });

  it('locks the measured 572 by 1024 structural geometry and golden copy', () => {
    expect(cssSource).toContain('grid-template-columns: 52px 102px 85px 78px 71px 86px 98px');
    expect(cssSource).toContain('grid-template-columns: 113px 109px 109px 103px 110px');
    expect(cssSource).toContain('grid-template-columns: 122px 123px 117px 1fr');
    expect(cssSource).toContain('grid-template-columns: 109px 115px 115px 116px 117px');
    expect(pageSource).toContain('POSITION MAP');
    expect(pageSource).toContain('F06_VERIFICATION');
    expect(pageSource).toContain('warn={i === 3}');
    expect(cssSource).toContain('.sol-review-art.functions { padding: 5px 6px; border: 1px solid #999;');
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
    expect(cssSource).toContain('grid-template-columns: 387px 150px');
    expect(cssSource).toContain('height: 145px');
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
    expect(pageSource).toContain('name="grid"');
    expect(pageSource).toContain('name="clock"');
    expect(pageSource).toContain('name="bolt"');
    expect(pageSource).not.toContain('☰');
    expect(pageSource).not.toContain('☷');
    expect(pageSource).not.toContain('▦');
    expect(pageSource).not.toContain('ϟ');
    expect(cssSource).toContain('grid-template-columns: 387px 150px');
  });
});
