/**
 * EXPERIENCE + LIBRARY route model (P0.STUDIOOS.PRODUCTION.EXPERIENCE-LIBRARY.RESPONSIVE-AUTHORITY-CONVERGENCE.OPUS1).
 *
 * One config for the 7 Experience families / 46 routes and the 10 Library families / 75 routes.
 *  EXPERIENCE  /production/:slug/experience/<family>[/<child>][/<id>]   (index = WORLD root)
 *  LIBRARY     /production/libraries/<family>[/<child>][/<id>]          (index = AUTHORITIES root)
 * `authority` is the paired file stem inside STUDIOOS_EXPERIENCE_LIBRARY_AUTHORITY_LITE (same stem in the mobile and
 * desktop / tablet folders). `collection` names the read-model collection the route lists (realmData.ts).
 * Legacy Experience sub-workspace ids (environments, modules, simulations, assets, review) resolve onto families.
 */

export type RealmTab = 'experience' | 'library';
export type RealmKind = 'root' | 'child' | 'detail' | 'lineage';

export type RealmRouteDef = {
  tab: RealmTab;
  family: string;
  id: string;
  label: string;
  kind: RealmKind;
  /** Path after the tab base, without params (`zones/detail`). */
  path: string;
  /** Paired authority stem (`02_Zones__07_ZONE_DETAIL`). */
  authority: string;
  /** Read-model collection this route shows. */
  collection: string;
  /** Library lifecycle a child route is scoped to. */
  lifecycle?: Lifecycle;
  /** Detail / lineage routes take an optional record id. */
  param?: boolean;
};

export type Lifecycle = 'CANONICAL' | 'IN REVIEW' | 'SUPERSEDED' | 'ARCHIVE';
export const LIFECYCLES: readonly Lifecycle[] = ['CANONICAL', 'IN REVIEW', 'SUPERSEDED', 'ARCHIVE'];

export type RealmFamilyDef = { tab: RealmTab; id: string; n: string; title: string; tagline: string; side: readonly string[]; icon: string };

/* ── EXPERIENCE ─────────────────────────────────────────────────────────────────────────────────────── */
export const EXPERIENCE_FAMILIES: readonly RealmFamilyDef[] = [
  { tab: 'experience', id: 'world', n: '01', title: 'WORLD', tagline: 'OPERATING OVERVIEW', side: ['WORLDS', 'ZONES', 'PEOPLE', 'IN MOTION'], icon: 'globe' },
  { tab: 'experience', id: 'zones', n: '02', title: 'ZONES', tagline: 'SPACES THAT MAKE THE WORLD', side: ['ROOMS', 'DISTRICTS', 'PORTALS', 'THRESHOLDS'], icon: 'zone' },
  { tab: 'experience', id: 'paths', n: '03', title: 'PATHS', tagline: 'JOURNEYS FOR EVERY PERSON', side: ['ENTRY', 'ROUTE', 'EXIT', 'IN MOTION'], icon: 'path' },
  { tab: 'experience', id: 'interactions', n: '04', title: 'INTERACTIONS', tagline: 'OBJECTS · ACTIONS · TRIGGERS', side: ['OBJECTS', 'ACTIONS', 'TRIGGERS', 'IN MOTION'], icon: 'spark' },
  { tab: 'experience', id: 'inhabitants', n: '05', title: 'INHABITANTS', tagline: 'PEOPLE BUILD WORLDS TOGETHER', side: ['RESIDENTS', 'ROLES', 'RELATIONSHIPS', 'IN MOTION'], icon: 'people' },
  { tab: 'experience', id: 'states', n: '06', title: 'STATES', tagline: 'HOW THE WORLD CHANGES', side: ['SCENES', 'LIGHT', 'ATMOSPHERE', 'LIVE'], icon: 'state' },
  { tab: 'experience', id: 'access', n: '07', title: 'ACCESS', tagline: 'WHO GOES WHERE, AND WHEN', side: ['RULES', 'ROLES', 'ZONES', 'PRIVACY'], icon: 'lock' },
];

const x = (family: string, id: string, label: string, kind: RealmKind, path: string, authority: string, collection: string, param = false): RealmRouteDef => ({
  tab: 'experience',
  family,
  id,
  label,
  kind,
  path,
  authority,
  collection,
  ...(param ? { param } : {}),
});

export const EXPERIENCE_ROUTES: readonly RealmRouteDef[] = [
  x('world', 'root', 'WORLD', 'root', 'world', '01_World__01_WORLD_ROOT', 'world.environments'),
  x('world', 'overview', 'WORLD OVERVIEW', 'child', 'world/overview', '01_World__02_WORLD_OVERVIEW', 'world.destinations'),
  x('world', 'architecture', 'ARCHITECTURE', 'child', 'world/architecture', '01_World__03_ARCHITECTURE', 'world.layers'),
  x('world', 'environments', 'ENVIRONMENTS', 'child', 'world/environments', '01_World__04_ENVIRONMENTS', 'world.environments'),
  x('world', 'destinations', 'DESTINATIONS', 'child', 'world/destinations', '01_World__05_DESTINATIONS', 'world.destinations'),
  x('world', 'detail', 'WORLD DETAIL', 'detail', 'world/detail', '01_World__06_WORLD_DETAIL', 'world.environments', true),

  x('zones', 'root', 'ZONES', 'root', 'zones', '02_Zones__01_ZONES_ROOT', 'zones.all'),
  x('zones', 'index', 'ZONE INDEX', 'child', 'zones/index', '02_Zones__02_ZONE_INDEX', 'zones.all'),
  x('zones', 'rooms', 'ROOMS', 'child', 'zones/rooms', '02_Zones__03_ROOMS', 'zones.rooms'),
  x('zones', 'districts', 'DISTRICTS', 'child', 'zones/districts', '02_Zones__04_DISTRICTS', 'zones.districts'),
  x('zones', 'portals', 'PORTALS', 'child', 'zones/portals', '02_Zones__05_PORTALS', 'zones.portals'),
  x('zones', 'thresholds', 'THRESHOLDS', 'child', 'zones/thresholds', '02_Zones__06_THRESHOLDS', 'zones.thresholds'),
  x('zones', 'detail', 'ZONE DETAIL', 'detail', 'zones/detail', '02_Zones__07_ZONE_DETAIL', 'zones.all', true),

  x('paths', 'root', 'PATHS', 'root', 'paths', '03_Paths__01_PATHS_ROOT', 'paths.journey'),
  x('paths', 'pathways', 'PATHWAYS', 'child', 'paths/pathways', '03_Paths__02_PATHWAYS', 'paths.journey'),
  x('paths', 'route-map', 'ROUTE MAP', 'child', 'paths/route-map', '03_Paths__03_ROUTE_MAP', 'paths.journey'),
  x('paths', 'entry', 'ENTRY PATHS', 'child', 'paths/entry', '03_Paths__04_ENTRY_PATHS', 'paths.entry'),
  x('paths', 'exit', 'EXIT PATHS', 'child', 'paths/exit', '03_Paths__05_EXIT_PATHS', 'paths.exit'),
  x('paths', 'journey', 'JOURNEY DETAIL', 'detail', 'paths/journey', '03_Paths__06_JOURNEY_DETAIL', 'paths.journey', true),

  x('interactions', 'root', 'INTERACTIONS', 'root', 'interactions', '04_Interactions__01_INTERACTIONS_ROOT', 'interactions.all'),
  x('interactions', 'index', 'INTERACTION INDEX', 'child', 'interactions/index', '04_Interactions__02_INTERACTION_INDEX', 'interactions.all'),
  x('interactions', 'objects', 'OBJECT INTERACTIONS', 'child', 'interactions/objects', '04_Interactions__03_OBJECT_INTERACTIONS', 'interactions.objects'),
  x('interactions', 'spatial', 'SPATIAL ACTIONS', 'child', 'interactions/spatial', '04_Interactions__04_SPATIAL_ACTIONS', 'interactions.spatial'),
  x('interactions', 'triggers', 'TRIGGERS', 'child', 'interactions/triggers', '04_Interactions__05_TRIGGERS', 'interactions.triggers'),
  x('interactions', 'detail', 'INTERACTION DETAIL', 'detail', 'interactions/detail', '04_Interactions__06_INTERACTION_DETAIL', 'interactions.all', true),

  x('inhabitants', 'root', 'INHABITANTS', 'root', 'inhabitants', '05_Inhabitants__01_INHABITANTS_ROOT', 'inhabitants.all'),
  x('inhabitants', 'index', 'INHABITANT INDEX', 'child', 'inhabitants/index', '05_Inhabitants__02_INHABITANT_INDEX', 'inhabitants.all'),
  x('inhabitants', 'residents', 'RESIDENTS', 'child', 'inhabitants/residents', '05_Inhabitants__03_RESIDENTS', 'inhabitants.residents'),
  x('inhabitants', 'characters', 'CHARACTERS', 'child', 'inhabitants/characters', '05_Inhabitants__04_CHARACTERS', 'inhabitants.characters'),
  x('inhabitants', 'presence', 'PRESENCE', 'child', 'inhabitants/presence', '05_Inhabitants__05_PRESENCE', 'inhabitants.residents'),
  x('inhabitants', 'relationships', 'RELATIONSHIPS', 'child', 'inhabitants/relationships', '05_Inhabitants__06_RELATIONSHIPS', 'inhabitants.relationships'),
  x('inhabitants', 'detail', 'INHABITANT DETAIL', 'detail', 'inhabitants/detail', '05_Inhabitants__07_INHABITANT_DETAIL', 'inhabitants.all', true),

  x('states', 'root', 'STATES', 'root', 'states', '06_States__01_STATES_ROOT', 'states.scenes'),
  x('states', 'scenes', 'SCENE STATES', 'child', 'states/scenes', '06_States__02_SCENE_STATES', 'states.scenes'),
  x('states', 'lighting', 'LIGHTING', 'child', 'states/lighting', '06_States__03_LIGHTING', 'states.lighting'),
  x('states', 'atmosphere', 'ATMOSPHERE', 'child', 'states/atmosphere', '06_States__04_ATMOSPHERE', 'states.atmosphere'),
  x('states', 'time', 'TIME + CONDITION', 'child', 'states/time', '06_States__05_TIME_CONDITION', 'states.time'),
  x('states', 'live', 'LIVE STATE', 'child', 'states/live', '06_States__06_LIVE_STATE', 'states.live'),
  x('states', 'detail', 'STATE DETAIL', 'detail', 'states/detail', '06_States__07_STATE_DETAIL', 'states.all', true),

  x('access', 'root', 'ACCESS', 'root', 'access', '07_Access__01_ACCESS_ROOT', 'access.rules'),
  x('access', 'rules', 'ACCESS RULES', 'child', 'access/rules', '07_Access__02_ACCESS_RULES', 'access.rules'),
  x('access', 'roles', 'ROLES + PERMISSIONS', 'child', 'access/roles', '07_Access__03_ROLES_PERMISSIONS', 'access.roles'),
  x('access', 'zones', 'ZONE ACCESS', 'child', 'access/zones', '07_Access__04_ZONE_ACCESS', 'access.zones'),
  x('access', 'conditional', 'CONDITIONAL ACCESS', 'child', 'access/conditional', '07_Access__05_CONDITIONAL_ACCESS', 'access.conditional'),
  x('access', 'privacy', 'PRIVACY + PRESENCE', 'child', 'access/privacy', '07_Access__06_PRIVACY_PRESENCE', 'access.privacy'),
  x('access', 'detail', 'ACCESS DETAIL', 'detail', 'access/detail', '07_Access__07_ACCESS_DETAIL', 'access.all', true),
];

/** Pre-family Experience sub-workspace ids (registry) → the family / child that now owns them. */
export const EXPERIENCE_LEGACY: Record<string, string> = {
  environments: 'world/environments',
  modules: 'interactions',
  simulations: 'inhabitants',
  assets: 'states',
  review: 'access',
};

/* ── LIBRARY ────────────────────────────────────────────────────────────────────────────────────────── */
export const LIBRARY_FAMILIES: readonly RealmFamilyDef[] = [
  { tab: 'library', id: 'authorities', n: '01', title: 'AUTHORITIES', tagline: 'CANONICAL RECORDS THAT DEFINE THE TRUTH OF THE PROJECT', side: [], icon: 'shield' },
  { tab: 'library', id: 'assets', n: '02', title: 'ASSETS', tagline: 'EVERY MOUNTED FILE, WITH ITS SOURCE AND USAGE', side: [], icon: 'cube' },
  { tab: 'library', id: 'characters', n: '03', title: 'CHARACTERS', tagline: 'RESIDENTS · PROJECT CHARACTERS · TALENT — KEPT DISTINCT', side: [], icon: 'person' },
  { tab: 'library', id: 'environments', n: '04', title: 'ENVIRONMENTS', tagline: 'WORLDS · ZONES · SETS · PLATES', side: [], icon: 'mountain' },
  { tab: 'library', id: 'expressions', n: '05', title: 'EXPRESSIONS', tagline: 'CANONICAL EXPRESSION MATERIALS AND HISTORY', side: [], icon: 'face' },
  { tab: 'library', id: 'references', n: '06', title: 'REFERENCES', tagline: 'VISUAL · RESEARCH · STYLE · SOURCE', side: [], icon: 'book' },
  { tab: 'library', id: 'icons', n: '07', title: 'ICONS', tagline: 'NAVIGATION · FUNCTION · PROJECT', side: [], icon: 'star' },
  { tab: 'library', id: 'materials', n: '08', title: 'MATERIALS', tagline: 'SURFACES · COMPONENTS · TEXTURES · UI', side: [], icon: 'layers' },
  { tab: 'library', id: 'documents', n: '09', title: 'DOCUMENTS', tagline: 'BRIEFS · BIBLES · SPECS · REPORTS · NOTES', side: [], icon: 'doc' },
  { tab: 'library', id: 'archive', n: '10', title: 'ARCHIVE', tagline: 'RETIRED MATERIAL, KEPT WITH ITS HISTORY', side: [], icon: 'box' },
];

const l = (family: string, id: string, label: string, kind: RealmKind, path: string, authority: string, collection: string, extra: Partial<RealmRouteDef> = {}): RealmRouteDef => ({
  tab: 'library',
  family,
  id,
  label,
  kind,
  path,
  authority,
  collection,
  ...extra,
});
const P = { param: true };

export const LIBRARY_ROUTES: readonly RealmRouteDef[] = [
  l('authorities', 'root', 'AUTHORITIES', 'root', 'authorities', '01_Authorities__01_AUTHORITIES_ROOT', 'authorities'),
  l('authorities', 'index', 'AUTHORITY INDEX', 'child', 'authorities/index', '01_Authorities__03_AUTHORITY_INDEX', 'authorities'),
  l('authorities', 'canonical', 'CANONICAL AUTHORITIES', 'child', 'authorities/canonical', '01_Authorities__04_CANONICAL_AUTHORITIES', 'authorities', { lifecycle: 'CANONICAL' }),
  l('authorities', 'in-review', 'IN REVIEW AUTHORITIES', 'child', 'authorities/in-review', '01_Authorities__05_IN_REVIEW_AUTHORITIES', 'authorities', { lifecycle: 'IN REVIEW' }),
  l('authorities', 'superseded', 'SUPERSEDED AUTHORITIES', 'child', 'authorities/superseded', '01_Authorities__07_SUPERSEDED_AUTHORITIES', 'authorities', { lifecycle: 'SUPERSEDED' }),
  l('authorities', 'detail', 'AUTHORITY DETAIL', 'detail', 'authorities/detail', '01_Authorities__02_AUTHORITY_DETAIL_FOR_A_SELECTED_AUTHORITY', 'authorities', P),
  l('authorities', 'lineage', 'AUTHORITY LINEAGE', 'lineage', 'authorities/lineage', '01_Authorities__06_LINEAGE', 'authorities', P),

  l('assets', 'root', 'ASSETS', 'root', 'assets', '02_Assets__01_ASSETS_ROOT', 'assets'),
  l('assets', 'index', 'ASSET INDEX', 'child', 'assets/index', '02_Assets__04_ASSET_INDEX', 'assets'),
  l('assets', 'images', 'IMAGES', 'child', 'assets/images', '02_Assets__06_IMAGES', 'assets.images'),
  l('assets', 'video', 'VIDEO', 'child', 'assets/video', '02_Assets__08_VIDEO', 'assets.video'),
  l('assets', 'audio', 'AUDIO', 'child', 'assets/audio', '02_Assets__05_AUDIO', 'assets.audio'),
  l('assets', 'spatial', '3D + SPATIAL', 'child', 'assets/spatial', '02_Assets__02_3D_SPATIAL', 'assets.spatial'),
  l('assets', 'detail', 'ASSET DETAIL', 'detail', 'assets/detail', '02_Assets__03_ASSET_DETAIL', 'assets', P),
  l('assets', 'usage', 'USAGE', 'child', 'assets/usage', '02_Assets__07_USAGE', 'assets.used'),

  l('characters', 'root', 'CHARACTERS', 'root', 'characters', '03_Characters__01_CHARACTERS_ROOT', 'characters'),
  l('characters', 'index', 'CHARACTER INDEX', 'child', 'characters/index', '03_Characters__03_CHARACTER_INDEX', 'characters'),
  l('characters', 'residents', 'RESIDENTS', 'child', 'characters/residents', '03_Characters__07_RESIDENTS', 'characters.residents'),
  l('characters', 'project', 'PROJECT CHARACTERS', 'child', 'characters/project', '03_Characters__06_PROJECT_CHARACTERS', 'characters.project'),
  l('characters', 'talent', 'EXTERNAL TALENT', 'child', 'characters/talent', '03_Characters__05_EXTERNAL_TALENT', 'characters.talent'),
  l('characters', 'detail', 'CHARACTER DETAIL', 'detail', 'characters/detail', '03_Characters__02_CHARACTER_DETAIL', 'characters', P),
  l('characters', 'lineage', 'CHARACTER LINEAGE', 'lineage', 'characters/lineage', '03_Characters__04_CHARACTER_LINEAGE', 'characters.residents', P),

  l('environments', 'root', 'ENVIRONMENTS', 'root', 'environments', '04_Environments__01_ENVIRONMENTS_ROOT', 'environments'),
  l('environments', 'index', 'ENVIRONMENT INDEX', 'child', 'environments/index', '04_Environments__03_ENVIRONMENT_INDEX', 'environments'),
  l('environments', 'worlds', 'WORLDS', 'child', 'environments/worlds', '04_Environments__07_WORLDS', 'environments.worlds'),
  l('environments', 'zones', 'ZONES', 'child', 'environments/zones', '04_Environments__08_ZONES', 'environments.zones'),
  l('environments', 'sets', 'SETS', 'child', 'environments/sets', '04_Environments__06_SETS', 'environments.sets'),
  l('environments', 'plates', 'PLATES', 'child', 'environments/plates', '04_Environments__05_PLATES', 'environments.plates'),
  l('environments', 'detail', 'ENVIRONMENT DETAIL', 'detail', 'environments/detail', '04_Environments__02_ENVIRONMENT_DETAIL', 'environments', P),
  l('environments', 'lineage', 'ENVIRONMENT LINEAGE', 'lineage', 'environments/lineage', '04_Environments__04_ENVIRONMENT_LINEAGE', 'environments.plates', P),

  l('expressions', 'root', 'EXPRESSIONS', 'root', 'expressions', '05_Expressions__01_EXPRESSIONS_ROOT', 'expressions'),
  l('expressions', 'index', 'EXPRESSION INDEX', 'child', 'expressions/index', '05_Expressions__05_EXPRESSION_INDEX', 'expressions'),
  l('expressions', 'entries', 'ENTRIES', 'child', 'expressions/entries', '05_Expressions__03_ENTRIES', 'expressions.entries'),
  l('expressions', 'campaigns', 'CAMPAIGNS', 'child', 'expressions/campaigns', '05_Expressions__02_CAMPAIGNS', 'expressions.campaigns'),
  l('expressions', 'formats', 'FORMATS', 'child', 'expressions/formats', '05_Expressions__07_FORMATS', 'expressions.formats'),
  l('expressions', 'packages', 'PACKAGES', 'child', 'expressions/packages', '05_Expressions__08_PACKAGES', 'expressions.packages'),
  l('expressions', 'detail', 'EXPRESSION DETAIL', 'detail', 'expressions/detail', '05_Expressions__04_EXPRESSION_DETAIL', 'expressions', P),
  l('expressions', 'lineage', 'EXPRESSION LINEAGE', 'lineage', 'expressions/lineage', '05_Expressions__06_EXPRESSION_LINEAGE', 'expressions.stages', P),

  l('references', 'root', 'REFERENCES', 'root', 'references', '06_References__01_REFERENCES_ROOT', 'references'),
  l('references', 'index', 'REFERENCE INDEX', 'child', 'references/index', '06_References__03_REFERENCE_INDEX', 'references'),
  l('references', 'visual', 'VISUAL REFERENCES', 'child', 'references/visual', '06_References__07_VISUAL_REFERENCES', 'references.visual'),
  l('references', 'research', 'RESEARCH REFERENCES', 'child', 'references/research', '06_References__04_RESEARCH_REFERENCES', 'references.research'),
  l('references', 'style', 'STYLE REFERENCES', 'child', 'references/style', '06_References__06_STYLE_REFERENCES', 'references.style'),
  l('references', 'source', 'SOURCE REFERENCES', 'child', 'references/source', '06_References__05_SOURCE_REFERENCES', 'references.source'),
  l('references', 'detail', 'REFERENCE DETAIL', 'detail', 'references/detail', '06_References__02_REFERENCE_DETAIL', 'references', P),

  l('icons', 'root', 'ICONS', 'root', 'icons', '07_Icons__01_ICONS_ROOT', 'icons'),
  l('icons', 'index', 'ICON INDEX', 'child', 'icons/index', '07_Icons__05_ICON_INDEX', 'icons'),
  l('icons', 'families', 'ICON FAMILIES', 'child', 'icons/families', '07_Icons__04_ICON_FAMILIES', 'icons.families'),
  l('icons', 'navigation', 'NAVIGATION ICONS', 'child', 'icons/navigation', '07_Icons__06_NAVIGATION_ICONS', 'icons.navigation'),
  l('icons', 'functional', 'FUNCTIONAL ICONS', 'child', 'icons/functional', '07_Icons__02_FUNCTIONAL_ICONS', 'icons.functional'),
  l('icons', 'project', 'PROJECT ICONS', 'child', 'icons/project', '07_Icons__07_PROJECT_ICONS', 'icons.project'),
  l('icons', 'detail', 'ICON DETAIL', 'detail', 'icons/detail', '07_Icons__03_ICON_DETAIL', 'icons', P),

  l('materials', 'root', 'MATERIALS', 'root', 'materials', '08_Materials__01_MATERIALS_ROOT', 'materials'),
  l('materials', 'index', 'MATERIAL INDEX', 'child', 'materials/index', '08_Materials__04_MATERIAL_INDEX', 'materials'),
  l('materials', 'surfaces', 'SURFACES', 'child', 'materials/surfaces', '08_Materials__05_SURFACES', 'materials.surfaces'),
  l('materials', 'components', 'COMPONENTS', 'child', 'materials/components', '08_Materials__02_COMPONENTS', 'materials.components'),
  l('materials', 'textures', 'TEXTURES', 'child', 'materials/textures', '08_Materials__06_TEXTURES', 'materials.textures'),
  l('materials', 'ui', 'UI MATERIALS', 'child', 'materials/ui', '08_Materials__07_UI_MATERIALS', 'materials.ui'),
  l('materials', 'detail', 'MATERIAL DETAIL', 'detail', 'materials/detail', '08_Materials__03_MATERIAL_DETAIL', 'materials', P),

  l('documents', 'root', 'DOCUMENTS', 'root', 'documents', '09_Documents__01_DOCUMENTS_ROOT', 'documents'),
  l('documents', 'index', 'DOCUMENT INDEX', 'child', 'documents/index', '09_Documents__05_DOCUMENT_INDEX', 'documents'),
  l('documents', 'briefs', 'BRIEFS', 'child', 'documents/briefs', '09_Documents__03_BRIEFS', 'documents.briefs'),
  l('documents', 'bibles', 'BIBLES', 'child', 'documents/bibles', '09_Documents__02_BIBLES', 'documents.bibles'),
  l('documents', 'specs', 'SPECS', 'child', 'documents/specs', '09_Documents__08_SPECS', 'documents.specs'),
  l('documents', 'reports', 'REPORTS', 'child', 'documents/reports', '09_Documents__07_REPORTS', 'documents.reports'),
  l('documents', 'notes', 'NOTES', 'child', 'documents/notes', '09_Documents__06_NOTES', 'documents.notes'),
  l('documents', 'detail', 'DOCUMENT DETAIL', 'detail', 'documents/detail', '09_Documents__04_DOCUMENT_DETAIL', 'documents', P),

  l('archive', 'root', 'ARCHIVE', 'root', 'archive', '10_Archive__01_ARCHIVE_ROOT', 'archive'),
  l('archive', 'index', 'ARCHIVE INDEX', 'child', 'archive/index', '10_Archive__03_ARCHIVE_INDEX', 'archive'),
  l('archive', 'assets', 'ARCHIVED ASSETS', 'child', 'archive/assets', '10_Archive__04_ARCHIVED_ASSETS', 'archive.assets'),
  l('archive', 'authorities', 'ARCHIVED AUTHORITIES', 'child', 'archive/authorities', '10_Archive__05_ARCHIVED_AUTHORITIES', 'archive.authorities'),
  l('archive', 'characters', 'ARCHIVED CHARACTERS', 'child', 'archive/characters', '10_Archive__06_ARCHIVED_CHARACTERS', 'archive.characters'),
  l('archive', 'environments', 'ARCHIVED ENVIRONMENTS', 'child', 'archive/environments', '10_Archive__07_ARCHIVED_ENVIRONMENTS', 'archive.environments'),
  l('archive', 'expressions', 'ARCHIVED EXPRESSIONS', 'child', 'archive/expressions', '10_Archive__08_ARCHIVED_EXPRESSIONS', 'archive.expressions'),
  l('archive', 'detail', 'ARCHIVE DETAIL', 'detail', 'archive/detail', '10_Archive__02_ARCHIVE_DETAIL', 'archive', P),
];

/* ── resolution ─────────────────────────────────────────────────────────────────────────────────────── */
export type ResolvedRealmRoute = { route: RealmRouteDef; family: RealmFamilyDef; param: string | null };

const FAMILIES = (tab: RealmTab) => (tab === 'experience' ? EXPERIENCE_FAMILIES : LIBRARY_FAMILIES);
export const realmRoutes = (tab: RealmTab) => (tab === 'experience' ? EXPERIENCE_ROUTES : LIBRARY_ROUTES);
export const realmFamily = (tab: RealmTab, id: string) => FAMILIES(tab).find((f) => f.id === id)!;
export const familyRoutes = (tab: RealmTab, family: string) => realmRoutes(tab).filter((r) => r.family === family);

/** Resolve the path remainder after the tab base (`zones/detail/z1`, ``, legacy `modules`). Null = not a realm route. */
export function resolveRealmRoute(tab: RealmTab, rest: string | null | undefined): ResolvedRealmRoute | null {
  let segs = (rest ?? '').split('/').filter(Boolean).map(decodeURIComponent);
  if (!segs.length) segs = [tab === 'experience' ? 'world' : 'authorities'];
  if (tab === 'experience' && EXPERIENCE_LEGACY[segs[0]!]) segs = [...EXPERIENCE_LEGACY[segs[0]!]!.split('/'), ...segs.slice(1)];
  const routes = realmRoutes(tab);
  const two = segs.slice(0, 2).join('/');
  const exact2 = segs.length >= 2 ? routes.find((r) => r.path === two) : undefined;
  if (exact2) {
    const param = exact2.param ? (segs[2] ?? null) : null;
    if (!exact2.param && segs.length > 2) return null;
    return { route: exact2, family: realmFamily(tab, exact2.family), param };
  }
  if (segs.length === 1) {
    const root = routes.find((r) => r.path === segs[0]);
    if (root) return { route: root, family: realmFamily(tab, root.family), param: null };
  }
  return null;
}

export function realmBase(tab: RealmTab, slug: string) {
  return tab === 'experience' ? `/production/${slug}/experience` : '/production/libraries';
}
export function realmHref(tab: RealmTab, slug: string, family: string, id = 'root', param?: string | null): string {
  const r = realmRoutes(tab).find((x) => x.family === family && x.id === id) ?? realmRoutes(tab).find((x) => x.family === family && x.id === 'root')!;
  return `${realmBase(tab, slug)}/${r.path}${param && r.param ? `/${encodeURIComponent(param)}` : ''}`;
}
/** The detail route of a family (records open into it). */
export const detailRouteOf = (tab: RealmTab, family: string) => realmRoutes(tab).find((r) => r.family === family && r.kind === 'detail') ?? null;
