/**
 * Office design reconciliation — an existing visual reference (a founder's drawn screens) held against the office
 * information architecture and the root authority contracts, before any visual authority is regenerated
 * (P0.AIO.OFFICE.FOUNDER-HOME-WORK-REPORTS-MORE.EXISTING-DESIGN-RECONCILIATION1).
 *
 * The reference is inventoried element by element (what is drawn, which contract item it stands for, the verdict).
 * Coverage — which regions, lanes, domains and entries the drawing shows, misses or adds — is computed here from that
 * inventory, never typed by hand. Proposals and founder decisions sit beside it; nothing is approved by this layer.
 */
import type { OfficeInformationArchitecture } from './office-information-architecture.js';
import { iaChildren, iaNode } from './office-information-architecture.js';
import type { OfficeRootContracts } from './office-root-contracts.js';

/* ─────────────────────────────── vocabularies ─────────────────────────────── */

/** What happens to a drawn element. KEEP as drawn · REFINE keep the idea, fix size / copy / hierarchy · CORRECT the content is wrong against the contract · ADD missing · REMOVE · ASSET_PASS the picture needs a controlled asset pass · FOUNDER_DECISION open. */
export const DESIGN_VERDICTS = ['KEEP', 'REFINE', 'CORRECT', 'ADD', 'REMOVE', 'ASSET_PASS', 'FOUNDER_DECISION'] as const;
export type DesignVerdict = (typeof DESIGN_VERDICTS)[number];

export const REFERENCE_ELEMENT_KINDS = ['HEADER', 'HERO', 'STAT_CARD', 'REGION', 'TILE', 'ROW', 'LANE_CARD', 'METRIC', 'CHART', 'LIST', 'TAB', 'ENTRY', 'ACTION', 'NAV', 'BANNER', 'SEARCH'] as const;
export type ReferenceElementKind = (typeof REFERENCE_ELEMENT_KINDS)[number];

/** Contract item a drawn element stands for. ROOT / REGION / LANE / MORE_ENTRY / REPORT_DOMAIN are IA nodes; METRIC and ACTION are contract ids. */
export const CONTRACT_REF_KINDS = ['ROOT', 'REGION', 'LANE', 'MORE_ENTRY', 'REPORT_DOMAIN', 'METRIC', 'ACTION', 'NONE'] as const;
export type ContractRefKind = (typeof CONTRACT_REF_KINDS)[number];
export interface ContractRef {
  kind: ContractRefKind;
  id: string | null;
}

export const DESIGN_VIEWPORTS = ['MOBILE', 'TABLET', 'DESKTOP', 'WIDE'] as const;
export type DesignViewport = (typeof DESIGN_VIEWPORTS)[number];

/* ─────────────────────────────── shapes ─────────────────────────────── */

/** One thing drawn on a reference screen. */
export interface ReferenceElement {
  element_id: string;
  kind: ReferenceElementKind;
  /** The text as drawn (casing kept, so casing findings stay visible). */
  label: string;
  /** Figures and dates as drawn. Every one is illustrative unless a production-backed metric supports it. */
  figures: string[];
  maps_to: ContractRef[];
  verdict: DesignVerdict;
  finding: string;
  /** Anti-AI audit vocabulary (studioos-visual-authority ANTI_AI_FLAGS / TYPOGRAPHY_DEFECTS). */
  anti_ai: { flag: string; severity: 'MATERIAL' | 'MINOR'; note: string }[];
}

export interface ReferenceScreen {
  root_id: string;
  /** The page title the drawing uses (its hero headline). */
  title_as_drawn: string;
  /** Pixel box of this screen inside the reference image (x, y, w, h). */
  crop: [number, number, number, number];
  elements: ReferenceElement[];
}

export interface DesignReference {
  reference_id: string;
  description: string;
  file: { path: string; width: number; height: number; sha256: string };
  /** Root nav as drawn on every screen's dock. */
  drawn_nav: string[];
  /** Identity block as drawn (a sample persona, never a real permission). */
  drawn_identity: { name: string; role_label: string };
  screens: ReferenceScreen[];
}

/** A proposed slot on a revised page, tied to the contract item it shows and how it is filled. */
export interface ProposedSlot {
  slot_id: string;
  label: string;
  maps_to: ContractRef;
  /** What fills it in the authority set: the contract state decides whether a number may appear. */
  treatment: string;
  /** Photo / icon source (asset plan id) where the slot carries one. */
  asset: string | null;
}

export interface PageReconciliation {
  root_id: string;
  /** A. what already works · B. must be preserved · C. missing · D. incorrect · E. needs visual refinement · F. founder decisions (ids). */
  works: string[];
  preserve: string[];
  missing: string[];
  incorrect: string[];
  refine: string[];
  founder_decisions: string[];
  current_vs_required: { topic: string; current: string; required: string; change: string }[];
  /** The revised page, in reading order (mobile). */
  proposed: ProposedSlot[];
}

export interface DesignDecision {
  decision_id: string;
  title: string;
  /** The question in everyday English. */
  question: string;
  options: { option: string; effect: string }[];
  recommendation: string;
  roots: string[];
  /** BEFORE_REGENERATION blocks the second delivery; CAN_DEFAULT proceeds with the recommendation unless the founder says otherwise. */
  priority: 'BEFORE_REGENERATION' | 'CAN_DEFAULT';
  status: 'OPEN' | 'DECIDED';
}

export interface ViewportPlan {
  root_id: string;
  viewport: DesignViewport;
  nav: string;
  hero: 'FULL' | 'COMPACT' | 'NONE';
  layout: string;
  /** Reading order of the main slots (slot ids). */
  order: string[];
  notes: string;
}

export interface AssetPlanItem {
  asset_id: string;
  what: string;
  /** Repo path (relative to the fsbw repo root) of an existing asset, or null when it does not exist yet. */
  path: string | null;
  status: 'REUSE' | 'REUSE_WITH_FIX' | 'ASSET_PASS' | 'DO_NOT_USE';
  used_for: string[];
  reason: string;
}

export interface RoleVisibilityRow {
  area: string;
  root_id: string;
  founder: string;
  staff: string;
  /** The permission / founder act that decides it (never a person). */
  decided_by: string;
}

export interface DesignReconciliation {
  project_id: string;
  sprint: string;
  reference: DesignReference;
  pages: PageReconciliation[];
  cross_cutting: { topic: string; finding: string; verdict: DesignVerdict; change: string }[];
  decisions: DesignDecision[];
  responsive: ViewportPlan[];
  assets: AssetPlanItem[];
  roles: RoleVisibilityRow[];
  privacy_touchpoints: { gap_id: string; area: string; effect: string }[];
}

/* ─────────────────────────────── computed coverage ─────────────────────────────── */

export interface ReferenceCoverage {
  root_id: string;
  required: string[];
  drawn: string[];
  missing: string[];
  /** Drawn in this set but not part of it (e.g. a root drawn as a lane). */
  extra: string[];
}

const refsOf = (s: ReferenceScreen, kind: ContractRefKind, filter?: (e: ReferenceElement) => boolean) =>
  [...new Set(s.elements.filter((e) => !filter || filter(e)).flatMap((e) => e.maps_to.filter((m) => m.kind === kind && m.id).map((m) => m.id!)))];

/**
 * What each reference screen covers of what its root requires:
 * HOME regions, WORK lanes (lane cards), HOME's WORK ACROSS lanes (tiles), REPORTS domains (tabs and panels), MORE entries.
 */
export function referenceCoverage(rec: DesignReconciliation, c: OfficeRootContracts, ia: OfficeInformationArchitecture): ReferenceCoverage[] {
  const screen = (root: string) => rec.reference.screens.find((s) => s.root_id === root);
  const out: ReferenceCoverage[] = [];
  const cover = (root_id: string, required: string[], drawn: string[], drawnOther: string[] = []) =>
    out.push({ root_id, required, drawn, missing: required.filter((r) => !drawn.includes(r)), extra: [...drawn.filter((d) => !required.includes(d)), ...drawnOther] });
  for (const r of c.roots) {
    const s = screen(r.root_id);
    if (!s) continue;
    if (r.stance === 'PROJECTION') {
      cover(r.root_id, r.regions.map((x) => x.region_id), refsOf(s, 'REGION'));
      const tiles = s.elements.filter((e) => e.kind === 'TILE');
      cover(`${r.root_id}.WORK_ACROSS_AIO`, c.lanes.map((l) => l.lane_id), [...new Set(tiles.flatMap((e) => e.maps_to.filter((m) => m.kind === 'LANE').map((m) => m.id!)))], tiles.filter((e) => !e.maps_to.some((m) => m.kind === 'LANE')).flatMap((e) => e.maps_to.map((m) => m.id ?? e.label)));
    } else if (r.stance === 'PRODUCTION') {
      const cards = s.elements.filter((e) => e.kind === 'LANE_CARD');
      cover(r.root_id, iaChildren(ia, r.root_id).filter((n) => n.kind === 'SERVICE_LANE').map((n) => n.node_id), [...new Set(cards.flatMap((e) => e.maps_to.filter((m) => m.kind === 'LANE').map((m) => m.id!)))], cards.filter((e) => !e.maps_to.some((m) => m.kind === 'LANE')).flatMap((e) => e.maps_to.map((m) => m.id ?? e.label)));
    } else if (r.stance === 'OVERSIGHT') {
      cover(r.root_id, r.regions.map((x) => x.region_id), refsOf(s, 'REPORT_DOMAIN'));
    } else if (r.stance === 'ADMINISTRATION') {
      cover(r.root_id, c.more_entries.map((e) => e.entry_id), refsOf(s, 'MORE_ENTRY'));
    }
  }
  return out;
}

/** Every drawn figure, with the metrics it would need and whether any of them is production-backed. */
export function drawnFigures(rec: DesignReconciliation, c: OfficeRootContracts) {
  return rec.reference.screens.flatMap((s) =>
    s.elements.filter((e) => e.figures.length).map((e) => {
      const metrics = e.maps_to.filter((m) => m.kind === 'METRIC').map((m) => c.metrics.find((x) => x.metric_id === m.id)!).filter(Boolean);
      return { root_id: s.root_id, element_id: e.element_id, figures: e.figures, metrics: metrics.map((m) => m.metric_id), production_backed: metrics.some((m) => m.backing === 'PRODUCTION') };
    }),
  );
}

/* ─────────────────────────────── validation ─────────────────────────────── */

const refExists = (r: ContractRef, c: OfficeRootContracts, ia: OfficeInformationArchitecture) => {
  if (r.kind === 'NONE') return r.id === null;
  if (!r.id) return false;
  if (r.kind === 'METRIC') return c.metrics.some((m) => m.metric_id === r.id);
  if (r.kind === 'ACTION') return c.roots.some((x) => x.actions.some((a) => a.action_id === r.id));
  if (r.kind === 'LANE') return c.lanes.some((l) => l.lane_id === r.id);
  if (r.kind === 'MORE_ENTRY') return c.more_entries.some((e) => e.entry_id === r.id);
  if (r.kind === 'REPORT_DOMAIN') return iaNode(ia, r.id)?.kind === 'REPORT_DOMAIN';
  if (r.kind === 'REGION') return c.roots.some((x) => x.regions.some((g) => g.region_id === r.id));
  return !!iaNode(ia, r.id);
};

/**
 * Reconciliation invariants. Returns every violation (empty = valid). Generic rules only; a project's exact findings
 * live in its tests.
 */
export function validateDesignReconciliation(rec: DesignReconciliation, c: OfficeRootContracts, ia: OfficeInformationArchitecture): string[] {
  const v: string[] = [];
  const ids = new Set<string>();
  const decisions = new Set(rec.decisions.map((d) => d.decision_id));
  const assets = new Set(rec.assets.map((a) => a.asset_id));
  for (const s of rec.reference.screens) {
    if (!c.roots.some((r) => r.root_id === s.root_id)) v.push(`screen ${s.root_id}: no root contract`);
    if (!s.elements.length) v.push(`screen ${s.root_id}: nothing inventoried`);
    for (const e of s.elements) {
      if (ids.has(e.element_id)) v.push(`element ${e.element_id}: duplicate id`);
      ids.add(e.element_id);
      if (!e.finding) v.push(`element ${e.element_id}: no finding`);
      if (!e.maps_to.length) v.push(`element ${e.element_id}: maps to nothing (use NONE)`);
      for (const r of e.maps_to) if (!refExists(r, c, ia)) v.push(`element ${e.element_id}: ${r.kind} ${r.id} does not exist`);
    }
  }
  for (const p of rec.pages) {
    if (!rec.reference.screens.some((s) => s.root_id === p.root_id)) v.push(`page ${p.root_id}: no reference screen`);
    for (const [k, xs] of Object.entries({ works: p.works, preserve: p.preserve, missing: p.missing, incorrect: p.incorrect, refine: p.refine })) if (!xs.length) v.push(`page ${p.root_id}: ${k} is empty`);
    for (const d of p.founder_decisions) if (!decisions.has(d)) v.push(`page ${p.root_id}: decision ${d} not defined`);
    for (const s of p.proposed) {
      if (!refExists(s.maps_to, c, ia)) v.push(`page ${p.root_id}: slot ${s.slot_id} maps to missing ${s.maps_to.kind} ${s.maps_to.id}`);
      if (s.asset && !assets.has(s.asset)) v.push(`page ${p.root_id}: slot ${s.slot_id} uses unknown asset ${s.asset}`);
    }
  }
  for (const d of rec.decisions) {
    if (d.options.length < 2) v.push(`decision ${d.decision_id}: fewer than two options`);
    if (!d.recommendation) v.push(`decision ${d.decision_id}: no recommendation`);
    if (d.status !== 'OPEN') v.push(`decision ${d.decision_id}: decided inside the reconciliation (only the founder decides)`);
  }
  for (const r of c.roots) for (const vp of DESIGN_VIEWPORTS) {
    const plan = rec.responsive.find((x) => x.root_id === r.root_id && x.viewport === vp);
    if (!plan) { v.push(`responsive ${r.root_id} ${vp}: no plan`); continue; }
    const page = rec.pages.find((p) => p.root_id === r.root_id);
    for (const id of plan.order) if (page && !page.proposed.some((s) => s.slot_id === id)) v.push(`responsive ${r.root_id} ${vp}: unknown slot ${id}`);
  }
  for (const a of rec.assets) if ((a.status === 'REUSE' || a.status === 'REUSE_WITH_FIX' || a.status === 'DO_NOT_USE') && !a.path) v.push(`asset ${a.asset_id}: ${a.status} without a path`);
  for (const p of rec.privacy_touchpoints) if (!c.gaps.some((g) => g.gap_id === p.gap_id)) v.push(`privacy ${p.gap_id}: not a recorded gap`);
  for (const row of rec.roles) if (!c.roots.some((r) => r.root_id === row.root_id)) v.push(`role row ${row.area}: unknown root`);
  return v;
}
