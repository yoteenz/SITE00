import { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import AdminGuard from './components/AdminGuard';
import { Site00Routes } from './routes/Site00Routes';
import { Site00AdminRoutes } from './routes/Site00AdminRoutes';
import { ensureAuthRestoredFromBackup, isSignedIn, persistAuthBackup } from './utils/adminAuth';

export default function App() {
  useEffect(() => {
    ensureAuthRestoredFromBackup();
    persistAuthBackup();
    if (isSignedIn()) {
      window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
    }
  }, []);

  return (
    <Routes>
      {Site00Routes()}
      <Route path="/admin" element={<AdminGuard />}>
        <Route index element={<Navigate to="/admin/site00" replace />} />
        {Site00AdminRoutes()}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
