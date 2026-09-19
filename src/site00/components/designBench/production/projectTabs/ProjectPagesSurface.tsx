/**
 * P0.VR.DESIGN.OPUS-PROJECT-TABS1 — PAGES as the project's page architecture.
 *
 * The page surface already answers "how is this page doing". This answers
 * "how is the project laid out and where is the work". It keeps the one
 * behaviour the old list had — selecting a page retargets the workspace and
 * returns to it — and rebuilds everything around it: a map, page families
 * with previews, per-page readiness, and a coverage matrix that shows which
 * viewport expressions actually exist.
 */

import { useMemo, useState } from 'react';

import {
  buildProjectPageArchitecture,
} from '../../../../../../shared/site00-design-workspace-production/designProjectLibraries.js';
import type { DesignBoundPageRecord } from '../../../../../../shared/site00-design-workspace-production/designProjectBinding/types.js';
import { OverlayStatus } from '../designOverlayKit';
import {
  ProjectActionBar,
  ProjectCards,
  ProjectDial,
  ProjectFacts,
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
import { designProductionPageTargetFromRecord } from '../designPageTargetFromRecord';
import { readDesignPageTarget, writeDesignPageTarget } from '../designProductionPageTarget';
import { writeDesignWorkspaceSurface } from '../designProductionWorkspaceMode';
import { useDesignProductionNavigation } from '../useDesignProductionNavigation';
import { PsIconCheck, PsIconDoc, PsIconFilter, PsIconPlus } from './projectTabIcons';

type FilterId = 'all' | 'root' | 'children' | 'needs-design' | 'approved';

export function ProjectPagesSurface() {
  const { projectSlug, goWorkspace } = useDesignProductionNavigation();
  const format = useShellFormat();
  const architecture = useMemo(() => buildProjectPageArchitecture(projectSlug), [projectSlug]);
  const current = readDesignPageTarget(projectSlug);

  const [filter, setFilter] = useState<FilterId>('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    current?.pageId ?? architecture.all[0]?.pageId ?? null,
  );

  const childIds = useMemo(
    () => new Set(architecture.all.filter((page) => page.parentPageId).map((page) => page.pageId)),
    [architecture.all],
  );

  const scoped = useMemo(() => {
    const base = architecture.all.filter((page) => {
      if (filter === 'root') return !page.parentPageId;
      if (filter === 'children') return childIds.has(page.pageId);
      if (filter === 'needs-design')
        return page.designStatus === 'DESIGN_NEEDED' || page.designStatus === 'PLANNED';
      if (filter === 'approved')
        return page.designStatus === 'APPROVED' || page.designStatus === 'READY_TO_BUILD' || page.designStatus === 'BUILT';
      return true;
    });
    const needle = query.trim().toLowerCase();
    if (!needle) return base;
    return base.filter((page) =>
      `${page.pageName} ${page.route} ${page.pageRole}`.toLowerCase().includes(needle),
    );
  }, [architecture.all, childIds, filter, query]);

  const selected = architecture.all.find((page) => page.pageId === selectedId) ?? scoped[0] ?? null;

  /*
   * A 45-row list on a phone is the monolith this surface exists to replace.
   * The families above already carry the shape of the project, so the
   * hierarchy opens on a readable slice and expands on request.
   */
  const rowBudget = format === 'wide' ? 24 : 10;
  const hierarchyRows = expanded ? scoped : scoped.slice(0, rowBudget);

  const open = (page: DesignBoundPageRecord) => {
    writeDesignPageTarget(projectSlug, designProductionPageTargetFromRecord(page));
    writeDesignWorkspaceSurface(projectSlug, 'page-workspace');
    goWorkspace();
  };

  const readiness = (page: DesignBoundPageRecord): number => {
    const checks = [
      Boolean(page.mobilePreviewUrl),
      Boolean(page.desktopPreviewUrl),
      Boolean(page.designAuthorityVersion),
      Boolean(page.interactionContractVersion),
      page.designStatus === 'APPROVED' || page.designStatus === 'READY_TO_BUILD' || page.designStatus === 'BUILT',
      page.buildStatus === 'BUILT',
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  const inspector = selected ? (
    <ProjectInspector title="PAGE INSPECTOR">
      <ProjectShot
        src={selected.desktopPreviewUrl ?? selected.mobilePreviewUrl}
        alt={selected.pageName}
        empty="NO PAGE CAPTURE"
      />
      <strong style={{ fontSize: 12 }}>{selected.pageName.toUpperCase()}</strong>
      <ProjectFacts
        entries={[
          { k: 'ROUTE', v: selected.route },
          { k: 'PARENT', v: selected.parentPageId ?? 'ROOT' },
          { k: 'ROLE', v: selected.pageRole.replace(/_/g, ' ') },
          { k: 'DESIGN', v: <OverlayStatus label={selected.designStatus} /> },
          { k: 'BUILD', v: <OverlayStatus label={selected.buildStatus} /> },
          { k: 'AUTHORITY', v: selected.authorityStatus },
          { k: 'CONCEPT', v: selected.designAuthorityVersion ?? '—' },
          { k: 'CONTRACT', v: selected.interactionContractVersion ?? '—' },
          { k: 'CHILDREN', v: selected.childPageIds.length },
          { k: 'READY', v: `${readiness(selected)}%` },
        ]}
      />
      <button type="button" className="tod-ok-btn" onClick={() => open(selected)}>
        OPEN IN DESIGN →
      </button>
    </ProjectInspector>
  ) : null;

  return (
    <ProjectSurface id="pages">
      <ProjectIdentity
        name={architecture.intelligence?.displayName ?? projectSlug.toUpperCase()}
        subtitle="PROJECT PAGE ARCHITECTURE"
        stats={[
          { label: 'PAGES', value: architecture.totalPages },
          { label: 'ROOT', value: architecture.rootPages },
          { label: 'CHILDREN', value: architecture.childPages },
          { label: 'GRANDCHILDREN', value: architecture.grandchildPages },
          { label: 'NEEDS DESIGN', value: architecture.needsDesign.length },
        ]}
        authority={{
          label: 'PRODUCTION READY',
          state: `${architecture.intelligence?.pagesApproved ?? 0} / ${architecture.totalPages}`,
          locked: false,
        }}
      />

      <ProjectPanes inspector={inspector ?? undefined}>
        <section className="tod-ps-map">
          <header className="tod-ps-map__head">
            <span>PROJECT MAP · PAGE ARCHITECTURE</span>
            <em>
              {architecture.totalPages} PAGES · {architecture.rootPages} ROOT ·{' '}
              {architecture.childPages} CHILDREN · {architecture.grandchildPages} GRANDCHILDREN
            </em>
          </header>
          <div className="tod-ps-map__branches">
            {architecture.families.map((family) => (
              <button
                key={family.id}
                type="button"
                className="tod-ps-node"
                data-active={selected?.pageId === family.root.pageId ? 'true' : 'false'}
                onClick={() => setSelectedId(family.root.pageId)}
              >
                <strong>{family.route}</strong>
                <em>{family.total} PAGES · {family.readiness}%</em>
              </button>
            ))}
            {architecture.families.length === 0 ? (
              <span style={{ fontSize: 9, color: '#9a9a9a' }}>NO PAGES REGISTERED FOR THIS PROJECT</span>
            ) : null}
          </div>
        </section>

        <ProjectSearch
          placeholder="Search pages… (e.g. overview, /identity)"
          value={query}
          onChange={setQuery}
          trailing={<span className="tod-ps-chip">{scoped.length} PAGES</span>}
        />
        <ProjectFilters
          chips={[
            { id: 'all', label: 'ALL', count: architecture.totalPages },
            { id: 'root', label: 'ROOT', count: architecture.rootPages },
            { id: 'children', label: 'CHILDREN', count: architecture.childPages + architecture.grandchildPages },
            { id: 'needs-design', label: 'NEEDS DESIGN', count: architecture.needsDesign.length },
            { id: 'approved', label: 'APPROVED', count: architecture.intelligence?.pagesApproved ?? 0 },
          ]}
          activeId={filter}
          onPick={(next) => setFilter(next as FilterId)}
        />

        {filter === 'all' && !query && architecture.families.length > 0 ? (
          <ProjectGroup title="PAGE FAMILIES" meta={`${architecture.families.length}`}>
            <ProjectCards
              items={architecture.families.map((family) => ({
                id: family.root.pageId,
                src: family.previewUrl,
                title: family.label,
                sub: `${family.total} PAGES · ${family.readiness}% READY`,
                badge: family.needsDesign > 0 ? `${family.needsDesign} NEED DESIGN` : 'ON TRACK',
                footer: family.route,
              }))}
              activeId={selected?.pageId ?? null}
              onPick={setSelectedId}
              columns={format === 'wide' ? 6 : 2}
            />
          </ProjectGroup>
        ) : null}

        <ProjectGroup
          title="PAGES / HIERARCHY"
          meta={hierarchyRows.length < scoped.length ? `${hierarchyRows.length} / ${scoped.length}` : `${scoped.length}`}
          action={
            <ProjectViewAll
              label={expanded ? 'COLLAPSE' : 'EXPAND ALL'}
              onClick={() => setExpanded((prev) => !prev)}
            />
          }
          tight
        >
          <ProjectRows
            rows={hierarchyRows.map((page) => ({
              id: page.pageId,
              src: page.mobilePreviewUrl ?? page.desktopPreviewUrl ?? null,
              name: page.pageName.toUpperCase(),
              sub: page.route,
              readiness: readiness(page),
              cells: [
                { label: 'AUTH', value: page.authorityStatus },
                { label: 'CONCEPT', value: page.designAuthorityVersion ?? '—' },
                { label: 'BUILD', value: page.buildStatus.replace(/_/g, ' ') },
                { label: 'CHILDREN', value: page.childPageIds.length },
              ],
              status: page.designStatus,
            }))}
            activeId={selected?.pageId ?? null}
            onPick={setSelectedId}
            emptyLabel="NO PAGES MATCH THIS FILTER"
          />
        </ProjectGroup>

        {architecture.needsDesign.length > 0 ? (
          <ProjectGroup title="INCOMPLETE PAGES / NEEDS DESIGN" meta={`${architecture.needsDesign.length}`} tight>
            <ProjectRows
              rows={architecture.needsDesign.slice(0, format === 'wide' ? 10 : 5).map((page) => ({
                id: `needs-${page.pageId}`,
                src: page.mobilePreviewUrl ?? page.desktopPreviewUrl ?? null,
                name: page.pageName.toUpperCase(),
                sub: page.route,
                readiness: readiness(page),
                status: page.designStatus,
              }))}
              onPick={(id) => setSelectedId(id.replace(/^needs-/, ''))}
            />
          </ProjectGroup>
        ) : null}

        {format === 'wide' && architecture.coverage.length > 0 ? (
          <ProjectGroup title="DESIGN COVERAGE MATRIX" meta={`${architecture.totalPages} PAGES`}>
            <table className="tod-ps-matrix">
              <thead>
                <tr>
                  <th>PAGE FAMILY</th>
                  <th>TOTAL</th>
                  <th>MOBILE</th>
                  <th>DESKTOP</th>
                  <th>PARITY</th>
                </tr>
              </thead>
              <tbody>
                {architecture.coverage.map((row) => (
                  <tr key={row.family}>
                    <td>
                      <b>{row.family}</b>
                    </td>
                    <td>{row.total}</td>
                    <td>{row.mobile}</td>
                    <td>{row.desktop}</td>
                    <td>
                      <ProjectDial
                        percent={row.total === 0 ? 0 : (Math.min(row.mobile, row.desktop) / row.total) * 100}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>TOTAL</td>
                  <td>{architecture.totalPages}</td>
                  <td>{architecture.coverage.reduce((sum, row) => sum + row.mobile, 0)}</td>
                  <td>{architecture.coverage.reduce((sum, row) => sum + row.desktop, 0)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </ProjectGroup>
        ) : null}
      </ProjectPanes>

      <ProjectActionBar
        actions={[
          { id: 'create', label: 'CREATE PAGE', icon: <PsIconPlus />, disabled: true },
          { id: 'child', label: 'CREATE CHILD', icon: <PsIconDoc />, disabled: !selected },
          { id: 'filter', label: 'FILTER HIERARCHY', icon: <PsIconFilter />, onClick: () => setFilter('needs-design') },
          {
            id: 'open',
            label: 'OPEN IN DESIGN',
            icon: <PsIconCheck />,
            onClick: () => selected && open(selected),
            disabled: !selected,
          },
        ]}
      />
    </ProjectSurface>
  );
}
