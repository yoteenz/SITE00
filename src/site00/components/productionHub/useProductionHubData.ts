/**
 * Assembles the Hub's canonical inputs from EXISTING SITE 00 state:
 * project index, Expression Engine pipeline (B48/B49R4/NME), acting-catalogue cast state,
 * production request queue and the recorded-activity ledger. Nothing here is authored.
 */

import { useCallback, useMemo, useState } from 'react';
import { apiFetch } from '../../../utils/api';
import {
  getSite00ManagedProject,
  listDesignEnabledManagedProjects,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js';
import { compileEntry002RetroactiveNarrativeMomentum } from '../../../../shared/site00-expression-engine/narrative-momentum/entry002RetroactiveIngest.js';
import { buildEntry002ProductionCastState } from '../../../../shared/site00-studio-world/acting-catalogue/index.js';
import {
  HUB_ENTRY002,
  buildHubAssetSlots,
  buildHubAttention,
  buildHubFrames,
  buildHubGraphInput,
  buildHubScenes,
  deriveHubGraph,
  frameSlotId,
  hubAssetUrl,
  sortActivity,
  type HubActivityItem,
  type HubAssetSlot,
} from '../../../../shared/site00-production-hub/index.js';
import { productionRequestScope, productionRequestTitle } from '../../../../shared/site00-production-workspace/requestCatalog.js';
import { hubNodeAssetSlotId } from '../../../../shared/site00-production-hub/graph.js';
import { useSite00ProjectsIndex } from '../../hooks/useSite00Projects';
import { useExpressionEngineEntry002 } from '../founderWorkspace/expressionEngine/useExpressionEngineEntry002';
import { ENTRY_002_NME_DISPLAY_TITLE } from '../founderWorkspace/expressionEngine/narrativeMomentumWizardModel';
import { useProductionRequests } from '../../state/productionRequestStore';
import { activityProjectOf, recordProductionActivity, useProductionActivity } from '../../state/productionActivityStore';
import { submitProductionRequest } from '../../state/productionRequestStore';

export type HubProjectEntry = {
  projectId: string;
  name: string;
  productions: { productionId: string; label: string; subtitle: string }[];
  slotId: string;
};

const CLIENT_RE = /CLIENT/i;
const SLOT = (projectId: string) => `project.${projectId}.cover`;

export type DecisionResult = { ok: true } | { ok: false; error: string };

/**
 * P0.JURNL.SITE00-INGEST-F01: never substitute another project's data. A project missing from the hub list
 * (e.g. a newly ingested personal project) resolves from the managed registry, else as an empty project of its own.
 */
export function resolveHubProjectEntry(projects: readonly HubProjectEntry[], selectedProjectId: string): HubProjectEntry {
  const found = projects.find((p) => p.projectId === selectedProjectId);
  if (found) return found;
  const managed = getSite00ManagedProject(selectedProjectId);
  return {
    projectId: selectedProjectId,
    name: managed?.displayName ?? selectedProjectId.replace(/-/g, ' ').toUpperCase(),
    productions: [],
    slotId: SLOT(selectedProjectId),
  };
}

export function useProductionHubData(selectedProjectId: string) {
  const engine = useExpressionEngineEntry002();
  const index = useSite00ProjectsIndex();
  const requests = useProductionRequests();
  const recorded = useProductionActivity();
  const [deciding, setDeciding] = useState(false);

  /* ── projects + productions (real founder Projects data; managed registry as canonical fallback) ── */
  const projects: HubProjectEntry[] = useMemo(() => {
    const fromIndex = index.projects.filter((p) => !CLIENT_RE.test(p.classification) && p.slug !== 'site00');
    const base =
      fromIndex.length > 0
        ? fromIndex.map((p) => ({ projectId: String(p.slug), name: p.displayName }))
        : listDesignEnabledManagedProjects()
            .filter((p) => p.projectId !== 'site00')
            .map((p) => ({ projectId: p.projectId, name: p.displayName }));
    // Founder PERSONAL projects ingested into SITE 00 (e.g. JURNL) are founder work even before the server index
    // knows them (no org row yet) — list them instead of dropping them.
    for (const m of listDesignEnabledManagedProjects()) {
      if (m.relationship === 'PERSONAL' && !base.some((b) => b.projectId === m.projectId)) base.push({ projectId: m.projectId, name: m.displayName });
    }
    return base.map((p) => ({
      ...p,
      slotId: SLOT(p.projectId),
      productions:
        p.projectId === HUB_ENTRY002.projectId
          ? [{ productionId: HUB_ENTRY002.productionId, label: 'ENTRY 002', subtitle: engine.phase2?.entry002?.title ?? ENTRY_002_NME_DISPLAY_TITLE }]
          : [],
    }));
  }, [index.projects, engine.phase2]);

  const project: HubProjectEntry = useMemo(() => resolveHubProjectEntry(projects, selectedProjectId), [projects, selectedProjectId]);
  const production = project.productions[0] ?? null;
  const hasProduction = !!production;
  const isEntry002 = project.projectId === HUB_ENTRY002.projectId && hasProduction;

  /* ── canonical entry 002 facts ── */
  const plan = useMemo(() => (isEntry002 ? (engine.nme?.plan ?? compileEntry002RetroactiveNarrativeMomentum()) : null), [isEntry002, engine.nme]);
  const cast = useMemo(() => (isEntry002 ? buildEntry002ProductionCastState() : null), [isEntry002]);
  const pipe = engine.b49r4?.pipelineState ?? engine.b48?.pipelineState ?? null;
  const sb = engine.b49r4?.finalCinematicStoryboard ?? null;
  const pipelineAvailable = isEntry002 && !!(engine.b49r4 || engine.b48);

  const pipeline = useMemo(
    () => ({
      available: pipelineAvailable,
      storyboardStatus: sb?.status ?? null,
      storyboardApproved: pipe?.finalStoryboard?.approved ?? false,
      panelCount: sb?.panelCount ?? 0,
      keyframeEligibility: engine.b49r4?.productionEligibility?.keyframeEligibility ?? engine.b48?.productionEligibility?.keyframeEligibility ?? null,
      keyframesApproved: /APPROVED|COMPLETE/.test(engine.b49r4?.keyframes ?? ''),
    }),
    [pipelineAvailable, sb, pipe, engine.b49r4, engine.b48],
  );

  const graph = useMemo(
    () =>
      deriveHubGraph(
        buildHubGraphInput({ hasProduction, narrativeStatus: plan?.founderStatus ?? null, cast, pipeline }),
        { projectId: project.projectId, productionId: production?.productionId ?? null },
      ),
    [hasProduction, plan, cast, pipeline, project.projectId, production?.productionId],
  );

  const scenes = useMemo(() => (plan ? buildHubScenes(plan) : []), [plan]);
  const frames = useMemo(
    () =>
      buildHubFrames({
        storyboardId: pipeline.panelCount > 0 ? (sb?.storyboardId ?? null) : null,
        version: sb?.version ?? null,
        // Entry 002 authority filmstrip is 8 frames. Use that count until the pipeline reports panels,
        // so the mounted frame receipts render instead of an empty tray.
        count: pipeline.panelCount > 0 ? pipeline.panelCount : isEntry002 ? 8 : 0,
      }),
    [pipeline.panelCount, sb, isEntry002],
  );

  /* ── assets: registry + runtime canonical URLs (never substituted) ── */
  const slots: HubAssetSlot[] = useMemo(() => buildHubAssetSlots(), []);
  const runtimeUrls = useMemo(() => {
    const u: Record<string, string | null> = {};
    const boards = engine.b48?.preStoryboardAuthorityPack?.authorities ?? [];
    const byTitle = (t: string) => boards.find((b) => b.boardTitle === t)?.previewUrl ?? null;
    if (isEntry002) {
      u[hubNodeAssetSlotId(project.projectId, HUB_ENTRY002.productionId, 'cast')] = byTitle('SUBJECT WOMAN DUAL-ERA AUTHORITY');
      u[hubNodeAssetSlotId(project.projectId, HUB_ENTRY002.productionId, 'look')] = byTitle('SUBJECT FASHION CONTINUITY AUTHORITY');
      for (const f of frames) u[frameSlotId(f)] = f.canonicalUrl;
      u[hubNodeAssetSlotId(project.projectId, HUB_ENTRY002.productionId, 'storyboard')] = frames[0]?.canonicalUrl ?? sb?.storyboardStripUrl ?? null;
    }
    return u;
  }, [engine.b48, frames, isEntry002, project.projectId, sb]);
  const assetUrl = useCallback((slotId: string | null) => (slotId ? hubAssetUrl(slotId, runtimeUrls) : null), [runtimeUrls]);
  const slotMeta = useCallback((slotId: string | null) => slots.find((s) => s.slotId === slotId) ?? null, [slots]);

  /* ── project scope: requests and recorded activity belong to ONE project (never another project's rows) ── */
  const projectRequests = useMemo(() => requests.filter((r) => r.projectSlug.toLowerCase() === project.projectId), [requests, project.projectId]);
  const projectRecorded = useMemo(
    () => recorded.filter((a) => activityProjectOf(a, projects.map((p) => ({ projectId: p.projectId, name: p.name }))) === project.projectId),
    [recorded, projects, project.projectId],
  );

  /* ── attention + activity ── */
  const pendingRequests = useMemo(
    () =>
      projectRequests
        .filter((r) => r.status === 'QUEUED')
        .map((r) => ({ id: r.id, title: productionRequestTitle(r.kind), scope: productionRequestScope(r.kind), projectSlug: r.projectSlug })),
    [projectRequests],
  );
  const attention = useMemo(
    () =>
      buildHubAttention({
        graph,
        projectId: project.projectId,
        productionId: production?.productionId ?? null,
        selectedSceneId: null,
        scenes,
        pendingRequests,
        castUnresolved: cast ? cast.characters.filter((c) => c.screenImportance !== 'ENSEMBLE' && c.status !== 'LOCKED').map((c) => c.characterName) : [],
      }),
    [graph, project.projectId, production?.productionId, scenes, pendingRequests, cast],
  );

  const activity: HubActivityItem[] = useMemo(() => {
    const fromRequests: HubActivityItem[] = projectRequests.map((r) => ({
      id: `req.${r.id}`,
      category: 'REQUEST',
      title: productionRequestTitle(r.kind).toUpperCase(),
      detail: `${r.projectSlug.toUpperCase()} · ${productionRequestScope(r.kind)}`,
      at: r.createdAt,
      actor: null,
      assetSlotId: null,
      projectId: project.projectId,
    }));
    return sortActivity([...projectRecorded, ...fromRequests]);
  }, [projectRecorded, projectRequests, project.projectId]);

  /* ── consequential actions (existing production action; no silent mutation) ── */
  const decideStoryboard = useCallback(
    async (decision: 'APPROVE' | 'REVISE', note: string): Promise<DecisionResult> => {
      setDeciding(true);
      try {
        const res = await apiFetch('/api/site00/expression-engine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SET_FINAL_CINEMATIC_STORYBOARD_JUDGMENT',
            founderJudgment: decision === 'APPROVE' ? 'LOVE_IT' : 'PROMISING_REFINE',
          }),
        });
        if (!res.ok) return { ok: false, error: (await res.text()) || `Request failed (${res.status})` };
        if (decision === 'REVISE') submitProductionRequest({ projectSlug: project.projectId, kind: 'EXPRESSION_STORYBOARD_REVISION', note });
        recordProductionActivity({
          category: 'APPROVAL',
          title: decision === 'APPROVE' ? 'STORYBOARD AUTHORITY APPROVED' : 'STORYBOARD REVISION REQUESTED',
          detail: `${project.name.toUpperCase()} · ${production?.label ?? ''}${note ? ` · ${note}` : ''}`,
          assetSlotId: hubNodeAssetSlotId(project.projectId, production?.productionId ?? null, 'storyboard'),
          projectId: project.projectId,
        });
        await engine.reload();
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : 'Decision could not be recorded.' };
      } finally {
        setDeciding(false);
      }
    },
    [engine, project, production],
  );

  return {
    projects,
    project,
    production,
    hasProduction,
    isEntry002,
    plan,
    cast,
    graph,
    scenes,
    frames,
    pipeline,
    storyboardVersion: sb?.version ?? null,
    storyboardMode: sb?.generationMode ?? null,
    slots,
    assetUrl,
    slotMeta,
    attention,
    activity,
    decideStoryboard,
    deciding,
    loading: engine.loading,
    /** Expression Engine read error (only meaningful for a project that has an expression production). */
    engineError: isEntry002 && engine.error ? String(engine.error) : null,
    requests: projectRequests,
    projectsSource: index.sourceLabel,
    b48: engine.b48,
  };
}

export type HubData = ReturnType<typeof useProductionHubData>;
