/**
 * DESIGN chamber content for INGESTED projects (P0.JURNL.SITE00-INGEST-F01-DESIGN-WORKSPACE-PROOF1).
 *
 * The chamber geometry, pipeline and table are SITE 00 host machinery; for an ingested project every word and
 * every visual inside them comes from that project's record + family contracts — never NDXBOOK plates, never
 * SITE 00 sample copy. Project-agnostic: it reads IngestedProjectRecord + FamilyProductionContract only.
 */

import type { ProductionDesignMode } from '../../config/production-authority-registry';
import { ASSET_CLASSES } from '../../../../shared/site00-product-families/assetFirstPolicy.js';
import { evaluateFamilyCompleteness, evaluateFamilyGate, FAMILY_IMPLEMENTATION_GATE_KEYS, type FamilyGateResult } from '../../../../shared/site00-product-families/familyGate.js';
import type { FamilyProductionContract } from '../../../../shared/site00-product-families/familyProductionContract.js';
import type { IngestedProjectRecord } from '../../../../shared/site00-project-ingestion/types.js';
import type { ProjectFamilyEntry } from '../../../projects/families';

export type ProjectInspectTab = 'screens' | 'states' | 'interactions' | 'components' | 'assets' | 'gate' | 'budget' | 'claims' | 'brand';

export const PROJECT_INSPECT_TABS: readonly ProjectInspectTab[] = ['brand', 'screens', 'states', 'interactions', 'components', 'assets', 'gate', 'budget', 'claims'];

export type ProjectPanelVis =
  | { kind: 'cover'; src: string | null }
  | { kind: 'authorities'; srcs: string[] }
  | { kind: 'palette'; chips: { hex: string; label: string }[] }
  | { kind: 'type'; big: string; small: string }
  | { kind: 'tree'; items: { id: string; label: string; ok: boolean }[] }
  | { kind: 'gate'; items: { id: string; value: string }[] }
  | { kind: 'count'; value: string; label: string };

export type ProjectChamberPanel = { n: string; title: string; sub: string; vis: ProjectPanelVis; rows: string[]; inspect: ProjectInspectTab; to?: string };

export type ProjectChamberConfig = {
  mode: ProductionDesignMode;
  label: string;
  overviewTitle: string;
  lede: string;
  intro: string[];
  art: string | null;
  caption: string;
  panels: ProjectChamberPanel[];
  pipeline: { title: string; sub: string; state: 'DONE' | 'ACTIVE' | 'NEXT' | 'EXCEPTION' }[];
  table: { title: string; sub: string; cta: string; plate: string | null; inspect: ProjectInspectTab }[];
  edgeLeft: string;
  edgeRight: string;
};

const AUTH = (p: string) => p.replace(/^public/, '');

function countBy<T>(xs: readonly T[], key: (x: T) => string) {
  const out: Record<string, number> = {};
  for (const x of xs) out[key(x)] = (out[key(x)] ?? 0) + 1;
  return out;
}

export function familyGateFor(entry: ProjectFamilyEntry): FamilyGateResult {
  return evaluateFamilyGate(entry.contract, entry.coverage);
}

export function buildProjectChamber(mode: ProductionDesignMode, project: IngestedProjectRecord, families: ProjectFamilyEntry[]): ProjectChamberConfig {
  const fam = families[0];
  const c: FamilyProductionContract | null = fam?.contract ?? null;
  const gate = fam ? familyGateFor(fam) : null;
  const parent = c?.screens.find((s) => s.id === c.parentScreen) ?? null;
  const parentArt = parent?.authorityFile ? AUTH(parent.authorityFile) : null;
  const childArt = (c?.screens ?? []).filter((s) => s.role === 'CHILD').map((s) => AUTH(s.authorityFile ?? ''));
  const fid = c ? `${c.familyId} ${c.familyName}` : 'NO FAMILY';
  const label = mode.toUpperCase();
  const base = {
    mode,
    label,
    art: parentArt,
    caption: parent ? `${parent.id} ${parent.name} — ${parent.approvalStatus.replace(/_/g, ' ')}` : '',
    edgeLeft: `${project.displayName} / ${project.projectType} · ${project.ownership}`,
    edgeRight: `${fid} · ${project.currentProductionStage.replace(/_/g, ' ')}`,
  };
  const interactionTypes = c ? countBy(c.interactions, (i) => i.type) : {};
  const states = c?.states ?? [];
  const bridge = c?.screens.find((s) => s.bridgeTo)?.bridgeTo ?? null;
  const sheetCount = countBy(states, (s) => (s.authorityFile ?? '').split('/').pop()?.replace('.jpg', '') ?? '');

  switch (mode) {
    case 'brand':
      return {
        ...base,
        overviewTitle: `BRAND / ${project.displayName}`,
        lede: project.brand.tagline,
        intro: [project.productClass, project.brand.voice, ...project.brand.visualLanguage.slice(0, 2)],
        panels: [
          { n: '01', title: 'BRAND ESSENCE', sub: project.productClass, vis: { kind: 'cover', src: project.brand.coverFile }, rows: [project.brand.tagline, project.brand.voice, `${project.projectType} / ${project.ownership}`, project.primaryPlatform.replace(/_/g, ' ')], inspect: 'brand' },
          { n: '02', title: 'VISUAL LANGUAGE', sub: 'MASTER VISUAL AUTHORITY', vis: { kind: 'authorities', srcs: [project.brand.masterAuthorityFile ?? '', parentArt ?? ''].filter(Boolean) }, rows: project.brand.visualLanguage, inspect: 'brand' },
          { n: '03', title: 'TYPOGRAPHY', sub: 'DISPLAY + FUNCTIONAL', vis: { kind: 'type', big: 'AA', small: project.brand.typography[0]?.family ?? '' }, rows: project.brand.typography.map((t) => `${t.id}: ${t.family}`).concat('UPPERCASE ONLY'), inspect: 'brand' },
          { n: '04', title: 'COLOR & MATERIAL', sub: 'LOCKED PALETTE', vis: { kind: 'palette', chips: project.brand.palette.map((p) => ({ hex: p.hex, label: p.label })) }, rows: project.brand.palette.slice(0, 5).map((p) => `${p.label} ${p.hex}`), inspect: 'brand' },
          { n: '05', title: 'BRAND RULES', sub: 'HARD LOCKS', vis: { kind: 'count', value: String(project.brand.rules.filter((r) => r.hard).length), label: 'HARD RULES' }, rows: project.brand.rules.map((r) => r.id.replace(/_/g, ' ')), inspect: 'brand' },
        ],
        pipeline: [
          { title: 'MASTER AUTHORITY', sub: 'LOCKED', state: 'DONE' },
          { title: 'OFFICIAL LOGO', sub: 'RUNTIME MARK', state: 'DONE' },
          { title: 'TYPOGRAPHY', sub: 'PROJECT FONTS', state: 'DONE' },
          { title: 'PALETTE', sub: 'TOKENIZED', state: 'DONE' },
          { title: 'RULES', sub: 'ENFORCED BY TESTS', state: 'ACTIVE' },
        ],
        table: [
          { title: 'TYPOGRAPHY CHOICE', sub: 'CONFIRM DISPLAY + SANS', cta: 'REVIEW', plate: parentArt, inspect: 'brand' },
          { title: 'CLAIMS REGISTER', sub: 'SECURITY + PRIVACY COPY', cta: 'REVIEW', plate: childArt[11] ?? null, inspect: 'claims' },
          { title: 'FAMILY RUNTIME', sub: `${fid} LIVE UI`, cta: 'OPEN', plate: childArt[2] ?? null, inspect: 'screens' },
        ],
      };
    case 'experience':
      return {
        ...base,
        overviewTitle: `EXPERIENCE / ${fid}`,
        lede: c?.purpose ?? '',
        intro: ['SCREEN TREE', 'USER JOURNEYS', 'STATES', 'INTERACTIONS', 'FAMILY TRANSITION'],
        panels: [
          { n: '01', title: 'FAMILY TREE', sub: `${c?.screens.length ?? 0} SCREENS`, vis: { kind: 'tree', items: (c?.screens ?? []).slice(0, 7).map((s) => ({ id: s.id, label: s.name, ok: s.implementationStatus !== 'NOT_STARTED' })) }, rows: [`PARENT ${c?.parentScreen ?? ''}`, `CHILDREN ${(c?.screens ?? []).filter((s) => s.role === 'CHILD').length}`, `GRANDCHILDREN ${(c?.screens ?? []).filter((s) => s.role === 'GRANDCHILD').length}`, bridge ? `BRIDGE → ${bridge}` : 'NO BRIDGE'], inspect: 'screens' },
          { n: '02', title: 'USER JOURNEYS', sub: `PATHS THROUGH ${c?.familyName ?? ''}`, vis: { kind: 'count', value: String(c?.journeys?.length ?? 0), label: 'JOURNEYS' }, rows: (c?.journeys ?? []).map((j) => `${j.label}: ${j.path.map((p) => p.split('.').pop()).join(' → ')}`), inspect: 'screens' },
          { n: '03', title: 'STATE AUTHORITIES', sub: `${states.length} STATES`, vis: { kind: 'count', value: String(states.length), label: 'IMPLEMENTED' }, rows: Object.entries(sheetCount).map(([k, v]) => `${k} · ${v}`), inspect: 'states' },
          { n: '04', title: 'INTERACTIONS', sub: `${c?.interactions.length ?? 0} MANIFEST ROWS`, vis: { kind: 'count', value: String(c?.interactions.length ?? 0), label: 'BOUND' }, rows: Object.entries(interactionTypes).map(([k, v]) => `${k.replace(/_/g, ' ').toUpperCase()} · ${v}`), inspect: 'interactions' },
          { n: '05', title: 'FAMILY TRANSITION', sub: bridge ? `${c?.familyId} → ${bridge}` : 'NO BOUNDARY', vis: { kind: 'gate', items: project.families.map((f) => ({ id: `${f.familyId} ${f.familyName}`, value: f.status.replace(/_/g, ' ') })) }, rows: project.families.map((f) => `${f.familyId} ${f.familyName}: ${f.entryRoute ? `/${f.entryRoute.toUpperCase()}` : '—'}`), inspect: 'screens' },
        ],
        pipeline: [
          { title: 'SCREEN TREE', sub: `${c?.screens.length ?? 0} SCREENS`, state: 'DONE' },
          { title: 'STATES', sub: `${states.length} AUTHORITIES`, state: 'DONE' },
          { title: 'INTERACTIONS', sub: `${c?.interactions.length ?? 0} BOUND`, state: 'DONE' },
          { title: 'JOURNEYS', sub: `${c?.journeys?.length ?? 0} PATHS`, state: 'DONE' },
          { title: 'HANDOFF', sub: bridge ? `${bridge} BOUNDARY` : '—', state: 'NEXT' },
        ],
        table: [
          { title: 'JOURNEY REVIEW', sub: 'NEW USER PATH', cta: 'REVIEW', plate: parentArt, inspect: 'screens' },
          { title: 'INTERACTION AUDIT', sub: `${c?.interactions.length ?? 0} ROWS BOUND`, cta: 'INSPECT', plate: childArt[3] ?? null, inspect: 'interactions' },
          { title: bridge ? `${bridge} CONTRACT` : 'NEXT FAMILY', sub: 'ASSET-FIRST START', cta: 'PREPARE', plate: childArt[12] ?? null, inspect: 'assets' },
        ],
      };
    case 'surfaces': {
      const v = project.viewport;
      const vp = (p: 'MOBILE' | 'TABLET' | 'DESKTOP') => `/production/${project.slug}/design?mode=viewport&preset=${encodeURIComponent(p)}`;
      return {
        ...base,
        overviewTitle: `SURFACES / ${fid}`,
        lede: `${c?.screens.length ?? 0} LIVE SCREENS · ${v.authority.w} × ${v.authority.h} AUTHORITY`,
        intro: (c?.responsive ?? []).map((r) => `${r.id} ${r.width} × ${r.height}`),
        panels: [
          { n: '01', title: 'MOBILE', sub: `${v.presets.MOBILE?.w} × ${v.presets.MOBILE?.h} · PRIMARY`, vis: { kind: 'authorities', srcs: childArt.slice(0, 3) }, rows: [c?.responsive[0]?.rule ?? ''], inspect: 'screens', to: vp('MOBILE') },
          { n: '02', title: 'TABLET', sub: `${v.presets.TABLET?.w} × ${v.presets.TABLET?.h}`, vis: { kind: 'count', value: '834', label: 'LOGICAL PX' }, rows: [c?.responsive[1]?.rule ?? ''], inspect: 'screens', to: vp('TABLET') },
          { n: '03', title: 'DESKTOP', sub: `${v.presets.DESKTOP?.w} × ${v.presets.DESKTOP?.h}`, vis: { kind: 'count', value: '1440', label: 'LOGICAL PX' }, rows: [c?.responsive[2]?.rule ?? ''], inspect: 'screens', to: vp('DESKTOP') },
          { n: '04', title: 'SCREEN TREE', sub: 'LIVE RUNTIME ROUTES', vis: { kind: 'tree', items: (c?.screens ?? []).slice(7).map((s) => ({ id: s.id, label: s.name, ok: s.implementationStatus !== 'NOT_STARTED' })) }, rows: (c?.screens ?? []).slice(0, 5).map((s) => `${s.id} /${s.runtimeRoute}`), inspect: 'screens' },
          { n: '05', title: 'PROJECT RUNTIME', sub: 'ISOLATED PROJECT BODY', vis: { kind: 'gate', items: [{ id: 'ROUTE', value: `/PRODUCTION/${project.slug.toUpperCase()}/RUNTIME` }, { id: 'AUTH', value: project.runtime.authAdapter.replace(/_/g, ' ') }] }, rows: ['NO HOST CHROME IN BODY', 'PROJECT FONTS + TOKENS', 'SAFE AREA · GRID · BOUNDS'], inspect: 'components', to: `/production/${project.slug}/design?mode=viewport` },
        ],
        pipeline: [
          { title: 'TOKENS', sub: 'PROJECT-SCOPED', state: 'DONE' },
          { title: 'COMPONENTS', sub: `${project.displayName} PRIMITIVES`, state: 'DONE' },
          { title: 'MOBILE', sub: 'AUTHORITY', state: 'DONE' },
          { title: 'TABLET / DESKTOP', sub: 'RESPONSIVE LAYOUT', state: 'DONE' },
          { title: 'FOUNDER REVIEW', sub: 'RUNTIME', state: 'NEXT' },
        ],
        table: [
          { title: 'MOBILE REVIEW', sub: '393 × 852', cta: 'OPEN', plate: parentArt, inspect: 'screens' },
          { title: 'TABLET REVIEW', sub: '834 × 1194', cta: 'OPEN', plate: childArt[0] ?? null, inspect: 'screens' },
          { title: 'DESKTOP REVIEW', sub: '1440 × 900', cta: 'OPEN', plate: childArt[2] ?? null, inspect: 'screens' },
        ],
      };
    }
    case 'compiler': {
      const completeness = c && gate ? evaluateFamilyCompleteness(c, gate) : null;
      const done = completeness ? Object.values(completeness).filter(Boolean).length : 0;
      return {
        ...base,
        overviewTitle: `COMPILER / ${fid}`,
        lede: gate ? (gate.familyComplete ? 'FAMILY COMPLETE' : gate.implementationReady ? 'IMPLEMENTATION READY — AWAITING FOUNDER APPROVAL' : 'IMPLEMENTATION GATE OPEN') : 'NO FAMILY CONTRACT',
        intro: ['SCREEN COMPLETE ≠ FAMILY COMPLETE', `QA: ${c?.qaStatus.replace(/_/g, ' ') ?? ''}`, `APPROVAL: ${c?.approvalStatus.replace(/_/g, ' ') ?? ''}`],
        panels: [
          { n: '01', title: 'FAMILY GATE', sub: 'IMPLEMENTATION GATE', vis: { kind: 'gate', items: FAMILY_IMPLEMENTATION_GATE_KEYS.slice(0, 4).map((k) => ({ id: k.replace(/_/g, ' '), value: gate?.gate[k] ?? 'FAIL' })) }, rows: FAMILY_IMPLEMENTATION_GATE_KEYS.slice(4).map((k) => `${k.replace(/_/g, ' ')}: ${gate?.gate[k] ?? 'FAIL'}`), inspect: 'gate' },
          { n: '02', title: 'COMPLETENESS', sub: 'FAMILY CONTRACT', vis: { kind: 'count', value: `${done}/16`, label: 'ITEMS MET' }, rows: completeness ? Object.entries(completeness).filter(([, v]) => !v).map(([k]) => `OPEN: ${k.replace(/_/g, ' ')}`) : [], inspect: 'gate' },
          { n: '03', title: 'COMPONENT MAP', sub: 'MANIFEST → RUNTIME', vis: { kind: 'count', value: String(fam?.coverage.components.length ?? 0), label: 'COMPONENTS' }, rows: [...new Set(c?.interactions.map((i) => i.componentRef) ?? [])].slice(0, 5), inspect: 'components' },
          { n: '04', title: 'CLAIMS', sub: 'SUBSTANTIATION REGISTER', vis: { kind: 'count', value: String((c?.claims?.withheld ?? 0) + (c?.claims?.flagged ?? 0)), label: 'TRACKED' }, rows: c?.claims ? [`${c.claims.withheld} WITHHELD`, `${c.claims.flagged} FLAGGED`, c.claims.rule] : [], inspect: 'claims' },
          { n: '05', title: 'AUTHORITY LINEAGE', sub: 'SOURCE SPRINTS', vis: { kind: 'count', value: String(c?.lineage.sourceSprints.length ?? 0), label: 'SPRINTS' }, rows: (c?.lineage.sourceSprints ?? []).slice(-4).map((s) => s.replace(/^P0\.[A-Z0-9]+\./, '')), inspect: 'gate' },
        ],
        pipeline: [
          { title: 'CONTRACT', sub: 'FAMILY SCHEMA', state: 'DONE' },
          { title: 'BINDINGS', sub: '74 / 74', state: 'DONE' },
          { title: 'RUNTIME', sub: 'LIVE UI', state: 'DONE' },
          { title: 'LIVE QA', sub: c?.qaStatus === 'LIVE_PASS' ? 'PASS' : 'PENDING', state: c?.qaStatus === 'LIVE_PASS' ? 'DONE' : 'ACTIVE' },
          { title: 'FOUNDER', sub: 'APPROVAL', state: 'NEXT' },
        ],
        table: [
          { title: 'FAMILY GATE', sub: gate?.implementationReady ? 'READY' : 'OPEN', cta: 'INSPECT', plate: parentArt, inspect: 'gate' },
          { title: 'COMPONENT MAP', sub: 'MANIFEST → RUNTIME', cta: 'INSPECT', plate: childArt[0] ?? null, inspect: 'components' },
          { title: 'FOUNDER APPROVAL', sub: `${fid} RUNTIME`, cta: 'REVIEW', plate: childArt[12] ?? null, inspect: 'screens' },
        ],
      };
    }
    case 'assets': {
      const fa = c?.familyAssets ?? [];
      const b = c?.generationBudget;
      return {
        ...base,
        overviewTitle: `ASSETS / ${fid}`,
        lede: c?.assetPolicy.resolution === 'LEGACY_EXCEPTION' ? `${c.familyId} LEGACY EXCEPTION — LATER FAMILIES ASSET-FIRST` : 'ASSET-FIRST REQUIRED',
        intro: ['NO SCREEN CROPS', 'NO RASTER CONTROLS', 'COMPONENTS ARE NEVER ASSETS'],
        panels: [
          { n: '01', title: 'ASSET POLICY', sub: c?.assetPolicy.resolution.replace(/_/g, ' ') ?? '', vis: { kind: 'count', value: String(c?.assetPolicy.excludedSources.length ?? 0), label: 'EXCLUDED SOURCES' }, rows: c?.assetPolicy.evidence ?? [], inspect: 'assets' },
          { n: '02', title: 'FAMILY ASSETS', sub: `${fa.length} REQUIREMENTS`, vis: { kind: 'gate', items: Object.entries(countBy(fa, (a) => a.status)).map(([k, v]) => ({ id: k.replace(/_/g, ' '), value: String(v) })) }, rows: fa.filter((a) => a.status === 'MISSING').map((a) => `MISSING: ${a.id}`), inspect: 'assets' },
          { n: '03', title: 'GLOBAL ASSETS', sub: 'INHERITED BY EVERY FAMILY', vis: { kind: 'cover', src: project.brand.coverFile }, rows: (c?.globalAssets ?? []).map((a) => a.id), inspect: 'assets' },
          { n: '04', title: 'ASSET-FIRST CLASSES', sub: 'EVERY LATER FAMILY', vis: { kind: 'count', value: String(ASSET_CLASSES.length), label: 'CLASSES' }, rows: ASSET_CLASSES.slice(0, 5).map((a) => a.replace(/_/g, ' ')), inspect: 'assets' },
          { n: '05', title: 'BUDGET', sub: 'CREDITS CONTRACT', vis: { kind: 'count', value: b ? b.safeCeilingRemaining.toLocaleString('en-US') : '—', label: 'CEILING LEFT' }, rows: b ? [`${b.familyId} ≈ ${b.familyCredits.toLocaleString('en-US')} CREDITS`, `TRACKING: ${b.tracking.replace(/_/g, ' ')}`, `CUMULATIVE ${b.cumulativeCredits.toLocaleString('en-US')}`] : [], inspect: 'budget' },
        ],
        pipeline: [
          { title: 'CONTRACT', sub: 'FAMILY', state: 'DONE' },
          { title: 'INVENTORY', sub: 'ASSET CLASSES', state: 'NEXT' },
          { title: 'GENERATION', sub: 'ISOLATED FIRST', state: 'NEXT' },
          { title: 'ASSET QA', sub: 'GATE', state: 'NEXT' },
          { title: 'COMPOSITION', sub: 'PARENT', state: 'NEXT' },
        ],
        table: [
          { title: 'NEXT FAMILY INVENTORY', sub: 'ASSET-FIRST START', cta: 'PREPARE', plate: parentArt, inspect: 'assets' },
          { title: 'MISSING ASSETS', sub: `${fa.filter((a) => a.status === 'MISSING').length} REQUIRE ASSET-FIRST`, cta: 'REVIEW', plate: childArt[3] ?? null, inspect: 'assets' },
          { title: 'BUDGET RECORD', sub: b ? `${b.familyId} ${b.tracking.replace(/_/g, ' ')}` : '—', cta: 'INSPECT', plate: childArt[8] ?? null, inspect: 'budget' },
        ],
      };
    }
    default:
      return { ...base, overviewTitle: label, lede: '', intro: [], panels: [], pipeline: [], table: [] };
  }
}
