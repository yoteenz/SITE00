/**
 * P0.VR.2B — Design workspace full-screen reference rebuild.
 * SITE 00 host shell — preserves P0.VR.2 + P0.VR.2A functionality.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { ProjectNotification } from '../../../../shared/site00-studio-world-production/projectNotifications/types.js';
import {
  CANONICAL_VIEWPORT_DIMENSIONS,
  buildDesignScreenMatrix,
  createDraftReferenceFromUpload,
  findDesignScreen,
  getActiveCanonicalReference,
  listDesignScreensForProject,
  listDesignWorkspaceProjects,
  proposeReferenceScope,
  resolveDesignScreenRoute,
  startVisualReconstructionRun,
  type DesignViewportClass,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/client.js';
import { registerNdxbookDesignPilot, registerSite00DesignPilot } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/client.js';
import {
  getActiveDesignRouteSyncContract,
  buildSite00FounderDesignScreenSet,
  listManifestScreensForProject,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3/client.js';
import {
  evaluateSite00SelfDesignBoundary,
  matchReferenceCanPatchHostAccidentally,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3a/client.js';
import {
  buildReferenceAssetBrief,
  compileReferenceAssetPrompt,
  dispatchAllReadyToGenerate,
  dispatchAssetGeneration,
  ensureNdxPilotAssetSlots,
  extendComposerBriefWithAssetSlots,
  getCompiledPrompt,
  listSlotsForScreen,
  promoteAssetToCanon,
  shellReconstructionBlockedOnAssetGeneration,
  summarizeMissingAssets,
  type ReferenceVisualAssetSlot,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2a/client.js';
import {
  buildDesignWorkspaceActivity,
  buildDesignWorkspaceQuickActions,
  computeDesignWorkspaceVisualMatch,
  parseDesignWorkspaceUrlState,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2b/client.js';
import {
  buildDesignWorkspacePrimaryUrlState,
  normalizeDesignWorkspacePrimaryTab,
  type DesignWorkspacePrimaryTab,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6/index.js';
import {
  buildDesignWorkspaceBreadcrumb,
  formatDesignProjectSelectorLabel,
  listSelectableDesignProjects,
  resolveActiveDesignProjectId,
  resolveManagedProjectContextAccent,
  resolveManagedProjectForDesignContext,
  SITE00_DESIGN_PROJECT_ID,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/client.js';
import { Site00DesignWorkspaceShell } from '../designWorkspace/Site00DesignWorkspaceShell';
import { DesignCompareSection } from '../designWorkspace/DesignCompareSection';
import { DesignComposerReviewQueue } from '../designWorkspace/DesignComposerReviewQueue';
import { DesignRepoChangePanel } from '../designWorkspace/DesignRepoChangePanel';
import { DesignMissingTargetQueue } from '../designWorkspace/DesignMissingTargetQueue';
import { useImplementationSnapshots } from '../designWorkspace/useImplementationSnapshots';
import {
  buildProjectPageMirrorRows,
  pageMirrorRowToVisualIndexRow,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';
import { usePageMirror } from '../designWorkspace/usePageMirror';
import { DesignMissingAssetsSection } from '../designWorkspace/DesignMissingAssetsSection';
import { DesignVisualMatchPanel } from '../designWorkspace/DesignVisualMatchPanel';
import { DesignWorkspaceDisclosurePanel } from '../designWorkspace/DesignWorkspaceDisclosurePanel';
import { DesignWorkspacePrimaryTabRail } from '../designWorkspace/DesignWorkspacePrimaryTabRail';
import { DesignWorkspaceViewportRail } from '../designWorkspace/DesignWorkspaceViewportRail';
import { DesignReferencesTab } from '../designWorkspace/DesignReferencesTab';
import { DesignPagesTabPanel } from '../designWorkspace/DesignPagesTabPanel';
import { DesignSkinsTab } from '../designWorkspace/DesignSkinsTab';
import { DesignHistoryTab } from '../designWorkspace/DesignHistoryTab';
import { DesignMoreTab } from '../designWorkspace/DesignMoreTab';
import { DesignWorkspaceOverflowMenu } from '../designWorkspace/DesignWorkspaceOverflowMenu';
import { DesignReferenceAssetsPanel } from '../designWorkspace/DesignReferenceAssetsPanel';
import { useDesignReconstructionWorkflow } from '../designWorkspace/useDesignReconstructionWorkflow.js';
import {
  mergeDesignWorkspaceNotifications,
  useDesignFounderActionNotifications,
} from '../designWorkspace/useDesignFounderActionNotifications.js';
import { useDesignWorkspaceHostMenus } from '../designWorkspace/useDesignWorkspaceHostMenus';
import { ActiveProjectNotificationCenter } from '../founderWorkspace/ActiveProjectNotificationCenter';
import { useActiveProjectNotifications } from '../../hooks/useActiveProjectNotifications';
import { buildDesignWorkspaceOverflowActions } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m1/client.js';
import type { DesignWorkspaceOverflowActionId } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m1/client.js';
import {
  detectAndRegisterAssets,
  buildProjectsGoldenScreenshotSource,
  PROJECTS_BULK_QUEUE_SEEDS,
  PROJECTS_GOLDEN_TEST,
  type ApprovedScreenshotSource,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4/client.js';
import '../../styles/site00-design-workspace-p0vr2b.css';
import '../../styles/site00-design-workspace-v3.css';

export type StudioWorldDesignWorkspaceProps = {
  initialProjectId?: string;
  initialScreenId?: string;
  initialViewport?: DesignViewportClass;
};

type Site00ScreenSetMode = 'PRIMARY' | 'ALL_DESIGNABLE';

function mapStatusLabel(projectId: string, screenId: string, viewport: DesignViewportClass): string {
  const row = buildDesignScreenMatrix(projectId).find((r) => r.screenId === screenId);
  if (!row) return 'NOT STARTED';
  const cell =
    viewport === 'mobile' ? row.mobile : viewport === 'tablet' ? row.tablet : viewport === 'desktop' ? row.desktop : row.desktop;
  if (cell.implementationStatus === 'MATCHED') return 'MATCHED';
  if (cell.referenceStatus === 'MISSING') return 'MISSING REFERENCE';
  if (cell.implementationStatus === 'BLOCKED') return 'BLOCKED';
  return 'NEEDS MATCH';
}

export function StudioWorldDesignWorkspace({
  initialProjectId = SITE00_DESIGN_PROJECT_ID,
  initialScreenId,
  initialViewport = 'mobile',
}: StudioWorldDesignWorkspaceProps) {
  registerNdxbookDesignPilot();
  registerSite00DesignPilot();

  const designProjects = useMemo(() => listDesignWorkspaceProjects(), []);
  const selectableProjects = useMemo(() => listSelectableDesignProjects({ viewMode: 'FOUNDER' }), []);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlState = parseDesignWorkspaceUrlState(searchParams.toString());
  const activeDesignProjectId = useMemo(
    () => resolveActiveDesignProjectId(urlState.project, initialProjectId),
    [urlState.project, initialProjectId],
  );
  const projectId = activeDesignProjectId;
  const [isRescoping, setIsRescoping] = useState(false);
  const [screenId, setScreenId] = useState(urlState.screen ?? initialScreenId ?? '');
  const [viewportClass, setViewportClass] = useState<DesignViewportClass>(urlState.viewport ?? initialViewport);
  const [primaryTab, setPrimaryTab] = useState<DesignWorkspacePrimaryTab>(
    normalizeDesignWorkspacePrimaryTab(urlState.tab ?? 'ASSETS'),
  );
  const [showInspector, setShowInspector] = useState(false);
  const [customRoute] = useState('');
  const [scopeOverride, setScopeOverride] = useState<string>('');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [lastRunId, setLastRunId] = useState<string | null>(null);
  const [assetSlots, setAssetSlots] = useState<ReferenceVisualAssetSlot[]>([]);
  const [selectedPromptSlotId, setSelectedPromptSlotId] = useState<string | null>(null);
  const [site00ScreenSetMode] = useState<Site00ScreenSetMode>('PRIMARY');
  const [refAssetsSeed, setRefAssetsSeed] = useState(0);
  const reconstructionWorkflow = useDesignReconstructionWorkflow();
  const founderActionNotifications = useDesignFounderActionNotifications();
  const navigate = useNavigate();
  const prevPrimaryTabRef = useRef<DesignWorkspacePrimaryTab | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    getSnapshot,
    capturing: snapshotCapturing,
    captureScreen,
  } = useImplementationSnapshots(projectId);

  const syncUrl = useCallback(
    (patch: Partial<{ project: string; screen: string; viewport: DesignViewportClass; tab: DesignWorkspacePrimaryTab }>) => {
      const next = {
        project: patch.project ?? activeDesignProjectId,
        screen: patch.screen ?? screenId,
        viewport: patch.viewport ?? viewportClass,
        tab: patch.tab ?? primaryTab,
      };
      setSearchParams(buildDesignWorkspacePrimaryUrlState(next).slice(1), { replace: true });
    },
    [activeDesignProjectId, screenId, primaryTab, viewportClass, setSearchParams],
  );

  useEffect(() => {
    if (urlState.screen && urlState.screen !== screenId) setScreenId(urlState.screen);
    if (urlState.viewport && urlState.viewport !== viewportClass) setViewportClass(urlState.viewport);
    if (urlState.tab) setPrimaryTab(normalizeDesignWorkspacePrimaryTab(urlState.tab));
  }, [urlState.screen, urlState.viewport, urlState.tab, screenId, viewportClass]);

  useEffect(() => {
    if (prevPrimaryTabRef.current !== null && prevPrimaryTabRef.current !== primaryTab) {
      reconstructionWorkflow.closeWorkflow();
    }
    prevPrimaryTabRef.current = primaryTab;
  }, [primaryTab, reconstructionWorkflow]);

  useEffect(() => {
    if (!urlState.project) {
      syncUrl({ project: activeDesignProjectId });
    }
  }, [activeDesignProjectId, syncUrl, urlState.project]);

  const site00SyncContract = useMemo(
    () => (projectId === 'site00' ? getActiveDesignRouteSyncContract() : null),
    [projectId],
  );
  const site00ScreenSet = useMemo(
    () =>
      site00SyncContract
        ? buildSite00FounderDesignScreenSet(site00ScreenSetMode, site00SyncContract)
        : null,
    [site00SyncContract, site00ScreenSetMode],
  );
  const screens = useMemo(() => {
    if (projectId === 'site00' && site00ScreenSet) {
      return listManifestScreensForProject('site00', false, site00ScreenSetMode);
    }
    return listDesignScreensForProject(projectId);
  }, [projectId, site00ScreenSet, site00ScreenSetMode]);

  useEffect(() => {
    if (!screens.some((s) => s.screenId === screenId)) {
      const fallback = screens[0]?.screenId;
      if (fallback) {
        setScreenId(fallback);
        syncUrl({ screen: fallback });
      }
    }
  }, [projectId, screens, screenId, syncUrl]);
  const screen = findDesignScreen(projectId, screenId);
  const projectMeta = designProjects.find((p) => p.slug === projectId);
  const projectContextAccent = resolveManagedProjectContextAccent(projectId);
  const breadcrumb = buildDesignWorkspaceBreadcrumb(activeDesignProjectId);
  const projectSelectorLabel = formatDesignProjectSelectorLabel(activeDesignProjectId);
  const route = customRoute || (screen ? resolveDesignScreenRoute(screen, projectId) : `/projects/${projectId}`);
  const reference = getActiveCanonicalReference(projectId, screenId, viewportClass);
  const implementationSnapshot = getSnapshot(screenId, viewportClass);
  const statusLabel = mapStatusLabel(projectId, screenId, viewportClass);
  const viewport = CANONICAL_VIEWPORT_DIMENSIONS[viewportClass];
  const {
    rows: mirrorApiRows,
    loading: mirrorLoading,
    refreshPage: refreshMirrorPage,
    refreshProject: refreshMirrorProject,
  } = usePageMirror(projectId);

  const pageIndexRows = useMemo(() => {
    if (mirrorApiRows.length) return mirrorApiRows;
    return buildProjectPageMirrorRows(projectId, { screenSetMode: site00ScreenSetMode }).map((row) => {
      const visual = pageMirrorRowToVisualIndexRow(row);
      const mobileSnap = getSnapshot(row.screenId, 'mobile');
      if (mobileSnap?.publicUrl) {
        visual.mobile = {
          publicUrl: mobileSnap.publicUrl,
          status: mobileSnap.captureStatus,
          capturedAt: mobileSnap.capturedAt,
        };
      }
      return visual;
    });
  }, [getSnapshot, mirrorApiRows, projectId, site00ScreenSetMode]);

  const defaultScreenForProject = useCallback((nextProjectId: string, available: typeof screens) => {
    if (available[0]?.screenId) return available[0].screenId;
    if (nextProjectId === 'ndxbook') return 'campaign-board';
    if (nextProjectId === 'site00') return 'guide';
    return '';
  }, []);

  const handleSelectDesignProject = useCallback(
    (nextProjectId: string) => {
      const resolved = resolveManagedProjectForDesignContext(nextProjectId);
      if (resolved === activeDesignProjectId) return;
      setIsRescoping(true);
      setUploadPreview(null);
      setLastRunId(null);
      setAssetSlots([]);
      setSelectedPromptSlotId(null);
      setShowInspector(false);
      const nextScreens =
        resolved === 'site00'
          ? listManifestScreensForProject('site00', false, site00ScreenSetMode)
          : listDesignScreensForProject(resolved);
      const nextScreen = defaultScreenForProject(resolved, nextScreens);
      setScreenId(nextScreen);
      syncUrl({ project: resolved, screen: nextScreen });
      requestAnimationFrame(() => setIsRescoping(false));
    },
    [activeDesignProjectId, defaultScreenForProject, site00ScreenSetMode, syncUrl],
  );

  useEffect(() => {
    if (!screenId) {
      const fallback = defaultScreenForProject(projectId, screens);
      if (fallback) {
        setScreenId(fallback);
        syncUrl({ screen: fallback });
      }
    }
  }, [defaultScreenForProject, projectId, screenId, screens, syncUrl]);

  const refreshAssetSlots = useCallback(() => {
    if (!reference) {
      setAssetSlots([]);
      return;
    }
    ensureNdxPilotAssetSlots(reference);
    setAssetSlots(listSlotsForScreen(projectId, screenId, viewportClass));
  }, [projectId, reference, screenId, viewportClass]);

  useEffect(() => {
    refreshAssetSlots();
  }, [refreshAssetSlots]);

  const missingSummary = useMemo(() => summarizeMissingAssets(assetSlots), [assetSlots]);
  const assetReadyRatio = assetSlots.length ? missingSummary.ready / assetSlots.length : 0;
  const visualMatch = useMemo(
    () => computeDesignWorkspaceVisualMatch({ projectId, screenId, viewportClass, assetReadyRatio }),
    [assetReadyRatio, projectId, screenId, viewportClass],
  );

  const livePreviewUrl = `${route}?site00MobileLayout=${viewportClass === 'mobile' ? '1' : '0'}&designPreview=1`;
  const referenceUrl = reference?.storagePath ?? uploadPreview;

  const reconstructionScreenshotSource = useMemo((): ApprovedScreenshotSource | null => {
    if (screenId === 'projects-index' && projectId === 'site00') {
      return buildProjectsGoldenScreenshotSource();
    }
    if (!reference || reference.status !== 'ACTIVE_CANONICAL') return null;
    return {
      projectId,
      pageId: screenId,
      route,
      screenshotId: reference.referenceId,
      screenshotUrl: reference.storagePath,
      referenceVersion: String(reference.version),
      approvedBy: reference.createdBy,
      approvalStatus: 'APPROVED',
    };
  }, [projectId, reference, route, screenId]);

  useEffect(() => {
    if (primaryTab !== 'ASSETS' || !reconstructionScreenshotSource) return;
    if (screenId === 'projects-index' && projectId === 'site00') {
      detectAndRegisterAssets({
        source: reconstructionScreenshotSource,
        hints: [
          {
            regionId: 'projects-header-planet',
            classification: 'HERO_OBJECT',
            bounds: PROJECTS_GOLDEN_TEST.cropRegion,
            labelHint: PROJECTS_GOLDEN_TEST.semanticName,
            confidenceHint: 'HIGH',
          },
          ...PROJECTS_BULK_QUEUE_SEEDS.slice(1).map((seed, i) => ({
            regionId: `bulk-${i + 2}`,
            classification: seed.assetType === 'NAV_ICON' ? ('NAV_ICON' as const) : ('PROJECT_VISUAL' as const),
            bounds: { x: 20 + i * 40, y: 200 + i * 80, width: 80, height: 80 },
            labelHint: seed.semanticName,
            confidenceHint: 'MODERATE' as const,
          })),
        ],
        screenshotBasePath: reconstructionScreenshotSource.screenshotUrl.replace(/\.[^.]+$/, ''),
      });
    }
  }, [primaryTab, reconstructionScreenshotSource, screenId, projectId, refAssetsSeed]);

  const {
    activeHostMenu,
    notifyMobileRef,
    notifyDesktopRef,
    overflowMobileRef,
    overflowDesktopRef,
    notifyAnchorRef,
    overflowAnchorRef,
    toggleNotifications,
    toggleOverflow,
    closeHostMenu,
    notificationOpen,
    overflowOpen,
  } = useDesignWorkspaceHostMenus();

  const {
    state: notificationState,
    loading: notificationsLoading,
    refreshOnOpen,
    markRead,
    markAllRead,
  } = useActiveProjectNotifications(projectId, { enabled: Boolean(projectId) });

  useEffect(() => {
    if (notificationOpen) refreshOnOpen();
  }, [notificationOpen, refreshOnOpen]);

  const mergedNotifications = useMemo(
    () =>
      mergeDesignWorkspaceNotifications(
        founderActionNotifications.notifications,
        notificationState.notifications,
      ),
    [founderActionNotifications.notifications, notificationState.notifications],
  );

  const mergedUnreadCount = notificationState.unreadCount + founderActionNotifications.unreadCount;

  const handleFounderActionNotificationOpen = useCallback(
    (notification: ProjectNotification) => {
      founderActionNotifications.markRead(notification.id);
      closeHostMenu();
      if (notification.actionTarget) {
        navigate(notification.actionTarget);
      }
    },
    [closeHostMenu, founderActionNotifications, navigate],
  );

  const handleNotificationMarkRead = useCallback(
    (notificationId: string) => {
      if (notificationId.startsWith('founder-action-')) {
        founderActionNotifications.markRead(notificationId);
        return;
      }
      void markRead(notificationId);
    },
    [founderActionNotifications, markRead],
  );

  const handleNotificationMarkAllRead = useCallback(() => {
    founderActionNotifications.markAllRead();
    void markAllRead();
  }, [founderActionNotifications, markAllRead]);

  const legacyOverflowTab =
    primaryTab === 'REFERENCES' ? 'REFERENCE' : primaryTab === 'MORE' ? 'INSPECT' : primaryTab;

  const overflowActions = useMemo(
    () =>
      buildDesignWorkspaceOverflowActions({
        projectId,
        route,
        livePreviewUrl,
        tab: legacyOverflowTab as 'PAGES' | 'ASSETS' | 'HISTORY' | 'REFERENCE' | 'INSPECT',
        capturing: snapshotCapturing,
      }),
    [legacyOverflowTab, livePreviewUrl, projectId, route, snapshotCapturing],
  );

  const handleOverflowAction = useCallback(
    (actionId: DesignWorkspaceOverflowActionId) => {
      switch (actionId) {
        case 'capture_implementation':
          void captureScreen(screenId, viewportClass);
          break;
        case 'copy_design_link':
          if (typeof navigator !== 'undefined' && navigator.clipboard) {
            void navigator.clipboard.writeText(window.location.href);
          }
          break;
        case 'open_review_tab':
          setPrimaryTab('MORE');
          syncUrl({ tab: 'MORE' });
          break;
        case 'open_pages_tab':
          setPrimaryTab('PAGES');
          syncUrl({ tab: 'PAGES' });
          break;
        case 'open_inspect_tab':
          setPrimaryTab('MORE');
          setShowInspector(true);
          syncUrl({ tab: 'MORE' });
          break;
        default:
          break;
      }
    },
    [captureScreen, screenId, syncUrl, viewportClass],
  );

  const activity = useMemo(
    () =>
      buildDesignWorkspaceActivity({
        projectId,
        screenId,
        screenName: screen?.displayName ?? screenId,
        statusLabel,
        lastRunId,
        assetEvents: assetSlots.filter((s) => s.assetStatus === 'READY').map((s) => `${s.assetRole.replace(/_/g, ' ')} generated`),
      }),
    [assetSlots, lastRunId, projectId, screen?.displayName, screenId, statusLabel],
  );

  const quickActions = useMemo(
    () => buildDesignWorkspaceQuickActions({ projectId, screenId, route }),
    [projectId, route, screenId],
  );

  const handleUpload = useCallback(
    (file: File) => {
      const objectUrl = URL.createObjectURL(file);
      setUploadPreview(objectUrl);
      const img = new Image();
      img.onload = () => {
        const proposed = proposeReferenceScope({
          screenId,
          projectId,
          route,
          viewportClass,
          cropWidth: img.naturalWidth,
          cropHeight: img.naturalHeight,
          iconSheet: screen?.supportsIconMode,
        });
        setScopeOverride(proposed.scope);
        createDraftReferenceFromUpload({
          projectId,
          screenId,
          route,
          viewportClass,
          storagePath: objectUrl,
          createdBy: 'founder-upload',
          cropWidth: img.naturalWidth,
          cropHeight: img.naturalHeight,
          iconSheet: screen?.supportsIconMode,
        });
      };
      img.src = objectUrl;
    },
    [projectId, route, screen?.supportsIconMode, screenId, viewportClass],
  );

  const handleMatchReference = () => {
    const targetPath = screen?.componentName
      ? `src/site00/pages/${screen.componentName}.tsx`
      : `src/site00/pages/${screenId}.tsx`;
    const boundary = evaluateSite00SelfDesignBoundary({
      projectId,
      targetComponentPath: targetPath,
      screenId,
    });
    if (!boundary.allowed || matchReferenceCanPatchHostAccidentally({ projectId, targetComponentPath: targetPath })) {
      setLastRunId('BLOCKED:HOST_BOUNDARY');
      return;
    }
    const result = startVisualReconstructionRun({ projectId, screenId, route, viewportClass });
    setLastRunId(result.run.runId);
    if (reference && !shellReconstructionBlockedOnAssetGeneration()) {
      ensureNdxPilotAssetSlots(reference);
      if (result.brief) {
        extendComposerBriefWithAssetSlots(result.brief, listSlotsForScreen(projectId, screenId, viewportClass));
      }
    }
    refreshAssetSlots();
  };

  const handleGenerateAsset = (slotId: string) => {
    if (!reference) return;
    dispatchAssetGeneration({ reference, slotId });
    setTimeout(refreshAssetSlots, 50);
  };

  const handleGenerateAll = () => {
    if (!reference) return;
    const readyIds = assetSlots.filter((s) => s.generationStatus === 'READY_TO_GENERATE').map((s) => s.slotId);
    dispatchAllReadyToGenerate({ reference, slotIds: readyIds });
    setTimeout(refreshAssetSlots, 50);
  };

  const handleUseAsset = (slotId: string) => {
    promoteAssetToCanon(slotId);
    refreshAssetSlots();
  };

  const handleInspectPrompt = (slotId: string) => {
    setSelectedPromptSlotId(slotId);
    setPrimaryTab('MORE');
    setShowInspector(true);
    syncUrl({ tab: 'MORE' });
  };

  const selectedPrompt =
    selectedPromptSlotId && reference
      ? getCompiledPrompt(assetSlots.find((s) => s.slotId === selectedPromptSlotId)?.promptId ?? '') ??
        compileReferenceAssetPrompt({
          reference,
          slot: assetSlots.find((s) => s.slotId === selectedPromptSlotId)!,
          brief: buildReferenceAssetBrief(assetSlots.find((s) => s.slotId === selectedPromptSlotId)!),
        })
      : null;

  return (
    <>
    <Site00DesignWorkspaceShell
      breadcrumb={breadcrumb}
      managedProjectDisplayName={projectSelectorLabel}
      managedProjectAccent={projectContextAccent}
      activeDesignProjectId={activeDesignProjectId}
      designProjectOptions={selectableProjects.map((p) => ({ projectId: p.projectId, displayName: p.displayName }))}
      onSelectDesignProject={handleSelectDesignProject}
      projectSelectorDisabled={isRescoping}
      activeHostMenu={activeHostMenu}
      unreadNotificationCount={mergedUnreadCount}
      onToggleNotifications={toggleNotifications}
      onToggleOverflow={toggleOverflow}
      notifyMobileRef={notifyMobileRef}
      notifyDesktopRef={notifyDesktopRef}
      overflowMobileRef={overflowMobileRef}
      overflowDesktopRef={overflowDesktopRef}
      bottomPanel={null}
    >
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
      <div
        className="site00-dw-workspace site00-dw-v3-workspace-scroll"
        data-visual-reconstruction="p0vr6-design-workspace"
        data-design-workspace-owner="SITE00"
        data-design-project={projectId}
        data-design-project-accent={projectContextAccent}
        data-design-primary-tab={primaryTab}
        data-design-rescoping={isRescoping ? 'true' : 'false'}
      >
        {isRescoping ? <p className="site00-dw-v3-rescope-loading">RE-SCOPING DESIGN DATA…</p> : null}
        <DesignWorkspacePrimaryTabRail
          activeTab={primaryTab}
          onTabChange={(t) => {
            setPrimaryTab(t);
            syncUrl({ tab: t });
          }}
          pendingActionCounts={{
            ASSETS: reconstructionWorkflow.assetsActionCount,
            SKINS: reconstructionWorkflow.skinsActionCount,
          }}
        />

        <DesignWorkspaceViewportRail
          viewport={viewportClass}
          onViewportChange={(vp) => {
            setViewportClass(vp);
            syncUrl({ viewport: vp });
          }}
          pipelineLabel={primaryTab === 'ASSETS'}
        />

        {primaryTab === 'REFERENCES' ? (
          <>
            <DesignReferencesTab
              key={`refs-${activeDesignProjectId}`}
              projectId={activeDesignProjectId}
              viewportClass={viewportClass}
              selectedScreenId={screenId}
              onSelectScreen={(id) => {
                setScreenId(id);
                syncUrl({ screen: id });
              }}
              onUploadClick={() => fileInputRef.current?.click()}
              activeReferenceUrl={referenceUrl}
            />
            <details className="site00-dw-v3-inspector">
              <summary>COMPARE · LIVE VS REFERENCE</summary>
              <DesignCompareSection
                referenceUrl={referenceUrl}
                referenceVersion={reference?.version ?? null}
                implementationUrl={
                  implementationSnapshot?.captureStatus === 'CURRENT' ? implementationSnapshot.publicUrl : null
                }
                livePreviewUrl={livePreviewUrl}
                viewportWidth={viewport.width}
                viewportHeight={viewport.height}
                visualMatch={visualMatch}
                onViewDetails={() => {
                  setPrimaryTab('MORE');
                  setShowInspector(true);
                  syncUrl({ tab: 'MORE' });
                }}
              />
              <DesignVisualMatchPanel
                match={visualMatch}
                compact
                onViewDetails={() => {
                  setPrimaryTab('MORE');
                  setShowInspector(true);
                }}
              />
            </details>
          </>
        ) : null}

        {primaryTab === 'ASSETS' ? (
          <DesignReferenceAssetsPanel
            key={`assets-${activeDesignProjectId}`}
            projectId={activeDesignProjectId}
            pageId={screenId}
            route={route}
            referenceUrl={referenceUrl ?? null}
            screenshotSource={reconstructionScreenshotSource}
            onRefresh={() => setRefAssetsSeed((n) => n + 1)}
          />
        ) : null}

        {primaryTab === 'PAGES' ? (
          <DesignPagesTabPanel
            key={`pages-${activeDesignProjectId}`}
            rows={pageIndexRows}
            selectedScreenId={screenId}
            mirrorLoading={mirrorLoading}
            onSelectScreen={(id) => {
              setScreenId(id);
              syncUrl({ screen: id });
            }}
            onOpenPage={(id) => {
              const row = pageIndexRows.find((r) => r.screenId === id);
              const target = row?.route ?? route;
              window.open(`${target}?site00MobileLayout=1&designPreview=1`, '_blank', 'noopener,noreferrer');
            }}
            onRefreshPage={(id) => void refreshMirrorPage(id)}
            onRefreshProject={() => void refreshMirrorProject()}
          />
        ) : null}

        {primaryTab === 'SKINS' ? (
          <DesignSkinsTab
            key={`skins-${activeDesignProjectId}`}
            projectId={activeDesignProjectId}
            onOpenScreen={() => window.open(livePreviewUrl, '_blank', 'noopener,noreferrer')}
            onMatchReference={handleMatchReference}
          />
        ) : null}

        {primaryTab === 'HISTORY' ? (
          <DesignHistoryTab key={`history-${activeDesignProjectId}`} activity={activity} />
        ) : null}

        {primaryTab === 'MORE' ? (
          <>
            <DesignMoreTab
              key={`more-${activeDesignProjectId}`}
              projectId={activeDesignProjectId}
              onOpenInspect={() => setShowInspector(true)}
              onCaptureScreen={() => void captureScreen(screenId, viewportClass)}
              onMatchReference={handleMatchReference}
            />
            {showInspector ? (
              <section className="site00-dw-panel site00-dw-panel--inspect">
                <h2>INSPECT</h2>
                <dl className="site00-dw-inspect">
                  <div><dt>ROUTE</dt><dd>{route.toUpperCase()}</dd></div>
                  <div><dt>REFERENCE PATH</dt><dd>{reference?.storagePath ?? '—'}</dd></div>
                  <div><dt>SCOPE</dt><dd>{(reference?.scope ?? scopeOverride ?? 'PENDING').toUpperCase()}</dd></div>
                  <div><dt>RUN</dt><dd>{lastRunId ?? '—'}</dd></div>
                  <div><dt>ASSET SLOTS</dt><dd>{assetSlots.length}</dd></div>
                  <div><dt>STATUS</dt><dd>{statusLabel}</dd></div>
                  {reference?.status === 'ACTIVE_CANONICAL' ? (
                    <>
                      <div><dt>AUTHORITY MODE</dt><dd>DESIGN_AUTHORITY</dd></div>
                      <div><dt>FIDELITY MODE</dt><dd>EXACT</dd></div>
                      <div><dt>PRESERVE FUNCTION</dt><dd>YES</dd></div>
                      <div><dt>REBUILD LOOK</dt><dd>YES</dd></div>
                      <div><dt>PROTECT CURRENT VISUALS</dt><dd>NO</dd></div>
                      <div><dt>SCREENSHOT QA</dt><dd>REQUIRED</dd></div>
                      <div><dt>FIDELITY SCORE</dt><dd>NOT SCORED</dd></div>
                    </>
                  ) : null}
                </dl>
                {selectedPrompt ? <pre className="site00-dw-inspect__prompt">{selectedPrompt.promptText}</pre> : null}
                <DesignComposerReviewQueue />
                <DesignRepoChangePanel projectKey={projectId} routeKey={route} pageKey={screenId} />
                <DesignMissingTargetQueue />
              </section>
            ) : null}
          </>
        ) : null}

        {primaryTab === 'REFERENCES' && assetSlots.length > 0 ? (
          <details className="site00-dw-v3-inspector">
            <summary>MISSING VISUAL ASSETS ({assetSlots.length})</summary>
            <DesignMissingAssetsSection
              slots={assetSlots}
              summary={missingSummary}
              selectedPromptSlotId={selectedPromptSlotId}
              selectedPrompt={selectedPrompt}
              onInspectPrompt={handleInspectPrompt}
              onGenerate={handleGenerateAsset}
              onUseAsset={handleUseAsset}
              onGenerateAll={handleGenerateAll}
            />
          </details>
        ) : null}

        <DesignWorkspaceDisclosurePanel activity={activity} quickActions={quickActions} />
      </div>
    </Site00DesignWorkspaceShell>

    <ActiveProjectNotificationCenter
      open={notificationOpen}
      onClose={closeHostMenu}
      projectSlug={projectId}
      projectLabel={projectMeta?.displayName ?? projectId.toUpperCase()}
      anchorRef={notifyAnchorRef}
      notifications={mergedNotifications}
      unreadCount={mergedUnreadCount}
      messagesTransportBlocked={notificationState.messagesTransportBlocked}
      messagesTransportBlockReason={notificationState.messagesTransportBlockReason}
      loading={notificationsLoading}
      onMarkRead={handleNotificationMarkRead}
      onMarkAllRead={handleNotificationMarkAllRead}
      onFounderActionOpen={handleFounderActionNotificationOpen}
    />

    <DesignWorkspaceOverflowMenu
      open={overflowOpen}
      onClose={closeHostMenu}
      anchorRef={overflowAnchorRef}
      actions={overflowActions}
      onAction={handleOverflowAction}
      projectLabel={projectMeta?.displayName ?? projectId.toUpperCase()}
    />
    </>
  );
}
