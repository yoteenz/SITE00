/**
 * F12 CREDIT — card statement facts and payment guidance.
 *
 * A credit card is a liability. Its amount owed is the canonical ledger position (entered balance + recorded
 * purchases − recorded payments). Statement balance, statement closing date, payment due date and minimum payment are
 * card terms the user enters; JURNL never invents them and says what is missing.
 *
 * Three separate guidance tracks:
 *   A. PAYMENT SAFETY  — minimum due, due date, how much of the minimum is left after payments already recorded.
 *   B. INTEREST        — remaining statement balance to pay by the due date, only when a grace period can apply.
 *   C. UTILIZATION     — balance ÷ limit, and the payment that would bring a card to a target the user chose.
 * No credit score is shown, predicted or promised, and no payment is ever made automatically.
 */

import type { JurnlAccountRecord } from '../foundation/accounts';
import type { JurnlCreditAttributes } from '../foundation/creditAttributes';
import { addMonthsClamped, compareCalendarDates, daysUntil, formatRelativeDate, isCalendarDate, type CalendarDate } from '../foundation/dates';
import type { JurnlObligation } from '../foundation/obligations';
import type { JurnlReservation } from '../foundation/reservations';
import type { LedgerEntry } from '../home/moneyTypes';
import { ceilCents, sumCents, toCents, type AccountPosition } from '../ledger/accounting';
import { money } from '../ledger/ledgerOps';
import { suggestAccountForPurpose } from '../ledger/purposes';
import { legSettlement, transferViews, CARD_PAYMENT_STATE_LABEL, type TransferView } from '../ledger/transferSettlement';
import { reservedFor, reservedInAccount } from '../f07/reservations';
import { scheduledOccurrences } from '../f07/obligationLifecycle';

export const UTILIZATION_CAUTION = 'NOT A CREDIT SCORE. LOWER USE OF A LIMIT IS OFTEN VIEWED FAVORABLY, BUT NO TARGET GUARANTEES ANY SCORE CHANGE.';
export const REPORTING_CAUTION = 'THE STATEMENT CLOSING DATE AND THE DATE A CARD REPORTS ITS BALANCE ARE NOT ALWAYS THE SAME. ASK YOUR CARD ISSUER IF THE TIMING MATTERS.';

function clampDay(d: number | null | undefined): number | null {
  return d != null && Number.isInteger(d) && d >= 1 && d <= 31 ? d : null;
}

/** Most recent date on or before `today` that falls on `day` of month (clamped for short months). */
export function lastDayOnOrBefore(day: number, today: CalendarDate): CalendarDate {
  const thisMonth = addMonthsClamped(`${today.slice(0, 7)}-01` as CalendarDate, 0, day);
  return compareCalendarDates(thisMonth, today) <= 0 ? thisMonth : addMonthsClamped(thisMonth, -1, day);
}

/** First date strictly after `after` that falls on `day` of month. */
export function firstDayAfter(day: number, after: CalendarDate): CalendarDate {
  const same = addMonthsClamped(`${after.slice(0, 7)}-01` as CalendarDate, 0, day);
  return compareCalendarDates(same, after) > 0 ? same : addMonthsClamped(same, 1, day);
}

/** Next date on or after `today` that falls on `day` of month. */
export function nextDayOnOrAfter(day: number, today: CalendarDate): CalendarDate {
  const same = addMonthsClamped(`${today.slice(0, 7)}-01` as CalendarDate, 0, day);
  return compareCalendarDates(same, today) >= 0 ? same : addMonthsClamped(same, 1, day);
}

export type CardFacts = {
  account: JurnlAccountRecord;
  owed: number;
  limit: number | null;
  availableCredit: number | null;
  statementBalance: number | null;
  statementClosingDate: CalendarDate | null;
  dueDate: CalendarDate | null;
  minimum: number | null;
  /**
   * Payments the card has CONFIRMED (both legs settled) dated after the statement closed. Only these satisfy the
   * minimum. Without a statement closing date no payment can be matched to the cycle, so this is 0.
   */
  paidSinceStatement: number;
  /** Card payments in this cycle that are planned, submitted, or left the account but not yet confirmed by the card. */
  pendingPayments: number;
  pendingPaymentViews: TransferView[];
  /** Confirmed payments that could not be matched to a billing cycle (no statement closing date entered). */
  unmatchedPayments: number;
  /** Minimum still officially due: minimum − confirmed payments. */
  remainingMinimum: number | null;
  /** For planning (Safe to Spend, upcoming): minimum − confirmed − payments already on their way. Counted once. */
  remainingMinimumAfterPending: number | null;
  remainingStatement: number | null;
  daysUntilDue: number | null;
  apr: number | null;
  promoApr: number | null;
  promoAprEnd: CalendarDate | null;
  carriesInterest: boolean | null;
  paymentAccount: JurnlAccountRecord | null;
  paymentAccountReason: string;
  reservedForCard: number;
  termsEnteredOn: CalendarDate | null;
  missing: string[];
};

export function cardFacts(
  position: AccountPosition,
  attrs: JurnlCreditAttributes | null,
  entries: LedgerEntry[],
  reservations: JurnlReservation[],
  accounts: JurnlAccountRecord[],
  purposeAccounts: Partial<Record<string, string>> | undefined,
  today: CalendarDate,
): CardFacts {
  const account = position.account;
  const statementDay = clampDay(attrs?.statement_day);
  const dueDay = clampDay(attrs?.payment_due_day);
  const statementClosingDate =
    attrs?.statement_closing_date && isCalendarDate(attrs.statement_closing_date) ? attrs.statement_closing_date
    : statementDay ? lastDayOnOrBefore(statementDay, today)
    : null;
  let dueDate: CalendarDate | null = null;
  if (attrs?.payment_due_date && isCalendarDate(attrs.payment_due_date)) dueDate = attrs.payment_due_date;
  else if (dueDay && statementClosingDate) dueDate = firstDayAfter(dueDay, statementClosingDate);
  else if (dueDay) dueDate = nextDayOnOrAfter(dueDay, today);
  // Card payments into this card, by settlement. A payment counts toward this statement only when the statement
  // closing date is known and the payment is dated after it.
  const views = transferViews(entries, today).filter((v) => v.kind === 'CARD_PAYMENT' && v.toId === account.account_id);
  const inCycle = (d: CalendarDate | null) => d != null && statementClosingDate != null && compareCalendarDates(d, statementClosingDate) > 0;
  const confirmedIns = entries.filter(
    (e) =>
      e.source === 'ADDED'
      && e.account_id === account.account_id
      && (e.txn_class === 'CREDIT_PAYMENT' || e.txn_class === 'DEBT_PAYMENT')
      && e.direction === 'INCOME'
      && e.occurred_on != null
      && compareCalendarDates(e.occurred_on, today) <= 0
      && legSettlement(e, today) === 'SETTLED',
  );
  const paidSinceStatement = sumCents(confirmedIns.filter((e) => inCycle(e.occurred_on ?? null)).map((e) => e.amount));
  const unmatchedPayments = statementClosingDate ? 0 : sumCents(confirmedIns.filter((e) => daysUntil(e.occurred_on!, today) <= 31).map((e) => e.amount));
  const pendingPaymentViews = views.filter(
    (v) =>
      (v.state === 'PENDING' || v.state === 'IN_TRANSIT' || v.state === 'NEEDS_RECONCILIATION' || (v.state === 'SCHEDULED' && (!dueDate || (v.date != null && compareCalendarDates(v.date, dueDate) <= 0))))
      && (statementClosingDate == null || v.date == null || compareCalendarDates(v.date, statementClosingDate) > 0),
  );
  const pendingPayments = sumCents(pendingPaymentViews.map((v) => v.amount));
  const minimum = attrs?.minimum_payment != null && attrs.minimum_payment >= 0 ? toCents(attrs.minimum_payment) : null;
  const statementBalance = attrs?.statement_balance != null && attrs.statement_balance >= 0 ? toCents(attrs.statement_balance) : null;
  const suggestion = suggestAccountForPurpose('CARD_PAYMENTS', accounts, purposeAccounts);
  const chosen = attrs?.payment_account_id ? accounts.find((a) => a.account_id === attrs.payment_account_id && a.status === 'ACTIVE') ?? null : null;
  const paymentAccount = chosen ?? suggestion.account;
  const missing: string[] = [];
  if (minimum == null) missing.push('MINIMUM PAYMENT');
  if (!dueDate) missing.push('PAYMENT DUE DATE');
  if (position.creditLimit == null) missing.push('CREDIT LIMIT');
  if (statementBalance == null) missing.push('STATEMENT BALANCE');
  if (!statementClosingDate) missing.push('STATEMENT CLOSING DATE');
  return {
    account,
    owed: position.owed,
    limit: position.creditLimit,
    availableCredit: position.availableCredit,
    statementBalance,
    statementClosingDate,
    dueDate,
    minimum,
    paidSinceStatement,
    pendingPayments,
    pendingPaymentViews,
    unmatchedPayments,
    remainingMinimum: minimum == null ? null : toCents(Math.max(0, minimum - paidSinceStatement)),
    remainingMinimumAfterPending: minimum == null ? null : toCents(Math.max(0, minimum - paidSinceStatement - pendingPayments)),
    remainingStatement: statementBalance == null ? null : toCents(Math.max(0, statementBalance - paidSinceStatement)),
    daysUntilDue: dueDate ? daysUntil(today, dueDate) : null,
    apr: attrs?.apr ?? null,
    promoApr: attrs?.promo_apr ?? null,
    promoAprEnd: attrs?.promo_apr_end_date ?? null,
    carriesInterest: attrs?.carries_interest_balance ?? null,
    paymentAccount,
    paymentAccountReason: chosen ? `YOU PAY THIS CARD FROM ${chosen.display_name}.` : suggestion.reason,
    reservedForCard: reservedFor(reservations, 'CARD_PAYMENT', account.account_id),
    termsEnteredOn: attrs?.terms_entered_at ? (attrs.terms_entered_at.slice(0, 10) as CalendarDate) : null,
    missing,
  };
}

// ─── A. Payment safety ───────────────────────────────────────────────────────

export type SafetyState = 'PAST_DUE' | 'DUE_SOON' | 'SCHEDULED' | 'PAYMENT_PENDING' | 'MINIMUM_PAID' | 'MISSING_DATA';

export type SafetyGuidance = { state: SafetyState; line: string; detail: string[] };

export function paymentSafety(f: CardFacts, today: CalendarDate): SafetyGuidance {
  if (f.minimum == null || !f.dueDate) {
    return { state: 'MISSING_DATA', line: `ADD THE ${f.missing.filter((m) => m === 'MINIMUM PAYMENT' || m === 'PAYMENT DUE DATE').join(' AND ')} FROM YOUR STATEMENT TO TRACK THIS PAYMENT.`, detail: [] };
  }
  const when = formatRelativeDate(f.dueDate, today);
  const detail = [
    `MINIMUM DUE ${money(f.minimum)}`,
    `DUE ${when}${f.daysUntilDue != null && f.daysUntilDue > 1 ? ` (${f.daysUntilDue} DAYS)` : ''}`,
    f.paidSinceStatement > 0 ? `${money(f.paidSinceStatement)} CONFIRMED BY THE CARD SINCE THE STATEMENT` : 'NO CONFIRMED PAYMENT SINCE THE STATEMENT',
  ];
  if (f.pendingPayments > 0) {
    detail.push(`${money(f.pendingPayments)} ON ITS WAY: ${f.pendingPaymentViews.map((v) => CARD_PAYMENT_STATE_LABEL[v.state]).join(', ')}`);
  }
  if (f.unmatchedPayments > 0) detail.push(`${money(f.unmatchedPayments)} PAID RECENTLY, NOT MATCHED TO A STATEMENT (ADD THE STATEMENT CLOSING DATE)`);
  if ((f.remainingMinimum ?? 0) <= 0) return { state: 'MINIMUM_PAID', line: `THE MINIMUM FOR ${when} IS PAID AND CONFIRMED.`, detail };
  if ((f.remainingMinimumAfterPending ?? 0) <= 0) {
    return {
      state: 'PAYMENT_PENDING',
      line: `A ${money(f.pendingPayments)} PAYMENT IS ON ITS WAY. ${f.account.display_name} HAS NOT CONFIRMED IT YET. THE MINIMUM OF ${money(f.minimum)} IS DUE ${when}.`,
      detail,
    };
  }
  if (compareCalendarDates(f.dueDate, today) < 0) return { state: 'PAST_DUE', line: `${money(f.remainingMinimum!)} OF THE MINIMUM WAS DUE ${when} AND IS NOT RECORDED AS PAID.`, detail };
  const extra = f.pendingPayments > 0 ? ` ${money(f.remainingMinimumAfterPending!)} IS STILL NEEDED BEYOND PAYMENTS ON THEIR WAY.` : '';
  if ((f.daysUntilDue ?? 99) <= 7) return { state: 'DUE_SOON', line: `YOUR CARD PAYMENT IS DUE ${when}. THE MINIMUM REMAINING IS ${money(f.remainingMinimum!)}.${extra}`, detail };
  return { state: 'SCHEDULED', line: `${money(f.remainingMinimum!)} MINIMUM REMAINING, DUE ${when}.${extra}`, detail };
}

// ─── B. Interest management ──────────────────────────────────────────────────

export type InterestState = 'PAY_STATEMENT' | 'STATEMENT_PAID' | 'CARRYING_BALANCE' | 'MISSING_DATA';

export function interestGuidance(f: CardFacts, today: CalendarDate): { state: InterestState; line: string } {
  if (f.statementBalance == null || !f.dueDate) {
    return { state: 'MISSING_DATA', line: 'ADD THE STATEMENT BALANCE AND DUE DATE TO SEE WHAT PAYING IN FULL WOULD TAKE.' };
  }
  if (f.carriesInterest) {
    return {
      state: 'CARRYING_BALANCE',
      line: `YOU SAID A BALANCE CARRIED OVER FROM AN EARLIER STATEMENT. INTEREST MAY APPLY TO NEW PURCHASES UNTIL THE CARD IS PAID IN FULL. ${money(f.remainingStatement ?? 0)} OF THIS STATEMENT IS LEFT.`,
    };
  }
  if ((f.remainingStatement ?? 0) <= 0) return { state: 'STATEMENT_PAID', line: 'THIS STATEMENT BALANCE IS PAID.' };
  return {
    state: 'PAY_STATEMENT',
    line: `PAYING THE REMAINING ${money(f.remainingStatement!)} STATEMENT BALANCE BY ${formatRelativeDate(f.dueDate, today)} AVOIDS PURCHASE INTEREST ON THIS STATEMENT IF YOUR CARD HAS A GRACE PERIOD. CHECK YOUR CARD TERMS.`,
  };
}

// ─── C. Utilization planning ─────────────────────────────────────────────────

export type UtilizationBasis = 'CURRENT' | 'STATEMENT';

export type UtilizationPlan = {
  basis: UtilizationBasis;
  balance: number;
  limit: number;
  /** balance ÷ limit, as a percent with one decimal (display) and the exact ratio. */
  ratio: number;
  percent: number;
  targetPct: number | null;
  targetBalance: number | null;
  paymentToTarget: number | null;
};

/** Target balance is floored to the cent and the payment rounded up, so following it never lands above the target. */
export function utilizationPlan(balance: number, limit: number | null, targetPct: number | null, basis: UtilizationBasis): UtilizationPlan | null {
  if (limit == null || !(limit > 0)) return null;
  const bal = toCents(Math.max(0, balance));
  const ratio = bal / limit;
  const validTarget = targetPct != null && Number.isFinite(targetPct) && targetPct >= 0 && targetPct <= 100 ? targetPct : null;
  const targetBalance = validTarget == null ? null : Math.floor(limit * validTarget + 1e-7) / 100;
  return {
    basis,
    balance: bal,
    limit: toCents(limit),
    ratio,
    percent: Math.round(ratio * 1000) / 10,
    targetPct: validTarget,
    targetBalance,
    paymentToTarget: targetBalance == null ? null : ceilCents(Math.max(0, bal - targetBalance)),
  };
}

export type OverallUtilization = { balance: number; limit: number; percent: number; ratio: number; included: string[]; excluded: string[] } | null;

/** Combined revolving use across cards whose limit is known. Cards without a limit are listed, never guessed. */
export function overallUtilization(cards: { name: string; balance: number; limit: number | null }[]): OverallUtilization {
  const known = cards.filter((c) => c.limit != null && c.limit > 0);
  if (!known.length) return null;
  const balance = sumCents(known.map((c) => Math.max(0, c.balance)));
  const limit = sumCents(known.map((c) => c.limit!));
  const ratio = balance / limit;
  return { balance, limit, ratio, percent: Math.round(ratio * 1000) / 10, included: known.map((c) => c.name), excluded: cards.filter((c) => !(c.limit != null && c.limit > 0)).map((c) => c.name) };
}

// ─── Paying the card from an account ─────────────────────────────────────────

export type PaymentSourcePlan = {
  account: JurnlAccountRecord | null;
  reason: string;
  held: number;
  /** Already set aside in this account for other payments. */
  setAsideElsewhere: number;
  /** Other bills paid from this account and due on or before the card's due date (minus what is set aside for them). */
  otherBillsBeforeDue: number;
  /** What the account can put toward the card without touching the two lines above. */
  free: number;
  line: string;
};

export function paymentSourcePlan(
  f: CardFacts,
  positions: AccountPosition[],
  obligations: JurnlObligation[],
  entries: LedgerEntry[],
  reservations: JurnlReservation[],
  today: CalendarDate,
): PaymentSourcePlan {
  const acct = f.paymentAccount;
  if (!acct) {
    return { account: null, reason: f.paymentAccountReason, held: 0, setAsideElsewhere: 0, otherBillsBeforeDue: 0, free: 0, line: f.paymentAccountReason };
  }
  const pos = positions.find((p) => p.account_id === acct.account_id);
  const held = pos?.held ?? 0;
  const forThisCard = reservations.filter((r) => r.status === 'ACTIVE' && r.target_kind === 'CARD_PAYMENT' && r.target_id === f.account.account_id && r.account_id === acct.account_id);
  const setAsideElsewhere = toCents(reservedInAccount(reservations, acct.account_id) - sumCents(forThisCard.map((r) => r.amount)));
  const through = f.dueDate ?? today;
  const otherBills = obligations
    .filter((o) => o.status === 'ACTIVE' && o.account_id === acct.account_id)
    .flatMap((o) => scheduledOccurrences(o, entries, through))
    .map((occ) => toCents(Math.max(0, occ.remaining - (occ.isCurrent ? reservedFor(reservations, 'OBLIGATION', occ.obligation.obligation_id, occ.due_date) : 0))));
  const otherBillsBeforeDue = sumCents(otherBills);
  const free = toCents(Math.max(0, held - setAsideElsewhere - otherBillsBeforeDue));
  const stale = pos && pos.freshness === 'OLDER' ? ` LAST UPDATED ${pos.daysSinceUpdate} DAYS AGO.` : '';
  const parts = [`${acct.display_name} HAS ${money(held)} RECORDED.${stale}`];
  if (setAsideElsewhere > 0) parts.push(`${money(setAsideElsewhere)} OF IT IS SET ASIDE FOR OTHER PAYMENTS.`);
  if (otherBillsBeforeDue > 0) parts.push(`${money(otherBillsBeforeDue)} IN OTHER BILLS PAID FROM IT ARE DUE FIRST.`);
  parts.push(`${money(free)} IS FREE FOR THIS CARD.`);
  return { account: acct, reason: f.paymentAccountReason, held, setAsideElsewhere, otherBillsBeforeDue, free, line: parts.join(' ') };
}
