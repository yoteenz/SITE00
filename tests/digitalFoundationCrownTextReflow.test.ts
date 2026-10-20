import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const clientCss = readFileSync(new URL('../src/site00/styles/site00-df-client.css', import.meta.url), 'utf8');

describe('Digital Foundation crown text reflow (text-only)', () => {
  it('derives each crown text role from the drawn edge of the locked artwork, not its box', () => {
    // Drawn width of the 180×320 meet SVG inside the locked 46% / 230px / 340px phone box.
    expect(clientCss).toContain('--df-crown-art-w: min(calc((100% + 2 * var(--df-gutter)) * 0.46), 230px, calc(340px * 9 / 16))');
    // Rail beside the stone side (x 52), headline beside the beam (x 24), lede beside the glass pane (x 36).
    expect(clientCss).toContain(
      '--df-crown-rail-max: calc(100% + var(--df-gutter) - var(--df-crown-art-w) * 128 / 180 - var(--df-crown-text-gap))',
    );
    expect(clientCss).toContain(
      '--df-crown-text-max: calc(100% + var(--df-gutter) - var(--df-crown-art-w) * 156 / 180 - var(--df-crown-text-gap))',
    );
    expect(clientCss).toContain(
      '--df-crown-lede-max: calc(100% + var(--df-gutter) - var(--df-crown-art-w) * 144 / 180 - var(--df-crown-text-gap))',
    );
    expect(clientCss).toMatch(/\.df-screen--crown \.df-lede \{[^}]*max-width: min\(var\(--df-crown-lede-max\), 100%\)/);
    expect(clientCss).toMatch(/\.df-screen--crown \.df-headline \{[^}]*max-width: var\(--df-crown-text-max\)/);
    expect(clientCss).toMatch(/\.df-screen--crown \.df-rail \{[^}]*max-width: var\(--df-crown-rail-max\)/);
    expect(clientCss).not.toContain('--df-crown-art-band');
  });

  it('keeps the tablet text contract on the tablet artwork box', () => {
    const tablet = clientCss.slice(clientCss.indexOf('@media (min-width: 768px)'), clientCss.indexOf('@media (min-width: 1100px)'));
    expect(tablet).toContain('--df-crown-art-w: min(calc((100% + 2 * var(--df-gutter)) * 0.44), 300px, calc(440px * 9 / 16))');
    const box = tablet.match(/\.df-object--crown \{[^}]+\}/)?.[0] ?? '';
    expect(box).toContain('width: 44%');
    expect(box).toContain('max-width: 300px');
    expect(box).toContain('height: 440px');
  });

  it('lets a long rail label take length from the rule before it reaches the artwork', () => {
    expect(clientCss).toMatch(/\.df-screen--crown \.df-rail__rule \{[^}]*flex: 0 100 76px;[^}]*min-width: 16px/);
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
    expect(clientCss).toMatch(/\.df-review \.df-screen--crown \.df-lede \{[^}]*var\(--df-crown-lede-max\)/);
    // Review frames are 390px phones at every viewport: they keep the phone artwork contract.
    expect(clientCss).toContain('.df-screen--crown,\n.df-review .df-screen--crown {');
  });

  it('keeps a figure and its unit together in the P01 lede without a manual break', () => {
    expect(clientCss).toMatch(/\.df-lede__keep \{[^}]*display: inline-block;[^}]*max-width: 100%/);
    expect(clientCss).not.toMatch(/\.df-lede__keep \{[^}]*nowrap/);
    const entry = readFileSync(new URL('../src/site00/foundation-client/parents/EntryIntake.tsx', import.meta.url), 'utf8');
    expect(entry).toContain('<span className="df-lede__keep">TYPICALLY {days} BUSINESS DAYS.</span>');
    expect(entry.slice(entry.indexOf('<DfLede>'), entry.indexOf('</DfLede>'))).not.toContain('<br');
  });
});
