import { Link } from 'react-router-dom';
import { frameSlotId } from '../../../../shared/site00-production-hub/index.js';
import type { HubNodeId } from '../../../../shared/site00-production-hub/types.js';
import { subWorkspacesFor } from '../../../../shared/site00-production-workspace/registry.js';
import { productionExpressionPath } from '../../../../shared/site00-production-workspace/routes.js';
import { HubImage } from '../productionHub/HubImage';
import { AUTHORITY_ASSETS } from './authorityAssets';
import { NODE_SUB, AuthorityHero, LiveStatusBar } from './HubBody';
import { useProductionAuthorityData } from './ProductionAuthorityData';
import { pad2, Priority, Sec, Thumb } from './primitives';

/**
 * Floor cards read the project's live hub node art (cast / narrative / look / set / storyboard …) —
 * the same canonical slots the Hub renders. When a slot has no rendered asset yet the card falls back to
 * the authority film-stage plate (cropped per floor), never to the retired production-mobile plates.
 */
const FLOORS: { id: string; sub: string; title: string; node: HubNodeId; crop: string; entryway?: boolean }[] = [
  { id: 'character-fabrication', sub: 'character-fabrication', title: 'CHARACTER FABRICATION', node: 'cast', crop: '22% 55%', entryway: true },
  { id: 'campaign-concepts', sub: 'narrative', title: 'CAMPAIGN CONCEPTS', node: 'narrative', crop: '50% 30%' },
  { id: 'cast-performance', sub: 'casting', title: 'CAST + PERFORMANCE', node: 'performance', crop: '35% 60%' },
  { id: 'look-wardrobe', sub: 'wardrobe', title: 'LOOK + WARDROBE', node: 'look', crop: '10% 50%' },
  { id: 'sets-scenes', sub: 'sets', title: 'SETS + SCENES', node: 'set', crop: '65% 45%' },
  { id: 'motion-film', sub: 'storyboard', title: 'MOTION + FILM', node: 'storyboard', crop: '85% 55%' },
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
        plate={AUTHORITY_ASSETS.expressionStage}
        testId="expression-hero"
      />
      <LiveStatusBar expressionMode />
      <div className="pxa-expression__top">
        <Sec title="CURRENTLY MAKING" className="pxa-card pxa-making" testId="expression-making">
          {production ?
            <div className="pxa-making__body" data-testid="expression-campaign-context">
              <Thumb slotId={graph?.nodes[5]?.assetSlotId} url={data?.assetUrl(graph?.nodes[5]?.assetSlotId ?? null) ?? null} label="ENTRY" className="pxa-making__img" slot="PORTRAIT" fit="PORTRAIT_COVER" role="REFERENCE_AUTHORITY" scale="TILE" crop="NODE_ART_CARD" />
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
                <Thumb slotId={graph?.nodes[0]?.assetSlotId} url={data?.assetUrl(graph?.nodes[0]?.assetSlotId ?? null) ?? null} label="ENTRY" slot="STRIP_THUMB" fit="LANDSCAPE_COVER" role="REFERENCE_AUTHORITY" scale="TILE" crop="NODE_ART_CARD" />
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
                <FloorPlate floor={f} slotId={graph?.byId[f.node]?.assetSlotId ?? null} url={data?.assetUrl(graph?.byId[f.node]?.assetSlotId ?? null) ?? null} />
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
                  <HubImage key={f.frameId} slotId={frameSlotId(f)} url={data?.assetUrl(frameSlotId(f)) ?? null} label={`F${f.number}`} slot="STRIP_THUMB" role="VIDEO_FRAME" scale="CHIP" aspect="STORYBOARD_FRAME" />
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
                    <Thumb slotId={a.assetSlotId} url={data?.assetUrl(a.assetSlotId) ?? null} label={a.kind} slot="ROW_THUMB" fit="THUMBNAIL_COVER" role="REFERENCE_AUTHORITY" scale="CHIP" crop="NODE_ART_CHIP" />
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

function FloorPlate({ floor, slotId, url }: { floor: (typeof FLOORS)[number]; slotId: string | null; url: string | null }) {
  if (url) return <Thumb slotId={slotId} url={url} label={floor.node.toUpperCase()} className="pxa-floor__art" slot="CARD_MEDIA" fit="LANDSCAPE_COVER" role="REFERENCE_AUTHORITY" scale="TILE" crop="NODE_ART_CARD" />;
  return (
    <span
      className="pxa-thumb pxa-floor__art pxa-floor__art--stage"
      data-floor-art="stage"
      data-media-slot="CARD_MEDIA"
      data-media-fit="WIDE_SCENE_COVER"
      data-media-role="DECORATIVE_ART"
      data-media-scale="PLATE"
      data-media-crop="STAGE_FLOOR_CROP"
      // focal metadata: each floor frames its own part of the one stage plate
      style={{ backgroundImage: `url(${AUTHORITY_ASSETS.expressionStage})`, ['--pw-focal' as string]: floor.crop }}
      aria-hidden
    />
  );
}
