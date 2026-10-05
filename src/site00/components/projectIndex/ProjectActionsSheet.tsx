/**
 * Project action menu — structured requests that are SENT INTO PRODUCTION.
 * Projects never opens an internal Production workspace for the user.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PROJECT_REQUEST_ACTIONS,
  productionRequestTitle,
} from '../../../../shared/site00-production-workspace/requestCatalog.js';
import type { ProductionWorkspaceRequestKind } from '../../../../shared/site00-production-workspace/types.js';
import { submitProductionRequest } from '../../state/productionRequestStore';
import { IconChevron, IconGlyph, PwSheet } from '../production/PwPrimitives';

const ICON: Record<string, string> = {
  DESIGN_REVISION: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM8.5 12l2.5 2.5 4.5-5',
  EXPRESSION_NEW_CAMPAIGN: 'M4 6h16v12H4zM8 14l3-3 3 3 2-2 3 3M9 9.5h.01',
  EXPRESSION_NEW_CHARACTER: 'M12 4a4 4 0 100 8 4 4 0 000-8zM5 20c1-4 4-6 7-6s6 2 7 6',
  EXPRESSION_WARDROBE_UPDATE: 'M9 4l3 2 3-2 5 3-2 4-2-1v10H8V10l-2 1-2-4z',
  EXPRESSION_SET_CHANGE: 'M4 4h16v16H4zM8 12h8M12 8v8',
  UPLOAD_REFERENCES: 'M4 11l8-7 8 7v9H4zM12 16v-4M9.5 14.5L12 12l2.5 2.5',
};

export function ProjectActionsSheet({
  open,
  projectSlug,
  projectName,
  onClose,
}: {
  open: boolean;
  projectSlug: string;
  projectName: string;
  onClose: () => void;
}) {
  const [sent, setSent] = useState<ProductionWorkspaceRequestKind | null>(null);

  const send = (kind: ProductionWorkspaceRequestKind) => {
    submitProductionRequest({ projectSlug, kind });
    setSent(kind);
  };

  return (
    <PwSheet
      open={open}
      title="Project actions"
      onClose={() => {
        setSent(null);
        onClose();
      }}
      testId="project-actions-sheet"
    >
      <p className="pw-label" style={{ marginBottom: 6 }}>
        {projectName} · sends a request into production
      </p>
      {PROJECT_REQUEST_ACTIONS.map((a) => (
        <button key={a.kind} type="button" className="pw-action" onClick={() => send(a.kind)} data-testid={`project-action-${a.kind}`}>
          <span className="pw-action__icon">
            <IconGlyph d={ICON[a.kind] ?? ICON.UPLOAD_REFERENCES!} />
          </span>
          <span className="pw-action__text">
            <span className="pw-action__title">{a.label}</span>
            <span className="pw-action__scope">{a.scope}</span>
          </span>
          <IconChevron />
        </button>
      ))}
      <Link
        to={`/projects/${projectSlug}/overview?tab=requests`}
        className="pw-action"
        onClick={onClose}
        data-testid="project-action-history"
      >
        <span className="pw-action__icon">
          <IconGlyph d="M12 4a8 8 0 100 16 8 8 0 000-16zM12 8v4l3 2" />
        </span>
        <span className="pw-action__text">
          <span className="pw-action__title">View All Requests</span>
          <span className="pw-action__scope">History</span>
        </span>
        <IconChevron />
      </Link>
      {sent ?
        <p className="pw-toast" role="status" data-testid="project-action-sent">
          Sent to production — {productionRequestTitle(sent)}
        </p>
      : null}
    </PwSheet>
  );
}
