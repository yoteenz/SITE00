/**
 * Real provider catalog checks for payout cards the founder uses (Uber Pro Card, Lyft Direct).
 *
 * A catalog listing is NOT proof of connectivity: it says only that the provider lists an institution by that name and
 * which products it advertises. A target is VERIFIED only after a founder-operated Link completes AND a transactions
 * sync returns that account's real transactions. Until then the honest state is UNVERIFIED or UNAVAILABLE / MANUAL.
 * No institution id is hard-coded: ids come only from the provider's own search response.
 */
import type { BankingProvider, ProviderInstitution } from './provider.js';

export type CatalogTarget = {
  key: 'UBER_PRO_CARD' | 'LYFT_DIRECT';
  label: string;
  /** Names to search. The card brand and the program manager are both searched; the issuer is not assumed. */
  queries: string[];
  /** Words that must appear in a returned institution name for it to be considered a candidate. */
  nameMatches: string[];
};

export const PAYOUT_CARD_TARGETS: readonly CatalogTarget[] = [
  { key: 'UBER_PRO_CARD', label: 'UBER PRO CARD', queries: ['Uber Pro Card', 'Branch'], nameMatches: ['uber', 'branch'] },
  { key: 'LYFT_DIRECT', label: 'LYFT DIRECT', queries: ['Lyft Direct', 'Payfare'], nameMatches: ['lyft', 'payfare'] },
];

export type CatalogVerdict = 'LISTED_WITH_TRANSACTIONS' | 'LISTED_WITHOUT_TRANSACTIONS' | 'NOT_LISTED' | 'CHECK_FAILED';

export type CatalogCheck = {
  key: CatalogTarget['key'];
  label: string;
  environment: string;
  checked_at: string;
  verdict: CatalogVerdict;
  candidates: (ProviderInstitution & { matched_query: string })[];
  /** What JURNL shows until a founder-operated connection proves otherwise. */
  connectivity: 'UNVERIFIED' | 'UNAVAILABLE_MANUAL';
  note: string;
};

export async function checkPayoutCardCatalog(provider: BankingProvider, target: CatalogTarget, now = new Date()): Promise<CatalogCheck> {
  const candidates: CatalogCheck['candidates'] = [];
  try {
    for (const q of target.queries) {
      const hits = await provider.searchInstitutions(q);
      for (const h of hits) {
        const n = h.name.toLowerCase();
        if (!target.nameMatches.some((m) => n.includes(m))) continue;
        if (candidates.some((c) => c.institution_id === h.institution_id)) continue;
        candidates.push({ ...h, matched_query: q });
      }
    }
  } catch {
    return {
      key: target.key,
      label: target.label,
      environment: provider.environment,
      checked_at: now.toISOString(),
      verdict: 'CHECK_FAILED',
      candidates: [],
      connectivity: 'UNAVAILABLE_MANUAL',
      note: 'THE PROVIDER CATALOG COULD NOT BE CHECKED. RECORD THIS CARD BY HAND FOR NOW.',
    };
  }
  const withTx = candidates.filter((c) => c.products.includes('transactions'));
  const verdict: CatalogVerdict = withTx.length ? 'LISTED_WITH_TRANSACTIONS' : candidates.length ? 'LISTED_WITHOUT_TRANSACTIONS' : 'NOT_LISTED';
  return {
    key: target.key,
    label: target.label,
    environment: provider.environment,
    checked_at: now.toISOString(),
    verdict,
    candidates,
    connectivity: verdict === 'LISTED_WITH_TRANSACTIONS' ? 'UNVERIFIED' : 'UNAVAILABLE_MANUAL',
    note:
      verdict === 'LISTED_WITH_TRANSACTIONS'
        ? 'LISTED BY THE PROVIDER. NOT CONFIRMED UNTIL YOU CONNECT IT AND YOUR TRANSACTIONS ARRIVE.'
        : 'NOT AVAILABLE TO CONNECT. RECORD THIS CARD BY HAND.',
  };
}
