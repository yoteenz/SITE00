import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const clientCss = readFileSync(new URL('../src/site00/styles/site00-df-client.css', import.meta.url), 'utf8');

describe('Digital Foundation crown text reflow (text-only)', () => {
  it('reserves artwork band via CSS variables without changing crown object geometry selectors', () => {
    expect(clientCss).toContain('--df-crown-art-band: min(46%, 230px)');
    expect(clientCss).toContain('--df-crown-text-max: calc(100% - var(--df-crown-art-band) - var(--df-crown-text-gap))');
    expect(clientCss).toMatch(/\.df-screen--crown \.df-lede[\s\S]*max-width: min\(var\(--df-crown-text-max\)/);
    expect(clientCss).toMatch(/\.df-screen--crown \.df-headline[\s\S]*max-width: var\(--df-crown-text-max\)/);
  });

  it('keeps crown artwork container rules intact (position/size unchanged in contract)', () => {
    const crownBlock = clientCss.match(/\.df-object--crown \{[^}]+\}/)?.[0] ?? '';
    expect(crownBlock).toContain('position: absolute');
    expect(crownBlock).toContain('width: 46%');
    expect(crownBlock).toContain('max-width: 230px');
    expect(crownBlock).toContain('height: 340px');
    expect(crownBlock).not.toContain('display: none');
  });

  it('scopes review nav overflow to review shell only', () => {
    expect(clientCss).toMatch(/\.df-review \{[\s\S]*overflow-x: clip/);
    expect(clientCss).toMatch(/\.df-review__nav \.df-review__direct[\s\S]*text-overflow: ellipsis/);
    expect(clientCss).not.toMatch(/body\s*\{[^}]*overflow-x:\s*hidden/);
  });

  it('keeps crown lede width in design review (does not restore 310px on crown screens)', () => {
    expect(clientCss).toMatch(/\.df-review \.df-screen--crown \.df-lede[\s\S]*var\(--df-crown-text-max\)/);
  });
});
