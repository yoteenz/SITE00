import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(__dirname, '..');

describe('BLDR spatial studio reference fidelity assets', () => {
  it('uses canonical SITE 00 red and shared icon/thumb components', () => {
    const css = readFileSync(path.join(root, 'src/site00/styles/site00-builder-spatial-studio.css'), 'utf8');
    expect(css).toContain('--bldr-red: #e50107');
    expect(css).not.toContain('#c41e24');
    const page = readFileSync(path.join(root, 'src/site00/pages/bldr/BldrSpatialStudioPage.tsx'), 'utf8');
    expect(page).toContain('ArchitecturalThumb');
    expect(page).toContain('BldrStudioIcon');
    const icons = readFileSync(path.join(root, 'src/site00/components/bldr/spatial-studio/BldrStudioIcon.tsx'), 'utf8');
    expect(icons).toContain("strokeWidth: 1.4");
  });
});