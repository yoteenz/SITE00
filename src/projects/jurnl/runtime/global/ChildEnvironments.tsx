/**
 * CH01 SAFE TO SPEND BUFFER and CH02 PRIVACY & CONSENTS on the founder's regenerated shells (named correct 2026-11-06;
 * JURNL/GLOBAL_EIGHT_OVERLAYS/REGENERATED_SCREEN_CANDIDATES, clean/registry.ts).
 *
 * L0+L1  the shell at one uniform scale (its own aspect ratio, opaque): CH01 — bust, lemons, coast, olive field, drape and
 *        the coin still life; CH02 — bust, the blank tag and title papers, lemon, arch, coast, olive field, sprig, drape.
 *        Nothing in a shell is drawn twice: no header paper, no coin still life and no second sprig is mounted.
 * L1     independent papers at their native aspect ratio, each the surface of a live control: CH01 amount, effect and BACK;
 *        CH02 REMOVE ACCESS and BACK.
 * L2     everything else is live: the JURNL wordmark (CH02's tag), the headline, script and ornament, help text, rules, the
 *        amount field and its currency, the effect figure and its disclosure, warnings, consent switches, policy statements,
 *        data rows, dividers, SAVE BUFFER (the V3 olive control; its paper is withheld) and every label.
 *
 * Only the privacy list scrolls; the buffer column scrolls only when a long warning needs the room. The page never scrolls.
 * The behaviour, accounting and consent rules are the folios' (data/f09/safetyBuffer.ts, useAskContextConsent).
 */
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { JurnlArtToggle, JurnlMicroArt } from '../components/JurnlMicroArt';
import type { OverlayArtStem } from './overlayArt/registry';
import { BUFFER_COPY, useSafetyBuffer } from '../../data/f09/safetyBuffer';
import { formatAmountInput, formatMoney } from '../../data/home/money';
import { F01_COPY as C } from '../../data/f01/copy';
import { patchSetup, useSetup } from '../../data/f02/setupDraft';
import { ShellOverlay, ShellSlot, slot, type ShellBox } from '../surfaces/editorial/Shell';
import { V3Icon, V3Pill } from '../surfaces/v3/V3Surfaces';
import { cleanArt, type CleanArtId } from './overlays/clean/registry';
import { useStateResponse } from '../motion/useMotion';
import type { MenuDestination, MenuPanel, SettingsToolId } from './menuPanels';
import './jurnl-child-environments.css';

/**
 * CH01 on the regenerated SAFE TO SPEND shell (560 × 887; fractions of the art). It has no title paper: the headline is
 * live cream type on the olive field, right of the hanging olive sprig (x < 0.27, y 0.25–0.43); the column runs below it;
 * the actions sit right of the shell's coins and sprig (x < 0.38, y > 0.72).
 */
export const CH01_BOX = {
  head: [0.3, 0.235, 0.96, 0.368],
  /** the help line, beside the sprig */
  intro: [0.3, 0.378, 0.95, 0.46],
  /** rule, BUFFER AMOUNT, amount paper, warnings, effect paper */
  column: [0.14, 0.466, 0.95, 0.785],
  /** BACK and SAVE BUFFER on one row */
  actions: [0.38, 0.8, 0.95, 0.872],
} as const satisfies Record<string, ShellBox>;

/**
 * CH02 on the regenerated PRIVACY & CONSENTS shell (1024 × 1536): the wordmark on the upper paper strip (x 0.25–0.68,
 * y 0.03–0.13), the headline on the title paper (x 0.14–0.82, y 0.13–0.27), the consent list in the olive field
 * (x 0.045–0.78 from y 0.27), REMOVE ACCESS and BACK under it, clear of the arch.
 */
export const CH02_TAG: ShellBox = [0.3, 0.04, 0.63, 0.118];
export const CH02_BOX = {
  head: [0.2, 0.135, 0.8, 0.262],
  list: [0.105, 0.292, 0.765, 0.772],
  remove: [0.15, 0.782, 0.775, 0.852],
  back: [0.22, 0.858, 0.72, 0.928],
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
function PaperSurface({ art, children, testId, className = '', surfaceRef }: { art: CleanArtId; children: ReactNode; testId?: string; className?: string; surfaceRef?: RefObject<HTMLDivElement> }) {
  const a = cleanArt(art);
  return (
    <div ref={surfaceRef} className={`jsp-paper jce-paper-surface ${className}`} data-paper={art} data-testid={testId} style={aspect(art)}>
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
  const [info, setInfo] = useState(false);
  const infoId = useId();
  const column = useRef<HTMLDivElement>(null);
  const amountPaper = useRef<HTMLDivElement>(null);
  const effectPaper = useRef<HTMLDivElement>(null);
  const [refused, setRefused] = useState(0);
  const code = b.currency.code;
  const blocked = b.rateState === 'UNAVAILABLE';
  const save = () => {
    const r = b.save();
    if (r.ok) {
      setError(null);
      setStatus(r.canonicalUsd > 0 ? 'SAVED' : 'CLEARED');
    } else {
      setStatus(null);
      setError(r.reason === 'RATE_UNAVAILABLE' ? BUFFER_COPY.rateUnavailable : BUFFER_COPY.invalid);
      setRefused((n) => n + 1);
    }
  };
  // motion follows the stored state: the effect paper settles only when the saved USD amount has changed; a refused save
  // nudges the amount paper (every refusal, the figure itself never moves)
  useStateResponse(b.storedUsd, effectPaper, () => 'paperSettle');
  useStateResponse(refused, amountPaper, () => 'errorNudge');
  // a warning that does not fit is brought into view inside the column (never the page)
  useEffect(() => {
    const el = column.current?.querySelector<HTMLElement>('[data-jce-message]');
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'nearest' });
  }, [error, blocked, info]);
  return (
    <ShellOverlay testId="global-buffer" composition="child" shell="CH01_BUFFER_SHELL" headTone="cream" ornament title={<>SAFE TO SPEND <span className="jce-title-line">BUFFER</span></>} script="a cushion you keep aside" head={CH01_BOX.head} onClose={onBack} closeLabel="CLOSE SAFE TO SPEND BUFFER">
      <ShellSlot box={CH01_BOX.intro} className="jce-intro">
        <p className="jce-text jce-help">{`SET ASIDE A CUSHION THAT ALWAYS REMAINS OUTSIDE YOUR SPENDABLE AMOUNT.${code === 'USD' ? '' : ` TYPE IT IN ${code}; JURNL KEEPS IT IN USD.`}`}</p>
      </ShellSlot>
      <div ref={column} className="jsh-slot jce-content jce-buffer" data-scroll="true" role="group" aria-label="SAFE TO SPEND BUFFER" style={slot(CH01_BOX.column)}>
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
        <PaperSurface art="CH01_AMOUNT_PAPER" className="jce-amount" testId="buffer-amount-paper" surfaceRef={amountPaper}>
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
        <PaperSurface art="CH01_EFFECT_PAPER" className="jce-effect" testId="buffer-effect-paper" surfaceRef={effectPaper}>
          <span className="jce-effect__kicker">
            EFFECT ON <span className="jce-line">SAFE TO SPEND</span>
          </span>
          <span className="jce-effect__rule" aria-hidden />
          <span className="jce-effect__value" data-testid="buffer-usd" data-usd={String(b.storedUsd)}>
            {b.storedUsd > 0 ? `${formatMoney(b.storedUsd)} KEPT ASIDE` : 'NO BUFFER SET'}
            {b.storedUsd > 0 && code !== 'USD' ? <small>{`KEPT AS USD ${b.storedUsd.toFixed(2)}`}</small> : null}
          </span>
          <button type="button" className="jce-info" data-jrn-trigger="buffer-effect-info" aria-expanded={info} aria-controls={infoId} aria-label="WHAT THE BUFFER DOES" onClick={() => setInfo((v) => !v)}>
            <JurnlMicroArt stem="B06-INFO" slot="buffer-effect-info-mark" />
          </button>
        </PaperSurface>
        {info ? (
          <p className="jce-note" id={infoId} data-testid="buffer-effect-note" data-jce-message>
            <V3Icon name="info" />
            <span>SAFE TO SPEND LEAVES THIS AMOUNT OUT OF WHAT YOU CAN SPEND. IT IS KEPT IN USD AND SHOWN IN YOUR DISPLAY CURRENCY.</span>
          </p>
        ) : null}
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
      <small>{sub.toLowerCase()}</small>
    </span>
  );
}
function ConsentRow({ icon, label, note, on, trigger, onChange }: { icon: OverlayArtStem; label: string; note: string; on: boolean; trigger: string; onChange: (v: boolean) => void }) {
  // restrained acknowledgement of a STORED consent change (never on open, never a re-render): the switch itself shows the
  // value; OFF stays OFF
  const ack = useRef<HTMLSpanElement>(null);
  useStateResponse(on, ack, () => 'consentAck');
  return (
    <div className="jce-row jce-row--consent">
      <span ref={ack} className="jce-ack" aria-hidden />
      <JurnlMicroArt stem={icon} slot={`${trigger}-icon`} className="jma-icon" />
      <RowText label={label} sub={note} />
      <JurnlArtToggle checked={on} label={label} trigger={trigger} slot={`${trigger}-switch`} onChange={onChange} />
    </div>
  );
}
/** What JURNL is and does, not a choice: no switch (NOTHING SOLD, LINKED ACCOUNTS OPTIONAL). */
function StatementRow({ icon, label, note, testId }: { icon: OverlayArtStem; label: string; note: string; testId: string }) {
  return (
    <div className="jce-row jce-row--statement" data-testid={testId}>
      <JurnlMicroArt stem={icon} slot={`${testId}-icon`} className="jma-icon" />
      <RowText label={label} sub={note} />
    </div>
  );
}
function ToolRow({ icon, label, sub, trigger, onClick }: { icon: OverlayArtStem; label: string; sub: string; trigger: string; onClick: () => void }) {
  return (
    <button type="button" className="jce-row jce-row--action" data-jrn-trigger={trigger} onClick={onClick}>
      <JurnlMicroArt stem={icon} slot={`${trigger}-icon`} className="jma-icon" />
      <RowText label={label} sub={sub} />
      <JurnlMicroArt stem="B01-CHEVRON" slot={`${trigger}-chevron`} className="jce-chev" />
    </button>
  );
}

export function PrivacyEnvironment({ onBack, onOpen, askOn, setAsk }: Nav & { askOn: boolean; setAsk: (v: boolean) => void }) {
  const draft = useSetup();
  return (
    <ShellOverlay testId="settings-consents-sheet" composition="child" shell="CH02_PRIVACY_SHELL" tag={CH02_TAG} ornament title={<>PRIVACY & <span className="jce-title-line">CONSENTS</span></>} script="what jurnl may keep and use" head={CH02_BOX.head} onClose={onBack} closeLabel="CLOSE PRIVACY & CONSENTS">
      <ShellSlot box={CH02_BOX.list} className="jce-content jce-list" scroll role="region" ariaLabel="PRIVACY & CONSENTS">
        <h3 className="jce-section">YOUR CONSENTS</h3>
        <ConsentRow icon="B01-GEAR-REMEMBER-SETUP" label="REMEMBER SETUP" note="keep your setup answers on this device." on={draft.consentRemember} trigger="settings-consent-remember" onChange={(v) => patchSetup({ consentRemember: v })} />
        <StatementRow icon="B01-BANK-LINKED-ACCOUNTS" label="LINKED ACCOUNTS OPTIONAL" note="jurnl works without connecting a bank." testId="privacy-statement-links" />
        <StatementRow icon="B01-SHIELD-NOTHING-SOLD" label="NOTHING SOLD" note="your data is never sold." testId="privacy-statement-sale" />
        <ConsentRow icon="B01-SPARKLE-ASK-CONTEXT" label="ASK JURNL CONTEXT" note="let ask jurnl read the screen you are on to explain it. off stays off." on={askOn} trigger="privacy-ask-context" onChange={setAsk} />
        <h3 className="jce-section">YOUR DATA</h3>
        <ToolRow icon="B01-AI-STAR" label={C.privacy.rows['ai-access']} sub="choose what ai features may use." trigger="privacy-tool-ai-access" onClick={() => onOpen(tool('privacy-ai-access'))} />
        <ToolRow icon="B01-DATABASE-YOUR-DATA" label={C.privacy.rows['your-data']} sub="what jurnl keeps on this device." trigger="privacy-tool-your-data" onClick={() => onOpen(tool('privacy-your-data'))} />
        <ToolRow icon="B01-EXPORT-DOWN" label={C.privacy.rows['data-export']} sub="not available yet." trigger="privacy-tool-data-export" onClick={() => onOpen(tool('privacy-data-export'))} />
      </ShellSlot>
      <ShellSlot box={CH02_BOX.remove} className="jce-actions">
        <PaperControl art="CH02_REMOVE_ACCESS_PAPER" tone="cream" trigger="privacy-tool-remove-access" onClick={() => onOpen(tool('privacy-remove-access'))} className="jce-remove" ariaLabel={`${C.privacy.rows['remove-access']}: DELETE ACCOUNT · REVOKE ACCESS · TURN AI OFF`}>
          <JurnlMicroArt stem="B01-TRASH-REMOVE" slot="privacy-tool-remove-access-icon" className="jma-icon" />
          <RowText label={C.privacy.rows['remove-access']} sub="delete account · revoke access · turn ai off." />
          <JurnlMicroArt stem="B01-CHEVRON" slot="privacy-tool-remove-access-chevron" className="jce-chev" />
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
