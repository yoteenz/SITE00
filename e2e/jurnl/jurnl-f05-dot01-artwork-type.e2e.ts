/**
 * P0.JURNL.F05-MONEY.DOT01.INTERACTIVE-ARTWORK-COMPOSITION-AND-AUTHORITY-ASSET-MOUNT-CORRECTION.OPUS3A and
 * P0.JURNL.F05-MONEY.DOT01.AUTHORITY-TYPOGRAPHY-PARCHMENT-GEOMETRY-AND-TEXT-CONTAINMENT.OPUS3B — in the browser:
 * the DOT 01 actions are the SIDEKICK's own illustrated pills (never a CSS rounded rectangle), 06's ADD ACCOUNT /
 * REORDER ACCOUNTS are the authority's composed papers, every overlay title stays inside its paper's text-safe zone,
 * RECORD TRANSACTION (16) carries its wide title paper, labels stay inside their papers and off their icons, and the
 * page never scrolls.
 */
import { expect, test, type Page } from '@playwright/test';
import { dot01World } from './helpers/jurnl-dot01-world';
import { bootstrapJurnl, clickTrigger, gotoJurnl, trigger } from './helpers/jurnl-page';

async function open(page: Page, route: string) {
  await page.addInitScript(() => sessionStorage.setItem('jurnl.f05.parent', 'motion'));
  await bootstrapJurnl(page, dot01World() as Parameters<typeof bootstrapJurnl>[1]);
  await gotoJurnl(page, route);
  await page.locator('[data-jrn-f05-dot01-stage]').first().waitFor({ state: 'attached', timeout: 30_000 });
}
const overlay = (page: Page, id: string) => page.locator(`[data-jrn-overlay="${id}"]`);
const pageScroll = (page: Page) => page.evaluate(() => ({ y: document.documentElement.scrollHeight > innerHeight + 1, x: document.documentElement.scrollWidth > innerWidth + 1 }));

/** Each title line's ink box against the heading's text-safe box and the visible board. */
const titleFit = (page: Page, id: string) =>
  page.evaluate((id) => {
    const ov = document.querySelector(`[data-jrn-overlay="${id}"]`)!;
    const headEl = ov.querySelector<HTMLElement>('.jrn-d01__heading')!;
    const head = headEl.getBoundingClientRect();
    // the em box of an all-caps line carries ≈ 0.16 em of empty ascent above the caps: a line is out when its caps are
    const em = parseFloat(getComputedStyle(ov.querySelector('.jrn-d01__title')!).fontSize) * (head.width / headEl.offsetWidth);
    const lines = [...ov.querySelectorAll('.jrn-d01__title > span')].map((s) => {
      const r = document.createRange();
      r.selectNodeContents(s);
      const b = r.getBoundingClientRect();
      return { text: s.textContent, l: b.left, r: b.right, t: b.top, b: b.bottom };
    });
    const out = lines.filter((b) => b.l < head.left - 1 || b.r > head.right + 1 || b.t < head.top - em * 0.16 || b.b > head.bottom + em * 0.06).map((b) => b.text);
    return { lines: lines.length, out };
  }, id);

/** Every visible DOT 01 action: its surface source, whether its label stays between the pill's caps and off its icon. */
const actions = (page: Page, scope: string) =>
  page.evaluate((scope) => {
    const root = document.querySelector(scope) ?? document;
    return [...root.querySelectorAll<HTMLElement>('.d01-btn')].filter((b) => b.offsetParent !== null && b.getBoundingClientRect().width > 4).map((b) => {
      const cs = getComputedStyle(b);
      const box = b.getBoundingClientRect();
      const capL = parseFloat(cs.borderLeftWidth);
      const capR = parseFloat(cs.borderRightWidth);
      const text = [...b.childNodes].filter((n) => n.nodeType === 3 && n.textContent!.trim()).map((n) => {
        const r = document.createRange();
        r.selectNodeContents(n);
        return r.getBoundingClientRect();
      });
      const icon = b.querySelector('svg, img')?.getBoundingClientRect();
      const inside = text.every((t) => t.left >= box.left + capL - 1 && t.right <= box.right - capR + 1 && t.top >= box.top - 1 && t.bottom <= box.bottom + 1);
      const collide = !!icon && text.some((t) => Math.min(icon.right, t.right) - Math.max(icon.left, t.left) > 1 && Math.min(icon.bottom, t.bottom) - Math.max(icon.top, t.top) > 1);
      return { trigger: b.getAttribute('data-jrn-trigger'), surface: cs.borderImageSource, danger: b.classList.contains('d01-btn--danger'), radius: cs.borderTopLeftRadius, h: box.height, inside, collide, overflow: b.scrollWidth > b.clientWidth + 1 };
    });
  }, scope);

test.describe('OPUS3B · RECORD TRANSACTION (16) — wide title paper, text-safe title, authority type', () => {
  test('R1 · the wide torn banner carries the title; both lines sit inside its text-safe zone; the bank seal is over it', async ({ page }) => {
    await open(page, 'money/places/bank/history');
    await clickTrigger(page, 'd01-record');
    const ov = overlay(page, 'd01-record');
    await expect(ov).toBeVisible();
    await expect(ov.locator('[data-heading="wide"]')).toHaveCount(1);
    const paper = ov.locator('[data-layer-id="heading_paper_wide"]');
    await expect(paper).toHaveCount(1);
    expect(await paper.getAttribute('src')).toMatch(/F05_DOT01_12_WIDE_TORN_BANNER/);
    await expect(paper).toHaveAttribute('aria-hidden', 'true');
    // the seal is drawn after (over) the banner, as the authority stacks it
    const order = await ov.evaluate((el) => [...el.querySelectorAll('[data-layer="L1"]')].map((e) => e.getAttribute('data-layer-id')));
    const sealAt = order.findIndex((id) => !!id && id.startsWith('seal'));
    expect(sealAt).toBeGreaterThan(order.indexOf('heading_paper_wide'));
    // 16's own seal (the bank temple, lifted from authority 16)
    expect(await ov.locator('[data-layer-id^="seal"]').first().getAttribute('src')).toMatch(/F05_DOT01_SEAL_16/);
    const fit = await titleFit(page, 'd01-record');
    expect(fit.lines).toBe(2);
    expect(fit.out).toEqual([]);
    // the heading's safe zone lies inside the drawn paper
    const [hb, pb] = await Promise.all([ov.locator('.jrn-d01__heading').boundingBox(), paper.boundingBox()]);
    expect(hb!.x).toBeGreaterThanOrEqual(pb!.x);
    expect(hb!.x + hb!.width).toBeLessThanOrEqual(pb!.x + pb!.width);
    expect(hb!.y).toBeGreaterThanOrEqual(pb!.y);
    expect(hb!.y + hb!.height).toBeLessThanOrEqual(pb!.y + pb!.height);
    expect(await pageScroll(page)).toEqual({ y: false, x: false });
  });

  test('R2 · SCAN RECEIPT / MANUAL ENTRY / RECORD TRANSACTION are the SK03 pills; labels between the caps and off the icons; the form still records', async ({ page }) => {
    await open(page, 'money/places/bank/history');
    await clickTrigger(page, 'd01-record');
    const list = await actions(page, '[data-jrn-overlay="d01-record"]');
    const by = Object.fromEntries(list.map((a) => [a.trigger, a]));
    expect(by['d01-scan-receipt']!.surface).toMatch(/F05_DOT01_PILL_SK03_DARK/);
    expect(by['d01-manual-entry']!.surface).toMatch(/F05_DOT01_PILL_SK03_CREAM/);
    expect(by['d01-review-save']!.surface).toMatch(/F05_DOT01_PILL_SK03_DARK/);
    for (const a of list) {
      expect(a.inside, `${a.trigger} label inside`).toBe(true);
      expect(a.collide, `${a.trigger} icon/text`).toBe(false);
      expect(a.overflow, `${a.trigger} overflow`).toBe(false);
      expect(a.h, `${a.trigger} target`).toBeGreaterThanOrEqual(44);
    }
    // SCAN RECEIPT is the taller primary pill of the pair (authority 16: 99 vs 82 board px)
    expect(by['d01-scan-receipt']!.h).toBeGreaterThan(by['d01-manual-entry']!.h);
    // real form behaviour is unchanged
    await trigger(page, 'd01-merchant').fill('BAKERY');
    await trigger(page, 'd01-amount').fill('9.50');
    await clickTrigger(page, 'd01-category');
    await page.locator('[data-jrn-listbox="d01-category"] [data-jrn-option="FOOD"]').click();
    const save = trigger(page, 'd01-review-save');
    await save.scrollIntoViewIfNeeded();
    await save.click();
    await expect(overlay(page, 'd01-transaction-review')).toBeVisible();
    expect(await pageScroll(page)).toEqual({ y: false, x: false });
  });
});

test.describe('OPUS3B · every overlay title stays inside its heading paper', () => {
  // the last field: the screen's own lifted seal (null = the authority draws the SIDEKICK's laurel seal)
  const cases: [string, string, string, string, string | null][] = [
    ['14 ADD ACCOUNT', 'money/places', 'd01-add-account', 'd01-add-account', null],
    ['15 EDIT ACCOUNT', 'money/places/bank/settings', 'd01-rename', 'd01-edit-account', null],
    ['20 RECORD CARD PAYMENT', 'money/places/visa', 'd01-strip-pay', 'd01-card-payment', '20'],
    ['21 ACCOUNT PURPOSES', 'money/places/bank/settings', 'd01-purposes', 'd01-purposes', '21'],
    ['24 CORRECT TRANSACTION', 'money/entries/tx-d01-trattoria', 'd01-tx-correct', 'd01-correct', '24'],
    // 36 ARCHIVE BLOCKED moved to the founder's OV07 caution shell (its own title, rows and strips are measured there):
    // covered by jurnl-global-menu-recovery.e2e.ts O7.
  ];
  for (const [name, route, open1, id, seal] of cases) {
    test(`H · ${name}: title lines inside the text-safe zone; actions are illustrated pills`, async ({ page }) => {
      await open(page, route);
      await clickTrigger(page, open1);
      await expect(overlay(page, id)).toBeVisible();
      const fit = await titleFit(page, id);
      expect(fit.lines).toBeGreaterThan(0);
      expect(fit.out, name).toEqual([]);
      const seals = overlay(page, id).locator('[data-layer-id^="seal"]');
      if (seal) {
        await expect(seals).toHaveCount(1);
        expect(await seals.getAttribute('src'), name).toMatch(new RegExp(`F05_DOT01_SEAL_${seal}`));
        await expect(seals).toHaveAttribute('aria-hidden', 'true');
      } else await expect(seals).toHaveCount(0);
      for (const a of await actions(page, `[data-jrn-overlay="${id}"]`)) {
        // no generic rounded rectangle: a lifted pill, or (destructive only) the terracotta stadium
        if (a.danger) expect(a.radius, `${a.trigger} stadium`).toMatch(/px/);
        else expect(a.surface, `${a.trigger} surface`).toMatch(/F05_DOT01_PILL_SK03_(DARK|CREAM)/);
        expect(a.inside, `${a.trigger} label inside`).toBe(true);
        expect(a.collide, `${a.trigger} icon/text`).toBe(false);
      }
      expect(await pageScroll(page)).toEqual({ y: false, x: false });
    });
  }
});

test.describe('OPUS3A · ALL ACCOUNTS (06) — ADD ACCOUNT / REORDER ACCOUNTS are the authority compositions', () => {
  test('S1 · each control is its lifted paper + engraved glyph + live two-line label; decorative layers take no tap; keyboard opens ADD ACCOUNT', async ({ page }) => {
    await open(page, 'money/places');
    // the lifted surfaces and glyphs, recognised by their own pixel size (a production build may inline the small glyphs as
    // data URIs, so the file name is not always in the src): ACTION06_ADD 391 × 140 · ICON06_ADD 82 × 78 ·
    // ACTION06_REORDER 402 × 149 · ICON06_REORDER 78 × 74
    const natural = (l: ReturnType<Page['locator']>) => l.evaluate((img: HTMLImageElement) => [img.naturalWidth, img.naturalHeight]);
    for (const [t, art, glyph] of [['d01-add-account', [391, 140], [82, 78]], ['d01-reorder', [402, 149], [78, 74]]] as const) {
      const b = trigger(page, t);
      await expect(b).toBeVisible();
      await expect.poll(() => natural(b.locator('.d01-dir__action-art'))).toEqual(art);
      await expect.poll(() => natural(b.locator('.d01-dir__glyph'))).toEqual(glyph);
      await expect(b.locator('.d01-dir__label')).toHaveText(t === 'd01-add-account' ? 'ADD ACCOUNT' : 'REORDER ACCOUNTS');
      const box = (await b.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      // a tap at the centre of the art reaches the button, never a decorative layer
      const hit = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('[data-jrn-trigger]')?.getAttribute('data-jrn-trigger'), [box.x + box.width / 2, box.y + box.height / 2]);
      expect(hit).toBe(t);
      // the button carries no generic CSS surface of its own (the artwork is the surface)
      const bg = await b.evaluate((e) => getComputedStyle(e).backgroundImage);
      expect(bg).toBe('none');
    }
    // ADD sits left of REORDER on one row, as the authority pairs them
    const [a, r] = await Promise.all([trigger(page, 'd01-add-account').boundingBox(), trigger(page, 'd01-reorder').boundingBox()]);
    expect(a!.x + a!.width).toBeLessThanOrEqual(r!.x + 1);
    // one row: the papers overlap vertically by most of their height (the authority tears REORDER 9 board px taller at the top)
    expect(Math.min(a!.y + a!.height, r!.y + r!.height) - Math.max(a!.y, r!.y)).toBeGreaterThan(0.85 * Math.min(a!.height, r!.height));
    await trigger(page, 'd01-add-account').focus();
    await page.keyboard.press('Enter');
    await expect(overlay(page, 'd01-add-account')).toBeVisible();
    expect(await pageScroll(page)).toEqual({ y: false, x: false });
  });
});
