/**
 * Account-purpose preferences (smart defaults, never restrictions).
 *
 * A purpose (BILLS, GROCERIES, CARD PAYMENTS…) maps to a usual account. Resolution order:
 *   1. The account the user chose for that purpose (settings.purposeAccounts), if it is still active.
 *   2. The default role for that purpose (e.g. BILLS → a bank account), if exactly one or more accounts fill that role
 *      (the first one is suggested).
 *   3. Nothing — with a plain explanation of what to set up. JURNL never routes money to an unrelated account.
 *
 * Preferences live in settings, separate from financial entries. Choosing another account is always allowed.
 */

import type { JurnlAccountRecord } from '../foundation/accounts';
import { accountNature, locationKind, type MoneyLocationKind } from './accounting';

export type MoneyPurpose =
  | 'BILLS'
  | 'SUBSCRIPTIONS'
  | 'BNPL'
  | 'SHOPPING'
  | 'MISC'
  | 'FOOD'
  | 'GROCERIES'
  | 'TRAVEL'
  | 'CASH_PURCHASES'
  | 'CARD_PAYMENTS'
  | 'RIDESHARE_EARNINGS'
  | 'CASH_TIPS'
  | 'SAVINGS';

/** The kind of account a purpose usually uses. */
export type AccountRole = 'BANK' | 'PAYOUT_CARD' | 'CREDIT_CARD' | 'CASH' | 'SAVINGS';

export const PURPOSE_LABEL: Record<MoneyPurpose, string> = {
  BILLS: 'BILLS',
  SUBSCRIPTIONS: 'SUBSCRIPTIONS',
  BNPL: 'BUY NOW, PAY LATER',
  SHOPPING: 'SHOPPING',
  MISC: 'EVERYDAY SPENDING',
  FOOD: 'FOOD',
  GROCERIES: 'GROCERIES',
  TRAVEL: 'TRAVEL',
  CASH_PURCHASES: 'CASH PURCHASES',
  CARD_PAYMENTS: 'CREDIT CARD PAYMENTS',
  RIDESHARE_EARNINGS: 'RIDESHARE EARNINGS',
  CASH_TIPS: 'CASH TIPS',
  SAVINGS: 'SAVINGS',
};

export const ROLE_LABEL: Record<AccountRole, string> = {
  BANK: 'A BANK ACCOUNT',
  PAYOUT_CARD: 'A RIDESHARE PAYOUT CARD',
  CREDIT_CARD: 'A CREDIT CARD',
  CASH: 'CASH ON HAND',
  SAVINGS: 'A SAVINGS ACCOUNT',
};

/** Founder's default organization (configurable per user through settings.purposeAccounts). */
export const DEFAULT_PURPOSE_ROLE: Record<MoneyPurpose, AccountRole> = {
  BILLS: 'BANK',
  SUBSCRIPTIONS: 'BANK',
  BNPL: 'BANK',
  SHOPPING: 'BANK',
  MISC: 'BANK',
  FOOD: 'CREDIT_CARD',
  GROCERIES: 'CREDIT_CARD',
  TRAVEL: 'CREDIT_CARD',
  CASH_PURCHASES: 'CASH',
  CARD_PAYMENTS: 'PAYOUT_CARD',
  RIDESHARE_EARNINGS: 'PAYOUT_CARD',
  CASH_TIPS: 'CASH',
  SAVINGS: 'SAVINGS',
};

/** Purposes whose account must hold money (receiving pay or tips, saving, or paying a card from it): asset accounts only. */
const ASSET_ONLY_PURPOSES: ReadonlySet<MoneyPurpose> = new Set(['RIDESHARE_EARNINGS', 'CASH_TIPS', 'SAVINGS', 'CARD_PAYMENTS']);

export const PURPOSE_ORDER: readonly MoneyPurpose[] = [
  'BILLS',
  'SUBSCRIPTIONS',
  'BNPL',
  'SHOPPING',
  'MISC',
  'FOOD',
  'GROCERIES',
  'TRAVEL',
  'CASH_PURCHASES',
  'CARD_PAYMENTS',
  'RIDESHARE_EARNINGS',
  'CASH_TIPS',
  'SAVINGS',
];

export function accountRole(a: JurnlAccountRecord): AccountRole | null {
  const kind: MoneyLocationKind = locationKind(a);
  if (kind === 'BANK') return 'BANK';
  if (kind === 'PAYOUT_CARD') return 'PAYOUT_CARD';
  if (kind === 'CREDIT_CARD') return 'CREDIT_CARD';
  if (kind === 'CASH') return 'CASH';
  if (kind === 'SAVINGS') return 'SAVINGS';
  return null;
}

/** Whether an account can be used for a purpose at all (receiving money needs an asset account). */
export function accountFitsPurpose(a: JurnlAccountRecord, purpose: MoneyPurpose): boolean {
  if (a.status !== 'ACTIVE') return false;
  if (ASSET_ONLY_PURPOSES.has(purpose)) return accountNature(a.account_type) === 'ASSET';
  return true;
}

export type PurposeSuggestion =
  | { status: 'CHOSEN'; account: JurnlAccountRecord; reason: string }
  | { status: 'DEFAULT'; account: JurnlAccountRecord; reason: string }
  | { status: 'MISSING'; account: null; reason: string };

export function suggestAccountForPurpose(
  purpose: MoneyPurpose,
  accounts: JurnlAccountRecord[],
  purposeAccounts: Partial<Record<string, string>> | undefined,
): PurposeSuggestion {
  const active = accounts.filter((a) => a.status === 'ACTIVE');
  const chosenId = purposeAccounts?.[purpose];
  const chosen = chosenId ? active.find((a) => a.account_id === chosenId) : undefined;
  if (chosen && accountFitsPurpose(chosen, purpose)) {
    return { status: 'CHOSEN', account: chosen, reason: `YOU USUALLY USE ${chosen.display_name} FOR ${PURPOSE_LABEL[purpose]}.` };
  }
  const role = DEFAULT_PURPOSE_ROLE[purpose];
  const match = active.find((a) => accountRole(a) === role && accountFitsPurpose(a, purpose));
  if (match) return { status: 'DEFAULT', account: match, reason: `${PURPOSE_LABEL[purpose]} USUALLY COME FROM ${match.display_name}.` };
  return {
    status: 'MISSING',
    account: null,
    reason: `NO ACCOUNT IS SET FOR ${PURPOSE_LABEL[purpose]}. ADD ${ROLE_LABEL[role]} IN MONEY, OR CHOOSE ANY ACCOUNT BELOW.`,
  };
}

/** The purposes an account is currently the usual account for (explicit choices and defaults). */
export function purposesForAccount(account: JurnlAccountRecord, accounts: JurnlAccountRecord[], purposeAccounts: Partial<Record<string, string>> | undefined): MoneyPurpose[] {
  return PURPOSE_ORDER.filter((p) => suggestAccountForPurpose(p, accounts, purposeAccounts).account?.account_id === account.account_id);
}

/** Spending category → purpose, for suggesting the usual account when an expense is recorded. */
export function purposeForCategory(category: string | null | undefined): MoneyPurpose {
  const c = (category ?? '').trim().toUpperCase();
  if (c === 'GROCERIES') return 'GROCERIES';
  if (c === 'FOOD' || c === 'DINING' || c === 'RESTAURANTS') return 'FOOD';
  if (c === 'TRAVEL') return 'TRAVEL';
  if (c === 'SHOPPING' || c === 'CLOTHING') return 'SHOPPING';
  if (c === 'BNPL' || c === 'BUY NOW, PAY LATER') return 'BNPL';
  if (c === 'SUBSCRIPTION' || c === 'SUBSCRIPTIONS' || c === 'MEMBERSHIP') return 'SUBSCRIPTIONS';
  if (c === 'BILL' || c === 'BILLS' || c === 'HOUSING' || c === 'UTILITIES' || c === 'INSURANCE') return 'BILLS';
  if (c === 'CASH') return 'CASH_PURCHASES';
  return 'MISC';
}

/** Spending categories offered when recording an expense, each with its purpose. */
export const SPENDING_CATEGORY_CHOICES: readonly { id: string; label: string; purpose: MoneyPurpose }[] = [
  { id: 'GROCERIES', label: 'GROCERIES', purpose: 'GROCERIES' },
  { id: 'FOOD', label: 'FOOD', purpose: 'FOOD' },
  { id: 'TRAVEL', label: 'TRAVEL', purpose: 'TRAVEL' },
  { id: 'SHOPPING', label: 'SHOPPING', purpose: 'SHOPPING' },
  { id: 'BILLS', label: 'BILLS', purpose: 'BILLS' },
  { id: 'SUBSCRIPTION', label: 'SUBSCRIPTION', purpose: 'SUBSCRIPTIONS' },
  { id: 'BNPL', label: 'BUY NOW, PAY LATER', purpose: 'BNPL' },
  { id: 'TRANSPORT', label: 'GAS + CAR', purpose: 'MISC' },
  { id: 'OTHER', label: 'OTHER', purpose: 'MISC' },
];
