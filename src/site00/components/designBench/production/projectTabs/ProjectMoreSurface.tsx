/**
 * P0.VR.DESIGN.OPUS-PROJECT-TABS1 — MORE as curated project utilities.
 *
 * MORE is the tab most likely to become a junk drawer, so every module here
 * earns its place by carrying live project numbers rather than just a link.
 * Creative context, twin QA, diagnostics, the icon sheet and the manifest are
 * each shown with what they currently say about the project; a module that
 * could only ever render a button belongs in a nav list, not here.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { SITE00_ROUTES } from '../../../../config/routes';
import { getCurrentUser, isAdminFounderAccount } from '../../../../../utils/adminAuth';

import {
  buildProjectAssetLibrary,
  buildProjectHistory,
  buildProjectPageArchitecture,
  buildProjectReferenceLibrary,
} from '../../../../../../shared/site00-design-workspace-production/designProjectLibraries.js';
import { buildProjectSkinSystem } from '../../../../../../shared/site00-design-workspace-production/designProjectSkinSystem.js';
import {
  ProjectActionBar,
  ProjectBanner,
  ProjectDial,
  ProjectFacts,
  ProjectIdentity,
  ProjectModule,
  ProjectModules,
  ProjectStats,
  ProjectSurface,
} from '../designProjectSurfaceKit';
import { useTwinOpusDirectProduction } from '../../opusDirect/useTwinOpusDirectProduction';
import { useDesignProductionNavigation } from '../useDesignProductionNavigation';
import {
  PsIconArchive,
  PsIconBox,
  PsIconChart,
  PsIconGrid,
  PsIconImage,
  PsIconMonitor,
  PsIconShield,
  PsIconSliders,
} from './projectTabIcons';

export function ProjectMoreSurface() {
  const { projectSlug, goReferenceTwin, goWorkspace, goSection } = useDesignProductionNavigation();
  const production = useTwinOpusDirectProduction(projectSlug);

  const architecture = useMemo(() => buildProjectPageArchitecture(projectSlug), [projectSlug]);
  const references = useMemo(() => buildProjectReferenceLibrary(projectSlug), [projectSlug]);
  const assets = useMemo(() => buildProjectAssetLibrary(projectSlug), [projectSlug]);
  const history = useMemo(() => buildProjectHistory(projectSlug), [projectSlug]);
  const skin = useMemo(() => buildProjectSkinSystem(projectSlug), [projectSlug]);

  const intelligence = architecture.intelligence;
  const pagesMissingAuthority = architecture.all.filter((page) => !page.designAuthorityVersion).length;
  const pagesMissingContract = architecture.all.filter((page) => !page.interactionContractVersion).length;
  const health =
    architecture.totalPages === 0
      ? 0
      : Math.round(
          ((architecture.totalPages - pagesMissingAuthority) / architecture.totalPages) * 100,
        );

  const showWorkspaceSelfEntry = isAdminFounderAccount(getCurrentUser());

  return (
    <ProjectSurface id="more">
      <ProjectIdentity
        name={intelligence?.displayName ?? projectSlug.toUpperCase()}
        subtitle="PROJECT UTILITIES"
        stats={[
          { label: 'PAGES', value: architecture.totalPages },
          { label: 'REFERENCES', value: references.total },
          { label: 'ASSETS', value: assets.total },
          { label: 'EVENTS', value: history.total },
        ]}
        authority={{ label: 'SYSTEM HEALTH', state: `${health}%`, locked: false }}
      />

      <ProjectBanner
        eyebrow={intelligence?.displayName ?? projectSlug.toUpperCase()}
        title="DESIGN WORKSPACE"
        lede="PROJECT UTILITIES · HIGHER SIGNAL"
        columns={[
          { label: 'FOCUS', lines: (intelligence?.primaryCreativeStream ?? 'PROJECT').split('_').slice(0, 3) },
          { label: 'TOOLS', lines: ['INSIGHTS', 'SYSTEMS', 'PROGRESS'] },
        ]}
        mark={(intelligence?.displayName ?? projectSlug).slice(0, 3).toUpperCase()}
        src={
          architecture.families[0]?.previewUrl ??
          '/site00/project-tabs/staged/raster/plate-more-banner.jpg'
        }
      />

      <ProjectModules>
        <ProjectModule
          icon={<PsIconImage />}
          title="PROJECT CREATIVE CONTEXT"
          lede="Core narrative, intent, audience and creative boundaries."
          onOpen={() => {
            production.actions.openCreativeContext();
            goWorkspace();
          }}
          actions={
            <button
              type="button"
              className="tod-ok-btn"
              onClick={() => {
                production.actions.openCreativeContext();
                goWorkspace();
              }}
            >
              VIEW PROJECT BRIEF →
            </button>
          }
        >
          <ProjectFacts
            entries={[
              { k: 'BRAND', v: intelligence?.brandExpression ?? '—' },
              { k: 'STREAM', v: intelligence?.primaryCreativeStream.replace(/_/g, ' ') ?? '—' },
              { k: 'TYPE', v: intelligence?.projectType.replace(/_/g, ' ') ?? '—' },
            ]}
          />
        </ProjectModule>

        <ProjectModule
          icon={<PsIconShield />}
          title="DESIGN SYSTEM HEALTH"
          lede="Keep the project consistent. Find issues. Stay aligned."
          onOpen={() => goSection('skins')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ProjectDial percent={health} label="HEALTH" />
            <ProjectStats
              columns={2}
              entries={[
                {
                  label: 'PAGES MISSING AUTHORITY',
                  value: pagesMissingAuthority,
                  tone: pagesMissingAuthority > 0 ? 'warn' : 'ok',
                },
                {
                  label: 'INTERACTION GAPS',
                  value: pagesMissingContract,
                  tone: pagesMissingContract > 0 ? 'warn' : 'ok',
                },
              ]}
            />
          </div>
        </ProjectModule>

        <ProjectModule
          icon={<PsIconMonitor />}
          title="TWIN REFERENCE / QA"
          lede="Design vs build. Find gaps. Ship with confidence."
          onOpen={goReferenceTwin}
          actions={
            <button type="button" className="tod-ok-btn" onClick={goReferenceTwin}>
              OPEN QA CENTER →
            </button>
          }
        >
          <ProjectStats
            columns={3}
            entries={[
              { label: 'PAGES NEED REVIEW', value: architecture.needsDesign.length },
              { label: 'STAGED ASSETS', value: assets.staged },
              { label: 'FAMILIES', value: architecture.families.length },
            ]}
          />
        </ProjectModule>

        <ProjectModule
          icon={<PsIconChart />}
          title="OPUS NATIVE DIAGNOSTIC ROUTE"
          lede="Run the project through the Opus native design pipeline."
          actions={
            <Link to={`/projects/${projectSlug}/design/opus-native`} className="tod-ok-btn">
              RUN DIAGNOSTIC →
            </Link>
          }
        >
          <ProjectFacts
            entries={[
              { k: 'CONTENT', v: architecture.totalPages > 0 ? 'PASS' : 'NO PAGES' },
              { k: 'ASSET INTEGRITY', v: assets.orphaned === 0 ? 'PASS' : `${assets.orphaned} SUPERSEDED` },
              { k: 'REVIEW READINESS', v: `${architecture.intelligence?.pagesApproved ?? 0} APPROVED` },
            ]}
          />
        </ProjectModule>

        <ProjectModule
          icon={<PsIconGrid />}
          title="ICON SHEET"
          lede="Project iconography, UI elements and brand symbols."
          actions={
            <Link to={`/projects/${projectSlug}/inspect/icons`} className="tod-ok-btn">
              BROWSE ICON SHEET →
            </Link>
          }
        >
          <ProjectFacts
            entries={[
              { k: 'COMPONENTS', v: skin.componentStyles.length },
              { k: 'PANEL PATTERNS', v: skin.panelGrammar.length },
              { k: 'TEXTURES', v: skin.textures.length },
            ]}
          />
        </ProjectModule>

        <ProjectModule
          icon={<PsIconBox />}
          title="MANIFEST INSPECTOR"
          lede="Project structure, metadata and dependencies."
        >
          <ProjectFacts
            entries={[
              { k: 'PAGE REGISTRY', v: intelligence?.pageRegistryId ?? '—' },
              { k: 'REFERENCES', v: references.total },
              { k: 'ASSET RECORDS', v: assets.total },
              { k: 'HISTORY EVENTS', v: history.total },
            ]}
          />
        </ProjectModule>

        <ProjectModule
          icon={<PsIconSliders />}
          title="PROJECT DESIGN SETTINGS"
          lede="Inheritance, naming, structure and defaults."
        >
          <ProjectFacts
            entries={[
              { k: 'NAMING', v: `${projectSlug}:[page]` },
              { k: 'ROOT PAGES', v: architecture.rootPages },
              { k: 'INHERITED', v: architecture.childPages + architecture.grandchildPages },
            ]}
          />
        </ProjectModule>

        {showWorkspaceSelfEntry ? (
          <ProjectModule
            icon={<PsIconSliders />}
            title="SYSTEM DESIGN"
            lede="Internal WORKSPACE_SELF concept workflow — does not change live DESIGN."
          >
            <Link to={SITE00_ROUTES.systemDesignWorkspaceConcepts} className="tod-child__link">
              REDESIGN DESIGN WORKSPACE →
            </Link>
          </ProjectModule>
        ) : null}

        <ProjectModule
          icon={<PsIconArchive />}
          title="ARCHIVE / LEGACY"
          lede="Past work, reusable assets, diagnostics."
        >
          <ProjectStats
            columns={3}
            entries={[
              { label: 'ARCHIVED REFS', value: references.archived },
              { label: 'SUPERSEDED ASSETS', value: assets.orphaned },
              { label: 'CONCEPT ORPHANS', value: architecture.all.filter((page) => page.isConceptOrphan).length },
            ]}
          />
        </ProjectModule>
      </ProjectModules>

      <ProjectActionBar
        actions={[
          { id: 'qa', label: 'OPEN QA CENTER', icon: <PsIconMonitor />, onClick: goReferenceTwin },
          { id: 'health', label: 'VIEW HEALTH', icon: <PsIconChart />, onClick: () => goSection('skins') },
          { id: 'pages', label: 'PAGE REGISTRY', icon: <PsIconBox />, onClick: () => goSection('pages') },
          { id: 'history', label: 'PROJECT HISTORY', icon: <PsIconArchive />, onClick: () => goSection('history') },
        ]}
      />
    </ProjectSurface>
  );
}
