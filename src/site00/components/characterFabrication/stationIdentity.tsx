import { useMemo } from 'react';
import { actorAngleSlotId, STATION_LABEL, STATION_ORDER, stationNumber, type ActorRecord } from '../../../../shared/site00-character-fabrication/index.js';
import { IcArrowR, IcChevR, IcClose, IcCompare, IcExpand, IcFilter, IcSearch } from '../productionHub/icons';
import { CfImage } from './CfImage';
import { useFabrication } from './FabricationContext';
import { Panel } from './primitives';

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
  const { state, dispatch, actors, now } = useFabrication();
  const shown = useMemo(() => {
    const q = state.actorQuery.trim().toLowerCase();
    let list = actors.filter((a) => (!q || `${a.catalogueNumber} ${a.stageName} ${a.projectLabel} ${a.build}`.toLowerCase().includes(q)));
    if (state.actorFilter === 'AVAILABLE') list = list.filter((a) => a.availability === 'AVAILABLE');
    if (state.actorFilter === 'IN_PRODUCTION') list = list.filter((a) => a.availability === 'IN CURRENT PRODUCTION');
    list = [...list].sort((x, y) => (state.actorSort === 'NUMBER' ? x.catalogueNumber.localeCompare(y.catalogueNumber) : (y.projectsUsed.length - x.projectsUsed.length) || y.updatedAt.localeCompare(x.updatedAt)));
    return list;
  }, [actors, state.actorQuery, state.actorFilter, state.actorSort]);
  const sel = actors.find((a) => a.actorId === state.selectedActorCandidateId) ?? actors[0]!;
  const confirmed = state.authority.identity !== 'NONE' && sel.actorId === state.selectedActorId;
  return (
    <Panel
      className="cf-catalogue"
      testId="cf-actor-catalogue"
      title={<><span className="cf-eyebrow">01 - IDENTITY</span><span className="cf-h2">ACTOR CATALOGUE</span></>}
      sub="SELECT AN EXISTING ACTOR AUTHORITY"
      right={<button type="button" className="cf-iconbtn" aria-label="Close catalogue" onClick={() => dispatch({ type: 'CATALOGUE_OPEN', open: false })}><IcClose /></button>}
    >
      <div className="cf-toolbar">
        <label className="cf-search">
          <IcSearch width={14} height={14} />
          <input type="search" placeholder="SEARCH ACTORS" value={state.actorQuery} onChange={(e) => dispatch({ type: 'ACTOR_QUERY', query: e.target.value })} data-testid="cf-actor-search" />
        </label>
        <button type="button" className="cf-btn cf-btn--line cf-btn--sm" data-testid="cf-actor-filter" onClick={() => dispatch({ type: 'ACTOR_FILTER', filter: state.actorFilter === 'ALL' ? 'AVAILABLE' : state.actorFilter === 'AVAILABLE' ? 'IN_PRODUCTION' : 'ALL' })}>
          FILTERS · {state.actorFilter.replace('_', ' ')} <IcFilter width={13} height={13} />
        </button>
        <select className="cf-select" value={state.actorSort} onChange={(e) => dispatch({ type: 'ACTOR_SORT', sort: e.target.value as 'RECENT' | 'NUMBER' })} aria-label="Sort" data-testid="cf-actor-sort">
          <option value="RECENT">RECENTLY USED</option>
          <option value="NUMBER">CATALOGUE NO.</option>
        </select>
        <span className="cf-seg" role="group" aria-label="Layout">
          <button type="button" className={state.actorLayout === 'GRID' ? 'is-on' : ''} onClick={() => dispatch({ type: 'ACTOR_LAYOUT', layout: 'GRID' })} aria-label="Grid" data-testid="cf-layout-grid"><IcCompare width={14} height={14} /></button>
          <button type="button" className={state.actorLayout === 'LIST' ? 'is-on' : ''} onClick={() => dispatch({ type: 'ACTOR_LAYOUT', layout: 'LIST' })} aria-label="List" data-testid="cf-layout-list"><IcFilter width={14} height={14} /></button>
        </span>
      </div>
      <div className={`cf-actorgrid cf-actorgrid--${state.actorLayout.toLowerCase()}`} data-testid="cf-actor-grid">
        {shown.map((a) => (
          <ActorCard key={a.actorId} a={a} layout={state.actorLayout} selected={a.actorId === state.selectedActorCandidateId} onSelect={() => dispatch({ type: 'SELECT_ACTOR', actorId: a.actorId })} />
        ))}
        {!shown.length ? <p className="cf-empty">NO ACTORS MATCH THESE FILTERS</p> : null}
      </div>
      <div className="cf-triple">
        <Panel title="PROVENANCE" className="cf-mini">
          <dl className="cf-kv cf-kv--rows">
            <div><dt>AUTHORITY ID</dt><dd>{sel.authorityId.replace('id-auth-', 'ACT-')}</dd></div>
            <div><dt>LEVEL</dt><dd>{sel.authorityLevel}</dd></div>
            <div><dt>LAST UPDATED</dt><dd>{new Date(sel.updatedAt).toISOString().slice(0, 10)}</dd></div>
            <div><dt>DATA SOURCE</dt><dd>STUDIO CATALOGUE</dd></div>
            <div><dt>AVAILABILITY</dt><dd>{sel.availability}</dd></div>
          </dl>
        </Panel>
        <Panel title="RECENT USAGE" className="cf-mini">
          <ul className="cf-usage">
            {sel.projectsUsed.length ?
              sel.campaignsUsed.map((c, i) => <li key={c}><b>{(sel.projectsUsed[i] ?? sel.projectsUsed[0])!.toUpperCase()}</b><span>{c.replace('entry-', 'ENTRY ')}</span></li>)
            : <li><b>NO PRODUCTION USAGE</b><span>CATALOGUE ONLY</span></li>}
          </ul>
        </Panel>
        <div className="cf-profilecard">
          <CfImage slotId={sel.portraitSlotId} url={null} label="ACTOR" className="cf-profilecard__img" />
          <button type="button" className="cf-btn cf-btn--line cf-btn--sm" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'ACTOR_PROFILE' })} data-testid="cf-view-full-profile">VIEW FULL PROFILE <IcArrowR width={13} height={13} /></button>
        </div>
      </div>
      <div className="cf-actions">
        <button type="button" className="cf-btn cf-btn--red cf-btn--lg" data-testid="cf-confirm-actor" onClick={() => dispatch({ type: 'CONFIRM_ACTOR', at: now() })}>
          {confirmed ? `ACTOR ${sel.catalogueNumber} CONFIRMED` : `CONFIRM ACTOR ${sel.catalogueNumber}`} <IcArrowR width={14} height={14} />
        </button>
        <button type="button" className="cf-btn cf-btn--line cf-btn--lg" data-testid="cf-cancel-actor" onClick={() => dispatch({ type: 'SELECT_ACTOR', actorId: state.selectedActorId })}>CANCEL</button>
      </div>
    </Panel>
  );
}

export function ActorProfile() {
  const { actor, dispatch, url, state, status, now } = useFabrication();
  const angles = ['front', 'left', 'right', 'back'] as const;
  return (
    <div className="cf-profile" data-testid="cf-actor-profile">
      <aside className="cf-vrail">
        <nav aria-label="Stations" className="cf-vrail__inner">
          {STATION_ORDER.map((s) => (
            <button key={s} type="button" className={`cf-vrail__btn${state.activeStation === s ? ' is-active' : ''}`} data-station-status={status(s)} onClick={() => dispatch({ type: 'GOTO_STATION', station: s })}>
              <em>{stationNumber(s)}</em>
              <span>{STATION_LABEL[s]}</span>
            </button>
          ))}
        </nav>
      </aside>
      <div className="cf-profile__body">
        <header className="cf-profile__head">
          <div>
            <span className="cf-eyebrow">ACTOR PROFILE</span>
            <h2 className="cf-h1">{actor.catalogueNumber} {actor.verified ? <em className="cf-ok cf-ok--chip">✓ VERIFIED</em> : null}</h2>
            <p className="cf-sub">{actor.stageName}</p>
          </div>
          <div className="cf-level"><small>AUTHORITY LEVEL</small><b>{actor.authorityLevel}</b><small>{actor.authorityLevel === 'A1' ? 'FULL USAGE APPROVED' : 'PENDING APPROVAL'}</small></div>
        </header>
        <dl className="cf-strip">
          <div><dt>PROJECT</dt><dd>{actor.projectLabel}</dd></div>
          <div><dt>ENTRY</dt><dd>{actor.entryLabel.replace('ENTRY ', '')}</dd></div>
          <div><dt>AVAILABILITY</dt><dd>{actor.availability}</dd></div>
          <div><dt>LANGUAGES</dt><dd>{actor.languages.join(', ')}</dd></div>
        </dl>
        <div className="cf-profile__grid">
          <div className="cf-profile__hero">
            <CfImage slotId={actor.portraitSlotId} url={url(actor.portraitSlotId)} label="ACTOR PORTRAIT" className="cf-profile__img" />
            <span className="cf-expand"><IcExpand width={16} height={16} /></span>
          </div>
          <div className="cf-profile__side">
            <Panel title="APPROVED ANGLES" className="cf-mini">
              <div className="cf-angles">
                {angles.map((a) => (
                  <figure key={a}>
                    <CfImage slotId={actorAngleSlotId(actor.catalogueNumber, a)} url={url(actorAngleSlotId(actor.catalogueNumber, a))} label={a.toUpperCase()} className="cf-angles__img" />
                    <figcaption>{a.toUpperCase()}</figcaption>
                  </figure>
                ))}
              </div>
            </Panel>
            <Panel title="CONTINUITY REFERENCES" className="cf-mini">
              <div className="cf-refs">
                {(['eye', 'skin', 'scar'] as const).map((r) => <CfImage key={r} slotId={`actor.sw017.continuity.${r}`} url={null} label={r.toUpperCase()} className="cf-refs__img" />)}
              </div>
              <button type="button" className="cf-btn cf-btn--line cf-btn--sm" disabled title="No reference library service yet">VIEW ALL REFERENCES <IcArrowR width={13} height={13} /></button>
            </Panel>
          </div>
        </div>
        <div className="cf-profile__grid cf-profile__grid--meta">
          <Panel title="ACTOR METADATA" className="cf-mini">
            <dl className="cf-kv cf-kv--rows">
              <div><dt>AGE RANGE</dt><dd>{actor.ageRange}</dd></div>
              <div><dt>HEIGHT</dt><dd>{actor.heightRange}</dd></div>
              <div><dt>BUILD</dt><dd>{actor.build}</dd></div>
              <div><dt>SKIN TONE</dt><dd>{actor.skinTone}</dd></div>
              <div><dt>HAIR</dt><dd>{actor.hair}</dd></div>
              <div><dt>EYES</dt><dd>{actor.eyes}</dd></div>
              <div><dt>ACCENTS</dt><dd>{actor.accents.join(', ')}</dd></div>
              <div><dt>CONTINUITY RISK</dt><dd>{actor.continuityRisk}</dd></div>
            </dl>
          </Panel>
          <Panel title="USAGE HISTORY" right={<span className="cf-eyebrow cf-eyebrow--red">CATALOGUE RECORD</span>} className="cf-mini">
            <ul className="cf-usage cf-usage--rich">
              {actor.projectsUsed.length ?
                actor.campaignsUsed.map((c, i) => (
                  <li key={c}><span className="cf-usage__t"><b>{(actor.projectsUsed[i] ?? actor.projectsUsed[0])!.toUpperCase()}</b><small>{c.replace('entry-', 'ENTRY ')}</small></span><em className="cf-ok cf-ok--chip">✓ {actor.availability === 'IN CURRENT PRODUCTION' ? 'ACTIVE' : 'APPROVED'}</em></li>
                ))
              : <li><span className="cf-usage__t"><b>NO PRODUCTION HISTORY</b></span></li>}
            </ul>
          </Panel>
        </div>
        <div className="cf-profile__grid cf-profile__grid--meta">
          <div className="cf-inline"><b>AVAILABILITY WINDOW</b><span>{actor.availability}</span></div>
          <div className="cf-inline"><b>RATE CARD</b><span>NOT INTEGRATED</span></div>
        </div>
        <div className="cf-actions">
          <button type="button" className="cf-btn cf-btn--line cf-btn--lg" data-testid="cf-profile-change" onClick={() => { dispatch({ type: 'CHANGE_ACTOR', at: now() }); }}>CHANGE ACTOR <IcArrowR width={14} height={14} /></button>
          <button type="button" className="cf-btn cf-btn--red cf-btn--lg" data-testid="cf-profile-return" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'STATION' })}>RETURN TO FABRICATION <IcChevR width={14} height={14} /></button>
        </div>
      </div>
    </div>
  );
}
