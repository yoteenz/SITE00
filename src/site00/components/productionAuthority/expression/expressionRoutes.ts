/**
 * EXPRESSION family route model (P0.STUDIOOS.PRODUCTION.EXPRESSION.RESPONSIVE-AUTHORITY-CONVERGENCE.OPUS1).
 *
 * One config for the 10 Expression families and their 40 routes. Every route lives under the existing
 * `/production/:projectSlug/expression/*` wildcard, so no router change is needed: the shell page resolves the
 * remainder of the path here. Family segments reuse the existing sub-workspace ids where they exist
 * (narrative, casting, wardrobe, performance, sets, storyboard, review); the three downstream stages that had no
 * route get one segment each (format-studio, content-package, campaign-board).
 *
 * `authority` is the paired reference path inside STUDIOOS_EXPRESSION_AUTHORITY_LITE_v2 (01_MOBILE + 02_DESKTOP_TABLET).
 */
import type { HubNodeId } from '../../../../../shared/site00-production-hub/types.js';

export type ExpressionFamilyId = 'narrative' | 'casting' | 'look' | 'performance' | 'sets' | 'storyboard' | 'review' | 'format' | 'package' | 'campaign';

export type ExpressionRouteKind = 'root' | 'child' | 'detail';

export type ExpressionRouteDef = {
  family: ExpressionFamilyId;
  /** Stable route id, unique inside the family (e.g. `momentum`, `role-detail`). */
  id: string;
  label: string;
  kind: ExpressionRouteKind;
  /** Path under `/expression/` — `:param` marks the detail parameter. */
  path: string;
  /** Paired authority reference (family folder / file stem). */
  authority: string;
  /** Child route a detail belongs to (its tab stays active). */
  parent?: string;
};

export type ExpressionFamilyDef = {
  id: ExpressionFamilyId;
  n: string;
  /** URL segment after `/expression/`. */
  segment: string;
  title: string;
  tagline: string;
  /** Hub node whose status / gate governs this family (null = downstream stage with no hub node). */
  node: HubNodeId | null;
  /** Legacy sub-workspace id (registry) the family replaces, when one existed. */
  legacy?: string;
  /** Downstream stage of the locked flow FORMAT STUDIO → CONTENT PACKAGE → CAMPAIGN BOARD. */
  downstream?: boolean;
};

export const EXPRESSION_FAMILIES: readonly ExpressionFamilyDef[] = [
  { id: 'narrative', n: '01', segment: 'narrative', title: 'NARRATIVE', tagline: 'STORY · STRUCTURE · MOMENTUM · PROOF', node: 'narrative', legacy: 'narrative' },
  { id: 'casting', n: '02', segment: 'casting', title: 'CASTING', tagline: 'ROLE · ACTOR · CHARACTER — KEPT DISTINCT', node: 'cast', legacy: 'casting' },
  { id: 'look', n: '03', segment: 'wardrobe', title: 'LOOK + WARDROBE', tagline: 'LOOKS · HAIR · MAKEUP · CONTINUITY', node: 'look', legacy: 'wardrobe' },
  { id: 'performance', n: '04', segment: 'performance', title: 'CAST + PERFORMANCE', tagline: 'SCENES · BEATS · TAKES', node: 'performance', legacy: 'performance' },
  { id: 'sets', n: '05', segment: 'sets', title: 'SETS + SCENES', tagline: 'ENVIRONMENT · SET · ZONE · PROPS · CAMERA', node: 'set', legacy: 'sets' },
  { id: 'storyboard', n: '06', segment: 'storyboard', title: 'STORYBOARD', tagline: 'SEQUENCES · FRAMES · KEYFRAMES', node: 'storyboard', legacy: 'storyboard' },
  { id: 'review', n: '07', segment: 'review', title: 'REVIEW + HANDOFF', tagline: 'APPROVALS · PACKAGE · HANDOFF', node: null, legacy: 'review' },
  { id: 'format', n: '08', segment: 'format-studio', title: 'FORMAT STUDIO', tagline: 'ONE MASTER · EVERY FORMAT', node: null, downstream: true },
  { id: 'package', n: '09', segment: 'content-package', title: 'CONTENT PACKAGE', tagline: 'DELIVERABLES · ASSEMBLY · FINALIZE', node: null, downstream: true },
  { id: 'campaign', n: '10', segment: 'campaign-board', title: 'CAMPAIGN BOARD', tagline: 'COMPLETED PACKAGES ONLY', node: null, downstream: true },
];

const r = (family: ExpressionFamilyId, id: string, label: string, kind: ExpressionRouteKind, path: string, authority: string, parent?: string): ExpressionRouteDef => ({
  family,
  id,
  label,
  kind,
  path,
  authority,
  ...(parent ? { parent } : {}),
});

/** The 40 Expression routes, in authority order. */
export const EXPRESSION_ROUTES: readonly ExpressionRouteDef[] = [
  r('narrative', 'root', 'NARRATIVE', 'root', 'narrative', '01_Narrative/00_narrative-root'),
  r('narrative', 'story', 'STORY', 'child', 'narrative/story', '01_Narrative/01_story'),
  r('narrative', 'structure', 'STRUCTURE', 'child', 'narrative/structure', '01_Narrative/02_structure'),
  r('narrative', 'momentum', 'MOMENTUM', 'child', 'narrative/momentum', '01_Narrative/03_momentum'),
  r('narrative', 'proof', 'PROOF', 'child', 'narrative/proof', '01_Narrative/04_proof'),

  r('casting', 'root', 'CASTING', 'root', 'casting', '02_Casting/00_casting-root'),
  r('casting', 'roles', 'ROLES', 'child', 'casting/roles', '02_Casting/01_roles'),
  r('casting', 'actors', 'ACTORS', 'child', 'casting/actors', '02_Casting/02_actors'),
  r('casting', 'characters', 'CHARACTERS', 'child', 'casting/characters', '02_Casting/03_characters'),
  r('casting', 'continuity', 'CONTINUITY', 'child', 'casting/continuity', '02_Casting/04_continuity'),
  r('casting', 'role-detail', 'ROLE', 'detail', 'casting/roles/:id', '02_Casting/05_role-detail', 'roles'),
  r('casting', 'actor-profile', 'ACTOR', 'detail', 'casting/actors/:id', '02_Casting/06_actor-profile', 'actors'),
  r('casting', 'character-profile', 'CHARACTER', 'detail', 'casting/characters/:id', '02_Casting/07_character-profile', 'characters'),

  r('look', 'root', 'LOOK + WARDROBE', 'root', 'wardrobe', '03_Look_Wardrobe/00_look-wardrobe-root'),
  r('look', 'looks', 'LOOKS', 'child', 'wardrobe/looks', '03_Look_Wardrobe/01_looks'),
  r('look', 'outfits', 'OUTFITS', 'child', 'wardrobe/outfits', '03_Look_Wardrobe/02_outfits'),
  r('look', 'hair', 'HAIR', 'child', 'wardrobe/hair', '03_Look_Wardrobe/03_hair'),
  r('look', 'makeup', 'MAKEUP', 'child', 'wardrobe/makeup', '03_Look_Wardrobe/04_makeup'),
  r('look', 'accessories', 'ACCESSORIES', 'child', 'wardrobe/accessories', '03_Look_Wardrobe/05_accessories'),
  r('look', 'fittings', 'FITTINGS', 'child', 'wardrobe/fittings', '03_Look_Wardrobe/06_fittings'),
  r('look', 'continuity', 'CONTINUITY', 'child', 'wardrobe/continuity', '03_Look_Wardrobe/07_continuity'),

  r('performance', 'root', 'CAST + PERFORMANCE', 'root', 'performance', '04_Cast_Performance/00_performance-root'),
  r('performance', 'scenes', 'SCENES', 'child', 'performance/scenes', '04_Cast_Performance/01_scenes'),
  r('performance', 'beats', 'BEATS', 'child', 'performance/beats', '04_Cast_Performance/02_beats'),
  r('performance', 'takes', 'TAKES', 'child', 'performance/takes', '04_Cast_Performance/03_takes'),

  r('sets', 'root', 'SETS + SCENES', 'root', 'sets', '05_Sets_Scenes/00_sets-scenes-root'),
  r('sets', 'environments', 'ENVIRONMENTS', 'child', 'sets/environments', '05_Sets_Scenes/01_environments'),
  r('sets', 'sets', 'SETS', 'child', 'sets/sets', '05_Sets_Scenes/02_sets'),
  r('sets', 'zones', 'ZONES', 'child', 'sets/zones', '05_Sets_Scenes/03_zones'),
  r('sets', 'props', 'PROPS', 'child', 'sets/props', '05_Sets_Scenes/04_props'),
  r('sets', 'graphics', 'GRAPHICS', 'child', 'sets/graphics', '05_Sets_Scenes/05_graphics'),
  r('sets', 'camera', 'CAMERA', 'child', 'sets/camera', '05_Sets_Scenes/06_camera'),

  r('storyboard', 'root', 'STORYBOARD', 'root', 'storyboard', '06_Storyboard/00_storyboard-root'),
  r('storyboard', 'sequence-detail', 'SEQUENCE', 'detail', 'storyboard/sequence/:id', '06_Storyboard/01_sequence-detail', 'root'),
  r('storyboard', 'keyframes', 'KEYFRAMES', 'child', 'storyboard/keyframes', '06_Storyboard/02_keyframes'),

  r('review', 'root', 'REVIEW + HANDOFF', 'root', 'review', '07_Review_Handoff/00_review-handoff-root'),
  r('review', 'approval-detail', 'APPROVAL', 'detail', 'review/approval/:id', '07_Review_Handoff/01_approval-detail', 'root'),

  r('format', 'root', 'FORMAT STUDIO', 'root', 'format-studio', '08_Format_Studio/00_format-studio'),
  r('package', 'root', 'CONTENT PACKAGE', 'root', 'content-package', '09_Content_Package/00_content-package'),
  r('campaign', 'root', 'CAMPAIGN BOARD', 'root', 'campaign-board', '10_Campaign_Board/00_campaign-board'),
];

export const familyDef = (id: ExpressionFamilyId): ExpressionFamilyDef => EXPRESSION_FAMILIES.find((f) => f.id === id)!;
export const familyRoutes = (id: ExpressionFamilyId) => EXPRESSION_ROUTES.filter((x) => x.family === id);
/** Tabs = the family's child routes (details keep their parent tab active; roots have no tab of their own). */
export const familyTabs = (id: ExpressionFamilyId) => EXPRESSION_ROUTES.filter((x) => x.family === id && x.kind === 'child');
export const routeDef = (family: ExpressionFamilyId, id: string) => EXPRESSION_ROUTES.find((x) => x.family === family && x.id === id)!;

export type ResolvedExpressionRoute = { family: ExpressionFamilyDef; route: ExpressionRouteDef; param: string | null };

/** Resolve the path remainder after `/expression/` (no leading slash) to a family route, or null. */
export function resolveExpressionRoute(rest: string | undefined): ResolvedExpressionRoute | null {
  const parts = (rest ?? '').split('/').filter(Boolean);
  if (!parts.length) return null;
  for (const route of EXPRESSION_ROUTES) {
    const pat = route.path.split('/');
    if (pat.length !== parts.length) continue;
    let param: string | null = null;
    const ok = pat.every((p, i) => {
      if (p === ':id') {
        param = decodeURIComponent(parts[i]!);
        return true;
      }
      return p === parts[i];
    });
    if (ok) return { family: familyDef(route.family), route, param };
  }
  return null;
}

/** Absolute href for a family route, preserving the entry context. */
export function expressionHref(slug: string, family: ExpressionFamilyId, id = 'root', param?: string, entry?: string): string {
  const def = routeDef(family, id);
  const path = def.path.replace(':id', encodeURIComponent(param ?? ''));
  return `/production/${slug}/expression/${path}${entry ? `?entry=${entry}` : ''}`;
}

/** The locked downstream flow. Campaign Board receives completed packages only. */
export const DOWNSTREAM_FLOW = ['CORE PRODUCTION', 'FINAL REEL / MASTER', 'DERIVATIVE SOCIAL', 'FORMAT STUDIO', 'CONTENT PACKAGE', 'CAMPAIGN BOARD'] as const;

/** Authority-frame screen id for a pathname inside an Expression family (null = not a family route). */
export function expressionFrameScreen(pathname: string): string | null {
  const m = /^\/production\/[^/]+\/expression\/(.+?)\/?$/.exec(pathname);
  const resolved = m ? resolveExpressionRoute(m[1]) : null;
  return resolved ? `expression-${resolved.family.id}` : null;
}
