/**
 * P0.VR.DESIGN-AUTHORITY-WORKFLOW2 — CGPT authority collaboration editor (fixture responses).
 */

import { useCallback, useState } from 'react';

import {
  resolveActiveAuthorityImage,
  type ViewportAuthorityReference,
} from '../../../../../shared/site00-design-workspace-production/designPageAuthorityWorkflow.js';
import type { usePageAuthorityWorkflow } from './usePageAuthorityWorkflow';

type WorkflowApi = ReturnType<typeof usePageAuthorityWorkflow>;

export function ViewportAuthorityEditor({
  viewport,
  reference,
  workflowApi,
  onClose,
  onFullscreen,
}: {
  viewport: 'MOBILE' | 'DESKTOP';
  reference: ViewportAuthorityReference;
  workflowApi: WorkflowApi;
  onClose: () => void;
  onFullscreen: (src: string, title: string, subtitle?: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const active = reference.versions.find((v) => v.versionId === reference.activeVersionId);
  const image = resolveActiveAuthorityImage(reference);

  const onFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.[0]) return;
      const file = files[0];
      if (!file.type.match(/^image\/(png|jpeg|webp)$/i)) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result ?? '');
        workflowApi.appendChat(viewport, {
          role: 'founder',
          text: `Attached ${file.name}`,
          attachmentDataUrl: dataUrl,
        });
        workflowApi.regenerateAuthorityFixture(viewport, `Reference upload: ${file.name}`);
      };
      reader.readAsDataURL(file);
    },
    [viewport, workflowApi],
  );

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    workflowApi.appendChat(viewport, { role: 'founder', text });
    workflowApi.appendChat(viewport, {
      role: 'cgpt',
      text: 'Fixture: noted. A new authority version was staged for your review (no live model spend).',
    });
    workflowApi.regenerateAuthorityFixture(viewport, text);
    setDraft('');
  };

  return (
    <div className="tod-auth-editor">
      <header className="tod-auth-editor__head">
        <div>
          <p className="tod-auth-editor__eyebrow">CGPT · AUTHORITY COLLABORATION</p>
          <h2 className="tod-auth-editor__title">
            {viewport} AUTHORITY · {active?.label ?? '—'}
          </h2>
        </div>
        <button type="button" className="tod-auth-editor__close" onClick={onClose} aria-label="Close authority editor">
          CLOSE
        </button>
      </header>
      {image ?
        <button
          type="button"
          className="tod-auth-editor__hero"
          onClick={() => onFullscreen(image, `${viewport} AUTHORITY`, active?.label)}
        >
          <img src={image} alt="" className="tod-auth-editor__img" />
        </button>
      : <p className="tod-auth-editor__empty">NO AUTHORITY IMAGE YET</p>}
      <p className="tod-auth-editor__notes">{active?.notes}</p>
      <section className="tod-auth-editor__thread" aria-label="Collaboration history">
        {reference.messages.length === 0 ?
          <p className="tod-auth-editor__empty">No messages yet — describe the authority direction.</p>
        : reference.messages.map((m) => (
            <article key={m.id} className={`tod-auth-editor__msg tod-auth-editor__msg--${m.role}`}>
              <span className="tod-auth-editor__msgRole">{m.role === 'founder' ? 'FOUNDER' : 'CGPT'}</span>
              <p>{m.text}</p>
              {m.attachmentDataUrl ?
                <img src={m.attachmentDataUrl} alt="" className="tod-auth-editor__attach" />
              : null}
            </article>
          ))
        }
      </section>
      <section className="tod-auth-editor__compose">
        <label className="tod-auth-editor__upload">
          UPLOAD PNG/JPG/WEBP
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => onFiles(e.target.files)} />
        </label>
        <textarea
          className="tod-auth-editor__input"
          value={draft}
          placeholder="Describe or refine this viewport authority…"
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="button" className="tod-auth-editor__send" onClick={send}>
          SEND · UPDATE AUTHORITY (FIXTURE)
        </button>
      </section>
      <section className="tod-auth-editor__versions">
        <h3>VERSIONS</h3>
        <ul>
          {reference.versions.map((v) => (
            <li key={v.versionId}>
              {v.label} · {v.status} · {v.versionId === reference.activeVersionId ? 'ACTIVE' : 'archive'}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
