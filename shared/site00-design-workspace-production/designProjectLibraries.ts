/**
 * P0.VR.DESIGN.OPUS-PROJECT-TABS1 — project-level views of the DESIGN stores.
 *
 * The workspace's page surfaces read one page at a time, which is right for
 * the page: the founder is reviewing a single thing. The top tabs are the
 * other half of the product — the library, the asset desk, the page map, the
 * expression system, the project timeline. Those need the project, and until
 * now nothing assembled one.
 *
 * Everything here is derived from stores that already exist. Nothing is
 * invented: if a project has no references, the library is empty and the
 * surface says so. A fabricated library is worse than a blank one, because it
 * teaches the founder to distrust the numbers.
 */

import {
  listPageAssetHistory,
  listActivePageAssets,
  type PageAssetHistoryEvent,
  type PageAssetLifecycleStatus,
  type PageAssetOrigin,
  type PageAssetVersionRecord,
} from './designPageActiveAssetManifest.js';
import { loadPageAuthorityWorkflow } from './designPageAuthorityWorkflow.js';
import { loadDesignProductionState } from './designProductionStore.js';
import { buildProjectDesignPageRegistry } from './designProjectBinding/designPageRegistry.js';
import { buildDesignProjectIntelligence } from './designProjectBinding/projectIntelligence.js';
import type {
  DesignBoundPageRecord,
  DesignPageDesignStatus,
  DesignProjectIntelligence,
} from './designProjectBinding/types.js';
import { listCanonicalReferences } from '../site00-studio-world-production/visualReconstruction/p0vr2/client.js';
import type { CanonicalVisualReference } from '../site00-studio-world-production/visualReconstruction/p0vr2/types.js';

/* ------------------------------------------------------------------ shared */

/** Storage paths are repo-relative (`public/...`); the browser wants a URL. */
export function referenceSrc(storagePath: string | null | undefined): string | null {
  if (!storagePath) return null;
  if (/^(https?:|data:|\/)/.test(storagePath)) return storagePath;
  return `/${storagePath.replace(/^public\//, '')}`;
}

function titleCase(input: string): string {
  return input.replace(/[_-]+/g, ' ').trim().toUpperCase();
}

function newestFirst(left: { at: string }, right: { at: string }): number {
  return right.at.localeCompare(left.at);
}

/* ------------------------------------------------------- reference library */

export type ProjectReferenceCollectionId =
  | 'authority'
  | 'brand'
  | 'page'
  | 'component'
  | 'icon'
  | 'archived';

export type ProjectReferenceRecord = {
  referenceId: string;
  label: string;
  src: string | null;
  route: string;
  viewport: string;
  scope: string;
  status: string;
  version: number;
  createdAt: string;
  createdBy: string;
  notes: string | null;
  collection: ProjectReferenceCollectionId;
  /** Pages in this project whose route matches the reference's route. */
  usedOnPages: number;
};

export type ProjectReferenceCollection = {
  id: ProjectReferenceCollectionId;
  label: string;
  description: string;
  references: ProjectReferenceRecord[];
};

export type ProjectReferenceLibrary = {
  projectId: string;
  total: number;
  approved: number;
  archived: number;
  featured: ProjectReferenceRecord | null;
  collections: ProjectReferenceCollection[];
  /** Flat, newest first — the grid's default order. */
  all: ProjectReferenceRecord[];
};

const REFERENCE_COLLECTIONS: {
  id: ProjectReferenceCollectionId;
  label: string;
  description: string;
}[] = [
  { id: 'authority', label: 'AUTHORITY REFERENCES', description: 'Upstream creative direction for viewport pairs.' },
  { id: 'brand', label: 'BRAND / IDENTITY', description: 'Logotype, voice and identity sources.' },
  { id: 'page', label: 'PAGE REFERENCES', description: 'Screen-level references bound to a route.' },
  { id: 'component', label: 'COMPONENT / LAYOUT', description: 'Region and component level direction.' },
  { id: 'icon', label: 'ICON / SYMBOL', description: 'Iconography and symbol sources.' },
  { id: 'archived', label: 'ARCHIVED / SUPERSEDED', description: 'Retired references kept for lineage.' },
];

function referenceCollection(ref: CanonicalVisualReference): ProjectReferenceCollectionId {
  const status = String(ref.status).toUpperCase();
  if (status.includes('SUPERSEDE') || status.includes('ARCHIV') || status.includes('RETIRE')) {
    return 'archived';
  }
  const scope = String(ref.scope).toUpperCase();
  if (scope === 'ICON') return 'icon';
  if (scope.includes('COMPONENT') || scope.includes('REGION')) return 'component';
  if (scope.includes('BRAND') || scope.includes('IDENTITY')) return 'brand';
  if (String(ref.screenId).toUpperCase().includes('AUTHORITY')) return 'authority';
  return 'page';
}

export function buildProjectReferenceLibrary(projectId: string): ProjectReferenceLibrary {
  const pages = buildProjectDesignPageRegistry(projectId);
  const routeCounts = new Map<string, number>();
  for (const page of pages) {
    routeCounts.set(page.route, (routeCounts.get(page.route) ?? 0) + 1);
  }

  const records: ProjectReferenceRecord[] = listCanonicalReferences(projectId).map((ref) => ({
    referenceId: ref.referenceId,
    label: titleCase(ref.screenId),
    src: referenceSrc(ref.storagePath),
    route: ref.route,
    viewport: String(ref.viewportClass).toUpperCase(),
    scope: titleCase(String(ref.scope)),
    status: titleCase(String(ref.status)),
    version: ref.version,
    createdAt: ref.createdAt,
    createdBy: ref.createdBy,
    notes: ref.notes ?? null,
    collection: referenceCollection(ref),
    usedOnPages: routeCounts.get(ref.route) ?? 0,
  }));

  const all = [...records].sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  return {
    projectId,
    total: all.length,
    approved: all.filter((ref) => ref.status.includes('APPROVED')).length,
    archived: all.filter((ref) => ref.collection === 'archived').length,
    featured: all.find((ref) => ref.src && ref.collection !== 'archived') ?? all[0] ?? null,
    collections: REFERENCE_COLLECTIONS.map((collection) => ({
      ...collection,
      references: all.filter((ref) => ref.collection === collection.id),
    })).filter((collection) => collection.references.length > 0),
    all,
  };
}

/* ----------------------------------------------------------- asset library */

export type ProjectAssetCategoryId = 'hero' | 'photography' | 'texture' | 'icon' | 'layout' | 'other';

export type ProjectAssetRecord = PageAssetVersionRecord & {
  pageName: string;
  pageRoute: string;
  category: ProjectAssetCategoryId;
};

export type ProjectAssetCategory = {
  id: ProjectAssetCategoryId;
  label: string;
  assets: ProjectAssetRecord[];
};

/**
 * A page capture is real project media — the screenshot the workspace holds
 * for a route — so the asset desk lists it. It is kept in its own band rather
 * than mixed into the asset grid, because a capture is evidence of a page,
 * not an asset the founder can replace or regenerate.
 */
export type ProjectCaptureRecord = {
  id: string;
  pageId: string;
  pageName: string;
  route: string;
  viewport: 'MOBILE' | 'DESKTOP';
  src: string;
  designStatus: string;
};

/** Slot coverage across the registry: what the project still owes itself. */
export type ProjectAssetDemandRow = {
  slotId: string;
  label: string;
  format: string;
  filled: number;
  pages: number;
};

export type ProjectAssetLibrary = {
  projectId: string;
  total: number;
  approved: number;
  staged: number;
  generated: number;
  uploaded: number;
  /** Assets whose page no longer exists in the registry. */
  orphaned: number;
  featured: ProjectAssetRecord | null;
  categories: ProjectAssetCategory[];
  byStatus: Record<string, number>;
  all: ProjectAssetRecord[];
  captures: ProjectCaptureRecord[];
  demand: ProjectAssetDemandRow[];
};

/**
 * The slots every designed page is expected to carry. This mirrors the Grok
 * page asset plan, which is the contract the generation step works to; naming
 * them here lets the asset desk show what is missing as well as what exists.
 */
const DEMAND_SLOTS: { slotId: string; label: string; format: string }[] = [
  { slotId: 'hero', label: 'HERO PLATE', format: 'WEBP' },
  { slotId: 'texture', label: 'PAPER TEXTURE', format: 'WEBP' },
  { slotId: 'icon-set', label: 'ICON SYSTEM', format: 'SVG' },
  { slotId: 'evidence', label: 'EVIDENCE TILES', format: 'WEBP' },
];

const ASSET_CATEGORIES: { id: ProjectAssetCategoryId; label: string }[] = [
  { id: 'hero', label: 'HERO' },
  { id: 'photography', label: 'PHOTOGRAPHY' },
  { id: 'texture', label: 'TEXTURE' },
  { id: 'icon', label: 'ICON' },
  { id: 'layout', label: 'LAYOUT' },
  { id: 'other', label: 'OTHER' },
];

function assetCategory(asset: PageAssetVersionRecord): ProjectAssetCategoryId {
  const token = `${asset.slot} ${asset.displayName}`.toUpperCase();
  if (token.includes('HERO')) return 'hero';
  if (token.includes('ICON') || token.includes('GLYPH') || token.includes('MARK')) return 'icon';
  if (token.includes('TEXTURE') || token.includes('GRAIN') || token.includes('PLATE')) return 'texture';
  if (token.includes('PHOTO') || token.includes('PORTRAIT') || token.includes('IMAGE')) return 'photography';
  if (token.includes('LAYOUT') || token.includes('GRID') || token.includes('TEMPLATE')) return 'layout';
  return 'other';
}

function isOrigin(asset: PageAssetVersionRecord, origin: PageAssetOrigin): boolean {
  return asset.origin === origin;
}

function isStatus(asset: PageAssetVersionRecord, status: PageAssetLifecycleStatus): boolean {
  return asset.status === status;
}

export function buildProjectAssetLibrary(projectId: string): ProjectAssetLibrary {
  const pages = buildProjectDesignPageRegistry(projectId);
  const all: ProjectAssetRecord[] = [];

  for (const page of pages) {
    for (const asset of listActivePageAssets(projectId, page.pageId)) {
      all.push({
        ...asset,
        pageName: page.pageName,
        pageRoute: page.route,
        category: assetCategory(asset),
      });
    }
  }

  all.sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  const byStatus: Record<string, number> = {};
  for (const asset of all) {
    const key = String(asset.status).toUpperCase();
    byStatus[key] = (byStatus[key] ?? 0) + 1;
  }

  return {
    projectId,
    total: all.length,
    approved: all.filter((asset) => isStatus(asset, 'APPROVED')).length,
    staged: all.filter((asset) => isStatus(asset, 'STAGED')).length,
    generated: all.filter((asset) => isOrigin(asset, 'GROK')).length,
    uploaded: all.filter((asset) => isOrigin(asset, 'FOUNDER_UPLOAD')).length,
    orphaned: all.filter((asset) => !asset.isActiveForSlot).length,
    featured: all.find((asset) => isStatus(asset, 'APPROVED')) ?? all[0] ?? null,
    categories: ASSET_CATEGORIES.map((category) => ({
      ...category,
      assets: all.filter((asset) => asset.category === category.id),
    })).filter((category) => category.assets.length > 0),
    byStatus,
    all,
    captures: buildProjectCaptures(pages),
    demand: DEMAND_SLOTS.map((slot) => ({
      ...slot,
      pages: pages.length,
      filled: pages.filter((page) =>
        all.some((asset) => asset.pageId === page.pageId && asset.slot === slot.slotId),
      ).length,
    })),
  };
}

function buildProjectCaptures(pages: DesignBoundPageRecord[]): ProjectCaptureRecord[] {
  const captures: ProjectCaptureRecord[] = [];
  for (const page of pages) {
    const shots: Array<['MOBILE' | 'DESKTOP', string | null]> = [
      ['MOBILE', page.mobilePreviewUrl],
      ['DESKTOP', page.desktopPreviewUrl],
    ];
    for (const [viewport, src] of shots) {
      if (!src) continue;
      captures.push({
        id: `${page.pageId}-${viewport.toLowerCase()}`,
        pageId: page.pageId,
        pageName: page.pageName,
        route: page.route,
        viewport,
        src,
        designStatus: page.designStatus,
      });
    }
  }
  return captures;
}

/* ------------------------------------------------------- page architecture */

export type ProjectPageFamily = {
  id: string;
  label: string;
  route: string;
  /** The family head — the root page of this branch. */
  root: DesignBoundPageRecord;
  children: DesignBoundPageRecord[];
  grandchildren: DesignBoundPageRecord[];
  total: number;
  approved: number;
  needsDesign: number;
  readiness: number;
  previewUrl: string | null;
};

export type ProjectCoverageRow = {
  family: string;
  total: number;
  mobile: number;
  desktop: number;
};

export type ProjectPageArchitecture = {
  projectId: string;
  intelligence: DesignProjectIntelligence | null;
  totalPages: number;
  rootPages: number;
  childPages: number;
  grandchildPages: number;
  needsDesign: DesignBoundPageRecord[];
  families: ProjectPageFamily[];
  coverage: ProjectCoverageRow[];
  all: DesignBoundPageRecord[];
};

const APPROVED_STATUSES: DesignPageDesignStatus[] = ['APPROVED', 'READY_TO_BUILD', 'BUILT'];

function pageReadiness(page: DesignBoundPageRecord): number {
  const checks = [
    Boolean(page.mobilePreviewUrl),
    Boolean(page.desktopPreviewUrl),
    Boolean(page.designAuthorityVersion),
    Boolean(page.interactionContractVersion),
    APPROVED_STATUSES.includes(page.designStatus),
    page.buildStatus === 'BUILT',
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/**
 * Registered pages carry their hierarchy in the route far more often than in
 * `parentPageId` — NDXBOOK has 45 pages and one declared parent, but routes
 * like `/character/continuity/review` describe the tree exactly. So parentage
 * falls back to the longest page route that is a proper prefix of this one.
 * Reading the declared link first keeps any explicit parenting authoritative.
 */
function resolveParent(
  page: DesignBoundPageRecord,
  all: DesignBoundPageRecord[],
): DesignBoundPageRecord | null {
  if (page.parentPageId) {
    const declared = all.find((candidate) => candidate.pageId === page.parentPageId);
    if (declared) return declared;
  }

  let best: DesignBoundPageRecord | null = null;
  for (const candidate of all) {
    if (candidate.pageId === page.pageId) continue;
    if (!page.route.startsWith(`${candidate.route}/`)) continue;
    if (!best || candidate.route.length > best.route.length) best = candidate;
  }
  return best;
}

/**
 * Family key: the first word of a page's first route segment. Projects name
 * areas with a shared prefix far more reliably than they nest them, so
 * `content-library` and `content-operations/campaign-board` belong to the same
 * family even though only one of them is nested. Grouping on the whole segment
 * would split them; grouping on the root page would put all 45 in one.
 */
function familyKey(route: string, projectId: string): string {
  const base = `/projects/${projectId}/`;
  const tail = route.startsWith(base) ? route.slice(base.length) : route.replace(/^\//, '');
  const segments = tail.split('/').filter(Boolean);
  if (segments.length === 0) return 'root';
  return segments[0].split('-')[0];
}

export function buildProjectPageArchitecture(projectId: string): ProjectPageArchitecture {
  const all = buildProjectDesignPageRegistry(projectId);
  const parents = new Map(all.map((page) => [page.pageId, resolveParent(page, all)]));
  const depth = (page: DesignBoundPageRecord): number => {
    let level = 0;
    let cursor: DesignBoundPageRecord | null = page;
    while (cursor && level < 6) {
      cursor = parents.get(cursor.pageId) ?? null;
      if (cursor) level += 1;
    }
    return level;
  };

  const roots = all.filter((page) => depth(page) === 0);

  /*
   * Families group by the first route segment, not by root page. A project
   * whose registry contains a page at its own base route has exactly one root
   * and therefore exactly one family, which tells the founder nothing; the
   * segment is what actually names an area of the site.
   */
  const groups = new Map<string, DesignBoundPageRecord[]>();
  for (const page of all) {
    const key = familyKey(page.route, projectId);
    const group = groups.get(key);
    if (group) group.push(page);
    else groups.set(key, [page]);
  }

  const families: ProjectPageFamily[] = [...groups.entries()].map(([key, members]) => {
    const ranked = [...members].sort((left, right) => depth(left) - depth(right));
    const root = ranked[0];
    const headDepth = depth(root);
    const children = ranked.filter((page) => depth(page) === headDepth + 1);
    const grandchildren = ranked.filter((page) => depth(page) > headDepth + 1);
    const readinessTotal = members.reduce((sum, page) => sum + pageReadiness(page), 0);

    return {
      id: root.pageId,
      label: titleCase(key),
      route: root.route,
      root,
      children,
      grandchildren,
      total: members.length,
      approved: members.filter((page) => APPROVED_STATUSES.includes(page.designStatus)).length,
      needsDesign: members.filter((page) => page.designStatus === 'DESIGN_NEEDED').length,
      readiness: members.length === 0 ? 0 : Math.round(readinessTotal / members.length),
      previewUrl:
        members.map((page) => page.desktopPreviewUrl ?? page.mobilePreviewUrl).find(Boolean) ?? null,
    };
  });

  families.sort((left, right) => right.total - left.total || left.label.localeCompare(right.label));

  return {
    projectId,
    intelligence: buildDesignProjectIntelligence(projectId),
    totalPages: all.length,
    rootPages: roots.length,
    childPages: all.filter((page) => depth(page) === 1).length,
    grandchildPages: all.filter((page) => depth(page) >= 2).length,
    needsDesign: all.filter(
      (page) => page.designStatus === 'DESIGN_NEEDED' || page.designStatus === 'PLANNED',
    ),
    families,
    coverage: families.map((family) => {
      const members = [family.root, ...family.children, ...family.grandchildren];
      return {
        family: family.label,
        total: members.length,
        mobile: members.filter((page) => Boolean(page.mobilePreviewUrl)).length,
        desktop: members.filter((page) => Boolean(page.desktopPreviewUrl)).length,
      };
    }),
    all,
  };
}

/* --------------------------------------------------------- project history */

export type ProjectHistoryKind =
  | 'CONCEPT'
  | 'AUTHORITY'
  | 'PROMOTION'
  | 'REVIEW'
  | 'HANDOFF'
  | 'LOCK'
  | 'ASSET'
  | 'BUILD'
  | 'EVENT';

export type ProjectHistoryEvent = {
  id: string;
  at: string;
  kind: ProjectHistoryKind;
  title: string;
  detail: string;
  pageId: string;
  pageName: string;
  actor: string;
  /** Thumbnails when the event has a visual record; the timeline shows them. */
  before?: string | null;
  after?: string | null;
};

export type ProjectHistory = {
  projectId: string;
  total: number;
  events: ProjectHistoryEvent[];
  byKind: Record<string, number>;
  pagesAffected: number;
  latest: ProjectHistoryEvent | null;
};

function historyKind(type: string): ProjectHistoryKind {
  const token = type.toUpperCase();
  if (token.includes('PROMOT')) return 'PROMOTION';
  if (token.includes('LOCK')) return 'LOCK';
  if (token.includes('HANDOFF') || token.includes('COMPOSER')) return 'HANDOFF';
  if (token.includes('REVIEW')) return 'REVIEW';
  if (token.includes('ASSET')) return 'ASSET';
  if (token.includes('AUTHORITY')) return 'AUTHORITY';
  if (token.includes('CONCEPT')) return 'CONCEPT';
  if (token.includes('TWIN') || token.includes('BUILD') || token.includes('FRAMEWORK')) return 'BUILD';
  return 'EVENT';
}

function assetEventActor(event: PageAssetHistoryEvent): string {
  return event.type.includes('upload') || event.type.includes('replacement') ? 'FOUNDER' : 'GROK';
}

export function buildProjectHistory(projectId: string): ProjectHistory {
  const pages = buildProjectDesignPageRegistry(projectId);
  const events: ProjectHistoryEvent[] = [];

  /*
   * Three real sources, in widening scope: the workspace's own production log
   * (project-scoped, every promotion / refine / lock the founder performed),
   * the canonical reference captures (the moment a screen entered the
   * project's authority), and then the per-page authority and asset records.
   */
  for (const entry of loadDesignProductionState(projectId).history) {
    events.push({
      id: `dp-${entry.id}`,
      at: entry.at,
      kind: historyKind(entry.type),
      title: titleCase(entry.type),
      detail: entry.summary,
      pageId: 'project',
      pageName: 'PROJECT',
      actor: entry.actorEmail ? entry.actorEmail.split('@')[0]!.toUpperCase() : 'FOUNDER',
    });
  }

  const pageByRoute = new Map(pages.map((page) => [page.route, page]));
  for (const ref of listCanonicalReferences(projectId)) {
    const page = pageByRoute.get(ref.route) ?? null;
    events.push({
      id: `ref-${ref.referenceId}`,
      at: ref.createdAt,
      kind: 'AUTHORITY',
      title: 'REFERENCE CAPTURED',
      detail: `${titleCase(ref.screenId)} · ${String(ref.viewportClass).toUpperCase()} · v${ref.version}${
        ref.notes ? ` — ${ref.notes}` : ''
      }`,
      pageId: page?.pageId ?? ref.referenceId,
      pageName: page?.pageName ?? ref.route,
      actor: ref.createdBy.toUpperCase(),
      after: referenceSrc(ref.storagePath),
    });
  }

  for (const page of pages) {
    const workflow = loadPageAuthorityWorkflow(projectId, page.pageId);
    for (const event of workflow.history) {
      events.push({
        id: `wf-${page.pageId}-${event.type}-${event.at}`,
        at: event.at,
        kind: historyKind(event.type),
        title: titleCase(event.type),
        detail: event.summary,
        pageId: page.pageId,
        pageName: page.pageName,
        actor: 'FOUNDER',
      });
    }

    for (const event of listPageAssetHistory(projectId, page.pageId)) {
      events.push({
        id: event.id,
        at: event.timestamp,
        kind: 'ASSET',
        title: titleCase(event.type),
        detail: event.detail,
        pageId: page.pageId,
        pageName: page.pageName,
        actor: assetEventActor(event),
      });
    }
  }

  events.sort(newestFirst);

  const byKind: Record<string, number> = {};
  for (const event of events) byKind[event.kind] = (byKind[event.kind] ?? 0) + 1;

  return {
    projectId,
    total: events.length,
    events,
    byKind,
    pagesAffected: new Set(events.map((event) => event.pageId)).size,
    latest: events[0] ?? null,
  };
}
