import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  ClientReviewDetail,
  ClientReviewViewport,
} from '../../../../shared/site00-client-reviews/types.js';
import { AppPrimaryButton, AppSecondaryButton } from './Site00ClientAppShell';
import { ClientRoomArrowIcon } from '../../icons/ClientProjectRoomNavIcons';

export type ClientAppReviewMode =
  | 'detail'
  | 'compare'
  | 'comments'
  | 'annotations'
  | 'approve'
  | 'revision'
  | 'history';

type ClientAppReviewDetailViewProps = {
  detail: ClientReviewDetail;
  mode: ClientAppReviewMode;
  paths: {
    queue: string;
    review: (sub?: string) => string;
  };
  onReload: () => void;
  onPostAction: (action: string, body: Record<string, unknown>) => Promise<unknown>;
};

const VIEWPORTS: ClientReviewViewport[] = ['MOBILE', 'TABLET', 'DESKTOP'];

export function resolveReviewModeFromPath(pathname: string): ClientAppReviewMode {
  if (pathname.endsWith('/compare')) return 'compare';
  if (pathname.endsWith('/comments')) return 'comments';
  if (pathname.endsWith('/annotations')) return 'annotations';
  if (pathname.endsWith('/approve')) return 'approve';
  if (pathname.endsWith('/revision')) return 'revision';
  if (pathname.endsWith('/history')) return 'history';
  return 'detail';
}

export function ClientAppReviewDetailView({
  detail,
  mode,
  paths,
  onReload,
  onPostAction,
}: ClientAppReviewDetailViewProps) {
  const { review, versions, comments, annotations, decisionHistory, permissions } = detail;
  const currentVersion = versions.find((v) => v.isCurrent) ?? versions[0];
  const [viewport, setViewport] = useState<ClientReviewViewport>(
    review.availableViewports[0] ?? 'DESKTOP',
  );
  const [commentBody, setCommentBody] = useState('');
  const [revisionSummary, setRevisionSummary] = useState('');
  const [pendingAnnotation, setPendingAnnotation] = useState<{ x: number; y: number } | null>(null);
  const [annotationNote, setAnnotationNote] = useState('');
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(
    annotations[0]?.annotationId ?? null,
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
      onReload();
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
      onReload();
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

  function renderPreviewPane(
    label: string,
    versionId: string | null | undefined,
    interactive: boolean,
    showMarkers: boolean,
  ) {
    const version = versions.find((v) => v.versionId === versionId);
    const ann = showMarkers
      ? annotations.filter((a) => a.versionId === versionId && a.viewport === viewport)
      : [];

    return (
      <div className="site00-app-review-preview">
        <div className="site00-app-review-preview__label">{label}</div>
        <div
          className={`site00-app-review-preview__canvas${interactive && permissions.canAnnotate ? ' is-interactive' : ''}`}
          onClick={
            interactive && permissions.canAnnotate && mode === 'annotations'
              ? (e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setPendingAnnotation({
                    x: ((e.clientX - rect.left) / rect.width) * 100,
                    y: ((e.clientY - rect.top) / rect.height) * 100,
                  });
                }
              : undefined
          }
          role={interactive && permissions.canAnnotate && mode === 'annotations' ? 'button' : undefined}
          tabIndex={interactive && permissions.canAnnotate && mode === 'annotations' ? 0 : undefined}
        >
          {version?.previewAssetUrl ? (
            <img src={version.previewAssetUrl} alt={version.previewAssetAlt} />
          ) : (
            <span className="site00-app-review-preview__placeholder">
              {label} · {viewport}
            </span>
          )}
          {ann.map((a) => (
            <button
              key={a.annotationId}
              type="button"
              className={`site00-app-annotation-marker${selectedAnnotationId === a.annotationId ? ' is-selected' : ''}`}
              style={{ left: `${a.xPercent}%`, top: `${a.yPercent}%` }}
              aria-label={`Annotation ${a.markerIndex}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAnnotationId(a.annotationId);
              }}
            >
              {a.markerIndex}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const compareActive = mode === 'compare';
  const showAnnotationMarkers = mode === 'annotations';

  return (
    <div className={`site00-app-review-detail site00-app-review-detail--${mode}`}>
      <div className="site00-app-review-detail__back">
        <Link to={paths.queue}>← BACK TO REVIEWS</Link>
      </div>

      <header className="site00-app-review-detail__header">
        <div className="site00-app-review-detail__eyebrow">{review.phaseLabel}</div>
        <h1 className="site00-app-review-detail__title">{review.title}</h1>
        <div className="site00-app-review-detail__meta">
          {review.statusLabel} · {review.versionLabel}
        </div>
      </header>

      {mode !== 'approve' && mode !== 'revision' && mode !== 'history' ? (
        <>
          <div className="site00-app-review-toolbar">
            <div className="site00-app-review-viewports">
              {VIEWPORTS.filter((v) => review.availableViewports.includes(v)).map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`site00-app-review-viewport-btn${viewport === v ? ' is-active' : ''}`}
                  onClick={() => setViewport(v)}
                >
                  {v}
                </button>
              ))}
            </div>
            {review.compareAvailable ? (
              <Link
                to={compareActive ? paths.review() : paths.review('compare')}
                className={`site00-app-review-mode-link${compareActive ? ' is-active' : ''}`}
              >
                COMPARE
              </Link>
            ) : null}
          </div>

          <div className={`site00-app-review-compare${compareActive ? ' is-compare-on' : ''}`}>
            {compareActive && leftVersion && rightVersion ? (
              <>
                {renderPreviewPane(review.compareLeftLabel ?? 'PREVIOUS', leftVersion.versionId, false, false)}
                {renderPreviewPane(review.compareRightLabel ?? 'CURRENT', rightVersion.versionId, true, showAnnotationMarkers)}
              </>
            ) : (
              renderPreviewPane('CURRENT', currentVersion?.versionId, true, showAnnotationMarkers)
            )}
          </div>
        </>
      ) : null}

      {mode === 'comments' ? (
        <section className="site00-app-review-panel">
          <h2 className="site00-app-section-label">COMMENTS</h2>
          <div className="site00-app-review-comments">
            {comments.length === 0 ? (
              <p className="site00-app-review-empty">No comments yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c.commentId} className="site00-app-review-comment">
                  <div className="site00-app-review-comment__meta">
                    {c.authorRole === 'CLIENT_OWNER' ? 'YOU' : 'SITE 00'} · {c.viewport ?? 'ALL'}
                  </div>
                  <div>{c.body}</div>
                </div>
              ))
            )}
          </div>
          {permissions.canComment && review.status !== 'APPROVED' ? (
            <div className="site00-app-review-composer site00-app-review-composer--sticky">
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Leave feedback for SITE 00…"
                rows={3}
              />
              <AppPrimaryButton disabled={busy} onClick={() => void handleCommentSubmit()}>
                POST COMMENT
              </AppPrimaryButton>
            </div>
          ) : null}
        </section>
      ) : null}

      {mode === 'annotations' ? (
        <section className="site00-app-review-panel">
          <h2 className="site00-app-section-label">ANNOTATIONS</h2>
          <ul className="site00-app-annotation-list">
            {annotations.map((a) => {
              const linked = comments.find((c) => c.annotationId === a.annotationId);
              return (
                <li
                  key={a.annotationId}
                  className={`site00-app-annotation-list__item${selectedAnnotationId === a.annotationId ? ' is-selected' : ''}`}
                >
                  <button type="button" onClick={() => setSelectedAnnotationId(a.annotationId)}>
                    <span className="site00-app-annotation-list__index">{a.markerIndex}</span>
                    <span>{linked?.body ?? `Marker ${a.markerIndex} on ${a.viewport}`}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {pendingAnnotation && permissions.canAnnotate ? (
            <div className="site00-app-review-composer">
              <textarea
                value={annotationNote}
                onChange={(e) => setAnnotationNote(e.target.value)}
                placeholder="Add a note for this spot…"
                rows={2}
              />
              <div className="site00-app-review-composer__actions">
                <AppSecondaryButton onClick={() => setPendingAnnotation(null)}>CANCEL</AppSecondaryButton>
                <AppPrimaryButton disabled={busy} onClick={() => void handleAnnotationSubmit()}>
                  SAVE ANNOTATION
                </AppPrimaryButton>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {mode === 'approve' && review.approvalConsequences ? (
        <section className="site00-app-review-panel site00-app-approval-panel">
          <h2 className="site00-app-section-label">WHAT MOVES FORWARD</h2>
          <AppCardApproval review={review} consequences={review.approvalConsequences} />
          <div className="site00-app-review-decision site00-app-review-decision--sticky">
            <AppPrimaryButton disabled={busy} onClick={() => void handleApprove()}>
              YES, APPROVE
            </AppPrimaryButton>
            <Link to={paths.review()} className="site00-app-link-cta">
              CANCEL
            </Link>
          </div>
        </section>
      ) : null}

      {mode === 'revision' ? (
        <section className="site00-app-review-panel">
          <h2 className="site00-app-section-label">REQUEST REVISION</h2>
          <textarea
            className="site00-app-revision-field"
            value={revisionSummary}
            onChange={(e) => setRevisionSummary(e.target.value)}
            placeholder="Describe what should change…"
            rows={4}
          />
          {(comments.length > 0 || annotations.length > 0) && (
            <>
              <h3 className="site00-app-section-label">LINKED FEEDBACK</h3>
              <ul className="site00-app-revision-links">
                {comments.map((c) => (
                  <li key={c.commentId}>{c.body}</li>
                ))}
                {annotations.map((a) => (
                  <li key={a.annotationId}>Annotation {a.markerIndex}</li>
                ))}
              </ul>
            </>
          )}
          <div className="site00-app-review-decision site00-app-review-decision--sticky">
            <AppPrimaryButton disabled={busy || !revisionSummary.trim()} onClick={() => void handleRevision()}>
              SUBMIT REQUEST
            </AppPrimaryButton>
            <Link to={paths.review()} className="site00-app-link-cta">
              CANCEL
            </Link>
          </div>
        </section>
      ) : null}

      {mode === 'history' ? (
        <section className="site00-app-review-panel">
          <h2 className="site00-app-section-label">VERSION HISTORY</h2>
          <ul className="site00-app-version-list">
            {versions.map((v) => (
              <li key={v.versionId} className={`site00-app-version-list__item${v.isCurrent ? ' is-current' : ''}`}>
                <div className="site00-app-version-list__head">
                  <strong>{v.label}</strong>
                  {v.isCurrent ? <span className="site00-app-accent"> CURRENT</span> : null}
                </div>
                <p>{v.clientSummary}</p>
                {!v.isCurrent && permissions.canRequestRevisit ? (
                  <button type="button" className="site00-app-link-cta" onClick={() => void handleRevisit(v.versionId)}>
                    REQUEST TO REVISIT
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
          {decisionHistory.length > 0 ? (
            <>
              <h2 className="site00-app-section-label">DECISION HISTORY</h2>
              <ul className="site00-app-activity">
                {decisionHistory.map((ev) => (
                  <li key={ev.id}>
                    <span className="site00-app-activity__time">{ev.dateLabel}</span>
                    <span>{ev.summary}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      ) : null}

      {mode === 'detail' ? (
        <nav className="site00-app-review-subnav" aria-label="Review actions">
          <Link to={paths.review('comments')} className="site00-app-subnav__link">
            COMMENTS
          </Link>
          <Link to={paths.review('annotations')} className="site00-app-subnav__link">
            ANNOTATIONS
          </Link>
          <Link to={paths.review('history')} className="site00-app-subnav__link">
            HISTORY
          </Link>
        </nav>
      ) : null}

      {mode === 'detail' && permissions.canApprove ? (
        <div className="site00-app-review-actions">
          {permissions.canRequestRevision ? (
            <Link to={paths.review('revision')} className="site00-app-btn site00-app-btn--secondary">
              REQUEST REVISION
            </Link>
          ) : null}
          <Link to={paths.review('approve')} className="site00-app-btn site00-app-btn--primary">
            APPROVE
            <ClientRoomArrowIcon size={12} />
          </Link>
        </div>
      ) : null}

      {message ? (
        <div className="site00-app-review-message" role="status">
          {message}
        </div>
      ) : null}
    </div>
  );
}

function AppCardApproval({
  review,
  consequences,
}: {
  review: ClientReviewDetail['review'];
  consequences: NonNullable<ClientReviewDetail['review']['approvalConsequences']>;
}) {
  return (
    <div className="site00-app-card site00-app-approval-card">
      <strong>APPROVE {review.title}?</strong>
      <p>{consequences.label}</p>
      <ul>
        {consequences.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
