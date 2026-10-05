import { useEffect, useState } from 'react';

/** Loads `/release-manifest.json` for Technical details in the generation overlay. */
export function usePageConceptReleaseForensics(active: boolean): string {
  const [releaseForensics, setReleaseForensics] = useState('RELEASE —');

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    void fetch('/release-manifest.json', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((manifest: { releaseId?: string; commitSha?: string; bundleEntry?: string } | null) => {
        if (cancelled || !manifest) return;
        setReleaseForensics(
          `RELEASE ${manifest.releaseId ?? '—'}\nCOMMIT ${manifest.commitSha ?? '—'}\nBUNDLE ${manifest.bundleEntry ?? '—'}`,
        );
      })
      .catch(() => {
        if (!cancelled) setReleaseForensics('RELEASE — (manifest unavailable)');
      });
    return () => {
      cancelled = true;
    };
  }, [active]);

  return releaseForensics;
}
