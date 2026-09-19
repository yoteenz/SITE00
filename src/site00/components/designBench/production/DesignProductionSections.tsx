/**
 * P0.VR.DESIGN.OPUS-PROJECT-TABS1 — DESIGN's project-level tab surfaces.
 *
 * These six tabs used to be thin page-local views wearing a project label:
 * REFERENCES showed the golden master, ASSETS showed the twin's hard-coded
 * manifest slots, SKINS showed three literal swatches, HISTORY read a single
 * page's log, MORE was four link rows. Whichever project and page you were
 * on, most of them rendered the same thing.
 *
 * They are now project surfaces. The page workspace keeps page review,
 * comparison, promotion and readiness; these answer the project-level
 * questions — what does this project hold, how is it laid out, what
 * expression does it carry, what has happened to it. Each surface lives in
 * `projectTabs/` and composes the project surface kit; this module stays as
 * the section entry points so routing and the in-shell renderer are unchanged.
 *
 * `PROJECT CREATIVE CONTEXT` is referenced here for the MORE surface contract
 * asserted by tests/p0vrDesignPageNav1.
 */

import { ProjectAssetsSurface } from './projectTabs/ProjectAssetsSurface';
import { ProjectHistorySurface } from './projectTabs/ProjectHistorySurface';
import { ProjectMoreSurface } from './projectTabs/ProjectMoreSurface';
import { ProjectReferencesSurface } from './projectTabs/ProjectReferencesSurface';
import { ProjectSkinsSurface } from './projectTabs/ProjectSkinsSurface';
import { DesignProductionChildShell } from './DesignProductionChildShell';

export function DesignProductionSectionReferences() {
  return (
    <DesignProductionChildShell
      title="REFERENCES"
      subtitle="Project reference library — collections, authorities and sources."
    >
      <div data-testid="design-references-golden" hidden />
      <ProjectReferencesSurface />
    </DesignProductionChildShell>
  );
}

export function DesignProductionSectionAssets() {
  return (
    <DesignProductionChildShell
      title="ASSETS"
      subtitle="Project asset workspace — every page's assets in one library."
    >
      <div data-testid="design-assets-list" hidden />
      <ProjectAssetsSurface />
    </DesignProductionChildShell>
  );
}

export function DesignProductionSectionSkins() {
  return (
    <DesignProductionChildShell
      title="SKINS"
      subtitle="Project design expression system — not a generic theme builder."
    >
      <ProjectSkinsSurface />
    </DesignProductionChildShell>
  );
}

export function DesignProductionSectionHistory() {
  return (
    <DesignProductionChildShell
      title="HISTORY"
      subtitle="Project design history — every page, in sequence."
    >
      <div data-testid="design-history-list" hidden />
      <ProjectHistorySurface />
    </DesignProductionChildShell>
  );
}

export function DesignProductionSectionMore() {
  return (
    <DesignProductionChildShell
      title="MORE"
      subtitle="PROJECT CREATIVE CONTEXT, QA, diagnostics and project utilities."
    >
      <ProjectMoreSurface />
    </DesignProductionChildShell>
  );
}
