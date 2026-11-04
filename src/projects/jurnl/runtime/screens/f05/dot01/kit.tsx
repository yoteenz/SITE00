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

export const CARD_SRC = { bank: cardBank, payout: cardPayout, cash: cardCash, credit: cardCredit } as const;

export function Paper({ kind = 'panel', children, className = '', style, testId }: { kind?: 'panel' | 'sheet' | 'blank'; children: ReactNode; className?: string; style?: CSSProperties; testId?: string }) {
  return (
    <div className={`d01-paper d01-paper--${kind} ${className}`} style={style} data-testid={testId}>
      {children}
    </div>
  );
}

export function Strip({ icon, label, sub, onClick, trigger, warn, disabled, i = 0, aria }: { icon: string; label: string; sub?: string; onClick: () => void; trigger: string; warn?: boolean; disabled?: boolean; i?: number; aria?: string }) {
  return (
    <button type="button" className={`d01-strip ${warn ? 'd01-strip--warn' : ''}`} data-jrn-trigger={trigger} aria-label={aria} disabled={disabled} onClick={onClick} style={{ ['--i' as string]: i } as CSSProperties}>
      <span className="d01-strip__ico">
        <Icon name={icon} />
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

export function Field({ label, icon, children, stack, uncertain, hint }: { label: string; icon?: string; children: (id: string) => ReactNode; stack?: boolean; uncertain?: boolean; hint?: string }) {
  const id = useId();
  return (
    <div className={`d01-field ${stack ? 'd01-field--stack' : ''}`} data-uncertain={uncertain ? 'true' : undefined} style={icon || stack ? undefined : { gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.2fr)' }}>
      {icon && !stack ? (
        <span className="d01-row__ico" aria-hidden>
          <Icon name={icon} />
        </span>
      ) : null}
      <label htmlFor={id}>
        {label}
        {hint ? <small style={{ display: 'block', fontSize: '0.78em', opacity: 0.75 }}>{hint}</small> : null}
      </label>
      {children(id)}
    </div>
  );
}

export function TextInput({ label, value, onValue, icon, trigger, placeholder, uncertain, hint, inputMode, stack, type = 'text', maxLength = 80 }: { label: string; value: string; onValue: (v: string) => void; icon?: string; trigger: string; placeholder?: string; uncertain?: boolean; hint?: string; inputMode?: 'decimal' | 'text' | 'numeric'; stack?: boolean; type?: 'text' | 'date'; maxLength?: number }) {
  return (
    <Field label={label} icon={icon} uncertain={uncertain} hint={hint} stack={stack}>
      {(id) => <input id={id} type={type} value={value} placeholder={placeholder} inputMode={inputMode} maxLength={maxLength} data-jrn-trigger={trigger} onChange={(e) => onValue(e.target.value)} autoComplete="off" />}
    </Field>
  );
}

export function SelectInput<T extends string>({ label, value, onValue, options, icon, trigger, uncertain, placeholder = 'SELECT' }: { label: string; value: T | ''; onValue: (v: T) => void; options: { id: T; label: string }[]; icon?: string; trigger: string; uncertain?: boolean; placeholder?: string }) {
  return (
    <Field label={label} icon={icon} uncertain={uncertain}>
      {(id) => (
        <select id={id} value={value} data-jrn-trigger={trigger} onChange={(e) => onValue(e.target.value as T)}>
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      )}
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
export function AccountCard({ account, amount, liability, onOpen, trigger, badge, compact }: { account: JurnlAccountRecord; amount: number; liability: boolean; onOpen?: () => void; trigger?: string; badge?: string; compact?: boolean }) {
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
    <button type="button" className={cls} data-jrn-trigger={trigger} data-account-id={account.account_id} aria-label={`${account.display_name}. ${formatMoney(amount)} ${liability ? 'OWED' : 'HELD'}${badge ? `. ${badge}` : ''}. OPEN.`} onClick={onOpen}>
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
