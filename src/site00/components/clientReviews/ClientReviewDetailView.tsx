import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  ClientReviewDetail,
  ClientReviewViewport,
} from '../../../../shared/site00-client-reviews/types.js';
import { clientReviewQueuePath } from '../../../../shared/site00-client-reviews/client.js';
import { ClientRoomArrowIcon } from '../../icons/ClientProjectRoomNavIcons';

type ClientReviewDetailViewProps = {
  projectSlug: string;
  detail: ClientReviewDetail;
  onReload: () => void;
  onPostAction: (action: string, body: Record<string, unknown>) => Promise<unknown>;
};

const VIEWPORTS: ClientReviewViewport[] = ['MOBILE', 'TABLET', 'DESKTOP'];

export function ClientReviewDetailView({
  projectSlug,
  detail,
  onReload,
  onPostAction,
}: ClientReviewDetailViewProps) {
  const { review, versions, comments, annotations, decisionHistory, permissions } = detail;
  const currentVersion = versions.find((v) => v.isCurrent) ?? versions[0];
  const [viewport, setViewport] = useState<ClientReviewViewport>(
    review.availableViewports[0] ?? 'DESKTOP',
  );
  const [compareOn, setCompareOn] = useState(false);
  const [commentBody, setCommentBody] = useState('');
  const [revisionSummary, setRevisionSummary] = useState('');
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [pendingAnnotation, setPendingAnnotation] = useState<{ x: number; y: number } | null>(null);
  const [annotationNote, setAnnotationNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState(currentVersion?.versionId ?? '');

  const leftVersion = useMemo(() => {
    if (!review.compareLeftVersionId) return null;
    return versions.find((v) => v.versionId === review.compareLeftVersionId) ?? null;
  }, [review.compareLeftVersionId, versions]);

  const rightVersion = useMemo(() => {
    if (!review.compareRightVersionId) return null;
    return versions.find((v) => v.versionId === review.compareRightVersionId) ?? null;
  }, [review.compareRightVersionId, versions]);

  async function handleCommentSubmit() {
    if (!commentBody.trim() || !currentVersion) return;
    setBusy(true);
    setMessage(null);
    try {
      await onPostAction('comment', {
        reviewId: review.reviewId,
        versionId: currentVersion.versionId,
        viewport,
        body: commentBody,
      });
      setCommentBody('');
      setMessage('Comment received.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not save comment.');
    } finally {
      setBusy(false);
    }
  }

  async function handleAnnotationSubmit() {
    if (!pendingAnnotation || !currentVersion) return;
    setBusy(true);
    try {
      await onPostAction('annotation', {
        reviewId: review.reviewId,
        versionId: currentVersion.versionId,
        viewport,
        xPercent: pendingAnnotation.x,
        yPercent: pendingAnnotation.y,
        body: annotationNote.trim() || undefined,
      });
      setPendingAnnotation(null);
      setAnnotationNote('');
      setMessage('Annotation saved.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not save annotation.');
    } finally {
      setBusy(false);
    }
  }

  async function handleApprove() {
    if (!currentVersion) return;
    setBusy(true);
    try {
      await onPostAction('approve', {
        reviewId: review.reviewId,
        versionId: currentVersion.versionId,
        expectedVersionId: currentVersion.versionId,
        requestId: `approve-${review.reviewId}-${Date.now()}`,
      });
      setShowApproveConfirm(false);
      setMessage('Approved.');
      onReload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Approval failed.');
    } finally {
      setBusy(false);
    }
  }

  async function handleRevision() {
    if (!currentVersion || !revisionSummary.trim()) return;
    setBusy(true);
    try {
      await onPostAction('revision', {
        reviewId: review.reviewId,
        versionId: currentVersion.versionId,
        expectedVersionId: currentVersion.versionId,
        requestId: `revision-${review.reviewId}-${Date.now()}`,
        summary: revisionSummary,
        commentIds: comments.map((c) => c.commentId),
        annotationIds: annotations.map((a) => a.annotationId),
      });
      setRevisionSummary('');
      setMessage('Revision request received.');
      onReload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Revision request failed.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDecline() {
    if (!currentVersion) return;
    setBusy(true);
    try {
      await onPostAction('decline', {
        reviewId: review.reviewId,
        versionId: currentVersion.versionId,
        expectedVersionId: currentVersion.versionId,
        requestId: `decline-${review.reviewId}-${Date.now()}`,
      });
      setMessage('Direction declined.');
      onReload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Decline failed.');
    } finally {
      setBusy(false);
    }
  }

  async function handleRevisit(versionId: string) {
    setBusy(true);
    try {
      await onPostAction('revisit', { reviewId: review.reviewId, versionId });
      setMessage('Request to revisit this version was sent to SITE 00.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Request failed.');
    } finally {
      setBusy(false);
    }
  }

  function renderPreviewPane(label: string, versionId: string | null | undefined, interactive: boolean) {
    const version = versions.find((v) => v.versionId === versionId);
    const ann = interactive
      ? annotations.filter((a) => a.versionId === versionId && a.viewport === viewport)
      : [];
    return (
      <div className="site00-cpr-review-preview-pane">
        <div className="site00-cpr-review-preview-pane__label">{label}</div>
        <div
          className={`site00-cpr-review-preview-canvas${interactive && permissions.canAnnotate ? ' is-interactive' : ''}`}
          onClick={
            interactive && permissions.canAnnotate
              ? (e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setPendingAnnotation({
                    x: ((e.clientX - rect.left) / rect.width) * 100,
                    y: ((e.clientY - rect.top) / rect.height) * 100,
                  });
                }
              : undefined
          }
          role={interactive && permissions.canAnnotate ? 'button' : undefined}
          tabIndex={interactive && permissions.canAnnotate ? 0 : undefined}
        >
          <span className="site00-cpr-moment__placeholder">
            {version?.previewAssetUrl ? (
              <img src={version.previewAssetUrl} alt={version.previewAssetAlt} />
            ) : (
              `${label} · ${viewport}`
            )}
          </span>
          {ann.map((a) => (
            <button
              key={a.annotationId}
              type="button"
              className="site00-cpr-annotation-marker"
              style={{ left: `${a.xPercent}%`, top: `${a.yPercent}%` }}
              aria-label={`Annotation ${a.markerIndex}`}
            >
              {a.markerIndex}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const showDecisionPanel =
    permissions.canApprove || permissions.canRequestRevision || permissions.canDecline;

  return (
    <div className="site00-cpr-review-detail">
      <div className="site00-cpr-review-detail__back">
        <Link to={clientReviewQueuePath(projectSlug)}>← BACK TO REVIEWS</Link>
      </div>

      <header className="site00-cpr-header site00-cpr-review-detail__header">
        <div className="site00-cpr-header__eyebrow">{review.phaseLabel}</div>
        <h1 className="site00-cpr-header__title">{review.title}</h1>
        <div className="site00-cpr-header__meta">{review.statusLabel} · {review.versionLabel}</div>
        {review.subtitle ? <p className="site00-cpr-review-detail__subtitle">{review.subtitle}</p> : null}
      </header>

      <div className="site00-cpr-review-toolbar">
        <div className="site00-cpr-review-viewports">
          {VIEWPORTS.filter((v) => review.availableViewports.includes(v)).map((v) => (
            <button
              key={v}
              type="button"
              className={`site00-cpr-review-viewport-btn${viewport === v ? ' is-active' : ''}`}
              onClick={() => setViewport(v)}
            >
              {v}
            </button>
          ))}
        </div>
        {review.compareAvailable ? (
          <button
            type="button"
            className={`site00-cpr-btn site00-cpr-btn--ghost${compareOn ? ' is-active' : ''}`}
            onClick={() => setCompareOn((v) => !v)}
          >
            COMPARE
          </button>
        ) : null}
      </div>

      <div className={`site00-cpr-review-compare${compareOn ? ' is-compare-on' : ''}`}>
        {compareOn && leftVersion && rightVersion ? (
          <>
            {renderPreviewPane(review.compareLeftLabel ?? 'PREVIOUS', leftVersion.versionId, false)}
            {renderPreviewPane(review.compareRightLabel ?? 'CURRENT', rightVersion.versionId, true)}
          </>
        ) : (
          renderPreviewPane('CURRENT', currentVersion?.versionId, true)
        )}
      </div>

      {pendingAnnotation && permissions.canAnnotate ? (
        <div className="site00-cpr-annotation-form">
          <div className="site00-cpr-panel__title">ADD ANNOTATION NOTE</div>
          <textarea
            value={annotationNote}
            onChange={(e) => setAnnotationNote(e.target.value)}
            placeholder="Leave a note for this spot…"
            rows={3}
          />
          <div className="site00-cpr-annotation-form__actions">
            <button type="button" className="site00-cpr-btn site00-cpr-btn--ghost" onClick={() => setPendingAnnotation(null)}>
              CANCEL
            </button>
            <button type="button" className="site00-cpr-btn" disabled={busy} onClick={() => void handleAnnotationSubmit()}>
              SAVE ANNOTATION
            </button>
          </div>
        </div>
      ) : null}

      <div className="site00-cpr-review-detail-grid">
        <section className="site00-cpr-panel">
          <div className="site00-cpr-panel__head">
            <h2 className="site00-cpr-panel__title">COMMENTS</h2>
          </div>
          <div className="site00-cpr-panel__body">
            {comments.length === 0 ? (
              <p className="site00-cpr-review-empty-copy">No comments yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c.commentId} className="site00-cpr-review-comment">
                  <div className="site00-cpr-review-comment__meta">
                    {c.viewport ?? 'ALL'} · {c.clientStatus}
                  </div>
                  <div>{c.body}</div>
                </div>
              ))
            )}
            {permissions.canComment && review.status !== 'APPROVED' ? (
              <div className="site00-cpr-review-comment-form">
                <textarea
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Leave feedback for SITE 00…"
                  rows={3}
                />
                <button type="button" className="site00-cpr-btn site00-cpr-btn--ghost" disabled={busy} onClick={() => void handleCommentSubmit()}>
                  POST COMMENT
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="site00-cpr-review-rail">
          <section className="site00-cpr-panel">
            <div className="site00-cpr-panel__head">
              <h2 className="site00-cpr-panel__title">VERSION HISTORY</h2>
            </div>
            <div className="site00-cpr-panel__body site00-cpr-version-list">
              {versions.map((v) => (
                <div key={v.versionId} className={`site00-cpr-version-item${v.isCurrent ? ' is-current' : ''}`}>
                  <button type="button" className="site00-cpr-version-item__btn" onClick={() => setSelectedVersionId(v.versionId)}>
                    <strong>{v.label}</strong>
                    {v.isCurrent ? <span className="site00-cpr-accent"> CURRENT</span> : null}
                    <div className="site00-cpr-version-item__summary">{v.clientSummary}</div>
                  </button>
                  {!v.isCurrent && permissions.canRequestRevisit ? (
                    <button
                      type="button"
                      className="site00-cpr-panel__link"
                      onClick={() => void handleRevisit(v.versionId)}
                    >
                      REQUEST TO REVISIT
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section className="site00-cpr-panel">
            <div className="site00-cpr-panel__head">
              <h2 className="site00-cpr-panel__title">DECISION HISTORY</h2>
            </div>
            <div className="site00-cpr-panel__body">
              {decisionHistory.map((ev) => (
                <div key={ev.id} className="site00-cpr-activity__item">
                  <div className="site00-cpr-activity__date">{ev.dateLabel}</div>
                  <div className="site00-cpr-activity__text">{ev.summary}</div>
                </div>
              ))}
            </div>
          </section>

          {showDecisionPanel && ['READY_FOR_REVIEW', 'AWAITING_CLIENT'].includes(review.status) ? (
            <section className="site00-cpr-review-decision site00-cpr-review-decision--sticky">
              <div className="site00-cpr-panel__title">YOUR DECISION</div>
              {review.approvalConsequences && showApproveConfirm ? (
                <div className="site00-cpr-approval-consequence">
                  <strong>APPROVE {review.title}?</strong>
                  <p>{review.approvalConsequences.label}</p>
                  <ul>
                    {review.approvalConsequences.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className="site00-cpr-review-decision__actions">
                    <button type="button" className="site00-cpr-btn" disabled={busy} onClick={() => void handleApprove()}>
                      CONFIRM APPROVAL
                    </button>
                    <button type="button" className="site00-cpr-btn site00-cpr-btn--ghost" onClick={() => setShowApproveConfirm(false)}>
                      CANCEL
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {permissions.canApprove ? (
                    <button type="button" className="site00-cpr-btn" onClick={() => setShowApproveConfirm(true)}>
                      APPROVE
                      <ClientRoomArrowIcon size={12} />
                    </button>
                  ) : null}
                  {permissions.canRequestRevision ? (
                    <div className="site00-cpr-revision-form">
                      <textarea
                        value={revisionSummary}
                        onChange={(e) => setRevisionSummary(e.target.value)}
                        placeholder="Describe what should change…"
                        rows={3}
                      />
                      <button type="button" className="site00-cpr-btn site00-cpr-btn--ghost" disabled={busy} onClick={() => void handleRevision()}>
                        REQUEST REVISION
                      </button>
                    </div>
                  ) : null}
                  {permissions.canDecline ? (
                    <button type="button" className="site00-cpr-btn site00-cpr-btn--ghost" disabled={busy} onClick={() => void handleDecline()}>
                      DECLINE DIRECTION
                    </button>
                  ) : null}
                </>
              )}
            </section>
          ) : review.status === 'APPROVED' ? (
            <section className="site00-cpr-review-decision site00-cpr-review-decision--approved">
              <div className="site00-cpr-panel__title">APPROVED</div>
              <p>This review has been approved.</p>
            </section>
          ) : review.status === 'REVISION_IN_PROGRESS' ? (
            <section className="site00-cpr-review-decision">
              <div className="site00-cpr-panel__title">REVISION IN PROGRESS</div>
              <p>SITE 00 is working on your revision. Nothing is needed from you right now.</p>
            </section>
          ) : null}
        </aside>
      </div>

      {message ? <div className="site00-cpr-review-message" role="status">{message}</div> : null}
      {selectedVersionId && selectedVersionId !== currentVersion?.versionId ? (
        <div className="site00-cpr-review-version-banner">
          Viewing {versions.find((v) => v.versionId === selectedVersionId)?.label} — restore is not available; use REQUEST TO REVISIT.
        </div>
      ) : null}
    </div>
  );
}
