/**
 * F05 DOT 01 — receipt-first purchases (authorities 26–29, 33, 34). Pure functions only: the OCR runs in the
 * browser (runtime/screens/f05/dot01/receiptOcr.ts), the image stays on the device (receiptStore.ts), and the
 * purchase is written through the canonical ledgerOps.buildExpense only after the user reviews and confirms.
 *
 * parseReceiptText reads what the text supports and nothing more: a field it cannot find is null and flagged; a
 * total that disagrees with subtotal + tax (+ tip) is flagged CONFLICTING_TOTALS; line items are offered as read,
 * never confirmed by JURNL. Material values are never guessed.
 */
import type { CalendarDate } from '../../foundation/dates';
import type { LedgerEntry } from '../../home/moneyTypes';
import { toCents } from '../../ledger/accounting';

export type ReceiptWarning = 'NO_MERCHANT' | 'NO_DATE' | 'NO_TOTAL' | 'CONFLICTING_TOTALS' | 'LOW_CONFIDENCE' | 'NO_TEXT';
export type ReceiptRead = {
  merchant: string | null;
  date: CalendarDate | null;
  total: number | null;
  subtotal: number | null;
  tax: number | null;
  tip: number | null;
  items: { name: string; amount: number }[];
  warnings: ReceiptWarning[];
  confidence: number | null;
};

const MONEY = /(-?\d{1,6}(?:[.,]\d{3})*[.,]\d{2})\s*$/;
const num = (s: string) => Number(s.replace(/[,](?=\d{3}\b)/g, '').replace(',', '.'));
const LABELS = { total: /\b(GRAND\s+TOTAL|TOTAL\s+DUE|AMOUNT\s+DUE|BALANCE\s+DUE|TOTAL|TOTALE)\b/, subtotal: /\b(SUB\s*-?\s*TOTAL|SUBTOTAL)\b/, tax: /\b(TAX|VAT|IVA|GST|HST)\b/, tip: /\b(TIP|GRATUITY)\b/ };
const NOT_ITEM = /\b(TOTAL|SUBTOTAL|SUB TOTAL|TAX|VAT|IVA|TIP|GRATUITY|CHANGE|CASH|VISA|MASTERCARD|AMEX|DEBIT|CREDIT|BALANCE|PAID|TENDER|AUTH|CARD)\b/;

function amountOn(line: string): number | null {
  const m = line.replace(/[$€£]/g, '').match(MONEY);
  return m ? num(m[1]!) : null;
}

function parseDate(text: string): CalendarDate | null {
  const t = text.toUpperCase();
  let m = t.match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  if (m) return iso(+m[1]!, +m[2]!, +m[3]!);
  m = t.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2}|\d{2})\b/);
  if (m) {
    const y = m[3]!.length === 2 ? 2000 + +m[3]! : +m[3]!;
    const a = +m[1]!;
    const b = +m[2]!;
    // US order (MM/DD) unless the first part cannot be a month
    return a > 12 ? iso(y, b, a) : iso(y, a, b);
  }
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  m = t.match(/\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\.?\s+(\d{1,2}),?\s+(20\d{2})\b/);
  if (m) return iso(+m[3]!, MONTHS.indexOf(m[1]!) + 1, +m[2]!);
  return null;
}

function iso(y: number, mo: number, d: number): CalendarDate | null {
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}` as CalendarDate;
}

export function parseReceiptText(text: string, confidence: number | null = null): ReceiptRead {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const upper = lines.map((l) => l.toUpperCase());
  const warnings: ReceiptWarning[] = [];
  if (!lines.length) return { merchant: null, date: null, total: null, subtotal: null, tax: null, tip: null, items: [], warnings: ['NO_TEXT', 'NO_MERCHANT', 'NO_DATE', 'NO_TOTAL'], confidence };
  const find = (re: RegExp, exclude?: RegExp) => {
    for (let i = upper.length - 1; i >= 0; i -= 1) {
      const u = upper[i]!;
      if (re.test(u) && !(exclude && exclude.test(u))) {
        const a = amountOn(u);
        if (a != null) return a;
      }
    }
    return null;
  };
  const subtotal = find(LABELS.subtotal);
  const total = find(LABELS.total, LABELS.subtotal);
  const tax = find(LABELS.tax, /\bTOTAL\b/);
  const tip = find(LABELS.tip);
  // merchant: the first line with letters that is not an address, phone, date or amount line
  const merchantLine = upper.slice(0, 5).find((u) => /[A-Z]{3,}/.test(u) && amountOn(u) == null && !/\d{3}[-) ]\d{3}/.test(u) && !parseDate(u) && !/^(\d+\s)?(VIA|RUE|ST|AVE|STREET|ROAD|RD)\b/.test(u) && !/^\d+\s+[A-Z]/.test(u));
  const merchant = merchantLine ? merchantLine.replace(/[^A-Z0-9&' .-]/g, '').trim() || null : null;
  const date = parseDate(upper.join(' '));
  const items: { name: string; amount: number }[] = [];
  for (const u of upper) {
    const a = amountOn(u);
    if (a == null || NOT_ITEM.test(u)) continue;
    const name = u.replace(MONEY, '').replace(/[$€£]/g, '').trim();
    if (name.length >= 2 && /[A-Z]/.test(name) && a > 0) items.push({ name, amount: a });
  }
  if (!merchant) warnings.push('NO_MERCHANT');
  if (!date) warnings.push('NO_DATE');
  if (total == null) warnings.push('NO_TOTAL');
  if (total != null && subtotal != null && tax != null) {
    const expect = toCents(subtotal + tax + (tip ?? 0));
    if (Math.abs(expect - total) > 0.011) warnings.push('CONFLICTING_TOTALS');
  }
  if (confidence != null && confidence < 60) warnings.push('LOW_CONFIDENCE');
  return { merchant, date, total, subtotal, tax, tip, items: items.slice(0, 30), warnings, confidence };
}

export type DuplicateMatch = { entry: LedgerEntry; reason: 'SAME_RECEIPT' | 'SAME_AMOUNT_DATE_MERCHANT' | 'SAME_AMOUNT_DATE_ACCOUNT' };

/**
 * Entries this purchase may duplicate: the same receipt image, or the same amount within a day at the same merchant
 * (or in the same place). A likely duplicate is shown for review; nothing is blocked or saved automatically.
 */
export function findDuplicatePurchase(entries: LedgerEntry[], p: { amount: number; date: CalendarDate | null; merchant: string | null; account_id: string | null; image_sha256?: string | null }): DuplicateMatch[] {
  const out: DuplicateMatch[] = [];
  const day = (d: string | null | undefined) => (d ? Date.parse(`${d}T00:00:00Z`) / 86_400_000 : null);
  const pd = day(p.date);
  const pm = (p.merchant ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  for (const e of entries) {
    if (e.source !== 'ADDED' || e.direction !== 'EXPENSE') continue;
    if (p.image_sha256 && e.receipt?.image_sha256 === p.image_sha256) {
      out.push({ entry: e, reason: 'SAME_RECEIPT' });
      continue;
    }
    if (toCents(Math.abs(e.amount)) !== toCents(Math.abs(p.amount))) continue;
    const ed = day(e.occurred_on ?? null);
    if (pd == null || ed == null || Math.abs(ed - pd) > 1) continue;
    const em = e.merchant.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (pm && em && (em.includes(pm.slice(0, 6)) || pm.includes(em.slice(0, 6)))) out.push({ entry: e, reason: 'SAME_AMOUNT_DATE_MERCHANT' });
    else if (p.account_id && e.account_id === p.account_id) out.push({ entry: e, reason: 'SAME_AMOUNT_DATE_ACCOUNT' });
  }
  return out;
}

export const RECEIPT_MAX_BYTES = 12 * 1024 * 1024;
export const RECEIPT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export function checkReceiptFile(f: { type: string; size: number }): string | null {
  if (!RECEIPT_TYPES.includes(f.type)) return f.type === 'application/pdf' ? 'PDF RECEIPTS CANNOT BE READ ON THIS DEVICE YET. TAKE A PHOTO OR UPLOAD AN IMAGE, OR ENTER IT MANUALLY.' : 'THIS FILE TYPE IS NOT SUPPORTED. USE A JPG, PNG, WEBP OR HEIC PHOTO.';
  if (f.size > RECEIPT_MAX_BYTES) return 'THIS IMAGE IS LARGER THAN 12 MB. TAKE A NEW PHOTO OR UPLOAD A SMALLER IMAGE.';
  return null;
}
