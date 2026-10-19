import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { foundationAdminApi, digitalFoundationClientIntakePath } from '../../../services/foundationAdminApi';
import { foundationReadinessApi } from '../../../services/foundationReadinessApi';
import { IDNTY_FOUNDER_WORKSPACE_ROUTES } from '../../config/routes';
import { useRegistryFilters, type RegistrySortKey } from '../../data/registryFilters';
import { useFounderWorkspaceOverlay } from '../../overlay/OverlayContext';
import type { WorkspaceOverlayId } from '../../overlay/overlayRegistry';
import { OverlayFormShell } from './OverlayFormShell';
import { WorkspaceMenuRows } from './WorkspaceMenuRows';

type Props = {
  id: WorkspaceOverlayId;
  payload?: Record<string, unknown>;
  onClose: () => void;
  markDirty: (dirty: boolean) => void;
};

export function WorkspaceOverlayBody({ id, payload, onClose, markDirty }: Props) {
  const navigate = useNavigate();
  const { pushToast } = useFounderWorkspaceOverlay();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; label: string; href: string }>>([]);
  const [note, setNote] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [sendApproved, setSendApproved] = useState(false);
  const [adjustmentMinor, setAdjustmentMinor] = useState('0');
  const [blockerReason, setBlockerReason] = useState('');
  const artifactId = String(payload?.artifact_id ?? payload?.artifactId ?? '');

  useEffect(() => {
    markDirty(false);
  }, [id, markDirty]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Action failed';
      setError(msg);
      pushToast(msg, 'error', { sticky: true });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (id !== 'OL-04') return;
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = window.setTimeout(() => {
      void foundationAdminApi.list().then((json) => {
        const q = query.trim().toLowerCase();
        setResults(
          (json.artifacts ?? [])
            .filter(
              (a) =>
                (a.business_name ?? '').toLowerCase().includes(q) ||
                a.artifact_id.includes(q) ||
                a.public_token.includes(q),
            )
            .slice(0, 8)
            .map((a) => ({
              id: a.artifact_id,
              label: a.business_name || a.artifact_id.slice(0, 8),
              href: IDNTY_FOUNDER_WORKSPACE_ROUTES.client(a.artifact_id),
            })),
        );
      });
    }, 220);
    return () => window.clearTimeout(t);
  }, [id, query]);

  const [notificationItems, setNotificationItems] = useState<Array<{ label: string; href?: string }>>([]);

  useEffect(() => {
    if (id !== 'OL-05') return;
    void foundationAdminApi.pipeline().then((json) => {
      setNotificationItems(
        (json.rows ?? [])
          .filter((r) => r.blocker || r.next_action)
          .slice(0, 8)
          .map((r) => ({
            label: `${r.business_name ?? r.artifact_id.slice(0, 8)} · ${r.next_action ?? r.blocker}`,
            href: IDNTY_FOUNDER_WORKSPACE_ROUTES.client(r.artifact_id),
          })),
      );
    });
  }, [id]);

  switch (id) {
    case 'OL-02':
      return (
        <OverlayFormShell
          id={id}
          lede="Permanent personalized intake link"
          primaryLabel="Copy link"
          onPrimary={() => {
            const link = String(payload?.link ?? '');
            if (!link) return;
            void navigator.clipboard.writeText(link).then(
              () => pushToast('Copy completed', 'ok'),
              () => pushToast('Copy failed', 'error'),
            );
          }}
          onClose={onClose}
        >
          <code className="ifw-code fw-data">{String(payload?.link ?? '—')}</code>
        </OverlayFormShell>
      );

    case 'OL-03':
      // Workspace menu (OPUS1/OPUS2 drawer grammar; OPUS3 adds 06 REFERRALS). Phones reach REFERRALS only here.
      return (
        <OverlayFormShell id={id} lede="All destinations" primaryLabel="Close" onClose={onClose}>
          <WorkspaceMenuRows onNavigate={onClose} />
        </OverlayFormShell>
      );

    case 'OL-04':
      return (
        <OverlayFormShell id={id} lede="Find client or destination" primaryLabel="Close" onClose={onClose}>
          <input
            className="ifw-field__input fw-data"
            placeholder="Type at least 2 characters"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <ul className="ifw-search-results">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  className="ifw-search-results__btn"
                  onClick={() => {
                    onClose();
                    navigate(r.href);
                  }}
                >
                  {r.label}
                </button>
              </li>
            ))}
            {query.length >= 2 && !results.length ? <li className="ifw-muted">No results</li> : null}
          </ul>
        </OverlayFormShell>
      );

    case 'OL-05':
      return (
        <OverlayFormShell id={id} lede="Founder decisions and recent movement" primaryLabel="Close" onClose={onClose}>
          {notificationItems.length ? (
            <ul className="ifw-list">
              {notificationItems.map((n) => (
                <li key={n.label}>
                  {n.href ? (
                    <Link to={n.href} onClick={onClose}>
                      {n.label}
                    </Link>
                  ) : (
                    n.label
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="ifw-muted">No pending notifications from live pipeline.</p>
          )}
        </OverlayFormShell>
      );

    case 'OL-06': {
      const token = String(payload?.public_token ?? '');
      const intake = token ? `${window.location.origin}${digitalFoundationClientIntakePath(token)}` : '';
      return (
        <OverlayFormShell
          id={id}
          primaryLabel="Open record"
          onPrimary={() => {
            if (!artifactId) return;
            onClose();
            navigate(IDNTY_FOUNDER_WORKSPACE_ROUTES.client(artifactId));
          }}
          onClose={onClose}
        >
          <button
            type="button"
            className="ifw-btn ifw-btn--ghost"
            disabled={!intake}
            onClick={() => {
              if (!intake) return;
              void navigator.clipboard.writeText(intake).then(() => pushToast('Copy completed', 'ok'));
            }}
          >
            Copy intake link
          </button>
          <p className="ifw-muted">Resend / archive unavailable until messaging policy authorizes.</p>
        </OverlayFormShell>
      );
    }

    case 'OL-07':
      return <Ol07RegistryFilters id={id} onClose={onClose} payload={payload} markDirty={markDirty} />;

    case 'OL-08':
      return (
        <OverlayFormShell
          id={id}
          lede="Marks quote commercially ready when backend allows."
          primaryLabel={busy ? 'Working…' : 'Approve quote'}
          primaryDisabled={busy || !artifactId}
          onPrimary={() =>
            void run(async () => {
              await foundationAdminApi.quoteCommercialReady(artifactId);
              pushToast('Quote marked ready', 'ok');
              onClose();
            })
          }
          onClose={onClose}
          error={error}
        />
      );

    case 'OL-09':
      return (
        <OverlayFormShell
          id={id}
          lede="Manual adjustment in minor units (cents)."
          primaryLabel={busy ? 'Saving…' : 'Apply adjustment'}
          primaryDisabled={busy || !artifactId}
          onPrimary={() =>
            void run(async () => {
              markDirty(false);
              await foundationAdminApi.manualQuoteAdjustment(artifactId, Number(adjustmentMinor) || 0);
              pushToast('Adjustment saved', 'ok');
              onClose();
            })
          }
          onClose={onClose}
          error={error}
        >
          <label className="ifw-field">
            <span className="ifw-field__label">Adjustment minor</span>
            <input
              className="ifw-field__input fw-data"
              value={adjustmentMinor}
              onChange={(e) => {
                setAdjustmentMinor(e.target.value);
                markDirty(true);
              }}
            />
          </label>
        </OverlayFormShell>
      );

    case 'OL-10':
      return (
        <OverlayFormShell
          id={id}
          lede="Requires ownership payload — uses intake defaults."
          primaryLabel={busy ? 'Saving…' : 'Mark complete'}
          primaryDisabled={busy || !artifactId}
          onPrimary={() =>
            void run(async () => {
              const detail = await foundationAdminApi.detail(artifactId);
              const intake = (detail as { artifact?: { intake?: Record<string, string> } }).artifact?.intake;
              await foundationAdminApi.markComplete(artifactId, {
                business: intake?.business_name ?? 'Business',
                domain: intake?.existing_domain ?? 'example.com',
                registrar: 'TBD',
                email_provider: 'TBD',
                primary_mailbox: intake?.current_email ?? null,
                aliases: [],
                dns_status: 'CONFIGURED',
                security_status: 'PROTECTED',
                owner: intake?.contact_name ?? null,
                administrative_access_model: 'Client-owned',
              });
              pushToast('Foundation marked complete', 'ok');
              onClose();
            })
          }
          onClose={onClose}
          error={error}
        />
      );

    case 'OL-11':
      return (
        <OverlayFormShell
          id={id}
          lede="Records founder note via approval-resolve when approval_id supplied."
          primaryLabel={busy ? 'Saving…' : 'Submit note'}
          primaryDisabled={busy || !artifactId || !payload?.approval_id}
          onPrimary={() =>
            void run(async () => {
              await foundationAdminApi.approvalResolve(
                artifactId,
                String(payload?.approval_id),
                'REVISION_REQUESTED',
                note,
              );
              pushToast('Review note recorded', 'ok');
              onClose();
            })
          }
          onClose={onClose}
          error={error}
        >
          <label className="ifw-field">
            <span className="ifw-field__label">Note</span>
            <textarea
              className="ifw-field__input"
              rows={4}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                markDirty(true);
              }}
            />
          </label>
          {!payload?.approval_id ? <p className="ifw-muted">Select a review item with approval_id to enable submit.</p> : null}
        </OverlayFormShell>
      );

    case 'OL-12': {
      const task = payload?.task as Record<string, unknown> | undefined;
      return (
        <OverlayFormShell
          id={id}
          lede="Task from operations workbench"
          primaryLabel={busy ? 'Starting…' : 'Start task'}
          primaryDisabled={busy || !artifactId || !task?.task_id}
          onPrimary={() =>
            void run(async () => {
              await foundationAdminApi.startTask(artifactId, String(task?.task_id));
              pushToast('Task started', 'ok');
              onClose();
            })
          }
          onClose={onClose}
          error={error}
        >
          <dl className="ifw-kv">
            <dt>Task</dt>
            <dd>{String(task?.title ?? task?.task_id ?? '—')}</dd>
            <dt>Mode</dt>
            <dd>{String(task?.execution_mode ?? '—')}</dd>
            <dt>Status</dt>
            <dd>{String(task?.status ?? '—')}</dd>
          </dl>
        </OverlayFormShell>
      );
    }

    case 'OL-13':
      return (
        <OverlayFormShell
          id={id}
          lede="Sets blocker on selected task"
          primaryLabel={busy ? 'Saving…' : 'Set blocker'}
          primaryDisabled={busy || !artifactId || !payload?.task_id}
          onPrimary={() =>
            void run(async () => {
              await foundationAdminApi.setBlocker(
                artifactId,
                String(payload?.task_id),
                String(payload?.category ?? 'UNKNOWN'),
                blockerReason,
              );
              pushToast('Blocker recorded', 'ok');
              onClose();
            })
          }
          onClose={onClose}
          error={error}
        >
          <label className="ifw-field">
            <span className="ifw-field__label">Reason</span>
            <input
              className="ifw-field__input"
              value={blockerReason}
              onChange={(e) => {
                setBlockerReason(e.target.value);
                markDirty(true);
              }}
            />
          </label>
        </OverlayFormShell>
      );

    case 'OL-14':
      return (
        <OverlayFormShell
          id={id}
          lede="Sends founder message to project thread"
          primaryLabel={busy ? 'Sending…' : 'Send message'}
          primaryDisabled={busy || !artifactId || !messageBody.trim()}
          onPrimary={() =>
            void run(async () => {
              await foundationAdminApi.sendMessage(artifactId, messageBody.trim());
              pushToast('Message sent', 'ok');
              onClose();
            })
          }
          onClose={onClose}
          error={error}
        >
          <label className="ifw-field">
            <span className="ifw-field__label">Message</span>
            <textarea
              className="ifw-field__input"
              rows={4}
              value={messageBody}
              onChange={(e) => {
                setMessageBody(e.target.value);
                markDirty(true);
              }}
            />
          </label>
        </OverlayFormShell>
      );

    case 'OL-15':
      return (
        <OverlayFormShell
          id={id}
          lede="Staging transactional send requires explicit founder approval."
          blockedReason={sendApproved ? undefined : 'Enable approval tick to continue'}
          primaryLabel="Send blocked"
          primaryDisabled
          onClose={onClose}
        >
          <label className="ifw-field">
            <input type="checkbox" checked={sendApproved} onChange={(e) => setSendApproved(e.target.checked)} /> Founder
            approves send
          </label>
          <p className="ifw-muted">Use Test Lab dispatch with intent_id when authorized.</p>
        </OverlayFormShell>
      );

    case 'OL-16':
      return (
        <OverlayFormShell id={id} lede={String(payload?.module ?? 'Module detail')} primaryLabel="Close" onClose={onClose}>
          <pre className="ifw-code fw-data">{JSON.stringify(payload?.detail ?? {}, null, 2)}</pre>
        </OverlayFormShell>
      );

    case 'OL-17':
      return (
        <OverlayFormShell
          id={id}
          lede="Clears in-memory test artifacts on API (staging only)."
          primaryLabel={busy ? 'Resetting…' : 'Reset test data'}
          primaryDisabled={busy}
          onPrimary={() =>
            void run(async () => {
              await foundationReadinessApi.resetTestData();
              pushToast('Test data reset', 'ok');
              onClose();
            })
          }
          onClose={onClose}
          error={error}
        />
      );

    case 'OL-18':
      return (
        <OverlayFormShell id={id} lede="Account" primaryLabel="Close" onClose={onClose}>
          <p className="fw-data">{String(payload?.email ?? 'Signed in founder')}</p>
          <Link to="/origin/sign-out" className="ifw-btn ifw-btn--ghost">
            Sign out
          </Link>
        </OverlayFormShell>
      );

    case 'OL-19':
      return (
        <OverlayFormShell
          id={id}
          lede="Inspector preview"
          primaryLabel="Open full record"
          onPrimary={() => {
            if (!artifactId) return;
            onClose();
            navigate(IDNTY_FOUNDER_WORKSPACE_ROUTES.client(artifactId));
          }}
          onClose={onClose}
        >
          <dl className="ifw-kv">
            <dt>Business</dt>
            <dd>{String(payload?.business_name ?? '—')}</dd>
            <dt>State</dt>
            <dd>{String(payload?.state ?? '—')}</dd>
            <dt>Intake</dt>
            <dd>{String(payload?.intake_state ?? '—')}</dd>
          </dl>
        </OverlayFormShell>
      );

    case 'OL-20':
      return (
        <OverlayFormShell id={id} lede="Technical detail" primaryLabel="Close" onClose={onClose}>
          <pre className="ifw-code fw-data">{String(payload?.message ?? error ?? 'No detail')}</pre>
        </OverlayFormShell>
      );

    default:
      return (
        <OverlayFormShell
          id={id}
          blockedReason={`Unknown overlay ${id}`}
          onClose={onClose}
        />
      );
  }
}

function Ol07RegistryFilters({
  id,
  onClose,
  payload,
  markDirty,
}: {
  id: WorkspaceOverlayId;
  onClose: () => void;
  payload?: Record<string, unknown>;
  markDirty: (dirty: boolean) => void;
}) {
  const { query, stateFilter, sortKey, applyDraft, resetFilters } = useRegistryFilters();
  const [draftQuery, setDraftQuery] = useState(query);
  const [draftState, setDraftState] = useState(stateFilter);
  const [draftSort, setDraftSort] = useState<RegistrySortKey>(sortKey);

  const lifecycleStates = Array.isArray(payload?.lifecycle_states)
    ? (payload.lifecycle_states as string[])
    : [];

  useEffect(() => {
    setDraftQuery(query);
    setDraftState(stateFilter);
    setDraftSort(sortKey);
    markDirty(false);
  }, [query, stateFilter, sortKey, markDirty]);

  const dirty =
    draftQuery !== query || draftState !== stateFilter || draftSort !== sortKey;

  useEffect(() => {
    markDirty(dirty);
  }, [dirty, markDirty]);

  return (
    <OverlayFormShell
      id={id}
      lede="Filter and sort the client registry (shared with the Foundations toolbar)."
      primaryLabel="Apply"
      onPrimary={() => {
        applyDraft({ query: draftQuery, stateFilter: draftState, sortKey: draftSort });
        onClose();
      }}
      secondaryLabel="Reset"
      onSecondary={() => {
        resetFilters();
        onClose();
      }}
      onClose={onClose}
    >
      <label className="ifw-field">
        <span className="ifw-field__label">Search</span>
        <input
          className="ifw-field__input fw-data"
          value={draftQuery}
          onChange={(e) => setDraftQuery(e.target.value)}
          placeholder="Name or id"
        />
      </label>
      <label className="ifw-field">
        <span className="ifw-field__label">Lifecycle state</span>
        <select className="ifw-field__input" value={draftState} onChange={(e) => setDraftState(e.target.value)}>
          <option value="ALL">All</option>
          {lifecycleStates.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="ifw-field">
        <span className="ifw-field__label">Sort</span>
        <select
          className="ifw-field__input"
          value={draftSort}
          onChange={(e) => setDraftSort(e.target.value as RegistrySortKey)}
        >
          <option value="activity">Last activity</option>
          <option value="name">Client name</option>
          <option value="lifecycle">Lifecycle</option>
        </select>
      </label>
    </OverlayFormShell>
  );
}
