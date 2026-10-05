/**
 * P0.VR.DESIGN-VIEWMODE-ICON-REAPPLY1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.DESIGN-VIEWMODE-ICON-REAPPLY1', () => {
  it('uses approved Grok view-mode glyphs (not placeholder 16x16 SVGs)', () => {
    const control = read('src/site00/components/designBench/opusDirect/TwinOpusDirectViewModeControl.tsx');
    expect(control).toContain('DesignViewModeGrokIcon');
    expect(control).not.toContain('viewBox="0 0 16 16"');
    const icons = read('src/site00/components/designBench/opusDirect/designViewModeGrokIcons.tsx');
    expect(icons).toContain('GROK-VISUAL-SYSTEM1');
    expect(icons).toContain('data-dvs-viewmode-grok="1"');
    expect(icons).toContain('M4 9h8');
  });

  it('hides visible CANONICAL / LIST text; keeps accessible labels', () => {
    const control = read('src/site00/components/designBench/opusDirect/TwinOpusDirectViewModeControl.tsx');
    const a11y = read('src/site00/components/designBench/opusDirect/designViewModeGrokIcons.tsx');
    expect(a11y).toContain("canonical: 'Canonical view'");
    expect(a11y).toContain("list: 'List view'");
    expect(control).not.toContain('>{TWIN_OPUS_DIRECT_VIEW_MODE_LABELS[candidate]}<');
    const css = read('src/site00/styles/site00-twin-opus-direct.css');
    expect(css).toContain('.tod-viewmode__sr');
  });
});
