import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getStudioWorldActorCatalogue } from '../../../../shared/site00-studio-world/acting-catalogue/index.js';
import { useProductionAuthorityData } from './ProductionAuthorityData';
import { AUTHORITY_ASSETS } from './authorityAssets';
import { Dot, Sec, Tabs, Thumb } from './primitives';

type Lib = { id: string; title: string; sub: string; img: string; scope: string };

/** Collection plates: authority red-geometry / world / stage art (OPUS2). The Actor Catalogue shows the project's live cast art when it exists. */
const LIBRARIES: Lib[] = [
  { id: 'actors', title: 'Actor Catalogue', sub: 'Characters, faces, profiles', img: AUTHORITY_ASSETS.libraryPlates[0]!, scope: 'Cross-project casting authority. Actor ≠ Character ≠ Campaign Look.' },
  { id: 'wardrobe', title: 'Wardrobe Library', sub: 'Clothing, accessories, looks', img: AUTHORITY_ASSETS.libraryPlates[1]!, scope: 'Garments, styling notes, era, role compatibility.' },
  { id: 'hair', title: 'Hair + Makeup Library', sub: 'Styles, beauty, grooming', img: AUTHORITY_ASSETS.libraryPlates[2]!, scope: 'Hair styles and makeup / grooming looks.' },
  { id: 'environment', title: 'Environment Library', sub: 'Locations, atmospheres', img: AUTHORITY_ASSETS.experienceWorld, scope: 'Reusable environments and lighting modes.' },
  { id: 'sets', title: 'Set Library', sub: 'Sets, zones, anchors', img: AUTHORITY_ASSETS.expressionStage, scope: 'Sets with zones, interaction anchors, prop compatibility.' },
  { id: 'prop', title: 'Prop Library', sub: 'Props, practical objects', img: AUTHORITY_ASSETS.libraryPlates[0]!, scope: 'Props and practical objects tagged for set compatibility.' },
  { id: 'graphic', title: 'Graphic / Text Asset Library', sub: 'Signage, screens, text anchors', img: AUTHORITY_ASSETS.libraryPlates[1]!, scope: 'Signage, screens, framed graphics and replaceable text.' },
  { id: 'performance', title: 'Performance Library', sub: 'Movement, behavior, voice', img: AUTHORITY_ASSETS.libraryPlates[2]!, scope: 'Behavior, movement and animation skins.' },
];

type Canon = 'canonical' | 'review' | 'superseded' | 'archive';

const CATEGORIES: { label: string; lib: string | null }[] = [
  { label: 'AUTHORITIES', lib: null },
  { label: 'ASSETS', lib: null },
  { label: 'CHARACTERS', lib: 'actors' },
  { label: 'ENVIRONMENTS', lib: 'environment' },
  { label: 'EXPRESSIONS', lib: 'performance' },
  { label: 'REFERENCES', lib: 'graphic' },
  { label: 'ICONS', lib: 'prop' },
  { label: 'MATERIALS', lib: 'wardrobe' },
  { label: 'DOCUMENTS', lib: 'hair' },
  { label: 'ARCHIVE', lib: 'sets' },
];

export function LibraryBody() {
  const data = useProductionAuthorityData();
  const [canon, setCanon] = useState<Canon>('canonical');
  const [category, setCategory] = useState<string>('AUTHORITIES');
  const [open, setOpen] = useState<string | null>(null);
  const actors = getStudioWorldActorCatalogue().actors;
  const production = data?.production ?? null;
  const graph = data?.graph;
  const sb = graph?.byId.storyboard;
  const castSlot = graph?.byId.cast?.assetSlotId ?? null;
  const castUrl = data?.assetUrl(castSlot) ?? null;
  const recent = (graph?.nodes ?? []).filter((n) => data?.assetUrl(n.assetSlotId)).slice(0, 5);
  const focusLib = CATEGORIES.find((c) => c.label === category)?.lib ?? null;

  return (
    <div className="pxa-library" data-testid="production-libraries">
      <Tabs
        ariaLabel="Library state"
        testId="library-tabs"
        active={canon}
        onChange={setCanon}
        tabs={[
          { id: 'canonical', label: 'CANONICAL' },
          { id: 'review', label: 'IN REVIEW' },
          { id: 'superseded', label: 'SUPERSEDED' },
          { id: 'archive', label: 'ARCHIVE' },
        ]}
      />
      <nav className="pxa-catgrid" aria-label="Library categories" data-testid="library-categories">
        {CATEGORIES.map((c) => (
          <button
            key={c.label}
            type="button"
            className={category === c.label ? 'is-active' : ''}
            aria-pressed={category === c.label}
            onClick={() => {
              setCategory(c.label);
              if (c.lib) setOpen(c.lib);
            }}
          >
            <i aria-hidden />
            {c.label}
          </button>
        ))}
      </nav>
      {canon !== 'canonical' ?
        <p className="pxa-empty pxa-empty--block" data-testid="library-empty">
          <b>NOTHING {canon === 'review' ? 'IN REVIEW' : canon.toUpperCase()}</b>
          NO ASSETS ARE IN THIS STATE FOR THE PROJECT YET.
        </p>
      : (
        <>
          <section className="pxa-vault" data-testid="library-vault">
            <div className="pxa-vault__hero">
              <span className="pxa-vault__bg pxa-vault__bg--canon" style={{ backgroundImage: `url(${AUTHORITY_ASSETS.libraryCanon})` }} aria-hidden />
              <span className="pxa-hero__wash" aria-hidden />
              <h2>
                {(production?.label ?? 'PROJECT')} CANONICAL ASSET
              </h2>
              <small>RED GEOMETRY · STUDIO WORLD</small>
            </div>
            <div className="pxa-vault__bar">
              <div>
                <small>STATUS</small>
                <b>
                  <Dot tone="green" /> CANONICAL
                </b>
              </div>
              <div>
                <small>SOURCE</small>
                <b>STUDIO WORLD</b>
              </div>
              <div>
                <small>VERSION</small>
                <b>{data?.storyboardVersion ? `v${String(data.storyboardVersion).replace(/^v/i, '')}` : '—'}</b>
              </div>
              <div>
                <small>USED BY</small>
                <b>{data?.scenes.length ?? 0} SCENES</b>
              </div>
              <Link to="/production/ndxbook/design" className="pxa-btn pxa-btn--red" data-testid="library-open-authority">
                OPEN AUTHORITY →
              </Link>
              <Link to="/production/activity" className="pxa-btn" data-testid="library-lineage">
                VIEW LINEAGE →
              </Link>
            </div>
            <dl className="pxa-canon">
              <div>
                <dt>BELONGS TO</dt>
                <dd>{production?.label ?? '—'}</dd>
              </div>
              <div>
                <dt>SOURCE</dt>
                <dd>STUDIO WORLD</dd>
              </div>
              <div>
                <dt>DERIVED FROM</dt>
                <dd>—</dd>
              </div>
              <div>
                <dt>SUPERSEDED BY</dt>
                <dd>NONE</dd>
              </div>
              <div>
                <dt>APPROVAL STATE</dt>
                <dd>{sb ? sb.status.replace(/_/g, ' ') : '—'}</dd>
              </div>
              <div>
                <dt>FAMILY / STYLE</dt>
                <dd>RED GEOMETRY</dd>
              </div>
            </dl>
          </section>
          <div className="pxa-library__strips">
            <Sec title="RECENT ADDITIONS" to="/production/activity" actionLabel="VIEW ALL" className="pxa-card" testId="library-recent">
              <ul className="pxa-strip">
                {recent.length ?
                  recent.map((n, i) => {
                    const url = data?.assetUrl(n.assetSlotId) ?? null;
                    return (
                      <li key={n.id}>
                        {url ?
                          <Thumb slotId={n.assetSlotId} url={url} label={n.label} />
                        : <Thumb plate={AUTHORITY_ASSETS.libraryPlates[i % AUTHORITY_ASSETS.libraryPlates.length]} label={n.label} />}
                        <b>{n.label}</b>
                      </li>
                    );
                  })
                : <li className="pxa-empty">NO CANONICAL ASSETS MOUNTED YET.</li>}
              </ul>
            </Sec>
            <Sec title="MOST-USED ASSETS" className="pxa-card" testId="library-most-used">
              <ul className="pxa-strip">
                {LIBRARIES.slice(0, 5).map((l) => (
                  <li key={l.id}>
                    {l.id === 'actors' && castUrl ? <Thumb slotId={castSlot} url={castUrl} label="CAST" /> : <Thumb plate={l.img} />}
                    <b>{l.title}</b>
                  </li>
                ))}
              </ul>
            </Sec>
          </div>
          <Sec title="LINEAGE" className="pxa-card pxa-lineage" testId="library-lineage-flow">
            <ol className="pxa-flow">
              <li>
                <Thumb plate={AUTHORITY_ASSETS.libraryPlates[0]} />
                <b>PROTOTYPE 01</b>
                <small>ANCESTOR</small>
              </li>
              <li aria-hidden className="pxa-flow__arrow">→</li>
              <li className="is-current">
                <Thumb slotId={graph?.nodes[0]?.assetSlotId} url={data?.assetUrl(graph?.nodes[0]?.assetSlotId ?? null) ?? null} label="ENTRY" />
                <b>{production?.label ?? 'ENTRY'}</b>
                <small>CANONICAL</small>
              </li>
              <li aria-hidden className="pxa-flow__arrow">→</li>
              <li>
                <Thumb slotId={graph?.nodes[5]?.assetSlotId} url={data?.assetUrl(graph?.nodes[5]?.assetSlotId ?? null) ?? null} label="AUTHORITY" />
                <b>CURRENT AUTHORITY</b>
                <small>LATEST</small>
              </li>
            </ol>
          </Sec>
          <Sec title="COLLECTIONS" hint={focusLib ? undefined : 'ALL LIBRARIES'} className="pxa-card pxa-collections" testId="library-collections">
            <div className="pxa-collection-list">
              {LIBRARIES.map((l) => {
                const expanded = open === l.id;
                const live = l.id === 'actors';
                return (
                  <div key={l.id} className="pxa-collection">
                    <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : l.id)} data-testid={`library-${l.id}`}>
                      {live && castUrl ? <Thumb slotId={castSlot} url={castUrl} label="CAST" /> : <Thumb plate={l.img} />}
                      <span>
                        <b>{l.title}</b>
                        <small>{l.sub}</small>
                      </span>
                      <em className={live ? 'is-live' : undefined}>{live ? `${actors.length} RECORDS` : 'NO RECORDS'}</em>
                    </button>
                    {expanded ?
                      <div className="pxa-collection__panel">
                        <p>{l.scope}</p>
                        {live ?
                          <ul>
                            {actors.slice(0, 8).map((a) => (
                              <li key={a.actorId}>
                                <strong>{a.catalogueNumber}</strong> {a.stageName}
                                <span>{a.ageRange} · {a.roleArchetypes.slice(0, 2).map((r) => r.replace(/_/g, ' ')).join(' / ')}</span>
                              </li>
                            ))}
                          </ul>
                        : <p>No records in this library yet. Assets appear here as productions publish them.</p>}
                      </div>
                    : null}
                  </div>
                );
              })}
            </div>
          </Sec>
        </>
      )}
    </div>
  );
}
