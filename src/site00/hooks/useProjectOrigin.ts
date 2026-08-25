import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';

export type OriginHealthPayload = {
  projectSlug: string;
  projectStatus: string;
  originStatus: string;
  clientTruthRecordCount: number;
  sourceReferenceCount: number;
  unresolvedDecisionCount: number;
  canonRecordCountCreatedByOrigin: number;
  crossProjectLeakCount: number;
  ingestionSessionCount: number;
  originSummaryGenerated: boolean;
};

export type ClientTruthRecordView = {
  id: string;
  title: string | null;
  status: string;
  payload: Record<string, unknown>;
  source: string | null;
};

export type OriginSummaryView = {
  id: string;
  summary: {
    sections: Record<string, Array<{ title: string | null; label: string; excerpt: string }>>;
    unresolvedCount: number;
    clientTruthCount: number;
    note: string;
  };
  is_canonical: boolean;
};

type OriginState = 'idle' | 'loading' | 'ready' | 'error';

export function useProjectOrigin(projectSlug: string) {
  const [state, setState] = useState<OriginState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<OriginHealthPayload | null>(null);
  const [records, setRecords] = useState<ClientTruthRecordView[]>([]);
  const [summary, setSummary] = useState<OriginSummaryView | null>(null);
  const [ingesting, setIngesting] = useState(false);

  const load = useCallback(async () => {
    if (!projectSlug) return;
    setState('loading');
    setError(null);
    try {
      const [healthRes, truthRes, summaryRes] = await Promise.all([
        apiFetch(`/api/site00/projects?action=origin_health&slug=${encodeURIComponent(projectSlug)}`).then((r) => r.json()),
        apiFetch(`/api/site00/projects?action=client_truth_list&slug=${encodeURIComponent(projectSlug)}`).then((r) => r.json()),
        apiFetch(`/api/site00/projects?action=origin_summary&slug=${encodeURIComponent(projectSlug)}`).then((r) => r.json()),
      ]);
      setHealth((healthRes as { health: OriginHealthPayload }).health);
      setRecords((truthRes as { records: ClientTruthRecordView[] }).records ?? []);
      setSummary((summaryRes as { summary: OriginSummaryView | null }).summary ?? null);
      setState('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load origin data');
      setState('error');
    }
  }, [projectSlug]);

  const runIngestion = useCallback(async () => {
    if (!projectSlug) return;
    setIngesting(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/site00/projects?action=origin_ingest`, {
        method: 'POST',
        body: { slug: projectSlug },
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ingestion failed');
    } finally {
      setIngesting(false);
    }
  }, [projectSlug, load]);

  useEffect(() => {
    void load();
  }, [load]);

  return { state, error, health, records, summary, ingesting, runIngestion, reload: load };
}
