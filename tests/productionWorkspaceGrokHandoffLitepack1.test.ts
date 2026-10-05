/**
 * P0.SITE00.PRODUCTION-WORKSPACE-GROK-HANDOFF-AUDIT-LITEPACK1
 * Guards for the Grok handoff manifests (docs/production-workspace/grok-handoff/) and the lite ZIP:
 *   · every live Production route table entry (realm + expression) is mapped to a surface; the tree is closed;
 *   · runtime components, mount points and current icon sources named in the manifests exist in the repo;
 *   · environment groups, asset actions, firewall regions and priorities use the agreed vocabulary;
 *   · every P0 / P1 distinct surface has a pack authority; the ZIP stays an ultra-lite pack (< 10 MB).
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXPERIENCE_ROUTES, LIBRARY_ROUTES } from '../src/site00/components/productionAuthority/realm/realmRoutes';
import { EXPRESSION_ROUTES } from '../src/site00/components/productionAuthority/expression/expressionRoutes';
import { ACTIVITY_VERBS } from '../src/site00/components/productionAuthority/activityLog';
import { IA_ICON_NAMES } from '../src/site00/components/productionAuthority/iaKit';
import { DESIGN_ICON_IDS } from '../src/site00/components/productionAuthority/designPackAssets';

const root = path.resolve(__dirname, '..');
const DIR = 'docs/production-workspace/grok-handoff';
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const json = <T,>(rel: string) => JSON.parse(read(rel)) as T;

type Surface = {
  surface_id: string;
  workspace_tab: string;
  route: string;
  direct_route: string | null;
  surface_level: string;
  parent_id: string | null;
  child_ids: string[];
  runtime_component: string;
  visual_class: string;
  visual_regions: Record<string, string[]>;
  canonical_status: string;
  distinct_visual_authority: boolean;
  inherits_visual_from: string | null;
  environment_group: string;
  asset_actions: string[];
  grok_priority: string;
  pack_files: string[];
};
type Env = { environment_group_id: string; member_surfaces: string[]; new_plate_required: boolean; new_plates: { plate_id: string }[] };
type Icon = { icon_id: string; classification: string[]; current_source: string; grok_action: string; priority: string };

const tree = json<{ surfaces: Surface[]; levels: string[] }>(`${DIR}/MANIFEST/PRODUCTION_WORKSPACE_SCREEN_TREE.json`);
const envs = json<{ environment_groups: Env[]; isolated_assets: { asset_id: string; action: string }[] }>(`${DIR}/MANIFEST/PRODUCTION_WORKSPACE_ENVIRONMENT_GROUPS.json`);
const icons = json<{ icons: Icon[] }>(`${DIR}/MANIFEST/PRODUCTION_WORKSPACE_ICON_INVENTORY.json`).icons;
const routes = json<{ routes: { surface_id: string; must_remain_functional: boolean; direct_route: string | null }[] }>(`${DIR}/MANIFEST/PRODUCTION_WORKSPACE_RUNTIME_ROUTES.json`).routes;
const responsive = json<{ surfaces: { surface_id: string; environment_crop_rules_known: boolean }[] }>(`${DIR}/MANIFEST/PRODUCTION_WORKSPACE_RESPONSIVE_MAP.json`).surfaces;
const handoff = json<{ surfaces: { surface_id: string; authority_file: string[] }[]; surface_count: Record<string, unknown> }>(`${DIR}/MANIFEST/PRODUCTION_WORKSPACE_GROK_HANDOFF.json`);
const index = json<{ totals: Record<string, number>; zip: { files: number; mb: number; listing: string[] }; pack_files: { file: string; bytes: number; reference_only: boolean }[] }>(`${DIR}/PACK_INDEX.json`);
const S = tree.surfaces;
const byId = new Map(S.map((s) => [s.surface_id, s]));
const TABS = ['HUB', 'INBOX', 'DESIGN', 'EXPERIENCE', 'EXPRESSION', 'LIBRARY', 'ACTIVITY'];
const ACTIONS = ['REUSE_EXISTING', 'REGENERATE_ENVIRONMENT', 'GENERATE_ISOLATED_OBJECT', 'GENERATE_BOTANICAL', 'GENERATE_MATERIAL', 'GENERATE_ICON', 'LIVE_CODE', 'NO_ACTION'];
const ZIP = 'artifacts/production-workspace-grok-handoff/SITE00_PRODUCTION_WORKSPACE_GROK_LITEPACK1.zip';

describe('LITEPACK1 · screen tree covers the live workspace', () => {
  it('maps all seven tabs and keeps the tree closed', () => {
    for (const t of TABS) expect(S.some((s) => s.workspace_tab === t && s.surface_level === 'PARENT'), t).toBe(true);
    for (const s of S) {
      expect(tree.levels).toContain(s.surface_level);
      if (s.parent_id) expect(byId.has(s.parent_id), `${s.surface_id} → ${s.parent_id}`).toBe(true);
      for (const c of s.child_ids) expect(byId.get(c)?.parent_id).toBe(s.surface_id);
      if (s.inherits_visual_from) expect(byId.has(s.inherits_visual_from), `${s.surface_id} inherits ${s.inherits_visual_from}`).toBe(true);
    }
    expect(new Set(S.map((s) => s.surface_id)).size).toBe(S.length);
  });

  it('has one surface for every realm and expression route table entry', () => {
    for (const r of EXPERIENCE_ROUTES) expect(byId.has(r.kind === 'root' ? `experience.${r.family}` : `experience.${r.family}.${r.id}`), r.path).toBe(true);
    for (const r of LIBRARY_ROUTES) expect(byId.has(r.kind === 'root' ? `library.${r.family}` : `library.${r.family}.${r.id}`), r.path).toBe(true);
    for (const r of EXPRESSION_ROUTES) expect(byId.has(r.kind === 'root' ? `expression.${r.family}` : `expression.${r.family}.${r.id}`), r.path).toBe(true);
    for (const m of ['brand', 'experience', 'surfaces', 'compiler', 'assets', 'viewport']) expect(byId.get(`design.${m}`)?.surface_level).toBe('PARENT');
    for (const id of ['hub.root', 'hub.machine', 'inbox.root', 'inbox.decision-detail', 'inbox.inspector', 'expression.floor', 'expression.character-fabrication', 'activity.root', 'activity.inspector', 'shell.bottom-nav']) expect(byId.has(id), id).toBe(true);
  });

  it('names runtime components that exist', () => {
    for (const s of S) expect(existsSync(path.join(root, s.runtime_component)), `${s.surface_id}: ${s.runtime_component}`).toBe(true);
  });

  it('routes every surface and keeps them functional', () => {
    expect(routes.map((r) => r.surface_id).sort()).toEqual(S.map((s) => s.surface_id).sort());
    expect(routes.every((r) => r.must_remain_functional)).toBe(true);
    for (const s of S.filter((x) => x.surface_level === 'PARENT')) expect(routes.find((r) => r.surface_id === s.surface_id)?.direct_route, s.surface_id).toMatch(/^\/production/);
  });
});

describe('LITEPACK1 · environment groups, actions and firewall', () => {
  it('assigns every surface to a declared environment group and actions from the agreed classes', () => {
    const ids = new Set(envs.environment_groups.map((e) => e.environment_group_id));
    for (const s of S) {
      expect(ids.has(s.environment_group), `${s.surface_id}: ${s.environment_group}`).toBe(true);
      expect(s.asset_actions.length).toBeGreaterThan(0);
      for (const a of s.asset_actions) expect(ACTIONS).toContain(a);
      expect(['P0', 'P1', 'P2', 'P3']).toContain(s.grok_priority);
    }
    for (const e of envs.environment_groups) for (const m of e.member_surfaces) expect(byId.get(m)?.environment_group).toBe(e.environment_group_id);
    for (const x of envs.isolated_assets) expect(ACTIONS).toContain(x.action);
  });

  it('rations plates: one master per shared world, not one per page', () => {
    const plates = envs.environment_groups.flatMap((e) => e.new_plates);
    const regenerated = S.filter((s) => s.asset_actions.includes('REGENERATE_ENVIRONMENT'));
    expect(plates.length).toBeLessThanOrEqual(10);
    expect(regenerated.length).toBeGreaterThan(plates.length * 5);
    for (const s of regenerated) expect(envs.environment_groups.find((e) => e.environment_group_id === s.environment_group)?.new_plate_required, s.surface_id).toBe(true);
  });

  it('labels host / project / shared regions and keeps project art out of host chrome', () => {
    const regions = ['SITE00_HOST', 'PROJECT_BODY', 'SHARED_WORKSPACE'];
    for (const s of S) {
      expect(Object.keys(s.visual_regions).length, s.surface_id).toBeGreaterThan(0);
      for (const k of Object.keys(s.visual_regions)) expect(regions).toContain(k);
      expect(['HOST_VISUAL', 'PROJECT_VISUAL', 'GLOBAL_WORKSPACE_VISUAL']).toContain(s.visual_class);
    }
    for (const s of S.filter((x) => x.workspace_tab === 'GLOBAL_SHELL')) expect(s.visual_class).toBe('HOST_VISUAL');
    for (const s of S.filter((x) => x.workspace_tab === 'EXPERIENCE')) expect(s.visual_class).toBe('PROJECT_VISUAL');
    expect(read('src/site00/components/productionHub/chrome.tsx')).toContain('project.ndxbook.cover'); // FIREWALL-01 still recorded against live code
  });

  it('keeps legacy surfaces out of the pass', () => {
    for (const s of S.filter((x) => x.canonical_status === 'LEGACY')) expect(s.asset_actions).toEqual(['NO_ACTION']);
    expect(byId.get('hub.machine')?.canonical_status).toBe('LEGACY');
  });
});

describe('LITEPACK1 · icon inventory', () => {
  it('covers nav, IA, design pack and activity semantics from the live code', () => {
    const ids = new Set(icons.map((i) => i.icon_id));
    for (const n of ['hub', 'inbox', 'design', 'experience', 'expression', 'library', 'activity']) expect(ids.has(`nav.${n}`)).toBe(true);
    for (const n of IA_ICON_NAMES) expect(ids.has(`ia.${n}`), n).toBe(true);
    for (const n of DESIGN_ICON_IDS) expect(ids.has(`design.pack.${n}`), n).toBe(true);
    for (const v of ACTIVITY_VERBS) expect(ids.has(`activity.verb.${v.toLowerCase()}`), v).toBe(true);
    for (const i of icons) expect(['P0', 'P1', 'P2', 'P3']).toContain(i.priority);
  });

  it('points at current sources that exist and flags the HUB nav substitute', () => {
    for (const i of icons) {
      const m = /^((?:src|public|shared)\/[^\s(]+)/.exec(i.current_source);
      if (m) expect(existsSync(path.join(root, m[1].replace(/\/$/, ''))), `${i.icon_id}: ${m[1]}`).toBe(true);
    }
    const hub = icons.find((i) => i.icon_id === 'nav.hub')!;
    expect(hub.classification).toContain('GENERIC SUBSTITUTE');
    expect(hub.grok_action).toMatch(/pavilion/);
  });
});

describe('LITEPACK1 · lite ZIP', () => {
  it('gives every P0 / P1 distinct surface a pack authority that is in the ZIP', () => {
    const listing = new Set(index.zip.listing);
    for (const s of S.filter((x) => x.distinct_visual_authority && ['P0', 'P1'].includes(x.grok_priority))) {
      expect(s.pack_files.length, s.surface_id).toBeGreaterThan(0);
      for (const f of s.pack_files) expect(listing.has(f), f).toBe(true);
    }
    for (const h of handoff.surfaces) for (const f of h.authority_file.filter((x) => /\.(jpg|png)$/.test(x))) expect(listing.has(f), f).toBe(true);
    for (const r of responsive) expect(byId.get(r.surface_id)?.distinct_visual_authority).toBe(true);
  });

  it('stays an ultra-lite pack of reference-only copies', () => {
    expect(existsSync(path.join(root, ZIP))).toBe(true);
    const bytes = statSync(path.join(root, ZIP)).size;
    expect(bytes).toBeLessThan(10_000_000);
    expect(Math.abs(bytes / 1_000_000 - index.zip.mb)).toBeLessThan(0.02);
    expect(index.pack_files.every((f) => f.reference_only)).toBe(true);
    expect(index.pack_files.every((f) => f.bytes < 600_000)).toBe(true);
    for (const req of ['README_FIRST.txt', 'NOTES/GROK_EXECUTION_RULES.txt', 'NOTES/SUPERSESSION_NOTES.txt', 'NOTES/ASSET_PASS_SCOPE.txt']) expect(index.zip.listing).toContain(req);
    expect(index.zip.listing.some((f) => /\.(mov|mp4|map|log|zip)$/.test(f))).toBe(false);
  });

  it('documents the audit with the same totals', () => {
    const doc = read('docs/production-workspace/GROK_HANDOFF_AUDIT.md');
    expect(doc).toContain(`| Surfaces mapped | ${index.totals.surfaces} |`);
    expect(doc).toContain(`| Environment groups | ${index.totals.environment_groups} |`);
    expect(doc).toContain(`| Unique icon semantics | ${index.totals.icon_semantics} |`);
  });
});
