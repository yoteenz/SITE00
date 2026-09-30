/**
 * Character Fabrication primitives — shell, header, station rail, machine, authority cards.
 * All geometry is live React/SVG/CSS. Photographic material is only ever rendered through <CfImage> slots.
 */
import { useEffect, useState, type ReactNode } from 'react';
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
import { IcArrowR, IcCheck, IcChevD, IcChevL, IcChevR, IcLock, IcMenu, IcWarn } from '../productionHub/icons';
import type React from 'react';

/* ── station hex + rail ─────────────────────────────────────────────────── */

const DONE: StationStatus[] = ['APPROVED', 'LOCKED'];

export function StationHex({ n, state, active }: { n: string; state: StationStatus; active: boolean }) {
  return (
    <span className={`cf-hex${active ? ' is-active' : ''}`} data-state={state} aria-hidden>
      <svg viewBox="0 0 28 30">
        <polygon points="14,1.5 26,8 26,22 14,28.5 2,22 2,8" />
      </svg>
      <b>{n}</b>
      {DONE.includes(state) && !active ? <i className="cf-hex__ok"><IcCheck width={6} height={6} /></i> : null}
      {state === 'STALE' || state === 'REVISION_REQUIRED' ? <i className="cf-hex__warn">!</i> : null}
    </span>
  );
}

/** 01–08 mechanical progression. Authored on the 432px canvas: panel 409×44, eight equal cells. */
export function FabricationStageRail({ className = '', chevrons = false }: { className?: string; chevrons?: boolean }) {
  const { state, dispatch, status } = useFabrication();
  const idx = STATION_ORDER.indexOf(state.activeStation);
  const go = (d: -1 | 1) => dispatch({ type: 'GOTO_STATION', station: STATION_ORDER[Math.max(0, Math.min(7, idx + d))]! });
  return (
    <nav className={`cf-rail ${className}${chevrons ? ' cf-rail--chev' : ''}`} aria-label="Fabrication stations" data-testid="cf-stage-rail">
      {chevrons ? <button type="button" className="cf-rail__chev is-l" aria-label="Previous station" disabled={idx === 0} onClick={() => go(-1)}><IcChevL width={9} height={9} /></button> : null}
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
              aria-label={`${stationNumber(s)} ${STATION_LABEL[s]} — ${st.replace(/_/g, ' ')}`}
              onClick={() => dispatch({ type: 'GOTO_STATION', station: s })}
            >
              {active ? <i className="cf-rail__pin" aria-hidden /> : null}
              <StationHex n={stationNumber(s)} state={st} active={active} />
              <span className="cf-rail__label">{STATION_LABEL[s]}</span>
            </button>
            {i < STATION_ORDER.length - 1 ? <span className="cf-rail__link" aria-hidden><i /></span> : null}
          </span>
        );
      })}
      {chevrons ? <button type="button" className="cf-rail__chev is-r" aria-label="Next station" disabled={idx === 7} onClick={() => go(1)}><IcChevR width={9} height={9} /></button> : null}
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
  const showInterlock = b.length > 0 && st !== 'LOCKED' && st !== 'APPROVED' && st !== 'NOT_STARTED';
  // The rail already carries station status; this bar only appears when there is something to act on.
  if (!revs.length && st !== 'STALE' && !showInterlock) return <span hidden data-testid="cf-statusbar" data-station-status={st} />;
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
      {showInterlock ? (
        <div className="cf-interlock" data-testid="cf-blockers" role="group" aria-label="Machine interlocks">
          <span className="cf-interlock__h"><IcLock width={12} height={12} /> INTERLOCK · {STATION_LABEL[station]} CANNOT AUTHORIZE DOWNSTREAM WORK</span>
          <ul>
            {b.map((x) => (
              <li key={x.blockerId}>
                <i className="cf-socket" aria-hidden />
                <span>{x.message}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/* ── header (authority: 432×35) ─────────────────────────────────────────── */

function StepsDial({ n }: { n: number }) {
  const done = (8 - n) / 8;
  const a = -Math.PI / 2 + done * Math.PI * 2;
  return (
    <span className="cf-dial" data-testid="cf-steps">
      <svg viewBox="0 0 22 22" aria-hidden>
        <circle cx="11" cy="11" r="10" className="cf-dial__ring" />
        <circle cx="11" cy="11" r="7.6" className="cf-dial__face" />
        <circle cx="11" cy="11" r="10" className="cf-dial__arc" strokeDasharray={`${done * 62.8} 62.8`} transform="rotate(-90 11 11)" />
        <line x1="11" y1="11" x2={11 + Math.cos(a) * 6} y2={11 + Math.sin(a) * 6} className="cf-dial__hand" />
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
    <header className={`cf-top${state.surface === 'ACTOR_PROFILE' ? ' cf-top--profile' : ''}${state.activeStation === 'appearance' && state.surface === 'STATION' ? ' cf-top--actor' : ''}`} data-testid="cf-header">
      <div className="cf-top__brand">
        <b>CHARACTER FABRICATION</b>
        <small>SITE 00 / STUDIO WORLD</small>
      </div>
      <button type="button" className="cf-top__sel cf-top__sel--proj" onClick={() => toggle('project')} aria-expanded={pop === 'project'} data-testid="cf-project-select">
        <CfImage slotId={actor.portraitSlotId} url={url(actor.portraitSlotId)} label="" className="cf-top__thumb" />
        {state.activeStation === 'appearance' && state.surface === 'STATION' ? (
          <span>
            <small>ACTOR</small>
            <b>{actor.catalogueNumber}</b>
          </span>
        ) : (
          <span>
            <small>PROJECT</small>
            <b>{state.selectedProjectId.toUpperCase()}</b>
          </span>
        )}
        <IcChevD width={7} height={7} />
      </button>
      <button type="button" className="cf-top__sel" onClick={() => toggle('character')} aria-expanded={pop === 'character'} data-testid="cf-character-select">
        {state.surface === 'ACTOR_PROFILE' ? (
          <span>
            <small>ENTRY</small>
            <b>{state.selectedEntryId}</b>
          </span>
        ) : state.activeStation === 'appearance' && state.surface === 'STATION' ? (
          <span>
            <small>PROJECT</small>
            <b>{state.selectedProjectId.toUpperCase()}</b>
          </span>
        ) : (
          <span>
            <small>CURRENT CHARACTER</small>
            <b>{character.displayName}</b>
          </span>
        )}
        <IcChevD width={7} height={7} />
      </button>
      <StepsDial n={steps} />
      <button type="button" className="cf-top__menu" aria-label="Menu" onClick={() => toggle('menu')} data-testid="cf-menu"><IcMenu width={12} height={12} /></button>
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

/* ── authority cards mounted in the chamber ─────────────────────────────── */

type ActorRow = 'AGE' | 'HEIGHT' | 'ETHNICITY' | 'STATUS' | 'ENTRY' | 'PROJECT' | 'VERSION';

export function ActorAuthorityCard({
  rows = ['AGE', 'HEIGHT', 'ETHNICITY', 'STATUS'],
  actions = true,
  className = '',
  style,
}: {
  rows?: readonly ActorRow[];
  actions?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { actor, url, state, character, dispatch, now } = useFabrication();
  const v: Record<ActorRow, ReactNode> = {
    AGE: actor.ageRange,
    HEIGHT: actor.heightRange,
    ETHNICITY: actor.castingTags[0] ?? '—',
    STATUS: actor.verified ? <em className="cf-verified">✓ VERIFIED</em> : 'PENDING',
    ENTRY: state.selectedEntryId,
    PROJECT: state.selectedProjectId.toUpperCase(),
    VERSION: character.version,
  };
  return (
    <aside className={`cf-acard ${className}`} style={style} data-testid="cf-actor-card">
      <i className="cf-acard__tick" aria-hidden />
      <header><small>ACTOR</small><b>{actor.catalogueNumber}</b></header>
      <CfImage slotId={actor.portraitSlotId} url={url(actor.portraitSlotId)} label="ACTOR PORTRAIT" className="cf-acard__img" />
      <dl className="cf-rows">
        {rows.map((r) => <div key={r}><dt>{r}</dt><dd>{v[r]}</dd></div>)}
      </dl>
      {actions ? (
        <div className="cf-acard__btns">
          <button type="button" className="cf-cbtn" data-testid="cf-view-actor-profile" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'ACTOR_PROFILE' })}>VIEW ACTOR PROFILE <IcArrowR width={8} height={8} /></button>
          <button type="button" className="cf-cbtn" data-testid="cf-change-actor" onClick={() => dispatch({ type: 'CHANGE_ACTOR', at: now() })}>CHANGE ACTOR <IcArrowR width={8} height={8} /></button>
        </div>
      ) : null}
    </aside>
  );
}

export function CharacterAuthorityCard({ className = '', style, mono = true }: { className?: string; style?: React.CSSProperties; mono?: boolean }) {
  const { character, url, state, status, dispatch } = useFabrication();
  const inFab = status('authority') !== 'LOCKED';
  return (
    <aside className={`cf-acard cf-acard--char ${className}`} style={style} data-testid="cf-character-card">
      <i className="cf-acard__tick" aria-hidden />
      <header><small>CHARACTER</small><b>{character.displayName}</b></header>
      <CfImage slotId={character.portraitSlotId} url={url(character.portraitSlotId)} label="CHARACTER PORTRAIT" className={`cf-acard__img${mono ? ' is-mono' : ''}`} />
      <dl className="cf-rows">
        <div><dt>PROJECT</dt><dd>{state.selectedProjectId.toUpperCase()}</dd></div>
        <div><dt>ENTRY</dt><dd>{state.selectedEntryId}</dd></div>
        <div><dt>VERSION</dt><dd>{character.version}</dd></div>
        <div><dt>STATUS</dt><dd><em className={inFab ? 'cf-infab' : 'cf-verified'}>{inFab ? 'IN FABRICATION' : 'CANONICAL'}</em></dd></div>
      </dl>
      <div className="cf-acard__btns">
        <button type="button" className="cf-cbtn" data-testid="cf-view-character-brief" onClick={() => dispatch({ type: 'GOTO_STATION', station: 'character' })}>VIEW CHARACTER BRIEF <IcArrowR width={8} height={8} /></button>
        <button type="button" className="cf-cbtn" data-testid="cf-edit-character" onClick={() => dispatch({ type: 'GOTO_STATION', station: 'authority' })}>EDIT CHARACTER <IcArrowR width={8} height={8} /></button>
      </div>
    </aside>
  );
}

/** Transient system notice — floats above the bottom nav so it never displaces the authority composition. */
export function NoticeToast() {
  const { state, dispatch } = useFabrication();
  useEffect(() => {
    if (!state.notice) return;
    const id = window.setTimeout(() => dispatch({ type: 'DISMISS_NOTICE' }), 5000);
    return () => window.clearTimeout(id);
  }, [state.notice, dispatch]);
  if (!state.notice) return null;
  return (
    <p className={`cf-toast cf-toast--${state.notice.kind.toLowerCase()}`} role="status" data-testid="cf-notice">
      <span>{state.notice.text}</span>
      <button type="button" aria-label="Dismiss" onClick={() => dispatch({ type: 'DISMISS_NOTICE' })}>×</button>
    </p>
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
