import { Navigate, Route, Routes } from 'react-router-dom';
import { AstralWorldExperienceShell } from '../components/AstralWorldExperienceShell';
import type { AstralWorldRouteMode } from '../../../../shared/site00-astral-world/routes.js';
import AstralWorldHomePage from './AstralWorldHomePage';
import AstralWorldAstreaPage from './AstralWorldAstreaPage';
import AstralWorldReadersPage from './AstralWorldReadersPage';
import AstralWorldFriendsPage from './AstralWorldFriendsPage';
import AstralWorldJournalPage from './AstralWorldJournalPage';
import AstralWorldProfilePage from './AstralWorldProfilePage';
import AstralWorldDailyCardPage from './AstralWorldDailyCardPage';
import AstralWorldCustomAvatarPage from './AstralWorldCustomAvatarPage';
import AstralWorldJoinCirclePage from './AstralWorldJoinCirclePage';
import AstralWorldCreateDeckPage from './AstralWorldCreateDeckPage';
import AstralWorldNotificationDemoPage from './AstralWorldNotificationDemoPage';
import TarotSuitePage from './destinations/TarotSuitePage';
import AstralMallPage from './destinations/AstralMallPage';
import CoffeeShopPage from './destinations/CoffeeShopPage';

export default function AstralWorldExperienceRouter({ mode = 'experience' }: { mode?: AstralWorldRouteMode }) {
  return (
    <Routes>
      <Route element={<AstralWorldExperienceShell mode={mode} />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<AstralWorldHomePage />} />
        <Route path="astrea" element={<AstralWorldAstreaPage />} />
        <Route path="astrea/tarot-suite" element={<TarotSuitePage />} />
        <Route path="astrea/astral-mall" element={<AstralMallPage />} />
        <Route path="astrea/coffee-shop" element={<CoffeeShopPage />} />
        <Route path="readers" element={<AstralWorldReadersPage />} />
        <Route path="friends" element={<AstralWorldFriendsPage />} />
        <Route path="journal" element={<AstralWorldJournalPage />} />
        <Route path="profile" element={<AstralWorldProfilePage />} />
        <Route path="daily-card" element={<AstralWorldDailyCardPage />} />
        <Route path="custom-avatar" element={<AstralWorldCustomAvatarPage />} />
        <Route path="join-circle" element={<AstralWorldJoinCirclePage />} />
        <Route path="create-deck" element={<AstralWorldCreateDeckPage />} />
        <Route path="notification-demo" element={<AstralWorldNotificationDemoPage />} />
      </Route>
    </Routes>
  );
}
