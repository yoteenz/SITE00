import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CorrespondenceProse, correspondenceProseString } from '../shared/site00-correspondence-studio/reactProse.js';

describe('CorrespondenceProse (live pages)', () => {
  it('replaces prose commas with red mark images', () => {
    const html = renderToStaticMarkup(<CorrespondenceProse>DOMAIN, EMAIL</CorrespondenceProse>);
    expect(html).toContain('marks/comma.png');
    expect(html).not.toMatch(/>DOMAIN,/);
  });

  it('keeps thousands separators in numbers', () => {
    const nodes = correspondenceProseString('$1,334.00');
    const html = renderToStaticMarkup(<>{nodes}</>);
    expect(html).toContain('$1,334.00');
    expect(html).not.toContain('comma.png');
  });
});
