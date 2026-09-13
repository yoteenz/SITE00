import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ensureAuthRestoredFromBackup, persistAuthBackup } from './utils/adminAuth';
import { restoreSupabaseSessionFromCookie } from './utils/supabase';
import {
  dispatchSite00ForceRevealLoader,
  teardownSite00BootShellAfterReactMount,
} from './site00/components/loader/site00ForceRevealAfterMount';

ensureAuthRestoredFromBackup();
restoreSupabaseSessionFromCookie();
persistAuthBackup();

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Missing #root element');
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

queueMicrotask(() => {
  teardownSite00BootShellAfterReactMount();
});

if (typeof window !== 'undefined') {
  window.setTimeout(() => teardownSite00BootShellAfterReactMount(), 250);
  window.setTimeout(() => dispatchSite00ForceRevealLoader('post-mount-2s'), 2000);
  window.setTimeout(() => dispatchSite00ForceRevealLoader('post-mount-6s'), 6000);
}
