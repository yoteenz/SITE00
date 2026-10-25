/**
 * 04 CAST + PERFORMANCE → TAKES for a project on the production record spine (THE EXCHANGE).
 *
 * Shot → generation status → take preview → APPROVE / HOLD / REJECT / SELECT FOR EDIT, with requirements, cost
 * and approval history. Everything shown is read from the spine API; every action writes an approval record on the
 * server. A control the viewer may not use stays visible, disabled, with the server's reason. Test data is labelled.
 */
import { useState } from 'react';
import type { TakeAction, Unknowable } from '../../../../../../shared/site00-production-spine/types.js';
import type { ShotView, TakeView } from '../../../../../../shared/site00-production-spine/view.js';
import { useProductionSpineWorkspace } from '../../../../production/useProductionSpine';
import { Actions, Btn, Chip, Empty, Grid, Kv, Panel, Row, type Tone } from '../ExpressionFamilyShell';
import '../../../../styles/site00-production-takes.css';

const words = (s: string) => s.replace(/_/g, ' ');
const show = (v: Unknowable<number | string | boolean>, unit = '') => (typeof v === 'number' ? `${v}${unit}` : typeof v === 'boolean' ? (v ? 'YES' : 'NO') : words(String(v)));
const credits = (v: number | null | Unknowable<number>) => (v === null ? 'UNKNOWN' : typeof v === 'number' ? `${v} CR` : words(v));
const STATE_TONE: Record<string, Tone> = { READY_FOR_REVIEW: 'amber', APPROVED: 'green', SELECTED_FOR_EDIT: 'green', HELD: 'gray', REJECTED: 'red' };

const ACTIONS: ReadonlyArray<{ action: TakeAction; label: string; variant: 'red' | 'outline' | 'ink' | 'ghost' }> = [
  { action: 'APPROVE', label: 'APPROVE', variant: 'red' },
  { action: 'HOLD', label: 'HOLD', variant: 'outline' },
  { action: 'REJECT', label: 'REJECT', variant: 'ghost' },
  { action: 'SELECT_FOR_EDIT', label: 'SELECT FOR EDIT', variant: 'ink' },
];

function TakeStage({ take, pending, onDecide }: { take: TakeView; pending: string | null; onDecide: (a: TakeAction) => void }) {
  const select = take.selectedForEdit ? { action: 'DESELECT_FOR_EDIT' as const, label: 'DESELECT FOR EDIT', variant: 'ghost' as const } : null;
  return (
    <div className="exf-takes-stage" data-testid="spine-take-stage">
      <div className="exf-takes-stage__media" data-media-role="TAKE_PREVIEW">
        {take.preview ?
          <video key={take.takeId} src={take.preview.url} controls muted playsInline preload="metadata" aria-label={`${take.takeId} preview`} data-testid="spine-take-video" />
        : <span className="exf-takes-stage__none">{take.previewUnavailable ?? 'NO PREVIEW'}</span>}
      </div>
      <div className="exf-takes-stage__info" data-scroll="internal">
        <Actions note={`${take.takeId} · ${take.fixture ? 'TEST FIXTURE · ' : ''}DECISIONS ARE RECORDED`} testId="spine-take-actions">
          {ACTIONS.map((a) => {
            const x = a.action === 'SELECT_FOR_EDIT' && select ? select : a;
            const st = take.actions[x.action];
            return (
              <Btn key={x.action} variant={x.variant} disabled={!st.allowed || pending !== null} reason={st.reason ?? (pending ? 'saving…' : undefined)} onClick={() => onDecide(x.action)} testId={`spine-take-${x.action.toLowerCase().replace(/_/g, '-')}`}>
                {pending === `${take.takeId}:${x.action}` ? 'SAVING…' : x.label}
              </Btn>
            );
          })}
        </Actions>
        <Kv
          testId="spine-take-facts"
          rows={[
            ['STATE', <Chip tone={STATE_TONE[take.state] ?? 'gray'}>{words(take.state)}</Chip>],
            ['DURATION', show(take.runtimeSec, ' S')],
            ['RESOLUTION', show(take.resolution)],
            ['FRAME RATE', show(take.frameRate, ' FPS')],
            ['ASPECT', show(take.aspectRatio)],
            ['AUDIO', show(take.audioPresent)],
            ['PROVIDER', `${take.provider} · ${take.model}`],
            ['CONTINUITY', words(take.continuity)],
            ['EST. COST', credits(take.estimatedCredits)],
            ['ACTUAL COST', credits(take.actualCredits)],
            ['STORAGE', `${words(take.storage)} · ${take.contentSha256.slice(0, 12)}…`],
          ]}
        />
      </div>
    </div>
  );
}

function Requirements({ shot, pending, onDispatch }: { shot: ShotView; pending: string | null; onDispatch: (jobId: string) => void }) {
  const next = shot.jobs.find((j) => j.dispatch.reasons.every((r) => r.code !== 'DUPLICATE_REQUEST'));
  return (
    <>
      <Actions note={shot.generate.enabled ? 'SENDS ONE AUTHORIZED JOB' : `${shot.generate.reasons[0]?.code ?? ''}${shot.generate.reasons.length > 1 ? ` +${shot.generate.reasons.length - 1} MORE` : ''}`} testId="spine-generate">
        <Btn variant="red" disabled={!shot.generate.enabled || !next || pending !== null} reason={shot.generate.reasons.map((r) => `${r.code}: ${r.detail}`).join('\n')} onClick={() => next && onDispatch(next.jobId)} testId="spine-generate-button">
          GENERATE
        </Btn>
      </Actions>
      <Kv
        testId="spine-shot-status"
        rows={[
          ['SETUP', <Chip tone={shot.setup === 'PRODUCTION_SETUP_READY' ? 'green' : 'amber'}>{words(shot.setup)}</Chip>],
          ['GENERATION', <Chip tone={shot.generation === 'GENERATION_READY' ? 'green' : 'amber'}>{words(shot.generation)}</Chip>],
          ['ESTIMATE', `${credits(shot.budget.plannedCredits)} · ${words(shot.budget.status)}`],
          ['AUTHORIZED', credits(shot.budget.authorizedCredits)],
          ['ACTUAL', credits(shot.budget.actualCredits)],
        ]}
      />
      <ul className="exf-takes-reqs" data-testid="spine-required-decisions">
        {shot.requiredDecisions.map((d) => (
          <li key={d.decisionId}>
            <Chip tone={d.status === 'ANSWERED' ? 'green' : 'amber'}>{d.status}</Chip>
            <b>{d.decisionId}</b>
            <span>{d.question}</span>
          </li>
        ))}
        {shot.references.map((r) => (
          <li key={r.referenceId}>
            <Chip tone={r.status === 'APPROVED' ? 'green' : 'amber'}>{words(r.status)}</Chip>
            <b>{r.referenceId}</b>
            <span>{words(r.role)} · {r.blockedBy.length ? `waits on ${r.blockedBy.join(', ')}` : r.title}</span>
          </li>
        ))}
      </ul>
      <ul className="exf-takes-jobs" data-testid="spine-jobs">
        {shot.jobs.map((j) => (
          <li key={j.jobId}>
            <b>{j.jobId.replace(`JOB-${shot.shotId}-`, '')}</b>
            <span>{j.model}</span>
            <span>{credits(j.quotedCredits)}</span>
            <Chip tone={j.status === 'CAPTURED' ? 'green' : j.status === 'FAILED' ? 'red' : 'gray'}>{words(j.status)}</Chip>
          </li>
        ))}
      </ul>
    </>
  );
}

export function ProductionTakes({ slug }: { slug: string }) {
  const { state, pending, notice, decide, dispatch } = useProductionSpineWorkspace(slug);
  const [shotIdx, setShotIdx] = useState(0);
  const [takeIdx, setTakeIdx] = useState(0);

  if (state.status !== 'ready')
    return (
      <Grid rows={{ d: '1fr', t: '1fr', m: '1fr' }} testId="spine-takes">
        <Panel title="TAKES" meta="PRODUCTION RECORDS" at={{ d: [12, 1], t: [12, 1], m: [6, 1] }} testId="spine-takes-state">
          {state.status === 'loading' ?
            <Empty title="LOADING PRODUCTION RECORDS" testId="spine-takes-loading" />
          : <Empty title="PRODUCTION RECORDS UNAVAILABLE" body={`${state.code}: ${state.message}`} state="BLOCKED" testId="spine-takes-error" />}
        </Panel>
      </Grid>
    );

  const ws = state.workspace;
  const shot = ws.shots[Math.min(shotIdx, ws.shots.length - 1)];
  const take = shot?.takes[Math.min(takeIdx, shot.takes.length - 1)] ?? null;
  const fixture = ws.catalogue.kind === 'TEST_FIXTURE';

  return (
    <Grid rows={{ d: '1fr 1fr', t: '0.9fr 1fr', m: '0.62fr 1.35fr 0.95fr' }} testId="spine-takes">
      <Panel title="SHOTS" meta={`${ws.release.releaseId} · ${ws.scene.sceneId}`} at={{ d: [3, 2], t: [4, 1], m: [6, 1] }} testId="spine-shots" className={`exf-takes-panel${fixture ? ' exf-takes-fixture' : ''}`}>
        {fixture ?
          <p className="exf-takes-fixture__banner" data-testid="spine-fixture-banner">
            TEST FIXTURE DATA — NOT THE PRODUCTION CATALOGUE
          </p>
        : null}
        {ws.shots.map((s, i) => (
          <Row
            key={s.shotId}
            testId="spine-shot-row"
            onClick={() => (setShotIdx(i), setTakeIdx(0))}
            active={s === shot}
            title={s.shotId}
            sub={`${s.screenSec} S ON SCREEN · ${s.generationSec} S GENERATED · ${s.summary.framing.toUpperCase()}`}
            aside={<Chip tone={s.takes.length ? 'green' : 'amber'}>{s.takes.length ? `${s.takes.length} TAKE${s.takes.length === 1 ? '' : 'S'}` : 'NO TAKES'}</Chip>}
          />
        ))}
        {shot ? <p className="exf-takes-purpose">{shot.summary.purpose}</p> : null}
        <Kv
          rows={[
            ['PROJECT', `${ws.displayName} · ${ws.project.releases} RELEASES · ${ws.project.runtime}`],
            ['RELEASE', `${ws.release.releaseId} ${ws.release.title.toUpperCase()} · ${ws.release.runtimeTargetSec} S`],
            ['SCREENPLAY', ws.scene.screenplayStatus],
          ]}
        />
      </Panel>

      <Panel title={take ? `TAKE ${String(take.takeNumber).padStart(2, '0')}` : 'TAKE'} meta={shot?.shotId} at={{ d: [5, 2], t: [8, 1], m: [6, 1] }} testId="spine-take" className="exf-takes-panel">
        {shot && shot.takes.length > 1 ?
          <div className="exf-seg" role="tablist" aria-label="Takes" data-testid="spine-take-tabs">
            {shot.takes.map((t, i) => (
              <button key={t.takeId} type="button" role="tab" aria-selected={t === take} className={t === take ? 'is-active' : ''} onClick={() => setTakeIdx(i)}>
                {String(t.takeNumber).padStart(2, '0')}
              </button>
            ))}
          </div>
        : null}
        {take ?
          <TakeStage take={take} pending={pending} onDecide={(a) => void decide(take.takeId, a)} />
        : <Empty title="NO TAKES YET" body={shot?.generation === 'GENERATION_READY' ? 'READY TO GENERATE' : 'GENERATION AUTHORIZATION PENDING · NOTHING HAS BEEN GENERATED'} state="BLOCKED" testId="spine-no-takes" />}
        {notice ? <p className="exf-takes-notice" role="status" data-testid="spine-notice">{notice}</p> : null}
      </Panel>

      <Panel title="REQUIREMENTS" meta="BEFORE ANY SPEND" at={{ d: [4, 1], t: [6, 1], m: [3, 1] }} testId="spine-requirements" className="exf-takes-panel">
        {shot ? <Requirements shot={shot} pending={pending} onDispatch={(id) => void dispatch(id)} /> : <Empty title="NO SHOT" />}
      </Panel>

      <Panel title="HISTORY" meta="APPROVALS · SOURCES" at={{ d: [4, 1], t: [6, 1], m: [3, 1] }} testId="spine-history" className="exf-takes-panel">
        {take?.history.length ?
          <ol className="exf-takes-history" data-testid="spine-approval-history">
            {take.history.map((h) => (
              <li key={h.approvalId}>
                <b>{words(h.decision)}</b>
                <span>
                  {h.actorRole} · {h.at.replace('T', ' ').replace(/(:\d\d)?Z$/, ' UTC')}
                </span>
                {h.note ? <small>{h.note}</small> : null}
              </li>
            ))}
          </ol>
        : <Empty title="NO DECISIONS RECORDED" />}
        {take ?
          <Kv rows={take.sourceAssets.map((a) => [words(a.role), `${a.assetId}${a.sha256 ? ` · ${a.sha256.slice(0, 10)}…` : ''}`] as const)} testId="spine-source-assets" />
        : null}
      </Panel>
    </Grid>
  );
}
