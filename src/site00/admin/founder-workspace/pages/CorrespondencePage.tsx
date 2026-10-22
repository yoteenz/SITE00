import { useCallback, useEffect, useMemo, useState } from 'react';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { SITE00_ROUTES } from '../../../config/routes';
import { foundationAdminApi, type FoundationAdminListRow, type PipelineRow } from '../../services/foundationAdminApi';
import { IDNTY_FOUNDER_WORKSPACE_ROUTES } from '../config/routes';
import { toFoundationRows, type FoundationRow } from '../data/foundationViews';
import { intentChip } from '../data/emailIntents';
import { age } from '../data/lifecycle';
import { useFounderWorkspaceOverlay } from '../overlay/OverlayContext';
import { FounderWorkspacePageFrame } from '../shell/FounderWorkspacePageFrame';
import { useMediaQuery } from '../shell/useWorkspaceTier';
import {
  WsBanner,
  WsButton,
  WsChip,
  WsEmpty,
  WsIconButton,
  WsIdent,
  WsKv,
  WsLinkButton,
  WsPlate,
  WsSearch,
  WsSkel,
  WsTabs,
  WsTechDetail,
} from '../shell/wsKit';

type Message = { message_id?: string; author_role?: string; body?: string; created_at?: string; delivery_state?: string; read_by_client_at?: string | null };
type Intent = { intent_id?: string; artifact_id?: string; event_type?: string; template_id?: string; status?: string; created_at?: string; recipient_email?: string; last_error?: string | null };
type View = 'MESSAGES' | 'LIFECYCLE';

const human = (s: string | null | undefined) => (s ? s.replace(/[_-]/g, ' ').toUpperCase() : '—');

/**
 * 05 CORRESPONDENCE — OPUS2 D-11 · TP-08 · TL-08: views (messages · lifecycle email), thread index | thread | context.
 * Reads stored portal messages and recorded send intents only. Sending stays behind OL-14 (portal message) and the
 * gated OL-15; staging transactional email is not enabled here and no sent history is invented.
 */
export function CorrespondencePage() {
  const { openOverlay, open } = useFounderWorkspaceOverlay();
  const threadVisible = useMediaQuery('(min-width: 1000px)');
  const [view, setView] = useState<View>('MESSAGES');
  const [artifacts, setArtifacts] = useState<FoundationAdminListRow[] | null>(null);
  const [pipeline, setPipeline] = useState<PipelineRow[]>([]);
  const [events, setEvents] = useState<Intent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timelineError, setTimelineError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [msgError, setMsgError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = useCallback(() => {
    setError(null);
    void Promise.allSettled([foundationAdminApi.list(), foundationAdminApi.pipeline()]).then(([list, pipe]) => {
      if (list.status === 'fulfilled') setArtifacts(list.value.artifacts ?? []);
      else setError(list.reason instanceof Error ? list.reason.message : 'Load failed');
      setPipeline(pipe.status === 'fulfilled' ? (pipe.value.rows ?? []) : []);
    });
    void foundationAdminApi
      .emailTimeline()
      .then((j) => {
        setEvents((j.events as Intent[]) ?? []);
        setTimelineError(null);
      })
      .catch((e) => {
        setEvents([]);
        setTimelineError(e instanceof Error ? e.message : 'Timeline load failed');
      });
  }, []);
  useEffect(load, [load]);

  const rows = useMemo(() => toFoundationRows(artifacts ?? [], pipeline), [artifacts, pipeline]);
  const nameById = useMemo(() => new Map(rows.map((r) => [r.artifact_id, r.name])), [rows]);
  const threads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => !q || r.name.toLowerCase().includes(q)).sort((a, b) => Date.parse(b.lastIso) - Date.parse(a.lastIso));
  }, [rows, query]);
  const current: FoundationRow | null = threads.find((r) => r.artifact_id === selectedId) ?? (threadVisible ? threads[0] : null) ?? null;

  // The messages endpoint marks the thread read for the founder, so it is called only when the thread is on screen.
  const showThread = Boolean(current) && (threadVisible || opened);
  const loadMessages = useCallback((id: string) => {
    setMessages(null);
    setMsgError(null);
    void foundationAdminApi
      .messages(id)
      .then((j) => setMessages((j.messages as Message[]) ?? []))
      .catch((e) => {
        setMessages([]);
        setMsgError(e instanceof Error ? e.message : 'Messages failed');
      });
  }, []);
  useEffect(() => {
    if (showThread && current) loadMessages(current.artifact_id);
  }, [showThread, current?.artifact_id, loadMessages]); // eslint-disable-line react-hooks/exhaustive-deps

  const [wasOpen, setWasOpen] = useState(false);
  useEffect(() => {
    if (open) setWasOpen(true);
    else if (wasOpen) {
      setWasOpen(false);
      if (showThread && current) loadMessages(current.artifact_id);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const lastIntent = (id: string) => (events ?? []).filter((e) => e.artifact_id === id).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0];
  const dryRuns = (events ?? []).filter((e) => e.status === 'DRY_RUN').length;
  const sortedEvents = [...(events ?? [])].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

  const compose = () => current && openOverlay('OL-14', { artifact_id: current.artifact_id, business_name: current.name });

  let body;
  if (error && !artifacts) {
    body = (
      <>
        <WsBanner tone="red" icon="warning">
          CORRESPONDENCE COULD NOT LOAD · THE FOUNDATION LIST REQUEST FAILED. NOTHING WAS CHANGED.
        </WsBanner>
        <div className="ws-btn-row" style={{ marginTop: 12 }}>
          <WsButton icon="retry" onClick={load}>
            RETRY
          </WsButton>
        </div>
        <WsTechDetail action="list · email-timeline" message={error} open onOpen={() => openOverlay('OL-20', { action: 'list · email-timeline', message: error, status: 'REQUEST FAILED' })} />
      </>
    );
  } else if (view === 'LIFECYCLE') {
    body = (
      <>
        {timelineError ? (
          <WsBanner tone="red" icon="warning">
            THE EMAIL TIMELINE COULD NOT LOAD · <span className="ws-data">{timelineError}</span>
          </WsBanner>
        ) : (
          <WsBanner tone="policy" icon="lock">
            LIFECYCLE EMAIL FOLLOWS THE SEND POLICY IN 07 SYSTEM. {dryRuns ? `${dryRuns} INTENT${dryRuns === 1 ? ' IS' : 'S ARE'} RECORDED AS DRY RUN — NOTHING WAS SENT FOR THOSE.` : 'ONLY RECORDED INTENTS ARE LISTED; NOTHING IS SENT FROM THIS PAGE.'}
          </WsBanner>
        )}
        {events === null ? (
          <div className="ws-panel" style={{ marginTop: 14, padding: 16 }}>
            <WsSkel w="70%" />
          </div>
        ) : sortedEvents.length ? (
          <div className="ws-panel" style={{ marginTop: 14, overflow: 'auto' }}>
            <table className="lc-table">
              <thead>
                <tr>
                  <th>CLIENT</th>
                  <th>TEMPLATE</th>
                  <th>TRIGGER</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>WHEN</th>
                </tr>
              </thead>
              <tbody>
                {sortedEvents.map((e, i) => {
                  const [k, l] = intentChip(e.status);
                  const n = nameById.get(String(e.artifact_id)) ?? `FOUNDATION ${String(e.artifact_id ?? '').slice(0, 6).toUpperCase()}`;
                  return (
                    <tr key={e.intent_id ?? i}>
                      <td>
                        <WsIdent name={n} sub={e.recipient_email ?? '—'} size="xs" />
                      </td>
                      <td>{human(e.template_id)}</td>
                      <td>
                        <span className="ws-data ws-meta">{e.event_type ?? '—'}</span>
                      </td>
                      <td>
                        <WsChip kind={k}>{l}</WsChip>
                      </td>
                      <td className="ws-meta" style={{ textAlign: 'right' }}>
                        {age(e.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ marginTop: 14 }}>
            <WsEmpty label="NO LIFECYCLE EMAIL" title="NO SEND INTENT IS RECORDED">
              INTENTS ARE RECORDED WHEN A LIFECYCLE EVENT HAPPENS (INVITATION, INTAKE COMPLETED, QUOTE READY). NONE EXIST ON THIS ENVIRONMENT YET.
            </WsEmpty>
          </div>
        )}
      </>
    );
  } else if (artifacts === null) {
    body = (
      <div className="ws-panel" style={{ padding: 16 }} aria-busy="true">
        <WsSkel w="60%" />
      </div>
    );
  } else if (!rows.length) {
    body = (
      <WsEmpty label="NO THREADS" title="NO FOUNDATION TO WRITE TO">
        A PORTAL THREAD EXISTS FOR EVERY FOUNDATION. CREATE A FOUNDATION FIRST.
      </WsEmpty>
    );
  } else {
    const intent = current ? lastIntent(current.artifact_id) : undefined;
    const [ik, il] = intentChip(intent?.status);
    body = (
      <div className={`wb ${opened ? 'wb--detail' : ''}`.trim()} style={{ margin: '0 calc(var(--ws-gutter) * -1)' }}>
        <div className="wb__queue">
          <div className="wb__pane-h">
            <span className="ws-label">THREADS · {threads.length}</span>
          </div>
          <div style={{ padding: '10px var(--ws-cell)' }}>
            <WsSearch value={query} onChange={setQuery} placeholder="CLIENT NAME" kbd="" ariaLabel="SEARCH THREADS" />
          </div>
          {threads.map((r) => {
            const sel = r.artifact_id === current?.artifact_id;
            const li = lastIntent(r.artifact_id);
            return (
              <div
                key={r.artifact_id}
                className={`q-item ${sel ? 'q-item--sel' : ''}`.trim()}
                role="option"
                aria-selected={sel}
                tabIndex={0}
                onClick={() => {
                  setSelectedId(r.artifact_id);
                  setOpened(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedId(r.artifact_id);
                    setOpened(true);
                  }
                }}
              >
                <WsPlate name={r.name} size="sm" />
                <span className="ws-who">
                  <b>{r.name}</b>
                  <span>{r.life.label}</span>
                </span>
                <span className="ws-meta">{r.last}</span>
                <span className="q-item__why">
                  {li ? (
                    <>
                      <span className="ws-meta ws-1l">{human(li.template_id)}</span>
                      <span>
                        <WsChip kind={intentChip(li.status)[0]}>{intentChip(li.status)[1]}</WsChip>
                      </span>
                    </>
                  ) : (
                    <span className="ws-meta">NO LIFECYCLE EMAIL RECORDED</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
        <div className="wb__ctx" style={{ display: 'flex', flexDirection: 'column' }}>
          {current ? (
            <>
              <div className="wb__pane-h" style={{ background: '#fff' }}>
                <span className="ws-ident">
                  {opened ? (
                    <span className="ifw-wb-back">
                      <WsIconButton icon="back" label="BACK TO THREADS" onClick={() => setOpened(false)} />
                    </span>
                  ) : null}
                  <WsPlate name={current.name} size="xs" />
                  <span className="ws-label" style={{ color: 'var(--ws-ink)' }}>
                    {current.name} · PORTAL
                  </span>
                </span>
                <span className="ws-meta">{messages ? `${messages.length} MESSAGES` : ''}</span>
              </div>
              <div style={{ flex: '1 1 auto', overflow: 'auto' }}>
                {msgError ? (
                  <div style={{ padding: 18 }}>
                    <WsBanner tone="red" icon="warning">
                      THE THREAD COULD NOT LOAD · <span className="ws-data">{msgError}</span>
                    </WsBanner>
                  </div>
                ) : messages === null ? (
                  <div className="thread" aria-busy="true">
                    <WsSkel w="60%" />
                  </div>
                ) : messages.length ? (
                  <div className="thread">
                    {messages.map((m, i) => {
                      const me = m.author_role === 'FOUNDER';
                      return (
                        <div key={m.message_id ?? i} className={`msg ${me ? 'msg--me' : ''}`.trim()}>
                          <span className="ws-label">
                            {me ? 'SITE 00' : `CLIENT · ${current.name}`} · {m.created_at ? age(m.created_at) : '—'}
                            {m.delivery_state === 'FAILED' ? ' · NOT DELIVERED' : ''}
                          </span>
                          <p className="ws-read" style={{ marginBottom: 0 }}>
                            {m.body ?? ''}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="thread">
                    <p className="ws-meta" style={{ margin: 0 }}>
                      NO PORTAL MESSAGES IN THIS THREAD YET.
                    </p>
                  </div>
                )}
              </div>
              <div className="composer">
                <button type="button" className="ws-input ws-input--ph" style={{ textAlign: 'left' }} onClick={compose}>
                  WRITE A PORTAL MESSAGE
                </button>
                <WsButton arrow onClick={compose}>
                  WRITE
                </WsButton>
              </div>
            </>
          ) : null}
        </div>
        <div className="wb__dec">
          {current ? (
            <>
              <div className="ctx-sec">
                <WsIdent name={current.name} sub={current.life.label} size="" />
              </div>
              <div className="ctx-sec">
                <WsKv
                  rows={[
                    ['STAGE', current.life.label],
                    ['NEXT', current.life.action],
                    ['LAST EMAIL', intent ? `${human(intent.template_id)} · ${il}` : 'NONE RECORDED'],
                    ['RECIPIENT', intent?.recipient_email ?? '—', Boolean(intent?.recipient_email)],
                  ]}
                />
                {intent ? (
                  <div style={{ marginTop: 10 }}>
                    <WsChip kind={ik}>{il}</WsChip>
                  </div>
                ) : null}
              </div>
              <div className="ctx-sec">
                <WsBanner tone="policy" icon="lock">
                  PORTAL MESSAGES GO TO THE CLIENT PORTAL ONLY. LIFECYCLE EMAIL IS GOVERNED BY THE SEND POLICY; TEST SENDS NEED THE APPROVAL TICK (OL-15).
                </WsBanner>
                <div className="ws-btn-row" style={{ marginTop: 12 }}>
                  <WsButton tone="out" size="sm" icon="lock" onClick={() => openOverlay('OL-15', { artifact_id: current.artifact_id, business_name: current.name })}>
                    SEND GATE
                  </WsButton>
                  <WsLinkButton tone="ghost" size="sm" icon="external" to={IDNTY_FOUNDER_WORKSPACE_ROUTES.client(current.artifact_id)}>
                    RECORD
                  </WsLinkButton>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <FounderWorkspacePageFrame
      destination="correspondence"
      subtitle={`PORTAL MESSAGES · LIFECYCLE EMAIL${events ? ` · ${events.length} RECORDED INTENTS` : ''}`}
      hideActionsOnPhone
      flush={view === 'MESSAGES'}
      actions={
        <>
          <WsLinkButton tone="out" size="sm" icon="external" to={SITE00_ADMIN_ROUTES.correspondenceStudio}>
            TEMPLATES · STUDIO
          </WsLinkButton>
          <WsLinkButton tone="ghost" size="sm" to={SITE00_ROUTES.digitalFoundationCommunications}>
            COMMUNICATIONS COMMAND
          </WsLinkButton>
        </>
      }
    >
      <div style={{ paddingBottom: 12 }}>
        <WsTabs
          label="CORRESPONDENCE VIEWS"
          value={view}
          onChange={(v) => {
            setView(v);
            setOpened(false);
          }}
          items={[
            { id: 'MESSAGES', label: 'MESSAGES', count: rows.length || '' },
            { id: 'LIFECYCLE', label: 'LIFECYCLE EMAIL', count: events?.length || '' },
          ]}
        />
      </div>
      {body}
    </FounderWorkspacePageFrame>
  );
}

