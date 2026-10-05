import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';
import type { IdentityCanonFieldKey, FieldJudgmentValue } from '../../../shared/site00-identity/identityFields.js';

export type IdentityTerritoryView = {
  id: string;
  territory_key: string;
  working_label: string;
  strategic_premise: string;
  status: string;
  payload: Record<string, unknown>;
  creative_hypotheses?: unknown[];
  source_truth_refs?: string[];
};

export type TerritoryVerificationView = {
  territoryId: string;
  territoryKey: string;
  workingLabel: string;
  status: string;
  strategicPremise: string;
  payload: Record<string, unknown>;
  creativeHypotheses: unknown[];
  sourceTruthRefCount: number;
  valid: boolean;
  issues: string[];
};

export type WorldHierarchyNodeView = {
  id: string;
  node_type: string;
  slug: string;
  display_name: string;
  parent_id: string | null;
  truth_layer: string;
  is_canonical?: boolean;
};

export type IdentityReviewStateView = {
  founderJudgmentState: string;
  territoryCount: number;
  territories: TerritoryVerificationView[];
  fieldJudgmentCount: number;
  structuralConfirmations: Record<string, boolean>;
  canonFieldCount: number;
  identityCanonVersion: number | null;
};

export type PromotionPreviewView = {
  eligible: Array<{ fieldKey: string; territoryId: string; value: unknown; sourceJudgmentId: string }>;
  blocked: Array<{ fieldKey: string; reason: string }>;
  structuralWorldReady: boolean;
};

const FIELD_LABELS: Record<IdentityCanonFieldKey, string> = {
  masterBrandPositioning: 'Master Brand Positioning',
  masterBrandPersonality: 'Master Brand Personality',
  masterBrandTone: 'Master Brand Tone',
  masterBrandDirection: 'Master Brand Direction',
  typographyDirection: 'Typography Direction',
  paletteDirection: 'Palette Direction',
  symbolicLanguage: 'Symbolic Language',
  astreaDistrictExpression: 'Astréa District Expression',
  masterDistrictRelationship: 'Master/District Relationship',
  districtMarkerSystem: 'District Marker System',
  signageDirection: 'Signage Direction',
  environmentalIdentityPrinciples: 'Environmental Identity Principles',
  differentiationStrategy: 'Differentiation Strategy',
  futureDistrictModel: 'Future District Model',
};

export function fieldLabel(key: IdentityCanonFieldKey): string {
  return FIELD_LABELS[key] ?? key;
}

export function useProjectIdentity(projectSlug: string) {
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [brief, setBrief] = useState<Record<string, unknown> | null>(null);
  const [territories, setTerritories] = useState<IdentityTerritoryView[]>([]);
  const [hierarchy, setHierarchy] = useState<WorldHierarchyNodeView[]>([]);
  const [bible, setBible] = useState<Record<string, unknown> | null>(null);
  const [reviewState, setReviewState] = useState<IdentityReviewStateView | null>(null);
  const [promotionPreview, setPromotionPreview] = useState<PromotionPreviewView | null>(null);
  const [activeTerritoryId, setActiveTerritoryId] = useState<string | null>(null);
  const [entering, setEntering] = useState(false);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    if (!projectSlug) return;
    setState('loading');
    setError(null);
    try {
      const [briefRes, terrRes, hierRes, bibleRes, reviewRes, previewRes] = await Promise.all([
        apiFetch(`/api/site00/projects?action=identity_brief&slug=${encodeURIComponent(projectSlug)}`).then((r) => r.json()),
        apiFetch(`/api/site00/projects?action=identity_territories&slug=${encodeURIComponent(projectSlug)}`).then((r) => r.json()),
        apiFetch(`/api/site00/projects?action=world_hierarchy&slug=${encodeURIComponent(projectSlug)}`).then((r) => r.json()),
        apiFetch(`/api/site00/projects?action=project_bible&slug=${encodeURIComponent(projectSlug)}`).then((r) => r.json()),
        apiFetch(`/api/site00/projects?action=identity_review_state&slug=${encodeURIComponent(projectSlug)}`).then((r) => r.json()),
        apiFetch(`/api/site00/projects?action=identity_promotion_preview&slug=${encodeURIComponent(projectSlug)}`).then((r) => r.json()),
      ]);
      setBrief((briefRes as { brief: { brief: Record<string, unknown> } | null }).brief?.brief ?? null);
      setTerritories((terrRes as { territories: IdentityTerritoryView[] }).territories ?? []);
      setHierarchy((hierRes as { nodes: WorldHierarchyNodeView[] }).nodes ?? []);
      setBible((bibleRes as { bible: Record<string, unknown> }).bible ?? null);
      setReviewState((reviewRes as { reviewState: IdentityReviewStateView }).reviewState ?? null);
      setPromotionPreview((previewRes as { preview: PromotionPreviewView }).preview ?? null);
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
    async (territoryId: string, judgment: 'SELECT' | 'REVISE' | 'REJECT' | 'HYBRIDIZE') => {
      setActing(true);
      try {
        const res = await apiFetch(`/api/site00/projects?action=identity_judgment`, {
          method: 'POST',
          body: { slug: projectSlug, territoryId, judgment },
        });
        if (!res.ok) throw new Error(await res.text());
        await load();
      } finally {
        setActing(false);
      }
    },
    [projectSlug, load],
  );

  const submitFieldJudgment = useCallback(
    async (
      territoryId: string,
      fieldKey: IdentityCanonFieldKey,
      judgment: FieldJudgmentValue,
      hierarchyScope: 'MASTER' | 'DISTRICT' = 'MASTER',
      notes?: string,
    ) => {
      setActing(true);
      try {
        const res = await apiFetch(`/api/site00/projects?action=identity_field_judgment`, {
          method: 'POST',
          body: {
            slug: projectSlug,
            territoryId,
            fieldKey,
            judgment,
            hierarchyScope,
            notes,
            founderCritique: judgment === 'REVISE' ? notes : undefined,
          },
        });
        if (!res.ok) throw new Error(await res.text());
        await load();
      } finally {
        setActing(false);
      }
    },
    [projectSlug, load],
  );

  const confirmWorldStructure = useCallback(async () => {
    setActing(true);
    try {
      const res = await apiFetch(`/api/site00/projects?action=canon_promote_world_structure`, {
        method: 'POST',
        body: {
          slug: projectSlug,
          confirmations: {
            master_product_universe: true,
            astrea_flagship_district: true,
            astrea_destinations: true,
            future_districts_supported: true,
            world_structure_model: true,
          },
        },
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } finally {
      setActing(false);
    }
  }, [projectSlug, load]);

  const promoteApprovedFields = useCallback(async () => {
    if (!promotionPreview?.eligible.length) return;
    setActing(true);
    try {
      const res = await apiFetch(`/api/site00/projects?action=canon_promote_fields`, {
        method: 'POST',
        body: {
          slug: projectSlug,
          approvals: promotionPreview.eligible.map((e) => ({
            fieldKey: e.fieldKey,
            hierarchyScope: 'MASTER' as const,
            territoryId: e.territoryId,
            sourceJudgmentId: e.sourceJudgmentId,
            value: e.value,
          })),
        },
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } finally {
      setActing(false);
    }
  }, [projectSlug, promotionPreview, load]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    state,
    error,
    brief,
    territories,
    hierarchy,
    bible,
    reviewState,
    promotionPreview,
    activeTerritoryId,
    setActiveTerritoryId,
    entering,
    acting,
    enterIdentity,
    submitJudgment,
    submitFieldJudgment,
    confirmWorldStructure,
    promoteApprovedFields,
    reload: load,
  };
}
