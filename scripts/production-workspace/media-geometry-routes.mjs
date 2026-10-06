/**
 * P0.SITE00.PRODUCTION-WORKSPACE.PANEL-MEDIA-GEOMETRY-REFINEMENT2 — route inventory for the media geometry audit.
 *
 * Every root tab plus every child page / material view state of the Production Workspace that can carry media:
 * DESIGN modes, EXPERIENCE sub-workspaces, all 40 EXPRESSION family routes (detail ids are discovered live from
 * the parent route's first link), LIBRARY collections + tabs, ACTIVITY lenses + milestones, INBOX views + detail.
 * `discover` = { from, selector }: open `from`, follow the first matching link's href.
 */
import { CHILD_PAGES as DENSITY_CHILD_PAGES, ROOT_TABS } from './density-routes.mjs';

export { ROOT_TABS };

const X = '/production/ndxbook/expression';
const expression = (id, path, extra = {}) => ({ id: `expression-${id}`, tab: 'EXPRESSION', route: `${X}/${path}`, ...extra });

export const CHILD_PAGES = [
  // HUB — the production machine view (chamber, inspector, decisions) linked from the HUB root
  { id: 'hub-machine', tab: 'HUB', route: '/production?view=machine' },
  { id: 'hub-machine-activity', tab: 'HUB', route: '/production?panel=activity' },
  // DESIGN — six fixed modes (brand / experience / surfaces / compiler / assets / viewport)
  ...['brand', 'experience', 'surfaces', 'compiler', 'assets', 'viewport'].map((m) => ({ id: `design-${m}`, tab: 'DESIGN', route: `/production/ndxbook/design?mode=${m}` })),
  // DESIGN of an ingested project (project-family chamber)
  { id: 'design-jurnl-brand', tab: 'DESIGN', route: '/production/jurnl/design?mode=brand' },
  // EXPERIENCE — seven world-production sub-workspaces
  ...['world', 'environments', 'modules', 'simulations', 'zones', 'assets', 'review'].map((s) => ({ id: `experience-${s}`, tab: 'EXPERIENCE', route: `/production/ndxbook/experience/${s}` })),
  // EXPRESSION — the 40 family routes
  expression('narrative', 'narrative'),
  expression('narrative-story', 'narrative/story'),
  expression('narrative-structure', 'narrative/structure'),
  expression('narrative-momentum', 'narrative/momentum'),
  expression('narrative-proof', 'narrative/proof'),
  expression('casting', 'casting'),
  expression('casting-roles', 'casting/roles'),
  expression('casting-actors', 'casting/actors'),
  expression('casting-characters', 'casting/characters'),
  expression('casting-continuity', 'casting/continuity'),
  expression('casting-role-detail', 'casting/roles/:id', { discover: { from: `${X}/casting/roles`, selector: 'a[href*="/casting/roles/"]' } }),
  expression('casting-actor-profile', 'casting/actors/:id', { discover: { from: `${X}/casting/actors`, selector: 'a[href*="/casting/actors/"]' } }),
  expression('casting-character-profile', 'casting/characters/:id', { discover: { from: `${X}/casting/characters`, selector: 'a[href*="/casting/characters/"]' } }),
  expression('look', 'wardrobe'),
  ...['looks', 'outfits', 'hair', 'makeup', 'accessories', 'fittings', 'continuity'].map((c) => expression(`look-${c}`, `wardrobe/${c}`)),
  expression('performance', 'performance'),
  ...['scenes', 'beats', 'takes'].map((c) => expression(`performance-${c}`, `performance/${c}`)),
  expression('sets', 'sets'),
  ...['environments', 'sets', 'zones', 'props', 'graphics', 'camera'].map((c) => expression(`sets-${c}`, `sets/${c}`)),
  expression('storyboard', 'storyboard'),
  expression('storyboard-sequence-detail', 'storyboard/sequence/:id', { discover: { from: `${X}/storyboard`, selector: 'a[href*="/storyboard/sequence/"]' } }),
  expression('storyboard-keyframes', 'storyboard/keyframes'),
  expression('review', 'review'),
  expression('review-approval-detail', 'review/approval/:id', { discover: { from: `${X}/review`, selector: 'a[href*="/review/approval/"]' } }),
  expression('format', 'format-studio'),
  expression('package', 'content-package'),
  expression('campaign', 'campaign-board'),
  // LIBRARY — every collection opened + the vault tabs
  ...['actors', 'wardrobe', 'hair', 'environment', 'sets', 'prop', 'graphic', 'performance'].map((c) => ({ id: `library-${c}`, tab: 'LIBRARY', route: '/production/libraries', click: `[data-testid="library-${c}"]` })),
  ...[2, 3, 4].map((n, i) => ({ id: `library-tab-${['review', 'superseded', 'archive'][i]}`, tab: 'LIBRARY', route: '/production/libraries', click: `[data-testid="library-tabs"] [role="tab"]:nth-child(${n})` })),
  // ACTIVITY — lenses + milestone details
  ...['approvals', 'updates', 'comments', 'blockers'].map((v) => ({ id: `activity-${v}`, tab: 'ACTIVITY', route: `/production/activity?view=${v}`, rootLens: true })),
  ...['narrative', 'cast', 'look', 'storyboard'].map((m) => ({ id: `activity-milestone-${m}`, tab: 'ACTIVITY', route: `/production/activity?milestone=${m}` })),
  // INBOX — views + decision detail
  ...DENSITY_CHILD_PAGES.filter((p) => p.tab === 'INBOX'),
];

/** QA widths: phone (canonical / small / large), tablet, desktop. */
export const VIEWPORTS = {
  mobile: { width: 393, height: 852, deviceScaleFactor: 2, isMobile: true, hasTouch: true, family: 'mobile' },
  small: { width: 360, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true, family: 'mobile' },
  large: { width: 430, height: 932, deviceScaleFactor: 2, isMobile: true, hasTouch: true, family: 'mobile' },
  tablet: { width: 834, height: 1194, deviceScaleFactor: 1, isMobile: false, hasTouch: true, family: 'tablet' },
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false, family: 'desktop' },
};
