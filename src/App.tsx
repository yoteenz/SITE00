import { useEffect } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import AdminGuard from './components/AdminGuard';
import { Site00Routes } from './routes/Site00Routes';
import { Site00AdminRoutes } from './routes/Site00AdminRoutes';
import { EmailPackRedirect } from './routes/EmailPackRedirect';
import { CaptureAuthRedirect } from './routes/CaptureAuthRedirect';
import { ensureAuthRestoredFromBackup, isSignedIn, persistAuthBackup } from './utils/adminAuth';
import { writeAgentDebugLog } from './utils/agentDebugLog';

function Site00FallbackRedirect() {
  const location = useLocation();
  // #region agent log
  writeAgentDebugLog({
    hypothesisId: 'A',
    location: 'src/App.tsx:Site00FallbackRedirect',
    message: 'Wildcard route matched',
    data: { pathname: location.pathname, search: location.search },
  });
  // #endregion
  return <Navigate to="/" replace />;
}

export default function App() {
  useEffect(() => {
    ensureAuthRestoredFromBackup();
    persistAuthBackup();
    if (isSignedIn()) {
      window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
    }
    const recordRuntimeError = (event: Event) => {
      const errorEvent = event as ErrorEvent;
      const rejectionEvent = event as PromiseRejectionEvent;
      const detail = errorEvent.message || String(rejectionEvent.reason ?? 'unknown');
      // #region agent log
      writeAgentDebugLog({
        hypothesisId: 'D',
        location: 'src/App.tsx:recordRuntimeError',
        message: 'Runtime module or render error',
        data: { pathname: window.location.pathname, eventType: event.type, detail: detail.slice(0, 500) },
      });
      // #endregion
    };
    window.addEventListener('error', recordRuntimeError);
    window.addEventListener('unhandledrejection', recordRuntimeError);
    return () => {
      window.removeEventListener('error', recordRuntimeError);
      window.removeEventListener('unhandledrejection', recordRuntimeError);
    };
  }, []);

  return (
    <Routes>
      {Site00Routes()}
      <Route path="/admin" element={<AdminGuard />}>
        <Route index element={<Navigate to="/admin/site00" replace />} />
        {Site00AdminRoutes()}
      </Route>
      {/* Shorthand debug paths — canonical route is /admin/site00/debug/email-pack */}
      <Route path="/debug/email-pack" element={<EmailPackRedirect />} />
      <Route path="/debug/email-pack/:templateId" element={<EmailPackRedirect />} />
      <Route path="/control/debug/email-pack" element={<EmailPackRedirect />} />
      <Route path="/control/debug/email-pack/:templateId" element={<EmailPackRedirect />} />
      <Route path="/control/debug/capture-auth" element={<CaptureAuthRedirect />} />
      <Route path="/debug/capture-auth" element={<CaptureAuthRedirect />} />
      <Route path="*" element={<Site00FallbackRedirect />} />
    </Routes>
  );
}
