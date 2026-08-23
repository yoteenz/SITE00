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
      const data = await adminClientIntakesFetch<{ privateLink: string }>(
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

      <table className="site00-admin-table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Client</th>
            <th>Class</th>
            <th>Status</th>
            <th>Progress</th>
            <th>World readiness</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {intakes.map((row) => (
            <tr key={row.inviteId}>
              <td>{row.projectDisplayName}</td>
              <td>{row.recipientLabel}</td>
              <td>{row.projectExperienceClass}</td>
              <td>{row.status}</td>
              <td>{row.completionPercentage}%</td>
              <td>{row.worldFormationReadiness}</td>
              <td>
                <button type="button" disabled={busy} onClick={() => void revoke(row.inviteId)}>
                  REVOKE
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Site00AdminShell>
  );
}
