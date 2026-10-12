import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  CorrespondenceDisplay,
  CorrespondenceDisplayLine,
  CorrespondenceProse,
  correspondenceProseString,
  displayLineEndsWithSplitMark,
} from '../shared/site00-correspondence-studio/reactProse.js';

describe('CorrespondenceProse (live pages)', () => {
  it('replaces prose commas with red mark images', () => {
    const html = renderToStaticMarkup(<CorrespondenceProse>DOMAIN, EMAIL</CorrespondenceProse>);
    expect(html).toContain('marks/comma.png');
    expect(html).not.toMatch(/>DOMAIN,/);
  });

  it('treats ? and ! as terminal split marks (no extra period)', () => {
    expect(displayLineEndsWithSplitMark('IT FEEL?')).toBe(true);
    expect(displayLineEndsWithSplitMark('YOUR BLUEPRINT')).toBe(false);
    const html = renderToStaticMarkup(<CorrespondenceDisplayLine line="IT FEEL?" />);
    expect(html).toContain('correspondence-split-mark');
    expect(html).not.toContain('correspondence-split-mark__top">?</span></span><span class="bs-dot');
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
