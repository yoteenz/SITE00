/**
 * Shared transfer / card-payment amount guards (F05 DOT 01 + canonical ledgerOps).
 * Prevents overpaying a liability (extra would vanish at 0 owed) and cash below zero.
 */
import type { JurnlAccountRecord } from '../foundation/accounts';
import type { CalendarDate } from '../foundation/dates';
import type { LedgerEntry } from '../home/moneyTypes';
import { formatMoney as money } from '../home/currency';
import { computeLedgerPositions, legSettlement, toCents } from './accounting';

const OPEN_CARD_PAYMENT_LEG = new Set(['SCHEDULED', 'PENDING', 'NEEDS_RECONCILIATION']);

export type TransferLimitResult =
  | { ok: true; warnings: string[] }
  | { ok: false; error: string };

function openCardPaymentTotal(entries: LedgerEntry[], cardAccountId: string, today: CalendarDate): number {
  return toCents(
    entries
      .filter(
        (e) =>
          e.link?.kind === 'CARD_PAYMENT'
          && e.account_id === cardAccountId
          && OPEN_CARD_PAYMENT_LEG.has(legSettlement(e, today)),
      )
      .reduce((t, e) => t + Math.abs(e.amount), 0),
  );
}

/**
 * Validates a proposed transfer amount against canonical positions and in-flight card payments.
 * Used by buildTransfer (authoritative) and DOT 01 preview (same rules before save).
 */
export function validateTransferFinancialLimits(
  accounts: JurnlAccountRecord[],
  creditAttributes: Parameters<typeof computeLedgerPositions>[1],
  entries: LedgerEntry[],
  fromAccountId: string | null,
  toAccountId: string | null,
  amount: number,
  today: CalendarDate,
): TransferLimitResult {
  const positions = computeLedgerPositions(accounts, creditAttributes, entries, today).positions;
  const pay = toCents(Math.abs(amount));
  const from = positions.find((p) => p.account_id === fromAccountId);
  const to = positions.find((p) => p.account_id === toAccountId);
  if (to?.nature === 'LIABILITY' && toAccountId) {
    const outstanding = openCardPaymentTotal(entries, toAccountId, today);
    const left = toCents(to.owed - outstanding);
    if (pay > left) {
      return {
        ok: false,
        error:
          left <= 0
            ? `${to.account.display_name} HAS NOTHING LEFT TO PAY (PAYMENTS ALREADY RECORDED COVER WHAT IT OWES). REVIEW THE CARD BALANCE FIRST.`
            : `THIS IS MORE THAN ${to.account.display_name} OWES AFTER PAYMENTS ALREADY RECORDED (${money(left)}). RECORD UP TO ${money(left)}, OR REVIEW THE CARD BALANCE FIRST.`,
      };
    }
  }
  const warnings: string[] = [];
  if (from && from.nature === 'ASSET' && pay > from.held) {
    if (from.account.account_type === 'CASH') {
      return { ok: false, error: `${from.account.display_name} HOLDS ONLY ${money(from.held)}.` };
    }
    warnings.push(`THIS IS MORE THAN ${from.account.display_name} HOLDS (${money(from.held)}). IT WILL SHOW BELOW ZERO.`);
  }
  return { ok: true, warnings };
}
