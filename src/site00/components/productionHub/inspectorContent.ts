/**
 * Node Inspector content — every row is read from canonical SITE 00 state.
 * Rows with no canonical value show an explicit NOT AVAILABLE, never a placeholder fact.
 */
import { findActorById } from '../../../../shared/site00-studio-world/acting-catalogue/index.js';
import type { NarrativeMomentumPlan } from '../../../../shared/site00-expression-engine/narrative-momentum/types.js';
import type { ProductionCastState } from '../../../../shared/site00-studio-world/acting-catalogue/types.js';
import { HUB_NODE_LABEL, HUB_STATUS_LABEL } from '../../../../shared/site00-production-hub/graph.js';
import type { HubNode, HubNodeId } from '../../../../shared/site00-production-hub/types.js';

export type InspectorTab = { id: string; label: string };
export type InspectorRow = { k: string; v: string };
export type InspectorView = { tabs: InspectorTab[]; rows: InspectorRow[]; subject: { eyebrow: string; title: string; chip: string | null }; meta: InspectorRow[] };

const NA = 'NOT AVAILABLE';
const up = (s: string | null | undefined) => (s && s.trim() ? s : NA);
const words = (s: string) => s.replace(/_/g, ' ');

export function buildInspectorView(args: {
  node: HubNode;
  tab: string;
  plan: NarrativeMomentumPlan | null;
  cast: ProductionCastState | null;
  storyboard: { status: string | null; version: string | null; panelCount: number; mode: string | null } | null;
  keyframeEligibility: string | null;
}): InspectorView {
  const { node, plan, cast } = args;
  const tabs: InspectorTab[] = node.quickActions.filter((a) => a.kind === 'INSPECT_TAB').map((a) => ({ id: a.target, label: a.label }));
  const tab = tabs.some((t) => t.id === args.tab) ? args.tab : (tabs[0]?.id ?? '');
  const meta: InspectorRow[] = [
    { k: 'STATUS', v: HUB_STATUS_LABEL[node.status] },
    { k: 'DETAIL', v: node.statusDetail.toUpperCase() },
    { k: 'DEPENDS ON', v: node.dependsOn.length ? node.dependsOn.map((d) => HUB_NODE_LABEL[d]).join(' · ') : 'NONE' },
    { k: 'UNLOCKS', v: node.unlocks.length ? node.unlocks.map((d) => HUB_NODE_LABEL[d]).join(' · ') : 'NONE' },
  ];

  const hero = cast?.characters.find((c) => c.screenImportance === 'HERO') ?? null;
  const actor = hero?.actorId ? findActorById(hero.actorId) : null;
  const rows = (id: HubNodeId): InspectorRow[] => {
    switch (id) {
      case 'cast':
        if (tab === 'looks') return (cast?.looks ?? []).map((l) => ({ k: l.era || 'LOOK', v: l.label }));
        if (tab === 'continuity')
          return (cast?.temporalLooks ?? []).length
            ? cast!.temporalLooks.map((t) => ({ k: t.eraLabel, v: up(t.narrativeReason) }))
            : [{ k: 'CONTINUITY', v: NA }];
        if (tab === 'performance')
          return [
            { k: 'DIRECTION', v: up(hero?.performanceDirection) },
            { k: 'PERSONALITY', v: up(hero?.personality) },
            { k: 'MOTIVATION', v: up(hero?.motivation) },
          ];
        return [
          { k: 'ROLE', v: up(hero?.narrativeRole).toUpperCase() },
          { k: 'CODE', v: up(actor?.catalogueNumber) },
          { k: 'AGE RANGE', v: up(actor?.ageRange) },
          { k: 'HEIGHT', v: up(actor?.heightRange) },
          { k: 'HAIR', v: up(actor?.hairBaseline) },
          { k: 'AVAILABILITY', v: actor ? words(actor.availabilityState) : NA },
          { k: 'CHARACTER STATUS', v: hero ? words(hero.status) : NA },
        ];
      case 'narrative':
        if (tab === 'beats') return (plan?.beats ?? []).map((b) => ({ k: `${String(b.order).padStart(2, '0')} ${b.label}`, v: b.tensionStage }));
        if (tab === 'proof') return (plan?.evidence ?? []).map((e) => ({ k: words(e.proofType), v: words(e.status) }));
        return [
          { k: 'GOAL', v: up(plan?.narrativeGoal) },
          { k: 'STARTING BELIEF', v: up(plan?.audienceStartingBelief) },
          { k: 'DESIRED SHIFT', v: up(plan?.audienceDesiredShift) },
          { k: 'GRAMMAR', v: plan ? words(plan.selectedGrammarId) : NA },
          { k: 'PLAN STATUS', v: plan ? words(plan.founderStatus) : NA },
        ];
      case 'look': {
        const looks = cast?.looks ?? [];
        const pick = looks[0];
        if (tab === 'hair') return looks.map((l) => ({ k: l.era || l.label, v: up(l.hair) }));
        if (tab === 'makeup') return looks.map((l) => ({ k: l.era || l.label, v: up(l.makeup) }));
        return looks.length ? looks.map((l) => ({ k: l.era || 'LOOK', v: up(l.label) })) : [{ k: 'LOOKS', v: pick ? '' : NA }];
      }
      case 'performance': {
        const players = (cast?.characters ?? []).filter((c) => c.screenImportance !== 'ENSEMBLE');
        if (!players.length) return [{ k: 'PERFORMANCE', v: NA }];
        if (tab === 'movement' || tab === 'voice')
          return players.map((c) => {
            const a = c.actorId ? findActorById(c.actorId) : null;
            return { k: c.characterName, v: tab === 'voice' ? up(a?.languages.join(', ')) : up(a?.performanceProfile.map(words).join(', ')) };
          });
        return players.map((c) => ({ k: c.characterName, v: up(c.performanceDirection) }));
      }
      case 'set':
        return [
          { k: tab.toUpperCase() || 'SET', v: '0 DEFINED' },
          { k: 'ENVIRONMENT', v: 'NOT ASSIGNED' },
          { k: 'SET AUTHORITY', v: NA },
        ];
      case 'storyboard':
        return [
          { k: 'STATUS', v: args.storyboard?.status ? words(args.storyboard.status) : 'NOT GENERATED' },
          { k: 'FRAMES', v: String(args.storyboard?.panelCount ?? 0) },
          { k: 'VERSION', v: up(args.storyboard?.version) },
          { k: 'GENERATION MODE', v: args.storyboard?.mode ? words(args.storyboard.mode) : NA },
        ];
      case 'keyframes':
        return [{ k: 'ELIGIBILITY', v: args.keyframeEligibility ? words(args.keyframeEligibility) : 'BLOCKED' }];
      default:
        return [];
    }
  };

  const subject =
    node.id === 'cast'
      ? { eyebrow: 'SUBJECT', title: hero ? `${hero.characterName}${actor ? ` / ${actor.catalogueNumber}` : ''}` : node.label, chip: hero?.status === 'LOCKED' ? 'LOCKED' : null }
      : { eyebrow: 'STAGE', title: node.label, chip: node.status === 'COMPLETE' ? 'COMPLETE' : null };

  return { tabs, rows: rows(node.id), subject, meta };
}
