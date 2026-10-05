import type { CSSProperties } from 'react';
import { DwsIcon } from './DwsIcons';
import { DWS_MODE_LABEL, DWS_STAGE, type DwsBoard, type DwsMode } from './dwsModel';
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

function BoardView({ b, index, forward, onForward }: { b: DwsBoard; index: number; forward: boolean; onForward: () => void }) {
  return (
    <article
      className={`dws-board dws-board--${index}${forward ? ' is-forward' : ''}`}
      data-board={b.id}
      data-tone={b.tone}
    >
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
          <DwsArt slot={b.slot} tone={b.tone} className="dws-board__art" />
          <ul className="dws-board__rows">
            {b.rows.slice(0, 6).map((r) => (
              <li key={r.label}>
                <DwsIcon name={r.icon} size={9} />
                <span>{r.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </button>
    </article>
  );
}

export function DwsStage({ state, dispatch }: { state: DwsState; dispatch: (a: DwsAction) => void }) {
  const m: DwsMode = state.mode;
  const model = DWS_STAGE[m];
  const featuredForward = state.forward === model.featured.id;

  return (
    <section className={`dws-stage dws-stage--${m}`} aria-label={`${DWS_MODE_LABEL[m]} WORKSPACE`} data-mode={m}>
      <div className="dws-atrium" data-asset-slot="ENV.DESIGN.ATRIUM" data-asset-status="placeholder" aria-hidden="true">
        <i className="dws-atrium__ring dws-atrium__ring--1" />
        <i className="dws-atrium__ring dws-atrium__ring--2" />
        <i className="dws-atrium__ring dws-atrium__ring--3" />
        <i className="dws-atrium__core" />
      </div>

      <div className="dws-boards">
        {model.boards.slice(0, 2).map((b, i) => (
          <BoardView key={b.id} b={b} index={i + 1} forward={state.forward === b.id} onForward={() => dispatch({ type: 'BRING_FORWARD', id: state.forward === b.id ? null : b.id })} />
        ))}

        <article className={`dws-board dws-board--featured${featuredForward ? ' is-forward' : ''}`} data-board={model.featured.id}>
          <header className="dws-board__fhead">
            <span>
              <b>{DWS_MODE_LABEL[m]}</b>
              <i> / </i>
              <strong>{model.featured.title}</strong>
            </span>
            <i className="dws-board__more" aria-hidden="true">
              …
            </i>
          </header>
          <div className="dws-board__fbody">
            <DwsArt slot={model.featured.slot} tone="dark" className="dws-board__fart">
            </DwsArt>
            <p className="dws-board__statement">
              {model.featured.statement.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </p>
            <ul className="dws-board__fentries">
              {model.featured.entries.map((e) => (
                <li key={e}>
                  <i aria-hidden="true" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
          <button type="button" className="dws-board__expr" onClick={() => dispatch({ type: 'OPEN_EXPRESSION' })}>
            <span>OPEN INTERACTION EXPRESSION</span>
            <DwsIcon name="arrow" size={14} />
          </button>
        </article>

        {model.boards.slice(2).map((b, i) => (
          <BoardView key={b.id} b={b} index={i + 3} forward={state.forward === b.id} onForward={() => dispatch({ type: 'BRING_FORWARD', id: state.forward === b.id ? null : b.id })} />
        ))}
      </div>

      <footer className="dws-tagline">
        <span>{model.tagline[0]}</span>
        <span className="dws-tagline__scroll">SCROLL TO EXPLORE</span>
        <span>{model.tagline[1]}</span>
      </footer>

      {state.forward && state.forward !== model.featured.id ? (
        <div className="dws-forward" role="status">
          <span>
            {[...model.boards].find((b) => b.id === state.forward)?.title ?? ''} · BROUGHT FORWARD
          </span>
          <button type="button" onClick={() => dispatch({ type: 'OPEN_LIBRARY' })}>
            OPEN LIBRARY
          </button>
          <button type="button" onClick={() => dispatch({ type: 'BRING_FORWARD', id: null })} aria-label="RETURN TO OVERVIEW">
            <DwsIcon name="close" size={12} />
          </button>
        </div>
      ) : null}
    </section>
  );
}
