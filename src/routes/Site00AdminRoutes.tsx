import { lazy, Suspense } from 'react';
import { Navigate, Route } from 'react-router-dom';
import LoadingScreen from '../components/base/LoadingScreen';
import '../site00/admin/styles/site00-admin.css';

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
