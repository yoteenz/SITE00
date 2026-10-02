import type { CSSProperties } from 'react';
import { DwsIcon } from './DwsIcons';
import { DWS_MODE_LABEL, type DwsMode } from './dwsModel';
import type { DwsFamily, DwsProfile, DwsPBoard } from './dwsProfiles';
import { boardSlot, featuredSlot, projectMarkSlot, SLOT_ATRIUM } from './dwsSlots';
import type { DwsAction, DwsState } from './dwsState';

/** Registered project imagery (slot id → url). Empty until project artwork is injected. */
export const DWS_ART_URLS: Record<string, string> = {};

/**
 * Image-owned artwork slot. Renders the registered image when present; otherwise a neutral text-free placeholder
 * (dark / light) carrying only live geometry. Never an authority-screenshot crop.
 */
export function DwsArt({ slot, tone = 'dark', className = '', style }: { slot: string; tone?: 'dark' | 'light'; className?: string; style?: CSSProperties }) {
  const url = DWS_ART_URLS[slot];
  return (
    <span className={`dws-art dws-art--${tone} ${className}`.trim()} data-asset-slot={slot} data-asset-status={url ? 'injected' : 'placeholder'} style={style} aria-hidden="true">
      {url ? <img src={url} alt="" className="dws-art__img" /> : <i className="dws-art__geo" />}
    </span>
  );
}

/**
 * Contact strip under a board: four CSS crops of the board's OWN art slot (no new slot ids, no invented imagery).
 * Shown only where the authority carries a strip (BRAND boards).
 */
function CropStrip({ slot }: { slot: string }) {
  const url = DWS_ART_URLS[slot];
  return (
    <span className="dws-board__strip" data-asset-crop={slot} aria-hidden="true">
      {[0, 1, 2, 3].map((n) => (
        <i key={n} style={url ? { backgroundImage: `url(${url})`, backgroundPosition: `${n * 33}% 50%` } : undefined} />
      ))}
    </span>
  );
}

/** Palette row on the BRAND visual-identity board: live design tokens, not an image. */
function Swatches() {
  return (
    <span className="dws-board__swatches" aria-hidden="true">
      <i style={{ background: '#111' }} />
      <i style={{ background: 'var(--dws-red)' }} />
      <i style={{ background: '#bdbcbb' }} />
      <i style={{ background: '#5d5d5d' }} />
      <i style={{ background: '#e6dccb' }} />
    </span>
  );
}

function BoardView({ mode, b, index, forward, onForward }: { mode: DwsMode; b: DwsPBoard; index: number; forward: boolean; onForward: () => void }) {
  return (
    <article className={`dws-board dws-board--${index}${forward ? ' is-forward' : ''}`} data-board={`${mode}.${b.id}`} data-tone={b.tone}>
      <button type="button" className="dws-board__hit" onClick={onForward} aria-pressed={forward} aria-label={`${b.title} ${b.subtitle}`}>
        <header className="dws-board__head">
          <b className="dws-board__code">{b.code}</b>
          <span>
            <strong>{b.title}</strong>
            <small>{b.subtitle}</small>
          </span>
          <i className="dws-board__more" aria-hidden="true">
            …
          </i>
        </header>
        <div className="dws-board__body">
          <DwsArt slot={boardSlot(mode, b.id)} tone={b.tone} className="dws-board__art" />
          {b.rows.length ? (
            <ul className="dws-board__rows">
              {b.rows.slice(0, 6).map((r) => (
                <li key={r}>
                  <DwsIcon name="dot" size={9} />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {mode === 'brand' && index === 1 ? <CropStrip slot={boardSlot(mode, b.id)} /> : null}
        {mode === 'brand' && index === 2 ? <Swatches /> : null}
      </button>
    </article>
  );
}

export function DwsStage({
  state,
  dispatch,
  profile,
  family,
  projectName,
}: {
  state: DwsState;
  dispatch: (a: DwsAction) => void;
  profile: DwsProfile;
  family: DwsFamily;
  projectName?: string;
}) {
  const m: DwsMode = state.mode;
  const f = profile.featured;
  const featuredKey = `${m}.${f.id}`;
  const forwardBoard = profile.boards.find((b) => `${m}.${b.id}` === state.forward);

  return (
    <section className={`dws-stage dws-stage--${m}`} aria-label={`${DWS_MODE_LABEL[m]} WORKSPACE`} data-mode={m}>
      <div className="dws-atrium" data-asset-slot={SLOT_ATRIUM} data-asset-status="placeholder" aria-hidden="true">
        <i className="dws-atrium__ring dws-atrium__ring--1" />
        <i className="dws-atrium__ring dws-atrium__ring--2" />
        <i className="dws-atrium__ring dws-atrium__ring--3" />
        <i className="dws-atrium__core" />
      </div>

      <div className="dws-boards">
        {profile.boards.slice(0, 2).map((b, i) => (
          <BoardView key={b.id} mode={m} b={b} index={i + 1} forward={state.forward === `${m}.${b.id}`} onForward={() => dispatch({ type: 'BRING_FORWARD', id: state.forward === `${m}.${b.id}` ? null : `${m}.${b.id}` })} />
        ))}

        <article className={`dws-board dws-board--featured${state.forward === featuredKey ? ' is-forward' : ''}`} data-board={featuredKey}>
          <header className="dws-board__fhead">
            <span>
              <b>{f.lead}</b>
              {f.title ? (
                <>
                  <i> / </i>
                  <strong>{f.title}</strong>
                </>
              ) : null}
            </span>
            <i className="dws-board__more" aria-hidden="true">
              …
            </i>
          </header>
          <div className="dws-board__fbody">
            <DwsArt slot={featuredSlot(m, f.id === 'ov-featured' ? 'ov-featured' : 'featured')} tone="dark" className="dws-board__fart" />
            {f.statement.length ? (
              <p className="dws-board__statement">
                {f.statement.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </p>
            ) : null}
            <div className="dws-board__fside">
              {m === 'brand' && projectName && !f.intro ? (
                <span className="dws-board__fmark">
                  <DwsArt slot={projectMarkSlot(projectName)} tone="dark" className="dws-board__fmark-art" />
                  <b>{projectName}</b>
                </span>
              ) : null}
              {f.intro ? (
                <p className="dws-board__intro">
                  {f.intro.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </p>
              ) : null}
              <ul className="dws-board__fentries">
                {f.entries.map((e) => (
                  <li key={e}>
                    <i aria-hidden="true" />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {m === 'brand' ? <CropStrip slot={featuredSlot(m, f.id === 'ov-featured' ? 'ov-featured' : 'featured')} /> : null}
          <button type="button" className="dws-board__expr" onClick={() => dispatch({ type: 'OPEN_EXPRESSION' })} aria-label="OPEN INTERACTION EXPRESSION">
            <span className="dws-board__expr-label">OPEN INTERACTION EXPRESSION</span>
            <DwsIcon name="chevronR" size={12} />
          </button>
        </article>

        {profile.boards.slice(2).map((b, i) => (
          <BoardView key={b.id} mode={m} b={b} index={i + 3} forward={state.forward === `${m}.${b.id}`} onForward={() => dispatch({ type: 'BRING_FORWARD', id: state.forward === `${m}.${b.id}` ? null : `${m}.${b.id}` })} />
        ))}
      </div>

      {family === 'tabletP' && m === 'brand' ? (
        <div className="dws-chips-float" aria-hidden="false">
          <p className="dws-ambient dws-ambient--l">
            BRANDS
            <br />
            PEOPLE
            <br />
            CULTURE
            <br />
            INTO WORLDS
          </p>
          <p className="dws-ambient dws-ambient--r">
            A UNIFIED
            <br />
            BRAND SYSTEM
            <br />
            FOR WHAT&apos;S NEXT
          </p>
          <div className="dws-chip-float dws-chip-float--sys">
            <strong>LIVE BRAND SYSTEM</strong>
            <small>MULTI-TOUCHPOINT PREVIEW</small>
            <i />
          </div>
          <button type="button" className="dws-chip-float dws-chip-float--film" onClick={() => dispatch({ type: 'OPEN_LIBRARY' })}>
            <strong>BRAND FILM</strong>
            <small>VISUAL DIRECTION</small>
          </button>
          <button type="button" className="dws-chip-float dws-chip-float--apps" onClick={() => dispatch({ type: 'OPEN_LIBRARY' })}>
            <strong>GLOBAL APPLICATIONS</strong>
            <small>248 ITEMS</small>
          </button>
        </div>
      ) : null}

      {profile.tagline ? (
        <footer className="dws-tagline">
          <span>{profile.tagline[0]}</span>
          <span className="dws-tagline__scroll">
            {profile.tagline[1]}
            <DwsIcon name="chevron" size={12} />
          </span>
          <span>{profile.tagline[2]}</span>
        </footer>
      ) : null}

      {forwardBoard ? (
        <div className="dws-forward" role="status" data-testid="dws-forward">
          <span>{forwardBoard.title} · BROUGHT FORWARD</span>
          {forwardBoard.portal ? (
            <button type="button" onClick={() => dispatch({ type: 'MODE_SWITCH', mode: forwardBoard.portal! })} data-testid="dws-portal">
              OPEN {DWS_MODE_LABEL[forwardBoard.portal]}
            </button>
          ) : (
            <button type="button" onClick={() => dispatch({ type: 'OPEN_LIBRARY' })}>
              OPEN LIBRARY
            </button>
          )}
          <button type="button" onClick={() => dispatch({ type: 'BRING_FORWARD', id: null })} aria-label="RETURN TO OVERVIEW">
            <DwsIcon name="close" size={12} />
          </button>
        </div>
      ) : null}
    </section>
  );
}
