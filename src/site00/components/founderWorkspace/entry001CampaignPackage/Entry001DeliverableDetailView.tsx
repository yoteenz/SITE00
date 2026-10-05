/**
 * B5.5 — Deliverable detail view (founder-facing CRUD).
 */

import { useRef, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Entry001DeliverableRecord } from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import {
  ENTRY001_ASSET_TYPE_LABELS,
  ENTRY001_CONTENT_ROLE_LABELS,
  ENTRY001_INGESTION_ROLE_OPTIONS,
  ENTRY001_INGESTION_TYPE_OPTIONS,
} from './entry001AssetTaxonomy.js';
import { entry001FormatPath, entry001PreviewPath } from './Entry001PackageNav.js';
import { LineageBadge } from './Entry001FormatPreviewWidgets.js';
import { site00ProjectCampaignBoardEntryPath } from '../../../config/routes.js';

type EditPatch = Partial<
  Pick<
    Entry001DeliverableRecord,
    'title' | 'assetType' | 'assetRole' | 'formatFamily' | 'platform' | 'sequenceIndex' | 'caption' | 'description'
  >
>;

type Props = {
  projectSlug: string;
  deliverable: Entry001DeliverableRecord;
  onEdit: (patch: EditPatch) => void;
  onReplace: (file: File) => void;
  onRemoveFromPackage: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDeletePermanently: () => void;
};

export function Entry001DeliverableDetailView({
  projectSlug,
  deliverable,
  onEdit,
  onReplace,
  onRemoveFromPackage,
  onArchive,
  onRestore,
  onDeletePermanently,
}: Props) {
  const replaceRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState(deliverable.title);
  const [assetType, setAssetType] = useState(deliverable.assetType);
  const [assetRole, setAssetRole] = useState(deliverable.assetRole);
  const [caption, setCaption] = useState(deliverable.caption ?? '');
  const [sequenceIndex, setSequenceIndex] = useState(String(deliverable.sequenceIndex ?? ''));

  const packagePath = site00ProjectCampaignBoardEntryPath(projectSlug, '001');

  const handleReplace = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onReplace(file);
    e.target.value = '';
  };

  return (
    <div className="site00-e001-deliverable">
      <nav className="site00-e001-package__breadcrumb">
        <Link to={packagePath}>ENTRY 001</Link>
        <span aria-hidden>›</span>
        <Link to={entry001FormatPath(projectSlug, deliverable.formatFamily.toLowerCase())}>
          {deliverable.formatFamily}
        </Link>
        <span aria-hidden>›</span>
        <span>{deliverable.title}</span>
      </nav>

      <header className="site00-e001-deliverable__head">
        <h1>{deliverable.title}</h1>
        <span className="site00-e001-deliverable__status">{deliverable.status.replace(/_/g, ' ')}</span>
        <LineageBadge deliverable={deliverable} />
      </header>

      <div className="site00-e001-deliverable__media">
        {deliverable.filePath ? (
          deliverable.format === 'VIDEO' ? (
            <video src={deliverable.filePath} controls />
          ) : (
            <img src={deliverable.filePath} alt={deliverable.title} />
          )
        ) : (
          <div className="site00-e001-preview__placeholder">NO MEDIA</div>
        )}
      </div>

      <form
        className="site00-e001-deliverable__form"
        onSubmit={(e) => {
          e.preventDefault();
          onEdit({
            title,
            assetType,
            assetRole,
            caption: caption || null,
            sequenceIndex: sequenceIndex ? Number(sequenceIndex) : null,
          });
        }}
      >
        <label>
          TITLE
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          ASSET TYPE
          <select value={assetType} onChange={(e) => setAssetType(e.target.value as typeof assetType)}>
            {ENTRY001_INGESTION_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {ENTRY001_ASSET_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label>
          ASSET ROLE
          <select
            value={assetRole ?? ''}
            onChange={(e) => setAssetRole((e.target.value || null) as typeof assetRole)}
          >
            <option value="">—</option>
            {ENTRY001_INGESTION_ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {ENTRY001_CONTENT_ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </label>
        <label>
          SEQUENCE
          <input value={sequenceIndex} onChange={(e) => setSequenceIndex(e.target.value)} inputMode="numeric" />
        </label>
        <label>
          CAPTION / COPY
          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} />
        </label>
        <button type="submit">SAVE METADATA</button>
      </form>

      {deliverable.history.length > 0 && (
        <section className="site00-e001-deliverable__history">
          <h2>VERSION HISTORY</h2>
          <ul>
            {deliverable.history.map((h) => (
              <li key={h.version}>
                <strong>{h.version}</strong> — {h.title} · {h.status}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="site00-e001-deliverable__actions">
        <input ref={replaceRef} type="file" accept="image/*,video/*" hidden onChange={handleReplace} />
        <button type="button" onClick={() => replaceRef.current?.click()}>
          REPLACE
        </button>
        {deliverable.removedFromPackage ? (
          <button type="button" onClick={onRestore}>
            RESTORE TO PACKAGE
          </button>
        ) : (
          <button type="button" onClick={onRemoveFromPackage}>
            REMOVE FROM PACKAGE
          </button>
        )}
        <button type="button" onClick={onArchive}>
          ARCHIVE
        </button>
        {!confirmDelete ? (
          <button type="button" className="is-destructive" onClick={() => setConfirmDelete(true)}>
            DELETE PERMANENTLY
          </button>
        ) : (
          <button type="button" className="is-destructive" onClick={onDeletePermanently}>
            CONFIRM DELETE
          </button>
        )}
        <Link to={entry001PreviewPath(projectSlug)}>VIEW PACKAGE PREVIEW</Link>
      </div>
    </div>
  );
}
