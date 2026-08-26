import { Navigate, Route, Routes } from 'react-router-dom';
import { AstralWorldExperienceShell } from '../components/AstralWorldExperienceShell';
import AstralWorldHomePage from './AstralWorldHomePage';
import AstralWorldAstreaPage from './AstralWorldAstreaPage';
import AstralWorldReadersPage from './AstralWorldReadersPage';
import AstralWorldFriendsPage from './AstralWorldFriendsPage';
import AstralWorldJournalPage from './AstralWorldJournalPage';
import AstralWorldProfilePage from './AstralWorldProfilePage';
import TarotSuitePage from './destinations/TarotSuitePage';
import AstralMallPage from './destinations/AstralMallPage';
import CoffeeShopPage from './destinations/CoffeeShopPage';

export default function AstralWorldExperienceRouter() {
  return (
    <Routes>
      <Route element={<AstralWorldExperienceShell />}>
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
      </Route>
    </Routes>
  );
}
