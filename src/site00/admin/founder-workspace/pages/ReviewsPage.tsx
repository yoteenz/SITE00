import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ApprovalRecord, DigitalFoundationArtifactPayload } from '../../../../../shared/site00-digital-foundation/types.js';
import { foundationAdminApi, type FoundationAdminListRow, type PipelineRow } from '../../services/foundationAdminApi';
import { IDNTY_FOUNDER_WORKSPACE_ROUTES } from '../config/routes';
import { toFoundationRows, type FoundationRow } from '../data/foundationViews';
import { age } from '../data/lifecycle';
import { useFounderWorkspaceOverlay } from '../overlay/OverlayContext';
import { FounderWorkspacePageFrame } from '../shell/FounderWorkspacePageFrame';
import {
  WsActivity,
  WsBanner,
  WsButton,
  WsChip,
  WsChoice,
  WsEmpty,
  WsField,
  WsIconButton,
  WsIdent,
  WsKv,
  WsLinkButton,
  WsPlate,
  WsSkel,
  WsStatus,
  WsTabs,
  WsTechDetail,
  WsTextarea,
  type WsKind,
} from '../shell/wsKit';

type ReviewType = 'INTAKE' | 'QUOTE' | 'REQUEST' | 'EXCEPTION';
type ReviewItem = { row: FoundationRow; type: ReviewType; why: string; sub: string; kind: WsKind };
type Category = 'ALL' | ReviewType;

const money = (minor: number | null | undefined) => (minor === null || minor === undefined ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(minor / 100));
const human = (s: string | null | undefined) => (s ? s.replace(/_/g, ' ').toUpperCase() : '—');

/** Reviews queue = every foundation whose next move is the founder's, or whose pipeline asks for review / approval. */
function toReviewItems(rows: FoundationRow[], pipeline: PipelineRow[]): ReviewItem[] {
  const pipeById = new Map(pipeline.map((p) => [p.artifact_id, p]));
  const out: ReviewItem[] = [];
  for (const row of rows) {
    const p = pipeById.get(row.artifact_id);
    const next = (p?.next_action ?? '').toLowerCase();
    const stage = (p?.current_stage ?? '').toLowerCase();
    const flagged = next.includes('review') || next.includes('approval') || stage.includes('quote');
    if (row.life.kind === 'blocked' && (row.life.owner === 'FOUNDER' || p?.blocker)) {
      out.push({ row, type: 'EXCEPTION', why: row.life.label, sub: row.life.action, kind: 'blocked' });
    } else if (row.state === 'INTAKE_COMPLETE') {
      out.push({ row, type: 'INTAKE', why: 'INTAKE COMPLETE', sub: 'AWAITING YOUR REVIEW', kind: 'founder' });
    } else if (row.state === 'RECOMMENDATION_READY' || row.state === 'QUOTE_READY') {
      out.push({ row, type: 'QUOTE', why: row.state === 'QUOTE_READY' ? 'QUOTE NOT YET APPROVED' : 'RECOMMENDATION READY', sub: row.life.action, kind: 'founder' });
    } else if (next.includes('approval')) {
      out.push({ row, type: 'REQUEST', why: 'APPROVAL REQUESTED', sub: p?.next_action?.toUpperCase() ?? '', kind: 'founder' });
    } else if (row.life.kind === 'founder' || flagged) {
      out.push({ row, type: stage.includes('quote') ? 'QUOTE' : 'REQUEST', why: row.life.label, sub: (p?.next_action ?? row.life.action).toUpperCase(), kind: 'founder' });
    }
  }
  // Oldest first: the decision that has waited longest leads.
  return out.sort((a, b) => Date.parse(a.row.lastIso) - Date.parse(b.row.lastIso));
}

/**
 * 03 REVIEWS — OPUS2 D-08/09 · TP-06 · TL-06 · C-06: categories, queue | context | decision workbench.
 * Approval success is shown only after the server confirms (approval-resolve resolves); counts are real.
 * Triggers kept: OL-11 request revision · OL-08 approve quote · OL-09 revise quote.
 */
export function ReviewsPage() {
  const { openOverlay, pushToast, open } = useFounderWorkspaceOverlay();
  const [artifacts, setArtifacts] = useState<FoundationAdminListRow[] | null>(null);
  const [pipeline, setPipeline] = useState<PipelineRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DigitalFoundationArtifactPayload | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [list, pipe] = await Promise.all([foundationAdminApi.list(), foundationAdminApi.pipeline()]);
      setArtifacts(list.artifacts ?? []);
      setPipeline(pipe.rows ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const items = useMemo(() => toReviewItems(toFoundationRows(artifacts ?? [], pipeline), pipeline), [artifacts, pipeline]);
  const visible = category === 'ALL' ? items : items.filter((i) => i.type === category);
  const current = visible.find((i) => i.row.artifact_id === selectedId) ?? visible[0] ?? null;
  const count = (t: ReviewType) => items.filter((i) => i.type === t).length;

  const loadDetail = useCallback((id: string) => {
    setDetail(null);
    setDetailError(null);
    void foundationAdminApi
      .detail(id)
      .then((j) => setDetail(j as DigitalFoundationArtifactPayload))
      .catch((e) => setDetailError(e instanceof Error ? e.message : 'Detail failed'));
  }, []);

  useEffect(() => {
    if (current) loadDetail(current.row.artifact_id);
  }, [current?.row.artifact_id, loadDetail]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload after an overlay (OL-08 / OL-09 / OL-11) closes so the queue reflects the server.
  const [wasOpen, setWasOpen] = useState(false);
  useEffect(() => {
    if (open) setWasOpen(true);
    else if (wasOpen) {
      setWasOpen(false);
      void load();
      if (current) loadDetail(current.row.artifact_id);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (id: string) => {
    setSelectedId(id);
    setOpened(true);
  };

  const oldest = items[0] ? age(items[0].row.lastIso) : null;
  const subtitle = artifacts === null && !error ? 'LOADING THE QUEUE…' : error && !artifacts ? 'THE QUEUE COULD NOT LOAD' : `${items.length} DECISION${items.length === 1 ? '' : 'S'} WAITING${oldest ? ` · OLDEST ${oldest}` : ''}`;

  const tabs = (
    <div style={{ paddingBottom: 12 }}>
      <WsTabs
        label="REVIEW CATEGORIES"
        value={category}
        onChange={(c) => {
          setCategory(c);
          setOpened(false);
        }}
        items={[
          { id: 'ALL', label: 'ALL', count: items.length },
          { id: 'INTAKE', label: 'INTAKES', count: count('INTAKE') || '' },
          { id: 'QUOTE', label: 'QUOTES', count: count('QUOTE') || '' },
          { id: 'REQUEST', label: 'REQUESTS', count: count('REQUEST') || '' },
          { id: 'EXCEPTION', label: 'EXCEPTIONS', count: count('EXCEPTION') || '' },
        ]}
      />
    </div>
  );

  let body;
  if (error && !artifacts) {
    body = (
      <>
        <WsBanner tone="red" icon="warning">
          THE REVIEW QUEUE COULD NOT LOAD. NOTHING WAS CHANGED.
        </WsBanner>
        <div className="ws-btn-row" style={{ marginTop: 12 }}>
          <WsButton icon="retry" onClick={() => void load()}>
            RETRY
          </WsButton>
        </div>
        <WsTechDetail action="list · pipeline" message={error} open onOpen={() => openOverlay('OL-20', { action: 'list · pipeline', message: error, status: 'REQUEST FAILED' })} />
      </>
    );
  } else if (artifacts === null) {
    body = (
      <div className="wb" style={{ margin: '0 calc(var(--ws-gutter) * -1)' }} aria-busy="true">
        <div className="wb__queue">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="q-item">
              <span className="ws-plate ws-plate--sm" />
              <WsSkel w="70%" />
            </div>
          ))}
        </div>
      </div>
    );
  } else if (!visible.length) {
    body = (
      <WsEmpty label={category === 'ALL' ? 'QUEUE CLEAR' : 'NOTHING IN THIS CATEGORY'} title="NO DECISION IS WAITING ON YOU">
        INTAKES, QUOTES, CLIENT REQUESTS AND EXCEPTIONS ARRIVE HERE WHEN THE FOUNDER HOLDS THE NEXT MOVE.
      </WsEmpty>
    );
  } else {
    body = (
      <>
        <div className={`wb wb--decide ${opened ? 'wb--detail' : ''}`.trim()} style={{ margin: '0 calc(var(--ws-gutter) * -1)' }}>
          <div className="wb__queue" role="listbox" aria-label="REVIEW QUEUE">
            <div className="wb__pane-h">
              <span className="ws-label">QUEUE · OLDEST FIRST</span>
              <span className="ws-meta">
                {visible.length} OF {items.length}
              </span>
            </div>
            {visible.map((i) => {
              const sel = i.row.artifact_id === current?.row.artifact_id;
              return (
                <div
                  key={i.row.artifact_id}
                  className={`q-item ${sel ? 'q-item--sel' : ''}`.trim()}
                  role="option"
                  aria-selected={sel}
                  tabIndex={0}
                  onClick={() => pick(i.row.artifact_id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      pick(i.row.artifact_id);
                    }
                  }}
                >
                  <WsPlate name={i.row.name} attn={i.kind === 'founder'} size="sm" />
                  <span className="ws-who">
                    <b>{i.row.name}</b>
                    <span>{i.type} REVIEW</span>
                  </span>
                  <span className="ws-meta ws-num-tab">{i.row.last}</span>
                  <span className="q-item__why">
                    <WsStatus kind={i.kind}>{i.why}</WsStatus>
                    <span className="ws-meta">{i.sub}</span>
                  </span>
                </div>
              );
            })}
          </div>
          <div className="wb__ctx">
            <div className="wb__pane-h" style={{ background: '#fff' }}>
              <span className="ws-btn-row" style={{ gap: 4 }}>
                {opened ? (
                  <span className="ifw-wb-back">
                    <WsIconButton icon="back" label="BACK TO QUEUE" onClick={() => setOpened(false)} />
                  </span>
                ) : null}
                <span className="ws-label">CONTEXT · {current?.type}</span>
              </span>
              {current ? (
                <WsLinkButton tone="ghost" size="xs" icon="external" to={IDNTY_FOUNDER_WORKSPACE_ROUTES.client(current.row.artifact_id)}>
                  OPEN RECORD
                </WsLinkButton>
              ) : null}
            </div>
            {current ? <ReviewContext item={current} detail={detail} error={detailError} /> : null}
          </div>
          <div className="wb__dec">{current ? <Decision item={current} detail={detail} onDone={() => void load().then(() => loadDetail(current.row.artifact_id))} pushToast={pushToast} openOverlay={openOverlay} /> : null}</div>
        </div>
        {opened && current ? (
          <div className="wb-mbar">
            <MobileBar item={current} detail={detail} openOverlay={openOverlay} />
          </div>
        ) : null}
      </>
    );
  }

  return (
    <FounderWorkspacePageFrame destination="reviews" subtitle={subtitle} hideActionsOnPhone flush>
      {tabs}
      {body}
    </FounderWorkspacePageFrame>
  );
}

function pendingApprovals(detail: DigitalFoundationArtifactPayload | null): ApprovalRecord[] {
  return (detail?.approvals ?? []).filter((a) => a.status === 'REQUESTED');
}

function ReviewContext({ item, detail, error }: { item: ReviewItem; detail: DigitalFoundationArtifactPayload | null; error: string | null }) {
  if (error) {
    return (
      <div className="ctx-sec">
        <WsBanner tone="red" icon="warning">
          THE RECORD DETAIL COULD NOT LOAD · THE DECISION STAYS DISABLED UNTIL IT DOES.
        </WsBanner>
        <WsTechDetail action={`detail · ${item.row.artifact_id}`} message={error} />
      </div>
    );
  }
  if (!detail) {
    return (
      <div className="ctx-sec" aria-busy="true">
        <WsSkel w="50%" />
        <div style={{ height: 10 }} />
        <WsSkel w="80%" />
      </div>
    );
  }
  const intake = detail.artifact.intake ?? ({} as DigitalFoundationArtifactPayload['artifact']['intake']);
  const q = detail.quote;
  const rec = detail.recommendation;
  const approvals = pendingApprovals(detail);
  return (
    <>
      <div className="ctx-sec">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
          <WsIdent name={item.row.name} sub={item.row.life.label} attn={item.kind === 'founder'} size="" />
          <span className="ws-meta">{item.row.last === '—' ? '' : `${item.row.last} AGO`}</span>
        </div>
        <div style={{ marginTop: 14 }}>
          <WsStatus kind={item.kind}>{item.why}</WsStatus>
        </div>
      </div>
      {item.type === 'QUOTE' && q ? (
        <div className="ctx-sec">
          <span className="ws-label">QUOTE REVIEW · {item.row.name}</span>
          <h2 className="ws-h2" style={{ marginTop: 10 }}>
            QUOTE V{q.quote_version} — {money(q.subtotal_minor)}
            <i className="ws-period" />
          </h2>
          <table className="qt" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>ITEM</th>
                <th className="n">QTY</th>
                <th className="n">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>BASE DIGITAL FOUNDATION</td>
                <td className="n">1</td>
                <td className="n">{money(q.base_price_minor)}</td>
              </tr>
              {q.selected_addons.map((l) => (
                <tr key={l.addon_id}>
                  <td>
                    {human(l.addon_id)}
                    {l.requires_manual_review ? ' · MANUAL' : ''}
                  </td>
                  <td className="n">{l.quantity}</td>
                  <td className="n">{money(l.line_total_minor)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="tot">
                <td>SUBTOTAL</td>
                <td className="n" colSpan={2}>
                  {money(q.subtotal_minor)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : null}
      <div className="ctx-sec">
        <div className="ws-sechead">
          <h3 className="ws-h3">SUBMITTED INTAKE</h3>
          <span className="ws-meta">{detail.artifact.intake_state === 'COMPLETE' ? 'SUBMITTED' : 'NOT SUBMITTED'}</span>
        </div>
        <div className="ws-kvgrid ws-kvgrid--2">
          <WsKv
            rows={[
              ['BUSINESS', intake.business_name || '—', true],
              ['INDUSTRY', human(intake.industry)],
              ['CONTACT EMAIL', intake.current_email || '—', true],
              ['CONTACT NUMBER', intake.phone || '—', true],
            ]}
          />
          <WsKv
            rows={[
              ['YOUR DOMAIN', intake.existing_domain || '—', true],
              ['REGISTRAR', human(intake.existing_registrar)],
              ['EMAIL TODAY', human(intake.existing_email_provider)],
              ['NEEDS', (intake.needs ?? []).map(human).join(' · ') || '—'],
            ]}
          />
        </div>
      </div>
      {rec ? (
        <div className="ctx-sec">
          <div className="ws-sechead">
            <h3 className="ws-h3">AUTOMATED RECOMMENDATION</h3>
            {rec.manual_review ? <WsChip kind="req">{rec.manual_review_reasons.length} MANUAL REVIEW</WsChip> : <WsChip kind="ok">AUTOMATED</WsChip>}
          </div>
          {rec.recommended_addons.map((l) => (
            <WsActivity key={l.addon_id} time="" kind={l.requires_manual_review ? 'founder' : 'idle'} title={`${human(l.addon_id)} × ${l.quantity}`} />
          ))}
          {rec.manual_review_reasons.map((r) => (
            <WsActivity key={r} time="" kind="founder" title={human(r)} />
          ))}
        </div>
      ) : null}
      {approvals.length ? (
        <div className="ctx-sec">
          <div className="ws-sechead">
            <h3 className="ws-h3">APPROVAL REQUESTS</h3>
            <span className="ws-meta">{approvals.length} OPEN</span>
          </div>
          {approvals.map((a) => (
            <WsActivity key={a.approval_id} time={age(a.created_at)} kind="founder" title={`${a.subject.toUpperCase()} · V${a.version}`} sub={`REQUESTED BY ${a.actor}`} />
          ))}
        </div>
      ) : null}
      {item.type === 'EXCEPTION' ? (
        <div className="ctx-sec">
          <WsBanner tone="red" icon="blocked">
            {item.sub}
          </WsBanner>
        </div>
      ) : null}
    </>
  );
}

type Push = ReturnType<typeof useFounderWorkspaceOverlay>['pushToast'];
type Open = ReturnType<typeof useFounderWorkspaceOverlay>['openOverlay'];

function Decision({ item, detail, onDone, pushToast, openOverlay }: { item: ReviewItem; detail: DigitalFoundationArtifactPayload | null; onDone: () => void; pushToast: Push; openOverlay: Open }) {
  const approvals = pendingApprovals(detail);
  const approval = approvals[0] ?? null;
  const [choice, setChoice] = useState<'APPROVED' | 'REVISION_REQUESTED'>('APPROVED');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setChoice('APPROVED');
    setNote('');
    setErr(null);
  }, [item.row.artifact_id]);

  const id = item.row.artifact_id;
  const q = detail?.quote ?? null;

  if (!detail) {
    return (
      <div className="dec" aria-label="DECISION">
        <div className="dec__hint">
          <span className="ws-label">YOUR DECISION</span>
        </div>
        <p className="ws-meta" style={{ margin: 0 }}>
          WAITING FOR THE RECORD…
        </p>
      </div>
    );
  }

  if (approval) {
    const confirm = async () => {
      if (choice === 'REVISION_REQUESTED' && !note.trim()) {
        setErr('ADD A NOTE FOR THE CLIENT BEFORE REQUESTING A REVISION');
        return;
      }
      setBusy(true);
      setErr(null);
      try {
        await foundationAdminApi.approvalResolve(id, approval.approval_id, choice, note.trim() || undefined);
        pushToast(choice === 'APPROVED' ? `${approval.subject.toUpperCase()} APPROVED · CONFIRMED BY THE SERVER` : 'REVISION REQUEST RECORDED · CONFIRMED BY THE SERVER', 'ok');
        onDone();
      } catch (e) {
        setErr(`NOT SAVED — THE DECISION DID NOT REACH THE SERVER. RETRY; YOUR NOTE IS KEPT. (${e instanceof Error ? e.message : 'error'})`);
      } finally {
        setBusy(false);
      }
    };
    return (
      <div className="dec" aria-label="DECISION">
        <div className="dec__hint">
          <span className="ws-label">YOUR DECISION · {approval.subject.toUpperCase()}</span>
        </div>
        <div className="dec__opts" role="radiogroup" aria-label="DECISION">
          <WsChoice on={choice === 'APPROVED'} title="APPROVE" desc="RECORDS YOUR APPROVAL · THE CLIENT IS NOT EMAILED" onSelect={() => setChoice('APPROVED')} />
          <WsChoice on={choice === 'REVISION_REQUESTED'} title="REQUEST REVISION" desc="RETURNS TO THE CLIENT WITH YOUR NOTE" onSelect={() => setChoice('REVISION_REQUESTED')} />
        </div>
        <div className="dec__note">
          <WsField label="NOTE TO CLIENT" opt={choice === 'APPROVED'} req={choice === 'REVISION_REQUESTED'}>
            <WsTextarea value={note} onChange={setNote} rows={2} placeholder={choice === 'APPROVED' ? 'OPTIONAL FOR APPROVAL' : 'WHAT SHOULD THE CLIENT CHANGE?'} ariaLabel="NOTE TO CLIENT" />
          </WsField>
        </div>
        <div className="dec__acts">
          <WsButton arrow busy={busy} onClick={() => void confirm()}>
            {busy ? 'SAVING…' : choice === 'APPROVED' ? 'CONFIRM DECISION' : 'SEND REVISION REQUEST'}
          </WsButton>
        </div>
        {err ? (
          <WsBanner tone="red" icon="warning">
            {err}
          </WsBanner>
        ) : null}
      </div>
    );
  }

  if (item.type === 'QUOTE') {
    return (
      <div className="dec" aria-label="DECISION">
        <div className="dec__hint">
          <span className="ws-label">YOUR DECISION · QUOTE</span>
        </div>
        <p className="ws-meta" style={{ margin: 0, lineHeight: 1.5 }}>
          {q ? 'APPROVAL MARKS THE QUOTE COMMERCIALLY READY. AMOUNTS ARE NOT RECALCULATED.' : 'NO QUOTE RECORD YET · PREPARE IT FROM THE RECORD.'}
        </p>
        <div className="dec__acts">
          <WsButton arrow disabled={!q || Boolean(q.founder_commercial_ready)} onClick={() => openOverlay('OL-08', { artifact_id: id, quote_version: q?.quote_version, subtotal_minor: q?.subtotal_minor, business_name: item.row.name })}>
            {q?.founder_commercial_ready ? 'QUOTE APPROVED' : 'APPROVE QUOTE'}
          </WsButton>
          <WsButton tone="out" disabled={!q} onClick={() => openOverlay('OL-09', { artifact_id: id, quote_version: q?.quote_version, business_name: item.row.name })}>
            REVISE
          </WsButton>
        </div>
      </div>
    );
  }

  return (
    <div className="dec" aria-label="DECISION">
      <div className="dec__hint">
        <span className="ws-label">YOUR DECISION · {item.type}</span>
      </div>
      <WsBanner icon="info">
        {item.type === 'EXCEPTION' ? 'EXCEPTIONS ARE RESOLVED IN THE RUNBOOK. NOTHING IS CHANGED FROM HERE.' : 'NO APPROVAL RECORD IS OPEN ON THIS FOUNDATION · REVIEW IT IN THE RECORD.'}
      </WsBanner>
      <div className="dec__acts">
        <WsLinkButton arrow to={item.type === 'EXCEPTION' ? IDNTY_FOUNDER_WORKSPACE_ROUTES.operations : IDNTY_FOUNDER_WORKSPACE_ROUTES.client(id)}>
          {item.type === 'EXCEPTION' ? 'OPEN OPERATIONS' : 'OPEN RECORD'}
        </WsLinkButton>
      </div>
    </div>
  );
}

/** Phone / portrait bar: the decision opens as OL-11 (sheet) or the quote dialogs. */
function MobileBar({ item, detail, openOverlay }: { item: ReviewItem; detail: DigitalFoundationArtifactPayload | null; openOverlay: Open }) {
  const approval = pendingApprovals(detail)[0];
  const id = item.row.artifact_id;
  if (approval) {
    return (
      <>
        <WsButton tone="out" size="sm" onClick={() => openOverlay('OL-11', { artifact_id: id, approval_id: approval.approval_id, subject: approval.subject, business_name: item.row.name })}>
          REQUEST REVISION
        </WsButton>
        <WsLinkButton block to={IDNTY_FOUNDER_WORKSPACE_ROUTES.client(id)}>
          OPEN RECORD
        </WsLinkButton>
      </>
    );
  }
  if (item.type === 'QUOTE' && detail?.quote) {
    const q = detail.quote;
    return (
      <>
        <WsButton tone="out" size="sm" onClick={() => openOverlay('OL-09', { artifact_id: id, quote_version: q.quote_version, business_name: item.row.name })}>
          REVISE
        </WsButton>
        <WsButton block disabled={Boolean(q.founder_commercial_ready)} onClick={() => openOverlay('OL-08', { artifact_id: id, quote_version: q.quote_version, subtotal_minor: q.subtotal_minor, business_name: item.row.name })}>
          APPROVE QUOTE
        </WsButton>
      </>
    );
  }
  return (
    <WsLinkButton block to={IDNTY_FOUNDER_WORKSPACE_ROUTES.client(id)}>
      OPEN RECORD
    </WsLinkButton>
  );
}

