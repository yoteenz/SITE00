/**
 * LIBRARY — canonical material vault + lineage + history (10 families · 75 routes), inside the Production frame.
 * Authority anatomy (STUDIOOS_EXPERIENCE_LIBRARY_AUTHORITY_LITE / 03 + 04):
 *   lifecycle strip (CANONICAL · IN REVIEW · SUPERSEDED · ARCHIVE) + category navigation
 *   (desktop: left rail · tablet / mobile: category grid) →
 *   ROOT     family title + views + featured record (plate · facts · OPEN / VIEW LINEAGE) + bounded record list
 *   CHILD    title + search + view chips + bounded catalogue grid + inspector
 *   DETAIL   plate hero + summary bar + details / related / lineage (tabs on mobile)
 *   LINEAGE  lineage chain + derived rail + node inspector
 * LIBRARY / EXPRESSIONS is the canonical expression archive — it never mounts the Production / Expression floor.
 */
import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { IaIcon, type IaIconName } from '../iaKit';
import { byLifecycle, useRealmData, type Collection, type RealmRecord, type Realm } from './realmData';
import { LibraryCharacterImageInspector } from './LibraryCharacterImageInspector.js';
import { characterMediaAssets } from './libraryCharacterMedia.js';
import { Btn, Chain, Empty, Kv, Media, Panel, RelatedCharacterTile, Row, Status, Tile, ViewAll, pad2 } from './RealmKit';
import { LIBRARY_FAMILIES, LIFECYCLES, detailRouteOf, familyRoutes, realmHref, realmRoutes, type Lifecycle, type ResolvedRealmRoute } from './realmRoutes';
import '../../../styles/site00-production-realm.css';

const CAT_ICON: Record<string, IaIconName> = {
  authorities: 'flag',
  assets: 'cube',
  characters: 'user',
  environments: 'graph',
  expressions: 'film',
  references: 'link',
  icons: 'system',
  materials: 'layers',
  documents: 'calendar',
  archive: 'lock',
};
/** Singular record noun per family (OPEN AUTHORITY, CHARACTER RECORDS …). */
const ONE: Record<string, string> = {
  authorities: 'AUTHORITY',
  assets: 'ASSET',
  characters: 'CHARACTER',
  environments: 'ENVIRONMENT',
  expressions: 'EXPRESSION',
  references: 'REFERENCE',
  icons: 'ICON',
  materials: 'MATERIAL',
  documents: 'DOCUMENT',
  archive: 'ARCHIVE',
};
const lifeKey = (l: Lifecycle) => l.toLowerCase().replace(' ', '-');
const fromKey = (k: string | null): Lifecycle | null => LIFECYCLES.find((l) => lifeKey(l) === k) ?? null;

type Ctx = { realm: Realm; r: ResolvedRealmRoute; slug: string; life: Lifecycle | null; coll: Collection; records: readonly RealmRecord[]; href: (family: string, id?: string, param?: string | null) => string };

export function LibraryScreen({ slug, resolved }: { slug: string; resolved: ResolvedRealmRoute }) {
  const realm = useRealmData(slug);
  const [params] = useSearchParams();
  const { route, family } = resolved;
  const life = route.lifecycle ?? fromKey(params.get('life'));
  const coll = realm.collections[route.collection]!;
  const records = byLifecycle(coll, life);
  const keep = life && !route.lifecycle ? `?life=${lifeKey(life)}` : '';
  const ctx: Ctx = { realm, r: resolved, slug, life, coll, records, href: (f, id = 'root', p) => `${realmHref('library', slug, f, id, p)}${keep}` };
  const tabs = familyRoutes('library', family.id).filter((x) => x.kind === 'child');
  const lifeHref = (l: Lifecycle | null) => {
    const p = new URLSearchParams(params);
    p.delete('sel');
    if (l) p.set('life', lifeKey(l));
    else p.delete('life');
    const s = p.toString();
    return `${realmHref('library', slug, family.id, route.lifecycle ? 'root' : route.id, resolved.param)}${s ? `?${s}` : ''}`;
  };
  const charFamily = family.id === 'characters';
  const charFocus = charFamily && (route.kind === 'detail' || route.kind === 'lineage');
  const charBrowse = charFamily && (route.kind === 'root' || route.kind === 'child');
  return (
    <div
      className={`lbf${charFocus ? ' lbf--char-focus' : ''}${charBrowse ? ' lbf--char-browse' : ''}`}
      data-testid="library-family"
      data-family={family.id}
      data-route={route.id}
      data-kind={route.kind}
      data-authority={route.authority}
      data-life={life ?? 'ALL'}
    >
      <nav className="lbf-life" aria-label="Lifecycle" data-testid="library-lifecycle">
        {LIFECYCLES.map((l) => (
          <Link key={l} to={life === l ? lifeHref(null) : lifeHref(l)} replace className={life === l ? 'is-active' : undefined} aria-pressed={life === l} data-testid={`library-life-${lifeKey(l)}`}>
            {l}
            <em>{pad2(coll.records.filter((x) => x.lifecycle === l).length)}</em>
          </Link>
        ))}
      </nav>
      <nav className="lbf-cats" aria-label="Library categories" data-testid="library-categories">
        <header className="lbf-cats__head">
          <b>LIBRARY</b>
          <small>STUDIO WORLD · {realm.project}</small>
        </header>
        <div className={`lbf-cats__list${charFocus ? ' lbf-cats__list--compact' : ''}`} data-scroll={charFocus ? 'internal-x' : undefined}>
          {LIBRARY_FAMILIES.map((f) => (
            <Link key={f.id} to={realmHref('library', slug, f.id)} className={f.id === family.id ? 'is-active' : undefined} aria-current={f.id === family.id ? 'true' : undefined} data-testid={`library-cat-${f.id}`}>
              <IaIcon name={CAT_ICON[f.id]!} />
              <span>{f.title}</span>
            </Link>
          ))}
        </div>
      </nav>
      <section className="lbf-main" data-testid={`library-${route.kind}`} data-kind={route.kind}>
        <header className={`lbf-head${charFocus ? ' lbf-head--compact' : ''}`}>
          <div>
            <h1>{route.kind === 'root' ? family.title : route.label}</h1>
            <p>{charFocus ? `LIBRARY · ${family.title} · ${realm.project}` : route.kind === 'root' ? family.tagline : `${family.title} · ${realm.project}`}</p>
          </div>
          <small className="lbf-count" data-testid="library-count">
            {pad2(records.length)} {life ?? 'ALL'} · {family.title}
          </small>
          <nav className={`lbf-views${charFamily ? ' lbf-views--rail' : ''}`} aria-label={`${family.title} views`} data-testid="library-views" data-scroll="internal-x">
            <Link to={ctx.href(family.id)} className={route.kind === 'root' ? 'is-active' : undefined}>
              ALL
            </Link>
            {tabs.map((t) => (
              <Link key={t.id} to={ctx.href(family.id, t.id)} className={t.id === route.id ? 'is-active' : undefined} aria-current={t.id === route.id ? 'page' : undefined}>
                {t.label.replace(` ${family.title}`, '').replace('AUTHORITIES', '').trim() || t.label}
              </Link>
            ))}
            {realmRoutes('library')
              .filter((x) => x.family === family.id && x.kind === 'lineage')
              .map((t) => (
                <Link key={t.id} to={ctx.href(family.id, t.id)} className={t.id === route.id ? 'is-active' : undefined}>
                  LINEAGE
                </Link>
              ))}
          </nav>
        </header>
        {route.kind === 'root' ?
          <Root {...ctx} />
        : route.kind === 'child' ?
          <Child {...ctx} />
        : route.kind === 'lineage' ?
          <Lineage {...ctx} />
        : charFamily ?
          <CharacterDetail {...ctx} />
        : <Detail {...ctx} />}
      </section>
    </div>
  );
}

const pick = (records: readonly RealmRecord[], id: string | null) => (id ? records.find((x) => x.id === id) : null) ?? records[0] ?? null;
const openDetail = (c: Ctx, x: RealmRecord) => {
  const d = detailRouteOf('library', c.r.family.id);
  return d ? c.href(c.r.family.id, d.id, x.id) : c.href(c.r.family.id);
};
const lineageRoute = (c: Ctx) => realmRoutes('library').find((x) => x.family === c.r.family.id && x.kind === 'lineage') ?? null;

function Featured({ c, x }: { c: Ctx; x: RealmRecord }) {
  const lin = lineageRoute(c);
  return (
    <article className="lbf-feature" data-testid="library-featured" data-record={x.id}>
      <Media r={x} className="lbf-feature__media" />
      <div className="lbf-feature__copy">
        <small className="lbf-flag">FEATURED · {x.kicker}</small>
        <h2>{x.title}</h2>
        <Status r={x} />
        {x.sub ? <p>{x.sub}</p> : null}
        <Kv cols={3} rows={[['SOURCE', x.source], ['VERSION', x.version ?? '—'], ['USED BY', x.usedBy.length ? `${x.usedBy.length} ROUTE${x.usedBy.length === 1 ? '' : 'S'}` : '—']]} />
        <div className="lbf-feature__actions">
          <Btn to={openDetail(c, x)} variant="red" testId="library-open-record">
            OPEN {ONE[c.r.family.id]} <IaIcon name="next" />
          </Btn>
          <Btn to={lin ? c.href(c.r.family.id, lin.id, x.id) : x.open ?? undefined} testId="library-view-lineage">
            {lin ? 'VIEW LINEAGE' : 'OPEN SOURCE'} <IaIcon name="next" />
          </Btn>
        </div>
      </div>
    </article>
  );
}

function Root(c: Ctx) {
  const feat = c.records[0] ?? null;
  return (
    <div className="lbf-body lbf-body--root">
      {feat ?
        <Featured c={c} x={feat} />
      : <Empty title={`NO ${c.life ?? ''} ${c.r.family.title}`.replace(/\s+/g, ' ')} body={c.coll.empty} />}
      <Panel title={`${ONE[c.r.family.id]} RECORDS`} extra={<ViewAll to={c.href(c.r.family.id, 'index')} />} className="lbf-records" testId="library-records" scroll>
        {c.records.length ?
          c.records.map((x) => (
            <Row
              key={x.id}
              r={x}
              to={openDetail(c, x)}
              testId="library-record-row"
              aside={
                <span className="lbf-rowmeta">
                  <span>
                    <small>SOURCE</small>
                    {x.source}
                  </span>
                  <span>
                    <small>VERSION</small>
                    {x.version ?? '—'}
                  </span>
                  <Status r={x} />
                </span>
              }
            />
          ))
        : <Empty title="NO RECORDS" body={c.coll.empty} />}
      </Panel>
    </div>
  );
}

function Child(c: Ctx) {
  const [params] = useSearchParams();
  const [q, setQ] = useState('');
  const shown = useMemo(() => c.records.filter((x) => !q.trim() || `${x.title} ${x.kicker} ${x.sub} ${x.tags.join(' ')}`.toLowerCase().includes(q.trim().toLowerCase())), [c.records, q]);
  const sel = pick(shown, params.get('sel'));
  const here = (id: string) => {
    const p = new URLSearchParams(params);
    p.set('sel', id);
    return `?${p.toString()}`;
  };
  const close = () => {
    const p = new URLSearchParams(params);
    p.delete('sel');
    return `?${p.toString()}`;
  };
  return (
    <div className="lbf-body lbf-body--child" data-open={params.get('sel') ? 'item' : undefined}>
      <div className="lbf-toolbar">
        <label className="rk-search">
          <IaIcon name="search" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${c.r.route.label.toLowerCase()}…`} aria-label={`Search ${c.r.route.label}`} data-testid="library-search" />
        </label>
      </div>
      <Panel className="lbf-catalogue" testId="library-catalogue" scroll>
        {shown.length ?
          <div className="rk-grid">
            {shown.map((x) => (
              <Tile key={x.id} r={x} to={here(x.id)} selected={sel?.id === x.id} testId="library-tile" />
            ))}
          </div>
        : <Empty title={`NO ${c.r.route.label}`} body={c.coll.empty} />}
      </Panel>
      {params.get('sel') ? <Link to={close()} replace className="rk-scrim" aria-label="Close" data-testid="library-inspector-scrim" /> : null}
      <Inspector c={c} x={sel} closable={!!params.get('sel')} close={close()} />
    </div>
  );
}

function Inspector({ c, x, closable, close }: { c: Ctx; x: RealmRecord | null; closable: boolean; close: string }) {
  return (
    <aside className="rk-insp lbf-insp" data-testid="library-inspector" data-record={x?.id}>
      {x ?
        <>
          <Media r={x} className="lbf-insp__media" />
          <header className="rk-insp__head rk-insp__head--plain">
            <span>
              <b>{x.title}</b>
              <Status r={x} />
            </span>
            {closable ?
              <Link to={close} replace className="rk-close" aria-label="Close" data-testid="library-inspector-close">
                ×
              </Link>
            : null}
          </header>
          <div className="rk-insp__actions">
            <Btn to={openDetail(c, x)} variant="red" testId="library-inspector-open">
              OPEN {ONE[c.r.family.id]} <IaIcon name="next" />
            </Btn>
            <Btn to={x.open ?? undefined} testId="library-inspector-context" title={x.open ? undefined : 'No working surface is linked to this record.'}>
              VIEW IN CONTEXT
            </Btn>
          </div>
          <div className="rk-insp__body rk-scroll" data-scroll="internal">
            <Kv rows={[...x.facts, ['SOURCE', x.source]]} />
            {x.tags.length ?
              <p className="rk-tags">
                {x.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </p>
            : null}
          </div>
        </>
      : <Empty title="NOTHING SELECTED" body={c.coll.empty} />}
    </aside>
  );
}

function CharacterDetail(c: Ctx) {
  const [tab, setTab] = useState<'DETAILS' | 'RELATED' | 'LINEAGE'>('DETAILS');
  const [mediaIndex, setMediaIndex] = useState(0);
  const [inspect, setInspect] = useState<{ assets: ReturnType<typeof characterMediaAssets>; index: number; title: string } | null>(null);
  const all = c.coll.records;
  const x = pick(all, c.r.param);
  const assets = useMemo(() => (x ? characterMediaAssets(x) : []), [x]);
  const related = x ? all.filter((y) => y.id !== x.id).slice(0, 12) : [];
  const lin = lineageRoute(c);
  const heroImg = assets[mediaIndex]?.url ?? x?.img ?? null;
  const openInspect = useCallback(
    (index = mediaIndex) => {
      if (!x || !assets.length) return;
      setMediaIndex(index);
      setInspect({ assets, index, title: x.title });
    },
    [assets, mediaIndex, x],
  );
  const stepInspect = useCallback(
    (delta: -1 | 1) => {
      setInspect((cur) => {
        if (!cur) return cur;
        const next = Math.max(0, Math.min(cur.assets.length - 1, cur.index + delta));
        setMediaIndex(next);
        return { ...cur, index: next };
      });
    },
    [],
  );
  const inspectRelated = useCallback((y: RealmRecord) => {
    const relAssets = characterMediaAssets(y);
    if (!relAssets.length) return;
    setInspect({ assets: relAssets, index: 0, title: y.title });
  }, []);
  if (!x) return <Empty title={`NO ${c.r.family.title} RECORD`} body={c.coll.empty} />;

  return (
    <div className="lbf-body lbf-body--detail lbf-body--char-detail" data-tab={tab} data-record={x.id}>
      <article className="lbf-char-media" data-testid="library-character-media">
        <button type="button" className="lbf-char-media__hit" onClick={() => openInspect(0)} data-testid="library-character-media-open" aria-label={`Inspect ${x.title}`} disabled={!heroImg}>
          <Media r={{ ...x, img: heroImg }} className="lbf-char-media__img" />
          {heroImg ? <span className="lbf-char-media__hint">INSPECT IMAGE</span> : null}
        </button>
        {assets.length > 1 ? (
          <div className="lbf-char-media__modes" data-scroll="internal-x" role="tablist" aria-label="Character media modes">
            {assets.map((a, i) => (
              <button
                key={a.id}
                type="button"
                role="tab"
                aria-selected={mediaIndex === i}
                className={mediaIndex === i ? 'is-active' : undefined}
                onClick={() => {
                  setMediaIndex(i);
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        ) : null}
      </article>
      <div className="lbf-char-identity" data-testid="library-character-identity">
        <div className="lbf-char-identity__title">
          <h2>{x.title}</h2>
          <small>{x.kicker}</small>
          <Status r={x} />
        </div>
        <Kv
          cols={2}
          rows={[
            ['SOURCE', x.source],
            ['VERSION', x.version ?? '—'],
            ['USED BY', x.usedBy.length ? `${x.usedBy.length} ROUTES` : '—'],
            ...x.facts.slice(0, 2),
          ]}
        />
        <div className="lbf-char-identity__actions">
          <Btn to={x.open ?? undefined} variant="red" testId="library-open-source" title={x.open ? undefined : 'No working surface is linked to this record.'}>
            OPEN {ONE[c.r.family.id]} <IaIcon name="next" />
          </Btn>
          <Btn to={lin ? c.href(c.r.family.id, lin.id, x.id) : undefined} testId="library-detail-lineage" title={lin ? undefined : 'This family records no lineage view.'}>
            VIEW LINEAGE <IaIcon name="next" />
          </Btn>
        </div>
      </div>
      <nav className="lbf-dtabs" role="tablist" data-testid="library-detail-tabs">
        {(['DETAILS', 'RELATED', 'LINEAGE'] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className={tab === t ? 'is-active' : undefined} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </nav>
      <Panel title={`${ONE[c.r.family.id]} DETAILS`} className="lbf-d-details" testId="library-details" scroll>
        <Kv rows={x.facts} cols={4} />
        {x.usedBy.length ?
          <p className="rk-tags">
            {x.usedBy.map((u) => (
              <span key={u}>{u}</span>
            ))}
          </p>
        : null}
      </Panel>
      <Panel title={`RELATED ${c.r.family.title}`} extra={<ViewAll to={c.href(c.r.family.id, 'index')} />} className="lbf-d-related" testId="library-related" scroll>
        {related.length ?
          <div className="rk-rail rk-rail--char">
            {related.map((y) => (
              <RelatedCharacterTile key={y.id} r={y} to={openDetail(c, y)} onInspectImage={() => inspectRelated(y)} />
            ))}
          </div>
        : <Empty title="NO RELATED RECORDS" />}
      </Panel>
      <Panel title="LINEAGE" className="lbf-d-lineage" testId="library-detail-chain" scroll>
        <Chain r={x} lookup={c.realm.lookup} href={(id) => openDetail(c, c.realm.lookup(id) ?? x)} />
      </Panel>
      {inspect ?
        <LibraryCharacterImageInspector assets={inspect.assets} index={inspect.index} title={inspect.title} onClose={() => setInspect(null)} onStep={stepInspect} />
      : null}
    </div>
  );
}

function Detail(c: Ctx) {
  const [tab, setTab] = useState<'DETAILS' | 'RELATED' | 'LINEAGE'>('DETAILS');
  const all = c.coll.records;
  const x = pick(all, c.r.param);
  if (!x) return <Empty title={`NO ${c.r.family.title} RECORD`} body={c.coll.empty} />;
  const related = all.filter((y) => y.id !== x.id).slice(0, 12);
  const lin = lineageRoute(c);
  return (
    <div className="lbf-body lbf-body--detail" data-tab={tab} data-record={x.id}>
      <article className="lbf-hero" data-testid="library-detail-hero">
        <Media r={x} className="lbf-hero__media" />
        <div className="lbf-hero__copy">
          <h2>{x.title}</h2>
          <small>{x.kicker}</small>
        </div>
      </article>
      <div className="lbf-summary" data-testid="library-summary">
        <span>
          <b>{x.title}</b>
          <Status r={x} />
        </span>
        <span>
          <small>SOURCE</small>
          {x.source}
        </span>
        <span>
          <small>VERSION</small>
          {x.version ?? '—'}
        </span>
        <span>
          <small>USED BY</small>
          {x.usedBy.length ? `${x.usedBy.length} ROUTES` : '—'}
        </span>
        <div className="lbf-summary__actions">
          <Btn to={x.open ?? undefined} variant="red" testId="library-open-source" title={x.open ? undefined : 'No working surface is linked to this record.'}>
            OPEN {ONE[c.r.family.id]} <IaIcon name="next" />
          </Btn>
          <Btn to={lin ? c.href(c.r.family.id, lin.id, x.id) : undefined} testId="library-detail-lineage" title={lin ? undefined : 'This family records no lineage view.'}>
            VIEW LINEAGE <IaIcon name="next" />
          </Btn>
        </div>
      </div>
      <nav className="lbf-dtabs" role="tablist" data-testid="library-detail-tabs">
        {(['DETAILS', 'RELATED', 'LINEAGE'] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className={tab === t ? 'is-active' : undefined} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </nav>
      <Panel title={`${ONE[c.r.family.id]} DETAILS`} className="lbf-d-details" testId="library-details" scroll>
        <Kv rows={x.facts} cols={4} />
        {x.usedBy.length ?
          <p className="rk-tags">
            {x.usedBy.map((u) => (
              <span key={u}>{u}</span>
            ))}
          </p>
        : null}
      </Panel>
      <Panel title={`RELATED ${c.r.family.title}`} extra={<ViewAll to={c.href(c.r.family.id, 'index')} />} className="lbf-d-related" testId="library-related" scroll>
        {related.length ?
          <div className="rk-rail">
            {related.map((y) => (
              <Tile key={y.id} r={y} to={openDetail(c, y)} />
            ))}
          </div>
        : <Empty title="NO RELATED RECORDS" />}
      </Panel>
      <Panel title="LINEAGE" className="lbf-d-lineage" testId="library-detail-chain" scroll>
        <Chain r={x} lookup={c.realm.lookup} href={(id) => openDetail(c, c.realm.lookup(id) ?? x)} />
      </Panel>
    </div>
  );
}

function Lineage(c: Ctx) {
  const all = c.coll.records;
  const withLineage = all.filter((y) => y.from.length || y.to.length);
  const x = pick(c.r.param ? all : withLineage.length ? withLineage : all, c.r.param);
  if (!x) return <Empty title={`NO ${c.r.family.title} LINEAGE`} body={c.coll.empty} />;
  const lin = lineageRoute(c)!;
  const derived = x.to.map((id) => c.realm.lookup(id)).filter((y): y is RealmRecord => !!y);
  return (
    <div className="lbf-body lbf-body--lineage" data-record={x.id}>
      <Panel title={`${ONE[c.r.family.id]} LINEAGE`} extra={<small className="lbf-muted">{pad2(withLineage.length)} WITH LINEAGE</small>} className="lbf-l-chain" testId="library-lineage-chain" scroll>
        <Chain r={x} lookup={c.realm.lookup} href={(id) => c.href(c.r.family.id, lin.id, id)} />
      </Panel>
      <Panel title="DERIVED RECORDS" className="lbf-l-derived" testId="library-lineage-derived" scroll>
        {derived.length ?
          <div className="rk-rail">
            {derived.map((y) => (
              <Tile key={y.id} r={y} to={c.href(c.r.family.id, lin.id, y.id)} />
            ))}
          </div>
        : <Empty title="NO DERIVED RECORDS" body="Nothing in the registry names this record as its source." />}
      </Panel>
      <Panel title="LINEAGE RECORDS" className="lbf-l-list" testId="library-lineage-list" scroll>
        {(withLineage.length ? withLineage : all).map((y) => (
          <Row key={y.id} r={y} to={c.href(c.r.family.id, lin.id, y.id)} selected={y.id === x.id} testId="library-lineage-row" />
        ))}
      </Panel>
      <aside className="rk-insp lbf-l-insp" data-testid="library-node-inspector">
        <header className="rk-insp__head">
          <Media r={x} className="rk-insp__media" />
          <span>
            <small>NODE INSPECTOR</small>
            <b>{x.title}</b>
            <Status r={x} />
          </span>
        </header>
        <div className="rk-insp__body rk-scroll" data-scroll="internal">
          <Kv rows={[['TYPE', x.kicker], ['SOURCE', x.source], ['DERIVED FROM', x.from.join(', ') || 'ORIGIN'], ['DERIVED', String(x.to.length)], ...x.facts.slice(0, 4)]} />
        </div>
      </aside>
    </div>
  );
}
