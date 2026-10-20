import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DfCornerFragment } from '../../../foundation-client/objects';
import { foundationReadinessApi, type FounderReadinessReport, type TestInvitationPreview, type TestJourney } from '../../services/foundationReadinessApi';
import { OVERALL_STATEMENT, buildSystemModules, sortStatusFirst, type SystemArea, type SystemModule } from '../data/systemModules';
import { intentChip } from '../data/emailIntents';
import { useFounderWorkspaceOverlay } from '../overlay/OverlayContext';
import { FounderWorkspacePageFrame } from '../shell/FounderWorkspacePageFrame';
import { useInspectorDocked } from '../shell/useWorkspaceTier';
import { ModuleInspector } from '../inspectors/Inspectors';
import {
  WsActivity,
  WsBanner,
  WsButton,
  WsChip,
  WsField,
  WsGap,
  WsIcon,
  WsIdent,
  WsInput,
  WsKv,
  WsPanel,
  WsSkel,
  WsTabs,
  WsTechDetail,
} from '../shell/wsKit';

type Tab = 'OVERVIEW' | 'STACK' | 'INTEGRATIONS' | 'SECURITY' | 'TEST LAB' | 'READINESS REPORT';
const TABS: Tab[] = ['OVERVIEW', 'STACK', 'INTEGRATIONS', 'SECURITY', 'TEST LAB', 'READINESS REPORT'];
const host = (u: string | null | undefined) => {
  if (!u) return '—';
  try {
    return new URL(u).host;
  } catch {
    return u;
  }
};

/**
 * 07 SYSTEM — OPUS2 D-12 · D-13 TEST LAB · TP-09 · TL-09 · C-07: verdict, status-first module console,
 * attention order, module inspector (docked ≥ 1100, OL-16 sheet below), test lab, readiness report.
 * Everything is read from the founder readiness report; a failed report is shown as failed, never as healthy.
 */
export function SystemPage() {
  const docked = useInspectorDocked();
  const { openOverlay, open } = useFounderWorkspaceOverlay();
  const [report, setReport] = useState<FounderReadinessReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedAt, setLoadedAt] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>('OVERVIEW');
  const [moduleId, setModuleId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReport(await foundationReadinessApi.readinessReport());
      setLoadedAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Readiness report failed');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const modules = useMemo(() => sortStatusFirst(buildSystemModules(report)), [report]);
  const area: SystemArea | null = tab === 'STACK' || tab === 'INTEGRATIONS' || tab === 'SECURITY' ? tab : null;
  const shown = area ? modules.filter((m) => m.area === area) : modules;
  const selected = modules.find((m) => m.id === moduleId) ?? null;
  const attention = modules.filter((m) => m.attention !== undefined && m.chip[0] !== 'ok').sort((a, b) => (a.attention ?? 9) - (b.attention ?? 9));

  const openModule = (m: SystemModule) => {
    setModuleId(m.id);
    if (!docked)
      openOverlay('OL-16', {
        module: m.title,
        module_id: m.id,
        chip: m.chip,
        summary: m.detail,
        checks: m.checks,
        env_names: m.envNames,
        detail: { overall: report?.overall_status, persistence: report?.staging_identities?.persistence_store, stripe: report?.staging_identities?.stripe_key_mode },
      });
  };

  const ids = report?.staging_identities;
  const subtitle = (
    <>
      {ids ? (
        <>
          STAGING · <span className="ws-data">{host(ids.expected_frontend_origin)}</span> · <span className="ws-data">{host(ids.expected_api_origin)}</span>
        </>
      ) : loading ? (
        'LOADING THE READINESS REPORT…'
      ) : (
        'READINESS REPORT UNAVAILABLE'
      )}
      {loadedAt ? ` · REPORT ${Math.max(0, Math.round((Date.now() - loadedAt) / 60000))} MIN AGO` : ''}
    </>
  );

  const inspector = docked && selected ? <ModuleInspector m={selected} onClose={() => setModuleId(null)} onRerun={() => void load()} busy={loading} /> : null;

  const verdict = report ? (
    <section className="verdict" aria-label="READINESS VERDICT">
      <div>
        <span className="ws-label">OVERALL · READINESS REPORT</span>
        <p className="ws-statement" style={{ marginTop: 8, fontSize: 'min(var(--ws-fs-statement),26px)' }}>
          {OVERALL_STATEMENT[report.overall_status]}
          {report.needs_founder.length ? ` — ${report.needs_founder.length} ITEM${report.needs_founder.length === 1 ? '' : 'S'} NEED YOU` : ''}
          <i className="ws-period" />
        </p>
      </div>
      <div className="verdict__chips">
        {report.needs_founder.length ? <WsChip kind="req">{report.needs_founder.length} NEEDS FOUNDER</WsChip> : null}
        {report.blocked.length ? <WsChip kind="fail">{report.blocked.length} BLOCKED</WsChip> : null}
        {report.unverified.length ? <WsChip kind="unver">{report.unverified.length} UNVERIFIED</WsChip> : null}
        <WsChip kind="ok">{report.ready.length} READY</WsChip>
        <WsButton tone="out" size="xs" icon="retry" busy={loading} onClick={() => void load()}>
          RE-RUN REPORT
        </WsButton>
      </div>
    </section>
  ) : error ? (
    <div>
      <WsBanner tone="red" icon="warning">
        THE READINESS REPORT COULD NOT LOAD. EVERY MODULE IS SHOWN AS UNVERIFIED UNTIL IT DOES. NOTHING WAS CHANGED.
      </WsBanner>
      <div className="ws-btn-row" style={{ marginTop: 12 }}>
        <WsButton icon="retry" busy={loading} onClick={() => void load()}>
          RETRY
        </WsButton>
      </div>
      <WsTechDetail action="readiness-report" message={error} open onOpen={() => openOverlay('OL-20', { action: 'readiness-report', message: error, status: 'REQUEST FAILED' })} />
    </div>
  ) : (
    <div className="verdict" aria-busy="true">
      <WsSkel w="50%" />
    </div>
  );

  const consoleTable = (
    <div className="con" role="table" aria-label="MODULES · STATUS FIRST">
      <div className="con__h" role="row">
        <span />
        <span>MODULE</span>
        <span className="c-stat">STATUS</span>
        <span className="c-cat">AREA</span>
        <span className="c-detail">DETAIL</span>
        <span className="c-checked" style={{ textAlign: 'right' }}>
          CHECKED
        </span>
      </div>
      {shown.map((m) => (
        <div
          key={m.id}
          className={`con__r ${m.id === moduleId ? 'con__r--sel' : ''}`.trim()}
          role="row"
          tabIndex={0}
          aria-selected={m.id === moduleId}
          onClick={() => openModule(m)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openModule(m);
            }
          }}
        >
          <WsIcon name={m.icon} />
          <span className="con__t">
            <b>{m.title}</b>
            <span>{m.detail}</span>
          </span>
          <span className="c-stat">
            <WsChip kind={m.chip[0]} icon={m.chip[2]}>
              {m.chip[1]}
            </WsChip>
          </span>
          <span className="c-cat ws-label">{m.area}</span>
          <span className="c-detail">{m.detail}</span>
          <span className="c-checked">{report && loadedAt ? `${Math.max(0, Math.round((Date.now() - loadedAt) / 60000))} MIN` : '—'}</span>
        </div>
      ))}
    </div>
  );

  let body;
  if (tab === 'TEST LAB') {
    body = <TestLab report={report} overlayOpen={Boolean(open)} />;
  } else if (tab === 'READINESS REPORT') {
    body = <ReadinessReport report={report} error={error} />;
  } else {
    body = (
      <div className="sys-grid" style={{ marginTop: 'var(--ws-gap)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ws-gap)', minWidth: 0 }}>
          {tab === 'OVERVIEW' ? verdict : null}
          {tab === 'STACK' && ids ? (
            <WsPanel title="ENVIRONMENT IDENTITY">
              <WsKv
                rows={[
                  ['FRONTEND', ids.expected_frontend_origin, true],
                  ['API', ids.expected_api_origin, true],
                  ['PUBLIC LINK ORIGIN', ids.effective_public_origin, true],
                  ['SUPABASE REF', ids.supabase_project_ref ?? 'UNKNOWN', true],
                ]}
              />
            </WsPanel>
          ) : null}
          {tab === 'SECURITY' && report?.database_security?.notes?.length ? (
            <WsPanel title="PROBE NOTES">
              {report.database_security.notes.map((n) => (
                <WsActivity key={n} time="" kind="idle" title={n.toUpperCase()} />
              ))}
            </WsPanel>
          ) : null}
          {consoleTable}
          <div className="ws-meta">
            API BUILD <span className="ws-data">{report?.deployment.commit_short ?? 'UNKNOWN'} · {report?.deployment.package_marker ?? '—'}</span> · ENVIRONMENT NAMES ONLY · NO SECRET VALUES ARE EVER SHOWN
          </div>
        </div>
        <aside className="sys-aside" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ws-gap)' }}>
          <WsPanel title="ATTENTION ORDER">
            {attention.length ? (
              attention.map((m, i) => <WsActivity key={m.id} time={String(i + 1)} kind={m.chip[0] === 'req' || m.chip[0] === 'fail' ? 'founder' : 'idle'} title={m.title} sub={m.chip[1]} />)
            ) : (
              <p className="ws-meta" style={{ margin: 0 }}>
                {report ? 'NOTHING NEEDS ATTENTION IN THIS REPORT.' : 'NO REPORT · ATTENTION ORDER UNKNOWN.'}
              </p>
            )}
          </WsPanel>
          {report?.needs_founder.length ? (
            <WsPanel title="NEEDS YOU · FROM THE REPORT">
              {report.needs_founder.map((l) => (
                <WsActivity key={l} time="" kind="founder" title={l.toUpperCase()} />
              ))}
            </WsPanel>
          ) : null}
        </aside>
      </div>
    );
  }

  return (
    <FounderWorkspacePageFrame
      destination="system"
      subtitle={subtitle}
      arch={<DfCornerFragment />}
      archStyle={{ right: 0, top: 14, width: 112, height: 84, opacity: 0.85 }}
      inspector={inspector}
      onInspectorClose={() => setModuleId(null)}
      density="compact"
      actions={
        tab === 'TEST LAB' ? (
          <span data-anchor="reset">
            <WsButton tone="danger" size="sm" onClick={() => openOverlay('OL-17')}>
              RESET TEST DATA…
            </WsButton>
          </span>
        ) : undefined
      }
    >
      <WsTabs label="SYSTEM VIEWS" value={tab} onChange={setTab} items={TABS.map((t) => ({ id: t, label: t }))} />
      {body}
    </FounderWorkspacePageFrame>
  );
}

function ReadinessReport({ report, error }: { report: FounderReadinessReport | null; error: string | null }) {
  if (!report) {
    return error ? (
      <div style={{ marginTop: 'var(--ws-gap)' }}>
        <WsBanner tone="red" icon="warning">
          THE READINESS REPORT COULD NOT LOAD.
        </WsBanner>
      </div>
    ) : (
      <div style={{ marginTop: 'var(--ws-gap)' }}>
        <WsSkel w="60%" />
      </div>
    );
  }
  const col = (title: string, lines: string[], kind: 'ok' | 'founder' | 'blocked' | 'idle') => (
    <WsPanel title={title} right={<span className="ws-meta">{lines.length}</span>}>
      {lines.length ? lines.map((l) => <WsActivity key={l} time="" kind={kind === 'ok' ? 'done' : kind} title={l.toUpperCase()} />) : <p className="ws-meta" style={{ margin: 0 }}>NONE</p>}
    </WsPanel>
  );
  return (
    <div className="ifw-stack" style={{ marginTop: 'var(--ws-gap)' }}>
      <div className="lab">
        {col('NEEDS FOUNDER', report.needs_founder, 'founder')}
        {col('BLOCKED', report.blocked, 'blocked')}
        {col('UNVERIFIED', report.unverified, 'idle')}
        {col('READY', report.ready, 'ok')}
      </div>
      <section className="ws-panel" style={{ overflow: 'auto' }}>
        <div className="ws-panel__h">
          <h2 className="ws-h3">CONFIGURATION · GROUPED (NAMES ONLY)</h2>
          <span className="ws-meta">ALIASES ARE NOT DUPLICATES</span>
        </div>
        <table className="lc-table">
          <thead>
            <tr>
              <th>STATUS</th>
              <th>SETTING</th>
              <th>PURPOSE</th>
              <th>STATE</th>
            </tr>
          </thead>
          <tbody>
            {report.env_var_groups.map((g) => (
              <tr key={g.id}>
                <td>
                  <WsChip kind={g.status === 'READY' ? 'ok' : g.status === 'BLOCKED' ? 'fail' : g.status === 'ACTION_REQUIRED' ? 'req' : 'unver'}>{g.status.replace(/_/g, ' ')}</WsChip>
                </td>
                <td>
                  <span className="ws-data">{g.primary}</span>
                  {g.aliases.length ? <div className="ws-meta">ALSO: {g.aliases.join(', ')}</div> : null}
                </td>
                <td className="ws-meta">{g.purpose.toUpperCase()}</td>
                <td>{g.satisfied ? 'CONFIGURED' : 'NOT SET'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <p className="ws-meta" style={{ margin: 0 }}>
        API BUILD <span className="ws-data">{report.deployment.commit_short ?? 'UNKNOWN'}</span> · {report.deployment.package_marker}
      </p>
    </div>
  );
}

/** TEST LAB — synthetic clients only. Every send goes through OL-15 (one approval tick per send). */
function TestLab({ report, overlayOpen }: { report: FounderReadinessReport | null; overlayOpen: boolean }) {
  const { openOverlay, pushToast } = useFounderWorkspaceOverlay();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('Founder E2E Client');
  const [journey, setJourney] = useState<TestJourney | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<TestInvitationPreview | null>(null);

  const refreshJourney = useCallback(async (id: string) => setJourney(await foundationReadinessApi.testJourney(id)), []);

  // After OL-15 / OL-17 close, re-read the journey from the server.
  const [was, setWas] = useState(false);
  useEffect(() => {
    if (overlayOpen) setWas(true);
    else if (was) {
      setWas(false);
      if (journey) void refreshJourney(journey.artifact_id).catch(() => setJourney(null));
    }
  }, [overlayOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusy(null);
    }
  };

  const testMode = report?.env.founder_test_mode;
  const step = (n: string, t: string, s: string, done: boolean, next: boolean, action: ReactNode) => (
    <div className="task" role="row">
      <span className="ws-idx">{n}</span>
      <span className="task__t">
        <b>{t}</b>
        <span style={{ textTransform: 'uppercase' }}>{s}</span>
      </span>
      <span className="task__s">
        <span className={`ws-st ws-st--${done ? 'done' : next ? 'founder' : 'idle'}`}>
          <span className={`ws-mk ws-mk--${done ? 'done' : next ? 'founder' : 'idle'}`} aria-hidden="true" />
          <span>{done ? 'DONE' : next ? 'NEXT' : 'WAITING'}</span>
        </span>
        {action}
      </span>
    </div>
  );

  const intakeDone = journey ? journey.intake_state === 'COMPLETE' : false;
  const quoteDone = journey ? ['QUOTE_READY', 'AWAITING_ACCEPTANCE', 'AWAITING_PAYMENT', 'PAID'].includes(journey.state) : false;

  return (
    <div style={{ marginTop: 'var(--ws-gap)' }}>
      {report && !testMode ? (
        <div style={{ marginBottom: 12 }}>
          <WsBanner tone="policy" icon="lock">
            FOUNDER TEST MODE IS OFF ON THIS API · SYNTHETIC ACTIONS WILL BE REFUSED BY THE SERVER.
          </WsBanner>
        </div>
      ) : null}
      {error ? (
        <div style={{ marginBottom: 12 }}>
          <WsBanner tone="red" icon="warning">
            NOT DONE — <span className="ws-data">{error}</span>
          </WsBanner>
        </div>
      ) : null}
      <div className="lab">
        <WsPanel title="SYNTHETIC CLIENT" right={<WsChip kind="test">SYNTHETIC</WsChip>}>
          {journey ? (
            <div style={{ display: 'grid', gap: 12 }}>
              <WsIdent name={name.toUpperCase()} sub={`TEST CLIENT · ${journey.state.replace(/_/g, ' ')}`} size="sm" />
              <WsKv
                rows={[
                  ['ARTIFACT', journey.artifact_id, true],
                  ['LINK', journey.token_masked, true],
                  ['SURFACE', journey.surface.replace(/_/g, ' ')],
                  ['EVENTS', String(journey.event_count)],
                ]}
              />
              <div className="ws-btn-row">
                <a className="ws-btn ws-btn--out ws-btn--sm" href={journey.personalized_url} target="_blank" rel="noreferrer">
                  <WsIcon name="external" />
                  <span>OPEN CLIENT LINK</span>
                </a>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              <WsField label="TEST RECIPIENT" req hint="MUST BE ON THE API ALLOWLIST · REAL CLIENTS CAN NEVER BE USED HERE">
                <WsInput value={email} onChange={setEmail} type="email" inputMode="email" placeholder="ALLOWLISTED ADDRESS" ariaLabel="TEST RECIPIENT" />
              </WsField>
              <WsField label="DISPLAY NAME">
                <WsInput value={name} onChange={setName} ariaLabel="DISPLAY NAME" />
              </WsField>
              <div className="ws-btn-row">
                <WsButton
                  size="sm"
                  icon="add"
                  busy={busy === 'create'}
                  disabled={!email.trim()}
                  onClick={() =>
                    void run('create', async () => {
                      const res = await foundationReadinessApi.createTestClient({ contact_email: email.trim(), display_name: name.trim() });
                      await refreshJourney(res.artifact.artifact_id);
                      pushToast('TEST CLIENT CREATED · CONFIRMED BY THE SERVER', 'ok');
                    })
                  }
                >
                  CREATE TEST CLIENT
                </WsButton>
              </div>
            </div>
          )}
        </WsPanel>

        <section className="ws-panel">
          <div className="ws-panel__h">
            <h2 className="ws-h3">JOURNEY</h2>
            <span className="ws-meta">{journey ? `${[true, intakeDone, quoteDone].filter(Boolean).length} OF 3` : 'NO TEST CLIENT'}</span>
          </div>
          <div className="ws-panel__b ws-panel__b--flush">
            {step('01', 'CREATE TEST CLIENT', 'ARTIFACT + PERSONAL LINK · NO EMAIL', Boolean(journey), !journey, null)}
            {step(
              '02',
              'SUBMIT INTAKE (TEST)',
              'ADVANCE-TEST-INTAKE · FICTIONAL ANSWERS',
              intakeDone,
              Boolean(journey) && !intakeDone,
              <WsButton size="xs" tone={journey && !intakeDone ? '' : 'out'} disabled={!journey || intakeDone} busy={busy === 'intake'} onClick={() => journey && void run('intake', async () => setJourney(await foundationReadinessApi.advanceTestIntake(journey.artifact_id)))}>
                RUN
              </WsButton>,
            )}
            {step(
              '03',
              'QUOTE READY + QUEUE EMAIL',
              'QUEUES THE LIFECYCLE EMAIL · SEND STAYS GATED',
              quoteDone,
              intakeDone && !quoteDone,
              <WsButton size="xs" tone={intakeDone && !quoteDone ? '' : 'out'} disabled={!journey || !intakeDone || quoteDone} busy={busy === 'quote'} onClick={() => journey && void run('quote', async () => setJourney(await foundationReadinessApi.advanceTestQuote(journey.artifact_id)))}>
                RUN
              </WsButton>,
            )}
          </div>
        </section>

        <WsPanel title="EMAIL EVENTS" right={<span className="ws-meta">{journey ? `${journey.email_events.length} RECORDED` : <WsGap id="G-09" />}</span>}>
          {journey?.email_events.length ? (
            journey.email_events.map((ev) => {
              const [k, l] = intentChip(ev.status);
              const sendable = ev.status === 'QUEUED' || ev.status === 'DRY_RUN' || ev.status === 'SIMULATED';
              return (
                <div key={ev.intent_id} style={{ padding: '8px 0', borderBottom: '1px solid var(--ws-hair)', display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                    <span className="ws-name ws-1l">{ev.template_id.replace(/-/g, ' ').toUpperCase()}</span>
                    <WsChip kind={k}>{l}</WsChip>
                  </div>
                  <span className="ws-meta">
                    {ev.event_type} · {ev.recipient_email}
                    {ev.provider_message_id ? ` · PROVIDER ${ev.provider_message_id}` : ''}
                  </span>
                  {sendable ? (
                    <div className="ws-btn-row">
                      {ev.template_id === 'personal-foundation-invitation' ? (
                        <WsButton
                          tone="out"
                          size="xs"
                          busy={busy === `prep-${ev.intent_id}`}
                          onClick={() =>
                            void run(`prep-${ev.intent_id}`, async () => {
                              setPreview(await foundationReadinessApi.prepareTestInvitation(ev.intent_id));
                            })
                          }
                        >
                          PREPARE PREVIEW
                        </WsButton>
                      ) : null}
                      <span data-anchor="sendtest">
                        <WsButton tone="out" size="xs" icon="lock" onClick={() => openOverlay('OL-15', { intent_id: ev.intent_id, template_id: ev.template_id, recipient: ev.recipient_email, artifact_id: journey.artifact_id, status: ev.status })}>
                          SEND TEST…
                        </WsButton>
                      </span>
                    </div>
                  ) : null}
                </div>
              );
            })
          ) : (
            <p className="ws-meta" style={{ margin: 0 }}>
              {journey ? 'NO EMAIL INTENT YET · RUN STEP 03 TO QUEUE ONE.' : 'CREATE A TEST CLIENT TO RECORD EMAIL EVENTS.'}
            </p>
          )}
          {preview ? (
            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              <span className="ws-label">INVITATION PREVIEW · NO SEND</span>
              <WsKv
                rows={[
                  ['SUBJECT', preview.subject],
                  ['TO', preview.recipient_masked, true],
                  ['FROM', preview.from_identity, true],
                  ['LINK VALID', preview.invitation_link_valid ? 'YES' : 'NO'],
                  ['ORIGIN', preview.configured_public_origin, true],
                  ['READY TO SEND', preview.ready_to_send ? 'YES' : 'NO'],
                ]}
              />
              {preview.blockers.map((b) => (
                <WsActivity key={b} time="" kind="blocked" title={b.toUpperCase()} />
              ))}
            </div>
          ) : null}
        </WsPanel>

        <WsPanel title="CONTINUITY CHECKS" right={<span className="ws-meta">FD-W18</span>}>
          {['RESTART · ARTIFACT SURVIVES', 'LINK RESOLVES AFTER RESTART', 'INTAKE RESUMES FROM SAVE'].map((t) => (
            <div key={t} className="ifw-check-row">
              <span className="ws-meta">{t}</span>
              <WsChip kind="unver">UNVERIFIED</WsChip>
            </div>
          ))}
        </WsPanel>
      </div>
    </div>
  );
}
