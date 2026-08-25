import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';

export type IdentityTerritoryView = {
  id: string;
  territory_key: string;
  working_label: string;
  strategic_premise: string;
  status: string;
  payload: Record<string, unknown>;
};

export type WorldHierarchyNodeView = {
  id: string;
  node_type: string;
  slug: string;
  display_name: string;
  parent_id: string | null;
  truth_layer: string;
};

export function useProjectIdentity(projectSlug: string) {
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [brief, setBrief] = useState<Record<string, unknown> | null>(null);
  const [territories, setTerritories] = useState<IdentityTerritoryView[]>([]);
  const [hierarchy, setHierarchy] = useState<WorldHierarchyNodeView[]>([]);
  const [bible, setBible] = useState<Record<string, unknown> | null>(null);
  const [entering, setEntering] = useState(false);

  const load = useCallback(async () => {
    if (!projectSlug) return;
    setState('loading');
    setError(null);
    try {
      const [briefRes, terrRes, hierRes, bibleRes] = await Promise.all([
        apiFetch(`/api/site00/projects?action=identity_brief&slug=${encodeURIComponent(projectSlug)}`).then((r) => r.json()),
        apiFetch(`/api/site00/projects?action=identity_territories&slug=${encodeURIComponent(projectSlug)}`).then((r) => r.json()),
        apiFetch(`/api/site00/projects?action=world_hierarchy&slug=${encodeURIComponent(projectSlug)}`).then((r) => r.json()),
        apiFetch(`/api/site00/projects?action=project_bible&slug=${encodeURIComponent(projectSlug)}`).then((r) => r.json()),
      ]);
      setBrief((briefRes as { brief: { brief: Record<string, unknown> } | null }).brief?.brief ?? null);
      setTerritories((terrRes as { territories: IdentityTerritoryView[] }).territories ?? []);
      setHierarchy((hierRes as { nodes: WorldHierarchyNodeView[] }).nodes ?? []);
      setBible((bibleRes as { bible: Record<string, unknown> }).bible ?? null);
      setState('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load identity data');
      setState('error');
    }
  }, [projectSlug]);

  const enterIdentity = useCallback(async () => {
    setEntering(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/site00/projects?action=identity_enter`, {
        method: 'POST',
        body: { slug: projectSlug },
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to enter identity phase');
    } finally {
      setEntering(false);
    }
  }, [projectSlug, load]);

  const submitJudgment = useCallback(
    async (territoryId: string, judgment: 'SELECT' | 'REVISE' | 'REJECT') => {
      const res = await apiFetch(`/api/site00/projects?action=identity_judgment`, {
        method: 'POST',
        body: { slug: projectSlug, territoryId, judgment },
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    },
    [projectSlug, load],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return { state, error, brief, territories, hierarchy, bible, entering, enterIdentity, submitJudgment, reload: load };
}
