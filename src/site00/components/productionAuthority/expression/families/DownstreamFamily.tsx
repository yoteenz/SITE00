/**
 * 08 FORMAT STUDIO → 09 CONTENT PACKAGE → 10 CAMPAIGN BOARD (locked downstream flow).
 *
 * CORE PRODUCTION → FINAL REEL / MASTER → DERIVATIVE SOCIAL → FORMAT STUDIO → CONTENT PACKAGE → CAMPAIGN BOARD.
 * Source: the master narrative's format adaptations (plan.formatAdaptations), the production package checklist,
 * the hub keyframes node (master render state) and the narrative campaign handoff. Each adaptation becomes one
 * planned deliverable; nothing is ASSEMBLED until a rendered master exists, the package cannot be finalized until
 * every deliverable is assembled, and the Campaign Board receives completed packages only — so today it holds none.
 */
import { useSearchParams } from 'react-router-dom';
import { pad2 } from '../../primitives';
import { DOWNSTREAM_FLOW } from '../expressionRoutes';
import { words } from '../expressionData';
import { Actions, Btn, Chip, Donut, Empty, Grid, Kv, Meter, Panel, Row, Stat, type Tone } from '../ExpressionFamilyShell';
import type { FamilyProps } from './types';

function Flow({ d, here }: { d: FamilyProps['d']; here: string }) {
  const state: Record<(typeof DOWNSTREAM_FLOW)[number], { v: string; tone: Tone }> = {
    'CORE PRODUCTION': { v: `${d.ready}/${d.total} READY`, tone: d.ready === d.total ? 'green' : 'amber' },
    'FINAL REEL / MASTER': { v: d.masterReady ? 'RENDERED' : 'NOT RENDERED', tone: d.masterReady ? 'green' : 'gray' },
    'DERIVATIVE SOCIAL': { v: `${d.deliverables.length} PLANNED`, tone: 'gray' },
    'FORMAT STUDIO': { v: `${d.plan.formatAdaptations.length} FORMATS`, tone: 'gray' },
    'CONTENT PACKAGE': { v: `${d.assembled}/${d.deliverables.length} ASSEMBLED`, tone: d.packageComplete ? 'green' : 'gray' },
    'CAMPAIGN BOARD': { v: `${d.completedPackages} PACKAGES`, tone: d.completedPackages ? 'green' : 'gray' },
  };
  return (
    <ol className="exf-flow exf-flow--states" data-testid="downstream-flow">
      {DOWNSTREAM_FLOW.map((s) => (
        <li key={s} className={s === here ? 'is-here' : undefined} data-stage={s}>
          <b>{s}</b>
          <Chip tone={state[s].tone}>{state[s].v}</Chip>
        </li>
      ))}
    </ol>
  );
}

export function DownstreamFamily({ d, r, go }: FamilyProps) {
  const [params, setParams] = useSearchParams();
  if (!d.ok) return <Empty title="NO CAMPAIGN ENTRY IN PRODUCTION" testId="expression-no-entry" />;
  const masterEmpty = (
    <Empty title="MASTER NOT RENDERED" body="FORMATS ARE CUT FROM THE FINAL REEL / MASTER. IT APPEARS HERE ONCE KEYFRAMES + MOTION COMPLETE." state="UNMOUNTED" testId="format-master-unmounted" />
  );
  const fam = r.family.id;

  if (fam === 'format') {
    const formats = d.plan.formatAdaptations;
    const selId = params.get('format')?.toUpperCase() ?? formats[0]?.format;
    const f = formats.find((x) => x.format === selId) ?? formats[0];
    const select = (fmt: string) => {
      const next = new URLSearchParams(params);
      next.set('format', fmt.toLowerCase());
      setParams(next, { replace: true });
    };
    return (
      <Grid rows={{ d: '1fr 0.62fr', t: '1fr 0.75fr 0.6fr', m: '0.5fr 0.95fr 0.85fr 0.6fr' }}>
        <Panel title="SELECT FORMAT" meta={`${formats.length} ADAPTATIONS`} at={{ d: [3, 1], t: [4, 1], m: [6, 1] }} testId="format-select">
          <div className="exf-formats" role="tablist" aria-label="Format">
            {formats.map((x) => (
              <button key={x.format} type="button" role="tab" aria-selected={x.format === f?.format} className={x.format === f?.format ? 'is-active' : ''} onClick={() => select(x.format)} data-testid={`format-${x.format.toLowerCase()}`}>
                <b>{x.format}</b>
                <small>{x.durationOrSlideCount}</small>
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="PREVIEW" meta={f ? `${f.format} · FROM MASTER` : undefined} at={{ d: [4, 1], t: [8, 1], m: [6, 1] }} testId="format-preview">
          {masterEmpty}
        </Panel>
        <Panel title="FORMAT INSPECTOR" meta={f?.format} at={{ d: [5, 1], t: [12, 1], m: [6, 1] }} testId="format-inspector">
          {f ?
            <Kv
              rows={[
                ['FORMAT', f.format],
                ['LENGTH', f.durationOrSlideCount],
                ['BEATS USED', `${f.beatsUsed.length} OF ${d.plan.beats.length}${f.beatsMerged.length ? ` · ${f.beatsMerged.length} MERGED` : ''}`],
                ['OPENING', f.openingStrategy],
                ['PROOF', words(f.proofPlacement)],
                ['CLOSING', f.closingStrategy],
                ['OPEN LOOP', f.openLoopTreatment],
              ]}
            />
          : <Empty title="NO FORMAT ADAPTATIONS" />}
        </Panel>
        <Panel title="DOWNSTREAM FLOW" meta="LOCKED ORDER" at={{ d: [8, 1], t: [8, 1], m: [3, 1] }} testId="format-flow">
          <Flow d={d} here="FORMAT STUDIO" />
        </Panel>
        <Panel title="COPY + OPTIMIZE" at={{ d: [4, 1], t: [4, 1], m: [3, 1] }} testId="format-copy">
          <Empty title="NO CAPTION" body="CAPTIONS + HASHTAGS HAVE NO DATA SOURCE YET." state="UNMOUNTED" />
          <Actions>
            <Btn to={go('package')} testId="format-to-package">
              CONTENT PACKAGE
            </Btn>
          </Actions>
        </Panel>
      </Grid>
    );
  }

  if (fam === 'package') {
    const pct = d.deliverables.length ? Math.round((d.assembled / d.deliverables.length) * 100) : 0;
    const checks: [string, boolean][] = [
      ['CORE PRODUCTION READY', d.ready === d.total],
      ['MASTER RENDERED', d.masterReady],
      ['DELIVERABLES ASSEMBLED', d.packageComplete],
      ['NARRATIVE APPROVED', d.plan.founderStatus === 'APPROVED'],
    ];
    return (
      <Grid rows={{ d: '1fr 0.8fr', t: '0.95fr 0.85fr 0.7fr', m: '0.95fr 0.8fr 0.75fr 0.55fr' }}>
        <Panel title="ASSETS" meta={`${d.deliverables.length} DELIVERABLES`} to={go('format')} toLabel="FORMAT STUDIO" at={{ d: [8, 1], t: [12, 1], m: [6, 1] }} testId="package-assets">
          <div className="exf-deliverables">
            {d.deliverables.map((x) => (
              <div key={x.id} className="exf-deliverable" data-state={x.state} data-testid="package-deliverable">
                <b>{x.format}</b>
                <small>{x.spec}</small>
                <Chip tone={x.state === 'ASSEMBLED' ? 'green' : 'gray'}>{x.state}</Chip>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="PACKAGE COMPLETENESS" at={{ d: [4, 1], t: [5, 1], m: [6, 1] }} testId="package-completeness">
          <div className="exf-overview">
            <Donut value={d.assembled} max={d.deliverables.length} label="ASSEMBLED" />
            <Stat value={`${pct}%`} label="COMPLETE" tone={pct === 100 ? 'green' : 'gray'} />
          </div>
          <Meter value={d.assembled} max={Math.max(1, d.deliverables.length)} label="Assembled" />
        </Panel>
        <Panel title="PACKAGE DETAILS" at={{ d: [4, 1], t: [7, 1], m: [3, 1] }} testId="package-details">
          <Kv
            rows={[
              ['ENTRY', d.hub?.production?.label ?? 'ENTRY 002'],
              ['TITLE', d.hub?.production?.subtitle ?? '—'],
              ['GRAMMAR', words(d.plan.selectedGrammarId)],
              ['OPEN LOOP', d.plan.campaignHandoff.openLoopSummary],
            ]}
          />
        </Panel>
        <Panel title="APPROVAL STATUS" at={{ d: [4, 1], t: [6, 1], m: [3, 1] }} testId="package-approval-status">
          <ul className="exf-checks">
            {checks.map(([k, ok]) => (
              <li key={k} data-ok={ok}>
                <span className={`exf-check${ok ? '' : ' is-todo'}`}>{ok ? '✓' : '·'}</span>
                {k}
                <small>{ok ? 'DONE' : 'PENDING'}</small>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="ACTIONS" at={{ d: [4, 1], t: [6, 1], m: [6, 1] }} testId="package-actions">
          <Actions note={d.packageComplete ? 'PACKAGE COMPLETE · READY FOR CAMPAIGN BOARD' : `${d.deliverables.length - d.assembled} DELIVERABLES NOT ASSEMBLED`}>
            <Btn variant="red" disabled={!d.packageComplete} reason="Every deliverable must be assembled from the rendered master" testId="package-finalize">
              FINALIZE PACKAGE
            </Btn>
            <Btn to={go('campaign')} disabled={!d.packageComplete} reason="Campaign Board receives completed packages only" testId="package-to-campaign">
              SEND TO CAMPAIGN BOARD
            </Btn>
          </Actions>
        </Panel>
      </Grid>
    );
  }

  /* campaign */
  const h = d.plan.campaignHandoff;
  return (
    <Grid rows={{ d: '1fr 0.7fr', t: '1fr 0.75fr 0.6fr', m: '0.85fr 0.85fr 0.8fr 0.6fr' }}>
      <Panel title="CAMPAIGN PACKAGES" meta={`${d.completedPackages} COMPLETED`} at={{ d: [8, 1], t: [12, 1], m: [6, 1] }} testId="campaign-packages">
        {d.completedPackages ?
          <Row title={d.hub?.production?.label ?? 'ENTRY 002'} sub="COMPLETED PACKAGE" aside={<Chip tone="green">READY</Chip>} />
        : <Empty title="NO COMPLETED PACKAGES" body="THE CAMPAIGN BOARD RECEIVES COMPLETED CONTENT PACKAGES ONLY." testId="campaign-empty" />}
      </Panel>
      <Panel title="IN PREPARATION" meta="NOT ON BOARD" to={go('package')} toLabel="CONTENT PACKAGE" at={{ d: [4, 1], t: [6, 1], m: [6, 1] }} testId="campaign-in-preparation">
        <Row
          title={d.hub?.production?.label ?? 'ENTRY 002'}
          sub={`${d.assembled}/${d.deliverables.length} DELIVERABLES ASSEMBLED`}
          aside={<Chip tone="gray">{d.packageComplete ? 'COMPLETE' : 'INCOMPLETE'}</Chip>}
          testId="campaign-pending-package"
        />
      </Panel>
      <Panel title="CAMPAIGN HANDOFF" meta="FROM NARRATIVE" at={{ d: [6, 1], t: [6, 1], m: [6, 1] }} testId="campaign-handoff">
        <Kv rows={[['GOAL', h.narrativeGoal], ['AUDIENCE SHIFT', h.audienceShift], ['OPEN LOOP', h.openLoopSummary], ['CONTINUATION', h.continuationTarget], ['PROOF', h.proofArchitectureSummary]]} />
      </Panel>
      <Panel title="READY TO PUBLISH" at={{ d: [6, 1], t: [12, 1], m: [6, 1] }} testId="campaign-ready">
        <div className="exf-stats">
          <Stat value={pad2(d.completedPackages)} label="COMPLETED PACKAGES" />
          <Stat value={pad2(d.deliverables.length)} label="PLANNED CHANNEL CUTS" />
          <Stat value="00" label="SCHEDULED" />
        </div>
        <Actions note="SCHEDULING + PUBLISHING HAVE NO DATA SOURCE YET.">
          <Btn variant="red" disabled reason="No completed package on the board" testId="campaign-prepare">
            PREPARE FOR PUBLISH
          </Btn>
        </Actions>
      </Panel>
    </Grid>
  );
}
