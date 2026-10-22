import '../../styles/site00-correspondence-fonts.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RegistryFilterProvider } from './data/registryFilters';
import { OverlayProvider } from './overlay/OverlayContext';
import { IDNTY_FOUNDER_WORKSPACE_ROUTES } from './config/routes';
import { OverviewPage } from './pages/OverviewPage';
import { FoundationsPage } from './pages/FoundationsPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { OperationsPage } from './pages/OperationsPage';
import { CorrespondencePage } from './pages/CorrespondencePage';
import { ReferralsPage } from './pages/ReferralsPage';
import { SystemPage } from './pages/SystemPage';
import { ClientRecordPage } from './pages/ClientRecordPage';

export default function FounderWorkspaceApp() {
  return (
    <RegistryFilterProvider>
      <OverlayProvider>
      <Routes>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="foundations" element={<FoundationsPage />} />
        <Route path="foundations/:artifactId" element={<ClientRecordPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="operations" element={<OperationsPage />} />
        <Route path="correspondence" element={<CorrespondencePage />} />
        <Route path="referrals" element={<ReferralsPage />} />
        <Route path="system" element={<SystemPage />} />
        <Route path="*" element={<Navigate to={IDNTY_FOUNDER_WORKSPACE_ROUTES.overview} replace />} />
      </Routes>
      </OverlayProvider>
    </RegistryFilterProvider>
  );
}
