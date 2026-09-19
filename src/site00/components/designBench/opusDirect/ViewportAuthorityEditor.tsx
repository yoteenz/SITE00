/**
 * P0.VR.DESIGN-AUTHORITY-WORKFLOW2 + P0.VR.DESIGN.OPUS-AI-CONSOLES1 —
 * the Viewport Authority console (founder + CGPT creative direction).
 *
 * This is the upstream authority-collaboration surface that feeds GPT2, not the
 * concept generator, so the console is built like a studio conversation: a
 * dominant reference preview, compact authority metadata, and a real thread
 * where the founder's messages, CGPT's replies and the visual options they
 * produced sit together. Mobile and desktop authorities are independent
 * objects and never share a reference — switching the tab switches the whole
 * authority, its thread and its version history.
 *
 * CGPT replies are fixtures in this build: the console says so rather than
 * implying a live model is answering.
 */

import { useCallback, useMemo, useRef, useState } from 'react';

import {
  resolveActiveAuthorityImage,
  type ViewportAuthorityReference,
} from '../../../../../shared/site00-design-workspace-production/designPageAuthorityWorkflow.js';
import {
  authorityDetailRows,
  authorityTags,
  authorityUploadRejection,
  AUTHORITY_CONSOLE_TABS,
  AUTHORITY_UPLOAD_FORMATS,
  formatClockTime,
} from '../../../../../shared/site00-design-workspace-production/designAiConsolePresentation.js';
import {
  AiConsoleButton,
  AiConsoleEmptyState,
  AiConsoleMeta,
  AiConsolePreview,
  AiConsoleSection,
  AiConsoleSectionAction,
  AiConsoleSurface,
  AiConsoleTab,
} from '../aiConsoles/AiConsoleShell';
import type { usePageAuthorityWorkflow } from './usePageAuthorityWorkflow';

type WorkflowApi = ReturnType<typeof usePageAuthorityWorkflow>;
type Viewport = 'MOBILE' | 'DESKTOP';

export function ViewportAuthorityEditor({
  viewport: initialViewport,
  reference,
  workflowApi,
  pageLabel,
  onClose,
  onFullscreen,
}: {
  viewport: Viewport;
  /** Kept for callers that resolve the reference themselves; the console re-reads per tab. */
  reference: ViewportAuthorityReference;
  workflowApi: WorkflowApi;
  pageLabel?: string;
  onClose: () => void;
  onFullscreen: (src: string, title: string, subtitle?: string) => void;
}) {
  const [viewport, setViewport] = useState<Viewport>(initialViewport);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState<{ name: string; dataUrl: string }[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null);
  const [editDetails, setEditDetails] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const active: ViewportAuthorityReference =
    viewport === 'MOBILE' ? workflowApi.workflow.mobileAuthority : workflowApi.workflow.desktopAuthority;
  const source = active ?? reference;

  const shownVersion =
    source.versions.find((version) => version.versionId === (previewVersionId ?? source.activeVersionId)) ??
    source.versions.at(-1) ??
    null;
  const image = previewVersionId ? shownVersion?.imageUrl ?? null : resolveActiveAuthorityImage(source);

  const detailRows = authorityDetailRows({
    pageLabel: pageLabel ?? source.pageId,
    conceptLabel: shownVersion?.label ?? null,
    viewport,
    versionLabel: shownVersion?.label ?? null,
    versionStatus: shownVersion?.status ?? null,
    createdAt: shownVersion?.createdAt ?? null,
    authorityId: source.authorityId,
    isInitial: source.versions.length <= 1,
  });

  const tags = authorityTags({
    viewport,
    hasMessages: source.messages.length > 0,
    isActive: shownVersion?.versionId === source.activeVersionId,
  });

  /** Visual options CGPT produced: versions created at or after each reply. */
  const optionsForMessage = useMemo(
    () => (messageAt: string) =>
      source.versions.filter(
        (version) => new Date(version.createdAt).getTime() >= new Date(messageAt).getTime() - 1000 && version.imageUrl,
      ),
    [source.versions],
  );

  const acceptFile = useCallback((file: File) => {
    const rejection = authorityUploadRejection(file);
    if (rejection) {
      setUploadError(rejection);
      return;
    }
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => setPending((prev) => [...prev, { name: file.name, dataUrl: String(reader.result ?? '') }]);
    reader.readAsDataURL(file);
  }, []);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text && pending.length === 0) return;
    if (pending.length > 0) {
      for (const attachment of pending) {
        workflowApi.appendChat(viewport, {
          role: 'founder',
          text: text || `Attached ${attachment.name}`,
          attachmentDataUrl: attachment.dataUrl,
        });
      }
    } else {
      workflowApi.appendChat(viewport, { role: 'founder', text });
    }
    workflowApi.appendChat(viewport, {
      role: 'cgpt',
      text: 'Fixture: noted. A new authority version was staged for your review (no live model spend).',
    });
    workflowApi.regenerateAuthorityFixture(viewport, text || `Reference upload (${pending.length})`);
    setDraft('');
    setPending([]);
    setPreviewVersionId(null);
  }, [draft, pending, viewport, workflowApi]);

  const saveDetails = useCallback(() => {
    const notes = notesDraft.trim();
    if (!notes) return;
    workflowApi.regenerateAuthorityFixture(viewport, notes);
    setEditDetails(false);
    setNotesDraft('');
    setPreviewVersionId(null);
  }, [notesDraft, viewport, workflowApi]);

  const sendDisabled = draft.trim().length === 0 && pending.length === 0;

  return (
    <AiConsoleSurface
      console="authority"
      testId="design-viewport-authority-console"
      panelId="s00-authority-panel"
      name="CGPT AUTHORITY COLLABORATION"
      model="FIXTURE"
      status="FIXTURE"
      statusTone="IDLE"
      title="VIEWPORT AUTHORITY"
      purpose="Align visual direction with AI — upstream references that feed page concept generation."
      ariaLabel="Viewport authority console"
      onClose={onClose}
      tabs={
        <>
          {AUTHORITY_CONSOLE_TABS.map((entry) => (
            <AiConsoleTab
              key={entry.id}
              label={entry.label}
              active={viewport === entry.id}
              onClick={() => {
                setViewport(entry.id);
                setPreviewVersionId(null);
                setEditDetails(false);
              }}
            />
          ))}
          <span className="s00-aic__tabsTrail">
            <select
              className="s00-aic__select"
              aria-label="Authority version"
              value={previewVersionId ?? source.activeVersionId}
              onChange={(event) =>
                setPreviewVersionId(event.target.value === source.activeVersionId ? null : event.target.value)
              }
            >
              {source.versions.map((version) => (
                <option key={version.versionId} value={version.versionId}>
                  {version.label}
                  {version.versionId === source.activeVersionId ? ' · ACTIVE' : ''}
                </option>
              ))}
            </select>
          </span>
        </>
      }
      footer={
        <>
          <AiConsoleButton
            label={`VIEW VERSIONS (${source.versions.length})`}
            glyph="⟲"
            onClick={() => setShowVersions((value) => !value)}
          />
          <AiConsoleButton
            label="SEND TO UPDATE AUTHORITY →"
            primary
            onClick={send}
            disabled={sendDisabled}
            disabledReason="Write a message or attach a reference first."
            interactionId="authority-send-update"
          />
        </>
      }
    >
      <AiConsoleSection
        label="REFERENCE PREVIEW"
        action={
          <AiConsoleSectionAction
            label="OPEN IN WORKSPACE ↗"
            onClick={() => image && onFullscreen(image, `${viewport} AUTHORITY`, shownVersion?.label)}
            disabled={!image}
            disabledReason="No authority image for this viewport yet."
          />
        }
      >
        <div className="s00-aic__split s00-aic__split--wide">
          <AiConsolePreview
            src={image}
            alt={`${viewport} authority reference`}
            emptyLabel="NO AUTHORITY IMAGE"
            emptyNote="Upload a reference or describe the direction — CGPT stages a new version from it."
            onOpen={() => image && onFullscreen(image, `${viewport} AUTHORITY`, shownVersion?.label)}
            contain
          />
          <div>
            <p className="s00-aic__secLabel">AUTHORITY DETAILS</p>
            <AiConsoleMeta rows={detailRows} />
            <div className="s00-aic__chips" style={{ marginTop: 8 }}>
              <button
                type="button"
                className={`s00-aic__chip${editDetails ? ' is-on' : ''}`}
                onClick={() => {
                  setEditDetails((value) => !value);
                  setNotesDraft(shownVersion?.notes ?? '');
                }}
              >
                ✎ EDIT DETAILS
              </button>
            </div>
            {editDetails ? (
              <div className="s00-aic__composer" style={{ marginTop: 8 }}>
                <textarea
                  className="s00-aic__composerInput"
                  rows={2}
                  value={notesDraft}
                  aria-label="Authority notes"
                  placeholder="Describe what this authority establishes…"
                  onChange={(event) => setNotesDraft(event.target.value)}
                />
                <div className="s00-aic__composerTools">
                  <button
                    type="button"
                    className="s00-aic__tool"
                    onClick={saveDetails}
                    disabled={!notesDraft.trim()}
                    title={!notesDraft.trim() ? 'Write the notes first.' : 'Saves as a new version — never overwrites.'}
                  >
                    SAVE AS NEW VERSION
                  </button>
                  <button
                    type="button"
                    className="s00-aic__tool s00-aic__tool--trail"
                    onClick={() => setEditDetails(false)}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            ) : (
              <p className="s00-aic__msgText" style={{ marginTop: 6 }}>
                {shownVersion?.notes}
              </p>
            )}
            <div className="s00-aic__chips" style={{ marginTop: 8 }}>
              {tags.map((tag) => (
                <span className="s00-aic__tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </AiConsoleSection>

      {showVersions ? (
        <AiConsoleSection
          label="AUTHORITY VERSIONS"
          action={<AiConsoleSectionAction label="HIDE" onClick={() => setShowVersions(false)} />}
        >
          <div className="s00-aic__thumbs">
            {source.versions.map((version) => (
              <span key={version.versionId}>
                <button
                  type="button"
                  className={`s00-aic__thumb${version.versionId === (previewVersionId ?? source.activeVersionId) ? ' is-on' : ''}`}
                  title={`${version.label} · ${version.status} · ${version.notes}`}
                  onClick={() => setPreviewVersionId(version.versionId)}
                >
                  {version.imageUrl ? <img src={version.imageUrl} alt="" /> : null}
                </button>
                <span className="s00-aic__thumbCap">
                  {version.label}
                  {version.versionId === source.activeVersionId ? ' ·A' : ''}
                </span>
              </span>
            ))}
          </div>
        </AiConsoleSection>
      ) : null}

      <AiConsoleSection label="COLLABORATION THREAD" ariaLabel="Founder and CGPT collaboration thread">
        {source.messages.length === 0 ? (
          <AiConsoleEmptyState
            title="NO MESSAGES YET"
            note="Describe the direction you want for this viewport. CGPT answers with a staged authority version you can accept or refine."
          />
        ) : (
          <div className="s00-aic__thread">
            {source.messages.map((message) => {
              const options = message.role === 'cgpt' ? optionsForMessage(message.at) : [];
              return (
                <article key={message.id} className={`s00-aic__msg s00-aic__msg--${message.role}`}>
                  <span className="s00-aic__avatar" aria-hidden="true">
                    {message.role === 'founder' ? 'F' : 'C'}
                  </span>
                  <div>
                    <div className="s00-aic__msgHead">
                      <span className="s00-aic__msgRole">{message.role === 'founder' ? 'YOU' : 'CGPT'}</span>
                      <span className="s00-aic__msgTime">{formatClockTime(message.at)}</span>
                    </div>
                    <p className="s00-aic__msgText">{message.text}</p>
                    {message.attachmentDataUrl ? (
                      <div className="s00-aic__msgThumbs">
                        <button
                          type="button"
                          className="s00-aic__thumb"
                          onClick={() => onFullscreen(message.attachmentDataUrl!, `${viewport} AUTHORITY REFERENCE`)}
                          aria-label="Inspect attached reference"
                        >
                          <img src={message.attachmentDataUrl} alt="" />
                        </button>
                      </div>
                    ) : null}
                    {options.length > 0 ? (
                      <div className="s00-aic__msgThumbs">
                        {options.map((option) => (
                          <button
                            key={option.versionId}
                            type="button"
                            className={`s00-aic__thumb${option.versionId === (previewVersionId ?? source.activeVersionId) ? ' is-on' : ''}`}
                            title={`${option.label} · ${option.notes}`}
                            onClick={() => setPreviewVersionId(option.versionId)}
                          >
                            {option.imageUrl ? <img src={option.imageUrl} alt="" /> : null}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </AiConsoleSection>

      <AiConsoleSection
        label={`ATTACHMENTS (${pending.length})`}
        action={
          <AiConsoleSectionAction label="+ ADD" onClick={() => fileRef.current?.click()} interactionId="authority-add-attachment" />
        }
      >
        <div className="s00-aic__split s00-aic__split--stackMobile">
          <div>
            {pending.length === 0 ? (
              <AiConsoleEmptyState
                title="NO ATTACHMENTS"
                note="Attached references travel with your next message and become part of the authority record."
              />
            ) : (
              <div className="s00-aic__thumbs">
                {pending.map((attachment, index) => (
                  <span key={`${attachment.name}-${index}`}>
                    <span className="s00-aic__thumb" style={{ display: 'inline-block' }}>
                      <img src={attachment.dataUrl} alt="" />
                      <button
                        type="button"
                        className="s00-aic__thumbRemove"
                        aria-label={`Remove ${attachment.name}`}
                        onClick={() => setPending((prev) => prev.filter((_, i) => i !== index))}
                      >
                        ✕
                      </button>
                    </span>
                    <button
                      type="button"
                      className="s00-aic__thumbCap s00-aic__inlineLink"
                      onClick={() => onFullscreen(attachment.dataUrl, attachment.name)}
                    >
                      INSPECT
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="s00-aic__secLabel">ADD REFERENCE FILES</p>
            <button
              type="button"
              className={`s00-aic__drop${dragging ? ' is-dragging' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                const file = event.dataTransfer.files?.[0];
                if (file) acceptFile(file);
              }}
            >
              <span className="s00-aic__dropGlyph" aria-hidden="true">
                ⬆
              </span>
              <span className="s00-aic__dropTitle">Drop images here or click to upload</span>
              <span className="s00-aic__dropFormats">
                {AUTHORITY_UPLOAD_FORMATS.join(', ')} (MAX 10MB)
              </span>
            </button>
            {uploadError ? <p className="s00-aic__notice s00-aic__notice--error">{uploadError}</p> : null}
          </div>
        </div>
        <input
          ref={fileRef}
          className="s00-aic__hiddenFile"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) acceptFile(file);
          }}
        />
      </AiConsoleSection>

      <AiConsoleSection label="MESSAGE">
        <div className="s00-aic__bar">
          <button
            type="button"
            className="s00-aic__barBtn"
            onClick={() => fileRef.current?.click()}
            aria-label="Attach a reference image"
            title="Attach a reference image"
          >
            ⬚
          </button>
          <input
            className="s00-aic__barInput"
            value={draft}
            placeholder="Type a message, request, or refinement…"
            aria-label="Message CGPT"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
          />
          <button
            type="button"
            className="s00-aic__barSend"
            onClick={send}
            disabled={sendDisabled}
            aria-label="Send message"
            title={sendDisabled ? 'Write a message or attach a reference first.' : 'Send'}
          >
            ▶
          </button>
        </div>
        <p className="s00-aic__notice">
          CGPT replies are fixtures in this build — sending stages a new authority version and never overwrites the
          current one.
        </p>
      </AiConsoleSection>
    </AiConsoleSurface>
  );
}
