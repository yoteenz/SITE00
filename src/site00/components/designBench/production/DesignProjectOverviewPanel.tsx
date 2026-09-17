/**
 * P0.VR.DESIGN-PROJECT-BINDING1R1 — PROJECT DESIGN OVERVIEW (active project scope).
 */

import type { DesignBoundPageRecord } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/types.js';
import { writeDesignPageTarget } from './designProductionPageTarget';
import { writeDesignWorkspaceSurface } from './designProductionWorkspaceMode';
import type { useDesignProjectBinding } from './useDesignProjectBinding';

type Binding = ReturnType<typeof useDesignProjectBinding>;

function statusLabel(status: DesignBoundPageRecord['designStatus']): string {
  return status.replace(/_/g, ' ');
}

function openPage(binding: Binding, page: DesignBoundPageRecord) {
  writeDesignPageTarget(binding.projectSlug, {
    pageId: page.pageId,
    screenId: page.screenId,
    entryId: page.screenId,
    pageLabel: page.pageName,
    surfaceLabel: page.pageRole.replace(/_/g, ' '),
    route: page.route,
    pageRole: page.pageRole,
    designStatus: page.designStatus,
  });
  writeDesignWorkspaceSurface(binding.projectSlug, 'page-workspace');
  window.dispatchEvent(new CustomEvent('site00:design-workspace-surface', { detail: { projectSlug: binding.projectSlug } }));
  window.dispatchEvent(new CustomEvent('site00:design-page-target', { detail: { projectSlug: binding.projectSlug } }));
}

export function DesignProjectOverviewPanel({ binding }: { binding: Binding }) {
  const intel = binding.intelligence;
  if (!intel) {
    return (
      <div className="tod-dpo" data-testid="design-project-overview">
        <p className="tod-dpo__lead">No design-enabled project intelligence for this context.</p>
      </div>
    );
  }

  const resumePage = binding.activePage;

  return (
    <div className="tod-dpo" data-testid="design-project-overview">
      <header className="tod-dpo__head">
        <p className="tod-dpo__eyebrow">PROJECT DESIGN OVERVIEW</p>
        <h2 className="tod-dpo__title">ACTIVE PROJECT: {intel.displayName}</h2>
        <p className="tod-dpo__sub">{intel.description}</p>
      </header>

      <section className="tod-dpo__stats" aria-label="Project design completion">
        <div>
          <span className="tod-dpo__statLabel">APPROVED</span>
          <strong>
            {intel.pagesApproved} / {intel.totalPages}
          </strong>
        </div>
        <div>
          <span className="tod-dpo__statLabel">NEEDS DESIGN</span>
          <strong>{intel.pagesNeedingDesign}</strong>
        </div>
        <div>
          <span className="tod-dpo__statLabel">IN REVIEW</span>
          <strong>{intel.pagesInReview}</strong>
        </div>
        <div>
          <span className="tod-dpo__statLabel">READY TO BUILD</span>
          <strong>{intel.pagesReadyToBuild}</strong>
        </div>
        <div>
          <span className="tod-dpo__statLabel">BUILT</span>
          <strong>{intel.pagesBuilt}</strong>
        </div>
      </section>

      {resumePage && binding.workspaceSurface === 'project-overview' ?
        <section className="tod-dpo__resume">
          <p className="tod-dpo__resumeLabel">CONTINUE DESIGNING</p>
          <button type="button" className="tod-dpo__resumeBtn" onClick={() => openPage(binding, resumePage)}>
            {resumePage.pageName.toUpperCase()} · {statusLabel(resumePage.designStatus)}
          </button>
        </section>
      : null}

      <section className="tod-dpo__grid" aria-label="Real project pages">
        {binding.realPages.map((page) => (
          <article key={page.pageId} className="tod-dpo__card" data-design-status={page.designStatus}>
            <header className="tod-dpo__cardHead">
              <h3>{page.pageName.toUpperCase()}</h3>
              <span className="tod-dpo__status">{statusLabel(page.designStatus)}</span>
            </header>
            <p className="tod-dpo__route">{page.route}</p>
            <p className="tod-dpo__role">{page.pageRole.replace(/_/g, ' ')}</p>
            {page.mobilePreviewUrl ?
              <figure className="tod-dpo__preview">
                <img src={page.mobilePreviewUrl} alt="" loading="lazy" />
                <figcaption>MOBILE AUTHORITY PREVIEW</figcaption>
              </figure>
            : <p className="tod-dpo__missing">AUTHORITY PREVIEW · MISSING</p>}
            <button type="button" className="tod-dpo__open" onClick={() => openPage(binding, page)}>
              OPEN PAGE DESIGN WORKSPACE
            </button>
          </article>
        ))}
      </section>

      {binding.pageRegistry.some((p) => p.isConceptOrphan) ?
        <section className="tod-dpo__concepts" aria-label="Concept candidates">
          <h3 className="tod-dpo__conceptsTitle">CONCEPT CANDIDATES (NOT SITE PAGES)</h3>
          {binding.pageRegistry
            .filter((p) => p.isConceptOrphan)
            .map((page) => (
              <article key={page.pageId} className="tod-dpo__conceptCard">
                <p>
                  {page.pageName} · {page.authorityStatus}
                </p>
                <button type="button" className="tod-dpo__open" onClick={() => openPage(binding, page)}>
                  OPEN CONCEPT WORKSPACE
                </button>
              </article>
            ))}
        </section>
      : null}
    </div>
  );
}
