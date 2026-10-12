import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CORRESPONDENCE_RED } from '../shared/site00-correspondence-studio/reactProse.js';

const root = path.resolve(__dirname, '..');

describe('BLDR spatial studio reference fidelity assets', () => {
  it('uses correspondence-aligned SITE 00 red and hybrid studio icon/thumb components', () => {
    const css = readFileSync(path.join(root, 'src/site00/styles/site00-builder-studio.css'), 'utf8');
    expect(css).toContain(`--bs-red: ${CORRESPONDENCE_RED}`);
    expect(css).not.toContain('#c41e24');
    const page = readFileSync(path.join(root, 'src/site00/pages/bldr/BldrSpatialStudioPage.tsx'), 'utf8');
    expect(page).toContain('BuilderStudio');
    expect(page).toContain('site00-builder-studio.css');
    const icons = readFileSync(path.join(root, 'src/site00/builder-studio/icons.tsx'), 'utf8');
    expect(icons).toContain('strokeWidth={1.4}');
    const thumb = readFileSync(path.join(root, 'src/site00/builder-studio/buildObject/BuildObjectStage.tsx'), 'utf8');
    expect(thumb).toContain('BuildThumbnail');
  });
});
