import { useEffect, useState, type ReactNode } from 'react';
import { resolveAsstsSlot } from '../services/asstsApi';
import type { AsstsEnvironmentSlot } from '../config/slots';

type AsstsEnvironmentShellProps = {
  slotKey: AsstsEnvironmentSlot;
  children: ReactNode;
};

const FALLBACK_CLASS: Record<string, string> = {
  'assts.library.environment.mobile': 'site00-assts-env-fallback--library',
  'assts.batch.environment.mobile': 'site00-assts-env-fallback--batch',
  'assts.inspection.environment.mobile': 'site00-assts-env-fallback--inspection',
};

export function AsstsEnvironmentShell({ slotKey, children }: AsstsEnvironmentShellProps) {
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [source, setSource] = useState<'locked' | 'fallback'>('fallback');

  useEffect(() => {
    let cancelled = false;
    resolveAsstsSlot(slotKey)
      .then((res) => {
        if (cancelled) return;
        setSource(res.resolved.source);
        setBgUrl(res.resolved.url);
      })
      .catch(() => {
        if (!cancelled) {
          setSource('fallback');
          setBgUrl(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slotKey]);

  const fallbackClass = FALLBACK_CLASS[slotKey] ?? 'site00-assts-env-fallback--library';

  return (
    <div className="site00-assts-shell" data-env-source={source}>
      <div
        className={`site00-assts-env-layer ${bgUrl ? '' : fallbackClass}`}
        aria-hidden="true"
        style={
          bgUrl
            ? {
                backgroundImage: `url("${bgUrl.replace(/"/g, '\\"')}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
              }
            : undefined
        }
      />
      <div className="site00-assts-env-veil" aria-hidden="true" />
      <div className="site00-assts-ui">{children}</div>
    </div>
  );
}
