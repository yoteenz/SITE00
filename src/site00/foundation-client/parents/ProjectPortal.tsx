/** Family C — client project portal (P07–P10, records, communication preferences). */
import { useState, type ReactNode } from 'react';
import type { ClientDigitalFoundationPayload } from '../../../../shared/site00-digital-foundation/clientProjection.js';
import {
  buildClientRecords,
  type ClientRecordCategory,
  type ClientRecordRow,
} from '../../../../shared/site00-digital-foundation/clientRecords.js';
import { stageLabel } from '../../../../shared/site00-digital-foundation/projectStages.js';
import type {
  ClientActionRequest,
  ClientActionType,
  ProjectStageCode,
} from '../../../../shared/site00-digital-foundation/types.js';
import { completeClientAction } from '../api';
import {
  DfBackLink,
  DfBoardList,
  DfBoardRow,
  DfDecisionLine,
  DfDuo,
  DfHonestNote,
  DfIdCard,
  DfKv,
  DfMachine,
  DfPanel,
  DfPill,
  DfTabs,
  type DfKvRow,
} from '../boardKit';
import { dfInputDisplayUpper } from '../dfInputText';
import { DfThresholdHero } from '../objects';
import { formatUsPhoneDisplay } from '../phoneFormat';
import { DF_REVIEW_INERT_MESSAGE, useDfReviewInert } from '../reviewInert';
import {
  activationTurnaround,
  deriveActivationState,
  formatMoney,
  isPaidState,
  type VerifyPhase,
} from '../model';
import { DfIcon, type DfIconName } from '../icons';
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
  onComplete,
  onLocation,
}: {
  payload: ClientDigitalFoundationPayload;
  verify: VerifyPhase;
  onRoadmap: () => void;
  onNeedsYou: () => void;
  onRecords: () => void;
  onStage: (code: ProjectStageCode) => void;
  onActivation: () => void;
  onPrefs: () => void;
  onComplete?: () => void;
  onLocation?: () => void;
}) {
  const complete = payload.artifact.completion_state === 'COMPLETE';
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
      {complete && (onComplete || onLocation) && (
        <DfPanel label="FOUNDATION MILESTONE">
          <DfBoardList>
            {onComplete && (
              <DfBoardRow
                rowId="milestone-complete"
                icon="check"
                iconTone="success"
                title="YOUR FOUNDATION IS COMPLETE"
                sub="VERIFIED STATUS AND RECORD SUMMARY"
                onOpen={onComplete}
              />
            )}
            {onLocation && (
              <DfBoardRow
                rowId="milestone-location"
                icon="domain"
                title="YOUR DIGITAL LOCATION"
                sub="NEXT THRESHOLD — OPTIONAL"
                onOpen={onLocation}
              />
            )}
          </DfBoardList>
        </DfPanel>
      )}
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

const APPROVAL_ACTIONS = new Set<ClientActionType>(['APPROVE_SIGNATURE', 'APPROVE_DOMAIN', 'APPROVE_DNS_CHANGE', 'REVIEW_FINAL_RECORD']);

const ACTION_ICON: Partial<Record<ClientActionType, DfIconName>> = {
  APPROVE_SIGNATURE: 'signature',
  APPROVE_DOMAIN: 'domain',
  CHOOSE_DOMAIN: 'domain',
  AUTHORIZE_DOMAIN_TRANSFER: 'domain',
  PROVIDE_DOMAIN_ACCESS: 'lock',
  PROVIDE_PROVIDER_ACCESS: 'lock',
  AUTHORIZE_PROVIDER: 'lock',
  APPROVE_DNS_CHANGE: 'server',
  CHOOSE_EMAIL_ADDRESS: 'email',
  CONFIRM_EMAIL_ADDRESS: 'email',
  CONFIRM_PRIMARY_EMAIL: 'email',
  CONFIRM_RECOVERY_EMAIL: 'email',
  CONNECT_DEVICE: 'device',
  COMPLETE_DEVICE_SETUP: 'device',
  REVIEW_FINAL_RECORD: 'document',
};

const COUNT_WORD = ['NO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'];

function countWord(n: number): string {
  return COUNT_WORD[n] ?? String(n);
}

function isApprovalAction(a: ClientActionRequest): boolean {
  return APPROVAL_ACTIONS.has(a.action_type);
}

/** Signature preview fields — only what the project actually holds. */
export function signaturePreviewFields(payload: ClientDigitalFoundationPayload) {
  const intake = payload.artifact.intake;
  const o = payload.ownership_record;
  return {
    business: intake.business_name || payload.lead.business_name || o?.business || null,
    person: intake.contact_name || payload.lead.contact_name || null,
    mailbox: o?.primary_mailbox ?? null,
    phone: intake.phone ? formatUsPhoneDisplay(intake.phone) : null,
    site: o?.domain ?? intake.existing_domain ?? null,
  };
}

function SignaturePreview({ payload }: { payload: ClientDigitalFoundationPayload }) {
  const f = signaturePreviewFields(payload);
  const lines: { icon: DfIconName; value: string }[] = [];
  if (f.mailbox) lines.push({ icon: 'email', value: f.mailbox });
  if (f.phone) lines.push({ icon: 'telephone', value: f.phone });
  if (f.site) lines.push({ icon: 'domain', value: f.site });
  return (
    <DfPanel label="BUSINESS SIGNATURE PREVIEW" className="df-sigcard">
      <div className="df-sigcard__grid" style={f.person ? undefined : { gridTemplateColumns: 'minmax(0, 1fr)' }}>
        <div>
          <p className="df-sigcard__business">{(f.business ?? 'YOUR BUSINESS').toUpperCase()}</p>
          {f.person && <p className="df-sigcard__person">{f.person.toUpperCase()}</p>}
          {lines.length > 0 && (
            <ul className="df-sigcard__lines">
              {lines.map((l) => (
                <li key={l.icon}>
                  <DfIcon name={l.icon} />
                  <DfMachine>{l.value}</DfMachine>
                </li>
              ))}
            </ul>
          )}
        </div>
        {f.person && (
          <div className="df-sigcard__mark" aria-hidden="true">
            <span className="df-sigcard__script">{f.person}</span>
            <span className="df-sigcard__caption">{f.person.toUpperCase()}</span>
          </div>
        )}
      </div>
    </DfPanel>
  );
}

function ActionWorkspace({
  action,
  payload,
  busy,
  onRespond,
}: {
  action: ClientActionRequest;
  payload: ClientDigitalFoundationPayload;
  busy: boolean;
  onRespond: (decision: 'APPROVE' | 'REQUEST_CHANGE', notes: string) => void;
}) {
  const [notes, setNotes] = useState('');
  const [changing, setChanging] = useState(false);
  const approval = isApprovalAction(action);
  return (
    <div className="df-action" data-action-id={action.request_id}>
      <DfPanel>
        <DfIdCard
          icon={ACTION_ICON[action.action_type] ?? 'approval'}
          title={action.title.toUpperCase()}
          sub={action.detail.toUpperCase()}
          aside={<DfPill tone="alert">{approval ? 'AWAITING APPROVAL' : 'AWAITING YOU'}</DfPill>}
        />
      </DfPanel>
      {action.action_type === 'APPROVE_SIGNATURE' && <SignaturePreview payload={payload} />}
      {(changing || !approval) && (
        <label className="df-field df-action__notes">
          <span className="df-field__label">{approval ? 'WHAT SHOULD CHANGE?' : 'YOUR RESPONSE'}</span>
          <textarea
            className="df-input df-input--area"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(dfInputDisplayUpper(e.target.value))}
          />
        </label>
      )}
      <DfDuo>
        {approval ? (
          <DfCta label="APPROVE" busy={busy} action="approve" onClick={() => onRespond('APPROVE', '')} />
        ) : (
          <DfCta label="SUBMIT" busy={busy} action="submit-information" onClick={() => onRespond('APPROVE', notes)} />
        )}
        <DfCta
          tone="outline"
          label={changing ? 'SEND CHANGE' : 'REQUEST CHANGE'}
          busy={busy}
          action="request-change"
          onClick={() => {
            if (!changing && approval) {
              setChanging(true);
              return;
            }
            onRespond('REQUEST_CHANGE', notes || 'PLEASE REVISE.');
          }}
        />
      </DfDuo>
    </div>
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
  const inert = useDfReviewInert();
  const open = payload.client_actions.filter((a) => a.status === 'OPEN');
  const done = payload.client_actions.filter((a) => a.status === 'COMPLETED');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const approvals = open.filter(isApprovalAction);
  const headline = !open.length
    ? ['NOTHING', 'NEEDS YOU', 'RIGHT NOW']
    : approvals.length
      ? ['WE NEED', 'YOUR', 'APPROVAL']
      : ['WE NEED', 'YOUR', 'INPUT'];
  const n = open.length;
  const primary = approvals[0] ?? open[0];
  const rest = open.filter((a) => a !== primary);

  const respond = async (action: ClientActionRequest, decision: 'APPROVE' | 'REQUEST_CHANGE', notes: string) => {
    setError(null);
    setNotice(null);
    if (inert) {
      setNotice(DF_REVIEW_INERT_MESSAGE);
      return;
    }
    setBusyId(action.request_id);
    try {
      await completeClientAction(token, action.request_id, { decision, notes, target_version: 1 });
      await onReload();
      setNotice(decision === 'APPROVE' ? 'RECEIVED. SITE 00 CONTINUES YOUR FOUNDATION.' : 'CHANGE REQUEST RECEIVED. SITE 00 WILL REVISE AND RETURN IT TO YOU.');
    } catch {
      setError('WE COULD NOT SAVE YOUR RESPONSE. PLEASE TRY AGAIN.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <DfRail index="10" label="NEEDS YOU + APPROVAL" />
      <DfHeadline lines={headline} />
      <DfLede>
        {n
          ? `${countWord(n)} ITEM${n === 1 ? ' NEEDS' : 'S NEED'} YOUR REVIEW BEFORE SITE 00 CAN CONTINUE. ONCE YOU RESPOND, SITE 00 PROCESSES IT ON THE SERVER AND CONTINUES YOUR FOUNDATION.`
          : 'SITE 00 WILL ASK HERE WHEN A DECISION, APPROVAL OR DETAIL IS NEEDED FROM YOU. YOUR PROJECT KEEPS MOVING IN THE MEANTIME.'}
      </DfLede>
      {primary && (
        <ActionWorkspace
          key={primary.request_id}
          action={primary}
          payload={payload}
          busy={busyId === primary.request_id}
          onRespond={(decision, notes) => void respond(primary, decision, notes)}
        />
      )}
      {error && (
        <p className="df-field__error" role="alert">
          {error}
        </p>
      )}
      {notice && <DfHonestNote>{notice}</DfHonestNote>}
      {n > 0 && (
        <DfDecisionLine
          title={`${countWord(n)} ITEM${n === 1 ? ' REQUIRES' : 'S REQUIRE'} YOUR DECISION.`}
          sub="WE WILL CONTINUE ONCE YOU RESPOND."
        />
      )}
      {rest.length > 0 && (
        <DfPanel label="ALSO NEEDS YOU">
          <DfBoardList>
            {rest.map((a) => (
              <DfBoardRow
                key={a.request_id}
                icon={ACTION_ICON[a.action_type] ?? 'approval'}
                title={a.title.toUpperCase()}
                sub={a.detail.toUpperCase()}
                aside={<DfPill tone="alert">{isApprovalAction(a) ? 'APPROVAL' : 'ACTION'}</DfPill>}
              />
            ))}
          </DfBoardList>
        </DfPanel>
      )}
      {done.length > 0 && (
        <DfPanel label="COMPLETED">
          <DfBoardList>
            {done.slice(0, 5).map((a) => (
              <DfBoardRow key={a.request_id} icon="check" title={a.title.toUpperCase()} aside={<DfPill tone="ok">COMPLETE</DfPill>} />
            ))}
          </DfBoardList>
        </DfPanel>
      )}
      <div className="df-actions">
        <DfCta tone="outline" label="BACK TO OVERVIEW" onClick={onOverview} />
      </div>
      <DfTrust text="YOUR INFORMATION IS SECURE." />
    </>
  );
}

const RECORD_TABS: ClientRecordCategory[] = ['ALL', 'DOMAIN', 'EMAIL', 'SECURITY', 'PAYMENTS'];

const RECORD_ICON: Record<ClientRecordRow['category'], DfIconName> = {
  DOMAIN: 'domain',
  EMAIL: 'email',
  SECURITY: 'security',
  PAYMENTS: 'receipt',
  PROJECT: 'roadmap',
};

const SETTLED_STATUS = new Set(['ACTIVE', 'VERIFIED', 'COMPLETE', 'CONFIGURED', 'PROTECTED']);

export function recordStatusTone(status: string): 'ok' | 'neutral' {
  return SETTLED_STATUS.has(status) ? 'ok' : 'neutral';
}

function shortDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

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
  const tabs = RECORD_TABS.map((id) => ({
    id,
    label: id,
    count: id === 'ALL' ? rows.length : rows.filter((r) => r.category === id).length,
  }));
  return (
    <>
      <DfRail index="13A" label="VIEW MY RECORDS" />
      <DfHeadline lines={['YOUR', 'RECORDS', 'ALL IN ONE PLACE']} />
      <DfLede>
        ACCESS AND REVIEW THE VERIFIED RECORDS FOR YOUR DIGITAL FOUNDATION. ONLY RECORDS THAT EXIST IN YOUR PROJECT ARE SHOWN.
        CREDENTIALS AND SECRETS NEVER APPEAR HERE.
      </DfLede>
      <DfTabs tabs={tabs} value={filter} onChange={setFilter} label="RECORD CATEGORIES" />
      {shown.length ? (
        <DfPanel>
          <DfBoardList label="RECORDS">
            {shown.map((r) => (
              <DfBoardRow
                key={r.id}
                rowId={r.id}
                icon={RECORD_ICON[r.category]}
                title={r.title}
                sub={r.subject ? <DfMachine>{r.subject}</DfMachine> : r.summary}
                meta={r.subject ? r.summary : shortDate(r.date) ?? undefined}
                aside={<DfPill tone={recordStatusTone(r.status)}>{r.status}</DfPill>}
                onOpen={() => onOpen(r.id)}
              />
            ))}
          </DfBoardList>
        </DfPanel>
      ) : (
        <p className="df-section__note">NO RECORDS IN THIS CATEGORY YET. SITE 00 ADDS THEM AS EACH PART OF YOUR FOUNDATION IS VERIFIED.</p>
      )}
      <div className="df-actions">
        <DfCta label="DOWNLOAD ALL RECORDS" disabled action="download-all-records" />
      </div>
      <DfHonestNote>RECORD DOWNLOADS OPEN WHEN SITE 00 PUBLISHES YOUR RECORD DOCUMENTS.</DfHonestNote>
      <div className="df-actions">
        <DfCta tone="text" label="BACK TO OVERVIEW" onClick={onOverview} />
      </div>
      <DfTrust text="SECURE. YOUR INFORMATION." />
    </>
  );
}

type RecordDetailTab = 'OVERVIEW' | 'DOCUMENTS' | 'SETTINGS' | 'HISTORY';

const RECORD_STAGE: Partial<Record<ClientRecordRow['category'], ProjectStageCode[]>> = {
  DOMAIN: ['02_DOMAIN'],
  EMAIL: ['03_PROFESSIONAL_EMAIL'],
  SECURITY: ['04_DNS_SECURITY'],
};

function recordDetailRows(row: ClientRecordRow, payload: ClientDigitalFoundationPayload): DfKvRow[] {
  const o = payload.ownership_record;
  const out: DfKvRow[] = [];
  const push = (label: string, value: ReactNode | null | undefined, tone?: DfKvRow['tone']) => {
    if (value === null || value === undefined || value === '') return;
    out.push({ label, value, tone });
  };
  switch (row.category) {
    case 'DOMAIN':
      push('DOMAIN', o?.domain ? <DfMachine>{o.domain}</DfMachine> : null);
      push('REGISTRAR', o?.registrar?.toUpperCase());
      push('RENEWAL DATE', shortDate(o?.renewal_date));
      push('DNS', o?.dns_status?.replace(/_/g, ' ').toUpperCase());
      push('STATUS', row.status, recordStatusTone(row.status) === 'ok' ? 'ok' : undefined);
      break;
    case 'EMAIL':
      push('MAILBOX', o?.primary_mailbox ? <DfMachine>{o.primary_mailbox}</DfMachine> : null);
      push('PROVIDER', o?.email_provider?.toUpperCase());
      push('ALIASES', o?.aliases.length ? <DfMachine>{o.aliases.join(', ')}</DfMachine> : null);
      push('STATUS', row.status, 'ok');
      break;
    case 'SECURITY':
      push('DNS', o?.dns_status?.replace(/_/g, ' ').toUpperCase());
      push('EMAIL SECURITY', o?.security_status?.replace(/_/g, ' ').toUpperCase());
      push('COVERAGE', 'SPF, DKIM, DMARC');
      break;
    case 'PAYMENTS':
      push('QUOTE', payload.quote ? `V${payload.quote.quote_version}` : null);
      push('AMOUNT', payload.quote ? formatMoney(payload.quote.subtotal_minor, payload.quote.currency) : null);
      push('ACCEPTED', shortDate(payload.acceptance?.accepted_at));
      push('STATUS', row.status, 'ok');
      break;
    case 'PROJECT':
      push('PROGRESS', row.summary);
      push('STATUS', row.status, recordStatusTone(row.status) === 'ok' ? 'ok' : undefined);
      break;
  }
  push('OWNER', (o?.owner ?? o?.business)?.toUpperCase());
  push('ACCESS MODEL', o?.administrative_access_model?.toUpperCase());
  return out;
}

function recordHistory(row: ClientRecordRow, payload: ClientDigitalFoundationPayload): { label: string; date: string }[] {
  const codes = RECORD_STAGE[row.category];
  const out: { label: string; date: string }[] = [];
  if (row.category === 'PAYMENTS' && payload.acceptance?.accepted_at) {
    out.push({ label: 'QUOTE ACCEPTED', date: payload.acceptance.accepted_at });
  }
  for (const s of payload.stages) {
    if (codes && !codes.includes(s.stage_code)) continue;
    if (!codes && row.category !== 'PROJECT') continue;
    out.push({ label: `${stageLabel(s.stage_code).toUpperCase()} · ${STAGE_STATUS[s.status] ?? s.status}`, date: s.updated_at });
  }
  if (payload.artifact.completed_at && (row.category === 'PROJECT' || codes)) {
    out.push({ label: 'FOUNDATION VERIFIED COMPLETE', date: payload.artifact.completed_at });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
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
  const [tab, setTab] = useState<RecordDetailTab>('OVERVIEW');
  const row = buildClientRecords(payload).find((r) => r.id === recordId);
  const business = payload.artifact.intake.business_name || payload.lead.business_name || payload.ownership_record?.business || null;
  if (!row) {
    return (
      <>
        <DfBackLink label="VIEW MY RECORDS" onClick={onBack} />
        <DfHeadline lines={['RECORD', 'NOT FOUND']} />
        <DfLede>THIS RECORD IS NOT AVAILABLE ON YOUR PROJECT. RETURN TO YOUR RECORDS TO SEE WHAT SITE 00 HAS ON FILE.</DfLede>
        <DfTrust text="SECURE. VERIFIED. YOURS." />
      </>
    );
  }
  const history = recordHistory(row, payload);
  return (
    <>
      <DfBackLink label="VIEW MY RECORDS" onClick={onBack} />
      <DfIdCard
        icon={RECORD_ICON[row.category]}
        title={row.title}
        sub={row.subject ? <DfMachine>{row.subject}</DfMachine> : row.summary}
        aside={<DfPill tone={recordStatusTone(row.status)}>{row.status}</DfPill>}
      />
      <DfTabs
        tabs={[
          { id: 'OVERVIEW', label: 'OVERVIEW' },
          { id: 'DOCUMENTS', label: 'DOCUMENTS' },
          { id: 'SETTINGS', label: 'SETTINGS' },
          { id: 'HISTORY', label: 'HISTORY' },
        ]}
        value={tab}
        onChange={setTab}
        label="RECORD SECTIONS"
      />
      {tab === 'OVERVIEW' && (
        <>
          <div className="df-panel df-recordhero" aria-hidden="true">
            <DfThresholdHero />
            <span className="df-recordhero__name">{(business ?? row.title).toUpperCase()}</span>
            {row.subject && (
              <span className="df-recordhero__sub">
                <DfMachine>{row.subject}</DfMachine>
              </span>
            )}
          </div>
          <DfPanel label="RECORD DETAILS">
            <DfKv rows={recordDetailRows(row, payload)} />
          </DfPanel>
        </>
      )}
      {tab === 'DOCUMENTS' && (
        <DfPanel label="DOCUMENTS">
          <p className="df-panel__body df-section__note">
            NO DOCUMENTS ARE ON FILE FOR THIS RECORD YET. SITE 00 ADDS THEM HERE WHEN THEY EXIST — NOTHING IS GENERATED FOR DISPLAY.
          </p>
        </DfPanel>
      )}
      {tab === 'SETTINGS' && (
        <DfPanel label="SETTINGS">
          <DfKv
            rows={[
              { label: 'MANAGED BY', value: 'SITE 00' },
              ...(payload.ownership_record?.administrative_access_model
                ? [{ label: 'ACCESS MODEL', value: payload.ownership_record.administrative_access_model.toUpperCase() }]
                : []),
              { label: 'CREDENTIALS', value: 'NEVER SHOWN HERE' },
            ]}
          />
        </DfPanel>
      )}
      {tab === 'HISTORY' && (
        <DfPanel label="HISTORY">
          {history.length ? (
            <DfBoardList>
              {history.map((h) => (
                <DfBoardRow key={`${h.label}-${h.date}`} icon="time" title={h.label} aside={shortDate(h.date)} />
              ))}
            </DfBoardList>
          ) : (
            <p className="df-panel__body df-section__note">NO DATED EVENTS FOR THIS RECORD YET.</p>
          )}
        </DfPanel>
      )}
      <div className="df-actions">
        <DfCta label="DOWNLOAD RECORD" disabled action="download-record" />
      </div>
      <DfHonestNote>DOWNLOAD OPENS WHEN SITE 00 PUBLISHES A DOCUMENT FOR THIS RECORD.</DfHonestNote>
      <DfTrust text="SECURE. VERIFIED. YOURS." />
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
