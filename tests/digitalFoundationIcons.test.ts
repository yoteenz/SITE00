import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DF_ICON_CATALOG, DF_ICON_FAMILIES, DF_ICON_LEGACY_EXTRAS } from '../src/site00/foundation-client/icons/meta';
import { DF_ICON_GLYPHS } from '../src/site00/foundation-client/icons/glyphs';
import { resolveDfIconId } from '../src/site00/foundation-client/icons';

describe('Digital Foundation icon registry', () => {
  it('covers sixteen families and every catalog glyph', () => {
    expect(DF_ICON_FAMILIES).toHaveLength(16);
    for (const icon of [...DF_ICON_CATALOG, ...DF_ICON_LEGACY_EXTRAS]) {
      expect(DF_ICON_GLYPHS[icon.id], icon.id).toBeTruthy();
      expect(resolveDfIconId(icon.id)).toBe(icon.id);
      for (const alias of icon.aliases ?? []) expect(resolveDfIconId(alias)).toBe(icon.id);
    }
  });

  it('keeps legacy screen names working', () => {
    expect(resolveDfIconId('globe')).toBe('domain');
    expect(resolveDfIconId('envelope')).toBe('email');
    expect(resolveDfIconId('phone')).toBe('device');
    expect(resolveDfIconId('shield')).toBe('security');
    expect(resolveDfIconId('alert')).toBe('warning');
    expect(resolveDfIconId('layers')).toBe('addons');
  });

  it('uses the canonical SITE 00 red for unread and alert badges', () => {
    expect(DF_ICON_GLYPHS.unread).toContain('#E50107');
    expect(DF_ICON_GLYPHS.commAlert).toContain('#E50107');
  });

  it('does not replace the approved hamburger asset', () => {
    const shell = readFileSync(new URL('../src/site00/foundation-client/shell.tsx', import.meta.url), 'utf8');
    expect(shell).toContain('menu-icon.png');
    expect(shell).not.toContain('name="menu"');
  });

  it('uses the asset-sheet 0.6 stroke instead of the 0.15 hairline', () => {
    const icons = readFileSync(new URL('../src/site00/foundation-client/icons.tsx', import.meta.url), 'utf8');
    const css = readFileSync(new URL('../src/site00/styles/site00-df-client.css', import.meta.url), 'utf8');
    expect(icons).toContain('DF_ICON_STROKE = 0.6');
    expect(css).not.toContain('stroke-width: 0.15');
    expect(css).toContain('stroke-width: 0.6');
  });
});
