import { lazy, Suspense } from 'react';
import { Navigate, Route } from 'react-router-dom';
import LoadingScreen from '../components/base/LoadingScreen';
import '../site00/admin/styles/site00-admin.css';
import '../site00/admin/styles/site00-control.css';
import '../site00/admin/styles/site00-email-debug.css';

const Site00AdminDashboardPage = lazy(() => import('../site00/admin/pages/DashboardPage'));
const Site00AdminStudioPage = lazy(() => import('../site00/admin/pages/StudioPage'));
const Site00AdminApprovalsPage = lazy(() => import('../site00/admin/pages/ApprovalsPage'));
const Site00AdminProjectsPage = lazy(() => import('../site00/admin/pages/ProjectsPage'));
const Site00AdminProjectWorkspacePage = lazy(() => import('../site00/admin/pages/ProjectWorkspacePage'));

const IdentitiesPage = lazy(() => import('../site00/admin/pages/operations/IdentitiesPage'));
const IdentityDetailPage = lazy(() => import('../site00/admin/pages/operations/IdentityDetailPage'));
const BldrIntakesPage = lazy(() => import('../site00/admin/pages/operations/BldrIntakesPage'));
const BldrIntakeDetailPage = lazy(() => import('../site00/admin/pages/operations/BldrIntakeDetailPage'));
const LeadsPage = lazy(() => import('../site00/admin/pages/operations/LeadsPage'));
const LeadDetailPage = lazy(() => import('../site00/admin/pages/operations/LeadDetailPage'));
const DiscoveryPage = lazy(() => import('../site00/admin/pages/operations/DiscoveryPage'));
const DiscoveryDetailPage = lazy(() => import('../site00/admin/pages/operations/DiscoveryDetailPage'));
const SitesPage = lazy(() => import('../site00/admin/pages/operations/SitesPage'));
const SiteDetailPage = lazy(() => import('../site00/admin/pages/operations/SiteDetailPage'));
const CtrlRoomPage = lazy(() => import('../site00/admin/pages/operations/CtrlRoomPage'));
const FinancePage = lazy(() => import('../site00/admin/pages/operations/FinancePage'));
const InvoiceDetailPage = lazy(() => import('../site00/admin/pages/operations/InvoiceDetailPage'));
const TeamPage = lazy(() => import('../site00/admin/pages/operations/TeamPage'));
const ReportsPage = lazy(() => import('../site00/admin/pages/operations/ReportsPage'));
const ReportsPipelinePage = lazy(() => import('../site00/admin/pages/operations/ReportsPipelinePage'));
const ActivityPage = lazy(() => import('../site00/admin/pages/operations/ActivityPage'));
const SettingsPage = lazy(() => import('../site00/admin/pages/operations/SettingsPage'));
const AccessCredentialsPage = lazy(() => import('../site00/admin/pages/access/AccessCredentialsPage'));
const AccessCredentialDetailPage = lazy(() => import('../site00/admin/pages/access/AccessCredentialDetailPage'));
const EmailPackGalleryPage = lazy(() => import('../site00/admin/pages/debug/EmailPackGalleryPage'));
const EmailTemplateDetailPage = lazy(() => import('../site00/admin/pages/debug/EmailTemplateDetailPage'));
const EvolveMarketingDebugPage = lazy(() => import('../site00/admin/pages/debug/EvolveMarketingDebugPage'));
const OrchestrationDebugPage = lazy(() => import('../site00/admin/pages/debug/OrchestrationDebugPage'));
const ReconciliationInboxPage = lazy(() => import('../site00/admin/pages/ReconciliationInboxPage'));
const OrchestrationProjectPage = lazy(() => import('../site00/admin/pages/OrchestrationProjectPage'));
const EvolveOverviewPage = lazy(() => import('../site00/admin/pages/EvolveOverviewPage'));
const EvolveOrgPage = lazy(() => import('../site00/admin/pages/EvolveOrgPage'));
const EvolveCampaignsPage = lazy(() => import('../site00/admin/pages/evolve/EvolveCampaignsPage'));
const EvolveCampaignDetailPage = lazy(() => import('../site00/admin/pages/evolve/EvolveCampaignDetailPage'));
const EvolveCalendarPage = lazy(() => import('../site00/admin/pages/evolve/EvolveCalendarPage'));
const EvolveContentDetailPage = lazy(() => import('../site00/admin/pages/evolve/EvolveContentDetailPage'));
const EvolveEmailOpsPage = lazy(() => import('../site00/admin/pages/evolve/EvolveEmailOpsPage'));
const EvolveSocialOpsPage = lazy(() => import('../site00/admin/pages/evolve/EvolveSocialOpsPage'));
const EvolveProductionBriefPage = lazy(() => import('../site00/admin/pages/evolve/EvolveProductionBriefPage'));
const EvolvePlansPage = lazy(() => import('../site00/admin/pages/evolve/EvolvePlansPage'));
const EvolveApprovalsInboxPage = lazy(() => import('../site00/admin/pages/evolve/EvolveApprovalsInboxPage'));
const EvolveConnectionsPortfolioPage = lazy(() => import('../site00/admin/pages/evolve/EvolveConnectionsPortfolioPage'));
const EvolveOrgConnectionsPage = lazy(() => import('../site00/admin/pages/evolve/EvolveOrgConnectionsPage'));
const EvolvePilotControlPage = lazy(() => import('../site00/admin/pages/evolve/EvolvePilotControlPage'));
const EvolveCreativeDirectionPage = lazy(() => import('../site00/admin/pages/evolve/EvolveCreativeDirectionPage'));
const EvolveCreativeDirectionDebugPage = lazy(() => import('../site00/admin/pages/debug/EvolveCreativeDirectionDebugPage'));
const EvolveDebugPage = lazy(() => import('../site00/admin/pages/debug/EvolveDebugPage'));
const MarketingEngagementsAdminPage = lazy(() => import('../site00/admin/pages/marketing/MarketingEngagementsAdminPage'));
const MarketingEngagementAdminDetailPage = lazy(() => import('../site00/admin/pages/marketing/MarketingEngagementAdminDetailPage'));

function AdminSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
}

/** SITE 00 Admin Production OS routes — mounted under AdminGuard at /admin/site00/* */
export function Site00AdminRoutes() {
  return (
    <>
      <Route
        path="site00"
        element={
          <AdminSuspense>
            <Site00AdminDashboardPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/studio"
        element={
          <AdminSuspense>
            <Site00AdminStudioPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/studio/queue"
        element={
          <AdminSuspense>
            <Site00AdminStudioPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/approvals"
        element={
          <AdminSuspense>
            <Site00AdminApprovalsPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/projects"
        element={
          <AdminSuspense>
            <Site00AdminProjectsPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/projects/:projectId"
        element={
          <AdminSuspense>
            <Site00AdminProjectWorkspacePage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/projects/:projectId/:section"
        element={
          <AdminSuspense>
            <Site00AdminProjectWorkspacePage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/identities"
        element={
          <AdminSuspense>
            <IdentitiesPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/identities/:id"
        element={
          <AdminSuspense>
            <IdentityDetailPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/bldr-intakes"
        element={
          <AdminSuspense>
            <BldrIntakesPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/bldr-intakes/:id"
        element={
          <AdminSuspense>
            <BldrIntakeDetailPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/leads"
        element={
          <AdminSuspense>
            <LeadsPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/leads/:id"
        element={
          <AdminSuspense>
            <LeadDetailPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/discovery"
        element={
          <AdminSuspense>
            <DiscoveryPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/discovery/:id"
        element={
          <AdminSuspense>
            <DiscoveryDetailPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/sites"
        element={
          <AdminSuspense>
            <SitesPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/sites/:id"
        element={
          <AdminSuspense>
            <SiteDetailPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/ctrl-room"
        element={
          <AdminSuspense>
            <CtrlRoomPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/finance"
        element={
          <AdminSuspense>
            <FinancePage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/finance/invoices/:id"
        element={
          <AdminSuspense>
            <InvoiceDetailPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/team"
        element={
          <AdminSuspense>
            <TeamPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/reports"
        element={
          <AdminSuspense>
            <ReportsPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/reports/pipeline"
        element={
          <AdminSuspense>
            <ReportsPipelinePage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/activity"
        element={
          <AdminSuspense>
            <ActivityPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/access-credentials"
        element={
          <AdminSuspense>
            <AccessCredentialsPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/access-credentials/:id"
        element={
          <AdminSuspense>
            <AccessCredentialDetailPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/debug/email-pack"
        element={
          <AdminSuspense>
            <EmailPackGalleryPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/debug/email-pack/:templateId"
        element={
          <AdminSuspense>
            <EmailTemplateDetailPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/debug/evolve-marketing"
        element={
          <AdminSuspense>
            <EvolveMarketingDebugPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/evolve"
        element={
          <AdminSuspense>
            <EvolveOverviewPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/evolve/connections"
        element={
          <AdminSuspense>
            <EvolveConnectionsPortfolioPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/evolve/approvals"
        element={
          <AdminSuspense>
            <EvolveApprovalsInboxPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/orchestration/:orgSlug/evolve/connections"
        element={
          <AdminSuspense>
            <EvolveOrgConnectionsPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/orchestration/:orgSlug/evolve/pilot"
        element={
          <AdminSuspense>
            <EvolvePilotControlPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/orchestration/:orgSlug/evolve/creative-direction"
        element={
          <AdminSuspense>
            <EvolveCreativeDirectionPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/debug/evolve-creative-direction"
        element={
          <AdminSuspense>
            <EvolveCreativeDirectionDebugPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/orchestration/:orgSlug/evolve/campaigns"
        element={
          <AdminSuspense>
            <EvolveCampaignsPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/orchestration/:orgSlug/evolve/campaigns/:campaignId"
        element={
          <AdminSuspense>
            <EvolveCampaignDetailPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/orchestration/:orgSlug/evolve/calendar"
        element={
          <AdminSuspense>
            <EvolveCalendarPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/orchestration/:orgSlug/evolve/calendar/:itemId"
        element={
          <AdminSuspense>
            <EvolveContentDetailPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/orchestration/:orgSlug/evolve/emails"
        element={
          <AdminSuspense>
            <EvolveEmailOpsPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/orchestration/:orgSlug/evolve/social"
        element={
          <AdminSuspense>
            <EvolveSocialOpsPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/orchestration/:orgSlug/evolve/production/new"
        element={
          <AdminSuspense>
            <EvolveProductionBriefPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/orchestration/:orgSlug/evolve/plans"
        element={
          <AdminSuspense>
            <EvolvePlansPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/orchestration/:orgSlug/evolve"
        element={
          <AdminSuspense>
            <EvolveOrgPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/debug/evolve"
        element={
          <AdminSuspense>
            <EvolveDebugPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/reconciliation"
        element={
          <AdminSuspense>
            <ReconciliationInboxPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/orchestration/:orgSlug"
        element={
          <AdminSuspense>
            <OrchestrationProjectPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/debug/orchestration"
        element={
          <AdminSuspense>
            <OrchestrationDebugPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/marketing-engagements"
        element={
          <AdminSuspense>
            <MarketingEngagementsAdminPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/marketing-engagements/:engagementId"
        element={
          <AdminSuspense>
            <MarketingEngagementAdminDetailPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/settings"
        element={
          <AdminSuspense>
            <SettingsPage />
          </AdminSuspense>
        }
      />
      <Route
        path="site00/settings/studio/automation"
        element={
          <AdminSuspense>
            <SettingsPage />
          </AdminSuspense>
        }
      />
      <Route path="site00/*" element={<Navigate to="/admin/site00" replace />} />
    </>
  );
}
