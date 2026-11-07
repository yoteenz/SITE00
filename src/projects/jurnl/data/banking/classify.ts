/**
 * Deterministic classification of imported transactions, in JURNL's existing taxonomy (no AI, no network).
 *
 * Precedence (first that applies wins):
 *   1. the user's correction of this transaction (YOUR_CORRECTION)
 *   2. the user's rules (YOUR_RULE)
 *   3. known payers / counterparties — rideshare platforms (KNOWN_PAYER)
 *   4. the provider's personal finance category (BANK_CATEGORY)
 *   5. the account type (ACCOUNT_TYPE)
 *   6. merchant / description patterns (MERCHANT_PATTERN)
 * Confidence is never invented: only the provider's own confidence level is carried, and only for BANK_CATEGORY.
 */
import type { AccountType, SpendCategoryId, TxnClass } from '../foundation/categories';
import type { ClassificationBasis } from '../home/moneyTypes';
import type { BankTransactionView, ClassificationRule, ImportOverride } from './types';

export type Classification = {
  category: SpendCategoryId;
  category_detail: string | null;
  txn_class: TxnClass;
  basis: ClassificationBasis;
  provider_confidence: string | null;
  rule_id: string | null;
  flags: { internal_transfer: boolean; rideshare_earnings: boolean; refund: boolean; cash_withdrawal: boolean; card_payment: boolean; fee: boolean };
};

export const RIDESHARE_PAYERS = ['UBER', 'LYFT', 'BRANCH MESSENGER', 'PAYFARE', 'DOORDASH', 'INSTACART'] as const;
const TRANSFER_WORDS = ['TRANSFER', 'XFER', 'TRNSFR', 'TO SAVINGS', 'FROM SAVINGS', 'TO CHECKING', 'FROM CHECKING', 'INSTANT PAY', 'INSTANT TRANSFER', 'ONLINE BANKING TRANSFER', 'INTERNAL TRANSFER'];
/** Words that name a CARD payment on the paying (bank) side. "AUTOPAY" alone is not one: utilities use it too. */
const CARD_PAYMENT_WORDS = ['CREDIT CARD PAYMENT', 'CARD PAYMENT', 'CRD PMT', 'CREDIT CRD', 'CARDMEMBER SERV', 'PAYMENT TO CREDIT CARD'];
/** Words a card issuer uses for a payment received on the card itself (only read on a card account). */
const CARD_SIDE_PAYMENT_WORDS = ['PAYMENT THANK YOU', 'PAYMENT - THANK YOU', 'AUTOPAY', 'AUTO PAY', 'PAYMENT RECEIVED', 'ONLINE PAYMENT', 'EPAYMENT', 'MOBILE PAYMENT'];

export function textOf(t: Pick<BankTransactionView, 'name' | 'merchant_name' | 'counterparty_names'>): string {
  return [t.merchant_name, t.name, ...(t.counterparty_names ?? [])].filter(Boolean).join(' ').toUpperCase();
}

export function isRidesharePayerText(text: string): boolean {
  return RIDESHARE_PAYERS.some((p) => text.includes(p));
}

export function hasTransferWords(text: string): boolean {
  return TRANSFER_WORDS.some((w) => text.includes(w));
}

export function hasCardPaymentWords(text: string): boolean {
  return CARD_PAYMENT_WORDS.some((w) => text.includes(w));
}

export function hasCardSidePaymentWords(text: string): boolean {
  return CARD_SIDE_PAYMENT_WORDS.some((w) => text.includes(w)) || hasCardPaymentWords(text);
}

/** Plaid PFC detailed → JURNL category + finer label. Unknown values fall through to the primary mapping. */
const PFC_DETAILED: Record<string, [SpendCategoryId, string | null]> = {
  FOOD_AND_DRINK_GROCERIES: ['FOOD', 'GROCERIES'],
  FOOD_AND_DRINK_RESTAURANT: ['FOOD', 'DINING'],
  FOOD_AND_DRINK_FAST_FOOD: ['FOOD', 'DINING'],
  FOOD_AND_DRINK_COFFEE: ['FOOD', 'DINING'],
  TRANSPORTATION_GAS: ['TRANSPORT', 'GAS'],
  TRANSPORTATION_PARKING: ['TRANSPORT', 'PARKING'],
  TRANSPORTATION_TOLLS: ['TRANSPORT', 'TOLLS'],
  TRANSPORTATION_TAXIS_AND_RIDE_SHARES: ['TRANSPORT', 'RIDES'],
  GENERAL_MERCHANDISE_CLOTHING_AND_ACCESSORIES: ['CLOTHING', 'SHOPPING'],
  RENT_AND_UTILITIES_RENT: ['HOUSING', 'RENT'],
  ENTERTAINMENT_TV_AND_MOVIES: ['MEMBERSHIP', 'SUBSCRIPTION'],
  ENTERTAINMENT_MUSIC_AND_AUDIO: ['MEMBERSHIP', 'SUBSCRIPTION'],
  GENERAL_SERVICES_INSURANCE: ['UTILITIES', 'INSURANCE'],
  BANK_FEES_ATM_FEES: ['OTHER', 'FEES'],
  BANK_FEES_OVERDRAFT_FEES: ['OTHER', 'FEES'],
  BANK_FEES_INTEREST_CHARGE: ['DEBT_PAYMENT', 'INTEREST'],
  BANK_FEES_OTHER_BANK_FEES: ['OTHER', 'FEES'],
  BANK_FEES_FOREIGN_TRANSACTION_FEES: ['OTHER', 'FEES'],
  BANK_FEES_INSUFFICIENT_FUNDS: ['OTHER', 'FEES'],
  TRANSFER_IN_SAVINGS: ['TRANSFER', 'SAVINGS'],
  TRANSFER_OUT_SAVINGS: ['TRANSFER', 'SAVINGS'],
  TRANSFER_OUT_WITHDRAWAL: ['TRANSFER', 'CASH WITHDRAWAL'],
  TRANSFER_IN_CASH_ADVANCES_AND_LOANS: ['TRANSFER', 'CASH ADVANCE'],
  LOAN_PAYMENTS_CREDIT_CARD_PAYMENT: ['DEBT_PAYMENT', 'CARD PAYMENT'],
  INCOME_WAGES: ['INCOME', 'WAGES'],
};

const PFC_PRIMARY: Record<string, [SpendCategoryId, string | null]> = {
  FOOD_AND_DRINK: ['FOOD', 'DINING'],
  TRANSPORTATION: ['TRANSPORT', null],
  TRAVEL: ['TRAVEL', null],
  RENT_AND_UTILITIES: ['UTILITIES', 'BILLS'],
  MEDICAL: ['HEALTH', null],
  PERSONAL_CARE: ['HEALTH', 'PERSONAL CARE'],
  GENERAL_MERCHANDISE: ['OTHER', 'SHOPPING'],
  HOME_IMPROVEMENT: ['HOUSING', 'HOME'],
  ENTERTAINMENT: ['OTHER', 'ENTERTAINMENT'],
  GENERAL_SERVICES: ['OTHER', 'SERVICES'],
  GOVERNMENT_AND_NON_PROFIT: ['OTHER', 'GOVERNMENT'],
  LOAN_PAYMENTS: ['DEBT_PAYMENT', null],
  BANK_FEES: ['OTHER', 'FEES'],
  TRANSFER_IN: ['TRANSFER', null],
  TRANSFER_OUT: ['TRANSFER', null],
  INCOME: ['INCOME', null],
};

const MERCHANT_PATTERNS: [RegExp, SpendCategoryId, string | null][] = [
  [/\b(WHOLE FOODS|TRADER JOE|SAFEWAY|KROGER|ALDI|PUBLIX|WEGMANS|SPROUTS|GROCERY|MARKET)\b/, 'FOOD', 'GROCERIES'],
  [/\b(SHELL|CHEVRON|EXXON|MOBIL|ARCO|SUNOCO|GAS|FUEL)\b/, 'TRANSPORT', 'GAS'],
  [/\b(NETFLIX|SPOTIFY|HULU|DISNEY|APPLE\.COM\/BILL|YOUTUBE PREMIUM|PATREON)\b/, 'MEMBERSHIP', 'SUBSCRIPTION'],
  [/\b(STARBUCKS|MCDONALD|CHIPOTLE|RESTAURANT|CAFE|PIZZA)\b/, 'FOOD', 'DINING'],
  [/\b(AMAZON|TARGET|WALMART|COSTCO)\b/, 'OTHER', 'SHOPPING'],
];

function ruleMatches(rule: ClassificationRule, t: BankTransactionView, jurnlAccountId: string | null): boolean {
  if (!rule.enabled) return false;
  const m = rule.match;
  if (!m.text && !m.account_id && !m.direction && !m.pfc_detailed) return false;
  if (m.text && !textOf(t).includes(m.text.toUpperCase())) return false;
  if (m.account_id && m.account_id !== jurnlAccountId) return false;
  if (m.direction && m.direction !== (t.amount > 0 ? 'OUT' : 'IN')) return false;
  if (m.pfc_detailed && m.pfc_detailed !== t.pfc_detailed) return false;
  return true;
}

function baseClass(direction: 'IN' | 'OUT', accountType: AccountType, category: SpendCategoryId, flags: Classification['flags']): TxnClass {
  const liability = accountType === 'CREDIT_CARD' || accountType === 'LOAN';
  if (flags.card_payment) return accountType === 'LOAN' ? 'DEBT_PAYMENT' : 'CREDIT_PAYMENT';
  if (flags.internal_transfer || flags.cash_withdrawal || category === 'TRANSFER') return 'TRANSFER';
  if (flags.refund) return 'REFUND';
  if (direction === 'OUT') return liability ? 'CREDIT_PURCHASE' : 'EXPENSE';
  // Money in: on a card it is a refund unless marked as a payment above; on an asset account it is income until the
  // user or a match says otherwise (an unexplained deposit stays correctable, basis UNCLASSIFIED / ACCOUNT_TYPE).
  if (liability) return 'REFUND';
  return 'INCOME';
}

export function classifyImported(
  t: BankTransactionView,
  ctx: { accountType: AccountType; jurnlAccountId: string | null; rules: ClassificationRule[]; override: ImportOverride | null },
): Classification {
  const direction: 'IN' | 'OUT' = t.amount > 0 ? 'OUT' : 'IN';
  const text = textOf(t);
  const flags: Classification['flags'] = { internal_transfer: false, rideshare_earnings: false, refund: false, cash_withdrawal: false, card_payment: false, fee: false };
  let category: SpendCategoryId = 'OTHER';
  let detail: string | null = null;
  let basis: ClassificationBasis = 'UNCLASSIFIED';
  let providerConfidence: string | null = null;
  let ruleId: string | null = null;

  // 4. provider category
  const pfc = (t.pfc_detailed && PFC_DETAILED[t.pfc_detailed]) || (t.pfc_primary && PFC_PRIMARY[t.pfc_primary]) || null;
  if (pfc) {
    [category, detail] = pfc;
    basis = 'BANK_CATEGORY';
    providerConfidence = t.pfc_confidence ?? null;
    if (t.pfc_detailed === 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT') flags.card_payment = true;
    if (t.pfc_detailed === 'TRANSFER_OUT_WITHDRAWAL') flags.cash_withdrawal = true;
    if (t.pfc_primary === 'BANK_FEES') flags.fee = true;
    if (t.pfc_primary === 'TRANSFER_IN' || t.pfc_primary === 'TRANSFER_OUT') {
      // A provider "transfer" is not proof it was between the user's own accounts; reconciliation decides that.
      flags.internal_transfer = t.pfc_detailed === 'TRANSFER_IN_ACCOUNT_TRANSFER' || t.pfc_detailed === 'TRANSFER_OUT_ACCOUNT_TRANSFER' || t.pfc_detailed?.endsWith('_SAVINGS') === true;
    }
  } else if (ctx.accountType === 'CREDIT_CARD' && direction === 'IN' && hasCardSidePaymentWords(text)) {
    // 5. account type: money into a card described as a payment is a payment, not income.
    flags.card_payment = true;
    category = 'DEBT_PAYMENT';
    detail = 'CARD PAYMENT';
    basis = 'ACCOUNT_TYPE';
  } else {
    // 6. merchant patterns
    const hit = MERCHANT_PATTERNS.find(([re]) => re.test(text));
    if (hit) {
      category = hit[1];
      detail = hit[2];
      basis = 'MERCHANT_PATTERN';
    } else if (direction === 'OUT' && /\bATM\b|WITHDRAWAL/.test(text)) {
      flags.cash_withdrawal = true;
      category = 'TRANSFER';
      detail = 'CASH WITHDRAWAL';
      basis = 'MERCHANT_PATTERN';
    } else if (hasCardPaymentWords(text) && direction === 'OUT') {
      flags.card_payment = true;
      category = 'DEBT_PAYMENT';
      detail = 'CARD PAYMENT';
      basis = 'MERCHANT_PATTERN';
    } else if (hasTransferWords(text)) {
      flags.internal_transfer = true;
      category = 'TRANSFER';
      basis = 'MERCHANT_PATTERN';
    } else {
      basis = ctx.accountType ? 'ACCOUNT_TYPE' : 'UNCLASSIFIED';
    }
  }

  // 3. known payers: money in from a rideshare platform is earnings (the payout, net of the platform's fees).
  if (direction === 'IN' && isRidesharePayerText(text) && !flags.card_payment) {
    flags.rideshare_earnings = true;
    flags.internal_transfer = false;
    category = 'INCOME';
    detail = 'RIDESHARE PAYOUT';
    basis = 'KNOWN_PAYER';
    providerConfidence = null;
  }
  if (direction === 'IN' && !flags.rideshare_earnings && !flags.card_payment && !flags.internal_transfer && (t.pfc_detailed?.includes('REFUND') || /\bREFUND\b|\bRETURN\b|\bREVERSAL\b/.test(text))) {
    flags.refund = true;
    category = 'OTHER';
    detail = /\bREVERSAL\b/.test(text) ? 'REVERSAL' : 'REFUND';
  }

  // 2. user rules
  const rule = ctx.rules.find((r) => ruleMatches(r, t, ctx.jurnlAccountId));
  if (rule) {
    if (rule.set.category) category = rule.set.category as SpendCategoryId;
    if (rule.set.category_detail !== undefined) detail = rule.set.category_detail ?? null;
    if (rule.set.internal_transfer !== undefined) flags.internal_transfer = rule.set.internal_transfer;
    if (rule.set.rideshare_earnings !== undefined) flags.rideshare_earnings = rule.set.rideshare_earnings;
    basis = 'YOUR_RULE';
    providerConfidence = null;
    ruleId = rule.rule_id;
  }

  // 1. the user's own correction
  const o = ctx.override;
  if (o) {
    if (o.category) category = o.category as SpendCategoryId;
    if (o.category_detail !== undefined) detail = o.category_detail ?? null;
    if (o.internal_transfer !== undefined) flags.internal_transfer = o.internal_transfer;
    if (o.rideshare_earnings !== undefined) flags.rideshare_earnings = o.rideshare_earnings;
    if (o.refund !== undefined) flags.refund = o.refund;
    if (o.category || o.internal_transfer !== undefined || o.rideshare_earnings !== undefined || o.refund !== undefined || o.txn_class) {
      basis = 'YOUR_CORRECTION';
      providerConfidence = null;
      ruleId = null;
    }
  }
  if (flags.rideshare_earnings && direction === 'IN') category = o?.category ? category : 'INCOME';

  let txnClass = baseClass(direction, ctx.accountType, category, flags);
  if (rule?.set.txn_class) txnClass = rule.set.txn_class;
  if (o?.txn_class) txnClass = o.txn_class;
  return { category, category_detail: detail, txn_class: txnClass, basis, provider_confidence: providerConfidence, rule_id: ruleId, flags };
}
