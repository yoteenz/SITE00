import React from 'react';
import { createPortal } from 'react-dom';
import { acquireLoadingScreenDocumentLock } from '../../platform-stabilization/loadingScreenLock';
import {
  DEFAULT_MAX_LOADING_MS,
  forceLoadingTerminalRecovery,
  getActiveLoadingSources,
  registerLoadingTerminal,
} from '../../platform-stabilization/loadingTerminalRegistry';

type LoadingScreenProps = {
  source?: string;
  maxDurationMs?: number;
};

function useLockPageScroll(active: boolean) {
  React.useEffect(() => {
    if (!active || typeof document === 'undefined') return;
    return acquireLoadingScreenDocumentLock();
  }, [active]);
}

/** SITE 00 admin route suspense fallback — minimal spinner shell. */
export default function LoadingScreen({
  source = 'LoadingScreen',
  maxDurationMs = DEFAULT_MAX_LOADING_MS,
}: LoadingScreenProps = {}) {
  const [isVisible, setIsVisible] = React.useState(true);
  useLockPageScroll(isVisible);

  React.useEffect(() => {
    const unregister = registerLoadingTerminal(source, maxDurationMs);
    const timer = window.setTimeout(() => {
      const stuck = getActiveLoadingSources();
      void forceLoadingTerminalRecovery(
        stuck.length > 0 ? stuck : [{ id: source, label: source, since: Date.now() - maxDurationMs }],
        `LoadingScreen:${source}`,
      );
      setIsVisible(false);
    }, maxDurationMs);
    return () => {
      window.clearTimeout(timer);
      unregister();
    };
  }, [source, maxDurationMs]);

  if (!isVisible) return null;

  return createPortal(
    <div
      className="loading-screen-root"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483000,
        display: 'grid',
        placeItems: 'center',
        background: '#ffffff',
      }}
      aria-busy="true"
      aria-label="Loading"
    >
      <div
        style={{
          width: 48,
          height: 48,
          border: '2px solid #eee',
          borderTopColor: '#eb1c24',
          borderRadius: '50%',
          animation: 'site00-spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes site00-spin { to { transform: rotate(360deg); } }`}</style>
    </div>,
    document.body,
  );
}
