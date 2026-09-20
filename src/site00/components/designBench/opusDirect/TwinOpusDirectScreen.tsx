/**
 * P0.VR.DESIGNBENCH.OPUS-DIRECT1 — isolated direct reconstruction of the NDXBOOK
 * DESIGN golden reference (768 x 1376).
 *
 * P0.VR.DESIGNBENCH.OPUS-VIEWMODE1 split this file into a workspace shell and
 * two presentation renderers. The shell owns the chrome that is common to every
 * view — utility row, primary nav, context bar, target/viewport/stage band, the
 * view-mode control and the bottom navigation — and mounts one renderer from
 * VIEW_RENDERERS for the current mode. CANONICAL is the frozen Opus authority;
 * LIST is the mount point Spark fills in later. Both read the same workspace
 * model, so switching mode changes presentation and nothing else.
 */

import { useEffect, useState } from 'react';

import { DesignPageTreeNavigator } from '../production/DesignPageTreeNavigator';
import { DesignChildSurfaceFrame } from '../production/DesignChildSurfaceFrame';
import { DesignProductionEmbeddedProvider } from '../production/DesignProductionEmbeddedContext';
import { ShellFormatProvider } from '../production/designProjectSurfaceKit';
import {
  DesignProductionSectionInShell,
  designProductionSectionSubtitle,
  designProductionSectionTitle,
} from '../production/DesignProductionSectionInShell';
import { founderReviewModeActive, TWIN_REVIEW_AUTHORITY_STATUS } from '../../../../../shared/site00-design-workspace-production/twinLifecycle.js';
import { useDesignProductionNavigation } from '../production/useDesignProductionNavigation';

export type DesignWorkspaceRole = 'twin-founder-review' | 'production-provisional';

import { TWIN_OPUS_DIRECT_REFERENCE_VIEWPORT, type TwinOpusDirectViewportId } from './twinOpusDirectContent';
import { TwinOpusDirectOverlays } from './TwinOpusDirectOverlays';
import {
  useTwinOpusDirectWorkspace,
  type TwinOpusDirectViewMode,
  type TwinOpusDirectWorkspace,
} from './twinOpusDirectWorkspace';
import { TwinOpusDirectCanonicalBody, TwinOpusDirectCanonicalRecord } from './TwinOpusDirectCanonicalView';
import { TwinOpusDirectListBody, TwinOpusDirectListRecord } from './TwinOpusDirectListView';
import DesignGrokDock from '../designAgent/DesignGrokDock';
import { DesignGrokEligibilityProvider } from './DesignGrokEligibilityProvider';
import { resolveDesignPageTargetForShell } from '../production/designProductionPageTarget';
import { TwinOpusDirectViewModeControl } from './TwinOpusDirectViewModeControl';
import { PageConceptGenerationOverlay } from './PageConceptGenerationOverlay';
import {
  TodIconBolt,
  TodIconCaretDown,
  TodIconDesktop,
  TodIconDocArrow,
  TodIconEllipsisVertical,
  TodIconGrid,
  TodIconHistory,
  TodIconLockOpen,
  TodIconMenu,
  TodIconPhone,
  TodIconShieldCheck,
  TodIconTablet,
} from './TwinOpusDirectIcons';

const { width: ART_W, height: ART_H } = TWIN_OPUS_DIRECT_REFERENCE_VIEWPORT;

/**
 * Presentation renderers, keyed by view mode. `body` replaces the workspace
 * body between the band and the dock; `record` replaces the concept record
 * inside the dock, above the shared bottom navigation. Wiring Spark means
 * swapping the two components on the `list` entry — nothing else moves.
 */
const VIEW_RENDERERS: Record<
  TwinOpusDirectViewMode,
  {
    body: (props: { workspace: TwinOpusDirectWorkspace }) => JSX.Element;
    record: (props: { workspace: TwinOpusDirectWorkspace }) => JSX.Element;
  }
> = {
  canonical: { body: TwinOpusDirectCanonicalBody, record: TwinOpusDirectCanonicalRecord },
  list: { body: TwinOpusDirectListBody, record: TwinOpusDirectListRecord },
};

const VIEWPORT_ICONS: Record<TwinOpusDirectViewportId, (props: { className?: string }) => JSX.Element> = {
  MOBILE: TodIconPhone,
  TABLET: TodIconTablet,
  DESKTOP: TodIconDesktop,
};

const BOTTOM_ICONS = {
  grid: TodIconGrid,
  history: TodIconHistory,
  doc: TodIconDocArrow,
  shield: TodIconShieldCheck,
  bolt: TodIconBolt,
} as const;

/**
 * The golden is a full-screen reference, so the shell is full-bleed: the design
 * width drives the scale and the design height is stretched to the viewport, so
 * the page never letterboxes and never gains an outer frame. At the reference
 * viewport (768 x 1376) the scale is exactly 1 and the height is exactly 1376.
 */
function useFullBleedShell() {
  const [shell, setShell] = useState<{ scale: number; height: number }>({ scale: 1, height: ART_H });

  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth || ART_W;
      const vh = window.innerHeight || ART_H;
      const scale = vw / ART_W;
      setShell({ scale, height: vh / scale });
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
    };
  }, []);

  return shell;
}

/**
 * The artboard is scaled by viewport width, so on a phone every rule in the
 * stylesheet renders at roughly half its written size. That is correct for a
 * design reproduction and wrong for the one control the workspace has to
 * operate, which is why the view row sizes itself in real pixels: below the
 * reference width it divides the artboard scale back out, so the row keeps
 * the same physical height and type size a phone can actually read and tap.
 *
 * Above the reference width it is left alone and grows with the rest of the
 * chrome, which keeps it a peer of the nav row rather than a shrunken inset.
 * The row spans the full width, so this sizing depends on no neighbour and
 * cannot be squeezed by another element's label.
 */
function viewRowBoost(scale: number) {
  if (!Number.isFinite(scale) || scale <= 0) return 1;
  return scale < 1 ? 1 / scale : 1;
}

/**
 * P0.VR.DESIGN.OPUS-PROJECT-TABS1 — the artboard is always 768 logical pixels
 * wide; only its logical *height* changes with the viewport. A CSS media query
 * inside it therefore always sees the same width and can never tell a phone
 * from a workstation. The shell publishes the format instead, so a project
 * surface can lay out as a two- or three-pane workbench on a wide screen and
 * as a single scroll on a tall one.
 *
 * `wide` is decided by the artboard's own aspect rather than by device width,
 * because that is the thing that actually determines whether columns fit.
 */
function shellFormat(height: number): 'wide' | 'tall' {
  return height > 0 && ART_W / height >= 1.05 ? 'wide' : 'tall';
}

export function TwinOpusDirectScreen({
  projectSlug = 'ndxbook',
  workspaceRole = 'production-provisional',
}: {
  projectSlug?: string;
  workspaceRole?: DesignWorkspaceRole;
}) {
  const shell = useFullBleedShell();
  const workspace = useTwinOpusDirectWorkspace(projectSlug);
  const { data, state, actions, viewMode, setViewMode, production } = workspace;
  const nav = useDesignProductionNavigation();
  const functionalWorkspace = nav.isTwinWorkspace || nav.isProductionWorkspace;
  const founderReviewMode =
    workspaceRole === 'twin-founder-review' && founderReviewModeActive(TWIN_REVIEW_AUTHORITY_STATUS);
  const primaryNavActiveIndex =
    nav.activeSection && nav.activeSection !== 'more' ?
      data.primaryNav.findIndex((label) => label.toLowerCase() === nav.activeSection)
    : -1;
  const navIndex = primaryNavActiveIndex >= 0 ? primaryNavActiveIndex : state.navIndex;
  const renderer = VIEW_RENDERERS[viewMode];
  const ViewBody = renderer.body;
  const ViewRecord = renderer.record;
  const pageTarget = resolveDesignPageTargetForShell(projectSlug);

  const sectionBody =
    functionalWorkspace && nav.activeSection ?
      <DesignChildSurfaceFrame
        inline
        mode="WORKSPACE"
        title={designProductionSectionTitle(nav.activeSection)}
        subtitle={designProductionSectionSubtitle(nav.activeSection)}
        overlayId={`section-${nav.activeSection}`}
        onClose={() => nav.goWorkspace()}
      >
        <DesignProductionEmbeddedProvider embedded>
          <ShellFormatProvider format={shellFormat(shell.height)}>
            <DesignProductionSectionInShell section={nav.activeSection} />
          </ShellFormatProvider>
        </DesignProductionEmbeddedProvider>
      </DesignChildSurfaceFrame>
    : null;

  return (
    <DesignGrokEligibilityProvider
      projectSlug={projectSlug}
      pageId={pageTarget.pageId}
      viewport={state.viewport}
      productionState={production.state}
    >
    <div className="tod-root">
      <div className="tod-stage">
        <div
          className="tod-screen"
          data-testid="twin-opus-direct-screen"
          data-design-surface={workspaceRole}
          data-founder-review-mode={founderReviewMode ? 'true' : 'false'}
          data-view-mode={viewMode}
          data-shell-format={shellFormat(shell.height)}
          style={{
            height: `${shell.height}px`,
            transform: `scale(${shell.scale})`,
            ['--tod-viewrow-boost' as string]: viewRowBoost(shell.scale),
          }}
        >
          {/* 01 SITE00_HEADER */}
          <header className="tod-header">
            <div className="tod-header__crumbs">
              <span className="tod-header__brand">{data.header.brand}</span>
              <span className="tod-header__sep" aria-hidden="true">
                &gt;
              </span>
              <span className="tod-header__project">{data.header.project}</span>
              <span className="tod-header__sep" aria-hidden="true">
                &gt;
              </span>
              <span className="tod-header__page">{data.header.page}</span>
            </div>
            <div className="tod-header__status">
              <span className="tod-header__compiler">{data.header.compiler}</span>
              <span className="tod-dot tod-dot--lime" aria-hidden="true" />
              <button
                type="button"
                className="tod-header__more"
                aria-label="Workspace options"
                aria-haspopup="dialog"
                onClick={() => production.actions.openOverflowMenu()}
              >
                <TodIconEllipsisVertical className="tod-ico" />
              </button>
            </div>
          </header>

          {/* 02 PRIMARY_NAV */}
          <nav className="tod-nav" aria-label="Design workspace sections">
            <button
              type="button"
              className="tod-nav__cell tod-nav__cell--menu"
              aria-label="Open workspace menu"
              onClick={() => production.actions.openHostModuleNav()}
            >
              <TodIconMenu className="tod-ico" />
            </button>
            {data.primaryNav.map((label, index) => (
              <button
                key={label}
                type="button"
                className="tod-nav__cell"
                aria-current={navIndex === index ? 'page' : undefined}
                onClick={() => {
                  actions.selectNavSection(index);
                  if (functionalWorkspace) nav.goPrimaryNavIndex(index);
                }}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              className="tod-nav__cell tod-nav__cell--more"
              aria-current={nav.activeSection === 'more' ? 'page' : undefined}
              onClick={() => functionalWorkspace && nav.goSection('more')}
            >
              MORE
              <TodIconCaretDown className="tod-ico tod-nav__caret" />
            </button>
          </nav>

          {/* 03 NDXBOOK_CONTEXT_BAR */}
          <div className="tod-context">
            <span className="tod-context__chip">{data.context.chip}</span>
            <span className="tod-context__stream">{data.context.stream}</span>
            <DesignPageTreeNavigator projectSlug={projectSlug} />
          </div>

          {/* 03b WORKSPACE_VIEW_ROW — presentation control zone */}
          <TwinOpusDirectViewModeControl mode={viewMode} onChange={setViewMode} />

          {/* 04 TARGET_VIEWPORT_STAGE_BAND */}
          <section className="tod-band" aria-label="Target, viewport and stage">
            <div className="tod-band__col tod-band__col--target" aria-readonly="true">
              <span className="tod-band__label">{data.target.label}</span>
              {data.target.lines.map((line) => (
                <span key={line} className="tod-band__value tod-band__value--readonly">
                  {line}
                </span>
              ))}
            </div>
            <div className="tod-band__col tod-band__col--viewport">
              <span className="tod-band__label">VIEWPORT</span>
              <div className="tod-band__devices" role="group" aria-label="Target viewport">
                {data.viewports.map((id) => {
                  const Icon = VIEWPORT_ICONS[id];
                  const active = state.viewport === id;
                  const vpStatus = data.viewportControls.find((c) => c.viewport === id);
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`tod-device${active ? ' is-active' : ''}`}
                      aria-pressed={active}
                      data-vp-status={vpStatus?.status ?? undefined}
                      onClick={() => actions.selectViewport(id)}
                    >
                      <Icon className="tod-device__ico" />
                      <span className="tod-device__label">{id}</span>
                      {vpStatus ?
                        <span className="tod-device__status">{vpStatus.statusShort}</span>
                      : null}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="tod-band__col tod-band__col--stage">
              <span className="tod-band__label">{data.stage.stageLabel}</span>
              <span className="tod-band__stage">{data.stage.stageValue}</span>
              <span className="tod-band__label tod-band__label--second">{data.stage.authorityLabel}</span>
              <span className="tod-band__stage tod-band__stage--lock">
                {data.stage.authorityValue}
                <TodIconLockOpen className="tod-ico tod-band__lock" />
              </span>
            </div>
          </section>

          {/* 05-10 WORKSPACE BODY — approved twin presentation (data-bound, composition frozen) */}
          {sectionBody ?? <ViewBody workspace={workspace} />}

          {/* 11-12 CONCEPT RECORD (renderer-supplied) + 13 BOTTOM_NAVIGATION (shared) */}
          <div className="tod-dock">
            <ViewRecord workspace={workspace} />

            <nav className="tod-bottom" aria-label="Design workspace">
              {data.bottomNav.map((item, index) => {
                const Icon = BOTTOM_ICONS[item.icon];
                const active = state.dockIndex === index;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`tod-bottom__cell${active ? ' is-active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => {
                      actions.selectDockDestination(index);
                      if (!functionalWorkspace) return;
                      const item = data.bottomNav[index];
                      if (!item) return;
                      switch (item.id) {
                        case 'workspace':
                          actions.goWorkspace();
                          break;
                        case 'design-history':
                          actions.goDesignHistory();
                          break;
                        case 'feature-change':
                          actions.goChangeHistory();
                          break;
                        case 'master-amendment':
                          actions.goMasterAmendment();
                          break;
                        case 'next-action':
                          actions.runContextualNextAction();
                          break;
                        default:
                          break;
                      }
                    }}
                  >
                    <Icon className="tod-ico tod-bottom__ico" />
                    <span className="tod-bottom__label">
                      {item.lines.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
      <TwinOpusDirectOverlays projectSlug={projectSlug} production={production} />
      <PageConceptGenerationOverlay
        open={workspace.pageConceptGeneration.overlayOpen}
        mode={workspace.pageConceptGeneration.overlayMode}
        plan={workspace.pageConceptGeneration.pendingPlan}
        status={workspace.pageConceptGeneration.generationStatus}
        error={workspace.pageConceptGeneration.error}
        generating={workspace.pageConceptGeneration.generating}
        onCancel={workspace.pageConceptGeneration.cancelGeneration}
        onConfirm={() => void workspace.pageConceptGeneration.confirmGeneration()}
      />
      <DesignGrokDock projectSlug={projectSlug} />
    </div>
    </DesignGrokEligibilityProvider>
  );
}
