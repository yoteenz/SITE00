/**
 * F05 DOT 01 — the paper kit used by every page and overlay (screen px). Real form controls with labels; values
 * typed by the user are kept as typed in the inputs (display is uppercase by CSS; storage follows the canonical
 * ledger builders). No circular tappable controls.
 */
import { Fragment, useId, type CSSProperties, type ReactNode } from 'react';
import type { JurnlAccountRecord } from '../../../../data/foundation/accounts';
import { formatMoney } from '../../../../data/home/money';
import { nameLines } from '../../../../data/f05/moneyParentReading';
import { kindOf } from '../../../../data/f05/dot01/accountView';
import cardBank from '../../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_CARD_BANK.webp';
import cardPayout from '../../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_CARD_PAYOUT.webp';
import cardCash from '../../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_CARD_CASH.webp';
import cardCredit from '../../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_CARD_CREDIT.webp';
import { Chevron, Icon } from './icons';
import { MicroIcon } from '../MicroIcon';
import type { MicroAssetId } from '../microAssets';
import type { LongPressBind } from './PocketManager';
import { JurnlDateField, JurnlSelect } from '../surfaces/JurnlSurfaces';

export const CARD_SRC = { bank: cardBank, payout: cardPayout, cash: cardCash, credit: cardCredit } as const;

export function Paper({ kind = 'panel', children, className = '', style, testId }: { kind?: 'panel' | 'sheet' | 'blank'; children: ReactNode; className?: string; style?: CSSProperties; testId?: string }) {
  return (
    <div className={`d01-paper d01-paper--${kind} ${className}`} style={style} data-testid={testId}>
      {children}
    </div>
  );
}

export function Strip({ icon, asset, label, sub, onClick, trigger, warn, disabled, i = 0, aria }: { icon: string; asset?: MicroAssetId; label: string; sub?: string; onClick: () => void; trigger: string; warn?: boolean; disabled?: boolean; i?: number; aria?: string }) {
  return (
    <button type="button" className={`d01-strip ${warn ? 'd01-strip--warn' : ''}`} data-jrn-trigger={trigger} aria-label={aria} disabled={disabled} onClick={onClick} style={{ ['--i' as string]: i } as CSSProperties}>
      <span className="d01-strip__ico" data-art={asset ? 'true' : undefined}>
        <MicroIcon id={asset} fallback={<Icon name={icon} />} />
      </span>
      <span className="d01-strip__rule" aria-hidden />
      <span>
        {label}
        {sub ? <small style={{ display: 'block', fontSize: '0.72em', letterSpacing: '0.1em', opacity: 0.8 }}>{sub}</small> : null}
      </span>
      <Chevron className="d01-strip__chev" />
    </button>
  );
}

/** Two torn papers side by side, each a two-line label over a large figure (authorities 13 / 23: TRACKED · ACTUAL). */
export type Figure = {
  label: string[];
  value: string;
  testId?: string;
  cents?: number;
  /** the figure is where the person types it (13: ACTUAL BALANCE), as the authority draws the entered actual */
  input?: { value: string; onValue: (v: string) => void; trigger: string; aria: string };
};
export function FigurePair({ left, right, testId }: { left: Figure; right: Figure; testId?: string }) {
  const base = useId();
  return (
    <div className="d01-figs" data-testid={testId}>
      {[left, right].map((f, i) => {
        const id = `${base}-${i}`;
        return (
          <div key={i} className="d01-paper d01-paper--panel d01-fig">
            {f.input ? (
              <label className="d01-fig__label" htmlFor={id}>
                {f.label.map((l, j) => (
                  <span key={j}>{l}</span>
                ))}
              </label>
            ) : (
              <p className="d01-fig__label">
                {f.label.map((l, j) => (
                  <span key={j}>{l}</span>
                ))}
              </p>
            )}
            {f.input ? (
              <input
                id={id}
                className="d01-fig__value d01-fig__input"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="—"
                aria-label={f.input.aria}
                value={f.input.value}
                data-jrn-trigger={f.input.trigger}
                data-testid={f.testId}
                onChange={(e) => f.input!.onValue(e.target.value)}
              />
            ) : (
              <b className="d01-fig__value" data-testid={f.testId} data-jrn-amount-cents={f.cents}>
                {f.value}
              </b>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** The dark band the authorities set a key figure on (07 ACCOUNT BALANCE · 13 DIFFERENCE · 23 ADJUSTMENT AMOUNT):
 *  cream label, a gold rule, the figure in gold. Live text; the figure keeps its canonical value. */
export function FigureBand({ label, value, sub, testId, cents, tone = 'gold' }: { label: string[]; value: string; sub?: string; testId?: string; cents?: number; tone?: 'gold' | 'cream' }) {
  return (
    <div className="d01-band" data-testid={testId}>
      <span className="d01-band__label">
        {label.map((l, j) => (
          <span key={j}>{l}</span>
        ))}
      </span>
      <span className="d01-band__rule" aria-hidden />
      <b className="d01-band__value" data-tone={tone} data-jrn-amount-cents={cents}>
        {value}
      </b>
      {sub ? <small className="d01-band__sub">{sub}</small> : null}
    </div>
  );
}

/** The place a screen is about, on the same parchment strip as the actions (13 / 23 draw BANK ACCOUNT this way); not a button. */
export function PlaceStrip({ icon, label, testId }: { icon: string; label: string; testId?: string }) {
  return (
    <div className="d01-strip d01-strip--static" data-testid={testId}>
      <span className="d01-strip__ico">
        <Icon name={icon} />
      </span>
      <span className="d01-strip__rule" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export function Row({ icon, label, value, sub, testId }: { icon?: string; label: string; value?: ReactNode; sub?: string; testId?: string }) {
  return (
    <div className="d01-row" data-testid={testId} style={icon ? undefined : { gridTemplateColumns: '1fr auto' }}>
      {icon ? (
        <span className="d01-row__ico">
          <Icon name={icon} />
        </span>
      ) : null}
      <span>
        {label}
        {sub ? <small>{sub}</small> : null}
      </span>
      {value != null ? <b>{value}</b> : <span />}
    </div>
  );
}

export function Field({ label, icon, children, stack, uncertain, hint }: { label: string; icon?: string; children: (id: string, labelId: string) => ReactNode; stack?: boolean; uncertain?: boolean; hint?: string }) {
  const id = useId();
  const labelId = `${id}-label`;
  return (
    <div className={`d01-field ${stack ? 'd01-field--stack' : ''}`} data-uncertain={uncertain ? 'true' : undefined} style={icon || stack ? undefined : { gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.2fr)' }}>
      {icon && !stack ? (
        <span className="d01-row__ico" aria-hidden>
          <Icon name={icon} />
        </span>
      ) : null}
      <label htmlFor={id} id={labelId}>
        {label}
        {hint ? <small style={{ display: 'block', fontSize: '0.78em', opacity: 0.75 }}>{hint}</small> : null}
      </label>
      {children(id, labelId)}
    </div>
  );
}

export function TextInput({ label, value, onValue, icon, trigger, placeholder, uncertain, hint, inputMode, stack, type = 'text', maxLength = 80 }: { label: string; value: string; onValue: (v: string) => void; icon?: string; trigger: string; placeholder?: string; uncertain?: boolean; hint?: string; inputMode?: 'decimal' | 'text' | 'numeric'; stack?: boolean; type?: 'text' | 'date'; maxLength?: number }) {
  return (
    <Field label={label} icon={icon} uncertain={uncertain} hint={hint} stack={stack}>
      {(id, labelId) =>
        type === 'date' ? (
          <JurnlDateField id={id} value={value} onValue={onValue} trigger={trigger} labelledBy={labelId} placeholder={placeholder ?? 'SELECT DATE'} uncertain={uncertain} />
        ) : (
          <input id={id} type="text" value={value} placeholder={placeholder} inputMode={inputMode} maxLength={maxLength} data-jrn-trigger={trigger} onChange={(e) => onValue(e.target.value)} autoComplete="off" />
        )
      }
    </Field>
  );
}

export function SelectInput<T extends string>({ label, value, onValue, options, icon, trigger, uncertain, placeholder = 'SELECT' }: { label: string; value: T | ''; onValue: (v: T) => void; options: { id: T; label: string }[]; icon?: string; trigger: string; uncertain?: boolean; placeholder?: string }) {
  return (
    <Field label={label} icon={icon} uncertain={uncertain}>
      {(id, labelId) => <JurnlSelect id={id} value={value} options={options} onValue={onValue} trigger={trigger} placeholder={placeholder} labelledBy={labelId} uncertain={uncertain} />}
    </Field>
  );
}

export function ChipChoice<T extends string>({ label, value, options, onChange, trigger, multi }: { label: string; value: T[]; options: { id: T; label: string }[]; onChange: (v: T[]) => void; trigger: string; multi?: boolean }) {
  return (
    <div role="group" aria-label={label} className="d01-chips" data-jrn-trigger={trigger}>
      {options.map((o) => {
        const on = value.includes(o.id);
        return (
          <button key={o.id} type="button" className="d01-chipbtn" aria-pressed={on} data-jrn-trigger={`${trigger}-${o.id.toLowerCase()}`} onClick={() => onChange(multi ? (on ? value.filter((x) => x !== o.id) : [...value, o.id]) : [o.id])}>
            {on && multi ? '✓ ' : ''}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Alert({ tone = 'warn', children, testId, role = 'status' }: { tone?: 'warn' | 'ok'; children: ReactNode; testId?: string; role?: 'status' | 'alert' }) {
  return (
    <div className={`d01-alert ${tone === 'ok' ? 'd01-ok' : ''}`} role={role} data-testid={testId}>
      <Icon name={tone === 'ok' ? 'check' : 'warn'} />
      <span>{children}</span>
    </div>
  );
}

export function Button({ children, onClick, trigger, quiet, danger, disabled, icon, type = 'button' }: { children: ReactNode; onClick?: () => void; trigger: string; quiet?: boolean; danger?: boolean; disabled?: boolean; icon?: string; type?: 'button' | 'submit' }) {
  return (
    <button type={type} className={`d01-btn ${quiet ? 'd01-btn--quiet' : ''} ${danger ? 'd01-btn--danger' : ''}`} data-jrn-trigger={trigger} disabled={disabled} onClick={onClick}>
      {icon ? <Icon name={icon} /> : null}
      {children}
    </button>
  );
}

/** An account paper (SK01's own card art for its kind) with live name and amount; a real button when onOpen is set. */
export function AccountCard({ account, amount, liability, onOpen, trigger, badge, compact, hold }: { account: JurnlAccountRecord; amount: number; liability: boolean; onOpen?: () => void; trigger?: string; badge?: string; compact?: boolean; hold?: LongPressBind }) {
  const kind = kindOf(account);
  const lines = nameLines(account.display_name);
  const body = (
    <>
      <img className="d01-card__art" src={CARD_SRC[kind]} alt="" draggable={false} />
      <span className="d01-card__name">
        {lines.map((l, i) => (
          <Fragment key={`${i}-${l}`}>
            {i ? ' ' : null}
            <span>{l}</span>
          </Fragment>
        ))}
      </span>
      <b className="d01-card__amount" data-jrn-amount-cents={Math.round(amount * 100)}>
        {formatMoney(amount)}
      </b>
      {liability ? <i className="d01-card__owed">OWED</i> : null}
      {badge ? <span className="d01-card__badge">{badge}</span> : null}
      {onOpen ? <Chevron className="d01-card__chev" /> : null}
    </>
  );
  const cls = `d01-card ${compact ? 'd01-card--compact' : ''}`;
  return onOpen ? (
    <button type="button" className={cls} data-jrn-trigger={trigger} data-account-id={account.account_id} aria-label={`${account.display_name}. ${formatMoney(amount)} ${liability ? 'OWED' : 'HELD'}${badge ? `. ${badge}` : ''}. OPEN.`} aria-keyshortcuts={hold ? 'Shift+F10' : undefined} aria-description={hold ? 'PRESS AND HOLD, OR SHIFT F10, TO MANAGE THIS POCKET.' : undefined} onClick={onOpen} {...hold}>
      {body}
    </button>
  ) : (
    <div className={cls} data-account-id={account.account_id}>
      {body}
    </div>
  );
}

export function money(n: number, signed = false): string {
  return formatMoney(n, signed);
}
