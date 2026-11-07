/**
 * Founder board 01 / 02 / 03 — the MONEY action sheet, the pocket picker used by MOVE MONEY, and the kind glyphs of
 * ADD A POCKET. Compositions only: every control keeps its trigger, its validation and its canonical service call.
 */
import type { ReactNode } from 'react';
import type { JurnlAccountRecord } from '../../../data/foundation/accounts';
import { kindOf } from '../../../data/f05/dot01/accountView';
import { formatMoney } from '../../../data/home/money';
import { ART, EdAction, EdArt, EdGlyph, EditorialOverlay, KIND_ART, REGION } from './Editorial';
import { JurnlMicroArt } from '../../components/JurnlMicroArt';
import type { OverlayArtStem } from '../../global/overlayArt/registry';

/** 01 MONEY ACTION SHEET: two distinct editorial choices over the classical scene (not two stacked buttons). */
export function MoneyActionSheet({ canMove, onAdd, onMove, onClose }: { canMove: boolean; onAdd: () => void; onMove: () => void; onClose: () => void }) {
  return (
    <EditorialOverlay
      testId="f05m-actions-sheet"
      composition="action"
      title={['MONEY']}
      script="manage pockets and movement"
      onClose={onClose}
      decor={
        <>
          <EdArt art={ART.sk01} region={REGION.bust} className="jed-art--bust" torn={11} />
          <EdArt art={ART.oxbloodBranch} className="jed-art--oxblood" />
          <EdArt art={ART.lemonBranch} className="jed-art--lemon" />
          <EdArt art={ART.coast} className="jed-art--coast" />
        </>
      }
    >
      <EdAction
        trigger="f05m-actions-add"
        className="jed-action--add"
        title={<><span>ADD A</span> <span>POCKET</span></>}
        note="create a place for your money"
        art={<EdArt art={ART.scene04} region={REGION.amphora} className="jed-art--amphora" />}
        chevron="B03-CHEVRON"
        onClick={onAdd}
      />
      <EdAction
        trigger="f05m-actions-move"
        className="jed-action--move"
        material="cream"
        title={<><span>MOVE YOUR</span> <span>MONEY</span></>}
        note={canMove ? 'transfer between your pockets' : 'add two pockets first'}
        ariaLabel={canMove ? 'MOVE YOUR MONEY' : 'MOVE YOUR MONEY · ADD TWO POCKETS FIRST'}
        disabled={!canMove}
        art={<EdArt art={ART.scene05} region={REGION.coinOxblood} className="jed-art--coin" torn={33} />}
        chevron="B03-CHEVRON"
        onClick={onMove}
      />
    </EditorialOverlay>
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
 * OPUS5: ADD A POCKET's type art, cut from the OV02 authority (dark ink on the parchment chips). The authority's selected
 * BANK ACCOUNT wears the light bank; the other types have no light cut, so their dark ink is shown light on the olive
 * selected chip (`data-ink="dark"`, jurnl-micro-art.css).
 */
const TYPE_ART: Partial<Record<string, OverlayArtStem>> = { CHECKING: 'B03-BANK-SOURCE', SAVINGS: 'B03-COIN-STACK', DEBIT_CARD: 'B03-CARD-DEBIT', CREDIT_CARD: 'B03-CARD-CREDIT', CASH: 'B03-CASH' };
export function typeArt(kind: string): ((on: boolean) => ReactNode) | undefined {
  const stem = TYPE_ART[kind];
  if (!stem) return undefined;
  return (on: boolean) => {
    const light = on && kind === 'CHECKING';
    return <JurnlMicroArt stem={light ? 'B03-BANK-SELECTED' : stem} slot={`money-add-kind-${kind.toLowerCase().replace(/_/g, '-')}-icon`} ink={light ? 'light' : 'dark'} />;
  };
}

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
        <span className="jed-pick__body">
          {/* OPUS5: the OV03 authority's marks: the bank beside the source, the pocket bowl beside the destination */}
          {sel ? <JurnlMicroArt stem={dir === 'FROM' ? 'B03-BANK-SOURCE' : 'B03-POCKET-MARK'} slot={`${trigger}-mark`} className="jed-pick__mark" /> : null}
          <span>
            <span className="jed-pick__dir">{dir}</span>
            <span className="jed-pick__name">{sel ? sel.display_name : 'CHOOSE A POCKET'}</span>
            {sel ? <span className="jed-pick__value">{figure(sel)}</span> : null}
          </span>
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
