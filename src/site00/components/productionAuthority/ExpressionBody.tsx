import { Link } from 'react-router-dom';
import { frameSlotId } from '../../../../shared/site00-production-hub/index.js';
import { subWorkspacesFor } from '../../../../shared/site00-production-workspace/registry.js';
import { productionExpressionPath } from '../../../../shared/site00-production-workspace/routes.js';
import { PW_IMG } from '../production/productionImagery';
import { HubImage } from '../productionHub/HubImage';
import { NODE_SUB, AuthorityHero, LiveStatusBar } from './HubBody';
import { useProductionAuthorityData } from './ProductionAuthorityData';
import { pad2, Priority, Sec, Thumb } from './primitives';

const FLOORS: { id: string; sub: string; title: string; plate: string; entryway?: boolean }[] = [
  { id: 'character-fabrication', sub: 'character-fabrication', title: 'CHARACTER FABRICATION', plate: PW_IMG.expressionRows.casting!, entryway: true },
  { id: 'campaign-concepts', sub: 'narrative', title: 'CAMPAIGN CONCEPTS', plate: PW_IMG.expressionRows.narrative! },
  { id: 'cast-performance', sub: 'casting', title: 'CAST + PERFORMANCE', plate: PW_IMG.expressionRows.casting! },
  { id: 'look-wardrobe', sub: 'wardrobe', title: 'LOOK + WARDROBE', plate: PW_IMG.expressionRows.wardrobe! },
  { id: 'sets-scenes', sub: 'sets', title: 'SETS + SCENES', plate: PW_IMG.expressionRows.sets! },
  { id: 'motion-film', sub: 'storyboard', title: 'MOTION + FILM', plate: PW_IMG.expressionRows.storyboard! },
];

const FORMATS = ['REEL', 'TIKTOK', 'CAROUSEL', 'STORY', 'FEED', 'X'];

export function ExpressionBody({ entry }: { entry: string }) {
  const data = useProductionAuthorityData();
  const slug = data?.project.projectId ?? 'ndxbook';
  const production = data?.production ?? null;
  const graph = data?.graph;
  const subs = subWorkspacesFor('EXPRESSION');
  const href = (sub: string) => `${productionExpressionPath(slug, sub)}?entry=${entry}`;
  const active = graph?.activeNodeId ? graph.byId[graph.activeNodeId] : null;
  const gateOpen = !!graph?.founderGate.open;
  const attention = data?.attention ?? [];
  return (
    <div className="pxa-expression" data-testid="production-expression-shell">
      <AuthorityHero
        kicker="PROJECT EXPRESSION"
        title="PRODUCTION FLOOR"
        sub="IDEAS INTO WORLDS. CHARACTERS INTO CULTURE. EVERYWHERE."
        side={['CAST', 'STYLE', 'STAGE', 'FILM', 'PACKAGE', 'PUBLISH']}
        plate={PW_IMG.pillar.EXPRESSION}
        testId="expression-hero"
      />
      <LiveStatusBar expressionMode />
      <div className="pxa-expression__top">
        <Sec title="CURRENTLY MAKING" className="pxa-card pxa-making" testId="expression-making">
          {production ?
            <div className="pxa-making__body" data-testid="expression-campaign-context">
              <Thumb slotId={graph?.nodes[5]?.assetSlotId} url={data?.assetUrl(graph?.nodes[5]?.assetSlotId ?? null) ?? null} label="ENTRY" className="pxa-making__img" />
              <div className="pxa-making__copy">
                <small>{production.label}</small>
                <b>{production.subtitle}</b>
                <span className="pxa-bar pxa-bar--labeled">
                  <i style={{ width: `${graph?.progressPercent ?? 0}%` }} />
                </span>
                <em>PRODUCTION TIMELINE {graph?.progressPercent ?? 0}%</em>
                <small>PHASE · {active?.label ?? graph?.operation.label}</small>
                <Link to={href('storyboard')} className="pxa-btn pxa-btn--outline-red" data-testid="expression-review-storyboard">
                  REVIEW STORYBOARD →
                </Link>
              </div>
              <aside className="pxa-authority">
                <small>AUTHORITY</small>
                <b>
                  {graph?.completeCount ?? 0} / {graph?.nodes.length ?? 0}
                </b>
                <span>{gateOpen ? 'FOUNDER APPROVAL REQUIRED' : 'NO FOUNDER GATE OPEN'}</span>
              </aside>
            </div>
          : <p className="pxa-empty" data-testid="expression-no-entry">NO ENTRY IN PRODUCTION FOR THIS PROJECT.</p>}
        </Sec>
        <Sec title="ACTIVE PRODUCTIONS" to={productionExpressionPath(slug)} className="pxa-card pxa-active" testId="expression-active">
          <div className="pxa-entries">
            {production ?
              <Link to={href('review')} className="pxa-entry is-active">
                <Thumb slotId={graph?.nodes[0]?.assetSlotId} url={data?.assetUrl(graph?.nodes[0]?.assetSlotId ?? null) ?? null} label="ENTRY" />
                <b>{production.label}</b>
                <small>{active?.label ?? 'PRODUCTION'}</small>
                <span className="pxa-bar">
                  <i style={{ width: `${graph?.progressPercent ?? 0}%` }} />
                </span>
                <em>{graph?.progressPercent ?? 0}%</em>
              </Link>
            : null}
            <Link to={href('review')} className="pxa-entry pxa-entry--new">
              <span aria-hidden>+</span>
              <b>NEW ENTRY</b>
            </Link>
          </div>
        </Sec>
      </div>
      <Sec title="PRODUCTION FLOORS" className="pxa-card pxa-floors" testId="expression-floors">
        <ol className="pxa-floorgrid">
          {FLOORS.map((f, i) => (
            <li key={f.id}>
              <Link
                to={href(f.sub)}
                className={f.entryway ? 'is-entryway' : undefined}
                data-entryway={f.entryway ? 'character-fabrication' : undefined}
                data-testid={`expression-floor-${f.id}`}
              >
                <Thumb plate={f.plate} />
                <em>{pad2(i + 1)}</em>
                <b>{f.title}</b>
                {f.entryway ? <small>PRIMARY ENTRYWAY</small> : null}
              </Link>
            </li>
          ))}
        </ol>
        <nav className="pxa-subnav" aria-label="Expression sub-workspaces">
          {subs.map((s) => (
            <Link key={s.id} to={href(s.id)} data-testid={`expression-sub-${s.id}`}>
              {s.label.toUpperCase()}
            </Link>
          ))}
        </nav>
      </Sec>
      <div className="pxa-expression__bottom">
        <Sec title="MAKE IT TRAVEL" className="pxa-card pxa-travel" testId="expression-travel">
          <div className="pxa-travel__steps">
            <div>
              <em>01</em>
              <b>FORMAT STUDIO</b>
              <ul className="pxa-chips">
                {FORMATS.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            <div>
              <em>02</em>
              <b>CONTENT PACKAGE</b>
              <div className="pxa-frames">
                {(data?.frames ?? []).slice(0, 4).map((f) => (
                  <HubImage key={f.frameId} slotId={frameSlotId(f)} url={data?.assetUrl(frameSlotId(f)) ?? null} label={`F${f.number}`} />
                ))}
              </div>
            </div>
            <div>
              <em>03</em>
              <b>CAMPAIGN BOARD</b>
              <Link to={href('review')} className="pxa-btn pxa-btn--outline-red" data-testid="expression-prepare">
                PREPARE FOR PUBLISH →
              </Link>
            </div>
          </div>
        </Sec>
        <Sec title="ON YOUR TABLE" to="/production/queue" className="pxa-card pxa-table" testId="expression-table">
          {attention.length ?
            <ol className="pxa-ops">
              {attention.slice(0, 3).map((a) => (
                <li key={a.id}>
                  <Link to={a.nodeId ? href(NODE_SUB[a.nodeId]) : href('review')}>
                    <Thumb slotId={a.assetSlotId} url={data?.assetUrl(a.assetSlotId) ?? null} label={a.kind} />
                    <span>
                      <b>{a.title}</b>
                      <small>{a.subtitle}</small>
                    </span>
                    <Priority level={a.priority === 'HIGH' ? 'HIGH' : 'MED'} />
                    <span aria-hidden>›</span>
                  </Link>
                </li>
              ))}
            </ol>
          : <p className="pxa-empty">NOTHING IS WAITING ON YOU.</p>}
        </Sec>
      </div>
    </div>
  );
}
