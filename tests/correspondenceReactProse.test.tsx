import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  CorrespondenceDisplay,
  CorrespondenceProse,
  correspondenceProseString,
} from '../shared/site00-correspondence-studio/reactProse.js';

describe('CorrespondenceProse (live pages)', () => {
  it('replaces prose commas with red mark images', () => {
    const html = renderToStaticMarkup(<CorrespondenceProse>DOMAIN, EMAIL</CorrespondenceProse>);
    expect(html).toContain('marks/comma.png');
    expect(html).not.toMatch(/>DOMAIN,/);
  });

  it('colors display punctuation red', () => {
    const html = renderToStaticMarkup(<CorrespondenceDisplay>FEEL, FORM</CorrespondenceDisplay>);
    expect(html).toContain('correspondence-display-mark');
    expect(html).toContain('#ce1017');
  });

  it('keeps thousands separators in numbers', () => {
    const nodes = correspondenceProseString('$1,334.00');
    const html = renderToStaticMarkup(<>{nodes}</>);
    expect(html).toContain('$1,334.00');
    expect(html).not.toContain('comma.png');
  });
});
