/**
 * Production → EXPRESSION family screens (P0.STUDIOOS.PRODUCTION.EXPRESSION.RESPONSIVE-AUTHORITY-CONVERGENCE.OPUS1).
 *
 * The 10 Expression families / 40 routes render through ONE shell (ExpressionFamilyShell) inside the shared
 * Production authority frame. This module maps a resolved route to its family body and keeps the previous
 * sub-screen exports + test ids (expression-sub-screen-*) so existing links and checks keep working.
 * Reads canonical Entry 002 data; the only writes are the existing founder actions (narrative judgment,
 * storyboard decision) — no provider dispatch.
 */
import { useMemo, type ComponentType } from 'react';
import { CastingFamily } from '../productionAuthority/expression/families/CastingFamily';
import { DownstreamFamily } from '../productionAuthority/expression/families/DownstreamFamily';
import { LookFamily } from '../productionAuthority/expression/families/LookFamily';
import { NarrativeFamily } from '../productionAuthority/expression/families/NarrativeFamily';
import { PerformanceFamily } from '../productionAuthority/expression/families/PerformanceFamily';
import { ReviewFamily } from '../productionAuthority/expression/families/ReviewFamily';
import { SetsFamily } from '../productionAuthority/expression/families/SetsFamily';
import { StoryboardFamily } from '../productionAuthority/expression/families/StoryboardFamily';
import type { FamilyProps } from '../productionAuthority/expression/families/types';
import { useExpressionData, type ExpressionData } from '../productionAuthority/expression/expressionData';
import { ExpressionFamilyShell } from '../productionAuthority/expression/ExpressionFamilyShell';
import {
  expressionHref,
  familyDef,
  routeDef,
  type ExpressionFamilyId,
  type ResolvedExpressionRoute,
} from '../productionAuthority/expression/expressionRoutes';
import '../../styles/site00-production-expression-family.css';

const BODIES: Record<ExpressionFamilyId, ComponentType<FamilyProps>> = {
  narrative: NarrativeFamily,
  casting: CastingFamily,
  look: LookFamily,
  performance: PerformanceFamily,
  sets: SetsFamily,
  storyboard: StoryboardFamily,
  review: ReviewFamily,
  format: DownstreamFamily,
  package: DownstreamFamily,
  campaign: DownstreamFamily,
};

/** Pre-existing sub-screen test ids, kept on each family body. */
const LEGACY_TESTID: Record<string, string> = {
  narrative: 'expression-sub-screen-narrative',
  casting: 'expression-sub-screen-casting',
  wardrobe: 'expression-sub-screen-wardrobe',
  performance: 'expression-sub-screen-performance',
  sets: 'expression-sub-screen-sets',
  storyboard: 'expression-sub-screen-storyboard',
  review: 'expression-sub-screen-review',
};

function detailName(d: ExpressionData, r: ResolvedExpressionRoute): string | undefined {
  if (r.route.kind !== 'detail' || !r.param) return undefined;
  switch (r.route.id) {
    case 'role-detail':
      return d.role(r.param)?.narrativeRole;
    case 'actor-profile':
      return d.actor(r.param)?.stageName.toUpperCase();
    case 'character-profile':
      return d.character(r.param)?.characterName;
    case 'sequence-detail':
      return d.scenes.find((s) => s.sceneId === r.param)?.label;
    case 'approval-detail':
      return d.items.find((i) => i.id === r.param)?.label.toUpperCase();
    default:
      return undefined;
  }
}

export function ExpressionFamilyScreen({ slug, entry, resolved }: { slug: string; entry: string; resolved: ResolvedExpressionRoute }) {
  const d = useExpressionData(slug);
  const go = useMemo(() => (f: ExpressionFamilyId, id = 'root', param?: string) => expressionHref(slug, f, id, param, entry), [slug, entry]);
  const Body = BODIES[resolved.family.id];
  return (
    <ExpressionFamilyShell resolved={resolved} slug={slug} entry={entry} legacyTestId={resolved.family.legacy ? LEGACY_TESTID[resolved.family.legacy] : undefined} detailName={detailName(d, resolved)}>
      <Body d={d} r={resolved} entry={entry} go={go} />
    </ExpressionFamilyShell>
  );
}

type SubProps = { slug: string; entry: string };
const rootOf = (family: ExpressionFamilyId): ResolvedExpressionRoute => ({ family: familyDef(family), route: routeDef(family, 'root'), param: null });

/* Previous sub-screen exports → their family roots. */
export const NarrativeScreen = (p: SubProps) => <ExpressionFamilyScreen {...p} resolved={rootOf('narrative')} />;
export const CastingScreen = (p: SubProps) => <ExpressionFamilyScreen {...p} resolved={rootOf('casting')} />;
export const WardrobeScreen = (p: SubProps) => <ExpressionFamilyScreen {...p} resolved={rootOf('look')} />;
export const PerformanceScreen = (p: SubProps) => <ExpressionFamilyScreen {...p} resolved={rootOf('performance')} />;
export const SetsScreen = (p: SubProps) => <ExpressionFamilyScreen {...p} resolved={rootOf('sets')} />;
export const StoryboardScreen = (p: SubProps) => <ExpressionFamilyScreen {...p} resolved={rootOf('storyboard')} />;
export const ReviewScreen = (p: SubProps) => <ExpressionFamilyScreen {...p} resolved={rootOf('review')} />;
