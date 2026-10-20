import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DfHeadline, normalizeDfHeadlineLine } from '../src/site00/foundation-client/shell';

describe('DfHeadline terminal mark', () => {
  it('strips trailing period from last line before render', () => {
    expect(normalizeDfHeadlineLine('SHAPE.', true)).toBe('SHAPE');
    expect(normalizeDfHeadlineLine('SHAPE.', false)).toBe('SHAPE.');
  });

  it('renders one system terminal mark when copy included a trailing period', () => {
    const html = renderToStaticMarkup(
      createElement(DfHeadline, { lines: ['YOUR FOUNDATION', 'IS TAKING', 'SHAPE.'] }),
    );
    expect(html.match(/df-headline__period/g)?.length).toBe(1);
    expect(html.match(/correspondence-display-mark/g)?.length ?? 0).toBe(0);
  });
});
