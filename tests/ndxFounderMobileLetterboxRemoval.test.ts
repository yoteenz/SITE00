/**
 * NDX founder mobile — remove gray ecosystem letterbox gutters.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

function readCss(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), 'utf8');
}

describe('ndx founder mobile letterbox removal', () => {
  it('zeros ecosystem mobile shell horizontal padding for founder takeover', () => {
    const css = readCss('src/site00/styles/site00-founder-workspace.css');
    expect(css).toMatch(
      /\.site00-ecosystem-shell--ndx-founder-mobile \.site00-mobile-shell__main[\s\S]*?padding-inline: 0/,
    );
    expect(css).toMatch(
      /\.site00-ecosystem-shell--ndx-founder-mobile \.site00-ecosystem-mobile-shell[\s\S]*?background-color: var\(--ndx-paper/,
    );
  });

  it('uses fluid content shell and campaign card widths', () => {
    const css = readCss('src/site00/styles/site00-founder-workspace.css');
    expect(css).toMatch(/\.site00-fws-mobile-content-shell[\s\S]*?max-width: 100%/);
    expect(css).toMatch(
      /\.site00-fws-mobile-chrome--visual-spec \.site00-fws-mobile-campaign__page-card[\s\S]*?72vw/,
    );
  });
});
