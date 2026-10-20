import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const clientCss = readFileSync(new URL('../src/site00/styles/site00-df-client.css', import.meta.url), 'utf8');
const componentsCss = readFileSync(new URL('../src/site00/styles/site00-df-components.css', import.meta.url), 'utf8');

describe('Digital Foundation global typographic reflow', () => {
  it('preserves parent crown text-max contract', () => {
    expect(clientCss).toContain(
      '--df-crown-text-max: calc(100% + var(--df-gutter) - var(--df-crown-art-w) * 156 / 180 - var(--df-crown-text-gap))',
    );
    const crownBlock = clientCss.match(/\.df-object--crown \{[^}]+\}/)?.[0] ?? '';
    expect(crownBlock).toContain('position: absolute');
    expect(crownBlock).toContain('max-width: 230px');
  });

  it('applies balance to display headings and pretty to body scope', () => {
    expect(clientCss).toMatch(/\.df-headline \{[\s\S]*gap:\s*1px/);
    expect(clientCss).toMatch(/\.df-headline \{[\s\S]*text-wrap: balance/);
    expect(clientCss).toMatch(/:is\(\.df-root, \.df-drawer, \.df-portal\) \{[\s\S]*text-wrap: pretty/);
    expect(clientCss).toMatch(/\.df-lede \{[\s\S]*text-wrap: pretty/);
  });

  it('refines card and row text columns without changing grid geometry', () => {
    expect(clientCss).toMatch(/\.df-spec__btn \{[\s\S]*grid-template-columns: 30px minmax\(0, 1fr\) 136px auto/);
    expect(clientCss).toMatch(/\.df-spec__text[\s\S]*min-width: 0/);
    expect(clientCss).toMatch(/\.df-addon__main[\s\S]*min-width: 0/);
    expect(clientCss).toMatch(/\.df-row__title[\s\S]*text-wrap: balance/);
    expect(clientCss).toMatch(/\.df-addon__price[\s\S]*white-space: nowrap/);
  });

  it('extends form hints in component sheet', () => {
    expect(componentsCss).toMatch(/\.df-field__label[\s\S]*text-wrap: balance/);
    expect(componentsCss).toMatch(/\.df-field__hint[\s\S]*text-wrap: pretty/);
  });
});
