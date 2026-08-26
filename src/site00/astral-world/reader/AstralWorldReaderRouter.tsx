import { Navigate, Route, Routes } from 'react-router-dom';
import { AstralWorldExperienceShell } from '../components/AstralWorldExperienceShell';
import ReaderOnboardingPage from './pages/ReaderOnboardingPage';
import ReaderHomePage from './pages/ReaderHomePage';
import ReaderProfilePage from './pages/ReaderProfilePage';
import ReaderAvatarPage from './pages/ReaderAvatarPage';
import ReaderPresencePage from './pages/ReaderPresencePage';
import ReaderAlertsPage from './pages/ReaderAlertsPage';

export default function AstralWorldReaderRouter() {
  return (
    <Routes>
      <Route element={<AstralWorldExperienceShell mode="fast-track" />}>
        <Route index element={<Navigate to="onboarding" replace />} />
        <Route path="onboarding" element={<ReaderOnboardingPage />} />
        <Route path="home" element={<ReaderHomePage />} />
        <Route path="profile" element={<ReaderProfilePage />} />
        <Route path="avatar" element={<ReaderAvatarPage />} />
        <Route path="services" element={<ReaderProfilePage />} />
        <Route path="availability" element={<ReaderPresencePage />} />
        <Route path="presence" element={<ReaderPresencePage />} />
        <Route path="clients" element={<ReaderAlertsPage />} />
        <Route path="alerts" element={<ReaderAlertsPage />} />
        <Route path="readings" element={<ReaderHomePage />} />
        <Route path="settings" element={<ReaderProfilePage />} />
      </Route>
    </Routes>
  );
}
