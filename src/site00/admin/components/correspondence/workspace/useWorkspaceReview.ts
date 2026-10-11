import { useCallback, useMemo, useState } from 'react';
import { planClientDelivery } from '../../../../../../shared/site00-correspondence-studio/delivery/planClientDelivery.js';
import {
  addVersionComment,
  getVersionReview,
  readReviewStore,
  setVersionReviewState,
  type StoredReviewBundle,
} from '../../../../../../shared/site00-correspondence-studio/review/repositoryReviewStore.js';
import type {
  CorrespondenceWorkspaceManifest,
  EmailTemplateVersion,
  ReviewState,
} from '../../../../../../shared/site00-correspondence-studio/types.js';

export type ClientDeliverySummary = {
  approved: string[];
  rejected: string[];
  total: number;
  scopeLabel: string;
};

/** Review decisions over the existing repository-backed session store (no database write). */
export function useWorkspaceReview(manifest: CorrespondenceWorkspaceManifest) {
  const [revision, setRevision] = useState(0);
  const bump = useCallback(() => setRevision((n) => n + 1), []);

  const stateOf = useCallback(
    (templateId: string, version: EmailTemplateVersion): ReviewState =>
      getVersionReview(templateId, version.version_id, version.review_state).review_state,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [revision],
  );

  const bundleOf = useCallback(
    (templateId: string, version: EmailTemplateVersion): StoredReviewBundle =>
      getVersionReview(templateId, version.version_id, version.review_state),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [revision],
  );

  const setState = useCallback(
    (templateId: string, version: EmailTemplateVersion, state: ReviewState, note?: string) => {
      setVersionReviewState(templateId, version.version_id, state, 'founder', note);
      bump();
    },
    [bump],
  );

  const comment = useCallback(
    (templateId: string, version: EmailTemplateVersion, body: string) => {
      addVersionComment(templateId, version.version_id, body, 'internal', version.review_state);
      bump();
    },
    [bump],
  );

  const deliveryFor = useCallback(
    (campaignId: string | null): ClientDeliverySummary | null => {
      if (!campaignId) return null;
      const version_states: Record<string, ReviewState> = {};
      for (const [key, bundle] of Object.entries(readReviewStore())) version_states[key] = bundle.review_state;
      try {
        const { emails, plan, rejected_unapproved } = planClientDelivery({
          manifest,
          campaign_id: campaignId,
          package_slug: campaignId.toUpperCase(),
          version_states,
          assets: {},
        });
        return {
          approved: emails.map((e) => e.template_id),
          rejected: rejected_unapproved,
          total: emails.length + rejected_unapproved.length,
          scopeLabel: plan.design_only_label ?? plan.scope.replace(/_/g, ' ').toUpperCase(),
        };
      } catch {
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [manifest, revision],
  );

  return useMemo(
    () => ({ revision, stateOf, bundleOf, setState, comment, deliveryFor }),
    [revision, stateOf, bundleOf, setState, comment, deliveryFor],
  );
}
