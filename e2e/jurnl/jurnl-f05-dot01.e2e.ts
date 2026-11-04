/**
 * P0.JURNL.F05-MONEY.DOT01-ACCOUNTS — browser journeys for the ACCOUNTS dot (authorities 02–37).
 * Synthetic worlds only (helpers/jurnl-dot01-world.ts, helpers/jurnl-f05-world.ts); nothing is real.
 *
 * RECEIPTS: the receipt tests render a synthetic receipt photo on a canvas (helpers/jurnl-receipt-image.ts) and
 * upload it through the real file input. The app then reads it with its own on-device OCR (tesseract.js, self-hosted
 * under /jurnl/ocr). Extraction is NOT stubbed or mocked: the values asserted on the review screen are what the OCR
 * engine read from the pixels. This is a real browser OCR run on a synthetic image — not a test against a real
 * printed receipt or a real phone camera, and not a cloud extraction provider (none is used).
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type Request } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { addDays, getTodayKey } from '../../src/projects/jurnl/data/foundation/dates';
import { dot01World } from './helpers/jurnl-dot01-world';
import { f05World, type F05WorldKind } from './helpers/jurnl-f05-world';
import { bootstrapJurnl, clickTrigger, gotoJurnl, storedSnapshot, trigger } from './helpers/jurnl-page';
import { receiptDate, receiptPng } from './helpers/jurnl-receipt-image';

const SHOTS = process.env.JURNL_F05_DOT01_SHOTS_DIR ?? 'test-results/jurnl-f05-dot01';
const TODAY = getTodayKey();
type Entry = { id: string; merchant: string; amount: number; account_id: string; receipt?: { image_sha256: string; stored: string; extracted: { total: number | null } }; correction_history?: unknown[] };

async function open(page: Page, route: string, world: unknown = dot01World()) {
  await page.addInitScript(() => sessionStorage.setItem('jurnl.f05.parent', 'motion'));
  await bootstrapJurnl(page, world as Parameters<typeof bootstrapJurnl>[1]);
  await gotoJurnl(page, route);
  await page.locator('[data-jrn-f05-dot01-stage]').first().waitFor({ state: 'attached', timeout: 30_000 });
}
const openKind = (page: Page, route: string, kind: F05WorldKind) => open(page, route, f05World(kind));

async function shot(page: Page, name: string) {
  const dir = `${SHOTS}/${test.info().project.name}`;
  mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: `${dir}/${name}.png` });
}

const entries = async (page: Page) => ((await storedSnapshot(page)) as unknown as { transactions: Entry[] }).transactions;
const settings = async (page: Page) => ((await storedSnapshot(page)) as unknown as { settings?: { accountOrder?: string[]; ledgerAudit?: { action: string }[] } }).settings ?? {};
const balance = async (page: Page) => Number(await page.getByTestId('d01-balance').getAttribute('data-jrn-amount-cents'));
const dialog = (page: Page, id: string) => page.locator(`[data-jrn-overlay="${id}"]`);
const directoryIds = (page: Page) => page.locator('[data-testid="d01-directory"] [data-account-id]').evaluateAll((els) => els.map((e) => e.getAttribute('data-account-id')));
const serious = async (page: Page, include: string) => {
  const r = await new AxeBuilder({ page }).include(include).analyze();
  return r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`);
};

/** Every visible text in the DOT 01 surface is uppercase, except the cursive subtitle, which is lowercase (one per page). */
async function typographyFindings(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    const roots = [...document.querySelectorAll('[data-jrn-f05-dot01-stage]')];
    for (const root of roots) {
      const scripts = root.querySelectorAll('.jrn-d01__script');
      if (scripts.length > 1) out.push(`MORE THAN ONE CURSIVE PHRASE (${scripts.length})`);
      scripts.forEach((s) => {
        const t = s.textContent ?? '';
        if (t !== t.toLowerCase()) out.push(`CURSIVE NOT LOWERCASE: ${t}`);
      });
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const t = (n.textContent ?? '').trim();
        const el = n.parentElement;
        if (!t || !el || el.closest('.jrn-d01__script')) continue;
        if (el.closest('option')) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        if (t !== t.toUpperCase() && cs.textTransform !== 'uppercase') out.push(`NOT UPPERCASE: ${t.slice(0, 40)}`);
      }
    }
    return out;
  });
}

/** Square-rounded controls only: no tappable control is a circle. */
async function circularControls(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('[data-jrn-f05-dot01-stage] button, [data-jrn-f05-dot01-stage] a[href], .jrn-nav button')]
      .filter((el) => el.offsetParent !== null)
      .filter((el) => {
        // compare in the element's own (untransformed) box: board chips are scaled with the composition
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const br = parseFloat(getComputedStyle(el).borderTopLeftRadius);
        return Math.abs(w - h) < 2 && w > 0 && br >= w / 2 - 0.5;
      })
      .map((el) => el.getAttribute('data-jrn-trigger') ?? el.className),
  );
}

async function scanReceipt(page: Page, lines: string[], opts: { blank?: boolean } = {}) {
  const png = await receiptPng(page.context(), { lines, blank: opts.blank });
  await page.setInputFiles('[data-jrn-trigger="d01-receipt-upload-input"]', { name: 'receipt.png', mimeType: 'image/png', buffer: png });
  return png;
}

test.describe('F05 DOT 01 — accounts directory, order and setup', () => {
  test('06 / 32 · ALL ACCOUNTS lists every place; the saved order persists and drives the MONEY parent', async ({ page }) => {
    await open(page, 'money/places');
    expect(await directoryIds(page)).toEqual(['bank', 'ride', 'cash', 'visa']);
    await expect(page.getByTestId('d01-directory-summary')).toContainText('4 PLACES');
    await shot(page, '06-all-accounts');
    await clickTrigger(page, 'd01-reorder');
    await expect(page.getByTestId('d01-reorder')).toBeVisible();
    // keyboard-operable move buttons (no drag needed)
    await trigger(page, 'd01-down-bank').focus();
    await page.keyboard.press('Enter');
    await clickTrigger(page, 'd01-up-visa');
    await shot(page, '32-reorder');
    await clickTrigger(page, 'd01-save-order');
    await expect.poll(async () => (await settings(page)).accountOrder?.slice(0, 4)).toEqual(['ride', 'bank', 'visa', 'cash']);
    expect(await directoryIds(page)).toEqual(['ride', 'bank', 'visa', 'cash']);
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('[data-testid="d01-directory"]').waitFor();
    expect(await directoryIds(page)).toEqual(['ride', 'bank', 'visa', 'cash']);
    // the MONEY parent reads the same order (first four places)
    await gotoJurnl(page, 'money?parent=motion');
    await page.locator('[data-jrn-f05-stage]').waitFor();
    expect(await page.locator('.jrn-f05m__collection:not([data-phase="exit"]) [data-account-id]').evaluateAll((els) => els.map((e) => e.getAttribute('data-account-id')))).toEqual(['ride', 'bank', 'visa', 'cash']);
  });

  test('32 · cancelling a reorder changes nothing', async ({ page }) => {
    await open(page, 'money/places');
    const before = await entries(page);
    await clickTrigger(page, 'd01-reorder');
    await clickTrigger(page, 'd01-down-bank');
    await clickTrigger(page, 'd01-cancel-order');
    expect(await directoryIds(page)).toEqual(['bank', 'ride', 'cash', 'visa']);
    expect((await settings(page)).accountOrder).toBeUndefined();
    expect(await entries(page)).toEqual(before);
  });

  test('22 / 14 / 30 · no accounts: an honest empty state; adding the first account opens it with the entered balance', async ({ page }) => {
    await openKind(page, 'money/places', 'none');
    await expect(page.getByTestId('d01-empty-accounts')).toBeVisible();
    await expect(page.locator('[data-testid="d01-directory"] [data-account-id]')).toHaveCount(0);
    await shot(page, '22-empty-accounts');
    await clickTrigger(page, 'd01-empty-bank');
    await expect(dialog(page, 'd01-add-account')).toBeVisible();
    await expect(trigger(page, 'd01-kind-bank')).toHaveAttribute('aria-checked', 'true');
    await trigger(page, 'd01-add-name').fill('Everyday Checking');
    await trigger(page, 'd01-add-balance').fill('250.00');
    await shot(page, '30-account-setup');
    await clickTrigger(page, 'd01-create-account');
    await page.waitForURL(/\/money\/places\/acct-[^/]+$/);
    await expect(page.locator('[data-jrn-screen="F05.ACCOUNT"] h1')).toHaveText('EVERYDAY CHECKING');
    expect(await balance(page)).toBe(25_000);
  });

  test('14 · a card limit is only what the user enters (never invented)', async ({ page }) => {
    await openKind(page, 'money/places', 'none');
    await clickTrigger(page, 'd01-add-first');
    await clickTrigger(page, 'd01-kind-credit');
    await trigger(page, 'd01-add-name').fill('STORE CARD');
    await trigger(page, 'd01-add-balance').fill('120');
    await clickTrigger(page, 'd01-create-account');
    await page.waitForURL(/\/money\/places\/acct-[^/]+$/);
    const snap = (await storedSnapshot(page)) as unknown as { accounts: { display_name: string; credit_limit: number | null }[] };
    expect(snap.accounts.find((a) => a.display_name === 'STORE CARD')!.credit_limit).toBeNull();
  });
});

test.describe('F05 DOT 01 — account pages and histories', () => {
  test('02–05 · each kind opens its own page with live, id-bound values; back returns to the directory', async ({ page }) => {
    await open(page, 'money/places');
    const expectBal = { bank: 99_455, ride: 72_200, cash: 33_350, visa: 87_750 } as const;
    for (const id of ['bank', 'ride', 'cash', 'visa'] as const) {
      await page.locator(`[data-testid="d01-directory"] [data-account-id="${id}"]`).click();
      await page.waitForURL(new RegExp(`/money/places/(${id}|${id}/attention)$`));
      if (page.url().endsWith('/attention')) await clickTrigger(page, 'd01-open-account');
      await page.waitForURL(new RegExp(`/money/places/${id}$`));
      expect(await balance(page)).toBe(expectBal[id]);
      await shot(page, `0${['bank', 'ride', 'cash', 'visa'].indexOf(id) + 2}-${id}`);
      await clickTrigger(page, 'd01-back');
      await page.waitForURL(/\/money\/places$/);
    }
  });

  test('07 / 31 · history search and filters live in the URL, rows open the transaction, back keeps the filter', async ({ page }) => {
    await open(page, 'money/places/bank/history');
    await expect(page.getByTestId('d01-history-list').locator('li')).toHaveCount(7);
    await trigger(page, 'd01-search').fill('tratt');
    await expect(page).toHaveURL(/q=tratt/);
    await expect(page.getByTestId('d01-history-list').locator('li')).toHaveCount(1);
    await clickTrigger(page, 'd01-filters');
    await trigger(page, 'd01-filter-category').selectOption('DINING');
    await expect(page).toHaveURL(/category=DINING/);
    await shot(page, '31-search-and-filter');
    await clickTrigger(page, 'd01-tx-tx-d01-trattoria');
    await page.waitForURL(/\/money\/entries\/tx-d01-trattoria$/);
    await expect(page.getByTestId('d01-tx-amount')).toContainText('84.20');
    await shot(page, '11-transaction-detail');
    await clickTrigger(page, 'd01-back');
    await page.waitForURL(/\/money\/places\/bank\/history\?/);
    await expect(trigger(page, 'd01-search')).toHaveValue('tratt');
    // with a search in the URL the filters open with the page
    await expect(trigger(page, 'd01-filters')).toHaveAttribute('aria-expanded', 'true');
    await trigger(page, 'd01-filter-category').selectOption('UTILITIES');
    await expect(page.getByTestId('d01-history-empty')).toContainText('NO TRANSACTIONS MATCH');
  });

  test('10 · a card history reads like a statement; pending transfers show their state and no sign', async ({ page }) => {
    await open(page, 'money/places/visa/history');
    await expect(trigger(page, 'd01-tx-tx-d01-vesuvio').locator('.d01-tx__amt')).toHaveText('$42.50');
    await open(page, 'money/places/bank/history');
    const pending = trigger(page, 'd01-tx-tx-xfer-e2e-pending-out');
    await expect(pending.locator('.d01-tx__state')).toHaveText('PENDING');
    await expect(pending.locator('.d01-tx__amt')).toHaveText('$60');
  });

  test('31 · all transactions can be narrowed to one account', async ({ page }) => {
    await open(page, 'money/transactions');
    const all = await page.getByTestId('d01-history-list').locator('li').count();
    await trigger(page, 'd01-filter-account').selectOption('cash');
    await expect(page.getByTestId('d01-history-list').locator('li')).toHaveCount(3);
    expect(all).toBeGreaterThan(3);
  });
});

test.describe('F05 DOT 01 — entries (16–20): one canonical entry each, correct accounting', () => {
  test('18 · cash spending lowers cash on hand only, saved once', async ({ page }) => {
    await open(page, 'money/places/cash');
    const before = (await entries(page)).length;
    await clickTrigger(page, 'd01-strip-spend');
    await expect(dialog(page, 'd01-record')).toBeVisible();
    await trigger(page, 'd01-merchant').fill('Corner bakery');
    await trigger(page, 'd01-amount').fill('12.50');
    await trigger(page, 'd01-category').selectOption('FOOD');
    await clickTrigger(page, 'd01-review-save');
    await expect(page.getByTestId('d01-review-kind')).toContainText('SPENDING');
    await expect(page.getByTestId('d01-review-impact')).toContainText('$333.50 → $321');
    expect((await entries(page)).length).toBe(before); // review writes nothing
    await clickTrigger(page, 'd01-save-transaction');
    await expect(dialog(page, 'd01-purchase-saved')).toBeVisible();
    const after = await entries(page);
    expect(after.length).toBe(before + 1);
    const e = after.find((x) => x.merchant === 'CORNER BAKERY')!;
    expect(e.account_id).toBe('cash');
    expect((e as unknown as { source_values?: { merchant?: string } }).source_values?.merchant).toBe('Corner bakery');
    await clickTrigger(page, 'd01-saved-done');
    expect(await balance(page)).toBe(32_100);
  });

  test('19 · a card purchase raises what the card owes and moves no cash', async ({ page }) => {
    await open(page, 'money/places/visa');
    await clickTrigger(page, 'd01-strip-purchase');
    await trigger(page, 'd01-merchant').fill('BOOK SHOP');
    await trigger(page, 'd01-amount').fill('20');
    await trigger(page, 'd01-category').selectOption('SHOPPING');
    await clickTrigger(page, 'd01-review-save');
    await expect(page.getByTestId('d01-review-kind')).toContainText('CREDIT PURCHASE');
    await clickTrigger(page, 'd01-save-transaction');
    await clickTrigger(page, 'd01-saved-done');
    expect(await balance(page)).toBe(89_750);
    await gotoJurnl(page, 'money/places/bank');
    expect(await balance(page)).toBe(99_455);
  });

  test('20 · a card payment is recorded, never sent; only a confirmed payment moves money; overpaying is refused', async ({ page }) => {
    await open(page, 'money/places/visa');
    await clickTrigger(page, 'd01-strip-pay');
    await expect(page.getByTestId('d01-payment-honest')).toContainText('JURNL DOES NOT SEND MONEY');
    await trigger(page, 'd01-pay-from').selectOption('bank');
    await trigger(page, 'd01-pay-amount').fill('5000');
    await trigger(page, 'd01-pay-status').selectOption('COMPLETED');
    await clickTrigger(page, 'd01-pay-review');
    await expect(dialog(page, 'd01-card-payment').getByRole('alert')).toContainText('MORE THAN');
    await trigger(page, 'd01-pay-amount').fill('50');
    await trigger(page, 'd01-pay-status').selectOption('PENDING');
    await clickTrigger(page, 'd01-pay-review');
    await expect(page.getByTestId('d01-payment-impact')).toContainText('NO CHANGE NOW');
    await clickTrigger(page, 'd01-payment-save');
    await clickTrigger(page, 'd01-payment-done');
    expect(await balance(page)).toBe(87_750); // submitted, not confirmed: the card still owes the same
    await clickTrigger(page, 'd01-strip-pay');
    await trigger(page, 'd01-pay-from').selectOption('bank');
    await trigger(page, 'd01-pay-amount').fill('100');
    await trigger(page, 'd01-pay-status').selectOption('COMPLETED');
    await clickTrigger(page, 'd01-pay-review');
    await clickTrigger(page, 'd01-payment-save');
    await clickTrigger(page, 'd01-payment-done');
    expect(await balance(page)).toBe(77_750);
    await gotoJurnl(page, 'money/places/bank');
    expect(await balance(page)).toBe(89_455);
  });

  test('17 · cash from an account is a transfer (not income); a counted correction is a balance correction', async ({ page }) => {
    await open(page, 'money/places/cash');
    await clickTrigger(page, 'd01-strip-add-cash');
    await trigger(page, 'd01-cash-source').selectOption('ACCOUNT');
    await trigger(page, 'd01-cash-from').selectOption('ride');
    await trigger(page, 'd01-cash-amount').fill('40');
    await clickTrigger(page, 'd01-cash-review');
    await clickTrigger(page, 'd01-add-to-cash');
    await clickTrigger(page, 'd01-add-cash-done');
    expect(await balance(page)).toBe(37_350);
    const legs = (await entries(page)).filter((e) => e.merchant.includes('CASH ON HAND') && (e as unknown as { link?: { kind: string } }).link?.kind === 'TRANSFER');
    expect(legs.length).toBe(2);
  });
});

test.describe('F05 DOT 01 — receipts (26–29, 33, 34): real on-device OCR on a synthetic receipt photo', () => {
  test.setTimeout(150_000);

  test('26 → 27 → 28 → 33 · scan, review, confirm: one entry with the receipt attached; the photo never leaves the device', async ({ page }) => {
    await open(page, 'money/places/bank/history');
    const before = (await entries(page)).length;
    const requests: Request[] = [];
    const logs: string[] = [];
    page.on('request', (r) => requests.push(r));
    page.on('console', (m) => logs.push(m.text()));
    await clickTrigger(page, 'd01-history-scan');
    await expect(dialog(page, 'd01-receipt-capture')).toBeVisible();
    await shot(page, '26-capture-receipt');
    const day = addDays(TODAY, -1);
    const png = await scanReceipt(page, ['**OSTERIA DEL PORTO', 'VIA DEL MARE 12', `${receiptDate(day)}  19:42`, '', 'ANTIPASTO|18.00', 'PASTA|28.00', 'VINO|32.00', '', 'SUBTOTAL|78.00', 'TAX|6.20', '**TOTAL|84.20', '', 'VISA ****4242|84.20']);
    await expect(dialog(page, 'd01-receipt-scanning')).toBeVisible();
    await shot(page, '27-scanning');
    await expect(dialog(page, 'd01-review-purchase')).toBeVisible({ timeout: 90_000 });
    // what the OCR engine read from the pixels (not typed by the test)
    await expect(trigger(page, 'd01-merchant')).toHaveValue(/OSTERIA DEL PORTO/);
    await expect(trigger(page, 'd01-amount')).toHaveValue('84.20');
    await expect(trigger(page, 'd01-date')).toHaveValue(day);
    expect((await entries(page)).length).toBe(before); // extraction never saves
    await shot(page, '28-review-extracted');
    await trigger(page, 'd01-category').selectOption('DINING');
    await clickTrigger(page, 'd01-review-save');
    await expect(dialog(page, 'd01-transaction-review')).toBeVisible();
    await expect(page.getByTestId('d01-review-impact')).toContainText('$994.55 → $910.35');
    await shot(page, '33-transaction-review');
    expect((await entries(page)).length).toBe(before);
    await clickTrigger(page, 'd01-save-transaction');
    await expect(dialog(page, 'd01-purchase-saved')).toBeVisible();
    const after = await entries(page);
    expect(after.length).toBe(before + 1);
    const e = after.find((x) => x.merchant === 'OSTERIA DEL PORTO')!;
    expect(e.amount).toBe(84.2);
    expect(e.receipt?.stored).toBe('DEVICE');
    expect(e.receipt?.extracted.total).toBe(84.2);
    expect(e.receipt?.image_sha256).toMatch(/^[0-9a-f]{64}$/);
    // the image is kept on this device only (IndexedDB), and was never sent anywhere
    const kept = await page.evaluate(() => new Promise<number>((res) => {
      const r = indexedDB.open('jurnl-receipts');
      r.onsuccess = () => {
        const db = r.result;
        const names = [...db.objectStoreNames];
        if (!names.length) return res(0);
        const c = db.transaction(names[0]!, 'readonly').objectStore(names[0]!).count();
        c.onsuccess = () => res(c.result);
        c.onerror = () => res(-1);
      };
      r.onerror = () => res(-1);
    }));
    expect(kept).toBe(1);
    const origin = new URL(page.url()).origin;
    const offDevice = requests.filter((r) => (r.postDataBuffer()?.length ?? 0) > 20_000 || (/\/jurnl\/ocr\//.test(r.url()) && new URL(r.url()).origin !== origin));
    expect(offDevice.map((r) => r.url())).toEqual([]);
    expect(requests.some((r) => /\/jurnl\/ocr\/lang\/eng\.traineddata/.test(r.url()))).toBe(true);
    expect(png.length).toBeGreaterThan(20_000);
    expect(logs.filter((l) => /OSTERIA|ANTIPASTO|4242/.test(l))).toEqual([]);
    // the transaction shows the receipt from the device
    await clickTrigger(page, 'd01-open-saved');
    await page.waitForURL(/\/money\/entries\//);
    await expect(page.getByTestId('d01-tx-receipt').locator('img[alt="YOUR RECEIPT PHOTO"]')).toBeVisible();
  });

  test('29 · a receipt that matches an existing purchase stops for review; USE EXISTING ENTRY saves nothing', async ({ page }) => {
    await open(page, 'money/places/bank/history');
    const before = await entries(page);
    await clickTrigger(page, 'd01-history-scan');
    await scanReceipt(page, ['**TRATTORIA LUCIA', receiptDate(addDays(TODAY, -5)), '', 'ANTIPASTO|18.00', 'PASTA|28.00', 'VINO|32.00', 'TAX|6.20', '**TOTALE|84.20']);
    await expect(dialog(page, 'd01-review-purchase')).toBeVisible({ timeout: 90_000 });
    await clickTrigger(page, 'd01-review-save');
    await expect(dialog(page, 'd01-receipt-duplicate')).toBeVisible();
    await expect(page.getByTestId('d01-duplicate-found')).toContainText('NOTHING HAS BEEN SAVED');
    await shot(page, '29-duplicate');
    await clickTrigger(page, 'd01-use-existing');
    await page.waitForURL(/\/money\/entries\/tx-d01-trattoria$/);
    expect(await entries(page)).toEqual(before);
  });

  test('34 · an unreadable photo fails honestly; ENTER MANUALLY recovers and saves exactly one entry', async ({ page }) => {
    await open(page, 'money/places/bank/history');
    const before = (await entries(page)).length;
    await clickTrigger(page, 'd01-history-scan');
    await scanReceipt(page, [], { blank: true });
    await expect(dialog(page, 'd01-receipt-failure')).toBeVisible({ timeout: 90_000 });
    await expect(page.getByTestId('d01-receipt-failed')).toContainText('NOTHING WAS SAVED');
    await shot(page, '34-receipt-failure');
    expect((await entries(page)).length).toBe(before);
    await clickTrigger(page, 'd01-receipt-manual');
    await expect(dialog(page, 'd01-record')).toBeVisible();
    await trigger(page, 'd01-merchant').fill('PHARMACY');
    await trigger(page, 'd01-amount').fill('9.99');
    await trigger(page, 'd01-category').selectOption('HEALTH');
    await clickTrigger(page, 'd01-review-save');
    await clickTrigger(page, 'd01-save-transaction');
    await expect(dialog(page, 'd01-purchase-saved')).toBeVisible();
    // a second tap on a finished save cannot add another entry
    expect((await entries(page)).length).toBe(before + 1);
  });

  test('26 · a PDF is refused with a plain message and nothing is read or saved', async ({ page }) => {
    await open(page, 'money/places/bank/history');
    const before = (await entries(page)).length;
    await clickTrigger(page, 'd01-history-scan');
    await page.setInputFiles('[data-jrn-trigger="d01-receipt-upload-input"]', { name: 'r.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 synthetic') });
    await expect(dialog(page, 'd01-receipt-failure')).toContainText('PDF');
    expect((await entries(page)).length).toBe(before);
  });
});

test.describe('F05 DOT 01 — corrections, reconciliation and archiving', () => {
  test('24 / 37 · a correction shows original vs revised and keeps the trail; a reversal removes it once', async ({ page }) => {
    await open(page, 'money/entries/tx-d01-trattoria');
    await clickTrigger(page, 'd01-tx-correct');
    await expect(dialog(page, 'd01-correct')).toBeVisible();
    await shot(page, '24-correct-transaction');
    await clickTrigger(page, 'd01-correct-edit');
    await clickTrigger(page, 'd01-correct-continue');
    await trigger(page, 'd01-correct-amount').fill('35.00');
    await clickTrigger(page, 'd01-correct-review');
    await expect(page.getByTestId('d01-balance-change')).toContainText('+$49.20');
    await clickTrigger(page, 'd01-confirm-original');
    await expect(page.getByTestId('d01-view-original')).toContainText('$84.20');
    await shot(page, '37-confirm-correction');
    await clickTrigger(page, 'd01-confirm-update');
    await clickTrigger(page, 'd01-correct-finish');
    await expect(page.getByTestId('d01-tx-amount')).toContainText('$35');
    await expect(page.getByTestId('d01-tx-trail')).toContainText('WAS $84.20');
    const e = (await entries(page)).find((x) => x.id === 'tx-d01-trattoria')!;
    expect(e.amount).toBe(35);
    expect(e.correction_history?.length).toBe(1);
    // reverse (delete) — removed from every balance, a copy kept in the audit, and it cannot happen twice
    await clickTrigger(page, 'd01-tx-correct');
    await clickTrigger(page, 'd01-correct-delete');
    await clickTrigger(page, 'd01-correct-continue');
    await clickTrigger(page, 'd01-confirm-update');
    await clickTrigger(page, 'd01-correct-finish');
    await page.waitForURL(/\/money\/places\/bank\/history$/);
    expect((await entries(page)).some((x) => x.id === 'tx-d01-trattoria')).toBe(false);
    expect((await settings(page)).ledgerAudit?.[0]?.action).toBe('REVERSED');
    await gotoJurnl(page, 'money/entries/tx-d01-trattoria');
    await expect(trigger(page, 'd01-tx-correct')).toHaveCount(0);
  });

  test('24 · transfer legs are changed from their own steps, not here', async ({ page }) => {
    await open(page, 'money/entries/tx-xfer-e2e-pending-out');
    await expect(page.getByTestId('d01-tx-owner')).toContainText('PART OF A TRANSFER');
    await expect(trigger(page, 'd01-tx-correct')).toHaveCount(0);
  });

  test('13 / 23 · tracked, actual and difference stay apart; never reconciled with a difference', async ({ page }) => {
    await open(page, 'money/places/bank/review');
    await expect(page.getByTestId('d01-tracked')).toHaveAttribute('data-jrn-amount-cents', '99455');
    await trigger(page, 'd01-actual-input').fill('984.55');
    await expect(page.getByTestId('d01-difference')).toContainText('-$10');
    await clickTrigger(page, 'd01-mark-reconciled');
    await expect(page.getByRole('alert')).toContainText('STILL A DIFFERENCE');
    await expect(page.getByTestId('d01-rec-status')).toContainText('NEVER REVIEWED');
    await clickTrigger(page, 'd01-add-adjustment');
    await expect(dialog(page, 'd01-adjust')).toBeVisible();
    await expect(page.getByTestId('d01-adjust-only')).toContainText('THIS WILL CHANGE THE TRACKED BALANCE ONLY');
    await clickTrigger(page, 'd01-save-adjustment');
    await expect(dialog(page, 'd01-adjust').getByRole('alert')).toContainText('CHOOSE A REASON');
    await trigger(page, 'd01-adjust-reason').selectOption('BANK FEE NOT RECORDED');
    await shot(page, '23-balance-adjustment');
    await clickTrigger(page, 'd01-save-adjustment');
    await expect(page.getByTestId('d01-review-done')).toContainText('ADJUSTMENT SAVED');
    await expect(page.getByTestId('d01-tracked')).toHaveAttribute('data-jrn-amount-cents', '98455');
    const adj = (await entries(page)).filter((x) => (x as unknown as { link?: { kind: string } }).link?.kind === 'BALANCE_CORRECTION');
    expect(adj.length).toBe(1);
    await trigger(page, 'd01-actual-input').fill('984.55');
    await clickTrigger(page, 'd01-mark-reconciled');
    await expect(page.getByTestId('d01-rec-status')).toContainText('RECONCILED');
    await shot(page, '13-balance-review-reconciled');
  });

  test('36 · archiving is blocked while anything depends on the place', async ({ page }) => {
    await open(page, 'money/places/bank/settings');
    await clickTrigger(page, 'd01-archive');
    await expect(dialog(page, 'd01-archive-blocked')).toContainText('ACTIVE TRANSFER');
    await expect(page.getByTestId('d01-blocker-RECURRING_PAYMENT')).toBeVisible();
    await expect(trigger(page, 'd01-archive-confirm')).toHaveCount(0);
    await shot(page, '36-archive-blocked');
    await clickTrigger(page, 'd01-keep-active');
    const snap = (await storedSnapshot(page)) as unknown as { accounts: { account_id: string; status: string }[] };
    expect(snap.accounts.find((a) => a.account_id === 'bank')!.status).toBe('ACTIVE');
  });

  test('25 · a place with nothing depending on it is archived; its history stays; it leaves the directory', async ({ page }) => {
    await openKind(page, 'money/places/long/settings', 'many');
    await clickTrigger(page, 'd01-archive');
    await shot(page, '25-archive-confirmation');
    await clickTrigger(page, 'd01-archive-confirm');
    await clickTrigger(page, 'd01-archive-done');
    await page.waitForURL(/\/money\/places$/);
    expect(await directoryIds(page)).not.toContain('long');
    const snap = (await storedSnapshot(page)) as unknown as { accounts: { account_id: string; status: string }[] };
    expect(snap.accounts.find((a) => a.account_id === 'long')!.status).toBe('ARCHIVED');
  });

  test('12 / 15 / 21 · settings, rename and purposes', async ({ page }) => {
    await open(page, 'money/places/ride/settings');
    await shot(page, '12-account-details');
    await clickTrigger(page, 'd01-rename');
    await trigger(page, 'd01-edit-name').fill('Rideshare payout card');
    await clickTrigger(page, 'd01-save-changes');
    await expect(page.getByTestId('d01-settings')).toContainText('RIDESHARE PAYOUT CARD');
    await clickTrigger(page, 'd01-purposes');
    await expect(dialog(page, 'd01-purposes')).toBeVisible();
    await shot(page, '21-account-purposes');
  });
});

test.describe('F05 DOT 01 — overlays, navigation, typography, accessibility', () => {
  test('overlays trap focus, close on Escape, return focus to the opener and keep the page state', async ({ page }) => {
    await open(page, 'money/places/bank/history?q=gro');
    await trigger(page, 'd01-record').focus();
    await page.keyboard.press('Enter');
    await expect(dialog(page, 'd01-record')).toBeVisible();
    expect(await page.evaluate(() => !!document.activeElement?.closest('[data-jrn-overlay="d01-record"]'))).toBe(true);
    for (let i = 0; i < 25; i += 1) await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('[data-jrn-overlay="d01-record"]'))).toBe(true);
    // a focused overlay covers the dock and the corner menu
    expect(await page.evaluate(() => {
      const nav = document.querySelector('.jrn-nav')!.getBoundingClientRect();
      const top = document.elementFromPoint(nav.x + nav.width / 2, nav.y + nav.height / 2);
      return !!top?.closest('[data-jrn-overlay]');
    })).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog(page, 'd01-record')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => document.activeElement?.getAttribute('data-jrn-trigger'))).toBe('d01-record');
    await expect(trigger(page, 'd01-search')).toHaveValue('gro');
    await expect(page).toHaveURL(/q=gro/);
  });

  test('the MONEY collection is kept: VIEW ALL ACCOUNTS → back returns to ACCOUNTS', async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem('jurnl.f05.parent', 'motion'));
    await bootstrapJurnl(page, dot01World());
    await gotoJurnl(page, 'money?parent=motion&c=accounts');
    await page.locator('[data-jrn-f05-stage]').waitFor();
    await clickTrigger(page, 'f05m-view-all');
    await page.waitForURL(/\/money\/places$/);
    await clickTrigger(page, 'd01-back');
    await page.waitForURL(/\/money(\?|$)/);
    await expect(page.locator('.jrn-f05m__carousel')).toHaveAttribute('data-active', 'accounts');
  });

  test('every DOT 01 page keeps the five-destination dock with MONEY active, and no circular tappable control', async ({ page }) => {
    await open(page, 'money/places');
    for (const route of ['money/places', 'money/places/bank', 'money/places/visa/history', 'money/entries/tx-d01-vesuvio', 'money/places/cash/settings', 'money/places/bank/review', 'money/transactions']) {
      await gotoJurnl(page, route);
      await page.locator('[data-jrn-f05-dot01-stage]').first().waitFor();
      const nav = page.locator('.jrn-nav');
      await expect(nav).toHaveCount(1);
      expect(await nav.locator('[data-jrn-trigger^="nav-"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-jrn-trigger')))).toEqual(['nav-home', 'nav-money', 'nav-add', 'nav-plan', 'nav-credit']);
      await expect(trigger(page, 'nav-money')).toHaveAttribute('aria-current', 'page');
      expect(await circularControls(page), route).toEqual([]);
      expect(await typographyFindings(page), route).toEqual([]);
    }
  });

  test('typography inside overlays: uppercase, one lowercase cursive phrase at most', async ({ page }) => {
    await open(page, 'money/places/bank/history');
    await clickTrigger(page, 'd01-record');
    expect(await typographyFindings(page)).toEqual([]);
    await page.keyboard.press('Escape');
    await gotoJurnl(page, 'money/entries/tx-d01-trattoria');
    await clickTrigger(page, 'd01-tx-correct');
    expect(await typographyFindings(page)).toEqual([]);
  });

  test('accessibility: no serious or critical axe violations on the DOT 01 pages and overlays', async ({ page }) => {
    await open(page, 'money/places');
    const found: Record<string, string[]> = {};
    for (const route of ['money/places', 'money/places/bank', 'money/places/visa', 'money/places/bank/history', 'money/entries/tx-d01-trattoria', 'money/places/bank/settings', 'money/places/bank/review', 'money/places/bank/attention']) {
      await gotoJurnl(page, route);
      await page.locator('[data-jrn-f05-dot01-stage]').first().waitFor();
      found[route] = await serious(page, '[data-jrn-f05-dot01-stage]');
    }
    await gotoJurnl(page, 'money/places/bank/history');
    await clickTrigger(page, 'd01-record');
    found.record = await serious(page, '[data-jrn-overlay="d01-record"]');
    await clickTrigger(page, 'd01-scan-receipt');
    found.capture = await serious(page, '[data-jrn-overlay="d01-receipt-capture"]');
    await page.keyboard.press('Escape');
    await gotoJurnl(page, 'money/places/bank/settings');
    await clickTrigger(page, 'd01-archive');
    found.archive = await serious(page, '[data-jrn-overlay="d01-archive-blocked"]');
    expect(found).toEqual(Object.fromEntries(Object.keys(found).map((k) => [k, []])));
  });
});

test.describe('F05 DOT 01 — responsive (360×780 · 393×852 · 430×932 · 834×1194 · 1440×900)', () => {
  test.skip(() => test.info().project.name !== 'small', 'the five sizes are set inside the test; run once');
  test('nothing overflows sideways, controls stay on screen and touchable, inputs keep 16 px type', async ({ page }) => {
    test.setTimeout(420_000);
    await open(page, 'money/places');
    const sizes = [[360, 780], [393, 852], [430, 932], [834, 1194], [1440, 900]] as const;
    for (const [w, h] of sizes) {
      await page.setViewportSize({ width: w, height: h });
      for (const route of ['money/places', 'money/places/bank', 'money/places/bank/history']) {
        await gotoJurnl(page, route);
        await page.locator('[data-jrn-f05-dot01-stage]').first().waitFor();
        const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: innerWidth }));
        expect(m.sw, `${route} ${w}x${h}`).toBeLessThanOrEqual(m.w + 1);
        const small = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('[data-jrn-f05-dot01-stage] button, .jrn-nav button')].filter((el) => el.offsetParent !== null).map((el) => el.getBoundingClientRect()).filter((r) => r.width < 24 || r.height < 24).length);
        expect(small, `${route} ${w}x${h} tiny targets`).toBe(0);
        const off = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.jrn-d01__chip, .jrn-nav button')].map((el) => el.getBoundingClientRect()).filter((r) => r.left < -1 || r.right > innerWidth + 1 || r.top < -1 || r.bottom > innerHeight + 1).length);
        expect(off, `${route} ${w}x${h} off-screen chrome`).toBe(0);
        await shot(page, `responsive-${route.replace(/\//g, '_')}-${w}x${h}`);
      }
      await gotoJurnl(page, 'money/places/bank/history');
      await clickTrigger(page, 'd01-record');
      const inputs = await page.locator('[data-jrn-overlay="d01-record"] input, [data-jrn-overlay="d01-record"] select').evaluateAll((els) => els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
      expect(Math.min(...inputs), `${w}x${h} input type`).toBeGreaterThanOrEqual(16);
      const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: innerWidth }));
      expect(m.sw).toBeLessThanOrEqual(m.w + 1);
      await shot(page, `responsive-record-${w}x${h}`);
      await page.keyboard.press('Escape');
    }
  });
});

test.describe('F05 DOT 01 — reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('no animation runs; pages, overlays and saves still work', async ({ page }) => {
    await open(page, 'money/places/bank');
    // keyframe animations and transitions that move or resize something (a colour change is not motion)
    const running = () => page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').filter((a) => !(a instanceof CSSTransition) || /transform|translate|scale|rotate|top|left|width|height|filter/.test(a.transitionProperty)).length);
    expect(await running()).toBe(0);
    await clickTrigger(page, 'd01-strip-history');
    await page.waitForURL(/\/history$/);
    expect(await running()).toBe(0);
    await clickTrigger(page, 'd01-record');
    expect(await running()).toBe(0);
    await trigger(page, 'd01-merchant').fill('TEA');
    await trigger(page, 'd01-amount').fill('3');
    await clickTrigger(page, 'd01-review-save');
    await clickTrigger(page, 'd01-save-transaction');
    await expect(dialog(page, 'd01-purchase-saved')).toBeVisible();
    expect(await running()).toBe(0);
  });
});
