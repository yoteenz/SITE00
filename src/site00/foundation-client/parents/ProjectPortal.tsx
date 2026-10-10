/** Family C — client project portal (P07–P10, records, communication preferences). */
import { useState } from 'react';
import type { ClientDigitalFoundationPayload } from '../../../../shared/site00-digital-foundation/clientProjection.js';
import {
  buildClientRecords,
  type ClientRecordCategory,
} from '../../../../shared/site00-digital-foundation/clientRecords.js';
import { stageLabel } from '../../../../shared/site00-digital-foundation/projectStages.js';
import type { ClientActionRequest, ProjectStageCode } from '../../../../shared/site00-digital-foundation/types.js';
import { completeClientAction } from '../api';
import {
  activationTurnaround,
  deriveActivationState,
  formatMoney,
  isPaidState,
  type VerifyPhase,
} from '../model';
import { DfIcon } from '../icons';
import { DfCta, DfHeadline, DfLede, DfRail, DfTrust } from '../shell';
import { SpecRow } from './CheckoutActivation';

const STAGE_STATUS: Record<string, string> = {
  COMPLETE: 'COMPLETE',
  IN_PROGRESS: 'IN PROGRESS',
  WAITING: 'UPCOMING',
  BLOCKED: 'BLOCKED',
  NEEDS_CLIENT: 'NEEDS YOU',
};

function scopeSummary(payload: ClientDigitalFoundationPayload): string {
  const q = payload.quote;
  if (!q) return 'DIGITAL FOUNDATION';
  const n = q.selected_addons.length;
  return n ? `DIGITAL FOUNDATION + ${n} ADD-ON${n === 1 ? '' : 'S'}` : 'DIGITAL FOUNDATION BASE';
}

export function P07ProjectOverview({
  payload,
  verify,
  onRoadmap,
  onNeedsYou,
  onRecords,
  onStage,
  onActivation,
  onPrefs,
}: {
  payload: ClientDigitalFoundationPayload;
  verify: VerifyPhase;
  onRoadmap: () => void;
  onNeedsYou: () => void;
  onRecords: () => void;
  onStage: (code: ProjectStageCode) => void;
  onActivation: () => void;
  onPrefs: () => void;
}) {
  const state = deriveActivationState(payload, verify);
  const paid = isPaidState(state);
  const open = payload.client_actions.filter((a) => a.status === 'OPEN');
  const turnaround = activationTurnaround(payload);
  const current = payload.stages.find((s) => s.status === 'IN_PROGRESS') ?? payload.stages.find((s) => s.status !== 'COMPLETE');
  const business = payload.artifact.intake.business_name || payload.lead.business_name || '—';

  return (
    <>
      <DfRail index="07" label="PROJECT OVERVIEW" />
      <DfHeadline lines={['YOUR', 'PROJECT', 'OVERVIEW']} />
      <DfLede>LIVE PROJECT STATUS FROM SITE 00. TRACK STAGES, COMPLETE REQUESTS, AND REVIEW YOUR RECORDS ON THIS LINK.</DfLede>
      <ul className="df-specs">
        <SpecRow icon="building" label={business.toUpperCase()} sub="CLIENT" wide />
        <SpecRow icon="cube" label={scopeSummary(payload)} sub="PURCHASED SCOPE" wide />
        <SpecRow
          icon="card"
          label={paid ? 'PAID' : payload.artifact.payment_state.replace(/_/g, ' ')}
          sub="PAYMENT"
          value={payload.quote ? formatMoney(payload.quote.subtotal_minor, payload.quote.currency) : undefined}
        />
        {current && (
          <SpecRow
            icon="gear"
            label={stageLabel(current.stage_code).toUpperCase()}
            sub="CURRENT STAGE"
            value={STAGE_STATUS[current.status] ?? current.status}
          />
        )}
      </ul>
      {open.length > 0 && (
        <section className="df-section" aria-labelledby="df-needs-h">
          <h2 className="df-section__label df-section__label--red" id="df-needs-h">
            NEEDS YOU · {open.length}
          </h2>
          <ul className="df-specs">
            {open.slice(0, 3).map((a) => (
              <SpecRow key={a.request_id} icon="alert" label={a.title.toUpperCase()} sub={a.detail.toUpperCase()} wide />
            ))}
          </ul>
          <div className="df-actions df-actions--inline">
            <DfCta tone="outline" label="OPEN NEEDS YOU" onClick={onNeedsYou} />
          </div>
        </section>
      )}
      {payload.stages.length > 0 && (
        <section className="df-section" aria-labelledby="df-stages-h">
          <h2 className="df-section__label" id="df-stages-h">
            PROJECT STAGES
          </h2>
          <ol className="df-stages">
            {payload.stages.map((s) => (
              <li key={s.stage_code}>
                <button type="button" className={`df-stage df-stage--${s.status.toLowerCase()}`} onClick={() => onStage(s.stage_code)}>
                  <span className="df-stage__node" aria-hidden="true">
                    {s.status === 'COMPLETE' && <DfIcon name="check" />}
                  </span>
                  <span className="df-stage__label">{stageLabel(s.stage_code).toUpperCase()}</span>
                  <span className="df-stage__status">{STAGE_STATUS[s.status] ?? s.status}</span>
                </button>
              </li>
            ))}
          </ol>
          <DfCta tone="outline" label="VIEW FULL ROADMAP" onClick={onRoadmap} />
        </section>
      )}
      {turnaround && (
        <ul className="df-specs">
          <SpecRow icon="clock" label="ESTIMATED TURNAROUND" sub={turnaround.caption} value={turnaround.value} valueSub={turnaround.unit} />
        </ul>
      )}
      <div className="df-actions">
        {buildClientRecords(payload).length > 0 && <DfCta tone="outline" label="VIEW MY RECORDS" onClick={onRecords} />}
        <DfCta tone="outline" label="COMMUNICATION PREFERENCES" onClick={onPrefs} />
        <DfCta tone="outline" label="BACK TO ACTIVATION" onClick={onActivation} />
      </div>
      <DfTrust text="SAFE. SECURE. ON TRACK." />
    </>
  );
}

export function P08Roadmap({
  payload,
  onStage,
  onOverview,
}: {
  payload: ClientDigitalFoundationPayload;
  onStage: (code: ProjectStageCode) => void;
  onOverview: () => void;
}) {
  return (
    <>
      <DfRail index="08" label="PROJECT ROADMAP" />
      <DfHeadline lines={['YOUR', 'PROJECT', 'ROADMAP']} />
      <DfLede>CANONICAL FOUNDATION STAGES FROM SITE 00. STATUS COMES FROM YOUR LIVE PROJECT — NOT SAMPLE DATA.</DfLede>
      <ol className="df-stages df-stages--roadmap">
        {payload.stages.map((s) => (
          <li key={s.stage_code}>
            <button type="button" className={`df-stage df-stage--${s.status.toLowerCase()}`} onClick={() => onStage(s.stage_code)}>
              <span className="df-stage__node" aria-hidden="true">
                {s.status === 'COMPLETE' && <DfIcon name="check" />}
              </span>
              <span className="df-stage__label">{stageLabel(s.stage_code).toUpperCase()}</span>
              <span className="df-stage__status">{STAGE_STATUS[s.status] ?? s.status}</span>
            </button>
          </li>
        ))}
      </ol>
      {!payload.stages.length && <p className="df-section__note">YOUR PROJECT PLAN APPEARS HERE ONCE SITE 00 ACTIVATES YOUR FOUNDATION.</p>}
      <div className="df-actions">
        <DfCta tone="outline" label="BACK TO OVERVIEW" onClick={onOverview} />
      </div>
      <DfTrust text="SAFE. SECURE. ON TRACK." />
    </>
  );
}

export function P09StageDetail({
  payload,
  stageCode,
  onRoadmap,
}: {
  payload: ClientDigitalFoundationPayload;
  stageCode: ProjectStageCode;
  onRoadmap: () => void;
}) {
  const stage = payload.stages.find((s) => s.stage_code === stageCode);
  const related = payload.client_actions.filter((a) => a.status === 'OPEN');
  const forecast = payload.operations_summary?.projected_completion;
  return (
    <>
      <DfRail index="09" label="STAGE DETAIL" />
      <DfHeadline lines={[stageLabel(stageCode).toUpperCase()]} />
      <DfLede>PURPOSE AND STATUS FOR THIS FOUNDATION STAGE. SITE 00 UPDATES THIS VIEW AS WORK PROGRESSES.</DfLede>
      {stage ? (
        <ul className="df-specs">
          <SpecRow icon="gear" label={STAGE_STATUS[stage.status] ?? stage.status} sub="STATUS" wide />
          <SpecRow icon="clock" label={new Date(stage.updated_at).toLocaleDateString('en-US').toUpperCase()} sub="LAST UPDATED" wide />
          {forecast && <SpecRow icon="clock" label={forecast.toUpperCase()} sub="PROJECT FORECAST" wide />}
        </ul>
      ) : (
        <p className="df-section__note">THIS STAGE IS NOT ON YOUR PROJECT PLAN YET.</p>
      )}
      {related.length > 0 && (
        <p className="df-section__note">{related.length} CLIENT ACTION{related.length === 1 ? '' : 'S'} MAY RELATE TO THIS STAGE — SEE NEEDS YOU.</p>
      )}
      <div className="df-actions">
        <DfCta tone="outline" label="BACK TO ROADMAP" onClick={onRoadmap} />
      </div>
      <DfTrust text="SAFE. SECURE. ON TRACK." />
    </>
  );
}

function ActionWorkspace({
  action,
  busy,
  onApprove,
  onRequestChange,
  onProvide,
}: {
  action: ClientActionRequest;
  busy: boolean;
  onApprove: () => void;
  onRequestChange: () => void;
  onProvide: (notes: string) => void;
}) {
  const [notes, setNotes] = useState('');
  return (
    <article className="df-action-card" data-action-id={action.request_id}>
      <h3 className="df-action-card__title">{action.title.toUpperCase()}</h3>
      <p className="df-action-card__body">{action.detail.toUpperCase()}</p>
      <label className="df-field">
        <span className="df-field__label">YOUR NOTES (OPTIONAL)</span>
        <textarea className="df-input df-input--area" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <div className="df-actions df-actions--inline">
        <DfCta label="APPROVE" busy={busy} onClick={onApprove} />
        <DfCta tone="outline" label="REQUEST CHANGES" busy={busy} onClick={onRequestChange} />
        <DfCta tone="outline" label="SUBMIT INFORMATION" busy={busy} onClick={() => onProvide(notes)} />
      </div>
    </article>
  );
}

export function P10NeedsYou({
  token,
  payload,
  onReload,
  onOverview,
}: {
  token: string;
  payload: ClientDigitalFoundationPayload;
  onReload: () => Promise<unknown>;
  onOverview: () => void;
}) {
  const open = payload.client_actions.filter((a) => a.status === 'OPEN');
  const done = payload.client_actions.filter((a) => a.status === 'COMPLETED');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const respond = async (action: ClientActionRequest, decision: 'APPROVE' | 'REQUEST_CHANGE', notes?: string) => {
    setError(null);
    setBusyId(action.request_id);
    try {
      await completeClientAction(token, action.request_id, { decision, notes: notes ?? '', target_version: 1 });
      await onReload();
    } catch {
      setError('WE COULD NOT SAVE YOUR RESPONSE. PLEASE TRY AGAIN.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <DfRail index="10" label="NEEDS YOU" />
      <DfHeadline lines={['YOUR', 'ACTIONS']} />
      <DfLede>REVIEW EACH REQUEST, APPROVE, REQUEST CHANGES, OR SUBMIT INFORMATION. SITE 00 PROCESSES YOUR RESPONSE ON THE SERVER.</DfLede>
      {error && <p className="df-field__error" role="alert">{error}</p>}
      {!open.length && <p className="df-section__note">NO OPEN REQUESTS RIGHT NOW. CHECK BACK WHEN SITE 00 NEEDS SOMETHING FROM YOU.</p>}
      {open.map((a) => (
        <ActionWorkspace
          key={a.request_id}
          action={a}
          busy={busyId === a.request_id}
          onApprove={() => void respond(a, 'APPROVE')}
          onRequestChange={() => void respond(a, 'REQUEST_CHANGE', 'Please revise.')}
          onProvide={(notes) => void respond(a, 'APPROVE', notes)}
        />
      ))}
      {done.length > 0 && (
        <section className="df-section">
          <h2 className="df-section__label">COMPLETED</h2>
          <ul className="df-specs">
            {done.slice(0, 5).map((a) => (
              <SpecRow key={a.request_id} icon="check" label={a.title.toUpperCase()} sub="COMPLETED" wide />
            ))}
          </ul>
        </section>
      )}
      <div className="df-actions">
        <DfCta tone="outline" label="BACK TO OVERVIEW" onClick={onOverview} />
      </div>
      <DfTrust text="SAFE. SECURE. ON TRACK." />
    </>
  );
}

const RECORD_FILTERS: ClientRecordCategory[] = ['ALL', 'DOMAIN', 'EMAIL', 'SECURITY', 'PAYMENTS', 'PROJECT'];

export function RecordsLibrary({
  payload,
  onOpen,
  onOverview,
}: {
  payload: ClientDigitalFoundationPayload;
  onOpen: (id: string) => void;
  onOverview: () => void;
}) {
  const [filter, setFilter] = useState<ClientRecordCategory>('ALL');
  const rows = buildClientRecords(payload);
  const shown = filter === 'ALL' ? rows : rows.filter((r) => r.category === filter);
  return (
    <>
      <DfRail index="—" label="MY RECORDS" />
      <DfHeadline lines={['YOUR', 'RECORDS']} />
      <DfLede>VERIFIED PROJECT AND OWNERSHIP RECORDS SITE 00 HAS ON FILE. NO DOCUMENT IS SHOWN UNLESS IT EXISTS IN YOUR PROJECT.</DfLede>
      <div className="df-chips" role="tablist" aria-label="RECORD CATEGORIES">
        {RECORD_FILTERS.map((f) => (
          <button key={f} type="button" role="tab" aria-selected={filter === f} className={`df-chip${filter === f ? ' df-chip--on' : ''}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>
      {!shown.length && <p className="df-section__note">NO RECORDS IN THIS CATEGORY YET.</p>}
      <ul className="df-specs">
        {shown.map((r) => (
          <li key={r.id}>
            <button type="button" className="df-specs__rowbtn" onClick={() => onOpen(r.id)}>
              <SpecRow icon="document" label={r.title} sub={r.category} value={r.status} wide />
            </button>
          </li>
        ))}
      </ul>
      <div className="df-actions">
        <DfCta tone="outline" label="BACK TO OVERVIEW" onClick={onOverview} />
      </div>
      <DfTrust text="SAFE. SECURE. ON TRACK." />
    </>
  );
}

export function RecordDetail({
  payload,
  recordId,
  onBack,
}: {
  payload: ClientDigitalFoundationPayload;
  recordId: string;
  onBack: () => void;
}) {
  const row = buildClientRecords(payload).find((r) => r.id === recordId);
  const o = payload.ownership_record;
  return (
    <>
      <DfRail index="—" label="RECORD DETAIL" />
      <DfHeadline lines={row ? [row.title] : ['RECORD', 'NOT FOUND']} />
      {!row && <p className="df-section__note">THIS RECORD IS NOT AVAILABLE.</p>}
      {row && (
        <ul className="df-specs">
          <SpecRow icon="document" label={row.status} sub="STATUS" wide />
          <SpecRow icon="layers" label={row.summary} sub="SUMMARY" wide />
          {row.date && <SpecRow icon="clock" label={row.date} sub="RELEVANT DATE" wide />}
        </ul>
      )}
      {row?.category === 'DOMAIN' && o?.domain && (
        <p className="df-section__note">OWNERSHIP AND RENEWAL DETAILS ARE MANAGED BY SITE 00. CREDENTIALS ARE NEVER SHOWN HERE.</p>
      )}
      <div className="df-actions">
        <DfCta tone="outline" label="BACK TO RECORDS" onClick={onBack} />
      </div>
      <DfTrust text="SAFE. SECURE. ON TRACK." />
    </>
  );
}

export type CommunicationPrefs = {
  marketing_opt_in: boolean;
  project_operations: boolean;
  educational: boolean;
};

export function CommunicationPreferences({
  prefs,
  busy,
  onSave,
  onOverview,
}: {
  prefs: CommunicationPrefs;
  busy: boolean;
  onSave: (next: CommunicationPrefs) => void;
  onOverview: () => void;
}) {
  const [local, setLocal] = useState(prefs);
  return (
    <>
      <DfRail index="—" label="COMMUNICATION PREFERENCES" />
      <DfHeadline lines={['YOUR', 'COMMUNICATION', 'PREFERENCES']} />
      <DfLede>
        ESSENTIAL SERVICE AND SECURITY NOTICES ALWAYS APPLY TO AN ACTIVE FOUNDATION PROJECT. MARKETING EMAIL IS OPTIONAL AND NEVER
        INFERRED FROM OPENING YOUR LINK.
      </DfLede>
      <ul className="df-specs">
        <li className="df-choice df-choice--locked">
          <span className="df-choice__label">ESSENTIAL SERVICE + SECURITY (REQUIRED)</span>
        </li>
      </ul>
      <label className="df-choice">
        <input
          type="checkbox"
          checked={local.project_operations}
          onChange={(e) => setLocal({ ...local, project_operations: e.target.checked })}
        />
        <span className="df-choice__label">PROJECT OPERATIONS UPDATES</span>
      </label>
      <label className="df-choice">
        <input type="checkbox" checked={local.educational} onChange={(e) => setLocal({ ...local, educational: e.target.checked })} />
        <span className="df-choice__label">OPTIONAL EDUCATIONAL EMAIL</span>
      </label>
      <label className="df-choice">
        <input type="checkbox" checked={local.marketing_opt_in} onChange={(e) => setLocal({ ...local, marketing_opt_in: e.target.checked })} />
        <span className="df-choice__label">PROMOTIONAL MARKETING (OPT IN)</span>
      </label>
      <div className="df-actions">
        <DfCta label="SAVE PREFERENCES" busy={busy} onClick={() => onSave(local)} />
        <DfCta tone="outline" label="BACK TO OVERVIEW" onClick={onOverview} />
      </div>
      <DfTrust text="SAFE. SECURE. ON TRACK." />
    </>
  );
}
