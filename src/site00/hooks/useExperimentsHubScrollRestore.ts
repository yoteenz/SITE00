import { useEffect } from 'react';
import {
  readExperimentsHubScrollY,
  restoreExperimentsHubScrollY,
  writeExperimentsHubScrollY,
} from '../utils/experimentsHubScrollRestore';

/** Persist + restore experiments hub scroll position across refresh and hub round-trips. */
export function useExperimentsHubScrollRestore(projectSlug: string): void {
  useEffect(() => {
    if (!projectSlug) return;

    const saved = readExperimentsHubScrollY(projectSlug);
    if (saved != null && saved > 0) {
      restoreExperimentsHubScrollY(saved);
    }

    let debounce: ReturnType<typeof setTimeout> | undefined;

    const persist = () => {
      writeExperimentsHubScrollY(projectSlug, window.scrollY);
    };

    const onScroll = () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(persist, 120);
    };

    const onPageHide = () => persist();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', onPageHide);

    return () => {
      if (debounce) clearTimeout(debounce);
      persist();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [projectSlug]);
}
