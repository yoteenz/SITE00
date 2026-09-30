/**
 * Character Fabrication primitives — shell, header, station rail, machine, authority cards.
 * All geometry is live React/SVG/CSS. Photographic material is only ever rendered through <CfImage> slots.
 */
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  STATION_LABEL,
  STATION_ORDER,
  stationNumber,
  type StationId,
  type StationStatus,
} from '../../../../shared/site00-character-fabrication/index.js';
import { useFabrication } from './FabricationContext';
import { CfImage } from './CfImage';
import { IcArrowR, IcCheck, IcChevD, IcChevR, IcMenu, IcWarn } from '../productionHub/icons';

/* ── station hex + rail ─────────────────────────────────────────────────── */

const DONE: StationStatus[] = ['APPROVED', 'LOCKED'];

export function StationHex({ n, state, active }: { n: string; state: StationStatus; active: boolean }) {
  return (
    <span className={`cf-hex${active ? ' is-active' : ''}`} data-state={state} aria-hidden>
      <svg viewBox="0 0 40 44" width="34" height="37">
        <polygon points="20,2 37,11 37,33 20,42 3,33 3,11" />
      </svg>
      <b>{n}</b>
      {DONE.includes(state) && !active ? <i className="cf-hex__ok"><IcCheck width={9} height={9} /></i> : null}
      {state === 'STALE' || state === 'REVISION_REQUIRED' ? <i className="cf-hex__warn">!</i> : null}
    </span>
  );
}

export function FabricationStageRail({ variant = 'horizontal' }: { variant?: 'horizontal' | 'vertical' }) {
  const { state, dispatch, status } = useFabrication();
  return (
    <nav className={`cf-rail cf-rail--${variant}`} aria-label="Fabrication stations" data-testid="cf-stage-rail">
      {STATION_ORDER.map((s, i) => {
        const active = state.activeStation === s;
        const st = status(s);
        return (
          <span key={s} className="cf-rail__cell">
            <button
              type="button"
              className={`cf-rail__btn${active ? ' is-active' : ''}`}
              data-testid={`cf-station-${s}`}
              data-station={s}
              data-station-status={st}
              aria-current={active ? 'step' : undefined}
              onClick={() => dispatch({ type: 'GOTO_STATION', station: s })}
            >
              <StationHex n={stationNumber(s)} state={st} active={active} />
              <span className="cf-rail__label">{STATION_LABEL[s]}</span>
            </button>
            {i < STATION_ORDER.length - 1 ? <span className="cf-rail__link" aria-hidden /> : null}
          </span>
        );
      })}
    </nav>
  );
}

const STATUS_COPY: Record<StationStatus, string> = {
  NOT_STARTED: 'NOT STARTED',
  IN_PROGRESS: 'IN PROGRESS',
  PENDING_FOUNDER: 'PENDING FOUNDER',
  APPROVED: 'APPROVED',
  LOCKED: 'LOCKED',
  REVISION_REQUIRED: 'REVISION REQUIRED',
  STALE: 'NEEDS REVALIDATION',
  BLOCKED: 'BLOCKED',
};

export function AuthorityBadge({ status, className = '' }: { status: StationStatus; className?: string }) {
  return (
    <span className={`cf-badge cf-badge--${status.toLowerCase()} ${className}`} data-testid="cf-authority-badge">
      {STATUS_COPY[status]}
    </span>
  );
}

/** Notice + station status: blockers, staleness, open revision requirements and the revalidation control. */
export function StationStatusBar({ station }: { station: StationId }) {
  const { state, dispatch, status, blockers, now } = useFabrication();
  const st = status(station);
  const b = blockers(station);
  const revs = state.revisionRequests.filter((r) => r.station === station && r.status === 'OPEN');
  const canReval = st === 'STALE' && !b.length;
  return (
    <div className="cf-statusbar" data-testid="cf-statusbar" data-station-status={st}>
      <div className="cf-statusbar__row">
        <span className="cf-statusbar__title">{stationNumber(station)} · {STATION_LABEL[station]}</span>
        <AuthorityBadge status={st} />
      </div>
      {revs.map((r) => (
        <p key={r.revisionId} className="cf-statusbar__rev" data-testid="cf-revision-required">
          <IcWarn width={13} height={13} /> REVISION REQUIRED · {r.source} · {r.note}
        </p>
      ))}
      {st === 'STALE' ? (
        <p className="cf-statusbar__warn">
          <IcWarn width={13} height={13} /> UPSTREAM AUTHORITY CHANGED — THIS STATION MUST BE REVALIDATED.
          {canReval ? (
            <button type="button" className="cf-link" data-testid="cf-revalidate" onClick={() => dispatch({ type: 'REVALIDATE_STATION', station, at: now() })}>REVALIDATE</button>
          ) : null}
        </p>
      ) : null}
      {b.length && st !== 'LOCKED' && st !== 'APPROVED' ? (
        <ul className="cf-statusbar__blockers" data-testid="cf-blockers">
          {b.map((x) => (
            <li key={x.blockerId}>BLOCKER · {x.message}</li>
          ))}
        </ul>
      ) : null}
      {state.notice ? (
        <p className={`cf-notice cf-notice--${state.notice.kind.toLowerCase()}`} role="status" data-testid="cf-notice">
          <span>{state.notice.text}</span>
          <button type="button" aria-label="Dismiss" onClick={() => dispatch({ type: 'DISMISS_NOTICE' })}>×</button>
        </p>
      ) : null}
    </div>
  );
}

/* ── header ─────────────────────────────────────────────────────────────── */

function StepsDial({ n }: { n: number }) {
  const pct = ((8 - n) / 8) * 100;
  return (
    <span className="cf-dial" data-testid="cf-steps">
      <svg viewBox="0 0 40 40" width="38" height="38" aria-hidden>
        <circle cx="20" cy="20" r="17" className="cf-dial__track" />
        <circle cx="20" cy="20" r="17" className="cf-dial__arc" strokeDasharray={`${(pct / 100) * 106.8} 106.8`} transform="rotate(-90 20 20)" />
        <circle cx="20" cy="20" r="8" className="cf-dial__core" />
        <path d="M20 20 L27 12" className="cf-dial__hand" />
      </svg>
      <span>
        <b>{String(n).padStart(2, '0')}</b>
        <small>STEPS REMAINING</small>
      </span>
    </span>
  );
}

export function FabricationHeader({ onReset }: { onReset: () => void }) {
  const { actor, character, url, steps, state } = useFabrication();
  const [pop, setPop] = useState<null | 'project' | 'character' | 'menu'>(null);
  const toggle = (p: 'project' | 'character' | 'menu') => setPop((c) => (c === p ? null : p));
  return (
    <header className="cf-top" data-testid="cf-header">
      <div className="cf-top__brand">
        <b>CHARACTER FABRICATION</b>
        <small>SITE 00 / STUDIO WORLD</small>
      </div>
      <button type="button" className="cf-top__sel" onClick={() => toggle('project')} aria-expanded={pop === 'project'} data-testid="cf-project-select">
        <CfImage slotId={actor.portraitSlotId} url={url(actor.portraitSlotId)} label="" className="cf-top__thumb" />
        <span>
          <small>PROJECT</small>
          <b>{state.selectedProjectId.toUpperCase()}</b>
        </span>
        <IcChevD width={12} height={12} />
      </button>
      <button type="button" className="cf-top__sel" onClick={() => toggle('character')} aria-expanded={pop === 'character'} data-testid="cf-character-select">
        <span>
          <small>CURRENT CHARACTER</small>
          <b>{character.displayName}</b>
        </span>
        <IcChevD width={12} height={12} />
      </button>
      <StepsDial n={steps} />
      <button type="button" className="cf-top__menu" aria-label="Menu" onClick={() => toggle('menu')} data-testid="cf-menu"><IcMenu /></button>
      {pop ? (
        <div className="cf-pop" role="dialog" data-testid={`cf-pop-${pop}`}>
          {pop === 'project' ? (
            <>
              <p className="cf-pop__h">PROJECT / PRODUCTION</p>
              <button type="button" className="cf-pop__row is-on" onClick={() => setPop(null)}>
                <b>NDXBOOK</b><span>ENTRY 002 · SW-017 · IN FABRICATION</span>
              </button>
              <p className="cf-pop__note">OTHER PROJECTS HAVE NO CHARACTER FABRICATION DATA YET.</p>
            </>
          ) : null}
          {pop === 'character' ? (
            <>
              <p className="cf-pop__h">CHARACTERS · ENTRY 002</p>
              <button type="button" className="cf-pop__row is-on" onClick={() => setPop(null)}>
                <b>{character.displayName}</b><span>ACTOR {actor.catalogueNumber} · {character.canonicalName}</span>
              </button>
              <button type="button" className="cf-pop__row" disabled><b>NDX</b><span>NO CATALOGUE ACTOR ASSIGNED</span></button>
              <button type="button" className="cf-pop__row" disabled><b>2016 COMMENTER CHORUS</b><span>ENSEMBLE — CAST PENDING</span></button>
            </>
          ) : null}
          {pop === 'menu' ? (
            <>
              <Link className="cf-pop__row" to={`/production/${state.selectedProjectId}/expression`} onClick={() => setPop(null)}><b>EXPRESSION</b><span>ALL SUB-WORKSPACES</span></Link>
              <Link className="cf-pop__row" to="/production" onClick={() => setPop(null)}><b>PRODUCTION HUB</b><span>RETURN TO CHAMBER</span></Link>
              <button type="button" className="cf-pop__row is-danger" data-testid="cf-reset" onClick={() => { setPop(null); onReset(); }}><b>RESET FABRICATION</b><span>CLEARS THIS DEVICE'S LOCAL STATE</span></button>
            </>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}

/* ── machine + authority cards ──────────────────────────────────────────── */

export function ActorAuthorityCard({ size = 'full', extra }: { size?: 'full' | 'mini'; extra?: ReactNode }) {
  const { actor, url, state, dispatch } = useFabrication();
  return (
    <aside className={`cf-card cf-card--actor cf-card--${size}`} data-testid="cf-actor-card">
      <span className="cf-card__eyebrow">ACTOR</span>
      <h3 className="cf-card__title">{actor.catalogueNumber}</h3>
      {size === 'full' ? (
        <>
          <CfImage slotId={actor.portraitSlotId} url={url(actor.portraitSlotId)} label="ACTOR PORTRAIT" className="cf-card__img" />
          <dl className="cf-kv">
            <div><dt>AGE</dt><dd>{actor.ageRange}</dd></div>
            <div><dt>HEIGHT</dt><dd>{actor.heightRange}</dd></div>
            <div><dt>BUILD</dt><dd>{actor.build}</dd></div>
            <div><dt>STATUS</dt><dd>{actor.verified ? <em className="cf-ok">✓ VERIFIED</em> : 'PENDING'}</dd></div>
          </dl>
          <button type="button" className="cf-btn cf-btn--line" data-testid="cf-view-actor-profile" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'ACTOR_PROFILE' })}>VIEW ACTOR PROFILE <IcArrowR width={13} height={13} /></button>
          <button type="button" className="cf-btn cf-btn--line" data-testid="cf-change-actor" onClick={() => dispatch({ type: 'CHANGE_ACTOR', at: new Date().toISOString() })}>CHANGE ACTOR <IcArrowR width={13} height={13} /></button>
        </>
      ) : (
        <>
          <CfImage slotId={actor.portraitSlotId} url={url(actor.portraitSlotId)} label="ACTOR" className="cf-card__img cf-card__img--mini" />
          <dl className="cf-kv cf-kv--tight">
            <div><dt>PROJECT</dt><dd>{state.selectedProjectId.toUpperCase()}</dd></div>
            <div><dt>ENTRY</dt><dd>{state.selectedEntryId}</dd></div>
          </dl>
        </>
      )}
      {extra}
    </aside>
  );
}

export function CharacterAuthorityCard({ size = 'full' }: { size?: 'full' | 'mini' }) {
  const { character, url, state, status } = useFabrication();
  const overall = status('authority');
  const inFab = overall !== 'LOCKED';
  return (
    <aside className={`cf-card cf-card--character cf-card--${size}`} data-testid="cf-character-card">
      <span className="cf-card__eyebrow">CHARACTER</span>
      <h3 className="cf-card__title">{character.displayName}</h3>
      {size === 'full' ? <CfImage slotId={character.portraitSlotId} url={url(character.portraitSlotId)} label="CHARACTER PORTRAIT" className="cf-card__img cf-card__img--mono" /> : null}
      <dl className="cf-kv">
        {size === 'full' ? (
          <>
            <div><dt>PROJECT</dt><dd>{state.selectedProjectId.toUpperCase()}</dd></div>
            <div><dt>ENTRY</dt><dd>{state.selectedEntryId}</dd></div>
            <div><dt>VERSION</dt><dd>{character.version}</dd></div>
          </>
        ) : null}
        <div><dt>STATUS</dt><dd><em className={inFab ? 'cf-tag cf-tag--red' : 'cf-ok'}>{inFab ? 'IN FABRICATION' : 'AUTHORITY SIGNED OFF'}</em></dd></div>
      </dl>
    </aside>
  );
}

/** Live SVG fabrication chamber. The figure is a named asset slot; the outline guide is live geometry. */
export function FabricationMachine({ children, tall = false }: { children?: ReactNode; tall?: boolean }) {
  const { url } = useFabrication();
  const figure = 'actor.sw017.body.neutral.front';
  return (
    <section className={`cf-machine${tall ? ' cf-machine--tall' : ''}`} data-testid="cf-machine" aria-label="Fabrication machine">
      <svg className="cf-machine__svg" viewBox="0 0 390 330" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <linearGradient id="cfGlass" x1="0" x2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".05" />
            <stop offset=".5" stopColor="#dfe7ee" stopOpacity=".55" />
            <stop offset="1" stopColor="#fff" stopOpacity=".05" />
          </linearGradient>
          <radialGradient id="cfFloor" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#c9ced6" />
          </radialGradient>
        </defs>
        {/* back architecture */}
        {[24, 70, 316, 362].map((x) => <rect key={x} x={x - 6} y="0" width="12" height="250" className="cf-m-pillar" />)}
        {[40, 120, 200, 270].map((y) => <line key={y} x1="0" x2="390" y1={y} y2={y} className="cf-m-line" />)}
        {/* machinery arms */}
        {[-1, 1].map((d) => (
          <g key={d} transform={d === -1 ? '' : 'translate(390 0) scale(-1 1)'} className="cf-m-arm">
            <rect x="52" y="40" width="26" height="210" rx="4" />
            <polyline points="78,110 118,96 140,128" />
            <polyline points="78,180 112,170 128,200" />
            <circle cx="118" cy="96" r="7" /><circle cx="140" cy="128" r="5" /><circle cx="112" cy="170" r="6" />
            <line x1="65" x2="65" y1="52" y2="238" className="cf-m-red" />
          </g>
        ))}
        {/* glass cylinder */}
        <ellipse cx="195" cy="34" rx="92" ry="16" className="cf-m-ring" />
        <ellipse cx="195" cy="34" rx="64" ry="11" className="cf-m-ring cf-m-ring--red" />
        <rect x="103" y="34" width="184" height="222" fill="url(#cfGlass)" className="cf-m-tube" />
        <line x1="103" x2="103" y1="34" y2="256" className="cf-m-edge" />
        <line x1="287" x2="287" y1="34" y2="256" className="cf-m-edge" />
        <line x1="195" x2="195" y1="40" y2="252" className="cf-m-red cf-m-beam" />
        {/* platform */}
        <ellipse cx="195" cy="262" rx="150" ry="34" fill="url(#cfFloor)" className="cf-m-plate" />
        <ellipse cx="195" cy="262" rx="112" ry="24" className="cf-m-ring" />
        <ellipse cx="195" cy="262" rx="84" ry="17" className="cf-m-ring cf-m-ring--red" />
      </svg>
      <div className="cf-machine__figure">
        <CfImage slotId={figure} url={url(figure)} label="ACTOR FIGURE" className="cf-figure" />
        <svg className="cf-machine__outline" viewBox="0 0 60 150" aria-hidden>
          <ellipse cx="30" cy="14" rx="8" ry="10" />
          <path d="M22 26 L10 34 L6 78 M38 26 L50 34 L54 78 M22 26 L24 84 L20 146 M38 26 L36 84 L40 146 M22 26 L38 26" />
        </svg>
      </div>
      {children}
    </section>
  );
}

/* ── small shared bits ──────────────────────────────────────────────────── */

export function Panel({ title, sub, right, children, className = '', testId }: { title?: ReactNode; sub?: ReactNode; right?: ReactNode; children: ReactNode; className?: string; testId?: string }) {
  return (
    <section className={`cf-panel ${className}`} data-testid={testId}>
      {title || right ? (
        <header className="cf-panel__head">
          <span>
            {title ? <h3>{title}</h3> : null}
            {sub ? <small>{sub}</small> : null}
          </span>
          {right}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function Toggle({ on, onChange, label, testId }: { on: boolean; onChange: () => void; label: string; testId?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={`cf-toggle${on ? ' is-on' : ''}`} onClick={onChange} data-testid={testId}>
      <i />
    </button>
  );
}

export function Slider({ value, onChange, label, testId, accent }: { value: number; onChange: (n: number) => void; label: string; testId?: string; accent?: string }) {
  return (
    <input
      type="range"
      min={0}
      max={100}
      value={value}
      aria-label={label}
      data-testid={testId}
      className="cf-slider"
      style={{ ['--cf-fill' as string]: `${value}%`, ['--cf-accent' as string]: accent ?? 'var(--ph-ink)' }}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

export function SlotNote({ text }: { text: string }) {
  return <p className="cf-fixture" data-testid="cf-fixture-note">{text}</p>;
}

export { IcChevR };
