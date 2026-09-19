/**
 * B5.5 — Post-upload success panel.
 */

import { Link } from 'react-router-dom';
import type { PostUploadSuccess } from './useEntry001PackageState.js';
import {
  entry001DeliverablePath,
  entry001FormatPath,
  entry001PreviewPath,
} from './Entry001PackageNav.js';

type Props = {
  projectSlug: string;
  success: PostUploadSuccess;
  onDismiss: () => void;
};

export function Entry001PostUploadSuccess({ projectSlug, success, onDismiss }: Props) {
  return (
    <div className="site00-e001-package__upload-success" role="status">
      <p className="site00-e001-package__upload-success-title">ASSET ADDED</p>
      <p className="site00-e001-package__upload-success-name">{success.title}</p>
      <div className="site00-e001-package__upload-success-actions">
        <Link to={entry001DeliverablePath(projectSlug, success.deliverableId)}>VIEW ASSET</Link>
        <Link to={entry001FormatPath(projectSlug, success.formatFamily.toLowerCase())}>VIEW FORMAT</Link>
        <Link to={entry001PreviewPath(projectSlug)}>VIEW PACKAGE PREVIEW</Link>
      </div>
      <button type="button" className="site00-e001-package__upload-success-dismiss" onClick={onDismiss}>
        DISMISS
      </button>
    </div>
  );
}
