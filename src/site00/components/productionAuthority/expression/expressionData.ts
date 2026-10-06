/**
 * EXPRESSION family data adapter. One read model for all 40 routes, built only from canonical sources:
 *  - Entry 002 narrative momentum plan + production cast state (useEntry002Production)
 *  - Studio World acting catalogue (actors = talent)
 *  - live Production hub data (graph, founder gate, scenes, storyboard frames, asset slots, attention)
 * Nothing here is authored for the UI and nothing writes. Missing material stays missing (empty / UNMOUNTED).
 *
 * ROLE = casting requirement (CastingRequirement) · ACTOR = talent (StudioWorldActor) · CHARACTER = story identity
 * (ProductionCharacter). They are separate records joined only by ids and never merged here.
 */
import { useMemo } from 'react';
import { buildHubScenes, hubNodeAssetSlotId, type HubNodeId } from '../../../../../shared/site00-production-hub/index.js';
import {
  findActorById,
  getStudioWorldActorCatalogue,
  validateCharacterContinuity,
  type CastingRequirement,
  type CharacterCampaignLook,
  type ProductionCharacter,
  type StudioWorldActor,
} from '../../../../../shared/site00-studio-world/acting-catalogue/index.js';
import { isEntry002Project, useEntry002Production, type PackageItem, type PackageItemStatus } from '../../production/useEntry002Production';
import { useProductionAuthorityData } from '../ProductionAuthorityData';

export const words = (s: string | null | undefined) => (s ? s.replace(/_/g, ' ') : '—');
export const upper = (s: string | null | undefined) => (s ? s.toUpperCase() : '—');
export const done = (s: PackageItemStatus) => s === 'APPROVED' || s === 'LOCKED';

/** Visual reading of the canonical tension stage (never stored, never authored). */
export const TENSION_LEVEL: Record<string, number> = { LOW: 18, RISING: 38, INTERRUPTION: 50, ESCALATION: 66, PEAK: 92, RELEASE: 52, RESIDUAL: 34 };

export type DeliverableState = 'PLANNED' | 'ASSEMBLED';

export function useExpressionData(slugIn?: string) {
  const hub = useProductionAuthorityData();
  const prod = useEntry002Production();
  const slug = (slugIn ?? hub?.project.projectId ?? '').toLowerCase();
  return useMemo(() => {
    const { plan, cast, gate, items, ready, total } = prod;
    const ok = isEntry002Project(slug);
    const actors: readonly StudioWorldActor[] = getStudioWorldActorCatalogue().actors;
    const graph = hub?.graph ?? null;
    const scenes = hub?.scenes?.length ? hub.scenes : buildHubScenes(plan);
    const frames = hub?.frames ?? [];
    const assetUrl = (slotId: string | null) => (hub && slotId ? hub.assetUrl(slotId) : null);
    const productionId = hub?.production?.productionId ?? null;
    const nodeSlot = (node: HubNodeId) => hubNodeAssetSlotId(slug, productionId, node);
    const nodeArt = (node: HubNodeId) => assetUrl(graph?.byId[node]?.assetSlotId ?? nodeSlot(node));

    const role = (id: string | null | undefined): CastingRequirement | null => cast.requirements.find((r) => r.requirementId === id) ?? null;
    const character = (id: string | null | undefined): ProductionCharacter | null => cast.characters.find((c) => c.characterId === id) ?? null;
    const actor = (id: string | null | undefined): StudioWorldActor | null => (id ? (actors.find((a) => a.actorId === id) ?? findActorById(id) ?? null) : null);
    const look = (id: string | null | undefined): CharacterCampaignLook | null => cast.looks.find((l) => l.lookId === id) ?? null;
    const charactersForRole = (reqId: string) => cast.characters.filter((c) => c.castingRequirementId === reqId);
    const charactersForActor = (actorId: string) => cast.characters.filter((c) => c.actorId === actorId);
    const sheet = (characterId: string) => cast.authoritySheets.find((s) => s.characterId === characterId) ?? null;
    const temporal = (characterId: string) => cast.temporalLooks.filter((t) => t.characterId === characterId);
    const looksFor = (characterId: string) => cast.looks.filter((l) => l.characterId === characterId);

    const continuity = cast.characters.map((c) => {
      const t = temporal(c.characterId);
      const lk = look(c.campaignLookId);
      const res = validateCharacterContinuity({
        character: c,
        actor: actor(c.actorId),
        look: lk,
        temporalLook: t.find((x) => x.campaignLookId === c.campaignLookId) ?? null,
        authoritySheet: sheet(c.characterId),
        priorLook: null,
      });
      return { character: c, valid: res.valid, flags: res.driftFlags };
    });

    /** Shots with cast placements (shotCastByShotId) = recorded takes / blocking. */
    const shotCast = Object.entries(cast.shotCastByShotId ?? {}).flatMap(([shotId, rows]) => rows.map((row) => ({ shotId, ...row })));

    /** Props named by the approved looks (the only prop source in canonical data). */
    const props = cast.looks.flatMap((l) => l.props.map((p) => ({ prop: p, lookId: l.lookId, lookLabel: l.label, characterId: l.characterId })));

    /** Downstream: format adaptations of the master narrative → planned deliverables. Nothing is assembled until a
     *  rendered master exists (keyframes node complete), so every deliverable is PLANNED and Campaign Board receives
     *  no package. */
    const masterReady = graph?.byId.keyframes?.status === 'COMPLETE';
    const deliverables = plan.formatAdaptations.map((f) => ({
      id: `deliverable-${f.format.toLowerCase()}`,
      format: f.format,
      spec: f.durationOrSlideCount,
      beats: f.beatsUsed.length,
      opening: f.openingStrategy,
      closing: f.closingStrategy,
      // no assembly record exists in canonical data yet — a deliverable is ASSEMBLED only when one does
      state: 'PLANNED' as DeliverableState,
    }));
    const assembled = deliverables.filter((d) => d.state === 'ASSEMBLED').length;
    const packageComplete = deliverables.length > 0 && assembled === deliverables.length;
    const completedPackages = packageComplete ? 1 : 0;

    const itemFor = (id: PackageItem['id']) => items.find((i) => i.id === id)!;

    return {
      slug,
      ok,
      hub,
      plan,
      cast,
      gate,
      items,
      ready,
      total,
      actors,
      graph,
      scenes,
      frames,
      assetUrl,
      nodeArt,
      nodeSlot,
      role,
      character,
      actor,
      look,
      charactersForRole,
      charactersForActor,
      sheet,
      temporal,
      looksFor,
      continuity,
      shotCast,
      props,
      masterReady,
      deliverables,
      assembled,
      packageComplete,
      completedPackages,
      itemFor,
      attention: hub?.attention ?? [],
      activity: hub?.activity ?? [],
    };
  }, [prod, hub, slug]);
}

export type ExpressionData = ReturnType<typeof useExpressionData>;
