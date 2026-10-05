/**
 * 01 NARRATIVE — root · story · structure · momentum · proof.
 * Source: Entry 002 narrative momentum plan (Expression Engine plan when the API returns one, else the canonical
 * retroactive compile — the same precedence the previous Narrative screen used). Founder judgment + recompile
 * call the existing Expression Engine actions.
 */
import { useCallback, useState } from 'react';
import type { NarrativeMomentumPlan } from '../../../../../../shared/site00-expression-engine/narrative-momentum/types.js';
import {
  postCompileNarrativeMomentum,
  postNarrativeMomentumJudgment,
  type NarrativeMomentumFounderAction,
} from '../../../founderWorkspace/expressionEngine/expressionEngineNarrativeMomentumActions';
import { useExpressionEngineEntry002 } from '../../../founderWorkspace/expressionEngine/useExpressionEngineEntry002';
import { pad2 } from '../../primitives';
import { TENSION_LEVEL, upper, words } from '../expressionData';
import { Actions, Bars, Btn, Chip, Curve, Empty, Grid, Kv, Meter, Panel, Row, Stat, type Tone } from '../ExpressionFamilyShell';
import type { FamilyProps } from './types';

const tensionTone = (s: string): Tone => (s === 'PEAK' ? 'red' : s === 'ESCALATION' || s === 'INTERRUPTION' ? 'amber' : 'gray');

export function usePlan(fallback: NarrativeMomentumPlan) {
  const { nme, reload } = useExpressionEngineEntry002();
  return { plan: nme?.plan ?? fallback, reload, live: !!nme?.plan };
}

/** Founder approval controls — existing SET_NARRATIVE_MOMENTUM_JUDGMENT / COMPILE actions. */
export function NarrativeApproval({ plan, reload, compact = false }: { plan: NarrativeMomentumPlan; reload: () => Promise<unknown> | void; compact?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const approved = plan.founderStatus === 'APPROVED';
  const run = useCallback(
    async (fn: () => Promise<void>) => {
      setBusy(true);
      setError(null);
      try {
        await fn();
        await reload();
      } catch {
        setError('API UNAVAILABLE — JUDGMENT NOT RECORDED');
      } finally {
        setBusy(false);
      }
    },
    [reload],
  );
  const judge = (a: NarrativeMomentumFounderAction) => run(() => postNarrativeMomentumJudgment(a));
  return (
    <Actions testId="narrative-approval" note={error ?? (approved ? 'NARRATIVE APPROVED BY FOUNDER' : `FOUNDER STATUS · ${words(plan.founderStatus)}`)}>
      <Btn variant="red" onClick={() => judge('APPROVE_NARRATIVE')} disabled={busy || approved} reason={approved ? 'Already approved' : 'Recording judgment'} testId="narrative-approve">
        APPROVE NARRATIVE
      </Btn>
      <Btn onClick={() => judge('REFINE_NARRATIVE')} disabled={busy} reason="Recording judgment" testId="narrative-refine">
        REFINE
      </Btn>
      {compact ? null : (
        <Btn variant="ghost" onClick={() => run(() => postCompileNarrativeMomentum())} disabled={busy} reason="Recompiling" testId="narrative-recompile">
          RECOMPILE
        </Btn>
      )}
    </Actions>
  );
}

/** Turning points = beats whose tension changes stage (canonical tensionBefore → tensionAfter). */
const turningPoints = (plan: NarrativeMomentumPlan) =>
  plan.beats.map((b, i) => (b.tensionBefore !== b.tensionAfter || b.tensionStage === 'PEAK' ? i : -1)).filter((i) => i >= 0);

export function NarrativeFamily({ d, r, go }: FamilyProps) {
  const { plan, reload, live } = usePlan(d.plan);
  if (!d.ok) return <Empty title="NO CAMPAIGN ENTRY IN PRODUCTION" body={`${d.slug.toUpperCase()} HAS NO EXPRESSION ENTRY YET.`} testId="expression-no-entry" />;
  const curve = plan.beats.map((b) => TENSION_LEVEL[b.tensionStage] ?? 30);
  const labels = plan.beats.map((b) => b.label);
  const marks = turningPoints(plan);
  const proofPer = plan.beats.map((b) => b.proofIds.length);
  const beatNo = plan.beats.map((b) => pad2(b.order));
  const verified = plan.evidence.filter((e) => e.status !== 'SOURCE_REQUIRED').length;
  const source = live ? 'EXPRESSION ENGINE' : 'CANONICAL COMPILE';

  const core = (
    <Kv
      testId="narrative-core"
      rows={[
        ['GOAL', plan.narrativeGoal],
        ['STARTING BELIEF', plan.audienceStartingBelief],
        ['DESIRED SHIFT', plan.audienceDesiredShift],
        ['GRAMMAR', words(plan.selectedGrammarId)],
        ['TERRITORY', plan.creativeTerritoryLabel],
      ]}
    />
  );
  const metrics = (
    <div className="exf-stats" data-testid="narrative-metrics">
      <Stat value={pad2(plan.beats.length)} label="BEATS" />
      <Stat value={pad2(plan.proofArchitecture.objects.length)} label="PROOFS" />
      <Stat value={`${verified}/${plan.evidence.length}`} label="EVIDENCE SOURCED" tone={verified < plan.evidence.length ? 'amber' : 'green'} />
      <Stat value={pad2(plan.validationIssues.length)} label="FLAGS" tone={plan.validationIssues.some((v) => v.blocking) ? 'red' : 'amber'} />
      <Stat value={pad2(plan.formatAdaptations.length)} label="FORMATS" />
    </div>
  );
  const beatList = (sel?: number, onSel?: (i: number) => void) =>
    plan.beats.map((b, i) => (
      <Row
        key={b.beatId}
        testId="narrative-beat-row"
        onClick={onSel ? () => onSel(i) : undefined}
        active={sel === i}
        media={<em className="exf-num">{pad2(b.order)}</em>}
        title={b.label}
        sub={`${words(b.shotFunction)} · ${b.whatChangesInThisBeat}`}
        aside={<Chip tone={tensionTone(b.tensionStage)}>{b.tensionStage}</Chip>}
      />
    ));
  const issues = (sel?: number, onSel?: (i: number) => void) =>
    plan.validationIssues.length ?
      plan.validationIssues.map((v, i) => (
        <Row
          key={v.flagId}
          testId="narrative-issue-row"
          onClick={onSel ? () => onSel(i) : undefined}
          active={sel === i}
          media={<i className={`exf-dot exf-dot--${v.blocking ? 'red' : v.severity === 'WARNING' ? 'amber' : 'gray'}`} aria-hidden />}
          title={words(v.flagId)}
          sub={v.suggestedCorrection}
          aside={<Chip tone={v.blocking ? 'red' : v.severity === 'WARNING' ? 'amber' : 'gray'}>{v.blocking ? 'BLOCKING' : v.severity}</Chip>}
        />
      ))
    : <Empty title="NO VALIDATION FLAGS" body="THE PLAN PASSED NARRATIVE VALIDATION." />;

  switch (r.route.id) {
    case 'story':
      return (
        <Grid rows={{ d: '1fr 0.8fr', t: '1fr 0.8fr 0.7fr', m: '1.15fr 0.85fr 0.75fr 0.55fr' }}>
          <Panel title="NARRATIVE CORE" meta={source} at={{ d: [7, 1], t: [12, 1], m: [6, 1] }} testId="narrative-story-core">
            {core}
          </Panel>
          <Panel title="TRANSFORMATION" meta={words(plan.transformation.transformationType)} at={{ d: [5, 1], t: [6, 1], m: [6, 1] }} testId="narrative-transformation">
            <div className="exf-shift">
              <span>
                <small>BEFORE</small>
                <b>{plan.transformation.before}</b>
              </span>
              <i aria-hidden>→</i>
              <span>
                <small>AFTER</small>
                <b>{plan.transformation.after}</b>
              </span>
            </div>
          </Panel>
          <Panel title="GRAMMAR" meta={words(plan.selectedGrammarId)} at={{ d: [4, 1], t: [6, 1], m: [3, 1] }} testId="narrative-grammar">
            <Kv rows={[['WHY', plan.grammarReason], ['ALTERNATE', words(plan.alternateGrammarId)]]} />
          </Panel>
          <Panel title="OPEN LOOP" meta={`${plan.openLoop.unresolved.length} UNRESOLVED`} at={{ d: [4, 1], t: [6, 1], m: [3, 1] }} testId="narrative-open-loop">
            <p className="exf-quote">{plan.openLoop.newQuestion}</p>
            <ul className="exf-bullets">
              {plan.openLoop.unresolved.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </Panel>
          <Panel title="FOUNDER APPROVAL" meta={words(plan.founderStatus)} at={{ d: [4, 1], t: [6, 1], m: [6, 1] }} testId="narrative-approval-panel">
            <NarrativeApproval plan={plan} reload={reload} />
            <Btn to={go('narrative', 'structure')} variant="ghost" testId="narrative-open-structure">
              OPEN STRUCTURE
            </Btn>
          </Panel>
        </Grid>
      );
    case 'structure':
      return <Structure plan={plan} beatList={beatList} go={go} />;
    case 'momentum':
      return <Momentum plan={plan} curve={curve} labels={labels} marks={marks} proofPer={proofPer} beatNo={beatNo} metrics={metrics} issues={issues} reload={reload} go={go} />;
    case 'proof':
      return <Proof plan={plan} />;
    default:
      return (
        <Grid rows={{ d: '1.1fr 1fr', t: '1fr 1fr 0.8fr', m: '0.95fr 0.9fr 0.8fr 0.6fr' }}>
          <Panel title="NARRATIVE CORE" meta={source} to={go('narrative', 'story')} toLabel="STORY" at={{ d: [5, 1], t: [6, 1], m: [6, 1] }} testId="narrative-root-core">
            {core}
          </Panel>
          <Panel title="NARRATIVE MOMENTUM CURVE" meta="TENSION BY BEAT" to={go('narrative', 'momentum')} toLabel="MOMENTUM" at={{ d: [7, 1], t: [6, 1], m: [6, 1] }} testId="narrative-root-curve">
            <Curve points={curve} labels={labels} marks={marks} testId="narrative-curve" />
          </Panel>
          <Panel title="STRUCTURE" meta={`${plan.beats.length} BEATS`} to={go('narrative', 'structure')} toLabel="STRUCTURE" at={{ d: [4, 1], t: [6, 1], m: [6, 1] }} testId="narrative-root-structure">
            {beatList()}
          </Panel>
          <Panel title="PROOF" meta={words(plan.proofArchitecture.placementPlan.strategy)} to={go('narrative', 'proof')} toLabel="PROOF" at={{ d: [4, 1], t: [6, 1], m: [3, 1] }} testId="narrative-root-proof">
            <Bars values={proofPer} labels={beatNo} testId="narrative-proof-bars" />
            <small className="exf-caption">PROOF OBJECTS PLACED PER BEAT</small>
          </Panel>
          <Panel title="FOUNDER APPROVAL" meta={words(plan.founderStatus)} at={{ d: [4, 1], t: [12, 1], m: [3, 1] }} testId="narrative-root-approval">
            {metrics}
            <NarrativeApproval plan={plan} reload={reload} compact />
          </Panel>
        </Grid>
      );
  }
}

function Structure({ plan, beatList, go }: { plan: NarrativeMomentumPlan; beatList: (sel?: number, onSel?: (i: number) => void) => React.ReactNode; go: FamilyProps['go'] }) {
  const [sel, setSel] = useState(0);
  const b = plan.beats[sel] ?? plan.beats[0];
  const stages = plan.tensionArc.stages;
  return (
    <Grid rows={{ d: '1fr 0.42fr', t: '1fr 0.45fr', m: '1fr 0.95fr 0.42fr' }}>
      <Panel title="BEAT MAP" meta={`${plan.beats.length} BEATS · ${words(plan.selectedGrammarId)}`} at={{ d: [7, 1], t: [6, 1], m: [6, 1] }} testId="narrative-structure">
        {beatList(sel, setSel)}
      </Panel>
      <Panel title="BEAT INSPECTOR" meta={b ? `BEAT ${pad2(b.order)}` : undefined} at={{ d: [5, 1], t: [6, 1], m: [6, 1] }} testId="narrative-beat-inspector">
        {b ?
          <Kv
            rows={[
              ['BEAT', b.label],
              ['ROLE', b.beatRole],
              ['SHOT FUNCTION', words(b.shotFunction)],
              ['TENSION', `${b.tensionBefore} → ${b.tensionAfter}`],
              ['AUDIENCE KNOWS', b.whatAudienceKnows],
              ['DOES NOT KNOW', b.whatAudienceDoesNotKnow],
              ['WANTS TO KNOW', b.whatAudienceWantsToKnow],
              ['CHANGES', b.whatChangesInThisBeat],
              ['NEXT BEAT', b.whyNextBeatIsNecessary],
            ]}
          />
        : <Empty title="NO BEATS" />}
      </Panel>
      <Panel title="TENSION ARC" meta={`${stages.length} STAGES`} to={go('narrative', 'momentum')} toLabel="MOMENTUM" at={{ d: [12, 1], t: [12, 1], m: [6, 1] }} testId="narrative-tension-arc">
        <ol className="exf-arc">
          {stages.map((s) => (
            <li key={s.stage} data-stage={s.stage}>
              <b>{s.stage}</b>
              <small>{s.beatIds.length} BEAT{s.beatIds.length === 1 ? '' : 'S'}</small>
            </li>
          ))}
        </ol>
      </Panel>
    </Grid>
  );
}

function Momentum({
  plan,
  curve,
  labels,
  marks,
  proofPer,
  beatNo,
  metrics,
  issues,
  reload,
  go,
}: {
  plan: NarrativeMomentumPlan;
  curve: number[];
  labels: string[];
  marks: number[];
  proofPer: number[];
  beatNo: string[];
  metrics: React.ReactNode;
  issues: (sel?: number, onSel?: (i: number) => void) => React.ReactNode;
  reload: () => Promise<unknown> | void;
  go: FamilyProps['go'];
}) {
  const [sel, setSel] = useState(0);
  const issue = plan.validationIssues[sel];
  const keyBeats = marks.map((i) => plan.beats[i]!).filter(Boolean);
  const sourced = plan.evidence.filter((e) => e.status !== 'SOURCE_REQUIRED').length;
  return (
    <Grid rows={{ d: '1.2fr 1fr', t: '1.05fr 0.8fr 1fr', m: '1fr 0.72fr 0.62fr 0.95fr' }}>
      <Panel title="NARRATIVE MOMENTUM CURVE" meta="TENSION BY BEAT" at={{ d: [8, 1], t: [12, 1], m: [6, 1] }} testId="narrative-momentum-curve">
        <Curve points={curve} labels={labels} marks={marks} testId="narrative-curve" />
      </Panel>
      <Panel title="PROOF PER BEAT" meta={words(plan.proofArchitecture.placementPlan.strategy)} at={{ d: [4, 1], t: [6, 1], m: [3, 1] }} testId="narrative-beat-strength">
        <Bars values={proofPer} labels={beatNo} testId="narrative-proof-bars" />
      </Panel>
      <Panel title="NARRATIVE METRICS" meta="CANONICAL COUNTS" at={{ d: [3, 1], t: [6, 1], m: [3, 1] }} testId="narrative-metrics-panel">
        {metrics}
        <Meter value={sourced} max={plan.evidence.length} label="Evidence sourced" />
      </Panel>
      <Panel title="KEY MOMENTS" meta={`${keyBeats.length} TURNS`} at={{ d: [3, 1], t: [4, 1], m: [6, 1] }} testId="narrative-key-moments">
        <ol className="exf-moments">
          {keyBeats.map((b) => (
            <li key={b.beatId} data-stage={b.tensionStage}>
              <em>{pad2(b.order)}</em>
              <b>{b.label}</b>
              <small>
                {b.tensionBefore} → {b.tensionAfter}
              </small>
            </li>
          ))}
        </ol>
      </Panel>
      <Panel title="INTERVENTION QUEUE" meta={`${plan.validationIssues.length} ITEMS`} at={{ d: [3, 1], t: [4, 1], m: [3, 1] }} testId="narrative-intervention-queue">
        {issues(sel, setSel)}
      </Panel>
      <Panel title={issue ? `${words(issue.flagId)}` : 'FOUNDER APPROVAL'} meta={issue ? 'DETAILS' : undefined} at={{ d: [3, 1], t: [4, 1], m: [3, 1] }} testId="narrative-issue-detail">
        {issue ?
          <Kv rows={[['SUGGESTED', issue.suggestedCorrection], ['BEATS', issue.affectedBeatIds.map((x) => upper(x.split('-').pop())).join(' · ') || '—']]} />
        : null}
        <NarrativeApproval plan={plan} reload={reload} compact />
        <Btn to={go('storyboard')} variant="ghost" testId="narrative-open-storyboard">
          OPEN IN STORYBOARD
        </Btn>
      </Panel>
    </Grid>
  );
}

function Proof({ plan }: { plan: NarrativeMomentumPlan }) {
  const [sel, setSel] = useState(0);
  const objects = plan.proofArchitecture.objects;
  const p = objects[sel];
  const ev = plan.evidence.find((e) => e.id === p?.proofId);
  return (
    <Grid rows={{ d: '1fr 0.75fr', t: '1fr 0.8fr', m: '0.95fr 0.95fr 0.8fr' }}>
      <Panel title="PROOF ARCHITECTURE" meta={`${objects.length} OBJECTS`} at={{ d: [5, 1], t: [6, 1], m: [6, 1] }} testId="narrative-proof-objects">
        {objects.map((o, i) => (
          <Row
            key={o.proofId}
            testId="narrative-proof-row"
            onClick={() => setSel(i)}
            active={sel === i}
            media={<em className="exf-num">{pad2(i + 1)}</em>}
            title={words(o.proofType)}
            sub={o.whatItProves}
            aside={<Chip tone={o.strength === 'PRIMARY' ? 'red' : 'gray'}>{o.strength}</Chip>}
          />
        ))}
      </Panel>
      <Panel title="PROOF INSPECTOR" meta={p ? words(p.visualForm) : undefined} at={{ d: [7, 1], t: [6, 1], m: [6, 1] }} testId="narrative-proof-inspector">
        {p ?
          <Kv
            rows={[
              ['PROVES', p.whatItProves],
              ['SOURCE', p.source],
              ['WHEN NEEDED', p.whenAudienceNeedsIt],
              ['PLACEMENT', upper(p.bestPlacement)],
              ['OVER-EXPLAIN RISK', p.riskOfOverexplaining],
              ['EVIDENCE STATUS', ev ? <Chip tone={ev.status === 'SOURCE_REQUIRED' ? 'amber' : 'green'}>{words(ev.status)}</Chip> : '—'],
            ]}
          />
        : <Empty title="NO PROOF OBJECTS" />}
      </Panel>
      <Panel title="EVIDENCE" meta={`${plan.evidence.length} RECORDS`} at={{ d: [7, 1], t: [6, 1], m: [6, 1] }} testId="narrative-evidence">
        {plan.evidence.map((e) => (
          <Row key={e.id} title={words(e.proofType)} sub={e.whatItSupports} aside={<Chip tone={e.status === 'SOURCE_REQUIRED' ? 'amber' : 'green'}>{words(e.status)}</Chip>} />
        ))}
      </Panel>
      <Panel title="PLACEMENT STRATEGY" meta={words(plan.proofArchitecture.placementPlan.strategy)} at={{ d: [5, 1], t: [6, 1], m: [6, 1] }} testId="narrative-placement">
        <p className="exf-text">{plan.proofArchitecture.placementPlan.rationale}</p>
        <ul className="exf-bullets">
          {plan.interpretations.map((i) => (
            <li key={i.id}>
              <b>{i.claim}</b> · {i.lens}
            </li>
          ))}
        </ul>
      </Panel>
    </Grid>
  );
}
