import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { DigitalFoundationArtifactPayload } from '../../../../../shared/site00-digital-foundation/types.js';
import { digitalFoundationClientIntakePath, foundationAdminApi } from '../../services/foundationAdminApi';
import { SITE00_ROUTES } from '../../../config/routes';
import { IDNTY_FOUNDER_WORKSPACE_ROUTES } from '../config/routes';
import { normalizeIntakeColumnLabel } from '../data/intakeColumn';
import { age, readLifecycle } from '../data/lifecycle';
import { nameOf } from '../data/foundationViews';
import { useFounderWorkspaceOverlay } from '../overlay/OverlayContext';
import { FounderWorkspacePageFrame } from '../shell/FounderWorkspacePageFrame';
import {
  WsActivity,
  WsBanner,
  WsButton,
  WsChip,
  WsCopyLink,
  WsEmpty,
  WsJourney,
  WsKv,
  WsLinkButton,
  WsPanel,
  WsPlate,
  WsSkel,
  WsStatus,
  WsTabs,
  WsTechDetail,
  type WsKind,
} from '../shell/wsKit';

const SECTIONS = ['OVERVIEW', 'INTAKE', 'RECOMMENDATIONS', 'QUOTE', 'OPERATIONS', 'RECORDS', 'COMMUNICATIONS', 'ACTIVITY'] as const;
type Section = (typeof SECTIONS)[number];

type Gate = { ok?: boolean; code?: string; reasons?: string[]; summary?: string };

const money = (minor: number | null | undefined, currency = 'USD') =>
  minor === null || minor === undefined ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(minor / 100);
const human = (s: string | null | undefined) => (s ? s.replace(/_/g, ' ').toUpperCase() : '—');
const day = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase() : '');

const EVENT_KIND: Record<string, WsKind> = {
  INTAKE_COMPLETED: 'founder',
  QUOTE_CREATED: 'founder',
  PAYMENT_FAILED: 'blocked',
  REFUND_RECORDED: 'blocked',
  REVISION_REQUESTED: 'founder',
  FOUNDATION_COMPLETED: 'done',
  LINK_OPENED: 'client',
  INTAKE_STARTED: 'client',
  INTAKE_UPDATED: 'client',
  QUOTE_ACCEPTED: 'client',
  CLIENT_ACTION_COMPLETED: 'client',
};

const STAGE_KIND: Record<string, WsKind> = { COMPLETE: 'done', BLOCKED: 'blocked', NEEDS_PROVIDER: 'blocked', IN_PROGRESS: 'work', NEEDS_CLIENT: 'client', WAITING: 'idle' };

/**
 * CLIENT RECORD — OPUS2 D-05/06/07 · TP-05 · TL-05: record head, journey progress, eight section tabs,
 * two-zone body (section left, context column right). Data: admin detail + completion gate.
 * Triggers kept: OL-08 approve quote · OL-09 manual adjustment · OL-10 mark complete · OL-06 more · OL-14 message.
 */
export function ClientRecordPage() {
  const { artifactId = '' } = useParams();
  const { openOverlay, pushToast } = useFounderWorkspaceOverlay();
  const [payload, setPayload] = useState<DigitalFoundationArtifactPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gate, setGate] = useState<Gate | null>(null);
  const [gateError, setGateError] = useState<string | null>(null);
  const [section, setSection] = useState<Section>('OVERVIEW');

  const load = useCallback(() => {
    if (!artifactId) return;
    setError(null);
    void foundationAdminApi
      .detail(artifactId)
      .then((j) => setPayload(j as DigitalFoundationArtifactPayload))
      .catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
    void foundationAdminApi
      .completionGate(artifactId)
      .then((g) => {
        setGate(g as Gate);
        setGateError(null);
      })
      .catch((e) => {
        setGate(null);
        setGateError(e instanceof Error ? e.message : 'Completion gate unavailable');
      });
  }, [artifactId]);

  useEffect(() => {
    load();
  }, [load]);

  if (error && !payload) {
    return (
      <FounderWorkspacePageFrame destination="foundations" title="FOUNDATION" subtitle="THE RECORD COULD NOT LOAD" crumb={['RECORD']}>
        <WsBanner tone="red" icon="warning">
          THE FOUNDATION RECORD COULD NOT LOAD. NOTHING WAS CHANGED.
        </WsBanner>
        <div className="ws-btn-row" style={{ marginTop: 12 }}>
          <WsButton icon="retry" onClick={load}>
            RETRY
          </WsButton>
          <WsLinkButton tone="out" to={IDNTY_FOUNDER_WORKSPACE_ROUTES.foundations}>
            BACK TO FOUNDATIONS
          </WsLinkButton>
        </div>
        <WsTechDetail action={`detail · ${artifactId}`} message={error} />
      </FounderWorkspacePageFrame>
    );
  }

  if (!payload) {
    return (
      <FounderWorkspacePageFrame destination="foundations" title="FOUNDATION" subtitle="LOADING THE RECORD…" crumb={['RECORD']}>
        <div className="rec-progress" aria-busy="true">
          <WsSkel w="40%" />
          <WsSkel w="80%" />
          <WsSkel w="60%" />
        </div>
      </FounderWorkspacePageFrame>
    );
  }

  const a = payload.artifact;
  const intake = a.intake ?? ({ needs: [] } as unknown as typeof a.intake);
  const name = nameOf({ business_name: intake.business_name ?? null, artifact_id: a.artifact_id });
  const life = readLifecycle({ state: a.state, payment_state: a.payment_state });
  const intakePath = digitalFoundationClientIntakePath(a.public_token);
  const fullLink = `${typeof window !== 'undefined' ? window.location.origin : ''}${intakePath}`;
  const listRow = { artifact_id: a.artifact_id, public_token: a.public_token, state: a.state, payment_state: a.payment_state, intake_state: a.intake_state, created_at: a.created_at };
  const q = payload.quote;
  const rec = payload.recommendation;
  const events = [...(payload.events ?? [])].sort((x, y) => y.created_at.localeCompare(x.created_at));
  const dates = Array.from({ length: 8 }, (_, i) => (i === 0 ? day(a.created_at) : i === life.phase ? day(a.last_activity_at) : i === 7 ? day(a.completed_at) : ''));
  const jk = life.kind === 'client' ? 'client' : life.kind === 'blocked' ? 'blocked' : 'cur';

  const copy = () =>
    void navigator.clipboard.writeText(fullLink).then(
      () => pushToast('PERSONAL LINK COPIED', 'ok'),
      () => pushToast('COPY FAILED · THE BROWSER BLOCKED CLIPBOARD ACCESS', 'error'),
    );

  const header = (
    <header className="rec-head">
      <WsPlate name={name} attn={life.kind === 'founder'} size="lg" />
      <div className="rec-head__name">
        <div className="ws-phead__rail">
          <b>02</b>
          <span />
        </div>
        <h1 className="ws-title">
          {name}
          <i aria-hidden="true" />
        </h1>
        <div className="rec-head__sub">
          <span className="ws-meta">DIGITAL FOUNDATION{payload.referral_source ? ` · ${payload.referral_source.label.toUpperCase()}` : ''}</span>
          {intake.current_email ? (
            <span className="ws-data ws-meta" style={{ color: 'var(--ws-ink-2)' }}>
              {intake.current_email}
            </span>
          ) : null}
        </div>
      </div>
      <div className="rec-head__acts">
        <WsButton tone="out" size="sm" icon="link" onClick={copy}>
          COPY LINK
        </WsButton>
        <WsLinkButton tone="out" size="sm" icon="external" to={intakePath} external>
          CLIENT VIEW
        </WsLinkButton>
        <WsButton tone="out" size="sm" icon="message" onClick={() => openOverlay('OL-14', { artifact_id: a.artifact_id, business_name: name })}>
          MESSAGE
        </WsButton>
        <span data-anchor="rowmenu">
          <WsButton tone="out" size="sm" icon="more" onClick={() => openOverlay('OL-06', { artifact_id: a.artifact_id, public_token: a.public_token, business_name: name })}>
            MORE
          </WsButton>
        </span>
      </div>
    </header>
  );

  const side = (
    <aside className="rec-side">
      <WsPanel title="PERSONAL LINK" right={<WsChip kind="ok">PERMANENT</WsChip>}>
        <WsCopyLink value={intakePath} onCopy={copy} />
        <p className="ws-meta" style={{ margin: '10px 0 0' }}>
          THE LINK NEVER EXPIRES{q?.expires_at ? ` · QUOTE V${q.quote_version} EXPIRES ${day(q.expires_at)}` : ''}
        </p>
      </WsPanel>
      <WsPanel title="CONTACT">
        <WsKv
          rows={[
            ['PRIMARY', intake.contact_name || '—', true],
            ['EMAIL', intake.current_email || '—', true],
            ['CONTACT NUMBER', intake.phone || '—', true],
            ['REFERRAL', payload.referral_source?.label?.toUpperCase() ?? 'DIRECT / NONE'],
          ]}
        />
      </WsPanel>
      <WsPanel
        title="RECENT MOVEMENT"
        right={
          <button type="button" className="ws-link-quiet" onClick={() => setSection('ACTIVITY')}>
            ACTIVITY →
          </button>
        }
      >
        {events.length ? (
          events.slice(0, 4).map((e) => <WsActivity key={e.event_id} time={age(e.created_at)} kind={EVENT_KIND[e.event_type] ?? 'work'} title={human(e.event_type)} sub={e.actor ? `BY ${human(e.actor)}` : undefined} />)
        ) : (
          <p className="ws-meta" style={{ margin: 0 }}>
            NO RECORDED EVENTS ON THIS ARTIFACT.
          </p>
        )}
      </WsPanel>
    </aside>
  );

  const quoteTable = q ? (
    <section className="ws-panel">
      <div className="ws-panel__h">
        <h2 className="ws-h3">QUOTE V{q.quote_version} · {human(q.status)}</h2>
        <WsChip kind={q.founder_commercial_ready ? 'ok' : 'req'}>{q.founder_commercial_ready ? 'COMMERCIALLY READY' : 'NOT APPROVED'}</WsChip>
      </div>
      <table className="qt">
        <thead>
          <tr>
            <th>ITEM</th>
            <th className="c-type">TYPE</th>
            <th className="n">QTY</th>
            <th className="n c-unit">UNIT</th>
            <th className="n">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>BASE DIGITAL FOUNDATION</td>
            <td className="c-type">
              <span className="ws-mode">BASE</span>
            </td>
            <td className="n">1</td>
            <td className="n c-unit">{money(q.base_price_minor, q.currency)}</td>
            <td className="n">{money(q.base_price_minor, q.currency)}</td>
          </tr>
          {q.selected_addons.map((l) => (
            <tr key={l.addon_id}>
              <td>{human(l.addon_id)}</td>
              <td className="c-type">
                <span className="ws-mode">{l.requires_manual_review ? 'MANUAL' : 'ADD-ON'}</span>
              </td>
              <td className="n">{l.quantity}</td>
              <td className="n c-unit">{money(l.unit_price_minor, q.currency)}</td>
              <td className="n">{money(l.line_total_minor, q.currency)}</td>
            </tr>
          ))}
          {q.manual_adjustments_minor ? (
            <tr>
              <td>MANUAL ADJUSTMENT</td>
              <td className="c-type">
                <span className="ws-mode">MANUAL</span>
              </td>
              <td className="n">1</td>
              <td className="n c-unit">—</td>
              <td className="n">{money(q.manual_adjustments_minor, q.currency)}</td>
            </tr>
          ) : null}
        </tbody>
        <tfoot>
          <tr className="tot">
            <td colSpan={2}>SUBTOTAL</td>
            <td className="n" colSpan={3}>
              {money(q.subtotal_minor, q.currency)}
            </td>
          </tr>
        </tfoot>
      </table>
      <div className="ws-panel__b ws-meta">AMOUNTS COME FROM THE QUOTE RECORD · THIS SURFACE NEVER RECALCULATES · EXPIRES {day(q.expires_at) || '—'}</div>
    </section>
  ) : (
    <WsEmpty label="NO QUOTE YET" title="THE QUOTE IS NOT CREATED">
      A QUOTE IS CREATED FROM THE SUBMITTED INTAKE AND THE RECOMMENDATION. NOTHING IS SHOWN TO THE CLIENT UNTIL YOU APPROVE IT.
    </WsEmpty>
  );

  const bodies: Record<Section, ReactNode> = {
    OVERVIEW: (
      <div className="rec-main">
        <section className="ws-focus ws-focus--plain" aria-label="NEXT ACTION" style={{ boxShadow: `inset 3px 0 0 ${life.kind === 'founder' ? 'var(--ws-red)' : 'var(--ws-ink)'}` }}>
          <div className="ws-focus__k">
            <WsStatus kind={life.kind}>{life.owner === 'FOUNDER' ? 'FOUNDER DECISION' : `NEXT · ${life.owner === '—' ? 'NONE' : life.owner}`}</WsStatus>
            <span className="ws-meta">{age(a.last_activity_at)} AGO</span>
          </div>
          <p className="ws-statement" style={{ gridColumn: '1/-1' }}>
            {life.statement ?? `${life.label} — ${life.action}`}
            <i className="ws-period" />
          </p>
          <div className="ws-btn-row" style={{ gridColumn: '1/-1' }}>
            {life.phase >= 1 && life.phase <= 2 ? (
              <WsButton arrow onClick={() => setSection('INTAKE')}>
                REVIEW INTAKE
              </WsButton>
            ) : null}
            {q ? (
              <WsButton tone={life.phase === 3 ? '' : 'out'} arrow={life.phase === 3} onClick={() => setSection('QUOTE')}>
                OPEN QUOTE
              </WsButton>
            ) : null}
            {life.phase >= 5 ? (
              <WsButton tone="out" onClick={() => setSection('OPERATIONS')}>
                OPEN OPERATIONS
              </WsButton>
            ) : null}
          </div>
        </section>
        <div className="rec-sum">
          <div>
            <span className="ws-label">INTAKE</span>
            <span className="ws-name">{normalizeIntakeColumnLabel(listRow).toUpperCase()}</span>
            <span className="ws-meta">{a.intake_state === 'COMPLETE' ? 'SUBMITTED' : 'NOT SUBMITTED'}</span>
          </div>
          <div>
            <span className="ws-label">RECOMMENDATION</span>
            <span className="ws-name">{rec ? (rec.manual_review ? 'MANUAL REVIEW' : 'AUTOMATED') : 'NOT YET'}</span>
            <span className="ws-meta">{rec ? `${rec.manual_review_reasons.length} REASONS` : '—'}</span>
          </div>
          <div>
            <span className="ws-label">QUOTE</span>
            <span className="ws-name ws-num-tab">{q ? `${money(q.subtotal_minor, q.currency)} · V${q.quote_version}` : 'NOT YET'}</span>
            <span className="ws-meta">{q ? (q.founder_commercial_ready ? 'APPROVED' : 'NOT APPROVED') : '—'}</span>
          </div>
        </div>
        <WsPanel
          title="SUBMITTED INTAKE · SUMMARY"
          right={
            <button type="button" className="ws-link-quiet" onClick={() => setSection('INTAKE')}>
              ALL ANSWERS →
            </button>
          }
        >
          <div className="ws-kvgrid ws-kvgrid--2">
            <WsKv
              rows={[
                ['BUSINESS', intake.business_name || '—', true],
                ['INDUSTRY', human(intake.industry)],
                ['TEAM SIZE', intake.team_size ? String(intake.team_size) : '—'],
              ]}
            />
            <WsKv
              rows={[
                ['YOUR DOMAIN', intake.existing_domain || '—', true],
                ['REGISTRAR', human(intake.existing_registrar)],
                ['EMAIL TODAY', human(intake.existing_email_provider)],
              ]}
            />
          </div>
        </WsPanel>
      </div>
    ),
    INTAKE: (
      <div className="rec-main">
        {a.intake_state !== 'COMPLETE' ? (
          <WsBanner icon="info">THE CLIENT HAS NOT SUBMITTED THE INTAKE. ANSWERS BELOW ARE THE LATEST SAVED VALUES.</WsBanner>
        ) : null}
        <AnswerGroup
          n="01"
          title="BUSINESS INFORMATION"
          rows={[
            ['BUSINESS NAME', intake.business_name, true],
            ['LEGAL NAME', intake.legal_business_name, true],
            ['INDUSTRY', human(intake.industry)],
            ['PRIMARY CONTACT', intake.contact_name, true],
            ['EMAIL ADDRESS', intake.current_email, true],
            ['CONTACT NUMBER', intake.phone, true],
            ['TEAM SIZE', intake.team_size ? `${intake.team_size} PEOPLE` : undefined],
          ]}
        />
        <AnswerGroup
          n="02"
          title="DOMAIN"
          rows={[
            ['YOUR DOMAIN', intake.existing_domain, true],
            ['REGISTRAR', human(intake.existing_registrar)],
            ['WEBSITE', human(intake.website_status)],
          ]}
        />
        <AnswerGroup
          n="03"
          title="EMAIL + SERVICES"
          rows={[
            ['CURRENT EMAIL', human(intake.existing_email_provider)],
            ['NEEDS', (intake.needs ?? []).map(human).join(' · ') || '—'],
            ['BRANDING', human(intake.branding_status)],
            ['FUTURE WEBSITE', human(intake.future_website_interest)],
          ]}
        />
      </div>
    ),
    RECOMMENDATIONS: (
      <div className="rec-main">
        {rec ? (
          <>
            <WsBanner icon="info">AUTOMATED RECOMMENDATION. NOTHING IS SENT TO THE CLIENT UNTIL YOU APPROVE A QUOTE.</WsBanner>
            <section className="ws-panel">
              <div className="ws-panel__h">
                <h2 className="ws-h3">RECOMMENDED SERVICES</h2>
                {rec.manual_review ? <WsChip kind="req">{rec.manual_review_reasons.length} MANUAL REVIEW</WsChip> : <WsChip kind="ok">AUTOMATED</WsChip>}
              </div>
              <div className="ws-panel__b ws-panel__b--flush">
                {rec.recommended_addons.map((l) => (
                  <div key={l.addon_id} className="rec-item">
                    <span className={`ws-check__b ${l.requires_manual_review ? '' : 'ws-check__b--on'}`.trim()} aria-hidden="true" />
                    <span>
                      <span className="ws-name">
                        {human(l.addon_id)} × {l.quantity}
                      </span>
                      <span className="rec-item__why">
                        <span className="ws-meta">{l.requires_manual_review ? 'REQUIRES FOUNDER REVIEW' : 'FROM THE SUBMITTED INTAKE'}</span>
                      </span>
                    </span>
                    <span className="ws-body ws-num-tab" style={{ whiteSpace: 'nowrap' }}>
                      {l.requires_manual_review ? 'MANUAL REVIEW' : money(l.line_total_minor)}
                    </span>
                  </div>
                ))}
                {!rec.recommended_addons.length ? (
                  <p className="ws-meta" style={{ margin: 0, padding: '14px var(--ws-cell)' }}>
                    BASE DIGITAL FOUNDATION ONLY · NO ADD-ONS RECOMMENDED.
                  </p>
                ) : null}
              </div>
            </section>
            {rec.manual_review_reasons.length ? (
              <WsPanel title="MANUAL REVIEW REASONS">
                {rec.manual_review_reasons.map((r) => (
                  <WsActivity key={r} time="" kind="founder" title={human(r)} />
                ))}
              </WsPanel>
            ) : null}
            <WsPanel title="PROJECTED">
              <WsKv
                rows={[
                  ['INVESTMENT', money(rec.projected_investment_minor)],
                  ['TIMELINE', rec.timeline_custom_review ? 'CUSTOM REVIEW' : `${rec.projected_min_days}–${rec.projected_max_days} BUSINESS DAYS`],
                  ['CLIENT PROVIDES', rec.client_must_provide.map(human).join(' · ') || '—'],
                ]}
              />
            </WsPanel>
          </>
        ) : (
          <WsEmpty label="NO RECOMMENDATION" title="NOT GENERATED YET">
            THE RECOMMENDATION IS PRODUCED WHEN THE CLIENT SUBMITS THE INTAKE.
          </WsEmpty>
        )}
      </div>
    ),
    QUOTE: (
      <div className="qt-wrap">
        {quoteTable}
        <aside className="rec-side">
          <WsPanel title="DECISION">
            <div style={{ display: 'grid', gap: 12 }}>
              <span className="ws-meta">APPROVING MARKS THE QUOTE COMMERCIALLY READY. THE CLIENT SEES IT IN THEIR PORTAL.</span>
              <span data-anchor="approve">
                <WsButton block disabled={!q || Boolean(q.founder_commercial_ready)} onClick={() => openOverlay('OL-08', { artifact_id: a.artifact_id, quote_version: q?.quote_version, subtotal_minor: q?.subtotal_minor, business_name: name })}>
                  {q?.founder_commercial_ready ? 'QUOTE APPROVED' : 'APPROVE QUOTE'}
                </WsButton>
              </span>
              <WsButton tone="out" block disabled={!q} onClick={() => openOverlay('OL-09', { artifact_id: a.artifact_id, quote_version: q?.quote_version, business_name: name })}>
                REVISE · MANUAL ADJUSTMENT
              </WsButton>
            </div>
          </WsPanel>
          <WsPanel title="VERSION">
            <WsKv
              rows={[
                ['VERSION', q ? `V${q.quote_version}` : '—'],
                ['CREATED', q ? day(q.created_at) : '—'],
                ['APPROVED', q?.founder_commercial_ready_at ? day(q.founder_commercial_ready_at) : 'NOT YET'],
              ]}
            />
          </WsPanel>
        </aside>
      </div>
    ),
    OPERATIONS: (
      <div className="rec-main">
        <WsPanel title="PROJECT STAGES" right={<WsLinkButton tone="ghost" size="xs" icon="external" to={SITE00_ROUTES.digitalFoundationWorkbench.replace(':id', a.artifact_id)}>FULL WORKBENCH</WsLinkButton>}>
          {payload.stages?.length ? (
            payload.stages.map((s) => <WsActivity key={s.stage_code} time={day(s.updated_at)} kind={STAGE_KIND[s.status] ?? 'idle'} title={human(s.stage_code)} sub={human(s.status)} />)
          ) : (
            <p className="ws-meta" style={{ margin: 0 }}>
              NO PROJECT STAGES YET · THE RUNBOOK STARTS AFTER VERIFIED PAYMENT.
            </p>
          )}
        </WsPanel>
        <WsPanel title="CLIENT ACTIONS" right={<span className="ws-meta">{payload.client_actions?.filter((c) => c.status === 'OPEN').length ?? 0} OPEN</span>}>
          {payload.client_actions?.length ? (
            payload.client_actions.map((c) => <WsActivity key={c.request_id} time={day(c.created_at)} kind={c.status === 'OPEN' ? 'client' : 'done'} title={c.title.toUpperCase()} sub={human(c.status)} />)
          ) : (
            <p className="ws-meta" style={{ margin: 0 }}>
              NO CLIENT ACTIONS REQUESTED.
            </p>
          )}
        </WsPanel>
      </div>
    ),
    RECORDS: (
      <div className="rec-main">
        <WsPanel title="COMPLETION GATE" right={gate ? <WsChip kind={gate.ok ? 'ok' : 'req'}>{gate.ok ? 'OPEN TO COMPLETE' : `${gate.reasons?.length ?? 0} REASONS`}</WsChip> : <WsChip kind="unver">UNVERIFIED</WsChip>}>
          {gateError ? (
            <WsBanner tone="red" icon="warning">
              THE COMPLETION GATE COULD NOT LOAD · <span className="ws-data">{gateError}</span>
            </WsBanner>
          ) : gate?.reasons?.length ? (
            gate.reasons.map((r) => (
              <div key={r} className="ws-act" style={{ gridTemplateColumns: '10px minmax(0,1fr)', padding: '7px 0' }}>
                <span className="ws-mk ws-mk--blocked" aria-hidden="true" />
                <p className="ws-data" style={{ textTransform: 'uppercase' }}>
                  {r}
                </p>
              </div>
            ))
          ) : (
            <p className="ws-meta" style={{ margin: 0 }}>
              {gate ? 'EVERY COMPLETION REASON IS CLEAR.' : 'LOADING…'}
            </p>
          )}
          <div className="ws-btn-row" style={{ marginTop: 12 }}>
            <WsButton tone={gate?.ok ? '' : 'out'} onClick={() => openOverlay('OL-10', { artifact_id: a.artifact_id, business_name: name, gate })}>
              {gate?.ok ? 'MARK FOUNDATION COMPLETE' : 'MARK COMPLETE · GATE OPEN'}
            </WsButton>
            <WsLinkButton tone="ghost" size="sm" icon="external" to={SITE00_ROUTES.digitalFoundationProjectCommand.replace(':id', a.artifact_id)}>
              PROJECT COMMAND
            </WsLinkButton>
          </div>
        </WsPanel>
        <WsPanel title="OWNERSHIP RECORD">
          {payload.ownership_record ? (
            <WsKv
              rows={[
                ['DOMAIN', payload.ownership_record.domain ?? '—', true],
                ['REGISTRAR', human(payload.ownership_record.registrar)],
                ['EMAIL PROVIDER', human(payload.ownership_record.email_provider)],
                ['PRIMARY MAILBOX', payload.ownership_record.primary_mailbox ?? '—', true],
                ['DNS', human(payload.ownership_record.dns_status)],
                ['SECURITY', human(payload.ownership_record.security_status)],
              ]}
            />
          ) : (
            <p className="ws-meta" style={{ margin: 0 }}>
              NOT RECORDED · THE OWNERSHIP RECORD IS WRITTEN WHEN THE FOUNDATION IS MARKED COMPLETE.
            </p>
          )}
        </WsPanel>
      </div>
    ),
    COMMUNICATIONS: (
      <div className="rec-main">
        <WsPanel title="PORTAL MESSAGES" right={<WsLinkButton tone="ghost" size="xs" icon="external" to={IDNTY_FOUNDER_WORKSPACE_ROUTES.correspondence}>CORRESPONDENCE</WsLinkButton>}>
          <p className="ws-meta" style={{ margin: 0, lineHeight: 1.6 }}>
            THREADS FOR THIS FOUNDATION LIVE IN 05 CORRESPONDENCE. LIFECYCLE EMAIL FOLLOWS THE SEND POLICY; NOTHING IS SENT FROM THIS PAGE.
          </p>
          <div className="ws-btn-row" style={{ marginTop: 12 }}>
            <WsButton tone="out" size="sm" icon="message" onClick={() => openOverlay('OL-14', { artifact_id: a.artifact_id, business_name: name })}>
              WRITE A PORTAL MESSAGE
            </WsButton>
          </div>
        </WsPanel>
      </div>
    ),
    ACTIVITY: (
      <div className="rec-main">
        <WsPanel title="RECORDED EVENTS" right={<span className="ws-meta">{events.length} EVENTS</span>}>
          {events.length ? (
            events.map((e) => <WsActivity key={e.event_id} time={day(e.created_at)} kind={EVENT_KIND[e.event_type] ?? 'work'} title={human(e.event_type)} sub={e.actor ? `BY ${human(e.actor)}` : undefined} />)
          ) : (
            <p className="ws-meta" style={{ margin: 0 }}>
              NO RECORDED EVENTS.
            </p>
          )}
        </WsPanel>
      </div>
    ),
  };

  return (
    <FounderWorkspacePageFrame destination="foundations" crumb={[name]} density="relaxed" header={header}>
      {error ? (
        <div style={{ marginBottom: 12 }}>
          <WsBanner tone="red" icon="warning">
            THE RECORD COULD NOT REFRESH · SHOWING THE LAST LOADED VALUES. <span className="ws-data">{error}</span>
          </WsBanner>
        </div>
      ) : null}
      <section className="rec-progress" aria-label="CLIENT JOURNEY">
        <div className="rec-progress__k">
          <WsStatus kind={life.kind}>{life.label}</WsStatus>
          <span className="ws-meta">
            STEP {life.phase + 1} OF 8 · NEXT: <b className="ws-ink">{life.action}</b> · {life.owner === '—' ? 'NONE' : life.owner}
          </span>
        </div>
        <WsJourney phase={life.phase} kind={jk} dates={dates} />
      </section>
      <div style={{ marginTop: 'var(--ws-gap)' }}>
        <WsTabs label="RECORD SECTIONS" value={section} onChange={setSection} items={SECTIONS.map((s) => ({ id: s, label: s }))} />
      </div>
      {section === 'QUOTE' ? (
        <div style={{ marginTop: 'var(--ws-gap)' }}>{bodies.QUOTE}</div>
      ) : (
        <div className="rec-body">
          {bodies[section]}
          {side}
        </div>
      )}
      <div className="reg-foot">
        <Link className="ws-link-quiet" to={IDNTY_FOUNDER_WORKSPACE_ROUTES.foundations}>
          ← ALL FOUNDATIONS
        </Link>
        <span className="ws-meta ws-data--nowrap">{a.artifact_id}</span>
      </div>
    </FounderWorkspacePageFrame>
  );
}

function AnswerGroup({ n, title, rows }: { n: string; title: string; rows: Array<[string, string | undefined | null, boolean?]> }) {
  const shown = rows.filter(([, v]) => v && v !== '—');
  return (
    <section className="ans-group">
      <div className="ans-group__h">
        <h3 className="ws-h3">
          <span className="ws-idx" style={{ marginRight: 10 }}>
            {n}
          </span>
          {title}
        </h3>
        <span className="ws-meta">{shown.length ? `${shown.length} ANSWERS` : 'NOT ANSWERED'}</span>
      </div>
      <div className="ans-grid">
        {rows.map(([k, v, data]) => (
          <WsKv key={k} rows={[[k, v || '—', Boolean(data && v)]]} />
        ))}
      </div>
    </section>
  );
}
