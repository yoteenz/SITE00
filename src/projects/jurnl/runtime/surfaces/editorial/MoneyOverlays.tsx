/**
 * Founder board 01 / 02 / 03 — the MONEY action sheet, the pocket picker used by MOVE MONEY, and the kind glyphs of
 * ADD A POCKET. Compositions only: every control keeps its trigger, its validation and its canonical service call.
 */
import type { ReactNode } from 'react';
import type { JurnlAccountRecord } from '../../../data/foundation/accounts';
import { kindOf } from '../../../data/f05/dot01/accountView';
import { formatMoney } from '../../../data/home/money';
import { EdArt, EdGlyph, KIND_ART } from './Editorial';
import { ShellAction, ShellOverlay, type ShellBox } from './Shell';

/**
 * 01 MONEY ACTION SHEET on the founder's OV01 shell: the headline on its parchment, the two blank action folios are the
 * hit targets (ADD A POCKET beside the shell's amphora, MOVE YOUR MONEY beside its coin). The bust, arch, coast, drapery,
 * amphora and coin are the shell's own; nothing is layered on them twice.
 */
export const OV01_BOX = {
  head: [0.24, 0.19, 0.9, 0.315],
  add: [0.075, 0.395, 0.62, 0.585],
  move: [0.07, 0.625, 0.6, 0.815],
} as const satisfies Record<string, ShellBox>;
export function MoneyActionSheet({ canMove, onAdd, onMove, onClose }: { canMove: boolean; onAdd: () => void; onMove: () => void; onClose: () => void }) {
  return (
    <ShellOverlay testId="f05m-actions-sheet" composition="action" shell="OV01" title="MONEY" script="manage pockets and movement" head={OV01_BOX.head} onClose={onClose}>
      <ShellAction box={OV01_BOX.add} trigger="f05m-actions-add" title={<><span>ADD A</span> <span>POCKET</span></>} note="create a place for your money" onClick={onAdd} />
      <ShellAction
        box={OV01_BOX.move}
        trigger="f05m-actions-move"
        title={<><span>MOVE YOUR</span> <span>MONEY</span></>}
        note={canMove ? 'transfer between your pockets' : 'add two pockets first'}
        ariaLabel={canMove ? 'MOVE YOUR MONEY' : 'MOVE YOUR MONEY · ADD TWO POCKETS FIRST'}
        disabled={!canMove}
        onClick={onMove}
      />
    </ShellOverlay>
  );
}

/** The kind glyph of an account type (ADD A POCKET's compact type grid). */
export const TYPE_GLYPH: Record<string, ReactNode> = {
  CHECKING: <EdGlyph name="bank" />,
  SAVINGS: <EdGlyph name="coins" />,
  DEBIT_CARD: <EdGlyph name="card" />,
  CREDIT_CARD: <EdGlyph name="credit" />,
  CASH: <EdGlyph name="cash" />,
  LOAN: <EdGlyph name="tag" />,
  OTHER: <EdGlyph name="pocket" />,
};

/**
 * 03 MOVE MONEY: one pocket as a distinct fragment (its own 06 kind art, name, figure) with the real pocket choices
 * under it. Triggers follow AccountChips (`${trigger}-${account_id}`), so every existing journey still selects by id.
 */
export function PocketPick({ dir, accountId, options, figure, onChange, trigger }: { dir: 'FROM' | 'TO'; accountId: string | null; options: JurnlAccountRecord[]; figure: (a: JurnlAccountRecord) => string; onChange: (id: string) => void; trigger: string }) {
  const sel = options.find((a) => a.account_id === accountId) ?? null;
  const art = sel ? KIND_ART[kindOf(sel)] : null;
  if (!options.length) return <p className="jed-note" role="note">NO MATCHING ACCOUNT YET. ADD ONE IN MONEY → POCKETS.</p>;
  return (
    <section className={`jed-pickset jed-pickset--${dir.toLowerCase()}`} aria-label={dir}>
      <div className={`jed-pick jed-pick--${dir.toLowerCase()}`} data-testid={`${trigger}-selected`}>
        <span className="jed-pick__art" aria-hidden>{art ? <EdArt art={art.art} region={art.region} className="jed-art--kind" /> : null}</span>
        <span>
          <span className="jed-pick__dir">{dir}</span>
          <span className="jed-pick__name">{sel ? sel.display_name : 'CHOOSE A POCKET'}</span>
          {sel ? <span className="jed-pick__value">{figure(sel)}</span> : null}
        </span>
      </div>
      <div className="jed-strip" role="group" aria-label={`${dir} POCKET`}>
        {options.map((a) => {
          const on = a.account_id === accountId;
          return (
            <button key={a.account_id} type="button" className="jed-choice" aria-pressed={on} data-active={on ? 'true' : 'false'} data-jrn-trigger={`${trigger}-${a.account_id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} onClick={() => onChange(a.account_id)}>
              <span className="jed-choice__label">{a.display_name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export const money = (n: number) => formatMoney(n);
