import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { productionRequestScope, productionRequestTitle } from '../../../../shared/site00-production-workspace/requestCatalog.js';
import { productionWorkspacePath, productionExpressionPath } from '../../../../shared/site00-production-workspace/routes.js';
import { PW_IMG } from '../production/productionImagery';
import { useProductionRequests } from '../../state/productionRequestStore';
import { NODE_SUB } from './HubBody';
import { useProductionAuthorityData } from './ProductionAuthorityData';
import { agoLabel, pad2, Sec, Tabs, Thumb } from './primitives';

type InboxTab = 'needs' | 'watching' | 'resolved';

export function InboxBody() {
  const data = useProductionAuthorityData();
  const requests = useProductionRequests();
  const [tab, setTab] = useState<InboxTab>('needs');
  const [note, setNote] = useState<string | null>(null);
  const items = data?.attention ?? [];
  const primary = items[0] ?? null;
  const rest = items.slice(1);
  const resolved = useMemo(() => (data?.activity ?? []).filter((a) => a.category === 'APPROVAL' || a.category === 'ASSET'), [data?.activity]);
  const watching = requests.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'AWAITING_APPROVAL');
  const queued = requests.filter((r) => r.status === 'QUEUED');
  const slug = data?.project.projectId ?? 'ndxbook';
  const gate = data?.graph.founderGate;
  const canDecide = !!gate?.open && gate.decidableInHub && primary?.kind === 'FOUNDER_APPROVAL';

  const decide = async (decision: 'APPROVE' | 'REVISE') => {
    if (!data) return;
    const res = await data.decideStoryboard(decision, '');
    setNote(res.ok ? (decision === 'APPROVE' ? 'APPROVED — recorded in activity.' : 'REVISION REQUESTED — queued.') : res.error);
  };

  const hrefFor = (nodeId: keyof typeof NODE_SUB | null) => (nodeId ? productionExpressionPath(slug, NODE_SUB[nodeId]) : productionExpressionPath(slug));

  return (
    <div className="pxa-inbox" data-testid="production-queue">
      <Tabs
        ariaLabel="Inbox"
        testId="inbox-tabs"
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'needs', label: 'NEEDS YOU' },
          { id: 'watching', label: 'WATCHING' },
          { id: 'resolved', label: 'RESOLVED' },
        ]}
      />
      {tab === 'needs' ?
        <>
          {primary ?
            <article className="pxa-priority" data-testid="inbox-primary" data-urgency={primary.priority}>
              <Thumb slotId={primary.assetSlotId} url={data?.assetUrl(primary.assetSlotId) ?? null} label={primary.kind} className="pxa-priority__img" />
              <dl className="pxa-meta">
                <div>
                  <dt>SOURCE</dt>
                  <dd>{data?.production?.label ?? 'PROJECT'}</dd>
                </div>
                <div>
                  <dt>AREA</dt>
                  <dd>{primary.kind.replace(/_/g, ' ')}</dd>
                </div>
                <div>
                  <dt>REQUEST</dt>
                  <dd>{primary.title}</dd>
                </div>
                <div>
                  <dt>STATE</dt>
                  <dd>{primary.stateLabel}</dd>
                </div>
                <div>
                  <dt>WHY</dt>
                  <dd>{primary.why}</dd>
                </div>
                <span className={`pxa-urgency pxa-urgency--${primary.priority.toLowerCase()}`}>URGENCY: {primary.priority}</span>
              </dl>
              <div className="pxa-priority__actions">
                <Link to={hrefFor(primary.nodeId)} className="pxa-btn" data-testid="inbox-review">
                  REVIEW
                </Link>
                <button type="button" className="pxa-btn pxa-btn--red" disabled={!canDecide || data?.deciding} onClick={() => void decide('APPROVE')} data-testid="inbox-approve" title={canDecide ? undefined : 'Approval opens once the storyboard gate is ready.'}>
                  APPROVE
                </button>
                <button type="button" className="pxa-btn" disabled={!canDecide || data?.deciding} onClick={() => void decide('REVISE')} data-testid="inbox-revise">
                  REQUEST REVISION
                </button>
                {note ? <p className="pxa-note" role="status">{note}</p> : null}
              </div>
            </article>
          : <div className="pxa-empty pxa-empty--block" data-testid="queue-empty">
              <b>QUEUE CLEAR</b>
              NOTHING NEEDS YOU RIGHT NOW. REQUESTS FROM PROJECTS APPEAR HERE.
            </div>}
          <div className="pxa-inbox__row">
            <Sec title="INCOMING DECISION OBJECTS" className="pxa-card pxa-inbox__incoming" testId="inbox-incoming">
              <div className="pxa-cards">
                {rest.map((a) => (
                  <Link key={a.id} to={hrefFor(a.nodeId)} className="pxa-dcard" data-testid="inbox-item">
                    <Thumb slotId={a.assetSlotId} url={data?.assetUrl(a.assetSlotId) ?? null} label={a.kind} />
                    <b>{a.title}</b>
                    <small>{a.subtitle}</small>
                    <em>{a.stateLabel}</em>
                  </Link>
                ))}
                {queued.map((r) => (
                  <Link
                    key={r.id}
                    className="pxa-dcard"
                    to={r.targetWorkspace === 'GENERAL' ? `/production/${r.projectSlug}` : productionWorkspacePath(r.projectSlug, r.targetWorkspace, r.targetSubWorkspace ?? '')}
                    data-testid="queue-request"
                  >
                    <Thumb
                      plate={r.targetWorkspace === 'DESIGN' ? PW_IMG.request.design : r.targetSubWorkspace === 'sets' ? PW_IMG.request.set : r.targetSubWorkspace === 'casting' ? PW_IMG.request.character : PW_IMG.request.content}
                    />
                    <b>{productionRequestTitle(r.kind)}</b>
                    <small>{r.projectSlug.toUpperCase()} · {productionRequestScope(r.kind)}</small>
                    <em>PROJECT · {agoLabel(r.createdAt)}</em>
                  </Link>
                ))}
                {!rest.length && !queued.length ?
                  <p className="pxa-empty">NO FURTHER DECISIONS ARE WAITING.</p>
                : null}
              </div>
            </Sec>
            <Sec title="BLOCKERS & APPROVALS" className="pxa-card pxa-inbox__stats" testId="inbox-stats">
              <div className="pxa-stats">
                <div>
                  <b className="pxa-red">{pad2(data?.graph.blockers.length ?? 0)}</b>
                  <small>BLOCKERS</small>
                </div>
                <div>
                  <b className="pxa-red">{pad2(items.filter((a) => a.kind === 'FOUNDER_APPROVAL').length)}</b>
                  <small>APPROVALS</small>
                </div>
              </div>
            </Sec>
          </div>
        </>
      : null}
      {tab === 'watching' ?
        <Sec title="WATCHING" className="pxa-card" testId="inbox-watching">
          {watching.length ?
            <div className="pxa-cards">
              {watching.map((r) => (
                <div key={r.id} className="pxa-dcard">
                  <b>{productionRequestTitle(r.kind)}</b>
                  <small>{r.projectSlug.toUpperCase()} · {productionRequestScope(r.kind)}</small>
                  <em>{r.status.replace(/_/g, ' ')}</em>
                </div>
              ))}
            </div>
          : <p className="pxa-empty">NOTHING IS BEING WATCHED.</p>}
        </Sec>
      : null}
      {tab === 'resolved' || tab === 'needs' ?
        <Sec title="RECENTLY RESOLVED" className="pxa-card pxa-inbox__resolved" testId="inbox-resolved">
          {resolved.length ?
            <ul className="pxa-resolved">
              {resolved.slice(0, 6).map((a) => (
                <li key={a.id} title={a.title}>
                  <Thumb slotId={a.assetSlotId} url={data?.assetUrl(a.assetSlotId) ?? null} label={a.category} />
                  <b>{a.title}</b>
                  <time>{agoLabel(a.at)}</time>
                  <i aria-hidden>✓</i>
                </li>
              ))}
            </ul>
          : <p className="pxa-empty">NOTHING HAS BEEN RESOLVED YET.</p>}
        </Sec>
      : null}
      <p className="pxa-footnote">Requests are held on this device until the queue service is connected. {items.length ? `${pad2(items.length)} OPEN.` : ''}</p>
    </div>
  );
}
