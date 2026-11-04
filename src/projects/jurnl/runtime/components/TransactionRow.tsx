/** Canonical JURNL transaction row. Icon, label column, and amount stay on one horizontal grid. */

import type { LedgerEntry } from '../../data/home/money';
import { entryWhenLabel, formatMoney, useCurrency } from '../../data/home/money';
import { TXN_CLASS_LABEL } from '../../data/ledger/accounting';
import { categoryIconMark, normalizeCategory } from '../../data/foundation/categories';
import { JurnlIcon, type JurnlIconName } from './icons';

function markFor(entry: LedgerEntry): JurnlIconName {
  if (entry.recurring) return 'clock';
  return categoryIconMark(normalizeCategory(entry.category));
}

export function JurnlTransactionRow({ entry, onOpen }: { entry: LedgerEntry; onOpen?: (entry: LedgerEntry) => void }) {
  useCurrency();
  const income = entry.direction === 'INCOME';
  const body = (
    <>
      <span className="jrn-tx__mark" aria-hidden>
        <JurnlIcon name={markFor(entry)} size={16} />
      </span>
      <span className="jrn-tx__copy">
        <span className="jrn-tx__name">{entry.merchant}</span>
        <small>
          {entryWhenLabel(entry)}
          {entry.account ? ` · ${entry.account}` : ''}
          {entry.txn_class && entry.txn_class !== 'EXPENSE' && entry.txn_class !== 'INCOME' ? ` · ${TXN_CLASS_LABEL[entry.txn_class]}` : ''}
          {entry.recurring ? ' · REPEATS' : ''}
          {entry.status === 'PENDING' ? ' · PENDING' : ''}
        </small>
      </span>
      <span className={`jrn-tx__amt${income ? ' jrn-tx__amt--in' : ''}`}>{formatMoney(entry.amount, income)}</span>
    </>
  );
  if (!onOpen) {
    return (
      <div className="jrn-tx" role="listitem" data-jrn-tx={entry.id} data-direction={entry.direction} data-status={entry.status}>
        {body}
      </div>
    );
  }
  return (
    <button type="button" className="jrn-tx jrn-row" onClick={() => onOpen(entry)} data-jrn-trigger={`tx-${entry.id}`} data-jrn-tx={entry.id} data-direction={entry.direction} data-status={entry.status}>
      {body}
    </button>
  );
}
