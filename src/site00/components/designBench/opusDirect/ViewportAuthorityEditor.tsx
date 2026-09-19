/**
 * P0.VR.DESIGN-AUTHORITY-WORKFLOW2 — CGPT authority collaboration editor.
 * P0.VR.DESIGN.OPUS-WORKSPACE-SYSTEM1 — rebuilt as a creative collaboration
 * studio on the shared overlay grammar.
 *
 * This is where founder + CGPT establish the upstream creative direction, so
 * it is the one overlay that must not read as a form: the authority image is
 * the subject, the thread is the work, and the composer is the instrument.
 */

import { useCallback, useState } from 'react';

import {
  resolveActiveAuthorityImage,
  type ViewportAuthorityReference,
} from '../../../../../shared/site00-design-workspace-production/designPageAuthorityWorkflow.js';
import {
  OverlayActions,
  OverlayBody,
  OverlayComposer,
  OverlayDropzone,
  OverlayEmpty,
  OverlayPreview,
  OverlayRows,
  OverlaySection,
  OverlayStatus,
  OverlayTabs,
  OverlayThread,
} from '../production/designOverlayKit';
import type { usePageAuthorityWorkflow } from './usePageAuthorityWorkflow';

type WorkflowApi = ReturnType<typeof usePageAuthorityWorkflow>;

export function ViewportAuthorityEditor({
  viewport,
  reference,
  workflowApi,
  onClose,
  onFullscreen,
  onSwitchViewport,
}: {
  viewport: 'MOBILE' | 'DESKTOP';
  reference: ViewportAuthorityReference;
  workflowApi: WorkflowApi;
  onClose: () => void;
  onFullscreen: (src: string, title: string, subtitle?: string) => void;
  onSwitchViewport?: (viewport: 'MOBILE' | 'DESKTOP') => void;
}) {
  const [draft, setDraft] = useState('');
  const [tab, setTab] = useState<'COLLAB' | 'VERSIONS'>('COLLAB');
  const active = reference.versions.find((version) => version.versionId === reference.activeVersionId);
  const image = resolveActiveAuthorityImage(reference);

  const onFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file || !file.type.match(/^image\/(png|jpeg|webp)$/i)) return;
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
      text: 'Noted. A new authority version was staged for your review.',
    });
    workflowApi.regenerateAuthorityFixture(viewport, text);
    setDraft('');
  };

  return (
    <OverlayBody>
      {onSwitchViewport ?
        <OverlayTabs
          label="Authority viewport"
          active={viewport}
          onSelect={(id) => onSwitchViewport(id as 'MOBILE' | 'DESKTOP')}
          tabs={[
            { id: 'MOBILE', label: 'MOBILE AUTHORITY' },
            { id: 'DESKTOP', label: 'DESKTOP AUTHORITY' },
          ]}
        />
      : null}

      <OverlayPreview
        src={image}
        caption={`${viewport} AUTHORITY · ${active?.label ?? 'NO VERSION'}`}
        side={<OverlayStatus label={active?.status ?? 'DRAFT'} />}
        onOpen={image ? () => onFullscreen(image, `${viewport} AUTHORITY`, active?.label) : undefined}
        emptyLabel="NO AUTHORITY IMAGE YET"
        emptyHint="Upload a reference or describe the direction to stage the first version."
      />

      {active?.notes ?
        <OverlaySection title="DIRECTION" flat>
          <p className="tod-ok-note">{active.notes}</p>
        </OverlaySection>
      : null}

      <OverlayTabs
        label="Authority workspace"
        active={tab}
        onSelect={(id) => setTab(id as typeof tab)}
        tabs={[
          { id: 'COLLAB', label: `CGPT ${reference.messages.length}` },
          { id: 'VERSIONS', label: `VERSIONS ${reference.versions.length}` },
        ]}
      />

      {tab === 'COLLAB' ?
        <>
          <OverlaySection title="AI COLLABORATION" flat>
            <OverlayThread
              messages={reference.messages.map((message) => ({
                id: message.id,
                who: message.role === 'founder' ? 'FOUNDER' : 'CGPT',
                agent: message.role !== 'founder',
                text: message.text,
                media: message.attachmentDataUrl ? [message.attachmentDataUrl] : undefined,
              }))}
            />
          </OverlaySection>

          <OverlaySection title="REFERENCE FILES" flat>
            <OverlayDropzone
              label="DROP REFERENCE OR TAP TO UPLOAD"
              hint="PNG · JPG · WEBP"
              accept="image/png,image/jpeg,image/webp"
              onFiles={(files) => onFiles(files)}
            />
          </OverlaySection>

          <OverlayComposer
            value={draft}
            onChange={setDraft}
            onSend={send}
            placeholder="Describe or refine this viewport authority…"
            sendLabel="SEND"
          />
        </>
      : <OverlaySection title="VERSION HISTORY" flat>
          {reference.versions.length === 0 ?
            <OverlayEmpty label="NO VERSIONS YET" />
          : <OverlayRows
              rows={reference.versions.map((version) => ({
                id: version.versionId,
                name: version.label,
                sub: version.notes,
                side: (
                  <OverlayStatus
                    label={version.versionId === reference.activeVersionId ? 'ACTIVE' : version.status}
                  />
                ),
              }))}
            />
          }
        </OverlaySection>
      }

      <OverlayActions
        primary={{ label: 'UPDATE AUTHORITY', onClick: send, disabled: draft.trim().length === 0 }}
        secondary={[
          {
            label: 'VIEW FULLSCREEN',
            onClick: () => image && onFullscreen(image, `${viewport} AUTHORITY`, active?.label),
            disabled: !image,
          },
          { label: 'CLOSE', onClick: onClose },
        ]}
      />
    </OverlayBody>
  );
}
