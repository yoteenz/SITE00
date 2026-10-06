/**
 * 07 REVIEW + HANDOFF — root · approval-detail.
 * Source: the Entry 002 production package checklist (useEntry002Production items), cast gate and the hub graph
 * (founder gate, blockers, node dependencies). Lock + handoff stay disabled until every item is approved / locked
 * (same rule as the previous Review screen). Approval detail routes each item to the existing action that owns it:
 * narrative → founder narrative judgment, storyboard → hub storyboard decision; other items derive their state from
 * canonical locks and expose no write here. Comments have no data source → UNMOUNTED.
 */
import { Link } from 'react-router-dom';
import type { HubNodeId } from '../../../../../../shared/site00-production-hub/types.js';
import type { PackageItem } from '../../../production/useEntry002Production';
import { pad2 } from '../../primitives';
import { done, words } from '../expressionData';
import { EXPRESSION_FAMILIES, type ExpressionFamilyId } from '../expressionRoutes';
import { Actions, Btn, Chip, Donut, Empty, Grid, Img, Kv, Panel, Row, type Tone } from '../ExpressionFamilyShell';
import { NarrativeApproval, usePlan } from './NarrativeFamily';
import { StoryboardDecision } from './StoryboardFamily';
import type { FamilyProps } from './types';

const ENGINE_ROUTE = (slug: string) => `/projects/${slug}/content-operations/expression-engine`;
const ITEM_NODE: Record<PackageItem['id'], HubNodeId> = { narrative: 'narrative', cast: 'cast', wardrobe: 'look', performance: 'performance', sets: 'set', storyboard: 'storyboard' };
const ITEM_FAMILY: Record<PackageItem['id'], ExpressionFamilyId> = { narrative: 'narrative', cast: 'casting', wardrobe: 'look', performance: 'performance', sets: 'sets', storyboard: 'storyboard' };
const tone = (s: PackageItem['status']): Tone => (done(s) ? 'green' : s === 'BLOCKED' ? 'red' : s === 'IN_PROGRESS' ? 'amber' : 'gray');

export function ReviewFamily({ d, r, go }: FamilyProps) {
  const { plan, reload } = usePlan(d.plan);
  if (!d.ok) return <Empty title="NO CAMPAIGN ENTRY IN PRODUCTION" testId="expression-no-entry" />;
  const blockers = d.items.filter((i) => !done(i.status));
  const allReady = blockers.length === 0;
  const gate = d.graph?.founderGate;
  const checklist = (active?: string) =>
    d.items.map((i) => (
      <Row
        key={i.id}
        to={go('review', 'approval-detail', i.id)}
        testId="review-package-row"
        active={active === i.id}
        media={<span className={`exf-check${done(i.status) ? '' : i.status === 'BLOCKED' ? ' is-warn' : ' is-todo'}`}>{done(i.status) ? '✓' : '·'}</span>}
        title={i.label}
        sub={i.detail}
        aside={<Chip tone={tone(i.status)}>{words(i.status)}</Chip>}
      />
    ));
  const handoff = (
    <Actions testId="review-handoff" note={allReady ? 'PACKAGE READY · HANDOFF UNLOCKED' : `${blockers.length} OF ${d.total} NOT READY — ${blockers.map((b) => b.label).join(' · ')}`}>
      <Btn variant="red" disabled={!allReady} reason="Every package item must be approved or locked" testId="lock-production-package">
        LOCK PRODUCTION PACKAGE
      </Btn>
      <Btn to={ENGINE_ROUTE(d.slug)} disabled={!allReady} reason="Handoff unlocks when every package item is approved or locked" testId="handoff-send">
        SEND TO STORYBOARD
      </Btn>
    </Actions>
  );

  if (r.route.id === 'approval-detail') {
    const item = d.items.find((i) => i.id === r.param);
    if (!item) return <Empty title="APPROVAL NOT FOUND" body="NO PACKAGE ITEM WITH THIS ID." testId="review-approval-missing" />;
    const node = d.graph?.byId[ITEM_NODE[item.id]];
    const fam = EXPRESSION_FAMILIES.find((f) => f.id === ITEM_FAMILY[item.id])!;
    const gateHere = !!gate?.open && gate.nodeId === ITEM_NODE[item.id];
    return (
      <Grid rows={{ d: '1fr 0.8fr', t: '0.95fr 0.85fr 0.7fr', m: '0.85fr 0.8fr 0.75fr 0.65fr' }}>
        <Panel title={`${item.label} · APPROVAL`} meta={gateHere ? 'FOUNDER GATE' : words(item.status)} at={{ d: [5, 2], t: [7, 1], m: [6, 1] }} media="MEDIA_LEAD" testId="review-approval-detail" className="exf-record">
          <Img url={d.nodeArt(ITEM_NODE[item.id])} label={`${item.label.toUpperCase()} AUTHORITY`} className="exf-fill" role="REFERENCE_AUTHORITY" scale="PREVIEW" aspect={`node:${ITEM_NODE[item.id]}`} />
          <Kv cols={2} rows={[['STATUS', <Chip tone={tone(item.status)}>{words(item.status)}</Chip>], ['DETAIL', item.detail], ['NODE', words(node?.status ?? '—')], ['WHY', node?.statusDetail ?? '—']]} />
        </Panel>
        <Panel title="REQUESTED DECISION" meta={gateHere ? 'HIGH' : undefined} at={{ d: [4, 1], t: [5, 1], m: [6, 1] }} testId="review-approval-decision">
          {item.id === 'narrative' ?
            <NarrativeApproval plan={plan} reload={reload} compact />
          : item.id === 'storyboard' ?
            <StoryboardDecision d={d} testId="review-storyboard-decision" />
          : <Actions note={`${item.label.toUpperCase()} STATE DERIVES FROM CANONICAL LOCKS — NO FOUNDER ACTION EXISTS FOR IT HERE.`}>
              <Btn to={go(fam.id)} testId="review-open-family">
                OPEN {fam.title}
              </Btn>
            </Actions>
          }
        </Panel>
        <Panel title="REVIEWERS" meta="FOUNDER" at={{ d: [3, 1], t: [5, 1], m: [3, 1] }} testId="review-reviewers">
          <Row media={<i className={`exf-dot exf-dot--${done(item.status) ? 'green' : 'gray'}`} aria-hidden />} title="FOUNDER" sub={done(item.status) ? 'APPROVED / LOCKED' : 'PENDING'} />
        </Panel>
        <Panel title="DEPENDENCIES" meta={node ? `${node.dependsOn.length} UPSTREAM · ${node.unlocks.length} UNLOCKS` : undefined} at={{ d: [4, 1], t: [6, 1], m: [3, 1] }} testId="review-dependencies">
          {node ?
            <>
              {node.dependsOn.map((n) => (
                <Row key={`up-${n}`} title={words(d.graph?.byId[n]?.label ?? n)} sub="UPSTREAM" aside={<Chip tone={d.graph?.byId[n]?.status === 'COMPLETE' ? 'green' : 'amber'}>{words(d.graph?.byId[n]?.status ?? '—')}</Chip>} />
              ))}
              {node.unlocks.map((n) => (
                <Row key={`dn-${n}`} title={words(d.graph?.byId[n]?.label ?? n)} sub="UNLOCKS" aside={<Chip>{words(d.graph?.byId[n]?.status ?? '—')}</Chip>} />
              ))}
            </>
          : <Empty title="NO HUB NODE" />}
        </Panel>
        <Panel title="COMMENTS" meta="0" at={{ d: [3, 1], t: [6, 1], m: [6, 1] }} testId="review-comments">
          <Empty title="NO REVIEW COMMENTS" body="REVIEW COMMENTS HAVE NO DATA SOURCE YET." state="UNMOUNTED" testId="review-comments-unmounted" />
        </Panel>
      </Grid>
    );
  }

  return (
    <Grid rows={{ d: '1fr 0.8fr', t: '1fr 0.8fr 0.65fr', m: '1.1fr 0.75fr 0.7fr 0.62fr' }}>
      <Panel title="PRODUCTION PACKAGE" meta={`${d.ready} OF ${d.total} READY`} at={{ d: [5, 2], t: [7, 1], m: [6, 1] }} testId="review-package">
        {checklist()}
      </Panel>
      <Panel title="HANDOFF READINESS" at={{ d: [3, 1], t: [5, 1], m: [3, 1] }} testId="review-readiness">
        <div className="exf-overview">
          <Donut value={d.ready} max={d.total} label="READY" />
          <Kv rows={[['CAST GATE', d.gate.allRequiredCharactersLocked ? 'LOCKED' : 'OPEN'], ['NEXT STAGE', 'STORYBOARD / KEYFRAMES']]} />
        </div>
      </Panel>
      <Panel title="FOUNDER APPROVAL" meta={gate?.open ? 'GATE OPEN' : 'NO GATE'} at={{ d: [4, 1], t: [5, 1], m: [3, 1] }} testId="review-founder-gate">
        {gate?.open ?
          <Row to={gate.nodeId ? go('review', 'approval-detail', (Object.keys(ITEM_NODE) as PackageItem['id'][]).find((k) => ITEM_NODE[k] === gate.nodeId) ?? 'narrative') : undefined} title={gate.headline} sub={gate.detail} aside={<Chip tone="red">DECISION</Chip>} testId="review-gate-row" />
        : <Empty title="NOTHING WAITING ON YOU" />}
      </Panel>
      <Panel title="BLOCKERS" meta={pad2(d.graph?.blockers.length ?? blockers.length)} at={{ d: [4, 1], t: [6, 1], m: [6, 1] }} testId="review-blockers">
        {(d.graph?.blockers.length ? d.graph.blockers : blockers.map((b) => `${b.label.toUpperCase()}: ${b.detail}`)).map((b) => (
          <Row key={b} media={<i className="exf-dot exf-dot--red" aria-hidden />} title={b.split(':')[0]!} sub={b.split(':').slice(1).join(':').trim()} />
        ))}
      </Panel>
      <Panel title="HANDOFF" meta="DOWNSTREAM" at={{ d: [3, 1], t: [6, 1], m: [6, 1] }} testId="review-handoff-panel">
        {handoff}
        <ol className="exf-flow" data-testid="review-downstream">
          {EXPRESSION_FAMILIES.filter((f) => f.downstream).map((f) => (
            <li key={f.id}>
              <Link to={go(f.id)} data-testid={`review-downstream-${f.id}`}>
                {f.title}
              </Link>
            </li>
          ))}
        </ol>
      </Panel>
    </Grid>
  );
}
