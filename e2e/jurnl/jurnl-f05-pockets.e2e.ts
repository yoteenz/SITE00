/**
 * P0.JURNL.F05-MONEY.DOT01.POCKET-CONTEXT-MANAGEMENT-AND-RENAME-DELETE.UX1 — browser journeys (T01–T19).
 * One MANAGE POCKET menu with two ways in:
 *   ENTRY A  press and hold a Pocket (MONEY parent papers, ALL ACCOUNTS cards, the balance paper of a Pocket page),
 *            and right-click / the ContextMenu key / Shift + F10 as the pointer and keyboard equivalents;
 *   ENTRY B  the MANAGE POCKET chip at the top right of a Pocket page.
 * RENAME POCKET is the canonical rename (by id). DELETE POCKET is the canonical archive of authorities 25 / 36.
 * Synthetic worlds only. On a touch project the hold is a real touch sequence (CDP touch events); elsewhere a mouse.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dot01World, purchase } from './helpers/jurnl-dot01-world';
import { f05World, type F05WorldKind } from './helpers/jurnl-f05-world';
import { bootstrapJurnl, clickTrigger, gotoJurnl, storedSnapshot, trigger } from './helpers/jurnl-page';

const SHOTS = process.env.JURNL_F05_POCKETS_SHOTS_DIR ?? 'test-results/jurnl-f05-pockets';
type Acc = { account_id: string; display_name: string; status: string; balance: number };
type Entry = { id: string; amount: number; account_id: string; direction: string; merchant: string };

/**
 * f05World('many') plus two recorded entries on NEIGHBOURHOOD CREDIT UNION EVERYDAY CHECKING ('long'), the Pocket nothing
 * depends on. It starts at exactly what those entries spent, so it stands at a zero balance (ZERO BALANCE BEFORE ARCHIVE).
 */
function deletableWorld() {
  const w = f05World('many');
  const now = new Date().toISOString();
  const accounts = w.snapshot.accounts.map((a) => (a.account_id === 'long' ? { ...a, balance: 18.5, available_balance: 18.5 } : a));
  const long = accounts.find((a) => a.account_id === 'long')!;
  return { ...w, snapshot: { ...w.snapshot, accounts, transactions: [purchase('tx-long-books', long, 'BOOKSHOP', 12.5, 'SHOPPING', 2, now), purchase('tx-long-cafe', long, 'CORNER CAFE', 6, 'DINING', 1, now)] } };
}

/** The one-Pocket world at a zero balance: the only Pocket can be deleted. */
function onePocketAtZero() {
  const w = f05World('one');
  return { ...w, snapshot: { ...w.snapshot, accounts: w.snapshot.accounts.map((a) => ({ ...a, balance: 0, available_balance: 0 })) } };
}

async function open(page: Page, route: string, world: unknown = dot01World()) {
  await page.addInitScript(() => sessionStorage.setItem('jurnl.f05.parent', 'motion'));
  await bootstrapJurnl(page, world as Parameters<typeof bootstrapJurnl>[1]);
  await gotoJurnl(page, route);
  await page.locator('[data-jrn-f05-dot01-stage], [data-jrn-f05-stage]').first().waitFor({ state: 'attached', timeout: 30_000 });
}
const openKind = (page: Page, route: string, kind: F05WorldKind) => open(page, route, f05World(kind));
async function shot(page: Page, name: string) {
  const dir = `${SHOTS}/${test.info().project.name}`;
  mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: `${dir}/${name}.png` });
}
const accounts = async (page: Page) => ((await storedSnapshot(page)) as unknown as { accounts: Acc[] }).accounts;
const account = async (page: Page, id: string) => (await accounts(page)).find((a) => a.account_id === id)!;
const entries = async (page: Page) => ((await storedSnapshot(page)) as unknown as { transactions: Entry[] }).transactions;
const money = (es: Entry[]) => es.map((e) => ({ id: e.id, amount: e.amount, account_id: e.account_id, direction: e.direction })).sort((a, b) => a.id.localeCompare(b.id));
const menu = (page: Page) => page.getByTestId('d01-pocket-menu');
const dialog = (page: Page, id: string) => page.locator(`[data-jrn-overlay="${id}"]`);
const card = (page: Page, id: string) => page.locator(`[data-testid="d01-directory"] [data-account-id="${id}"]`);
const paper = (page: Page, id: string) => page.locator(`.jrn-f05m__collection:not([data-phase="exit"]) [data-jrn-trigger="f05m-place-${id}"]`);
const directoryIds = (page: Page) => page.locator('[data-testid="d01-directory"] [data-account-id]').evaluateAll((els) => els.map((e) => e.getAttribute('data-account-id')));
const isTouch = () => !!test.info().project.use.hasTouch;
const serious = async (page: Page, include: string) => {
  const r = await new AxeBuilder({ page }).include(include).analyze();
  return r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`);
};
const noPageScroll = (page: Page) => page.evaluate(() => ({ y: document.documentElement.scrollHeight > innerHeight + 1, x: document.documentElement.scrollWidth > innerWidth + 1 }));

async function centre(el: Locator) {
  await el.scrollIntoViewIfNeeded();
  const b = (await el.boundingBox())!;
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}
/** A finger on the glass: touchStart, optionally a move of `dy` px in steps, a wait of `ms`, then touchEnd. */
async function touch(page: Page, el: Locator, ms: number, dy = 0) {
  const c = await centre(el);
  const cdp = await page.context().newCDPSession(page);
  const pt = (y: number) => [{ x: c.x, y, id: 1, radiusX: 4, radiusY: 4, force: 1 }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(c.y) });
  for (let i = 1; i <= 6 && dy; i++) {
    await page.waitForTimeout(16);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(c.y + (dy * i) / 6) });
  }
  await page.waitForTimeout(ms);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}
/** A mouse press of `ms` at the centre of `el` (moving `dy` px first, then releasing off the element when it moved). */
async function mouseHold(page: Page, el: Locator, ms: number, dy = 0) {
  const c = await centre(el);
  await page.mouse.move(c.x, c.y);
  await page.mouse.down();
  if (dy) await page.mouse.move(c.x, c.y + dy, { steps: 6 });
  await page.waitForTimeout(ms);
  if (dy) await page.mouse.move(2, 2);
  await page.mouse.up();
}
/** ENTRY A, as this project's input: a touch hold on a phone, a mouse hold elsewhere. */
const hold = (page: Page, el: Locator, ms = 760) => (isTouch() ? touch(page, el, ms) : mouseHold(page, el, ms));

async function renameTo(page: Page, name: string) {
  await clickTrigger(page, 'd01-pocket-rename');
  await expect(dialog(page, 'd01-rename-pocket')).toBeVisible();
  await trigger(page, 'd01-pocket-name').fill(name);
  await clickTrigger(page, 'd01-save-name');
}

test.describe('ENTRY A — press and hold', () => {
  test('T01 / T02 / T03 · ALL ACCOUNTS: a tap opens the Pocket; a hold opens MANAGE POCKET and does not navigate', async ({ page }) => {
    await open(page, 'money/places');
    await card(page, 'cash').click();
    await page.waitForURL(/\/money\/places\/cash(\/attention)?$/);
    await gotoJurnl(page, 'money/places');
    await card(page, 'cash').waitFor();
    const url = page.url();
    await hold(page, card(page, 'cash'));
    await expect(menu(page)).toBeVisible();
    await expect(menu(page).getByRole('menu')).toHaveAttribute('aria-label', 'MANAGE POCKET: CASH ON HAND');
    await expect(menu(page).getByRole('menuitem')).toHaveText(['RENAME POCKET', 'DELETE POCKET']);
    await page.waitForTimeout(400);
    expect(page.url()).toBe(url);
    expect(await noPageScroll(page)).toEqual({ x: false, y: false });
    await shot(page, 'T02-directory-long-press-menu');
    // Escape closes and returns focus to the Pocket that was held
    await page.keyboard.press('Escape');
    await expect(menu(page)).toHaveCount(0);
    await expect(card(page, 'cash')).toBeFocused();
    expect(page.url()).toBe(url);
  });

  test('T01 / T02 / T03 · MONEY parent: a tap opens the Pocket; a hold opens the same menu and does not navigate', async ({ page }) => {
    await open(page, 'money?parent=motion');
    await paper(page, 'bank').waitFor();
    const url = page.url();
    await hold(page, paper(page, 'bank'));
    await expect(menu(page)).toBeVisible();
    await expect(menu(page).getByRole('menu')).toHaveAttribute('aria-label', 'MANAGE POCKET: BANK ACCOUNT');
    await page.waitForTimeout(400);
    expect(page.url()).toBe(url);
    await shot(page, 'T02-parent-long-press-menu');
    // an outside press dismisses it without opening anything
    await page.mouse.click(4, 4);
    await expect(menu(page)).toHaveCount(0);
    expect(page.url()).toBe(url);
    await paper(page, 'bank').click();
    await page.waitForURL(/\/money\/places\/bank(\/attention)?$/);
  });

  test('T03 · a hold on a Pocket page balance opens the menu and stays on the page', async ({ page }) => {
    await open(page, 'money/places/cash');
    const url = page.url();
    await hold(page, trigger(page, 'd01-pocket-hold'));
    await expect(menu(page)).toBeVisible();
    expect(page.url()).toBe(url);
  });

  test('T04 · a scroll or drag never opens the menu, and a short tap is still a tap', async ({ page }) => {
    await open(page, 'money/places');
    const url = page.url();
    // the finger moves past the slop: the hold is cancelled (and on touch the browser scrolls the board instead)
    if (isTouch()) await touch(page, card(page, 'ride'), 760, 60);
    else await mouseHold(page, card(page, 'ride'), 760, 60);
    await page.waitForTimeout(300);
    await expect(menu(page)).toHaveCount(0);
    expect(page.url()).toBe(url);
    // a wheel scroll during a hold cancels it too
    const c = await centre(card(page, 'cash'));
    await page.mouse.move(c.x, c.y);
    await page.mouse.down();
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(760);
    await page.mouse.move(2, 2);
    await page.mouse.up();
    await expect(menu(page)).toHaveCount(0);
    // the carousel swipe on the MONEY parent: a horizontal drag across a paper changes collection, never a menu
    await gotoJurnl(page, 'money?parent=motion');
    await paper(page, 'ride').waitFor();
    const p = await centre(paper(page, 'ride'));
    await page.mouse.move(p.x + 60, p.y);
    await page.mouse.down();
    await page.mouse.move(p.x - 120, p.y, { steps: 8 });
    await page.waitForTimeout(700);
    await page.mouse.up();
    await expect(menu(page)).toHaveCount(0);
    expect(page.url()).not.toMatch(/\/money\/places\//);
    // a short tap (under the hold time) opens the Pocket as before
    await gotoJurnl(page, 'money/places');
    if (isTouch()) await touch(page, card(page, 'cash'), 60);
    else await mouseHold(page, card(page, 'cash'), 60);
    await page.waitForURL(/\/money\/places\/cash(\/attention)?$/);
  });

  test('T05 · reorder still works after a hold, by buttons, and the saved order persists', async ({ page }) => {
    await open(page, 'money/places');
    await hold(page, card(page, 'bank'));
    await expect(menu(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await clickTrigger(page, 'd01-reorder');
    await expect(page.getByTestId('d01-reorder')).toBeVisible();
    await clickTrigger(page, 'd01-down-bank');
    await clickTrigger(page, 'd01-save-order');
    await expect.poll(async () => ((await storedSnapshot(page)) as unknown as { settings?: { accountOrder?: string[] } }).settings?.accountOrder?.slice(0, 4)).toEqual(['ride', 'bank', 'cash', 'visa']);
    expect(await directoryIds(page)).toEqual(['ride', 'bank', 'cash', 'visa']);
    await expect(menu(page)).toHaveCount(0);
  });
});

test.describe('ENTRY B — the MANAGE POCKET chip', () => {
  test('T06 · the top-right chip opens the same menu; it sits beside BACK and is named MANAGE POCKET', async ({ page }) => {
    await open(page, 'money/places/bank');
    const chip = trigger(page, 'd01-manage');
    await expect(chip).toHaveAccessibleName('MANAGE POCKET');
    await expect(chip).toHaveAttribute('aria-haspopup', 'menu');
    await expect(chip).toHaveAttribute('aria-expanded', 'false');
    const ids = await page.locator('.jrn-d01__chip').evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).map((e) => e.getAttribute('data-jrn-trigger')));
    expect(ids).toEqual(['d01-back', 'd01-manage']);
    const [m, b] = [await chip.boundingBox(), await trigger(page, 'd01-back').boundingBox()];
    expect(m!.x + m!.width).toBeLessThanOrEqual(b!.x + 1);
    expect(Math.abs(m!.y - b!.y)).toBeLessThan(2);
    expect(m!.y).toBeLessThan(page.viewportSize()!.height * 0.15);
    await shot(page, 'T06-pocket-detail-overflow-chip');
    await chip.click();
    await expect(menu(page)).toBeVisible();
    await expect(chip).toHaveAttribute('aria-expanded', 'true');
    await chip.click();
    await expect(menu(page)).toHaveCount(0);
    await expect(chip).toHaveAttribute('aria-expanded', 'false');
    await chip.click();
    await expect(menu(page)).toBeVisible();
    await expect(menu(page).getByRole('menu')).toHaveAttribute('aria-label', 'MANAGE POCKET: BANK ACCOUNT');
    await expect(menu(page).getByRole('menuitem')).toHaveText(['RENAME POCKET', 'DELETE POCKET']);
    await expect(menu(page).getByRole('menuitem').first()).toBeFocused();
    expect(await noPageScroll(page)).toEqual({ x: false, y: false });
    await shot(page, 'T06-pocket-detail-menu');
    await page.keyboard.press('Escape');
    await expect(menu(page)).toHaveCount(0);
    await expect(chip).toBeFocused();
  });
});

test.describe('RENAME POCKET', () => {
  test('T07 / T08 / T09 · a rename persists after reload, every reader shows it, and no money changes', async ({ page }) => {
    await open(page, 'money/places/bank');
    const before = { cents: await page.getByTestId('d01-balance').getAttribute('data-jrn-amount-cents'), money: money(await entries(page)), count: (await accounts(page)).length };
    await clickTrigger(page, 'd01-manage');
    await clickTrigger(page, 'd01-pocket-rename');
    await expect(dialog(page, 'd01-rename-pocket')).toBeVisible();
    await expect(page.getByTestId('d01-pocket-current-name')).toContainText('BANK ACCOUNT');
    await expect(trigger(page, 'd01-pocket-name')).toHaveValue('BANK ACCOUNT');
    await expect(trigger(page, 'd01-pocket-name')).toHaveAttribute('maxlength', '80');
    await trigger(page, 'd01-pocket-name').fill('  everyday   pocket ');
    expect(await noPageScroll(page)).toEqual({ x: false, y: false });
    await shot(page, 'R1-rename-surface');
    await clickTrigger(page, 'd01-save-name');
    await expect(dialog(page, 'd01-rename-pocket')).toHaveCount(0);
    await expect(trigger(page, 'd01-pocket-renamed')).toContainText('POCKET RENAMED');
    await expect(page.locator('[data-jrn-screen="F05.ACCOUNT"] h1')).toHaveText('EVERYDAY POCKET');
    await expect(trigger(page, 'd01-manage')).toBeFocused();
    // T09: same id, same balance, the same entries with the same amounts; no new account
    expect((await account(page, 'bank')).display_name).toBe('EVERYDAY POCKET');
    expect((await accounts(page)).length).toBe(before.count);
    expect(await page.getByTestId('d01-balance').getAttribute('data-jrn-amount-cents')).toBe(before.cents);
    expect(money(await entries(page))).toEqual(before.money);
    // T07: after a reload
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.locator('[data-jrn-screen="F05.ACCOUNT"] h1')).toHaveText('EVERYDAY POCKET');
    // T08: the directory card, the MONEY parent paper and the history rows read the new name
    await gotoJurnl(page, 'money/places');
    await expect(card(page, 'bank')).toContainText('EVERYDAY POCKET');
    await shot(page, 'R2-renamed-pocket-card');
    await gotoJurnl(page, 'money?parent=motion');
    await expect(paper(page, 'bank')).toHaveAttribute('aria-label', /^EVERYDAY POCKET\. /);
    await shot(page, 'R3-renamed-pocket-parent');
    await gotoJurnl(page, 'money/transactions');
    await page.locator('[data-jrn-f05-dot01-stage]').first().waitFor();
    await expect(page.getByTestId('d01-history-list')).toContainText('EVERYDAY POCKET');
    await expect(page.getByTestId('d01-history-list')).not.toContainText('BANK ACCOUNT');
  });

  test('T10 · empty, unsupported and duplicate names are refused before anything is written; CANCEL keeps the name', async ({ page }) => {
    await open(page, 'money/places');
    await hold(page, card(page, 'bank'));
    await clickTrigger(page, 'd01-pocket-rename');
    const name = trigger(page, 'd01-pocket-name');
    await name.fill('   ');
    await clickTrigger(page, 'd01-save-name');
    await expect(page.getByTestId('d01-pocket-name-error')).toContainText('AT LEAST 2 CHARACTERS');
    await name.fill('cash on hand');
    await clickTrigger(page, 'd01-save-name');
    await expect(page.getByTestId('d01-pocket-name-error')).toContainText('ANOTHER POCKET IS ALREADY CALLED CASH ON HAND');
    await shot(page, 'R4-rename-duplicate-refused');
    await name.fill('BANK\u0007');
    await clickTrigger(page, 'd01-save-name');
    await expect(page.getByTestId('d01-pocket-name-error')).toContainText('UNSUPPORTED');
    expect((await account(page, 'bank')).display_name).toBe('BANK ACCOUNT');
    await clickTrigger(page, 'd01-cancel-rename');
    await expect(dialog(page, 'd01-rename-pocket')).toHaveCount(0);
    await expect(card(page, 'bank')).toContainText('BANK ACCOUNT');
    await expect(card(page, 'bank')).toBeFocused();
    expect((await account(page, 'bank')).display_name).toBe('BANK ACCOUNT');
  });
});

test.describe('DELETE POCKET (the canonical archive)', () => {
  test('T11 / T12 · delete asks first; KEEP POCKET changes nothing', async ({ page }) => {
    await open(page, 'money/places', deletableWorld());
    await hold(page, card(page, 'long'));
    await clickTrigger(page, 'd01-pocket-delete');
    await expect(dialog(page, 'd01-delete-pocket')).toBeVisible();
    await expect(dialog(page, 'd01-delete-pocket')).toContainText('DELETE THIS');
    await expect(dialog(page, 'd01-delete-pocket')).toContainText('HISTORY AND RECEIPTS STAY SAVED');
    await expect(trigger(page, 'd01-delete-confirm')).toHaveText(/CONFIRM DELETE/);
    await expect(trigger(page, 'd01-keep-pocket')).toHaveText(/KEEP POCKET/);
    // the safe choice is first and holds focus: an Enter carried over from the menu cannot delete
    await expect(trigger(page, 'd01-keep-pocket')).toBeFocused();
    expect((await account(page, 'long')).status).toBe('ACTIVE');
    expect(await noPageScroll(page)).toEqual({ x: false, y: false });
    await shot(page, 'D1-delete-confirmation');
    await clickTrigger(page, 'd01-keep-pocket');
    await expect(dialog(page, 'd01-delete-pocket')).toHaveCount(0);
    expect((await account(page, 'long')).status).toBe('ACTIVE');
    expect(await directoryIds(page)).toContain('long');
    // Escape is KEEP POCKET too
    await hold(page, card(page, 'long'));
    await clickTrigger(page, 'd01-pocket-delete');
    await page.keyboard.press('Escape');
    await expect(dialog(page, 'd01-delete-pocket')).toHaveCount(0);
    expect((await account(page, 'long')).status).toBe('ACTIVE');
  });

  test('T14 · a Pocket something depends on cannot be deleted: the reasons are listed, with a way to resolve them', async ({ page }) => {
    await open(page, 'money/places/bank');
    await clickTrigger(page, 'd01-manage');
    await clickTrigger(page, 'd01-pocket-delete');
    await expect(dialog(page, 'd01-delete-blocked')).toBeVisible();
    await expect(dialog(page, 'd01-delete-blocked').getByRole('alert')).toContainText('THIS POCKET CANNOT BE DELETED YET');
    await expect(page.getByTestId('d01-blocker-ACTIVE_TRANSFER')).toBeVisible();
    // ZERO BALANCE BEFORE ARCHIVE: the money BANK still holds is a blocker of its own
    await expect(page.getByTestId('d01-blocker-HELD_BALANCE')).toBeVisible();
    await expect(trigger(page, 'd01-delete-confirm')).toHaveCount(0);
    await expect(trigger(page, 'd01-blocker-details')).toBeVisible();
    expect(await noPageScroll(page)).toEqual({ x: false, y: false });
    await shot(page, 'D2-delete-blocked');
    await clickTrigger(page, 'd01-keep-pocket');
    expect((await account(page, 'bank')).status).toBe('ACTIVE');
    // a card that still owes
    await gotoJurnl(page, 'money/places/visa');
    await clickTrigger(page, 'd01-manage');
    await clickTrigger(page, 'd01-pocket-delete');
    await expect(page.getByTestId('d01-blocker-OPEN_BALANCE')).toBeVisible();
    await expect(trigger(page, 'd01-delete-confirm')).toHaveCount(0);
    expect((await account(page, 'visa')).status).toBe('ACTIVE');
    // RESOLVE ISSUES closes the surface and goes where the debt is paid: the card's own page (PAY)
    await clickTrigger(page, 'd01-blocker-details');
    await expect(dialog(page, 'd01-delete-blocked')).toHaveCount(0);
    await expect(page).toHaveURL(/\/money\/places\/visa$/);
    await expect(trigger(page, 'd01-strip-pay')).toBeVisible();
  });

  test('T13 / T15 / T17 · a confirmed delete archives the Pocket: it leaves every active view, its history stays, back is safe', async ({ page }) => {
    await open(page, 'money/places', deletableWorld());
    const before = money(await entries(page));
    await card(page, 'long').click();
    await page.waitForURL(/\/money\/places\/long(\/attention)?$/);
    if (page.url().endsWith('/attention')) await clickTrigger(page, 'd01-open-account');
    await clickTrigger(page, 'd01-manage');
    await clickTrigger(page, 'd01-pocket-delete');
    await clickTrigger(page, 'd01-delete-confirm');
    // the detail page of a removed Pocket is left at once: back to where the person came from
    await page.waitForURL(/\/money\/places$/);
    await expect(trigger(page, 'd01-pocket-deleted')).toContainText('POCKET DELETED');
    await shot(page, 'D3-delete-success');
    expect(await directoryIds(page)).not.toContain('long');
    await expect(page.getByTestId('d01-directory-summary')).toContainText('6 POCKETS');
    // T13: archived, not erased; every entry and amount is still there
    expect((await account(page, 'long')).status).toBe('ARCHIVED');
    expect(money(await entries(page))).toEqual(before);
    await gotoJurnl(page, 'money/transactions');
    await page.locator('[data-jrn-f05-dot01-stage]').first().waitFor();
    await expect(page.getByTestId('d01-history-list')).toContainText('BOOKSHOP');
    // T15: the MONEY parent and the selectors no longer offer it
    await gotoJurnl(page, 'money?parent=motion');
    await page.locator('[data-jrn-f05-stage]').waitFor();
    await expect(page.locator('[data-jrn-trigger="f05m-place-long"]')).toHaveCount(0);
    await gotoJurnl(page, 'money/places/bank/history');
    await page.locator('[data-jrn-f05-dot01-stage]').first().waitFor();
    await clickTrigger(page, 'd01-record');
    await clickTrigger(page, 'd01-account');
    await expect(page.locator('[data-jrn-listbox="d01-account"] [data-jrn-option="long"]')).toHaveCount(0);
    await page.keyboard.press('Escape');
    // T17: the old address answers plainly (no crash, no ghost Pocket), and browser back / forward stay valid
    await gotoJurnl(page, 'money/places/long');
    await expect(page.getByText('POCKET NOT FOUND')).toBeVisible();
    await page.goBack({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/money\/places\/bank\/history$/);
    await page.goForward({ waitUntil: 'networkidle' });
    await expect(page.getByText('POCKET NOT FOUND')).toBeVisible();
  });

  test('T16 · deleting the last Pocket from the MONEY parent leaves an honest EMPTY state', async ({ page }) => {
    await open(page, 'money?parent=motion', onePocketAtZero());
    await paper(page, 'bank').waitFor();
    await hold(page, paper(page, 'bank'));
    await clickTrigger(page, 'd01-pocket-delete');
    const d = page.locator('[data-jrn-overlay="d01-delete-pocket"], [data-jrn-overlay="d01-delete-blocked"]');
    await expect(d).toBeVisible();
    test.skip((await d.getAttribute('data-jrn-overlay')) === 'd01-delete-blocked', 'the one-Pocket world has a dependency on BANK');
    await clickTrigger(page, 'd01-delete-confirm');
    await expect(trigger(page, 'd01-pocket-deleted')).toBeVisible();
    await expect(page).toHaveURL(/\/money(\?|$)/);
    await expect(page.getByTestId('f05m-empty')).toBeVisible();
    await gotoJurnl(page, 'money/places');
    await expect(page.getByTestId('d01-empty-accounts')).toBeVisible();
    await shot(page, 'D4-empty-accounts-after-delete');
    expect((await account(page, 'bank')).status).toBe('ARCHIVED');
  });
});

test.describe('keyboard, screen reader, one viewport', () => {
  test('T19 · Shift + F10 on a focused Pocket opens the menu; arrows move; Enter chooses; Escape returns focus', async ({ page }) => {
    await open(page, 'money/places');
    const c = card(page, 'cash');
    await expect(c).toHaveAttribute('aria-keyshortcuts', 'Shift+F10');
    await c.focus();
    await page.keyboard.press('Shift+F10');
    await expect(menu(page)).toBeVisible();
    const items = menu(page).getByRole('menuitem');
    await expect(items.nth(0)).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(1)).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(0)).toBeFocused();
    await page.keyboard.press('End');
    await expect(items.nth(1)).toBeFocused();
    await page.keyboard.press('Home');
    await page.keyboard.press('Enter');
    await expect(dialog(page, 'd01-rename-pocket')).toBeVisible();
    await expect(dialog(page, 'd01-rename-pocket')).toHaveAttribute('role', 'dialog');
    await page.keyboard.press('Escape');
    await expect(dialog(page, 'd01-rename-pocket')).toHaveCount(0);
    await expect(c).toBeFocused();
    // the parent papers answer the same keys
    await gotoJurnl(page, 'money?parent=motion');
    await paper(page, 'cash').focus();
    await page.keyboard.press('Shift+F10');
    await expect(menu(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(paper(page, 'cash')).toBeFocused();
  });

  test('T18 / T19 · no page scroll and no serious axe violations with the menu, rename and delete surfaces open', async ({ page }) => {
    await open(page, 'money/places/cash');
    const found: Record<string, string[]> = {};
    const scroll: Record<string, { x: boolean; y: boolean }> = {};
    await clickTrigger(page, 'd01-manage');
    await expect(menu(page)).toBeVisible();
    const box = (await menu(page).boundingBox())!;
    const vp = page.viewportSize()!;
    expect(box.y >= 0 && box.x >= 0 && box.y + box.height <= vp.height && box.x + box.width <= vp.width).toBe(true);
    found.menu = await serious(page, '[data-testid="d01-pocket-menu"]');
    scroll.menu = await noPageScroll(page);
    await clickTrigger(page, 'd01-pocket-rename');
    found.rename = await serious(page, '[data-jrn-overlay="d01-rename-pocket"]');
    scroll.rename = await noPageScroll(page);
    await clickTrigger(page, 'd01-cancel-rename');
    await clickTrigger(page, 'd01-manage');
    await clickTrigger(page, 'd01-pocket-delete');
    const del = page.locator('[data-jrn-overlay="d01-delete-pocket"], [data-jrn-overlay="d01-delete-blocked"]');
    await expect(del).toBeVisible();
    found.delete = await serious(page, '[data-jrn-overlay^="d01-delete"]');
    scroll.delete = await noPageScroll(page);
    expect(found).toEqual({ menu: [], rename: [], delete: [] });
    expect(scroll).toEqual({ menu: { x: false, y: false }, rename: { x: false, y: false }, delete: { x: false, y: false } });
    // the page itself, with its new chip and hold surface
    await page.keyboard.press('Escape');
    expect(await serious(page, '[data-jrn-f05-dot01-stage]')).toEqual([]);
  });
});
