/**
 * B5.5 — Format workspace (per-format assets + live preview).
 */

import { Link } from 'react-router-dom';
import type {
  Entry001DeliverableRecord,
  Entry001FormatFamily,
  Entry001FormatWorkspaceSummary,
} from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import { buildFormatPreview } from './entry001FormatWorkspaces.js';
import { Entry001FormatPreviewWidget } from './Entry001FormatPreviewWidgets.js';
import { entry001DeliverablePath, entry001PreviewPath } from './Entry001PackageNav.js';
import { site00ProjectCampaignBoardEntryPath } from '../../../config/routes.js';
import { ENTRY001_ASSET_TYPE_LABELS } from './entry001AssetTaxonomy.js';

type Props = {
  projectSlug: string;
  formatFamily: Entry001FormatFamily;
  summary: Entry001FormatWorkspaceSummary;
  deliverables: Entry001DeliverableRecord[];
  onReorder?: (orderedIds: string[]) => void;
};

export function Entry001FormatWorkspaceView({
  projectSlug,
  formatFamily,
  summary,
  deliverables,
}: Props) {
  const preview = buildFormatPreview(formatFamily, deliverables);
  const active = deliverables.filter(
    (d) => d.formatFamily === formatFamily && !d.removedFromPackage && d.status !== 'DELETED',
  );

  const packagePath = site00ProjectCampaignBoardEntryPath(projectSlug, '001');

  return (
    <div className="site00-e001-format">
      <nav className="site00-e001-package__breadcrumb">
        <Link to={packagePath}>ENTRY 001</Link>
        <span aria-hidden>›</span>
        <Link to={`${packagePath}#content`}>PACKAGE CONTENT</Link>
        <span aria-hidden>›</span>
        <span>{summary.label}</span>
      </nav>

      <header className="site00-e001-format__head">
        <h1>{summary.label}</h1>
        <span className="site00-e001-format__platform">{summary.platform}</span>
        <span className={`site00-e001-format__status site00-e001-format__status--${summary.status.toLowerCase()}`}>
          {summary.status.replace(/_/g, ' ')}
        </span>
      </header>

      <div className="site00-e001-format__layout">
        <section className="site00-e001-format__assets">
          <h2>ASSETS</h2>
          {summary.missingSlots.length > 0 && (
            <div className="site00-e001-format__missing">
              <h3>MISSING PIECES</h3>
              <ul>
                {summary.missingSlots.map((slot) => (
                  <li key={slot}>{slot}</li>
                ))}
              </ul>
            </div>
          )}
          <ul className="site00-e001-format__asset-list">
            {active.length === 0 && (
              <li className="site00-e001-format__asset-empty">No assets yet — upload from Remaining Deliverables</li>
            )}
            {active
              .sort((a, b) => (a.sequenceIndex ?? 999) - (b.sequenceIndex ?? 999))
              .map((d) => (
                <li key={d.deliverableId}>
                  <Link to={entry001DeliverablePath(projectSlug, d.deliverableId)} className="site00-e001-format__asset-card">
                    {d.filePath ? (
                      d.format === 'VIDEO' ? (
                        <video src={d.filePath} muted />
                      ) : (
                        <img src={d.filePath} alt={d.title} />
                      )
                    ) : (
                      <span className="site00-e001-preview__placeholder">PENDING</span>
                    )}
                    <span>{d.title}</span>
                    <span className="site00-e001-format__asset-type">{ENTRY001_ASSET_TYPE_LABELS[d.assetType]}</span>
                    <span>{d.status.replace(/_/g, ' ')}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>

        <section className="site00-e001-format__preview">
          <h2>LIVE PREVIEW</h2>
          <Entry001FormatPreviewWidget preview={preview} />
          <Link to={entry001PreviewPath(projectSlug)} className="site00-e001-format__preview-link">
            VIEW FULL PACKAGE PREVIEW
          </Link>
        </section>
      </div>
    </div>
  );
}
