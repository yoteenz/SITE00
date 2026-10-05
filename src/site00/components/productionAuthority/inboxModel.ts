/**
 * INBOX object model (P0.STUDIOOS.PRODUCTION.INBOX.AUTHORITY-FAMILY-CONVERGENCE.OPUS2).
 *
 * Inbox is the Production attention + judgment + follow-up system. Every object has a TYPE
 * (DECISION / MESSAGE / SYSTEM) and, independently, a lifecycle STATE (NEEDS_YOU / WATCHING / RESOLVED).
 * Everything here is derived from data the page already reads — hub attention items, device-held
 * production requests, recorded activity and the production graph. Nothing is authored or sampled.
 * MESSAGE objects have no source yet, so the list is empty until a messaging service exists.
 */
import type { HubActivityItem, HubAttentionItem, HubNode, HubNodeId } from '../../../../shared/site00-production-hub/index.js';
import { productionRequestScope, productionRequestTitle } from '../../../../shared/site00-production-workspace/requestCatalog.js';
import type { StoredProductionRequest } from '../../state/productionRequestStore';
import type { HubData } from '../productionHub/useProductionHubData';

export type InboxType = 'DECISION' | 'MESSAGE' | 'SYSTEM';
export type InboxState = 'NEEDS_YOU' | 'WATCHING' | 'RESOLVED';
export const INBOX_TYPES: readonly InboxType[] = ['DECISION', 'MESSAGE', 'SYSTEM'];
export const INBOX_STATES: readonly InboxState[] = ['NEEDS_YOU', 'WATCHING', 'RESOLVED'];
export const STATE_LABEL: Record<InboxState, string> = { NEEDS_YOU: 'NEEDS YOU', WATCHING: 'WATCHING', RESOLVED: 'RESOLVED' };

/** Watch sub-status (what the object is doing while you monitor it) and resolved outcome. */
export type InboxStatus = 'AWAITING_RESPONSE' | 'IN_PROGRESS' | 'AT_RISK' | 'APPROVED' | 'REVISED' | 'COMPLETE' | 'NEEDS_REVIEW';
export const STATUS_LABEL: Record<InboxStatus, string> = {
  AWAITING_RESPONSE: 'AWAITING RESPONSE',
  IN_PROGRESS: 'IN PROGRESS',
  AT_RISK: 'AT RISK',
  APPROVED: 'APPROVED',
  REVISED: 'REVISED',
  COMPLETE: 'COMPLETE',
  NEEDS_REVIEW: 'NEEDS REVIEW',
};

export type InboxObject = {
  id: string;
  type: InboxType;
  state: InboxState;
  status: InboxStatus;
  /** entry / origin line, e.g. "ENTRY 002" or "SYSTEM" */
  entry: string;
  title: string;
  /** production area (node / workspace) */
  area: string;
  /** what this object holds up (labels of downstream nodes) */
  blocks: string[];
  /** who raised / resolved it — only when the source records it */
  by: string | null;
  urgency: 'HIGH' | 'NORMAL';
  why: string;
  at: string | null;
  nodeId: HubNodeId | null;
  slot: string | null;
  /** where the object is worked on in Production */
  workspaceHref: string | null;
  source: 'ATTENTION' | 'REQUEST' | 'ACTIVITY' | 'GRAPH';
};

const REQ_STATE: Record<StoredProductionRequest['status'], [InboxState, InboxStatus]> = {
  AWAITING_APPROVAL: ['NEEDS_YOU', 'NEEDS_REVIEW'],
  QUEUED: ['WATCHING', 'AWAITING_RESPONSE'],
  IN_PROGRESS: ['WATCHING', 'IN_PROGRESS'],
  COMPLETE: ['RESOLVED', 'COMPLETE'],
};

const labelsOf = (ids: readonly HubNodeId[], byId: Readonly<Record<string, HubNode>> | undefined) => ids.map((id) => byId?.[id]?.label ?? id.toUpperCase());

export function buildInboxObjects(
  data: Pick<HubData, 'attention' | 'activity' | 'graph' | 'production' | 'project'> | null,
  requests: readonly StoredProductionRequest[],
  nodeHref: (nodeId: HubNodeId | null) => string | null = () => null,
  requestHref: (r: StoredProductionRequest) => string | null = () => null,
): InboxObject[] {
  const entry = data?.production?.label ?? 'PRODUCTION';
  const byId = data?.graph?.byId as Readonly<Record<string, HubNode>> | undefined;
  const out: InboxObject[] = [];

  // DECISION · NEEDS YOU — live attention items (the founder's open judgments)
  const attentionNodes = new Set<string>();
  for (const a of (data?.attention ?? []) as HubAttentionItem[]) {
    const node = a.nodeId ? byId?.[a.nodeId] : undefined;
    if (a.nodeId) attentionNodes.add(a.nodeId);
    out.push({
      id: a.id,
      type: 'DECISION',
      state: 'NEEDS_YOU',
      status: 'NEEDS_REVIEW',
      entry,
      title: a.title,
      area: node?.label ?? a.subtitle,
      blocks: node ? labelsOf(node.unlocks, byId) : [],
      by: null,
      urgency: a.priority,
      why: a.why || node?.statusDetail || '',
      at: null,
      nodeId: a.nodeId,
      slot: a.assetSlotId ?? node?.assetSlotId ?? null,
      workspaceHref: nodeHref(a.nodeId),
      source: 'ATTENTION',
    });
  }

  // DECISION · any state — device-held production requests (state follows the request lifecycle)
  for (const r of requests) {
    const [state, status] = REQ_STATE[r.status];
    out.push({
      id: r.id,
      type: 'DECISION',
      state,
      status,
      entry: r.projectSlug.toUpperCase(),
      title: productionRequestTitle(r.kind),
      area: productionRequestScope(r.kind),
      blocks: [],
      by: null,
      urgency: 'NORMAL',
      why: r.note ?? `${r.projectSlug.toUpperCase()} · ${productionRequestScope(r.kind)}`,
      at: r.createdAt,
      nodeId: null,
      slot: null,
      workspaceHref: requestHref(r),
      source: 'REQUEST',
    });
  }

  // DECISION · RESOLVED — recorded approvals / revisions; SYSTEM · RESOLVED — recorded renders / assets
  for (const a of (data?.activity ?? []) as HubActivityItem[]) {
    if (a.category === 'APPROVAL') {
      out.push({
        id: a.id,
        type: 'DECISION',
        state: 'RESOLVED',
        status: /REVISION|REVISE|REFINE/i.test(a.title) ? 'REVISED' : 'APPROVED',
        entry,
        title: a.title,
        area: a.detail.split('·').map((s) => s.trim()).filter(Boolean).pop() ?? '',
        blocks: [],
        by: a.actor,
        urgency: 'NORMAL',
        why: a.detail,
        at: a.at,
        nodeId: null,
        slot: a.assetSlotId,
        workspaceHref: null,
        source: 'ACTIVITY',
      });
    } else if (a.category === 'RENDER' || a.category === 'ASSET') {
      out.push({
        id: a.id,
        type: 'SYSTEM',
        state: 'RESOLVED',
        status: 'COMPLETE',
        entry: 'SYSTEM',
        title: a.title,
        area: a.category,
        blocks: [],
        by: a.actor,
        urgency: 'NORMAL',
        why: a.detail,
        at: a.at,
        nodeId: null,
        slot: a.assetSlotId,
        workspaceHref: null,
        source: 'ACTIVITY',
      });
    }
  }

  // SYSTEM — production-graph state for every stage that is not already an open decision
  for (const n of (data?.graph?.nodes ?? []) as HubNode[]) {
    if (attentionNodes.has(n.id)) continue;
    const [state, status]: [InboxState, InboxStatus] =
      n.status === 'COMPLETE' ? ['RESOLVED', 'COMPLETE']
      : n.status === 'BLOCKED' ? ['WATCHING', 'AT_RISK']
      : n.status === 'ACTIVE' ? ['WATCHING', 'IN_PROGRESS']
      : n.status === 'REVIEW_REQUIRED' ? ['NEEDS_YOU', 'NEEDS_REVIEW']
      : ['WATCHING', 'AWAITING_RESPONSE'];
    out.push({
      id: `sys.${n.id}`,
      type: 'SYSTEM',
      state,
      status,
      entry: 'SYSTEM',
      title: `${n.label} — ${n.status.replace(/_/g, ' ')}`,
      area: n.label,
      blocks: labelsOf(n.unlocks, byId),
      by: null,
      urgency: n.status === 'BLOCKED' || n.status === 'REVIEW_REQUIRED' ? 'HIGH' : 'NORMAL',
      why: n.statusDetail,
      at: null,
      nodeId: n.id,
      slot: n.assetSlotId,
      workspaceHref: nodeHref(n.id),
      source: 'GRAPH',
    });
  }

  // needs-you first, high urgency first, then newest
  const rank = (o: InboxObject) => INBOX_STATES.indexOf(o.state) * 10 + (o.urgency === 'HIGH' ? 0 : 1);
  return out.sort((a, b) => rank(a) - rank(b) || (b.at ?? '').localeCompare(a.at ?? ''));
}

export const countBy = <K extends string>(list: readonly InboxObject[], key: (o: InboxObject) => K) =>
  list.reduce<Partial<Record<K, number>>>((acc, o) => ((acc[key(o)] = (acc[key(o)] ?? 0) + 1), acc), {});
