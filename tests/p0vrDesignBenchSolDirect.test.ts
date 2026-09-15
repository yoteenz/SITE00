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
});
