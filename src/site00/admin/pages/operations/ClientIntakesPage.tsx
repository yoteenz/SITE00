/**
 * Admin — Client Intakes inbox (world-class guest discovery).
 */
import { useCallback, useEffect, useState } from 'react';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { apiFetch } from '../../../../utils/api';

type IntakeSummary = {
  inviteId: string;
  projectDisplayName: string;
  recipientLabel: string;
  projectExperienceClass: string;
  status: string;
  completionPercentage: number;
  worldFormationReadiness: string;
  lastSavedAt: string | null;
  createdAt: string;
};

type IntelligencePayload = {
  invite: IntakeSummary & { projectSlug?: string };
  session: {
    completionPercentage: number;
    synthesized: Record<string, unknown>;
    rawAnswers: Record<string, unknown>;
    submittedAt: string | null;
  } | null;
  snapshot: { snapshotId: string; readiness: { state: string } } | null;
};

const AMBITIONS = ['SITE', 'APPLICATION', 'IMMERSIVE', 'WORLD', 'UNSURE'] as const;

async function adminClientIntakesFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Failed ${res.status}`);
  return data;
}

export default function ClientIntakesPage() {
  const [intakes, setIntakes] = useState<IntakeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [recipientLabel, setRecipientLabel] = useState('');
  const [ambition, setAmbition] = useState<(typeof AMBITIONS)[number]>('WORLD');
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [linkByInvite, setLinkByInvite] = useState<Record<string, string>>({});
  const [intelligence, setIntelligence] = useState<IntelligencePayload | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminClientIntakesFetch<{ intakes: IntakeSummary[] }>(
        '/api/admin/site00-client-intakes?action=list',
      );
      setIntakes(data.intakes ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createLink = async () => {
    if (!projectName.trim() || !recipientLabel.trim()) return;
    setBusy(true);
    setCreatedLink(null);
    try {
      const data = await adminClientIntakesFetch<{ privateLink: string; invite: { inviteId: string } }>(
        '/api/admin/site00-client-intakes?action=create',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectDisplayName: projectName.trim(),
            recipientLabel: recipientLabel.trim(),
            experienceAmbition: ambition,
          }),
        },
      );
      setCreatedLink(data.privateLink);
      setLinkByInvite((prev) => ({ ...prev, [data.invite.inviteId]: data.privateLink }));
      setProjectName('');
      setRecipientLabel('');
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      /* ignore */
    }
  };

  const revoke = async (inviteId: string) => {
    setBusy(true);
    try {
      await adminClientIntakesFetch('/api/admin/site00-client-intakes?action=revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId }),
      });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Revoke failed');
    } finally {
      setBusy(false);
    }
  };

  const regenerate = async (inviteId: string) => {
    setBusy(true);
    try {
      const data = await adminClientIntakesFetch<{ privateLink: string }>(
        '/api/admin/site00-client-intakes?action=regenerate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteId }),
        },
      );
      setLinkByInvite((prev) => ({ ...prev, [inviteId]: data.privateLink }));
      setCreatedLink(data.privateLink);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Regenerate failed');
    } finally {
      setBusy(false);
    }
  };

  const viewIntelligence = async (inviteId: string) => {
    setBusy(true);
    try {
      const data = await adminClientIntakesFetch<IntelligencePayload>(
        `/api/admin/site00-client-intakes?action=intelligence&inviteId=${encodeURIComponent(inviteId)}`,
      );
      setIntelligence(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Intelligence load failed');
    } finally {
      setBusy(false);
    }
  };

  const markWorldReady = async (inviteId: string) => {
    setBusy(true);
    try {
      await adminClientIntakesFetch('/api/admin/site00-client-intakes?action=mark-world-ready', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId }),
      });
      await reload();
      await viewIntelligence(inviteId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Mark ready failed — intake may be incomplete');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <h1 className="site00-admin-page-title">[ CLIENT INTAKES ]</h1>
        <p className="site00-admin-page-subtitle">PRIVATE GUEST DISCOVERY — NO ACCOUNT REQUIRED</p>
      </header>

      <section className="site00-admin-intakes-create" style={{ marginBottom: '2rem' }}>
        <h2>CREATE CLIENT INTAKE LINK</h2>
        <label>
          Project name
          <input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
        </label>
        <label>
          Client / founder label
          <input value={recipientLabel} onChange={(e) => setRecipientLabel(e.target.value)} />
        </label>
        <label>
          Experience ambition
          <select value={ambition} onChange={(e) => setAmbition(e.target.value as (typeof AMBITIONS)[number])}>
            {AMBITIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <button type="button" disabled={busy} onClick={() => void createLink()}>
          CREATE PRIVATE LINK
        </button>
        {createdLink ? (
          <div>
            <p>PRIVATE INTAKE LINK</p>
            <code>{createdLink}</code>
            <button type="button" onClick={() => void copyLink(createdLink)}>
              COPY LINK
            </button>
            <a href={createdLink} target="_blank" rel="noreferrer">
              OPEN
            </a>
          </div>
        ) : null}
      </section>

      {error ? <p role="alert">{error}</p> : null}
      {loading ? <p>Loading…</p> : null}

      <div className="site00-admin-intakes-list">
        {intakes.map((row) => {
          const link = linkByInvite[row.inviteId];
          return (
            <article key={row.inviteId} className="site00-admin-intake-card" style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #333' }}>
              <h3>{row.projectDisplayName}</h3>
              <p>{row.recipientLabel} · {row.projectExperienceClass} · {row.status}</p>
              <p>Progress {row.completionPercentage}% · {row.worldFormationReadiness}</p>
              {row.lastSavedAt ? <p>Last saved {new Date(row.lastSavedAt).toLocaleString()}</p> : null}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {link ? (
                  <>
                    <button type="button" onClick={() => void copyLink(link)}>COPY LINK</button>
                    <a href={link} target="_blank" rel="noreferrer">OPEN</a>
                  </>
                ) : (
                  <button type="button" disabled={busy} onClick={() => void regenerate(row.inviteId)}>
                    REGENERATE LINK
                  </button>
                )}
                <button type="button" disabled={busy} onClick={() => void viewIntelligence(row.inviteId)}>
                  VIEW INTELLIGENCE
                </button>
                {row.worldFormationReadiness === 'WORLD_FORMATION_READY' ? (
                  <button type="button" disabled={busy} onClick={() => void markWorldReady(row.inviteId)}>
                    MARK READY FOR FUTURE WORLD FORMATION
                  </button>
                ) : null}
                <button type="button" disabled={busy} onClick={() => void revoke(row.inviteId)}>
                  REVOKE
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {intelligence ? (
        <dialog open className="site00-admin-intelligence-panel" style={{ marginTop: '2rem', padding: '1rem' }}>
          <h2>INTELLIGENCE — {intelligence.invite.projectDisplayName}</h2>
          <p>Completion {intelligence.session?.completionPercentage ?? 0}%</p>
          {intelligence.snapshot ? (
            <p>Snapshot {intelligence.snapshot.snapshotId} · {intelligence.snapshot.readiness.state}</p>
          ) : null}
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem', maxHeight: '40vh', overflow: 'auto' }}>
            {JSON.stringify(intelligence.session?.synthesized ?? {}, null, 2)}
          </pre>
          <button type="button" onClick={() => setIntelligence(null)}>Close</button>
        </dialog>
      ) : null}
    </Site00AdminShell>
  );
}
