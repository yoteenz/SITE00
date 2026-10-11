import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { DevicePreviewMode, ReviewState } from '../../../../../shared/site00-correspondence-studio/types.js';
import { DEVICE_PREVIEW_MODES } from '../../../../../shared/site00-correspondence-studio/types.js';
import { getCorrespondenceWorkspace } from '../../../../../shared/site00-correspondence-studio/workspace.js';
import { emailCanvasUsesSite00Dna, resolveBrandForCampaign } from '../../../../../shared/site00-correspondence-studio/brandFirewall.js';
import { CorrespondencePreviewPane } from '../../components/correspondence/CorrespondencePreviewPane';
import { ControlPageHeader } from '../../components/control/ControlPageHeader';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { useCorrespondenceReview } from '../../hooks/useCorrespondenceReview';

const REVIEW_ACTIONS: ReviewState[] = [
  'founder_review',
  'revision_required',
  'approved',
  'approved_with_revisions',
  'delivery_ready',
];

export default function CorrespondenceEmailReviewPage() {
  const { projectId = '', campaignId = '', templateId = '' } = useParams();
  const manifest = getCorrespondenceWorkspace();
  const entry = manifest.templates[templateId];
  const campaign = manifest.projects.flatMap((p) => p.campaigns).find((c) => c.campaign_id === campaignId);
  const [device, setDevice] = useState<DevicePreviewMode>('desktop');
  const [showInspector, setShowInspector] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');

  const version = useMemo(() => {
    if (!entry) return null;
    return entry.versions.find((v) => v.version_id === entry.current_version_id) ?? entry.versions[0];
  }, [entry]);

  const { bundle, setReviewState, comment } = useCorrespondenceReview(
    templateId,
    version?.version_id ?? 'unknown',
    version?.review_state ?? 'draft',
  );

  if (!entry || !version || !campaign) {
    return (
      <Site00AdminShell>
        <ControlPageHeader kicker="CORRESPONDENCE STUDIO" title="EMAIL NOT FOUND" />
        <Link to={SITE00_ADMIN_ROUTES.correspondenceCampaign(projectId, campaignId)}>← CAMPAIGN</Link>
      </Site00AdminShell>
    );
  }

  const brand = resolveBrandForCampaign(manifest, campaign.brand_authority_id);
  const canvasSite00 = emailCanvasUsesSite00Dna(brand);

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="CORRESPONDENCE STUDIO · READ AS RECIPIENT"
        title={entry.display_name}
        subtitle={`${entry.classification.toUpperCase()} · Version ${version.label}`}
        actions={
          <>
            <button type="button" className="site00-admin-btn" onClick={() => setShowInspector((v) => !v)}>
              {showInspector ? 'HIDE INTENT' : 'CREATIVE INTENT'}
            </button>
            <Link className="site00-admin-btn" to={SITE00_ADMIN_ROUTES.correspondenceCampaign(projectId, campaignId)}>
              ← INDEX
            </Link>
          </>
        }
      />

      <div className="cs-review-layout">
        <div className="cs-review-main">
          <div className="cs-device-bar">
            {DEVICE_PREVIEW_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                className={device === mode ? 'active' : ''}
                onClick={() => setDevice(mode)}
              >
                {mode.toUpperCase()}
              </button>
            ))}
            <span className="cs-muted cs-device-bar__brand">
              CANVAS BRAND · {canvasSite00 ? 'SITE 00 DNA' : brand.display_name}
            </span>
          </div>

          <CorrespondencePreviewPane previewSource={version.preview_source} device={device} />
        </div>

        {showInspector ? (
          <aside className="cs-review-drawer">
            <section>
              <h2>REVIEW STATE</h2>
              <p className="cs-review-state">{bundle.review_state.replace(/_/g, ' ').toUpperCase()}</p>
              <div className="cs-review-actions">
                {REVIEW_ACTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => setReviewState(s)}>
                    {s.replace(/_/g, ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </section>

            {version.editorial_register ? (
              <section>
                <h2>REGISTER</h2>
                <p>{version.editorial_register}</p>
              </section>
            ) : null}

            {version.editorial_intent_ref ? (
              <section>
                <h2>EDITORIAL INTENT</h2>
                <p className="cs-mono">{version.editorial_intent_ref}</p>
              </section>
            ) : null}

            {version.copy_ref ? (
              <section>
                <h2>COPY CONTRACT</h2>
                <p className="cs-mono">{version.copy_ref}</p>
              </section>
            ) : null}

            <section>
              <h2>FEEDBACK</h2>
              <textarea
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                rows={3}
                placeholder="Internal note (not included in client ZIP)"
              />
              <button
                type="button"
                className="site00-admin-btn"
                onClick={() => {
                  if (commentDraft.trim()) {
                    comment(commentDraft);
                    setCommentDraft('');
                  }
                }}
              >
                SAVE COMMENT
              </button>
              <ul className="cs-comment-list">
                {bundle.comments.map((c) => (
                  <li key={c.id}>
                    <time>{c.created_at.slice(0, 10)}</time> {c.body}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2>APPROVAL HISTORY</h2>
              <ul className="cs-comment-list">
                {bundle.approvals.map((a, i) => (
                  <li key={`${a.decided_at}-${i}`}>
                    {a.review_state.toUpperCase()} · {a.decided_at.slice(0, 19)}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2>DELIVERY</h2>
              <p className="cs-muted">
                Client ZIP exports require approved versions. Scope: {version.implementation_scope.replace(/_/g, ' ').toUpperCase()}.
              </p>
            </section>
          </aside>
        ) : null}
      </div>
    </Site00AdminShell>
  );
}
