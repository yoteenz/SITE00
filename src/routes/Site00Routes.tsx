import { lazy, Suspense, type ReactNode } from 'react';
import { Route, Navigate } from 'react-router-dom';
import AdminGuard from '../components/AdminGuard';
import { Site00Provider } from '../site00/state/Site00Context';
import { ExperienceContextProvider } from '../site00/state/experienceContext';
import { SITE00_ROUTES } from '../site00/config/routes';
import { AsstsRouteSuspense } from '../site00/assts/components/AsstsRouteSuspense';
import { AsstsColdStartGate } from '../site00/assts/components/AsstsColdStartGate';
import { Site00RouteLoadingFallback } from '../site00/components/loader/Site00RouteLoadingFallback';
import { Site00WorldColdStartGate } from '../site00/components/loader/Site00WorldColdStartGate';
import { Site00OriginRouteShell } from '../site00/components/shell/Site00OriginRouteShell';
import { Site00AccountRouteGuard } from '../site00/components/guards/Site00AccountRouteGuard';
import { Site00PublicRouteShell } from '../site00/components/shell/Site00PublicRouteShell';
import { Site00PublicDesktopLegacyRedirect } from '../site00/components/shell/Site00PublicWideDesktopRedirect';
import { Site00OriginDesktopLegacyRedirect } from '../site00/components/shell/Site00OriginDesktopLegacyRedirect';
import { Site00WorkflowDesktopLegacyRedirect } from '../site00/components/shell/Site00WorkflowDesktopLegacyRedirect';
import { Site00IdentityAliasRedirect, Site00SignInAliasRedirect } from '../site00/components/routing/Site00RouteAliases';
import { Site00TypographyBootstrap } from '../site00/components/Site00TypographyBootstrap';
import { site00PublicDesktopPath } from '../site00/config/site00-public-pages';
/* Eager-load SITE 00 + ASSTS styles (lazy route CSS was not applying on mobile preview). */
import '../site00/styles/site00.css';
import '../site00/styles/site00-locations.css';
import '../site00/styles/site00-fast-travel.css';
import '../site00/styles/site00-bldr-entry.css';
import '../site00/styles/site00-bldr-hub-mobile.css';
import '../site00/styles/site00-bldr-classification-mobile.css';
import '../site00/styles/site00-bldr-intake-mobile.css';
import '../site00/styles/site00-idnty-diagnostic-mobile.css';
import '../site00/styles/site00-evolve-mobile.css';
import '../site00/styles/site00-evolve-hub-mobile.css';
import '../site00/styles/site00-evolve-assessment-mobile.css';
import '../site00/styles/site00-marketing.css';
import '../site00/styles/site00-loader.css';
import '../site00/styles/site00-desktop-artboard.css';
import '../site00/styles/site00-desktop-artboard-preview.css';
import '../site00/styles/site00-mobile-artboard.css';
import '../site00/styles/site00-auth.css';
import '../site00/styles/site00-auth-create-account.css';
import '../site00/styles/site00-access.css';
import '../site00/styles/site00-ctrl-room.css';
import '../site00/styles/site00-ctrl-room-mobile.css';
import '../site00/styles/site00-ecosystem.css';
import '../site00/styles/site00-experience-context.css';
import '../site00/styles/site00-idnty-assessment.css';
import '../site00/styles/site00-idnty-state-v2.css';
import '../site00/styles/site00-idnty-control-center.css';
import '../site00/styles/site00-idnty-calibration-mobile.css';
import '../site00/styles/site00-project-lore-calibration.css';
import '../site00/styles/site00-pages.css';
import '../site00/styles/site00-mobile-shell.css';
import '../site00/styles/site00-studio.css';
import '../site00/assts/styles/assts.css';
import '../site00/assts/styles/assts-depth.css';
import '../site00/assts/styles/assts-composition.css';
import '../site00/assts/styles/assts-library-home.css';

const Site00OriginPage = lazy(() => import('../site00/pages/OriginPage'));
const Site00LocationsPage = lazy(() => import('../site00/pages/LocationsPage'));
const Site00EnterPage = lazy(() => import('../site00/pages/EnterPage'));
const Site00IdntyPage = lazy(() => import('../site00/pages/IdntyPage'));
const Site00IdntyStatePage = lazy(() => import('../site00/pages/IdntyStatePage'));
const Site00BldrPage = lazy(() => import('../site00/pages/BldrPage'));
const Site00BldrStatePage = lazy(() => import('../site00/pages/BldrStatePage'));
const Site00EvolvePage = lazy(() => import('../site00/pages/EvolvePage'));
const Site00EvolveStatePage = lazy(() => import('../site00/pages/EvolveStatePage'));
const Site00SignInPage = lazy(() => import('../site00/pages/Site00SignInPage'));
const Site00CreateAccountPage = lazy(() => import('../site00/pages/Site00CreateAccountPage'));
const AccessCredentialPage = lazy(() => import('../site00/pages/access/AccessCredentialPage'));
const AccessCredentialDebugPage = lazy(() => import('../site00/pages/access/AccessCredentialDebugPage'));
const ControlOverviewPage = lazy(() => import('../site00/pages/control/ControlOverviewPage'));
const ControlSectionPage = lazy(() => import('../site00/pages/control/ControlSectionPage'));
const ControlSitesPage = lazy(() => import('../site00/pages/control/ControlSitesPage'));
const SitesPortfolioPage = lazy(() => import('../site00/pages/SitesPortfolioPage'));
const ServicesPage = lazy(() => import('../site00/pages/ServicesPage'));
const SystemPage = lazy(() => import('../site00/pages/SystemPage'));
const AboutPage = lazy(() => import('../site00/pages/AboutPage'));
const JournalPage = lazy(() => import('../site00/pages/JournalPage'));
const ProjectsPage = lazy(() => import('../site00/pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('../site00/pages/ProjectDetailPage'));
const AccountIntakesPage = lazy(() => import('../site00/pages/account/AccountIntakesPage'));
const AccountIntakeDetailPage = lazy(() => import('../site00/pages/account/AccountIntakeDetailPage'));
const IntakeGuestAccessPage = lazy(() => import('../site00/pages/intake/IntakeGuestAccessPage'));
const WorldIntakeGuestPage = lazy(() => import('../site00/pages/world-intake/WorldIntakeGuestPage'));
const ProjectEvolvePage = lazy(() => import('../site00/pages/ProjectEvolvePage'));
const ProjectCreativeDirectionPage = lazy(() => import('../site00/pages/ProjectCreativeDirectionPage'));
const ProjectPersonalityReplayPage = lazy(() => import('../site00/pages/ProjectPersonalityReplayPage'));
const ProjectSixDirectionConsistencyPage = lazy(() => import('../site00/pages/ProjectSixDirectionConsistencyPage'));
const ProjectCanonicalCreativeRangePage = lazy(() => import('../site00/pages/ProjectCanonicalCreativeRangePage'));
const ProjectCanonicalCarouselExpansionPage = lazy(() => import('../site00/pages/ProjectCanonicalCarouselExpansionPage'));
const ProjectExperimentDPage = lazy(() => import('../site00/pages/ProjectExperimentDPage'));
const ProjectExperimentEPage = lazy(() => import('../site00/pages/ProjectExperimentEPage'));
const ProjectWorkspaceVisualDevelopmentPage = lazy(
  () => import('../site00/pages/ProjectWorkspaceVisualDevelopmentPage'),
);
const ProjectContentLibraryPage = lazy(() => import('../site00/pages/ProjectContentLibraryPage'));
const PersonalityReplayIntakeRouterPage = lazy(
  () => import('../site00/pages/validation/PersonalityReplayIntakeRouterPage'),
);
const ProjectLoreCalibrationPage = lazy(() => import('../site00/pages/ProjectLoreCalibrationPage'));
const ProjectCreativeAppetitePage = lazy(() => import('../site00/pages/ProjectCreativeAppetitePage'));
const SupportPage = lazy(() => import('../site00/pages/SupportPage'));
const IdntySignInSecurityPage = lazy(() => import('../site00/pages/idnty/IdntySignInSecurityPage'));
const BldrTemplatesPage = lazy(() => import('../site00/pages/bldr/BldrTemplatesPage'));
const BldrStartPage = lazy(() => import('../site00/pages/bldr/BldrStartPage'));
const AsstsLibraryPage = lazy(() => import('../site00/assts/pages/LibraryPage'));
const AsstsBatchesListPage = lazy(() => import('../site00/assts/pages/BatchesListPage'));
const AsstsBatchPage = lazy(() => import('../site00/assts/pages/BatchPage'));
const AsstsInspectionPage = lazy(() => import('../site00/assts/pages/InspectionPage'));
const AsstsLoaderPipelinePage = lazy(() => import('../site00/assts/pages/LoaderPipelinePage'));
const AsstsCompositionStudioPage = lazy(() => import('../site00/assts/pages/CompositionStudioPage'));
const AsstsSearchPage = lazy(() => import('../site00/assts/pages/SearchPage'));
const AsstsNotificationsPage = lazy(() => import('../site00/assts/pages/NotificationsPage'));
const AsstsProfilePage = lazy(() => import('../site00/assts/pages/ProfilePage'));
const ProjectProvisioningPage = lazy(() => import('../site00/pages/provisioning/ProjectProvisioningPage'));
const StudioDashboardPage = lazy(() => import('../site00/pages/studio/StudioDashboardPage'));
const StudioWorkspaceRouterPage = lazy(() => import('../site00/pages/studio/StudioWorkspaceRouterPage'));
const StudioReviewDetailPage = lazy(() => import('../site00/pages/studio/StudioReviewDetailPage'));
const IdntyAssessmentRouterPage = lazy(() => import('../site00/pages/idnty/assessment/IdntyAssessmentRouterPage'));
const BldrAssessmentRouterPage = lazy(() => import('../site00/pages/bldr/assessment/BldrAssessmentRouterPage'));
const EvolveAssessmentRouterPage = lazy(() => import('../site00/pages/evolve/assessment/EvolveAssessmentRouterPage'));
const MarketingLandingPage = lazy(() => import('../site00/pages/evolve/marketing/MarketingLandingPage'));
const MarketingServicesPage = lazy(() => import('../site00/pages/evolve/marketing/MarketingServicesPage'));
const MarketingIntakePage = lazy(() => import('../site00/pages/evolve/marketing/MarketingIntakePage'));
const MarketingBriefPage = lazy(() => import('../site00/pages/evolve/marketing/MarketingBriefPage'));
const MarketingEngagementPage = lazy(() => import('../site00/pages/evolve/marketing/MarketingEngagementPage'));
const EvolveCommercialPage = lazy(() => import('../site00/pages/evolve/EvolveCommercialPage'));
const LoaderPreviewPage = lazy(() => import('../site00/pages/LoaderPreviewPage'));

function Site00Suspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Site00RouteLoadingFallback />}>{children}</Suspense>;
}

function Site00PublicPageRoutes(path: string, Page: React.LazyExoticComponent<() => JSX.Element>, auth = false) {
  const page = (
    <Site00Suspense>
      <Page />
    </Site00Suspense>
  );
  const body = auth ? <Site00AccountRouteGuard>{page}</Site00AccountRouteGuard> : page;
  const desktopPath = site00PublicDesktopPath(path);

  return (
    <>
      <Route
        path={path}
        element={
          <Site00Layout>
            <Site00PublicRouteShell>{body}</Site00PublicRouteShell>
          </Site00Layout>
        }
      />
      <Route
        path={desktopPath}
        element={
          <Site00Layout>
            <Site00PublicDesktopLegacyRedirect />
          </Site00Layout>
        }
      />
    </>
  );
}

function Site00Layout({ children }: { children: ReactNode }) {
  return (
    <Site00Provider>
      <ExperienceContextProvider>
        <Site00TypographyBootstrap />
        <Site00WorldColdStartGate>{children}</Site00WorldColdStartGate>
      </ExperienceContextProvider>
    </Site00Provider>
  );
}

function Site00LoaderPreviewLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Site00TypographyBootstrap />
      {children}
    </>
  );
}

/**
 * SITE 00 Foundation V1.1 routes.
 * Invoke as `{Site00Routes()}` inside `<Routes>`.
 *
 * `/` remains Frontal Slayer HomeLandingRedirect unless VITE_SITE00_ROOT=1.
 * SITE 00 Origin is always available at `/origin`.
 */
export function Site00Routes() {
  const site00Root = import.meta.env.VITE_SITE00_ROOT === '1';

  return (
    <>
      <Route path="/sign-in" element={<Site00SignInAliasRedirect />} />
      <Route path="/identity/*" element={<Site00IdentityAliasRedirect />} />
      <Route path="/identity" element={<Navigate to={SITE00_ROUTES.idnty} replace />} />
      {site00Root ? (
        <Route
          index
          element={
            <Site00Layout>
              <Site00OriginRouteShell>
                <Site00Suspense>
                  <Site00OriginPage />
                </Site00Suspense>
              </Site00OriginRouteShell>
            </Site00Layout>
          }
        />
      ) : null}
      {site00Root ? (
        <Route
          path="/"
          element={
            <Site00Layout>
              <Site00OriginRouteShell>
                <Site00Suspense>
                  <Site00OriginPage />
                </Site00Suspense>
              </Site00OriginRouteShell>
            </Site00Layout>
          }
        />
      ) : null}
      <Route
        path={SITE00_ROUTES.loaderPreview}
        element={
          <Site00LoaderPreviewLayout>
            <Site00Suspense>
              <LoaderPreviewPage />
            </Site00Suspense>
          </Site00LoaderPreviewLayout>
        }
      />
      {/* Auth routes before /origin — prevents origin homepage from swallowing /origin/sign-in and /origin/create-account */}
      <Route
        path={SITE00_ROUTES.signIn}
        element={
          <Site00Layout>
            <Site00Suspense>
              <Site00SignInPage />
            </Site00Suspense>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.createAccount}
        element={
          <Site00Layout>
            <Site00Suspense>
              <Site00CreateAccountPage />
            </Site00Suspense>
          </Site00Layout>
        }
      />

      <Route path="/register" element={<Navigate to={SITE00_ROUTES.createAccount} replace />} />
      <Route path="/create-account" element={<Navigate to={SITE00_ROUTES.createAccount} replace />} />
      <Route
        path={SITE00_ROUTES.locations}
        element={
          <Site00Layout>
            <Site00Suspense>
              <Site00LocationsPage />
            </Site00Suspense>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.originAlias}
        element={
          <Site00Layout>
            <Site00OriginRouteShell>
              <Site00Suspense>
                <Site00OriginPage />
              </Site00Suspense>
            </Site00OriginRouteShell>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.originDesktop}
        element={
          <Site00Layout>
            <Site00OriginDesktopLegacyRedirect />
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.enter}
        element={
          <Site00Layout>
            <Site00OriginRouteShell>
              <Site00Suspense>
                <Site00EnterPage />
              </Site00Suspense>
            </Site00OriginRouteShell>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.idnty}
        element={
          <Site00Layout>
            <Site00PublicRouteShell>
              <Site00Suspense>
                <Site00IdntyPage />
              </Site00Suspense>
            </Site00PublicRouteShell>
          </Site00Layout>
        }
      />
      <Route
        path={site00PublicDesktopPath(SITE00_ROUTES.idnty)}
        element={
          <Site00Layout>
            <Site00PublicDesktopLegacyRedirect />
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.idntyState}
        element={
          <Site00Layout>
            <Site00PublicRouteShell>
              <Site00Suspense>
                <Site00IdntyStatePage />
              </Site00Suspense>
            </Site00PublicRouteShell>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.idntyStateDesktop}
        element={
          <Site00Layout>
            <Site00WorkflowDesktopLegacyRedirect />
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.bldr}
        element={
          <Site00Layout>
            <Site00PublicRouteShell>
              <Site00Suspense>
                <Site00BldrPage />
              </Site00Suspense>
            </Site00PublicRouteShell>
          </Site00Layout>
        }
      />
      <Route
        path={site00PublicDesktopPath(SITE00_ROUTES.bldr)}
        element={
          <Site00Layout>
            <Site00PublicDesktopLegacyRedirect />
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.bldrState}
        element={
          <Site00Layout>
            <Site00PublicRouteShell>
              <Site00Suspense>
                <Site00BldrStatePage />
              </Site00Suspense>
            </Site00PublicRouteShell>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.bldrStateDesktop}
        element={
          <Site00Layout>
            <Site00WorkflowDesktopLegacyRedirect />
          </Site00Layout>
        }
      />
      {Site00PublicPageRoutes(SITE00_ROUTES.evolve, Site00EvolvePage)}
      <Route
        path={SITE00_ROUTES.evolveState}
        element={
          <Site00Layout>
            <Site00PublicRouteShell>
              <Site00Suspense>
                <Site00EvolveStatePage />
              </Site00Suspense>
            </Site00PublicRouteShell>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.evolveStateDesktop}
        element={
          <Site00Layout>
            <Site00WorkflowDesktopLegacyRedirect />
          </Site00Layout>
        }
      />
      {/* ASSTS Asset Vault — admin-only internal review surface */}
      <Route path="/assts" element={<AdminGuard />}>
        <Route element={<AsstsColdStartGate />}>
          <Route
            index
            element={
              <AsstsRouteSuspense>
                <AsstsLibraryPage />
              </AsstsRouteSuspense>
            }
          />
          <Route
            path="composition-studio"
            element={
              <AsstsRouteSuspense>
                <AsstsCompositionStudioPage />
              </AsstsRouteSuspense>
            }
          />
          <Route
            path="batches"
            element={
              <AsstsRouteSuspense>
                <AsstsBatchesListPage />
              </AsstsRouteSuspense>
            }
          />
          <Route
            path="batches/:batchId"
            element={
              <AsstsRouteSuspense>
                <AsstsBatchPage />
              </AsstsRouteSuspense>
            }
          />
          <Route
            path="loader-pipeline"
            element={
              <AsstsRouteSuspense>
                <AsstsLoaderPipelinePage />
              </AsstsRouteSuspense>
            }
          />
          <Route
            path="search"
            element={
              <AsstsRouteSuspense>
                <AsstsSearchPage />
              </AsstsRouteSuspense>
            }
          />
          <Route
            path="notifications"
            element={
              <AsstsRouteSuspense>
                <AsstsNotificationsPage />
              </AsstsRouteSuspense>
            }
          />
          <Route
            path="profile"
            element={
              <AsstsRouteSuspense>
                <AsstsProfilePage />
              </AsstsRouteSuspense>
            }
          />
          <Route
            path=":assetId"
            element={
              <AsstsRouteSuspense>
                <AsstsInspectionPage />
              </AsstsRouteSuspense>
            }
          />
        </Route>
      </Route>
      {Site00PublicPageRoutes(SITE00_ROUTES.sites, SitesPortfolioPage)}
      {Site00PublicPageRoutes(SITE00_ROUTES.services, ServicesPage)}
      {Site00PublicPageRoutes(SITE00_ROUTES.system, SystemPage)}
      {Site00PublicPageRoutes(SITE00_ROUTES.about, AboutPage)}
      {Site00PublicPageRoutes(SITE00_ROUTES.journal, JournalPage)}
      {Site00PublicPageRoutes(SITE00_ROUTES.support, SupportPage)}
      {Site00PublicPageRoutes(SITE00_ROUTES.idntySignInSecurity, IdntySignInSecurityPage)}
      {Site00PublicPageRoutes(SITE00_ROUTES.bldrTemplates, BldrTemplatesPage)}
      <Route
        path="/idnty/:stateSlug/*"
        element={
          <Site00Layout>
            <Site00PublicRouteShell>
              <Site00Suspense>
                <IdntyAssessmentRouterPage />
              </Site00Suspense>
            </Site00PublicRouteShell>
          </Site00Layout>
        }
      />
      <Route
        path="/idnty/:stateSlug/desktop/*"
        element={
          <Site00Layout>
            <Site00WorkflowDesktopLegacyRedirect />
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.projects}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ProjectsPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.projectDetail}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ProjectDetailPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.projectEvolve}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ProjectEvolvePage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.projectCreativeDirection}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ProjectCreativeDirectionPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path="/validation/ndxbook/replay/:replayId/personality/:stepId"
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <PersonalityReplayIntakeRouterPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path="/validation/ndxbook/replay/:replayId/personality/review"
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <PersonalityReplayIntakeRouterPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.projectLoreCalibration}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ProjectLoreCalibrationPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.projectCreativeAppetite}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ProjectCreativeAppetitePage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.projectPersonalityReplay}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ProjectPersonalityReplayPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.projectPersonalityReplayConsistency}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ProjectSixDirectionConsistencyPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.projectCanonicalCreativeRange}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ProjectCanonicalCreativeRangePage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.projectCanonicalCarouselExpansion}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ProjectCanonicalCarouselExpansionPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.projectExperimentD}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ProjectExperimentDPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.projectExperimentE}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ProjectExperimentEPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.projectExperimentEVisualDevelopment}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ProjectWorkspaceVisualDevelopmentPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.projectContentLibrary}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ProjectContentLibraryPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.projectPersonalityReplayStep}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ProjectPersonalityReplayPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.accountIntakes}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <AccountIntakesPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.accountIntakeDetail}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <AccountIntakeDetailPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.worldIntakeGuest}
        element={
          <Site00Layout>
            <Site00Suspense>
              <WorldIntakeGuestPage />
            </Site00Suspense>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.intakeGuestAccess}
        element={
          <Site00Layout>
            <Site00Suspense>
              <IntakeGuestAccessPage />
            </Site00Suspense>
          </Site00Layout>
        }
      />
      <Route
        path={site00PublicDesktopPath(SITE00_ROUTES.projects)}
        element={
          <Site00Layout>
            <Site00PublicDesktopLegacyRedirect />
          </Site00Layout>
        }
      />
      {Site00PublicPageRoutes(SITE00_ROUTES.bldrStart, BldrStartPage)}
      <Route
        path="/bldr/:classSlug/*"
        element={
          <Site00Layout>
            <Site00PublicRouteShell>
              <Site00Suspense>
                <BldrAssessmentRouterPage />
              </Site00Suspense>
            </Site00PublicRouteShell>
          </Site00Layout>
        }
      />
      <Route
        path="/bldr/:classSlug/desktop/*"
        element={
          <Site00Layout>
            <Site00WorkflowDesktopLegacyRedirect />
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.evolveMarketing}
        element={
          <Site00Layout>
            <Site00PublicRouteShell>
              <Site00Suspense>
                <MarketingLandingPage />
              </Site00Suspense>
            </Site00PublicRouteShell>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.evolveMarketingServices}
        element={
          <Site00Layout>
            <Site00PublicRouteShell>
              <Site00Suspense>
                <MarketingServicesPage />
              </Site00Suspense>
            </Site00PublicRouteShell>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.evolvePlans}
        element={
          <Site00Layout>
            <Site00PublicRouteShell>
              <Site00Suspense>
                <EvolveCommercialPage />
              </Site00Suspense>
            </Site00PublicRouteShell>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.evolveMarketingIntake}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <MarketingIntakePage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.evolveMarketingBrief}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <MarketingBriefPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.evolveMarketingEngagement}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <MarketingEngagementPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path="/evolve/:pathSlug/*"
        element={
          <Site00Layout>
            <Site00PublicRouteShell>
              <Site00Suspense>
                <EvolveAssessmentRouterPage />
              </Site00Suspense>
            </Site00PublicRouteShell>
          </Site00Layout>
        }
      />
      <Route
        path="/evolve/:pathSlug/desktop/*"
        element={
          <Site00Layout>
            <Site00WorkflowDesktopLegacyRedirect />
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.projectProvisioning}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ProjectProvisioningPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.studio}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <StudioDashboardPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.studioInput}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <StudioWorkspaceRouterPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.studioOperations}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <StudioWorkspaceRouterPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.studioBlueprint}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <StudioWorkspaceRouterPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.studioAssets}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <StudioWorkspaceRouterPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.studioReviews}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <StudioWorkspaceRouterPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.studioReviewDetail}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <StudioReviewDetailPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.studioMilestones}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <StudioWorkspaceRouterPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.studioActivity}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <StudioWorkspaceRouterPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.accessDebug}
        element={
          <Site00Layout>
            <Site00Suspense>
              <AccessCredentialDebugPage />
            </Site00Suspense>
          </Site00Layout>
        }
      />
      <Route
        path={`${SITE00_ROUTES.access}/:credentialId`}
        element={
          <Site00Layout>
            <Site00Suspense>
              <AccessCredentialPage />
            </Site00Suspense>
          </Site00Layout>
        }
      />
      <Route
        path={SITE00_ROUTES.control}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ControlOverviewPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={`${SITE00_ROUTES.controlSites}`}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ControlSitesPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={`${SITE00_ROUTES.controlDomains}`}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ControlSectionPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={`${SITE00_ROUTES.controlBilling}`}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ControlSectionPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={`${SITE00_ROUTES.controlTeam}`}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ControlSectionPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={`${SITE00_ROUTES.controlSettings}`}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ControlSectionPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      <Route
        path={`${SITE00_ROUTES.controlSecurity}`}
        element={
          <Site00Layout>
            <Site00AccountRouteGuard>
              <Site00Suspense>
                <ControlSectionPage />
              </Site00Suspense>
            </Site00AccountRouteGuard>
          </Site00Layout>
        }
      />
      {/* Reserved future namespaces — redirect to origin until implemented */}
      <Route path="/bluprint/*" element={<Navigate to={SITE00_ROUTES.originAlias} replace />} />
      <Route path="/build/*" element={<Navigate to={SITE00_ROUTES.originAlias} replace />} />
      <Route path="/live/*" element={<Navigate to={SITE00_ROUTES.originAlias} replace />} />
    </>
  );
}
