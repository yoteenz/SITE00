/**
 * CH01 SAFE TO SPEND BUFFER and CH02 PRIVACY & CONSENTS on the shared OV08 menu environment — the founder authorities
 * (BUFFER- / PRIVACY-AUTHORITY-VS-ARTWORK, Grok2 OPUS_MOUNT_MAP, Grok4 13_REVISED_OPUS_MOUNT_MAP). The CH01 / CH02 clean
 * plates are a different sidekick and are not mounted (founder correction, clean/registry.ts).
 *
 * L0  OV08-SECTIONED-MENU-ENVIRONMENT (2016 × 3584, one uniform scale): bust, lemon canopy, arch, coast, oxblood, the blank
 *     tag and title papers, the open olive field. No second title paper is mounted over it (the header PNGs are withheld).
 * L1  independent papers at the authority placements (Grok4 ALPHA_STATS `place`, plate pixels), each at its native aspect
 *     ratio: CH01 amount, effect and BACK, the coin still life (fixed art, 1:1 at its authority origin, its stray top
 *     sliver clipped); CH02 REMOVE ACCESS and BACK. The amount / effect / back papers are the surfaces of live controls.
 * L2  everything else is live: the JURNL wordmark on the tag, the headline, script and ornament on the title paper, help
 *     text, rules, the amount field and its currency, the effect figure, warnings, consent switches, policy statements,
 *     data rows, dividers, SAVE BUFFER (the V3 olive control; its paper is withheld) and every label.
 *
 * Only the privacy list scrolls; the buffer column scrolls only when a long warning needs the room. The page never scrolls.
 * The behaviour, accounting and consent rules are the folios' (data/f09/safetyBuffer.ts, useAskContextConsent).
 */
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { BUFFER_COPY, useSafetyBuffer } from '../../data/f09/safetyBuffer';
import { formatAmountInput, formatMoney } from '../../data/home/money';
import { F01_COPY as C } from '../../data/f01/copy';
import { patchSetup, useSetup } from '../../data/f02/setupDraft';
import { JurnlToggle } from '../components/primitives';
import { ShellOverlay, ShellSlot, slot, type ShellBox } from '../surfaces/editorial/Shell';
import { V3Icon, V3Pill } from '../surfaces/v3/V3Surfaces';
import { cleanArt, type CleanArtId } from './overlays/clean/registry';
import type { MenuDestination, MenuPanel, SettingsToolId } from './menuPanels';
import './jurnl-child-environments.css';

const PW = 2016;
const PH = 3584;
/** A box from plate pixels (x, y, w, h) on the 2016 × 3584 OV08 plate. */
const px = (x: number, y: number, w: number, h: number): ShellBox => [x / PW, y / PH, (x + w) / PW, (y + h) / PH];

/**
 * Shared OV08 regions (fractions of the plate, measured on the installed PNG): the blank tag paper, the title paper's open
 * centre (the bust overlaps its left end), the close at the top end.
 */
export const OV08_TAG: ShellBox = [0.352, 0.038, 0.575, 0.098];

/** CH01 on OV08: the authority boxes (Grok4 `place`, plate px; the 864 grid × 7/3). */
export const CH01_BOX = {
  head: [0.275, 0.118, 0.8, 0.284],
  /** help, rule, BUFFER AMOUNT, amount paper, effect paper (amount 203,1689 · effect 161,2081 on the plate) */
  column: [0.08, 0.322, 0.758, 0.696],
  /** the coin still life: origin (35, 2427), 1048 × 581 master pixels, 1:1 */
  coin: px(35, 2427, 1048, 581),
  /** BACK (177, 3040, 579 × 219) and SAVE beside it on the same row */
  actions: [0.0878, 0.846, 0.758, 0.911],
} as const satisfies Record<string, ShellBox>;

/** CH02 on OV08: the consent list in the olive field, REMOVE ACCESS (163, 2800) and BACK (315, 3108) under it. */
export const CH02_BOX = {
  head: [0.275, 0.118, 0.8, 0.284],
  list: [0.095, 0.306, 0.765, 0.776],
  remove: [0.0809, 0.7813, 0.772, 0.858],
  back: px(315, 3108, 1206, 247),
} as const satisfies Record<string, ShellBox>;

const aspect = (art: CleanArtId): CSSProperties => {
  const a = cleanArt(art);
  return { aspectRatio: `${a.width} / ${a.height}` };
};

/** A control whose surface is one independent paper (native aspect ratio; the paper travels with the control). */
function PaperControl({ art, trigger, onClick, children, tone = 'ink', disabled, testId, className = '', ariaLabel }: { art: CleanArtId; trigger: string; onClick: () => void; children: ReactNode; tone?: 'ink' | 'cream'; disabled?: boolean; testId?: string; className?: string; ariaLabel?: string }) {
  const a = cleanArt(art);
  return (
    <button type="button" className={`jsp-paper jce-paper-control ${className}`} data-tone={tone} data-paper={art} data-jrn-trigger={trigger} data-testid={testId} disabled={disabled} aria-label={ariaLabel} onClick={onClick} style={aspect(art)}>
      <img className="jsp-paper__art" src={a.src} alt="" aria-hidden draggable={false} data-asset-id={art} />
      {children}
    </button>
  );
}

/** A non-interactive paper surface for live content (native aspect ratio). */
function PaperSurface({ art, children, testId, className = '' }: { art: CleanArtId; children: ReactNode; testId?: string; className?: string }) {
  const a = cleanArt(art);
  return (
    <div className={`jsp-paper jce-paper-surface ${className}`} data-paper={art} data-testid={testId} style={aspect(art)}>
      <img className="jsp-paper__art" src={a.src} alt="" aria-hidden draggable={false} data-asset-id={art} />
      {children}
    </div>
  );
}

/* ── CH01 SAFE TO SPEND BUFFER ── */
export function BufferEnvironment({ onBack, onCurrency }: { onBack: () => void; onCurrency?: () => void }) {
  const b = useSafetyBuffer();
  const id = useId();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const column = useRef<HTMLDivElement>(null);
  const code = b.currency.code;
  const blocked = b.rateState === 'UNAVAILABLE';
  const coin = cleanArt('CH01_COIN_RESERVE');
  const save = () => {
    const r = b.save();
    if (r.ok) {
      setError(null);
      setStatus(r.canonicalUsd > 0 ? 'SAVED' : 'CLEARED');
    } else {
      setStatus(null);
      setError(r.reason === 'RATE_UNAVAILABLE' ? BUFFER_COPY.rateUnavailable : BUFFER_COPY.invalid);
    }
  };
  // a warning that does not fit is brought into view inside the column (never the page)
  useEffect(() => {
    const el = column.current?.querySelector<HTMLElement>('[data-jce-message]');
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'nearest' });
  }, [error, blocked]);
  return (
    <ShellOverlay testId="global-buffer" composition="child" shell="OV08_MENU_ENVIRONMENT" tag={OV08_TAG} ornament title={<>SAFE TO SPEND <span className="jce-title-line">BUFFER</span></>} script="a cushion you keep aside" head={CH01_BOX.head} onClose={onBack} closeLabel="CLOSE SAFE TO SPEND BUFFER">
      {/* L1 fixed art: above the field, below the live column and the actions */}
      <img className="jce-coin" src={coin.src} alt="" aria-hidden draggable={false} data-asset-id="CH01_COIN_RESERVE" style={slot(CH01_BOX.coin)} />
      <div ref={column} className="jsh-slot jce-content jce-buffer" data-scroll="true" role="group" aria-label="SAFE TO SPEND BUFFER" style={slot(CH01_BOX.column)}>
        <p className="jce-text jce-help">{`SET ASIDE A CUSHION THAT ALWAYS REMAINS OUTSIDE YOUR SPENDABLE AMOUNT.${code === 'USD' ? '' : ` TYPE IT IN ${code}; JURNL KEEPS IT IN USD.`}`}</p>
        <div className="jce-label-row">
          <label className="jce-label" htmlFor={id}>
            BUFFER AMOUNT
          </label>
          {status ? (
            <span className="jce-saved" role="status" data-testid="buffer-status">
              {status}
            </span>
          ) : null}
        </div>
        <PaperSurface art="CH01_AMOUNT_PAPER" className="jce-amount" testId="buffer-amount-paper">
          <span className="jce-amount__well">
            {b.currency.symbolPosition === 'prefix' ? <span className="jce-amount__mark" aria-hidden>{b.currency.symbol}</span> : null}
            <input id={id} inputMode="decimal" autoComplete="off" placeholder="0.00" value={formatAmountInput(b.value)} data-jrn-trigger="buffer-input" disabled={blocked} aria-invalid={error ? true : undefined} onChange={(e) => b.setValue(e.target.value)} />
            {b.currency.symbolPosition === 'suffix' ? <span className="jce-amount__mark" aria-hidden>{b.currency.symbol}</span> : null}
          </span>
          {onCurrency ? (
            <button type="button" className="jce-currency" data-jrn-trigger="buffer-currency" aria-label={`DISPLAY CURRENCY: ${code}. CHANGE`} onClick={onCurrency}>
              <span>{code}</span>
              <span className="jce-currency__caret" aria-hidden>▾</span>
            </button>
          ) : (
            <span className="jce-currency" data-testid="buffer-currency">
              {code}
            </span>
          )}
        </PaperSurface>
        {error ? (
          <p className="jce-text" data-tone="alert" role="alert" data-jce-message>
            {error}
          </p>
        ) : null}
        {blocked ? (
          <p className="jce-note" data-tone="attention" data-testid="buffer-rate-unavailable" data-jce-message>
            <V3Icon name="warn" />
            <span>{BUFFER_COPY.rateUnavailable}</span>
          </p>
        ) : null}
        {b.rateState === 'STALE' && b.exchange.disclosure ? (
          <p className="jce-note" data-testid="buffer-rate-stale">
            <V3Icon name="clock" />
            <span>{`${b.exchange.disclosure}. A CACHED RATE IS USED FOR THE CONVERSION.`}</span>
          </p>
        ) : null}
        <PaperSurface art="CH01_EFFECT_PAPER" className="jce-effect" testId="buffer-effect-paper">
          <span className="jce-effect__kicker">
            EFFECT ON <span className="jce-line">SAFE TO SPEND</span>
          </span>
          <span className="jce-effect__rule" aria-hidden />
          <span className="jce-effect__value" data-testid="buffer-usd" data-usd={String(b.storedUsd)}>
            {b.storedUsd > 0 ? `${formatMoney(b.storedUsd)} KEPT ASIDE` : 'NO BUFFER SET'}
            {b.storedUsd > 0 && code !== 'USD' ? <small>{`KEPT AS USD ${b.storedUsd.toFixed(2)}`}</small> : null}
          </span>
        </PaperSurface>
      </div>
      <ShellSlot box={CH01_BOX.actions} className="jce-actions">
        <PaperControl art="CH01_BACK_PAPER" trigger="buffer-back" onClick={onBack} className="jce-back">
          <span className="jce-paper-control__label">BACK</span>
        </PaperControl>
        {/* the SAVE BUFFER olive paper is withheld (gold rim missing): the live V3 olive control with its gold hairline */}
        <V3Pill tone="olive" trigger="buffer-save" onClick={save} disabled={blocked}>
          SAVE BUFFER
        </V3Pill>
      </ShellSlot>
    </ShellOverlay>
  );
}

/* ── CH02 PRIVACY & CONSENTS ── */
type Nav = { onBack: () => void; onOpen: (p: MenuDestination | MenuPanel) => void };
const tool = (id: SettingsToolId): MenuPanel => ({ tool: id });

function RowText({ label, sub }: { label: string; sub: string }) {
  return (
    <span className="jce-row__text">
      <span>{label}</span>
      <small className="jed-script">{sub.toLowerCase()}</small>
    </span>
  );
}
function ConsentRow({ icon, label, note, on, trigger, onChange }: { icon: string; label: string; note: string; on: boolean; trigger: string; onChange: (v: boolean) => void }) {
  return (
    <div className="jce-row jce-row--consent">
      <V3Icon name={icon} />
      <RowText label={label} sub={note} />
      <JurnlToggle checked={on} label={label} trigger={trigger} onChange={onChange} />
    </div>
  );
}
/** What JURNL is and does, not a choice: no switch (NOTHING SOLD, LINKED ACCOUNTS OPTIONAL). */
function StatementRow({ icon, label, note, testId }: { icon: string; label: string; note: string; testId: string }) {
  return (
    <div className="jce-row jce-row--statement" data-testid={testId}>
      <V3Icon name={icon} />
      <RowText label={label} sub={note} />
    </div>
  );
}
function ToolRow({ icon, label, sub, trigger, onClick }: { icon: string; label: string; sub: string; trigger: string; onClick: () => void }) {
  return (
    <button type="button" className="jce-row jce-row--action" data-jrn-trigger={trigger} onClick={onClick}>
      <V3Icon name={icon} />
      <RowText label={label} sub={sub} />
      <span className="jce-chev" aria-hidden>›</span>
    </button>
  );
}

export function PrivacyEnvironment({ onBack, onOpen, askOn, setAsk }: Nav & { askOn: boolean; setAsk: (v: boolean) => void }) {
  const draft = useSetup();
  return (
    <ShellOverlay testId="settings-consents-sheet" composition="child" shell="OV08_MENU_ENVIRONMENT" tag={OV08_TAG} ornament title={<>PRIVACY & <span className="jce-title-line">CONSENTS</span></>} script="what jurnl may keep and use" head={CH02_BOX.head} onClose={onBack} closeLabel="CLOSE PRIVACY & CONSENTS">
      <ShellSlot box={CH02_BOX.list} className="jce-content jce-list" scroll role="region" ariaLabel="PRIVACY & CONSENTS">
        <h3 className="jce-section">YOUR CONSENTS</h3>
        <ConsentRow icon="gear" label="REMEMBER SETUP" note="keep your setup answers on this device." on={draft.consentRemember} trigger="settings-consent-remember" onChange={(v) => patchSetup({ consentRemember: v })} />
        <StatementRow icon="bank" label="LINKED ACCOUNTS OPTIONAL" note="jurnl works without connecting a bank." testId="privacy-statement-links" />
        <StatementRow icon="shield" label="NOTHING SOLD" note="your data is never sold." testId="privacy-statement-sale" />
        <ConsentRow icon="sparkle" label="ASK JURNL CONTEXT" note="let ask jurnl read the screen you are on to explain it. off stays off." on={askOn} trigger="privacy-ask-context" onChange={setAsk} />
        <h3 className="jce-section">YOUR DATA</h3>
        <ToolRow icon="sparkle" label={C.privacy.rows['ai-access']} sub="choose what ai features may use." trigger="privacy-tool-ai-access" onClick={() => onOpen(tool('privacy-ai-access'))} />
        <ToolRow icon="book" label={C.privacy.rows['your-data']} sub="what jurnl keeps on this device." trigger="privacy-tool-your-data" onClick={() => onOpen(tool('privacy-your-data'))} />
        <ToolRow icon="upload" label={C.privacy.rows['data-export']} sub="not available yet." trigger="privacy-tool-data-export" onClick={() => onOpen(tool('privacy-data-export'))} />
      </ShellSlot>
      <ShellSlot box={CH02_BOX.remove} className="jce-actions">
        <PaperControl art="CH02_REMOVE_ACCESS_PAPER" tone="cream" trigger="privacy-tool-remove-access" onClick={() => onOpen(tool('privacy-remove-access'))} className="jce-remove" ariaLabel={`${C.privacy.rows['remove-access']}: DELETE ACCOUNT · REVOKE ACCESS · TURN AI OFF`}>
          <V3Icon name="trash" />
          <RowText label={C.privacy.rows['remove-access']} sub="delete account · revoke access · turn ai off." />
          <span className="jce-chev" aria-hidden>›</span>
        </PaperControl>
      </ShellSlot>
      <ShellSlot box={CH02_BOX.back} className="jce-actions">
        <PaperControl art="CH02_BACK_PAPER" trigger="privacy-back" onClick={onBack} className="jce-back jce-back--wide">
          <span className="jce-paper-control__label">BACK</span>
        </PaperControl>
      </ShellSlot>
    </ShellOverlay>
  );
}
