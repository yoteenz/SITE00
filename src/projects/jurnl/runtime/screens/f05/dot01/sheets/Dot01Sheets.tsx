/**
 * F05 DOT 01 — the contextual overlays opened from account pages (one switch; each overlay keeps the page's context).
 * The page underneath stays mounted (its scroll, filters and carousel position are untouched); closing an overlay
 * returns focus to the control that opened it (Dot01Overlay).
 */
import { useState } from 'react';
import { kindOf, type Dot01Kind } from '../../../../../data/f05/dot01/accountView';
import { accountById } from '../../../../../data/foundation/accounts';
import { TransferSheet } from '../../../../finance/FinanceSheets';
import { useJurnl } from '../../../../state/store';
import { AddAccountOverlay, ArchiveOverlay, EditAccountOverlay, PurposesOverlay } from './AccountSheets';
import { AdjustmentOverlay, CorrectionOverlay, type CorrectionMode } from './CorrectionSheets';
import { AddCashOverlay, CardPaymentOverlay, PurchaseFlow } from './EntrySheets';

export type Dot01SheetState =
  | null
  | { kind: 'edit'; accountId: string }
  | { kind: 'add-account'; preset?: Dot01Kind }
  | { kind: 'add-cash'; accountId: string }
  | { kind: 'spend'; accountId: string }
  | { kind: 'record'; accountId: string }
  | { kind: 'receipt'; accountId: string }
  | { kind: 'card-payment'; accountId: string }
  | { kind: 'transfer'; accountId: string }
  | { kind: 'purposes'; accountId: string }
  | { kind: 'archive'; accountId: string }
  | { kind: 'correct'; entryId: string; mode: CorrectionMode }
  | { kind: 'adjust'; accountId: string; actual: number };

export function Dot01Sheets({ state, onClose, onDone }: { state: Dot01SheetState; onClose: () => void; onDone?: (msg: string) => void }) {
  const { go } = useJurnl();
  // a flow may hand over to a sibling overlay (e.g. RECORD → CARD PAYMENT, EDIT → ARCHIVE) without closing first
  const [handoff, setHandoff] = useState<{ from: Dot01SheetState; to: Dot01SheetState } | null>(null);
  const cur = handoff && handoff.from === state ? handoff.to : state;
  const close = () => {
    setHandoff(null);
    onClose();
  };
  const to = (next: Dot01SheetState) => setHandoff({ from: state, to: next });
  if (!cur) return null;
  switch (cur.kind) {
    case 'add-account':
      return <AddAccountOverlay preset={cur.preset} onClose={close} onSaved={(id) => { close(); go(`money/places/${id}`); }} />;
    case 'edit':
      return <EditAccountOverlay accountId={cur.accountId} onClose={close} onArchive={() => to({ kind: 'archive', accountId: cur.accountId })} />;
    case 'purposes':
      return <PurposesOverlay accountId={cur.accountId} onClose={close} />;
    case 'archive':
      return <ArchiveOverlay accountId={cur.accountId} onClose={close} />;
    case 'add-cash':
      return <AddCashOverlay accountId={cur.accountId} onClose={close} />;
    case 'card-payment':
      return <CardPaymentOverlay accountId={cur.accountId} onClose={close} />;
    case 'transfer':
      return <TransferSheet fromId={cur.accountId} onClose={close} />;
    case 'spend':
    case 'record':
    case 'receipt': {
      const a = accountById(cur.accountId);
      const k = a ? kindOf(a) : 'bank';
      const mode = k === 'credit' ? 'card' : k === 'cash' ? 'cash' : 'bank';
      return (
        <PurchaseFlow
          accountId={cur.accountId}
          mode={mode}
          withType={cur.kind === 'record'}
          startWithReceipt={cur.kind === 'receipt'}
          onClose={close}
          onSwitch={(t) => (t === 'money-in' ? (close(), go('income?add=earnings')) : t === 'transfer' ? to({ kind: 'transfer', accountId: cur.accountId }) : to({ kind: 'card-payment', accountId: cur.accountId }))}
        />
      );
    }
    case 'correct':
      return <CorrectionOverlay entryId={cur.entryId} mode={cur.mode} onClose={close} onDone={onDone} />;
    case 'adjust':
      return <AdjustmentOverlay accountId={cur.accountId} actual={cur.actual} onClose={close} onDone={onDone} />;
  }
}
