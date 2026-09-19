/**
 * P0.VR.DESIGN.OPUS-PROJECT-TABS1 — the hamburger, as the project's workspace
 * drawer rather than a link list.
 *
 * What it was: two module links and a list of projects. Useful once, then
 * never again. What the founder actually needs on opening it is orientation
 * ("which project, how is it doing"), then the destinations inside that
 * project, then a fast switch, then utilities — in that order, because that
 * is the order the questions arrive in.
 *
 * Counts on the destination rows come from the same project libraries the tab
 * surfaces read, so the drawer is a status view as well as a menu.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import {
  buildProjectAssetLibrary,
  buildProjectHistory,
  buildProjectPageArchitecture,
  buildProjectReferenceLibrary,
} from '../../../../../../shared/site00-design-workspace-production/designProjectLibraries.js';
import { listDesignEnabledManagedProjects } from '../../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js';
import {
  site00ProjectsDesignActiveProjectPath,
  site00ProjectsDesignModulePath,
  site00ProjectsExperienceModulePath,
  site00ProjectDesignSectionPath,
} from '../../../../config/routes';
import { OverlayStatus } from '../designOverlayKit';
import {
  PsIconArchive,
  PsIconBox,
  PsIconChart,
  PsIconClock,
  PsIconDoc,
  PsIconExit,
  PsIconGrid,
  PsIconHome,
  PsIconImage,
  PsIconLayers,
  PsIconMonitor,
  PsIconPalette,
  PsIconShield,
  PsIconUser,
} from './projectTabIcons';

type Destination = {
  id: string;
  label: string;
  sub: string;
  icon: React.ReactNode;
  to?: string;
  onClick?: () => void;
  badge?: number;
};

export function ProjectWorkspaceDrawer({
  activeProjectSlug,
  onNavigate,
}: {
  activeProjectSlug: string;
  onNavigate?: () => void;
}) {
  const architecture = useMemo(
    () => buildProjectPageArchitecture(activeProjectSlug),
    [activeProjectSlug],
  );
  const references = useMemo(
    () => buildProjectReferenceLibrary(activeProjectSlug),
    [activeProjectSlug],
  );
  const assets = useMemo(() => buildProjectAssetLibrary(activeProjectSlug), [activeProjectSlug]);
  const history = useMemo(() => buildProjectHistory(activeProjectSlug), [activeProjectSlug]);

  const intelligence = architecture.intelligence;
  const projects = listDesignEnabledManagedProjects().filter(
    (project) => project.projectId !== 'site00',
  );
  const section = (id: Parameters<typeof site00ProjectDesignSectionPath>[1]) =>
    site00ProjectDesignSectionPath(activeProjectSlug, id);

  const destinations: Destination[] = [
    {
      id: 'workspace',
      label: 'WORKSPACE HOME',
      sub: 'Page review and activity',
      icon: <PsIconHome />,
      to: site00ProjectsDesignActiveProjectPath(activeProjectSlug),
    },
    {
      id: 'references',
      label: 'REFERENCES',
      sub: 'Inspiration and source material',
      icon: <PsIconImage />,
      to: section('references'),
      badge: references.total,
    },
    {
      id: 'assets',
      label: 'ASSETS',
      sub: 'Media, files and design elements',
      icon: <PsIconBox />,
      to: section('assets'),
      badge: assets.total,
    },
    {
      id: 'pages',
      label: 'PAGES',
      sub: 'All page designs and variants',
      icon: <PsIconDoc />,
      to: section('pages'),
      badge: architecture.totalPages,
    },
    {
      id: 'skins',
      label: 'SKINS',
      sub: 'Design system and components',
      icon: <PsIconPalette />,
      to: section('skins'),
    },
    {
      id: 'history',
      label: 'HISTORY',
      sub: 'Change log and version history',
      icon: <PsIconClock />,
      to: section('history'),
      badge: history.total,
    },
    {
      id: 'more',
      label: 'MORE UTILITIES',
      sub: 'Tools and project settings',
      icon: <PsIconGrid />,
      to: section('more'),
    },
  ];

  const tools: Destination[] = [
    {
      id: 'twin-qa',
      label: 'TWIN REVIEW / QA',
      sub: 'Side-by-side review and validation',
      icon: <PsIconMonitor />,
      to: `/projects/${activeProjectSlug}/design/twin-opus-direct`,
    },
    {
      id: 'opus-native',
      label: 'OPUS NATIVE DIAGNOSTICS',
      sub: 'Agent runtime route',
      icon: <PsIconShield />,
      to: `/projects/${activeProjectSlug}/design/opus-native`,
    },
    {
      id: 'icons',
      label: 'ICON SHEET',
      sub: 'Icons, symbols and usage',
      icon: <PsIconGrid />,
      to: `/projects/${activeProjectSlug}/inspect/icons`,
    },
    {
      id: 'archive',
      label: 'PROJECT ARCHIVE',
      sub: `${references.archived} archived references`,
      icon: <PsIconArchive />,
      to: section('more'),
    },
  ];

  return (
    <div className="tod-ps-drawer" data-testid="design-projects-module-nav">
      <header className="tod-ps-drawer__hero">
        <img
          src={
            architecture.families[0]?.previewUrl ??
            '/site00/project-tabs/staged/raster/plate-ref-brand.jpg'
          }
          alt=""
          loading="lazy"
        />
        <div className="tod-ps-drawer__heroText">
          <strong>{intelligence?.displayName ?? activeProjectSlug.toUpperCase()}</strong>
          <span>DESIGN WORKSPACE · SITE 00</span>
        </div>
      </header>

      <div className="tod-ps-drawer__project">
        <span className="tod-ps-drawer__mark">
          {(intelligence?.displayName ?? activeProjectSlug).slice(0, 3).toUpperCase()}
        </span>
        <span className="tod-ps-drawer__projectText">
          <strong>
            {intelligence?.displayName ?? activeProjectSlug.toUpperCase()}
            <OverlayStatus label={intelligence ? 'ACTIVE' : 'NOT DESIGN ENABLED'} />
          </strong>
          <em>{intelligence?.description ?? 'This project is not enabled for DESIGN.'}</em>
          <em>
            {architecture.totalPages} PAGES · {intelligence?.pagesApproved ?? 0} APPROVED ·{' '}
            {architecture.needsDesign.length} NEED DESIGN
          </em>
        </span>
      </div>

      <div className="tod-ps-drawer__section">
        <span>PROJECT DESTINATIONS</span>
      </div>
      <ul className="tod-ps-drawer__list">
        {destinations.map((item) => (
          <li key={item.id}>
            <DrawerRow item={item} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>

      <div className="tod-ps-drawer__section">
        <span>PINNED TOOLS</span>
      </div>
      <ul className="tod-ps-drawer__list">
        {tools.map((item) => (
          <li key={item.id}>
            <DrawerRow item={item} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>

      <div className="tod-ps-drawer__section">
        <span>SWITCH PROJECT</span>
        <span>{projects.length}</span>
      </div>
      <ul className="tod-ps-drawer__list">
        {projects.map((project) => (
          <li key={project.projectId}>
            <Link
              className="tod-ps-navRow"
              data-active={project.projectId === activeProjectSlug ? 'true' : 'false'}
              to={site00ProjectsDesignActiveProjectPath(project.projectId)}
              onClick={onNavigate}
            >
              <span className="tod-ps-drawer__swatch">{project.displayName.slice(0, 1)}</span>
              <span className="tod-ps-navRow__text">
                <strong>{project.displayName}</strong>
                <em>{project.projectType.replace(/_/g, ' ')}</em>
              </span>
              <span className="tod-ps-navRow__caret">›</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="tod-ps-drawer__quick">
        <Link className="tod-ps-drawer__quickBtn" to="/projects" onClick={onNavigate}>
          <PsIconLayers /> PROJECTS INDEX
        </Link>
        <Link className="tod-ps-drawer__quickBtn" to={site00ProjectsDesignModulePath()} onClick={onNavigate}>
          <PsIconChart /> DESIGN MODULE
        </Link>
        <Link
          className="tod-ps-drawer__quickBtn"
          to={site00ProjectsExperienceModulePath(activeProjectSlug)}
          onClick={onNavigate}
        >
          <PsIconMonitor /> EXPERIENCE MODULE
        </Link>
        <Link className="tod-ps-drawer__quickBtn" to="/account" onClick={onNavigate}>
          <PsIconUser /> ACCOUNT
        </Link>
        <Link className="tod-ps-drawer__quickBtn" to="/projects" onClick={onNavigate}>
          <PsIconExit /> EXIT PROJECT
        </Link>
      </div>

      <footer className="tod-ps-drawer__foot">
        <span>SITE 00</span>
        <span>BUILDING WHAT&apos;S NEXT.</span>
      </footer>
    </div>
  );
}

function DrawerRow({ item, onNavigate }: { item: Destination; onNavigate?: () => void }) {
  const content = (
    <>
      <span className="tod-ps-navRow__icon">{item.icon}</span>
      <span className="tod-ps-navRow__text">
        <strong>{item.label}</strong>
        <em>{item.sub}</em>
      </span>
      {typeof item.badge === 'number' && item.badge > 0 ? (
        <span className="tod-ps-navRow__badge">{item.badge}</span>
      ) : null}
      <span className="tod-ps-navRow__caret">›</span>
    </>
  );

  if (item.to) {
    return (
      <Link className="tod-ps-navRow" to={item.to} onClick={onNavigate}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="tod-ps-navRow"
      onClick={() => {
        item.onClick?.();
        onNavigate?.();
      }}
    >
      {content}
    </button>
  );
}
