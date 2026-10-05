/**
 * 01 IDENTITY — authorities 5414 (Actor Catalogue) and 5415 (Actor Profile).
 * Geometry transcribed from the authorities on the 432px canvas.
 */
import { useMemo, useRef } from 'react';
import { actorAngleSlotId, STATION_LABEL, STATION_ORDER, stationNumber, type ActorRecord } from '../../../../shared/site00-character-fabrication/index.js';
import { IcArrowR, IcChevR, IcClose, IcCompare, IcExpand, IcFilter, IcMenu, IcSearch, IcUser } from '../productionHub/icons';
import { CfImage } from './CfImage';
import { useFabrication } from './FabricationContext';
import { ChamberPlate, StandardHero } from './chamber';
import { StationHex } from './primitives';

/* ── 5414 ───────────────────────────────────────────────────────────────── */

export function ActorCard({ a, selected, onSelect, layout }: { a: ActorRecord; selected: boolean; onSelect: () => void; layout: 'GRID' | 'LIST' }) {
  const { url } = useFabrication();
  return (
    <button type="button" className={`cf-actor${selected ? ' is-selected' : ''} cf-actor--${layout.toLowerCase()}`} onClick={onSelect} data-testid={`cf-actor-${a.catalogueNumber}`} aria-pressed={selected}>
      <CfImage slotId={a.portraitSlotId} url={url(a.portraitSlotId)} label={a.catalogueNumber} className="cf-actor__img" />
      {selected ? <i className="cf-actor__tick">✓</i> : null}
      <b>{a.catalogueNumber}</b>
      <small>{a.entryLabel}</small>
      <small>{a.projectLabel}</small>
    </button>
  );
}

export function ActorCatalogue() {
  const { state, dispatch, actors, url, now } = useFabrication();
  const strip = useRef<HTMLDivElement | null>(null);
  const shown = useMemo(() => {
    const q = state.actorQuery.trim().toLowerCase();
    let list = actors.filter((a) => !q || `${a.catalogueNumber} ${a.stageName} ${a.projectLabel} ${a.build}`.toLowerCase().includes(q));
    if (state.actorFilter === 'AVAILABLE') list = list.filter((a) => a.availability === 'AVAILABLE');
    if (state.actorFilter === 'IN_PRODUCTION') list = list.filter((a) => a.availability === 'IN CURRENT PRODUCTION');
    return [...list].sort((x, y) => (state.actorSort === 'NUMBER' ? x.catalogueNumber.localeCompare(y.catalogueNumber) : y.projectsUsed.length - x.projectsUsed.length || y.updatedAt.localeCompare(x.updatedAt)));
  }, [actors, state.actorQuery, state.actorFilter, state.actorSort]);
  const sel = actors.find((a) => a.actorId === state.selectedActorCandidateId) ?? actors[0]!;
  const confirmed = state.authority.identity !== 'NONE' && sel.actorId === state.selectedActorId;
  const usage = [
    ...sel.campaignsUsed.map((c, i) => ({ k: `u${i}`, t: `${(sel.projectsUsed[i] ?? sel.projectsUsed[0] ?? '').toUpperCase()} · ${c.replace('entry-', 'ENTRY ')}`, s: 'PRODUCTION USAGE' })),
    ...state.history.filter((h) => h.station === 'identity').slice(0, 3).map((h, i) => ({ k: `h${i}`, t: h.message, s: new Date(h.at).toISOString().slice(11, 16) + 'Z' })),
  ].slice(0, 4);
  return (
    <section className="cf-cat" data-testid="cf-actor-catalogue">
      <header className="cf-cat__head">
        <small>01 - IDENTITY</small>
        <h2>ACTOR CATALOGUE</h2>
        <p>SELECT AN EXISTING ACTOR AUTHORITY</p>
        <button type="button" className="cf-x" aria-label="Close catalogue" onClick={() => dispatch({ type: 'CATALOGUE_OPEN', open: false })}><IcClose width={10} height={10} /></button>
      </header>
      <div className="cf-cat__bar">
        <label className="cf-field-search">
          <IcSearch width={7} height={7} />
          <input type="search" placeholder="SEARCH ACTORS" value={state.actorQuery} onChange={(e) => dispatch({ type: 'ACTOR_QUERY', query: e.target.value })} data-testid="cf-actor-search" />
        </label>
        <button type="button" className="cf-fbtn" data-testid="cf-actor-filter" onClick={() => dispatch({ type: 'ACTOR_FILTER', filter: state.actorFilter === 'ALL' ? 'AVAILABLE' : state.actorFilter === 'AVAILABLE' ? 'IN_PRODUCTION' : 'ALL' })}>
          {state.actorFilter === 'ALL' ? 'FILTERS' : state.actorFilter.replace('_', ' ')} <IcFilter width={7} height={7} />
        </button>
        <select className="cf-fsel" value={state.actorSort} onChange={(e) => dispatch({ type: 'ACTOR_SORT', sort: e.target.value as 'RECENT' | 'NUMBER' })} aria-label="Sort" data-testid="cf-actor-sort">
          <option value="RECENT">RECENTLY USED</option>
          <option value="NUMBER">CATALOGUE NO.</option>
        </select>
        <span className="cf-seg2" role="group" aria-label="Layout">
          <button type="button" className={state.actorLayout === 'GRID' ? 'is-on' : ''} onClick={() => dispatch({ type: 'ACTOR_LAYOUT', layout: 'GRID' })} aria-label="Grid" aria-pressed={state.actorLayout === 'GRID'} data-testid="cf-layout-grid"><IcCompare width={7} height={7} /></button>
          <button type="button" className={state.actorLayout === 'LIST' ? 'is-on' : ''} onClick={() => dispatch({ type: 'ACTOR_LAYOUT', layout: 'LIST' })} aria-label="List" aria-pressed={state.actorLayout === 'LIST'} data-testid="cf-layout-list"><IcMenu width={7} height={7} /></button>
        </span>
      </div>
      <div className={`cf-cat__strip cf-cat__strip--${state.actorLayout.toLowerCase()}`} ref={strip} data-testid="cf-actor-grid">
        {shown.map((a) => (
          <ActorCard key={a.actorId} a={a} layout={state.actorLayout} selected={a.actorId === state.selectedActorCandidateId} onSelect={() => dispatch({ type: 'SELECT_ACTOR', actorId: a.actorId })} />
        ))}
        {!shown.length ? <p className="cf-empty">NO ACTORS MATCH THESE FILTERS</p> : null}
      </div>
      {state.actorLayout === 'GRID' && shown.length > 4 ? (
        <button type="button" className="cf-cat__next" aria-label="More actors" onClick={() => strip.current?.scrollBy({ left: 188, behavior: 'smooth' })}><IcChevR width={9} height={9} /></button>
      ) : null}
      <div className="cf-cat__tri">
        <section className="cf-box cf-cat__prov">
          <h4>PROVENANCE</h4>
          <dl className="cf-krows">
            <div><dt>AUTHORITY ID</dt><dd>{sel.authorityId.replace('id-auth-', 'ACT-')}</dd></div>
            <div><dt>AUTHORITY LEVEL</dt><dd>{sel.authorityLevel}</dd></div>
            <div><dt>LAST UPDATED</dt><dd>{sel.updatedAt.slice(0, 10)}</dd></div>
            <div><dt>DATA SOURCE</dt><dd>STUDIO CATALOGUE</dd></div>
            <div><dt>AVAILABILITY</dt><dd>{sel.availability}</dd></div>
          </dl>
        </section>
        <section className="cf-box cf-cat__usage">
          <h4>RECENT USAGE</h4>
          <ul>
            {usage.length ? usage.map((u) => (
              <li key={u.k}><i><IcUser width={6} height={6} /></i><span><b>{u.t}</b><small>{u.s}</small></span></li>
            )) : <li><i><IcUser width={6} height={6} /></i><span><b>NO PRODUCTION USAGE</b><small>CATALOGUE ONLY</small></span></li>}
          </ul>
        </section>
        <section className="cf-box cf-cat__pv">
          <CfImage slotId={sel.portraitSlotId} url={url(sel.portraitSlotId)} label={`${sel.catalogueNumber} PROFILE`} className="cf-cat__pvimg" />
          <button type="button" className="cf-cbtn cf-cbtn--c" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'ACTOR_PROFILE' })} data-testid="cf-view-full-profile">VIEW FULL PROFILE <IcArrowR width={7} height={7} /></button>
        </section>
      </div>
      <div className="cf-cat__act">
        <span className="cf-cat__confirmwrap">
          <button type="button" className="cf-rbtn" data-testid="cf-confirm-actor" onClick={() => dispatch({ type: 'CONFIRM_ACTOR', at: now() })}>
            {confirmed ? `ACTOR ${sel.catalogueNumber} CONFIRMED` : `CONFIRM ACTOR ${sel.catalogueNumber}`} <IcArrowR width={9} height={9} />
          </button>
        </span>
        <button type="button" className="cf-obtn" data-testid="cf-cancel-actor" onClick={() => dispatch({ type: 'SELECT_ACTOR', actorId: state.selectedActorId })}>CANCEL</button>
      </div>
    </section>
  );
}

export function IdentityView() {
  const { state, dispatch, actor, blockers } = useFabrication();
  const open = state.actorCatalogueOpen;
  return (
    <>
      <StandardHero
        h={310}
        railTop={252}
        cardTop={40}
        cyl={{ top: 15, plat: 232 }}
        figureAnchor={{ centerX: 216, footY: 240, width: 92, height: 248, groundPlaneY: 232 }}
        actorRows={open ? ['AGE', 'HEIGHT', 'ETHNICITY', 'STATUS', 'ENTRY', 'PROJECT', 'VERSION'] : ['AGE', 'HEIGHT', 'ETHNICITY', 'STATUS']}
        actorActions={!open}
        cardH={203}
      />
      {open ? (
        <ActorCatalogue />
      ) : (
        <section className="cf-cat cf-cat--confirmed" data-testid="cf-identity-confirmed">
          <header className="cf-cat__head">
            <small>01 - IDENTITY</small>
            <h2>ACTOR {actor.catalogueNumber} CONFIRMED</h2>
            <p>IDENTITY AUTHORITY {state.authority.identity === 'LOCKED' ? 'LOCKED' : 'PENDING'} · {actor.catalogueNumber} IS THE REUSABLE SOURCE ACTOR — SUBJECT WOMAN IS THE ENTRY 002 CHARACTER</p>
          </header>
          <div className="cf-cat__act">
            <button type="button" className="cf-obtn" data-testid="cf-open-catalogue" onClick={() => dispatch({ type: 'CATALOGUE_OPEN', open: true })}>OPEN ACTOR CATALOGUE</button>
            <button type="button" className="cf-rbtn" data-testid="cf-continue-body" onClick={() => dispatch({ type: 'GOTO_STATION', station: 'body' })} disabled={blockers('body').length > 0}>CONTINUE TO BODY <IcArrowR width={9} height={9} /></button>
          </div>
        </section>
      )}
    </>
  );
}

/* ── 5415 ───────────────────────────────────────────────────────────────── */

export function VerticalStationRail() {
  const { state, dispatch, status } = useFabrication();
  return (
    <nav className="cf-vrail2" aria-label="Fabrication stations" data-testid="cf-stage-rail">
      {STATION_ORDER.map((s) => {
        const active = state.activeStation === s;
        return (
          <button key={s} type="button" className={`cf-vrail2__btn${active ? ' is-active' : ''}`} data-station={s} data-station-status={status(s)} aria-current={active ? 'step' : undefined} onClick={() => dispatch({ type: 'GOTO_STATION', station: s })}>
            {active ? (
              <>
                <span className="cf-vrail2__lbl">{STATION_LABEL[s]}</span>
                <b>{stationNumber(s)}</b>
              </>
            ) : (
              <>
                <StationHex n={stationNumber(s)} state={status(s)} active={false} />
                <span className="cf-vrail2__lbl">{STATION_LABEL[s]}</span>
              </>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export function ActorProfile() {
  const { actor, character, dispatch, url, now } = useFabrication();
  const angles = ['front', 'left', 'right', 'back'] as const;
  const meta: [string, string][] = [
    ['AGE RANGE', actor.ageRange],
    ['HEIGHT', actor.heightRange],
    ['ETHNICITY', actor.castingTags[0] ?? '—'],
    ['BODY TYPE', actor.build],
    ['EYE COLOR', actor.eyes],
    ['HAIR COLOR', actor.hair],
    ['SKIN TONE', actor.skinTone],
    ['UNION STATUS', 'NOT RECORDED'],
    ['VOICE PROFILE', actor.accents.join(' / ')],
    ['LANGUAGES', actor.languages.join(', ')],
  ];
  return (
    <div className="cf-prof" data-testid="cf-actor-profile">
      <div className="cf-prof__plate"><ChamberPlate h={685} cyl={{ top: 10, plat: 650 }} /></div>
      <div className="cf-prof__frame">
        <VerticalStationRail />
        <section className="cf-prof__panel">
          <header className="cf-prof__head">
            <small>ACTOR PROFILE</small>
            <h2>{actor.catalogueNumber} {actor.verified ? <em className="cf-verified cf-verified--lg">✓ VERIFIED</em> : null}</h2>
            <p>{character.displayName}</p>
            <div className="cf-prof__level"><small>AUTHORITY LEVEL</small><b>{actor.authorityLevel}</b><small>{actor.authorityLevel === 'A1' ? 'FULL USAGE APPROVED' : 'PENDING APPROVAL'}</small></div>
          </header>
          <dl className="cf-prof__strip">
            <div><dt>PROJECT</dt><dd>{actor.projectLabel}</dd></div>
            <div><dt>ENTRY</dt><dd>{actor.entryLabel.replace('ENTRY ', '')}</dd></div>
            <div><dt>UNION STATUS</dt><dd>NOT RECORDED</dd></div>
            <div><dt>AVAILABILITY</dt><dd>{actor.availability}</dd></div>
          </dl>
          <div className="cf-prof__hero">
            <CfImage slotId={actor.portraitSlotId} url={url(actor.portraitSlotId)} label="ACTOR PORTRAIT" className="cf-prof__img" />
            <span className="cf-prof__expand" aria-hidden><IcExpand width={10} height={10} /></span>
          </div>
          <section className="cf-box cf-prof__angles">
            <h4>APPROVED ANGLES</h4>
            <div>
              {angles.map((a) => (
                <figure key={a}>
                  <CfImage slotId={actorAngleSlotId(actor.catalogueNumber, a)} url={url(actorAngleSlotId(actor.catalogueNumber, a))} label={a.toUpperCase()} className="cf-prof__angle" />
                  <figcaption>{a.toUpperCase()}</figcaption>
                </figure>
              ))}
            </div>
          </section>
          <section className="cf-box cf-prof__refs">
            <h4>CONTINUITY REFERENCES</h4>
            <div>{(['eye', 'skin', 'scar'] as const).map((r) => <CfImage key={r} slotId={`actor.sw017.continuity.${r}`} url={url(`actor.sw017.continuity.${r}`)} label={r.toUpperCase()} className="cf-prof__ref" />)}</div>
            <button type="button" className="cf-cbtn cf-cbtn--c" disabled title="No reference library service yet">VIEW ALL REFERENCES <IcArrowR width={7} height={7} /></button>
          </section>
          <section className="cf-box cf-prof__meta">
            <h4>ACTOR METADATA</h4>
            <dl className="cf-krows cf-krows--meta">{meta.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
            <button type="button" className="cf-cbtn cf-cbtn--c" disabled title="No bio service yet">VIEW FULL BIO <IcArrowR width={7} height={7} /></button>
          </section>
          <section className="cf-box cf-prof__usage">
            <h4>USAGE HISTORY <span className="cf-redlink">CATALOGUE RECORD</span></h4>
            <ul>
              {actor.projectsUsed.length ?
                actor.campaignsUsed.map((c, i) => (
                  <li key={c}>
                    <CfImage slotId={`${actor.portraitSlotId}`} url={null} label="" className="cf-prof__uimg" />
                    <span><b>{(actor.projectsUsed[i] ?? actor.projectsUsed[0])!.toUpperCase()}</b><small>{i === 0 ? 'LEAD' : 'SUPPORTING'}</small></span>
                    <span><small>{c.replace('entry-', 'ENTRY ')}</small><small>{actor.updatedAt.slice(0, 10)}</small></span>
                    <em className="cf-verified">✓ {actor.availability === 'IN CURRENT PRODUCTION' ? 'ACTIVE' : 'APPROVED'}</em>
                  </li>
                ))
              : <li className="cf-dim">NO PRODUCTION HISTORY</li>}
            </ul>
          </section>
          <section className="cf-box cf-prof__avail"><span><small>AVAILABILITY WINDOW</small><b>{actor.availability}</b></span><em className="cf-verified">{actor.availability === 'AVAILABLE' ? 'AVAILABLE' : 'IN USE'}</em></section>
          <section className="cf-box cf-prof__rate"><span><small>RATE CARD</small><b>NOT INTEGRATED</b></span><button type="button" className="cf-cbtn" disabled>VIEW</button></section>
          <div className="cf-prof__act">
            <button type="button" className="cf-obtn cf-obtn--red" data-testid="cf-profile-change" onClick={() => dispatch({ type: 'CHANGE_ACTOR', at: now() })}>CHANGE ACTOR <IcArrowR width={9} height={9} /></button>
            <button type="button" className="cf-rbtn" data-testid="cf-profile-return" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'STATION' })}>RETURN TO FABRICATION <IcArrowR width={9} height={9} /></button>
          </div>
        </section>
      </div>
    </div>
  );
}
