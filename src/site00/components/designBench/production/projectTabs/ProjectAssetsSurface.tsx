/**
 * P0.VR.DESIGN.OPUS-PROJECT-TABS1 — ASSETS as the project's asset desk.
 *
 * Previously this tab showed the twin's hard-coded manifest slots, which told
 * the founder nothing about the project: the same seven plates appeared for
 * every page and every project. It now reads the real per-page asset manifests
 * across the whole registry and presents them as one library — by status, by
 * category, with the page each asset is actually used on.
 *
 * The asset action modals (regenerate / replace / inspect) stay where they
 * are, on the page surface that owns the slot. This surface selects an asset
 * and hands off; it does not fork that workflow.
 */

import { useMemo, useState } from 'react';

import {
  buildProjectAssetLibrary,
  type ProjectAssetRecord,
} from '../../../../../../shared/site00-design-workspace-production/designProjectLibraries.js';
import {
  PTV_ASSET_CATEGORY_PLATE,
  projectTabVisualUrl,
} from '../../../../../../shared/site00-design-workspace-production/designProjectTabVisuals.js';
import { buildDesignProjectIntelligence } from '../../../../../../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { OverlayStatus } from '../designOverlayKit';
import {
  ProjectActionBar,
  ProjectCards,
  ProjectFacts,
  ProjectFeature,
  ProjectFilters,
  ProjectGroup,
  ProjectIdentity,
  ProjectInspector,
  ProjectPanes,
  ProjectRows,
  ProjectSearch,
  ProjectShot,
  ProjectSurface,
  ProjectViewAll,
  useShellFormat,
} from '../designProjectSurfaceKit';
import { useDesignProductionNavigation } from '../useDesignProductionNavigation';
import { designProductionPageTargetFromRecord } from '../designPageTargetFromRecord';
import { buildProjectDesignPageRegistry } from '../../../../../../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { writeDesignPageTarget } from '../designProductionPageTarget';
import { writeDesignWorkspaceSurface } from '../designProductionWorkspaceMode';
import { PsIconBox, PsIconCheck, PsIconSearch, PsIconUpload } from './projectTabIcons';

type FilterId = 'all' | 'approved' | 'staged' | 'generated' | 'uploaded';

export function ProjectAssetsSurface() {
  const { projectSlug, goWorkspace } = useDesignProductionNavigation();
  const format = useShellFormat();
  const library = useMemo(() => buildProjectAssetLibrary(projectSlug), [projectSlug]);
  const intelligence = useMemo(() => buildDesignProjectIntelligence(projectSlug), [projectSlug]);
  const registry = useMemo(() => buildProjectDesignPageRegistry(projectSlug), [projectSlug]);

  const [filter, setFilter] = useState<FilterId>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(library.featured?.versionId ?? null);

  const scoped = useMemo(() => {
    const base = library.all.filter((asset) => {
      if (filter === 'approved') return asset.status === 'APPROVED';
      if (filter === 'staged') return asset.status === 'STAGED';
      if (filter === 'generated') return asset.origin === 'GROK';
      if (filter === 'uploaded') return asset.origin === 'FOUNDER_UPLOAD';
      return true;
    });
    const needle = query.trim().toLowerCase();
    if (!needle) return base;
    return base.filter((asset) =>
      `${asset.displayName} ${asset.slot} ${asset.pageName} ${asset.format}`.toLowerCase().includes(needle),
    );
  }, [filter, library.all, query]);

  const selected = library.all.find((asset) => asset.versionId === selectedId) ?? scoped[0] ?? null;

  const openOwningPage = () => {
    if (!selected) return;
    const page = registry.find((record) => record.pageId === selected.pageId);
    if (!page) return;
    writeDesignPageTarget(projectSlug, designProductionPageTargetFromRecord(page));
    writeDesignWorkspaceSurface(projectSlug, 'page-workspace');
    goWorkspace();
  };

  const staged = library.all.filter((asset) => asset.status === 'STAGED');
  const unused = library.all.filter((asset) => !asset.isActiveForSlot);
  const captures = library.captures.slice(0, format === 'wide' ? 12 : 6);

  const inspector = selected ? (
    <ProjectInspector title="SELECTED ASSET">
      <ProjectShot
        src={selected.previewDataUrl}
        alt={selected.displayName}
        ratio="16 / 11"
        empty="NO ASSET PREVIEW"
      />
      <strong style={{ fontSize: 12 }}>{selected.displayName}</strong>
      <div className="tod-ps-tags">
        <span>{selected.slot}</span>
        <span>{selected.format}</span>
        <span>V{selected.versionNumber}</span>
      </div>
      <ProjectFacts
        entries={[
          { k: 'STATUS', v: <OverlayStatus label={selected.status} /> },
          { k: 'ORIGIN', v: selected.origin.replace(/_/g, ' ') },
          { k: 'DIMENSIONS', v: `${selected.width} × ${selected.height}` },
          { k: 'USED ON', v: `${selected.pageName} · ${selected.pageRoute}` },
          { k: 'ACTIVE SLOT', v: selected.isActiveForSlot ? 'YES' : 'NO' },
          { k: 'CREATED', v: selected.createdAt.slice(0, 10) },
        ]}
      />
      <button type="button" className="tod-ok-btn" onClick={openOwningPage}>
        OPEN OWNING PAGE →
      </button>
    </ProjectInspector>
  ) : (
    <ProjectInspector title="ASSET DESK">
      <ProjectShot
        src={captures[0]?.src ?? null}
        alt={captures[0]?.pageName ?? 'Project media'}
        ratio="16 / 11"
        empty="NO PROJECT MEDIA"
      />
      <ProjectFacts
        entries={[
          { k: 'GENERATED', v: library.generated },
          { k: 'UPLOADED', v: library.uploaded },
          { k: 'CAPTURES', v: library.captures.length },
          { k: 'PAGES', v: registry.length },
          {
            k: 'SLOTS STARTED',
            v: `${library.demand.filter((slot) => slot.filled > 0).length} / ${library.demand.length}`,
          },
        ]}
      />
      <p className="tod-ps-inspector__note">
        Select an asset to inspect it, or open a page to generate the slots this project still owes itself.
      </p>
    </ProjectInspector>
  );

  return (
    <ProjectSurface id="assets">
      <ProjectIdentity
        name={intelligence?.displayName ?? projectSlug.toUpperCase()}
        subtitle={`${intelligence?.projectType.replace(/_/g, ' ') ?? 'PROJECT'} · PROJECT ASSETS`}
        stats={[
          { label: 'TOTAL', value: library.total },
          { label: 'APPROVED', value: library.approved },
          { label: 'STAGED', value: library.staged },
          { label: 'GENERATED', value: library.generated },
          { label: 'UPLOADED', value: library.uploaded },
          { label: 'CAPTURES', value: library.captures.length },
        ]}
        authority={{ label: 'ASSET AUTHORITY', state: library.staged > 0 ? 'REVIEW PENDING' : 'CLEAN', locked: false }}
      />

      <ProjectPanes inspector={format === 'wide' || selected ? inspector : undefined}>
        <ProjectSearch
          placeholder="Search assets, slots, or filenames…"
          value={query}
          onChange={setQuery}
          trailing={<span className="tod-ps-chip">{scoped.length} RESULTS</span>}
        />
        <ProjectFilters
          chips={[
            { id: 'all', label: 'ALL ASSETS', count: library.total },
            { id: 'approved', label: 'APPROVED', count: library.approved },
            { id: 'staged', label: 'STAGED', count: library.staged },
            { id: 'generated', label: 'GROK', count: library.generated },
            { id: 'uploaded', label: 'UPLOADED', count: library.uploaded },
          ]}
          activeId={filter}
          onPick={(next) => setFilter(next as FilterId)}
        />

        {library.featured && filter === 'all' && !query ? (
          <ProjectFeature
            eyebrow="FEATURED ASSET"
            src={library.featured.previewDataUrl}
            title={library.featured.displayName}
            source={`${library.featured.format} · ${library.featured.width} × ${library.featured.height}`}
            body={`Slot ${library.featured.slot} on ${library.featured.pageName}.`}
            tags={[library.featured.slot, library.featured.origin.replace(/_/g, ' ')]}
            status={library.featured.status}
            onOpen={() => setSelectedId(library.featured?.versionId ?? null)}
          />
        ) : captures[0] && !query ? (
          <ProjectFeature
            eyebrow="LATEST PROJECT MEDIA"
            src={captures[0].src ?? projectTabVisualUrl('raster/plate-empty-library.jpg')}
            title={captures[0].pageName}
            source={`${captures[0].viewport} CAPTURE · ${captures[0].route}`}
            body="No generated or uploaded assets exist for this project yet. Captured page media is the media the project currently holds."
            tags={[captures[0].viewport, 'CAPTURE']}
            status={captures[0].designStatus.replace(/_/g, ' ')}
          />
        ) : null}

        {filter === 'all' && !query ? (
          <>
            {library.categories.map((category) => (
              <ProjectGroup
                key={category.id}
                title={`${category.label} ASSETS`}
                meta={`${category.assets.length}`}
                action={<ProjectViewAll onClick={() => setQuery(category.label.toLowerCase())} />}
                collapsible={format === 'tall' && category.assets.length > 4}
                defaultOpen
              >
                <ProjectCards
                  items={category.assets.slice(0, format === 'wide' ? 8 : 4).map(toCard)}
                  activeId={selected?.versionId ?? null}
                  onPick={setSelectedId}
                  columns={4}
                />
              </ProjectGroup>
            ))}
            {staged.length > 0 ? (
              <ProjectGroup title="STAGED / PENDING REVIEW" meta={`${staged.length}`}>
                <ProjectCards
                  items={staged.map(toCard)}
                  activeId={selected?.versionId ?? null}
                  onPick={setSelectedId}
                  columns={4}
                />
              </ProjectGroup>
            ) : null}
            {unused.length > 0 ? (
              <ProjectGroup
                title="SUPERSEDED / NOT ACTIVE"
                meta={`${unused.length}`}
                collapsible
                defaultOpen={false}
              >
                <ProjectCards
                  items={unused.map(toCard)}
                  activeId={selected?.versionId ?? null}
                  onPick={setSelectedId}
                  columns={4}
                />
              </ProjectGroup>
            ) : null}
          </>
        ) : (
          <ProjectGroup title={filter.toUpperCase()} meta={`${scoped.length}`}>
            <ProjectCards
              items={scoped.map(toCard)}
              activeId={selected?.versionId ?? null}
              onPick={setSelectedId}
              columns={4}
              emptyLabel="NO MATCHING ASSETS"
              emptyHint="Assets appear here once a page has generated or uploaded them."
            />
          </ProjectGroup>
        )}

        {library.total === 0 ? (
          <ProjectGroup title="PROJECT ASSET LIBRARY" meta="0">
            <ProjectCards
              items={[]}
              emptyLabel="NO GENERATED OR UPLOADED ASSETS YET"
              emptyHint="Generate or upload assets on a page and they are catalogued here for the whole project. The project's captured page media is listed below in the meantime."
            />
          </ProjectGroup>
        ) : null}

        {!query ? (
          <ProjectGroup
            title="ASSET DEMAND · SLOT COVERAGE"
            meta={`${library.demand.filter((slot) => slot.filled > 0).length}/${library.demand.length} SLOTS STARTED`}
          >
            <ProjectRows
              rows={library.demand.map((slot) => ({
                id: slot.slotId,
                name: slot.label,
                sub: `${slot.slotId} · ${slot.format}`,
                readiness: slot.pages === 0 ? 0 : Math.round((slot.filled / slot.pages) * 100),
                cells: [
                  { label: 'FILLED', value: slot.filled },
                  { label: 'PAGES', value: slot.pages },
                  { label: 'MISSING', value: Math.max(0, slot.pages - slot.filled) },
                ],
                status: slot.filled === 0 ? 'NEEDS GENERATION' : slot.filled < slot.pages ? 'PARTIAL' : 'COMPLETE',
              }))}
            />
          </ProjectGroup>
        ) : null}

        {captures.length > 0 && !query ? (
          <ProjectGroup
            title="CAPTURED PAGE MEDIA"
            meta={`${library.captures.length}`}
            collapsible={format === 'tall'}
            defaultOpen
          >
            <ProjectCards
              items={captures.map((capture) => ({
                id: capture.id,
                src: capture.src,
                title: capture.pageName,
                sub: `${capture.viewport} CAPTURE`,
                badge: capture.designStatus.replace(/_/g, ' '),
                footer: capture.route,
              }))}
              columns={4}
            />
          </ProjectGroup>
        ) : null}
      </ProjectPanes>

      <ProjectActionBar
        actions={[
          { id: 'upload', label: 'UPLOAD ASSET', icon: <PsIconUpload />, disabled: true },
          { id: 'page', label: 'OPEN OWNING PAGE', icon: <PsIconBox />, onClick: openOwningPage, disabled: !selected },
          { id: 'inspect', label: 'INSPECT', icon: <PsIconSearch />, disabled: !selected },
          { id: 'approve', label: 'APPROVE SELECTED', icon: <PsIconCheck />, disabled: selected?.status !== 'STAGED' },
        ]}
      />
    </ProjectSurface>
  );
}

function toCard(asset: ProjectAssetRecord) {
  return {
    id: asset.versionId,
    src: asset.previewDataUrl || projectTabVisualUrl(PTV_ASSET_CATEGORY_PLATE[asset.category] ?? 'plate-asset-empty.svg'),
    title: asset.displayName,
    sub: `${asset.format} · ${asset.width}×${asset.height}`,
    badge: asset.status,
    tags: [asset.slot],
    footer: asset.pageRoute,
  };
}
