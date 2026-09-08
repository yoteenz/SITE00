/**
 * B5.5 — Package Content section (format rows).
 */

import { Link } from 'react-router-dom';
import type { Entry001FormatWorkspaceSummary } from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import { entry001FormatPath } from './Entry001PackageNav.js';

type Props = {
  projectSlug: string;
  summaries: Entry001FormatWorkspaceSummary[];
};

function formatRowMeta(summary: Entry001FormatWorkspaceSummary): string {
  if (summary.formatFamily === 'CAROUSEL') {
    return `${summary.assetCount} slide${summary.assetCount === 1 ? '' : 's'}`;
  }
  if (summary.formatFamily === 'STORY') {
    return `${summary.assetCount} frame${summary.assetCount === 1 ? '' : 's'}`;
  }
  if (summary.formatFamily === 'REEL') {
    return `${summary.assetCount} asset / production objects`;
  }
  return String(summary.assetCount);
}

export function Entry001PackageContentSection({ projectSlug, summaries }: Props) {
  return (
    <section className="site00-e001-package__section" id="content">
      <header className="site00-e001-package__section-head">
        <h2>PACKAGE CONTENT</h2>
        <span className="site00-e001-package__section-meta">DELIVERABLES ›</span>
      </header>
      <p className="site00-e001-package__content-note">
        Package outputs for the social package — separate from approved archive source material.
      </p>
      <ul className="site00-e001-package__content-list">
        {summaries.map((summary) => (
          <li key={summary.formatFamily}>
            <Link
              to={entry001FormatPath(projectSlug, summary.formatFamily.toLowerCase())}
              className="site00-e001-package__content-row"
            >
              <span className="site00-e001-package__content-label">{summary.label}</span>
              <span className="site00-e001-package__content-count">{formatRowMeta(summary)}</span>
              <span className={`site00-e001-package__content-status site00-e001-package__content-status--${summary.status.toLowerCase()}`}>
                {summary.status.replace(/_/g, ' ')}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
