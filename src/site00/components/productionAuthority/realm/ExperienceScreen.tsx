/**
 * EXPERIENCE — spatial operating system (7 families · 46 routes), one shell inside the Production authority frame.
 * Authority anatomy (STUDIOOS_EXPERIENCE_LIBRARY_AUTHORITY_LITE / 01 + 02):
 *   world-plate hero (crumb · family / route title · tagline · side list · child tabs) → family pills →
 *   ROOT   status column + primary rail + secondary list + unresolved spatial issues + ENTER / PREVIEW
 *   CHILD  search / count toolbar + bounded object list (rows, tiles, route map or layer stack) + inspector
 *   DETAIL record plate hero + sibling strip + facts + lineage / relations + issues + actions
 * The page never scrolls; lists and inspector bodies scroll inside their own panes.
 */
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { IaIcon, type IaIconName } from '../iaKit';
import { useRealmData, type RealmRecord, type Realm } from './realmData';
import { Btn, Chain, Empty, Kv, Media, Panel, Row, Stat, Status, Tile, ViewAll, pad2 } from './RealmKit';
import { experienceHeroPlate } from '../../../productionAssets/productionAssetRegistry';
import { EXPERIENCE_FAMILIES, detailRouteOf, familyRoutes, realmHref, type ResolvedRealmRoute } from './realmRoutes';
import '../../../styles/site00-production-realm.css';

type Ctx = { realm: Realm; r: ResolvedRealmRoute; slug: string; href: (family: string, id?: string, param?: string | null) => string };

/** Per-family root composition: which collections fill the primary rail / secondary list, and the status column. */
const ROOT: Record<string, { primary: string; primaryTitle: string; tiles: boolean; secondary: string; secondaryTitle: string; enter: string; stats: (x: Realm) => [string | number, string, IaIconName][] }> = {
  world: { primary: 'world.environments', primaryTitle: 'ACTIVE ENVIRONMENTS', tiles: true, secondary: 'world.layers', secondaryTitle: 'WORLD ARCHITECTURE', enter: 'overview', stats: (x) => [[pad2(x.collections['zones.all']!.records.length), 'ZONES', 'graph'], [pad2(x.collections['world.destinations']!.records.length), 'DESTINATIONS', 'flag'], [pad2(x.collections['interactions.all']!.records.length), 'INTERACTIONS', 'cube'], [pad2(x.stats.residents + x.stats.characters), 'INHABITANTS', 'user']] },
  zones: { primary: 'zones.all', primaryTitle: 'ZONES', tiles: true, secondary: 'world.environments', secondaryTitle: 'WORLD PLATES', enter: 'index', stats: (x) => [[pad2(x.collections['zones.rooms']!.records.length), 'ROOMS', 'cube'], [pad2(x.collections['zones.districts']!.records.length), 'DISTRICTS', 'graph'], [pad2(x.collections['zones.portals']!.records.length), 'PORTALS', 'link'], [pad2(x.collections['zones.thresholds']!.records.length), 'THRESHOLDS', 'lock']] },
  paths: { primary: 'paths.journey', primaryTitle: 'THE JOURNEY', tiles: false, secondary: 'paths.entry', secondaryTitle: 'ENTRY PATHS', enter: 'route-map', stats: (x) => [[pad2(x.stats.beats), 'BEATS', 'pulse'], [pad2(x.collections['paths.entry']!.records.length), 'ENTRY PATHS', 'up'], [pad2(x.collections['paths.exit']!.records.length), 'EXIT PATHS', 'next'], [pad2(x.collections['paths.journey']!.records.filter((b) => b.status === 'PEAK').length), 'PEAKS', 'alert']] },
  interactions: { primary: 'interactions.triggers', primaryTitle: 'LIVE TRIGGERS', tiles: false, secondary: 'interactions.objects', secondaryTitle: 'OBJECT INTERACTIONS', enter: 'index', stats: (x) => [[pad2(x.collections['interactions.objects']!.records.length), 'OBJECTS', 'cube'], [pad2(x.collections['interactions.spatial']!.records.length), 'SPATIAL ACTIONS', 'graph'], [pad2(x.collections['interactions.triggers']!.records.length), 'TRIGGERS', 'alert'], [pad2(x.collections['interactions.all']!.records.length), 'TOTAL', 'layers']] },
  inhabitants: { primary: 'inhabitants.residents', primaryTitle: 'STUDIO WORLD RESIDENTS', tiles: true, secondary: 'inhabitants.characters', secondaryTitle: 'PROJECT CHARACTERS', enter: 'residents', stats: (x) => [[pad2(x.stats.residents), 'RESIDENTS', 'user'], [pad2(x.stats.characters), 'CHARACTERS', 'film'], [pad2(x.collections['inhabitants.relationships']!.records.length), 'RELATIONSHIPS', 'link'], ['—', 'PRESENCE NOT TRACKED', 'pulse']] },
  states: { primary: 'states.live', primaryTitle: 'LIVE STATE', tiles: true, secondary: 'states.scenes', secondaryTitle: 'SCENE STATES', enter: 'scenes', stats: (x) => [[pad2(x.stats.scenes), 'SCENES', 'film'], [`${x.stats.complete}/${x.stats.stages}`, 'STAGES COMPLETE', 'check'], [pad2(x.stats.blockers), 'BLOCKERS', 'alert'], [pad2(x.collections['states.time']!.records.length), 'TIMED', 'clock']] },
  access: { primary: 'access.rules', primaryTitle: 'ACCESS RULES', tiles: false, secondary: 'access.conditional', secondaryTitle: 'CONDITIONAL ACCESS', enter: 'rules', stats: (x) => [[pad2(x.collections['access.rules']!.records.length), 'RULES', 'lock'], [pad2(x.collections['access.roles']!.records.length), 'ROLES', 'user'], [pad2(x.collections['access.conditional']!.records.length), 'CONDITIONS', 'link'], [pad2(x.collections['access.zones']!.records.length), 'ZONE RULES', 'graph']] },
};

/** Child routes that render a spatial view instead of plain rows. */
const VIEW: Record<string, 'tiles' | 'map' | 'stack'> = {
  'world/environments': 'tiles',
  'world/architecture': 'stack',
  'paths/route-map': 'map',
  'inhabitants/residents': 'tiles',
  'states/live': 'tiles',
};

export function ExperienceScreen({ slug, resolved }: { slug: string; resolved: ResolvedRealmRoute }) {
  const realm = useRealmData(slug);
  const ctx: Ctx = { realm, r: resolved, slug, href: (f, id = 'root', p) => realmHref('experience', slug, f, id, p) };
  const { route, family } = resolved;
  const tabs = familyRoutes('experience', family.id).filter((x) => x.kind === 'child');
  const detailRec = route.kind === 'detail' ? recordFor(ctx) : null;
  const injected = experienceHeroPlate(slug, family.id, route.id);
  const plate = detailRec?.img ?? injected ?? realm.worldPlate;
  return (
    <div className="xpf" data-testid="experience-family" data-family={family.id} data-route={route.id} data-kind={route.kind} data-authority={route.authority}>
      <header className="xpf-hero" data-testid="experience-hero">
        {plate ? <img className="xpf-hero__plate" src={plate} alt="" draggable={false} /> : null}
        <span className="xpf-hero__wash" aria-hidden />
        <div className="xpf-hero__copy">
          <nav className="xpf-crumb" aria-label="Breadcrumb" data-testid="experience-breadcrumb">
            <Link to={ctx.href('world')}>EXPERIENCE</Link>
            <span aria-hidden>/</span>
            <Link to={ctx.href(family.id)}>{family.title}</Link>
            {route.kind !== 'root' ?
              <>
                <span aria-hidden>/</span>
                <b aria-current="page">{route.label}</b>
              </>
            : null}
          </nav>
          <h1>{detailRec ? detailRec.title : route.kind === 'root' ? family.title : route.label}</h1>
          <h2>{detailRec ? detailRec.kicker : route.kind === 'root' ? family.tagline : `${realm.project} · ${family.title}`}</h2>
          <p>
            {realm.project} · {realm.entry}
          </p>
        </div>
        <ul className="xpf-hero__side" aria-hidden>
          {family.side.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <nav className="xpf-tabs" aria-label={`${family.title} views`} data-testid="experience-child-tabs" data-scroll="internal-x">
          {tabs.map((t) => (
            <Link key={t.id} to={ctx.href(family.id, t.id)} className={t.id === route.id ? 'is-active' : undefined} aria-current={t.id === route.id ? 'page' : undefined}>
              {t.label}
            </Link>
          ))}
        </nav>
      </header>
      <nav className="xpf-fam" aria-label="Experience families" data-testid="experience-families" data-scroll="internal-x">
        {EXPERIENCE_FAMILIES.map((f) => (
          <Link key={f.id} to={ctx.href(f.id)} className={f.id === family.id ? 'is-active' : undefined} aria-current={f.id === family.id ? 'true' : undefined} data-testid={`experience-family-${f.id}`}>
            {f.title}
          </Link>
        ))}
      </nav>
      {route.kind === 'root' ? <Root {...ctx} /> : route.kind === 'detail' ? <Detail {...ctx} rec={detailRec} /> : <Child {...ctx} />}
    </div>
  );
}

function recordFor({ realm, r }: Ctx): RealmRecord | null {
  if (r.family.id === 'world') return r.param ? (realm.lookup(r.param) ?? realm.world) : realm.world;
  const c = realm.collections[r.route.collection]!;
  return (r.param ? c.records.find((x) => x.id === r.param) : null) ?? c.records[0] ?? null;
}

function Issues({ realm, testId = 'experience-issues', title = 'UNRESOLVED SPATIAL ISSUES' }: { realm: Realm; testId?: string; title?: string }) {
  return (
    <Panel title={title} extra={<ViewAll to="/production/activity?view=blockers" />} className="xpf-issues" testId={testId} scroll area="issues">
      {realm.issues.length ?
        <ul className="rk-issues">
          {realm.issues.map((i) => (
            <li key={i.id}>
              <i className={`rk-ring rk-ring--${i.severity === 'HIGH' ? 'red' : 'amber'}`} aria-hidden />
              <span>
                <b>{i.title}</b>
                <small>{i.where}</small>
              </span>
              <em className={i.severity === 'HIGH' ? 'is-high' : undefined}>{i.severity}</em>
            </li>
          ))}
        </ul>
      : <Empty title="NO OPEN ISSUES" body="The production graph reports no blockers." />}
    </Panel>
  );
}

function Root({ realm, r, href }: Ctx) {
  const cfg = ROOT[r.family.id]!;
  const primary = realm.collections[cfg.primary]!;
  const secondary = realm.collections[cfg.secondary]!;
  const det = detailRouteOf('experience', r.family.id);
  const open = (rec: RealmRecord) => (det ? href(r.family.id, det.id, rec.id) : href(r.family.id));
  return (
    <div className="xpf-main xpf-main--root" data-testid="experience-root">
      <div className="xpf-stats" data-testid="experience-stats" style={{ gridArea: 'stats' }}>
        <div className="xpf-status">
          <small>{r.family.title} STATUS</small>
          <Status r={realm.world} />
          <em>{realm.world.sub}</em>
        </div>
        {cfg.stats(realm).map(([v, l, i]) => (
          <Stat key={l} value={v} label={l} icon={i} />
        ))}
      </div>
      <Panel title={cfg.primaryTitle} extra={<ViewAll to={href(r.family.id, cfg.enter)} />} className="xpf-primary" testId="experience-primary" scroll area="primary">
        {primary.records.length ?
          cfg.tiles ?
            <div className="rk-rail">
              {primary.records.map((x) => (
                <Tile key={x.id} r={x} to={open(x)} />
              ))}
            </div>
          : <ol className="rk-route" data-testid="experience-route">
              {primary.records.map((x) => (
                <li key={x.id}>
                  <Link to={open(x)}>
                    <i aria-hidden>{x.metric ?? '•'}</i>
                    <b>{x.title}</b>
                    <small>{x.sub}</small>
                    <Status r={x} />
                  </Link>
                </li>
              ))}
            </ol>
        : <Empty title={`NO ${cfg.primaryTitle}`} body={primary.empty} />}
      </Panel>
      <Panel title={cfg.secondaryTitle} extra={<ViewAll to={href(r.family.id, cfg.enter)} />} className="xpf-secondary" testId="experience-secondary" scroll area="secondary">
        {secondary.records.length ?
          secondary.records.map((x) => <Row key={x.id} r={x} to={open(x)} />)
        : <Empty title={`NO ${cfg.secondaryTitle}`} body={secondary.empty} />}
      </Panel>
      <Issues realm={realm} />
      <div className="xpf-actions" data-testid="experience-actions" style={{ gridArea: 'actions' }}>
        <Btn to={href(r.family.id, cfg.enter)} testId="experience-enter">
          <IaIcon name="lock" /> ENTER {r.family.title}
        </Btn>
        <Btn to={det ? href(r.family.id, det.id) : undefined} variant="red" testId="experience-preview">
          PREVIEW
        </Btn>
      </div>
    </div>
  );
}

function Child({ realm, r, href }: Ctx) {
  const [params] = useSearchParams();
  const [q, setQ] = useState('');
  const coll = realm.collections[r.route.collection]!;
  const shown = useMemo(() => coll.records.filter((x) => !q.trim() || `${x.title} ${x.kicker} ${x.sub}`.toLowerCase().includes(q.trim().toLowerCase())), [coll, q]);
  const sel = shown.find((x) => x.id === params.get('sel')) ?? shown[0] ?? null;
  const det = detailRouteOf('experience', r.family.id);
  const here = (id: string) => {
    const p = new URLSearchParams(params);
    p.set('sel', id);
    return `?${p.toString()}`;
  };
  const view = VIEW[r.route.path] ?? 'list';
  return (
    <div className="xpf-main xpf-main--child" data-testid="experience-child" data-view={view} data-open={params.get('sel') ? 'item' : undefined}>
      <div className="xpf-toolbar" style={{ gridArea: 'toolbar' }}>
        <label className="rk-search">
          <IaIcon name="search" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${r.route.label.toLowerCase()}…`} aria-label={`Search ${r.route.label}`} data-testid="experience-search" />
        </label>
        <span className="xpf-count">
          {r.route.label} <b>({coll.records.length})</b>
        </span>
      </div>
      <Panel className="xpf-list" testId="experience-list" scroll area="list">
        {shown.length ?
          view === 'map' ?
            <ol className="rk-map" data-testid="experience-route-map">
              {shown.map((x) => (
                <li key={x.id} className={sel?.id === x.id ? 'is-sel' : undefined}>
                  <Link to={here(x.id)} replace>
                    <i aria-hidden>{x.metric}</i>
                    <b>{x.title}</b>
                    <small>{x.status}</small>
                  </Link>
                </li>
              ))}
            </ol>
          : view === 'stack' ?
            <ol className="rk-stack" data-testid="experience-layer-stack">
              {shown.map((x) => (
                <li key={x.id} className={sel?.id === x.id ? 'is-sel' : undefined}>
                  <Link to={here(x.id)} replace>
                    <i aria-hidden>{x.metric}</i>
                    <b>{x.title}</b>
                    <small>{x.sub}</small>
                  </Link>
                </li>
              ))}
            </ol>
          : view === 'tiles' ?
            <div className="rk-grid">
              {shown.map((x) => (
                <Tile key={x.id} r={x} to={here(x.id)} selected={sel?.id === x.id} />
              ))}
            </div>
          : shown.map((x) => <Row key={x.id} r={x} to={here(x.id)} selected={sel?.id === x.id} />)
        : <Empty title={`NO ${r.route.label}`} body={coll.empty} />}
      </Panel>
      {params.get('sel') ? <Link to="?" replace className="rk-scrim" aria-label="Close" data-testid="experience-inspector-scrim" /> : null}
      <aside className="rk-insp xpf-insp" data-testid="experience-inspector" style={{ gridArea: 'insp' }}>
        {sel ?
          <>
            <header className="rk-insp__head">
              <Media r={sel} className="rk-insp__media" />
              <span>
                <small>{sel.kicker}</small>
                <b>{sel.title}</b>
                <Status r={sel} />
              </span>
              {params.get('sel') ?
                <Link to="?" replace className="rk-close" aria-label="Close" data-testid="experience-inspector-close">
                  ×
                </Link>
              : null}
            </header>
            <div className="rk-insp__body rk-scroll" data-scroll="internal">
              {sel.sub ? <p className="rk-insp__sub">{sel.sub}</p> : null}
              <Kv rows={[...sel.facts, ['SOURCE', sel.source]]} />
            </div>
            <footer className="rk-insp__actions">
              {det ?
                <Btn to={href(r.family.id, det.id, sel.id)} variant="red" testId="experience-open-detail">
                  OPEN {det.label}
                </Btn>
              : null}
              {sel.open ?
                <Btn to={sel.open} testId="experience-open-source">
                  OPEN SOURCE
                </Btn>
              : null}
            </footer>
          </>
        : <Empty title="NOTHING SELECTED" body={coll.empty} />}
      </aside>
    </div>
  );
}

function Detail({ realm, r, href, rec }: Ctx & { rec: RealmRecord | null }) {
  const coll = realm.collections[r.route.collection]!;
  const siblings = r.family.id === 'world' ? [realm.world, ...coll.records] : coll.records;
  const det = r.route;
  return (
    <div className="xpf-main xpf-main--detail" data-testid="experience-detail" data-record={rec?.id}>
      <Panel className="xpf-strip" testId="experience-siblings" area="strip">
        {siblings.length ?
          <div className="rk-rail rk-rail--strip" data-scroll="internal-x">
            {siblings.map((x, i) => (
              <Link key={x.id} to={href(r.family.id, det.id, x.id)} replace className="rk-strip" aria-current={x.id === rec?.id ? 'true' : undefined}>
                <Media r={x} className="rk-strip__media" />
                <small>{pad2(i + 1)}</small>
                <b>{x.title}</b>
              </Link>
            ))}
          </div>
        : <Empty title={`NO ${r.family.title} RECORDS`} body={coll.empty} />}
      </Panel>
      {rec ?
        <>
          <Panel title="PURPOSE" className="xpf-facts" testId="experience-facts" scroll area="facts">
            {rec.sub ? <p className="rk-lead">{rec.sub}</p> : null}
            <Kv rows={rec.facts} cols={2} />
          </Panel>
          <Panel title="STATE" className="xpf-state" testId="experience-state" area="state">
            <div className="xpf-state__grid">
              <Stat value={<Status r={rec} />} label="STATE" />
              <Stat value={rec.source} label="SOURCE" />
              <Stat value={rec.version ?? '—'} label="VERSION" />
              <Stat value={rec.metric ?? pad2(rec.to.length)} label={rec.metric ? 'MEASURE' : 'LINKS'} />
            </div>
          </Panel>
          <Panel title="RELATIONS" className="xpf-rel" testId="experience-relations" scroll area="rel">
            <Chain r={rec} lookup={realm.lookup} href={(id) => href(r.family.id, det.id, id)} />
          </Panel>
        </>
      : <Panel className="xpf-facts" area="facts">
          <Empty title={`NO ${r.family.title} RECORD`} body={coll.empty} />
        </Panel>
      }
      <Issues realm={realm} testId="experience-detail-issues" title="OPEN ISSUES" />
      <div className="xpf-actions" style={{ gridArea: 'actions' }}>
        <Btn to={href(r.family.id)} testId="experience-back">
          <IaIcon name="back" /> {r.family.title}
        </Btn>
        <Btn to={rec?.open ?? undefined} variant="red" testId="experience-enter-record" title={rec?.open ? undefined : 'No working surface is linked to this record.'}>
          ENTER {rec ? rec.kicker.split(' ')[0] : r.family.title}
        </Btn>
      </div>
    </div>
  );
}
