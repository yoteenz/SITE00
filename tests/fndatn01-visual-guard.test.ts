/**
 * Geometry guard for copy-only FNDATN-01 edits.
 * Baseline styles and image URLs were captured from commit 80292bb2 (pre-editorial visual source,
 * identical email implementation to f71e403e). Text may change. Style attributes and assets may not,
 * except the two founder-approved removals recorded below.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fixtureContextFor, fixtureFor, renderFndatn01Email } from '../shared/site00-correspondence-studio/fndatn01/index.js';
import { FONT_BODY, FONT_DISPLAY } from '../shared/site00-correspondence-studio/fndatn01/html.js';
import type { Fndatn01EmailId } from '../shared/site00-correspondence-studio/fndatn01/pack.js';

const baseline = JSON.parse(readFileSync(new URL('./fixtures/fndatn01-visual-baseline.json', import.meta.url), 'utf8')) as Record<
  string,
  { styles: string[]; imgs: string[] }
>;

const ids = ['01', '02', '03', '04', '05', '06', '07'] as Fndatn01EmailId[];

/** Raw-URL caption anchor under the invitation CTA. Removed; the button href remains. */
const REMOVED_URL_CAPTION_STYLE = 'color:#7a766f;text-decoration:none;letter-spacing:.06em;text-transform:none';
/** Red highlight that only wrapped the word UNSUBSCRIBE in the old classification footer. */
const REMOVED_UNSUBSCRIBE_RED = 'color:#ce1017';

function styles(html: string): string[] {
  return [...html.matchAll(/style="([^"]*)"/g)].map((m) => m[1]);
}

function imgs(html: string): string[] {
  return [...html.matchAll(/(?:src|background)="([^"]+)"/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, ''));
}

function tally(arr: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const s of arr) m.set(s, (m.get(s) ?? 0) + 1);
  return m;
}

function review(id: Fndatn01EmailId) {
  return renderFndatn01Email(id, fixtureFor(id), {
    ...fixtureContextFor(id),
    mode: 'review',
    assetBase: '',
    founderAuthorized: true,
  });
}

describe('FNDATN-01 copy-only visual guard', () => {
  it('keeps the original font stack and does not swap in a generic design face', () => {
    expect(FONT_BODY.startsWith("'Saira Semi Condensed'")).toBe(true);
    expect(FONT_DISPLAY.startsWith("'SITE 00 Display'")).toBe(true);
    const r = review('01');
    if (!r.ok) throw new Error(r.eligibility.reasons.join());
    expect(r.html).toContain("font-family:'Saira Semi Condensed'");
    expect(r.html).toContain("font-family:'SITE 00 Display'");
    expect(r.html).toContain('saira-semi-condensed-latin-600.woff2');
    expect(r.html).toContain('site00-correspondence-display.woff2');
  });

  it('matches the pre-editorial style multiset except approved caption and unsubscribe removals', () => {
    for (const id of ids) {
      const r = review(id);
      if (!r.ok) throw new Error(`${id}: ${r.eligibility.reasons.join()}`);
      const before = tally(baseline[id].styles);
      const after = tally(styles(r.html));
      const added: string[] = [];
      const removed: string[] = [];
      for (const key of new Set([...before.keys(), ...after.keys()])) {
        const delta = (after.get(key) ?? 0) - (before.get(key) ?? 0);
        if (delta > 0) added.push(key);
        if (delta < 0) removed.push(`${-delta}×${key}`);
      }
      expect(added, `${id} added styles`).toEqual([]);
      const expectedRemoved =
        id === '01'
          ? [`2×${REMOVED_URL_CAPTION_STYLE}`, `2×${REMOVED_UNSUBSCRIBE_RED}`]
          : [`2×${REMOVED_UNSUBSCRIBE_RED}`];
      expect(removed.sort(), id).toEqual(expectedRemoved.sort());
      expect([...imgs(r.html)].sort(), id).toEqual(baseline[id].imgs);
    }
  });

  it('drops internal classification copy and the visible invitation URL', () => {
    for (const id of ids) {
      const r = review(id);
      if (!r.ok) throw new Error(id);
      expect(r.html).not.toContain('CLASSIFICATION');
      expect(r.html).not.toContain('SERVICE NOTICE');
      expect(r.html).not.toContain('TRANSACTIONAL ·');
      expect(r.html).toContain('BUILDING WHAT COMES NEXT.');
      expect(r.html).toContain('SITE00.COM');
    }
    const invite = review('01');
    if (!invite.ok) throw new Error('01');
    expect(invite.html).toContain('YOUR SECURE LINK IS IN THE BUTTON ABOVE.');
    expect(invite.html).not.toContain(REMOVED_URL_CAPTION_STYLE);
    expect(invite.subject).toBe('YOUR INVITATION TO BEGIN');
  });
});
