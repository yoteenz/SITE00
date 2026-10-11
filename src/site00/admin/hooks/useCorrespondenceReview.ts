import { useCallback, useEffect, useState } from 'react';
import {
  addVersionComment,
  getVersionReview,
  setVersionReviewState,
  type StoredReviewBundle,
} from '../../../../shared/site00-correspondence-studio/review/repositoryReviewStore.js';
import type { ReviewState } from '../../../../shared/site00-correspondence-studio/types.js';

export function useCorrespondenceReview(templateId: string, versionId: string, fallback: ReviewState) {
  const [bundle, setBundle] = useState<StoredReviewBundle>(() => getVersionReview(templateId, versionId, fallback));

  useEffect(() => {
    setBundle(getVersionReview(templateId, versionId, fallback));
  }, [templateId, versionId, fallback]);

  const setReviewState = useCallback(
    (state: ReviewState, note?: string) => {
      setBundle(setVersionReviewState(templateId, versionId, state, 'founder', note));
    },
    [templateId, versionId],
  );

  const comment = useCallback(
    (body: string) => {
      setBundle(addVersionComment(templateId, versionId, body, 'internal'));
    },
    [templateId, versionId],
  );

  return { bundle, setReviewState, comment };
}
