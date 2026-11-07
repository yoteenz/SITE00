/**
 * Reconciliation of imported transactions with each other and with what the user recorded. Pure and deterministic.
 *
 * Every financial event is counted once:
 *   TRANSFER          OUT leg on one of the user's accounts + IN leg on another → one transfer (never income/spending)
 *   CARD_PAYMENT      payment leaving a bank account + the same payment arriving on the card → one liability payment
 *   EARNINGS_PAYOUT   a rideshare payout that the user already recorded as daily earnings → counted once, through the
 *                     earnings record (which holds gross / tips detail; a bank payout never fabricates gross)
 *   CASH_WITHDRAWAL   an ATM withdrawal + a Cash on Hand increase the user recorded → one movement into cash
 *   BILL_PAYMENT      an imported payment that pays a tracked bill occurrence → the bill is paid, not deducted again
 *   RECEIPT / MANUAL_DUPLICATE  a purchase the user recorded (from a receipt or by hand) that the bank also reports →
 *                     the bank record counts, the user's entry is kept as confirmed-by-bank history
 *
 * Auto-matching needs evidence beyond an equal amount (provider category, description, same account, known pair).
 * Anything weaker is SUGGESTED for the user to confirm. A user's CONFIRMED or REJECTED decision is never overridden.
 */
import type { JurnlAccountRecord } from '../foundation/accounts';
import { daysUntil, type CalendarDate } from '../foundation/dates';
import type { JurnlDailyEarnings } from '../foundation/dailyEarnings';
import type { JurnlObligation } from '../foundation/obligations';
import type { JurnlReservation } from '../foundation/reservations';
import type { BankMatchKind, BankMatchStatus, LedgerEntry } from '../home/moneyTypes';
import { accountNature, toCents } from '../ledger/accounting';
import { settleReservationsForPayment } from '../f07/reservations';
import { hasCardPaymentWords, hasCardSidePaymentWords, hasTransferWords, isRidesharePayerText } from './classify';
import { stableId } from './ingest';
import type { MatchDecision } from './types';

export type ReconcileInput = {
  entries: LedgerEntry[];
  accounts: JurnlAccountRecord[];
  obligations: JurnlObligation[];
  dailyEarnings: JurnlDailyEarnings[];
  reservations: JurnlReservation[];
  previous: MatchDecision[];
  now: string;
};

export type ReconcileOutput = { entries: LedgerEntry[]; changed: LedgerEntry[]; matches: MatchDecision[]; reservations: JurnlReservation[] };

const MATCH_LINK_PREFIX = 'm-';

function txt(e: LedgerEntry): string {
  const o = e.import?.original;
  return [e.merchant, o?.name, o?.merchant_name, ...(o?.counterparty_names ?? [])].filter(Boolean).join(' ').toUpperCase();
}

function days(a: string | null | undefined, b: string | null | undefined): number | null {
  if (!a || !b) return null;
  return daysUntil(a as CalendarDate, b as CalendarDate);
}

function tokens(s: string): Set<string> {
  return new Set(s.toUpperCase().split(/[^A-Z0-9]+/).filter((t) => t.length >= 4 && !['CARD', 'PURCHASE', 'DEBIT', 'POS', 'PAYMENT', 'ONLINE', 'STORE'].includes(t)));
}

function overlaps(a: string, b: string): boolean {
  const ta = tokens(a);
  for (const t of tokens(b)) if (ta.has(t)) return true;
  return false;
}

const activeImported = (e: LedgerEntry) => e.source === 'IMPORTED' && e.import?.provider_state === 'ACTIVE';
const userEntry = (e: LedgerEntry) => e.source === 'ADDED';
const cents = (n: number) => Math.round(toCents(Math.abs(n)) * 100);

/** Clears every field a previous reconciliation wrote, so each run starts from the provider data + user decisions. */
function clearReconciliation(e: LedgerEntry): LedgerEntry {
  if (e.source === 'IMPORTED') {
    const link = e.link && e.link.id.startsWith(MATCH_LINK_PREFIX) ? null : e.link;
    return { ...e, bank_match: null, link: link ?? null, counterparty_account_id: link ? e.counterparty_account_id : null, obligation_id: e.bank_match?.kind === 'BILL_PAYMENT' ? null : e.obligation_id, occurrence_date: e.bank_match?.kind === 'BILL_PAYMENT' ? null : e.occurrence_date };
  }
  return e.bank_match ? { ...e, bank_match: null } : e;
}

type Candidate = { kind: BankMatchKind; ids: string[]; signals: string[]; strong: boolean; target?: MatchDecision['target']; countedBy: string | null };

export function reconcileLedger(input: ReconcileInput): ReconcileOutput {
  const byId = new Map(input.entries.map((e) => [e.id, clearReconciliation(e)]));
  const accounts = new Map(input.accounts.map((a) => [a.account_id, a]));
  const decided = new Map(input.previous.filter((m) => m.status === 'CONFIRMED' || m.status === 'REJECTED').map((m) => [m.match_id, m]));
  const rejected = new Set([...decided.values()].filter((m) => m.status === 'REJECTED').map((m) => m.match_id));
  const confirmedPairs = new Set([...decided.values()].filter((m) => m.status === 'CONFIRMED' && m.kind === 'TRANSFER').map((m) => m.entry_ids.map((id) => byId.get(id)?.account_id).sort().join('|')));
  const used = new Set<string>();
  const out: MatchDecision[] = [];
  const isLiability = (e: LedgerEntry) => {
    const a = e.account_id ? accounts.get(e.account_id) : undefined;
    return a ? accountNature(a.account_type) === 'LIABILITY' : false;
  };
  const matchId = (kind: string, ids: string[]) => stableId(MATCH_LINK_PREFIX.slice(0, 1), `${kind}|${[...ids].sort().join('|')}`);

  // User decisions first: they hold regardless of what the heuristics would say.
  for (const m of decided.values()) {
    if (m.status !== 'CONFIRMED') continue;
    if (!m.entry_ids.every((id) => byId.has(id))) continue;
    m.entry_ids.forEach((id) => used.add(id));
    out.push(m);
  }

  const imported = [...byId.values()].filter(activeImported).sort((a, b) => (a.occurred_on ?? '').localeCompare(b.occurred_on ?? '') || a.id.localeCompare(b.id));
  const free = (e: LedgerEntry) => !used.has(e.id);

  const decide = (cands: Candidate[]) => {
    // A candidate is unique when none of its entries appears in another candidate of this pass.
    const count = new Map<string, number>();
    for (const c of cands) for (const id of c.ids) count.set(id, (count.get(id) ?? 0) + 1);
    for (const c of cands) {
      const id = matchId(c.kind, c.ids);
      if (rejected.has(id) || c.ids.some((x) => used.has(x))) continue;
      const unique = c.ids.every((x) => count.get(x) === 1);
      const status: BankMatchStatus = unique && c.strong ? 'AUTO_MATCHED' : 'SUGGESTED';
      if (status === 'AUTO_MATCHED') c.ids.forEach((x) => used.add(x));
      out.push({ match_id: id, kind: c.kind, status, entry_ids: c.ids, target: c.target ?? null, counted_by: c.countedBy, signals: c.signals, decided_at: input.now });
    }
  };

  // 1. Card payments (bank OUT ↔ card IN).
  {
    const cands: Candidate[] = [];
    const outs = imported.filter((e) => free(e) && e.direction === 'EXPENSE' && !isLiability(e));
    const ins = imported.filter((e) => free(e) && e.direction === 'INCOME' && isLiability(e));
    for (const o of outs) {
      const oSays = o.txn_class === 'CREDIT_PAYMENT' || hasCardPaymentWords(txt(o));
      for (const i of ins) {
        if (cents(o.amount) !== cents(i.amount)) continue;
        const d = days(o.occurred_on, i.occurred_on);
        if (d == null || d < -1 || d > 7) continue;
        const iSays = i.txn_class === 'CREDIT_PAYMENT' || hasCardSidePaymentWords(txt(i));
        if (!oSays && !iSays) continue;
        const signals = ['EQUAL_AMOUNT', `WITHIN_${Math.abs(d)}_DAYS`, ...(oSays ? ['BANK_SIDE_SAYS_CARD_PAYMENT'] : []), ...(iSays ? ['CARD_SIDE_SAYS_PAYMENT'] : [])];
        cands.push({ kind: 'CARD_PAYMENT', ids: [o.id, i.id], signals, strong: true, countedBy: o.id });
      }
    }
    decide(cands);
  }

  // 2. Transfers between the user's own accounts (imported ↔ imported).
  {
    const cands: Candidate[] = [];
    const outs = imported.filter((e) => free(e) && e.direction === 'EXPENSE' && !isLiability(e) && e.txn_class !== 'CREDIT_PAYMENT');
    const ins = imported.filter((e) => free(e) && e.direction === 'INCOME' && !isLiability(e));
    for (const o of outs) {
      for (const i of ins) {
        if (i.account_id === o.account_id || cents(o.amount) !== cents(i.amount)) continue;
        const d = days(o.occurred_on, i.occurred_on);
        if (d == null || d < -1 || d > 5) continue;
        const signals = ['EQUAL_AMOUNT', `WITHIN_${Math.abs(d)}_DAYS`];
        if (o.txn_class === 'TRANSFER' || i.txn_class === 'TRANSFER' || o.category === 'TRANSFER' || i.category === 'TRANSFER') signals.push('BANK_SAYS_TRANSFER');
        if (hasTransferWords(txt(o)) || hasTransferWords(txt(i))) signals.push('DESCRIPTION_SAYS_TRANSFER');
        const ia = i.account_id ? accounts.get(i.account_id) : undefined;
        const oa = o.account_id ? accounts.get(o.account_id) : undefined;
        if ((ia?.masked_identifier && txt(o).includes(ia.masked_identifier)) || (oa?.masked_identifier && txt(i).includes(oa.masked_identifier))) signals.push('DESCRIPTION_NAMES_OTHER_ACCOUNT');
        if (confirmedPairs.has([o.account_id, i.account_id].sort().join('|'))) signals.push('KNOWN_TRANSFER_PAIR');
        // Income from a known payer is earnings, not a transfer, even when an amount happens to match.
        if (isRidesharePayerText(txt(i))) continue;
        cands.push({ kind: 'TRANSFER', ids: [o.id, i.id], signals, strong: signals.length > 2, countedBy: o.id });
      }
    }
    decide(cands);
  }

  // 3. User-recorded entries the bank also reports (receipts, manual purchases, manual transfer / payment legs).
  {
    const cands: Candidate[] = [];
    const mine = [...byId.values()].filter((e) => userEntry(e) && free(e) && e.account_id && accounts.get(e.account_id)?.connection);
    for (const m of mine) {
      for (const i of imported) {
        if (!free(i) || i.account_id !== m.account_id || i.direction !== m.direction || cents(i.amount) !== cents(m.amount)) continue;
        const d = days(m.occurred_on, i.occurred_on);
        if (d == null || Math.abs(d) > 3) continue;
        const kind: BankMatchKind = m.receipt ? 'RECEIPT' : m.link?.kind === 'TRANSFER' ? 'TRANSFER' : m.link?.kind === 'CARD_PAYMENT' ? 'CARD_PAYMENT' : m.link?.kind === 'DAILY_EARNINGS' ? 'EARNINGS_PAYOUT' : 'MANUAL_DUPLICATE';
        const signals = ['SAME_ACCOUNT', 'EQUAL_AMOUNT', `WITHIN_${Math.abs(d)}_DAYS`];
        const merchant = overlaps(m.merchant, txt(i));
        if (merchant) signals.push('MERCHANT_MATCHES');
        if (m.receipt) signals.push('RECEIPT');
        const legKind = kind === 'TRANSFER' || kind === 'CARD_PAYMENT';
        if (legKind && (i.txn_class === 'TRANSFER' || i.txn_class === 'CREDIT_PAYMENT')) signals.push('BANK_SAYS_SAME_KIND');
        if (kind === 'EARNINGS_PAYOUT' && isRidesharePayerText(txt(i))) signals.push('KNOWN_PAYER');
        const strong = Math.abs(d) <= 2 && (merchant || signals.includes('BANK_SAYS_SAME_KIND') || signals.includes('KNOWN_PAYER'));
        // Earnings: the user's record (gross / tips detail) counts; elsewhere the bank's record counts.
        cands.push({ kind, ids: [m.id, i.id], signals, strong, countedBy: kind === 'EARNINGS_PAYOUT' ? m.id : i.id });
      }
    }
    decide(cands);
  }

  // 4. Rideshare payouts vs daily earnings recorded on another account / without a ledger match above.
  {
    const cands: Candidate[] = [];
    const legs = [...byId.values()].filter((e) => userEntry(e) && free(e) && e.link?.kind === 'DAILY_EARNINGS' && e.link.leg === 'DIGITAL');
    for (const p of imported.filter((e) => free(e) && e.direction === 'INCOME' && isRidesharePayerText(txt(e)))) {
      for (const leg of legs) {
        if (cents(leg.amount) !== cents(p.amount)) continue;
        const d = days(leg.occurred_on, p.occurred_on);
        if (d == null || d < 0 || d > 7) continue;
        const sameAccount = leg.account_id === p.account_id;
        const earnings = input.dailyEarnings.find((r) => r.ledger_entry_ids.includes(leg.id));
        cands.push({
          kind: 'EARNINGS_PAYOUT',
          ids: [leg.id, p.id],
          signals: ['EQUAL_AMOUNT', 'KNOWN_PAYER', `PAID_${d}_DAYS_AFTER_WORK`, ...(sameAccount ? ['SAME_ACCOUNT'] : [])],
          strong: sameAccount && d <= 3,
          target: earnings ? { earnings_id: earnings.earnings_id } : null,
          countedBy: leg.id,
        });
      }
    }
    decide(cands);
  }

  // 5. Cash withdrawals → Cash on Hand (the user's recorded cash increase), else a suggestion to record it.
  {
    const cands: Candidate[] = [];
    const cashIns = [...byId.values()].filter((e) => userEntry(e) && free(e) && e.direction === 'INCOME' && e.account_id && accounts.get(e.account_id)?.account_type === 'CASH');
    for (const w of imported.filter((e) => free(e) && e.direction === 'EXPENSE' && e.category_detail === 'CASH WITHDRAWAL')) {
      let found = false;
      for (const c of cashIns) {
        if (cents(c.amount) !== cents(w.amount)) continue;
        const d = days(w.occurred_on, c.occurred_on);
        if (d == null || Math.abs(d) > 2) continue;
        found = true;
        cands.push({ kind: 'CASH_WITHDRAWAL', ids: [w.id, c.id], signals: ['EQUAL_AMOUNT', 'BANK_SAYS_WITHDRAWAL', `WITHIN_${Math.abs(d)}_DAYS`], strong: true, countedBy: w.id });
      }
      if (!found) out.push({ match_id: matchId('CASH_WITHDRAWAL', [w.id]), kind: 'CASH_WITHDRAWAL', status: 'SUGGESTED', entry_ids: [w.id], target: null, counted_by: null, signals: ['BANK_SAYS_WITHDRAWAL', 'NO_CASH_ENTRY_YET'], decided_at: input.now });
    }
    decide(cands.filter((c) => !rejected.has(matchId(c.kind, c.ids))));
  }

  // 6. Bill payments (imported spending ↔ a tracked bill occurrence).
  {
    const cands: Candidate[] = [];
    for (const e of imported.filter((x) => free(x) && x.direction === 'EXPENSE' && x.txn_class !== 'TRANSFER' && x.txn_class !== 'CREDIT_PAYMENT')) {
      for (const ob of input.obligations) {
        if (ob.status !== 'ACTIVE' || !(ob.amount > 0)) continue;
        const nameHit = overlaps(ob.name, txt(e));
        const exact = cents(ob.amount) === cents(e.amount);
        const close = Math.abs(toCents(e.amount) - ob.amount) <= ob.amount * 0.2;
        const d = days(ob.next_due_date, e.occurred_on);
        if (d == null || Math.abs(d) > 10) continue;
        if (!nameHit && !(exact && Math.abs(d) <= 3)) continue;
        if (!exact && !close) continue;
        const signals = [exact ? 'EQUAL_AMOUNT' : 'AMOUNT_WITHIN_20_PERCENT', `${Math.abs(d)}_DAYS_FROM_DUE_DATE`, ...(nameHit ? ['NAME_MATCHES_BILL'] : [])];
        cands.push({ kind: 'BILL_PAYMENT', ids: [e.id], signals, strong: nameHit && exact && Math.abs(d) <= 5, target: { obligation_id: ob.obligation_id, occurrence_date: ob.next_due_date }, countedBy: e.id });
      }
    }
    // Two bills claiming one transaction is ambiguous: none is automatic.
    const per = new Map<string, number>();
    for (const c of cands) per.set(c.ids[0], (per.get(c.ids[0]) ?? 0) + 1);
    decide(cands.map((c) => ({ ...c, strong: c.strong && per.get(c.ids[0]) === 1 })));
  }

  // Apply AUTO_MATCHED and CONFIRMED decisions to the entries.
  let reservations = input.reservations;
  const prevById = new Map(input.previous.map((m) => [m.match_id, m]));
  for (const m of out) {
    if (m.status !== 'AUTO_MATCHED' && m.status !== 'CONFIRMED') continue;
    const legs = m.entry_ids.map((id) => byId.get(id)).filter((e): e is LedgerEntry => Boolean(e));
    for (const e of legs) {
      const superseded = m.counted_by != null && m.counted_by !== e.id && (m.kind === 'RECEIPT' || m.kind === 'MANUAL_DUPLICATE' || m.kind === 'EARNINGS_PAYOUT' || (m.kind !== 'BILL_PAYMENT' && e.source === 'ADDED' && legs.some((x) => x.source === 'IMPORTED' && x.account_id === e.account_id)));
      const patch: LedgerEntry = { ...e, bank_match: { match_id: m.match_id, kind: m.kind, status: m.status, superseded, counted_by: m.counted_by, other_ids: m.entry_ids.filter((x) => x !== e.id) } };
      if (e.source === 'IMPORTED' && (m.kind === 'TRANSFER' || m.kind === 'CARD_PAYMENT' || m.kind === 'CASH_WITHDRAWAL') && legs.length === 2) {
        const other = legs.find((x) => x.id !== e.id)!;
        if (other.source === 'IMPORTED' || m.kind === 'CASH_WITHDRAWAL') {
          patch.txn_class = m.kind === 'CARD_PAYMENT' ? 'CREDIT_PAYMENT' : 'TRANSFER';
          patch.category = m.kind === 'CARD_PAYMENT' ? 'DEBT PAYMENT' : 'TRANSFER';
          patch.link = { kind: m.kind === 'CARD_PAYMENT' ? 'CARD_PAYMENT' : 'TRANSFER', id: m.match_id, leg: e.direction === 'EXPENSE' ? 'OUT' : 'IN' };
          patch.counterparty_account_id = other.account_id ?? null;
        }
      }
      if (m.kind === 'BILL_PAYMENT' && m.target?.obligation_id) {
        patch.obligation_id = m.target.obligation_id;
        patch.occurrence_date = (m.target.occurrence_date as CalendarDate) ?? null;
      }
      byId.set(e.id, patch);
    }
    // Money set aside for a bill the bank shows paid is used / released once (never twice across re-syncs).
    if (m.kind === 'BILL_PAYMENT' && m.target?.obligation_id && !prevById.get(m.match_id)?.target?.reservation_ids) {
      const e = legs[0];
      const settled = settleReservationsForPayment(reservations, 'OBLIGATION', m.target.obligation_id, (m.target.occurrence_date as CalendarDate) ?? null, e.amount, e.account_id ?? '', 0, null);
      if (settled.upsert.length) {
        const ids = new Set(settled.upsert.map((r) => r.reservation_id));
        reservations = [...reservations.filter((r) => !ids.has(r.reservation_id)), ...settled.upsert];
      }
      m.target = { ...m.target, reservation_ids: settled.upsert.map((r) => r.reservation_id) };
    } else if (m.kind === 'BILL_PAYMENT') {
      m.target = { ...m.target, reservation_ids: prevById.get(m.match_id)?.target?.reservation_ids ?? [] };
    }
  }

  const entries = input.entries.map((e) => byId.get(e.id) ?? e);
  const changed = entries.filter((e, i) => JSON.stringify(e) !== JSON.stringify(input.entries[i]));
  return { entries, changed, matches: out, reservations };
}
