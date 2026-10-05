/**
 * On DESIGN workspace mount, pull latest QA-passed implementation snapshots from the API
 * (Supabase-backed registry) into page-scoped localStorage captures.
 */

import { useEffect } from 'react';

import { ensurePageConceptSourceCaptures } from '../../../services/designPageCaptureHydrateClient.js';

export function useHydrateDesignPageCaptures(projectId: string, pageId: string, screenId: string) {
  useEffect(() => {
    let cancelled = false;

    const run = () => {
      void ensurePageConceptSourceCaptures(projectId, pageId, screenId).then(() => {
        if (cancelled || typeof window === 'undefined') return;
        window.dispatchEvent(
          new CustomEvent('site00:page-concept-captures-hydrated', { detail: { projectId, pageId } }),
        );
      });
    };

    run();
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', run);
    }
    return () => {
      cancelled = true;
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', run);
      }
    };
  }, [pageId, projectId, screenId]);
}
